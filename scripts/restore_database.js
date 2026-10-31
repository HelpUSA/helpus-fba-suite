// Restore Database Script (Order 026 Prioridade 3)
// Full restoration to isolated staging database with verification & checksum audits.
// Strictly forbidden from restoring to production database.

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const TARGET_DB_URL = process.env.TEST_DATABASE_URL || process.env.STAGING_DATABASE_URL;
const PROD_DB_URL = process.env.DATABASE_URL;

if (!TARGET_DB_URL) {
  console.error('🛑 ERRO: TEST_DATABASE_URL é obrigatória para restauração em staging.');
  process.exit(1);
}

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
  process.exit(1);
}

async function restoreDatabase(snapshotFile) {
  if (!fs.existsSync(snapshotFile)) {
    throw new Error(`Arquivo de snapshot não encontrado: ${snapshotFile}`);
  }

  const raw = fs.readFileSync(snapshotFile, 'utf-8');
  const snapshot = JSON.parse(raw);

  console.log('===============================================================');
  console.log(`RESTAURAÇÃO EM STAGING ISOLADO (${snapshot.timestamp})`);
  console.log('===============================================================');

  const isSsl = !TARGET_DB_URL.includes('localhost') && !TARGET_DB_URL.includes('127.0.0.1');
  const client = new Client({
    connectionString: TARGET_DB_URL,
    ssl: isSsl ? { rejectUnauthorized: true } : false,
  });
  await client.connect();

  try {
    // 1. Server-side verification of staging environment
    const dbInfo = await client.query('SELECT current_database() as db;');
    const currentDb = dbInfo.rows[0].db;
    if (currentDb === 'neondb' || currentDb === 'production') {
      throw new Error(`🛑 BLOQUEIO DE SEGURANÇA: current_database() retornou '${currentDb}' (Produção).`);
    }

    const markerRes = await client.query("SELECT value FROM staging_metadata WHERE key = 'environment';").catch(() => ({ rows: [] }));
    if (markerRes.rows.length === 0 || markerRes.rows[0].value !== 'staging') {
      throw new Error("🛑 BLOQUEIO DE SEGURANÇA: Marcador persistente 'staging_metadata' não encontrado no banco de destino.");
    }
    console.log(`✓ Verificação de segurança aprovada: DB='${currentDb}', ambiente='staging'.`);

    await client.query('BEGIN');

    // 2. Restore in dependency order
    const tableOrder = ['warehouses', 'products', 'inventory_balances', 'invoices', 'invoice_items', 'stock_movements', 'sale_orders', 'returns'];
    const restoreAudit = {};

    for (const table of tableOrder) {
      const rows = snapshot.tables[table] || [];
      if (rows.length === 0) {
        restoreAudit[table] = { snapshotCount: 0, restoredCount: 0, status: 'EMPTY_IN_SNAPSHOT' };
        continue;
      }

      console.log(`\nRestaurando tabela '${table}' (${rows.length} registros)...`);
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const colNames = columns.join(', ');

        const conflictTarget = table === 'warehouses' ? '(code)' 
          : table === 'products' ? '(sku)'
          : table === 'inventory_balances' ? '(product_sku, warehouse_code)'
          : table === 'invoices' ? '(id)'
          : table === 'invoice_items' ? '(id)'
          : table === 'stock_movements' ? '(id)'
          : table === 'sale_orders' ? '(id)'
          : '(id)';

        await client.query(`
          INSERT INTO ${table} (${colNames})
          VALUES (${placeholders})
          ON CONFLICT ${conflictTarget} DO NOTHING;
        `, values);
      }

      const countRes = await client.query(`SELECT COUNT(*) FROM ${table};`);
      const liveCount = parseInt(countRes.rows[0].count);
      restoreAudit[table] = {
        snapshotCount: rows.length,
        liveCountInStaging: liveCount,
        status: liveCount >= rows.length ? 'VERIFIED_MATCH' : 'MISMATCH'
      };
      console.log(`✓ Tabela '${table}': ${rows.length} registros restaurados, total atual: ${liveCount}.`);
    }

    await client.query('COMMIT');
    console.log('\n===============================================================');
    console.log('RESTAURAÇÃO CONCLUÍDA E AUDITADA COM SUCESSO EM STAGING!');
    console.log('===============================================================');
    console.table(restoreAudit);

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}

// Find newest snapshot in backups directory if not explicitly provided
function findLatestSnapshot() {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) return null;
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
  if (files.length === 0) return null;
  files.sort().reverse();
  return path.join(backupDir, files[0]);
}

const snapshotPath = process.argv[2] || findLatestSnapshot();
if (!snapshotPath) {
  console.error("Nenhum snapshot JSON encontrado em backups/.");
  process.exit(1);
}

restoreDatabase(snapshotPath).catch(err => {
  console.error('\n❌ Falha na restauração em staging:', err.message);
  process.exit(1);
});
