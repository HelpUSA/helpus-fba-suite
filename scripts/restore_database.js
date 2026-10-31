// Restore Database Script (Order 025 Point 3)
// Safe restoration to an isolated staging database.
// Strictly forbidden from restoring to production database.

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const TARGET_DB_URL = process.env.TEST_DATABASE_URL || process.env.STAGING_DATABASE_URL;
const PROD_DB_URL = process.env.DATABASE_URL;

if (!TARGET_DB_URL) {
  console.error('🛑 ERRO: TEST_DATABASE_URL ou STAGING_DATABASE_URL é obrigatória para restauração.');
  process.exit(1);
}

// Safety check: ensure target is not production
function getBaseEndpoint(u) {
  try {
    const parsed = new URL(u);
    return `${parsed.hostname.toLowerCase().replace('-pooler', '')}/${parsed.pathname.replace(/^\//, '').toLowerCase()}`;
  } catch (e) {
    return u;
  }
}

if (PROD_DB_URL && getBaseEndpoint(TARGET_DB_URL) === getBaseEndpoint(PROD_DB_URL)) {
  console.error('🛑 BLOQUEIO DE SEGURANÇA: Tentativa de restauração direcionada ao banco de PRODUÇÃO!');
  console.error('Restaurações de dump só são permitidas em bancos de staging/testes isolados.');
  process.exit(1);
}

async function restoreDatabase(snapshotFile) {
  if (!fs.existsSync(snapshotFile)) {
    throw new Error(`Arquivo de snapshot não encontrado: ${snapshotFile}`);
  }

  const raw = fs.readFileSync(snapshotFile, 'utf-8');
  const snapshot = JSON.parse(raw);

  console.log(`=== RESTAURANDO SNAPSHOT (${snapshot.timestamp}) EM STAGING ISOLADO ===`);

  const isSsl = !TARGET_DB_URL.includes('localhost') && !TARGET_DB_URL.includes('127.0.0.1');
  const client = new Client({
    connectionString: TARGET_DB_URL,
    ssl: isSsl ? { rejectUnauthorized: true } : false,
  });
  await client.connect();

  try {
    await client.query('BEGIN');

    // Restore tables in dependency order
    const tableOrder = ['warehouses', 'products', 'inventory_balances', 'invoices', 'invoice_items', 'stock_movements', 'sale_orders', 'returns'];

    for (const table of tableOrder) {
      const rows = snapshot.tables[table] || [];
      if (rows.length === 0) continue;

      console.log(`Restaurando ${rows.length} registros na tabela '${table}'...`);
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const colNames = columns.join(', ');

        const conflictTarget = table === 'warehouses' ? '(code)' 
          : table === 'products' ? '(sku)'
          : table === 'inventory_balances' ? '(product_sku, warehouse_code)'
          : table === 'invoices' ? '(id)'
          : '(id)';

        await client.query(`
          INSERT INTO ${table} (${colNames})
          VALUES (${placeholders})
          ON CONFLICT ${conflictTarget} DO NOTHING;
        `, values);
      }
    }

    await client.query('COMMIT');
    console.log('✓ Restauração em staging concluída com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

const snapshotFile = process.argv[2] || path.join(__dirname, '..', 'backups', 'latest_snapshot.json');
restoreDatabase(snapshotFile).catch(err => {
  console.error('Restore failed:', err.message);
  process.exit(1);
});
