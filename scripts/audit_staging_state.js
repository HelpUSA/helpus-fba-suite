const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const crypto = require('crypto');
const { decryptSnapshot, computeTableChecksum } = require('./restore_database');

// Native loader for .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const k = trimmed.substring(0, eqIdx).trim();
      let v = trimmed.substring(eqIdx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[k] = v;
    }
  }
}

async function auditStagingLiveState() {
  const stagingUrl = process.env.STAGING_DATABASE_URL;
  if (!stagingUrl) throw new Error('STAGING_DATABASE_URL is required.');

  // Decrypt snapshot to get expected table checksums
  const snapshotPath = 'G:\\Meu Drive\\Backup\\HelpUS_ERP_Database_Custody\\latest_backup.enc.json';
  const snapshot = decryptSnapshot(snapshotPath);

  const client = new Client({
    connectionString: stagingUrl,
    ssl: { rejectUnauthorized: true }
  });
  await client.connect();

  const dbInfo = await client.query('SELECT current_database(), current_user;');
  console.log(`Connected to: DB=${dbInfo.rows[0].current_database}, User=${dbInfo.rows[0].current_user}`);

  const metaRes = await client.query('SELECT * FROM staging_metadata;');
  console.log('Staging metadata rows:', metaRes.rows);

  const tables = ['warehouses', 'products', 'inventory_balances', 'invoices', 'invoice_items', 'stock_movements', 'sale_orders', 'returns'];
  const auditResults = {};

  for (const table of tables) {
    const res = await client.query(`SELECT * FROM ${table};`);
    const liveCount = res.rows.length;
    const liveChecksum = computeTableChecksum(res.rows);
    const expectedCount = snapshot.tableCounts ? snapshot.tableCounts[table] : (snapshot.tables[table] || []).length;
    const expectedChecksum = snapshot.checksums ? snapshot.checksums[table] : null;

    const countMatch = liveCount === expectedCount;
    const checksumMatch = liveChecksum === expectedChecksum;

    auditResults[table] = {
      expectedCount,
      liveCount,
      countMatch,
      checksumMatch,
      status: (countMatch && checksumMatch) ? 'EXACT_MATCH_VERIFIED' : 'MISMATCH'
    };
  }

  await client.end();
  console.table(auditResults);
  return auditResults;
}

auditStagingLiveState()
  .then((res) => {
    const allMatch = Object.values(res).every(r => r.status === 'EXACT_MATCH_VERIFIED');
    console.log('ALL_STAGING_TABLES_MATCH:', allMatch);
    process.exit(allMatch ? 0 : 1);
  })
  .catch((err) => {
    console.error('AUDIT_FAILED:', err);
    process.exit(1);
  });
