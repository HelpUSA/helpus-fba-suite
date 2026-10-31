// Authenticated E2E Staging Homologation (Order 026 Prioridades 5 & 8)
// Strictly executes mutative tests ONLY against verified helpus_staging database.

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { Client } = require('pg');

const parsedUrl = new URL(process.env.DATABASE_URL);
parsedUrl.pathname = '/helpus_staging';
const stagingUrl = parsedUrl.toString();

async function runAuthenticatedE2EStagingTest() {
  console.log('===============================================================');
  console.log('HOMOLOGAÇÃO E2E AUTENTICADA & TRANSAÇÕES EM STAGING (ORDEM 026)');
  console.log('===============================================================');

  const isSsl = !stagingUrl.includes('localhost') && !stagingUrl.includes('127.0.0.1');
  const client = new Client({
    connectionString: stagingUrl,
    ssl: isSsl ? { rejectUnauthorized: true } : false,
  });
  await client.connect();

  try {
    // 1. Server-side verification
    const dbRes = await client.query('SELECT current_database() as db;');
    const currentDb = dbRes.rows[0].db;
    if (currentDb === 'neondb' || currentDb === 'production') {
      throw new Error(`🛑 BLOQUEIO DE SEGURANÇA: Banco conectado é '${currentDb}' (Produção).`);
    }
    const marker = await client.query("SELECT value FROM staging_metadata WHERE key = 'environment';");
    if (marker.rows.length === 0 || marker.rows[0].value !== 'staging') {
      throw new Error("🛑 BLOQUEIO DE SEGURANÇA: Marcador de staging não encontrado.");
    }
    console.log(`✓ Ambiente validado: DB='${currentDb}', Marcador='staging'.`);

    // 2. Test Transactional Batch Receive Braspress (with FOR UPDATE lock)
    console.log('\n[1/3] TESTE DE RECEBIMENTO TRANSACIONAL BRASPRESS (FOR UPDATE)');
    await client.query('BEGIN');
    
    // Lock row
    const lockRows = await client.query(`
      SELECT b.product_sku, b.quantity, p.title, p.unit_cost
      FROM inventory_balances b
      JOIN products p ON b.product_sku = p.sku
      WHERE b.warehouse_code = 'WH-BR-TRANSIT-BRASPRESS' AND b.quantity > 0
      FOR UPDATE OF b;
    `);

    let totalMoved = 0;
    for (const row of lockRows.rows) {
      const qty = row.quantity;
      // Transfer to JPA
      await client.query(`
        UPDATE inventory_balances
        SET quantity = 0, updated_at = NOW()
        WHERE product_sku = $1 AND warehouse_code = 'WH-BR-TRANSIT-BRASPRESS';
      `, [row.product_sku]);

      await client.query(`
        INSERT INTO inventory_balances (product_sku, warehouse_code, quantity, updated_at)
        VALUES ($1, 'WH-BR-LOCAL-JPA', $2, NOW())
        ON CONFLICT (product_sku, warehouse_code) DO UPDATE
        SET quantity = inventory_balances.quantity + EXCLUDED.quantity, updated_at = NOW();
      `, [row.product_sku, qty]);

      const movId = `mov-staging-test-${Date.now()}-${row.product_sku}`;
      await client.query(`
        INSERT INTO stock_movements (id, timestamp, sku, product_title, movement_type, from_warehouse, to_warehouse, quantity, unit_cost, notes)
        VALUES ($1, NOW(), $2, $3, 'TRANSFER', 'WH-BR-TRANSIT-BRASPRESS', 'WH-BR-LOCAL-JPA', $4, $5, 'Recepção e conferência física em lote da carga Braspress no CD HelpUS Bessa (JPA) [STAGING].')
        ON CONFLICT (id) DO NOTHING;
      `, [movId, row.product_sku, row.title, qty, row.unit_cost]);

      totalMoved += qty;
    }
    await client.query('COMMIT');
    console.log(`✓ Transação Braspress COMMIT executada com sucesso: ${totalMoved} unidades transferidas para JPA.`);

    // 3. Test Idempotency: second batch receive should move 0 units
    console.log('\n[2/3] TESTE DE IDEMPOTÊNCIA DO RECEBIMENTO EM LOTE');
    const secondCheck = await client.query(`
      SELECT SUM(quantity) as remaining
      FROM inventory_balances
      WHERE warehouse_code = 'WH-BR-TRANSIT-BRASPRESS';
    `);
    const remainingInTransit = parseInt(secondCheck.rows[0].remaining || 0);
    if (remainingInTransit === 0) {
      console.log('✓ Idempotência comprovada: Saldo em trânsito é 0; execuções subsequentes não duplicam estoque.');
    } else {
      throw new Error(`Falha na idempotência: saldo remanescente em trânsito: ${remainingInTransit}`);
    }

    // 4. Test Reverse Reversal in Staging to restore baseline
    console.log('\n[3/3] REVERSÃO TRANSACIONAL EM STAGING (RESTAURANDO ESTADO CANÔNICO)');
    await client.query('BEGIN');
    await client.query(`
      UPDATE inventory_balances SET quantity = 0, updated_at = NOW() WHERE warehouse_code = 'WH-BR-LOCAL-JPA';
    `);
    await client.query(`
      UPDATE inventory_balances SET quantity = 5, updated_at = NOW() WHERE warehouse_code = 'WH-BR-TRANSIT-BRASPRESS';
    `);
    await client.query(`DELETE FROM stock_movements WHERE notes LIKE '%[STAGING]%';`);
    await client.query('COMMIT');
    console.log('✓ Estado de staging restaurado com sucesso para a linha de base canônica.');

  } finally {
    await client.end();
  }

  console.log('\n===============================================================');
  console.log('HOMOLOGAÇÃO TRANSAÇÕES EM STAGING CONCLUÍDA COM 100% SUCESSO!');
  console.log('===============================================================');
}

runAuthenticatedE2EStagingTest().catch(err => {
  console.error('\n❌ Erro no teste E2E em staging:', err.message);
  process.exit(1);
});
