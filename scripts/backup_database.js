// Secure Database Backup Script (Order 027 Correção 3)
// Enforces mandatory AES-256-GCM encryption with random salt, table checksums, and strict retention.

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getOrGenerateBackupKey() {
  if (process.env.BACKUP_ENCRYPTION_KEY) {
    return process.env.BACKUP_ENCRYPTION_KEY;
  }
  const keyFile = path.join(__dirname, '..', 'backups', '.backup_secret_key');
  if (fs.existsSync(keyFile)) {
    return fs.readFileSync(keyFile, 'utf-8').trim();
  }
  // Generate a dedicated strong 256-bit random key
  const generatedKey = crypto.randomBytes(32).toString('hex');
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  fs.writeFileSync(keyFile, generatedKey, { encoding: 'utf-8', mode: 0o600 });
  console.log("✓ Chave dedicada de backup gerada e armazenada em backups/.backup_secret_key (0o600).");
  return generatedKey;
}

function computeTableChecksum(rows) {
  const hash = crypto.createHash('sha256');
  // Sort rows deterministically by their primary key or first column
  const sorted = [...rows].sort((a, b) => {
    const keyA = a.code || a.sku || a.id || JSON.stringify(a);
    const keyB = b.code || b.sku || b.id || JSON.stringify(b);
    return String(keyA).localeCompare(String(keyB));
  });
  // Normalize row dates to ISO strings
  const normalized = sorted.map(r => {
    const obj = {};
    for (const [k, v] of Object.entries(r)) {
      obj[k] = v instanceof Date ? v.toISOString() : (v !== null && typeof v === 'object' && v.toISOString) ? v.toISOString() : v;
    }
    return obj;
  });
  hash.update(JSON.stringify(normalized));
  return hash.digest('hex');
}

async function backupDatabase() {
  const isSsl = !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: isSsl ? { rejectUnauthorized: true } : false
  });
  await client.connect();

  console.log("=== BACKUP CRIPTOGRAFADO & SNAPSHOT MANDATÓRIO (ORDEM 027) ===");

  const tables = ['warehouses', 'products', 'inventory_balances', 'stock_movements', 'invoices', 'invoice_items', 'sale_orders', 'returns'];
  const snapshot = {
    timestamp: new Date().toISOString(),
    engine: 'PostgreSQL 18.6 Neon Cloud',
    schema_version: 'P0-PROD-20261031',
    checksums: {},
    tableCounts: {},
    tables: {}
  };

  for (const table of tables) {
    const res = await client.query(`SELECT * FROM ${table} ORDER BY 1 ASC;`);
    // Normalize date fields to ISO string in rows
    const rows = res.rows.map(r => {
      const obj = {};
      for (const [k, v] of Object.entries(r)) {
        obj[k] = v instanceof Date ? v.toISOString() : v;
      }
      return obj;
    });
    snapshot.tables[table] = rows;
    snapshot.tableCounts[table] = rows.length;
    snapshot.checksums[table] = computeTableChecksum(rows);
    console.log(`✓ Tabela '${table}': ${rows.length} registros (SHA-256: ${snapshot.checksums[table].slice(0, 16)}...).`);
  }

  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  }

  // Mandatory encryption (Order 027 Correção 3: No plain text exports permitted)
  const encryptionKey = getOrGenerateBackupKey();
  const rawJson = JSON.stringify(snapshot, null, 2);

  // Cryptographically secure random salt (16 bytes) and random IV (12 bytes)
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(encryptionKey, salt, 32);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(rawJson, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  const encryptedEnvelope = {
    encrypted: true,
    algorithm: 'aes-256-gcm',
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    timestamp: snapshot.timestamp,
    schema_version: snapshot.schema_version,
    data: encrypted
  };

  const timestamp = Date.now();
  const filename = `backup_neon_${timestamp}.enc.json`;
  const filepath = path.join(backupDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(encryptedEnvelope, null, 2), { encoding: 'utf-8', mode: 0o600 });
  console.log(`\n✓ Snapshot criptografado exportado com sucesso (modo 0o600): ${filepath}`);

  // Also write latest pointer
  const latestPointer = path.join(backupDir, 'latest_backup.enc.json');
  fs.writeFileSync(latestPointer, JSON.stringify(encryptedEnvelope, null, 2), { encoding: 'utf-8', mode: 0o600 });

  // Retention Policy: Keep at most the 5 most recent snapshots, prune older files
  const existingFiles = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('backup_neon_') && f.endsWith('.enc.json'))
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
  return filepath;
}

if (require.main === module) {
  backupDatabase().catch(err => {
    console.error("Backup failed:", err);
    process.exit(1);
  });
}

module.exports = { backupDatabase, getOrGenerateBackupKey, computeTableChecksum };
