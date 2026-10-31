// Database Backup Script (Order 026 Prioridade 4)
// Secure logical snapshot with retention policy, encryption support and git exclusion.

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function backupDatabase() {
  const isSsl = !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: isSsl ? { rejectUnauthorized: true } : false
  });
  await client.connect();

  console.log("=== BACKUP SEGURO & SNAPSHOT DO POSTGRESQL (ORDEM 026) ===");

  const tables = ['warehouses', 'products', 'inventory_balances', 'stock_movements', 'invoices', 'invoice_items', 'sale_orders', 'returns'];
  const snapshot = {
    timestamp: new Date().toISOString(),
    engine: 'PostgreSQL 18.6 Neon Cloud',
    schema_version: 'P0-PROD-20261031',
    tables: {}
  };

  for (const table of tables) {
    const res = await client.query(`SELECT * FROM ${table} ORDER BY 1 ASC;`);
    snapshot.tables[table] = res.rows;
    console.log(`✓ Tabela '${table}': ${res.rows.length} registros exportados.`);
  }

  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  }

  const rawJson = JSON.stringify(snapshot, null, 2);
  const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || process.env.HELPUS_API_SECRET;

  const timestamp = Date.now();
  let filename = `backup_neon_prod_${timestamp}.json`;
  let finalContent = rawJson;

  if (encryptionKey) {
    // Encrypt payload with AES-256-GCM
    const iv = crypto.randomBytes(12);
    const key = crypto.scryptSync(encryptionKey, 'helpus-backup-salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(rawJson, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    const encryptedPayload = {
      encrypted: true,
      algorithm: 'aes-256-gcm',
      iv: iv.toString('hex'),
      authTag,
      timestamp: snapshot.timestamp,
      data: encrypted
    };

    filename = `backup_neon_prod_${timestamp}.enc.json`;
    finalContent = JSON.stringify(encryptedPayload, null, 2);
    console.log("✓ Snapshot criptografado com AES-256-GCM.");
  }

  const filepath = path.join(backupDir, filename);
  fs.writeFileSync(filepath, finalContent, { encoding: 'utf-8', mode: 0o600 });
  console.log(`✓ Snapshot exportado com permissões restritas (0o600) em: ${filepath}`);

  // Retention Policy: Keep at most the 5 most recent snapshots, prune older files
  const existingFiles = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('backup_neon_prod_') && f.endsWith('.json'))
    .sort()
    .reverse();

  const maxRetention = 5;
  if (existingFiles.length > maxRetention) {
    const toPrune = existingFiles.slice(maxRetention);
    for (const oldFile of toPrune) {
      fs.unlinkSync(path.join(backupDir, oldFile));
      console.log(`✓ Política de retenção: arquivo antigo podado: ${oldFile}`);
    }
  }

  await client.end();
}

backupDatabase().catch(err => {
  console.error("Backup failed:", err);
  process.exit(1);
});
