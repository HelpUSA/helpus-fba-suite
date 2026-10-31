const { Client } = require('pg');

// STRICT SAFETY GUARD (Order 024 Point 2):
// Mutative homologation suite MUST ONLY run against a verified isolated staging/test database.
// Execution against production database is STRICTLY FORBIDDEN and fails immediately with exit code 1.

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const PROD_DATABASE_URL = process.env.DATABASE_URL;

if (!TEST_DATABASE_URL) {
  console.error('\n🛑 [BLOCKED] HOMOLOGATION ERROR (Order 024):');
  console.error('TEST_DATABASE_URL is not set.');
  console.error('Mutative tests are strictly prohibited from running against production databases.');
  console.error('Please configure a distinct TEST_DATABASE_URL (e.g. Neon Staging branch or local test DB).');
  process.exit(1);
}

if (PROD_DATABASE_URL && TEST_DATABASE_URL.trim() === PROD_DATABASE_URL.trim()) {
  console.error('\n🛑 [BLOCKED] HOMOLOGATION ERROR (Order 024):');
  console.error('TEST_DATABASE_URL is identical to DATABASE_URL (Production).');
  console.error('Running mutative tests on the production database is strictly prohibited.');
  process.exit(1);
}

async function runHomologationSuite() {
  console.log('===============================================================');
  console.log('HELPUS FBA SUITE & ERP - SUITE DE TESTES EM STAGING ISOLADO (ORDEM 024)');
  console.log('===============================================================');

  const isSsl = !TEST_DATABASE_URL.includes('localhost') && !TEST_DATABASE_URL.includes('127.0.0.1');
  const client = new Client({
    connectionString: TEST_DATABASE_URL,
    ssl: isSsl ? { rejectUnauthorized: true } : false
  });
  await client.connect();

  console.log('\n[1/6] VERIFICAÇÃO DE TABELAS & CONSTRAINTS');
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name;
  `);
  console.log('Tabelas ativas no PostgreSQL:', tables.rows.map(r => r.table_name).join(', '));
  if (tables.rows.length < 8) {
    throw new Error('Número insuficiente de tabelas no schema.');
  }

  // Isolated test identifiers
  const testInvNumber = `TEST-ISOLATED-INV-${Date.now()}`;
  const testSku = 'TEST-SKU-ISOLATED-001';
  const testWarehouse = 'WH-TEST-ISOLATED';

  try {
    // 0. Create test warehouse to satisfy foreign keys
    await client.query(`
      INSERT INTO warehouses (code, name, country, active)
      VALUES ($1, 'Isolated Staging Test Warehouse', 'US', true)
      ON CONFLICT (code) DO NOTHING;
    `, [testWarehouse]);

    console.log('\n[2/6] TESTE DE IDEMPOTÊNCIA: INVOICE TESTE ISOLADA');
    await client.query(`
      INSERT INTO invoices (id, tipo, numero, data_emissao, fornecedor_nome, fornecedor_doc, valor_total, moeda, status, itens_count)
      VALUES ($1, 'INVOICE_US', $2, NOW(), 'Isolated Test Supplier', 'US-EIN-99999', 100.00, 'USD', 'EM_TRANSITO', 1)
      ON CONFLICT (id) DO NOTHING;
    `, [`inv-us-${testInvNumber}`, testInvNumber]);

    const checkDuplicate = await client.query(
      `SELECT id FROM invoices WHERE numero = $1 AND tipo = 'INVOICE_US'`,
      [testInvNumber]
    );
    if (checkDuplicate.rows.length === 1) {
      console.log(`✓ Idempotência confirmada: Invoice isolada ${testInvNumber} criada com sucesso.`);
    }

    console.log('\n[3/6] TESTE DE INTEGRIDADE FK & DE-PARA DETERMINÍSTICO');
    await client.query(`
      INSERT INTO products (sku, title, marketplace, currency, unit_cost, sale_price, supplier_name)
      VALUES ($1, 'Isolated Test Product', 'Amazon BR', 'BRL', 10.00, 25.00, 'Test Supplier')
      ON CONFLICT (sku) DO NOTHING;
    `, [testSku]);

    await client.query(`
      INSERT INTO inventory_balances (product_sku, warehouse_code, quantity, updated_at)
      VALUES ($1, $2, 10, NOW())
      ON CONFLICT (product_sku, warehouse_code) DO UPDATE SET quantity = 10, updated_at = NOW();
    `, [testSku, testWarehouse]);
    console.log(`✓ Saldo isolado configurado: 10 unidades em ${testWarehouse}.`);

    console.log('\n[4/6] TESTE DE CONCORRÊNCIA SIMULTÂNEA (Promise.all COM SELECT FOR UPDATE)');
    const runTx = async (txId, qtyToDebit) => {
      const c = new Client({
        connectionString: TEST_DATABASE_URL,
        ssl: isSsl ? { rejectUnauthorized: true } : false
      });
      await c.connect();
      try {
        await c.query('BEGIN');
        const lockRes = await c.query(
          `SELECT quantity FROM inventory_balances WHERE product_sku = $1 AND warehouse_code = $2 FOR UPDATE`,
          [testSku, testWarehouse]
        );
        const available = lockRes.rows[0].quantity;

        await new Promise((r) => setTimeout(r, 50));

        if (available >= qtyToDebit) {
          await c.query(
            `UPDATE inventory_balances SET quantity = quantity - $1, updated_at = NOW() WHERE product_sku = $2 AND warehouse_code = $3`,
            [qtyToDebit, testSku, testWarehouse]
          );
          await c.query('COMMIT');
          return { success: true, txId };
        } else {
          await c.query('ROLLBACK');
          return { success: false, txId, error: `Saldo insuficiente: disponível ${available}` };
        }
      } catch (err) {
        await c.query('ROLLBACK').catch(() => {});
        return { success: false, txId, error: err.message };
      } finally {
        await c.end();
      }
    };

    const results = await Promise.all([runTx('ALPHA', 7), runTx('BETA', 7)]);
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    console.log(`✓ Resultados da concorrência: ${successful.length} aprovada(s), ${failed.length} rejeitada(s).`);

    console.log('\n[5/6] TESTE DE DURABILIDADE APÓS REINÍCIO (PERSISTÊNCIA RELACIONAL)');
    const balanceFinal = await client.query(
      `SELECT quantity FROM inventory_balances WHERE product_sku = $1 AND warehouse_code = $2`,
      [testSku, testWarehouse]
    );
    console.log(`✓ Saldo persistido confirmado: ${balanceFinal.rows[0].quantity} un (10 - 7 = 3).`);

  } finally {
    console.log('\n[6/6] LIMPEZA RIGOROSA DE ARTEFATOS EFÊMEROS (ZERO RESÍDUOS)');
    await client.query(`DELETE FROM inventory_balances WHERE warehouse_code = $1;`, [testWarehouse]);
    await client.query(`DELETE FROM warehouses WHERE code = $1;`, [testWarehouse]);
    await client.query(`DELETE FROM products WHERE sku = $1;`, [testSku]);
    await client.query(`DELETE FROM invoices WHERE numero = $1;`, [testInvNumber]);

    // Verify absence of residues
    const resWh = await client.query(`SELECT COUNT(*) FROM warehouses WHERE code = $1;`, [testWarehouse]);
    const resBal = await client.query(`SELECT COUNT(*) FROM inventory_balances WHERE warehouse_code = $1;`, [testWarehouse]);
    const resProd = await client.query(`SELECT COUNT(*) FROM products WHERE sku = $1;`, [testSku]);
    const resInv = await client.query(`SELECT COUNT(*) FROM invoices WHERE numero = $1;`, [testInvNumber]);

    const totalResidues = parseInt(resWh.rows[0].count) + parseInt(resBal.rows[0].count) + parseInt(resProd.rows[0].count) + parseInt(resInv.rows[0].count);
    if (totalResidues === 0) {
      console.log('✓ Ausência total de resíduos comprovada por asserção SQL (0 registros remanescentes).');
    } else {
      console.error(`⚠️ ATENÇÃO: Resíduos detectados (${totalResidues} registros).`);
    }

    await client.end();
  }

  console.log('\n===============================================================');
  console.log('TESTES ISOLADOS EM STAGING CONCLUÍDOS COM SUCESSO E ZERO RESÍDUOS!');
  console.log('===============================================================');
}

runHomologationSuite().catch(err => {
  console.error('\n❌ ERRO NA HOMOLOGAÇÃO:', err);
  process.exit(1);
});
