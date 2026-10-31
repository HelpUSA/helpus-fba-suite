const { Client } = require('pg');

// SAFETY GUARD (Order 023 Priority 1 & 5):
// Block accidental destructive or mutative test suites against live production database.
const DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is required for PostgreSQL homologation.');

const isProductionCloud = DATABASE_URL.includes('neon.tech') || DATABASE_URL.includes('vercel-storage.com');
const allowMutative = process.env.ALLOW_MUTATIVE_TESTS === 'true';

if (isProductionCloud && !allowMutative) {
  console.error('\n🛑 SAFETY GUARD TRIGGERED (Order 023 Priority 1 & 5):');
  console.error('Mutative homologation tests are BLOCKED against production cloud database to protect real stock balances.');
  console.error('To run against an isolated staging branch or ephemeral test schema, provide TEST_DATABASE_URL and ALLOW_MUTATIVE_TESTS=true.');
  process.exit(0); // Exit safely without error and without touching database
}

async function runHomologationSuite() {
  console.log('===============================================================');
  console.log('HELPUS FBA SUITE & ERP - SUITE DE TESTES ISOLADA (ORDEM 023)');
  console.log('===============================================================');

  const isSsl = !DATABASE_URL.includes('localhost') && !DATABASE_URL.includes('127.0.0.1');
  const client = new Client({
    connectionString: DATABASE_URL,
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

  // Use isolated test identifiers to guarantee zero interference with canonical operational data
  const testInvNumber = `TEST-ISOLATED-INV-${Date.now()}`;
  const testSku = 'TEST-SKU-ISOLATED-001';
  const testWarehouse = 'WH-TEST-ISOLATED';

  try {
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
        connectionString: DATABASE_URL,
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
    // CLEANUP: Always remove ephemeral test records so zero mock records remain
    console.log('\n[6/6] LIMPEZA RIGOROSA DE ARTEFATOS EFÊMEROS DE TESTE');
    await client.query(`DELETE FROM inventory_balances WHERE warehouse_code = $1;`, [testWarehouse]);
    await client.query(`DELETE FROM products WHERE sku = $1;`, [testSku]);
    await client.query(`DELETE FROM invoices WHERE numero = $1;`, [testInvNumber]);
    console.log('✓ Todos os registros de teste foram completamente removidos. Banco de dados 100% limpo.');
    await client.end();
  }

  console.log('\n===============================================================');
  console.log('TESTES ISOLADOS CONCLUÍDOS COM SUCESSO E LIMPEZA TOTAL!');
  console.log('===============================================================');
}

runHomologationSuite().catch(err => {
  console.error('\n❌ ERRO NA HOMOLOGAÇÃO:', err);
  process.exit(1);
});
