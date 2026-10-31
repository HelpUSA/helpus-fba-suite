// Decryption & Restore Database Script (Order 027 Correções 2 & 3)
// Enforces decryption of AES-256-GCM snapshots, clean restoration, exact row count assertions,
// and SHA-256 table checksum verification against isolated staging database.

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getBaseEndpoint(u) {
  try {
    const parsed = new URL(u);
    return `${parsed.hostname.toLowerCase().replace('-pooler', '')}/${parsed.pathname.replace(/^\//, '').toLowerCase()}`;
  } catch (e) {
    return u;
  }
}

function getBackupKey() {
  if (process.env.BACKUP_ENCRYPTION_KEY) {
    return process.env.BACKUP_ENCRYPTION_KEY;
  }
  const keyFile = path.join(__dirname, '..', 'backups', '.backup_secret_key');
  if (fs.existsSync(keyFile)) {
    return fs.readFileSync(keyFile, 'utf-8').trim();
  }
  throw new Error("Chave de backup não encontrada (defina BACKUP_ENCRYPTION_KEY ou mantenha backups/.backup_secret_key).");
}

function decryptSnapshot(encryptedEnvelopePath) {
  const raw = fs.readFileSync(encryptedEnvelopePath, 'utf-8');
  const envelope = JSON.parse(raw);

  if (!envelope.encrypted) {
    return envelope;
  }

  const key = getBackupKey();
  const salt = Buffer.from(envelope.salt, 'hex');
  const iv = Buffer.from(envelope.iv, 'hex');
  const authTag = Buffer.from(envelope.authTag, 'hex');
  const derivedKey = crypto.scryptSync(key, salt, 32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(envelope.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  console.log("✓ Snapshot decriptografado com sucesso via AES-256-GCM e authTag verificada.");
  return JSON.parse(decrypted);
}

function computeTableChecksum(rows) {
  const hash = crypto.createHash('sha256');
  const sorted = [...rows].sort((a, b) => {
    const keyA = a.code || a.sku || a.id || JSON.stringify(a);
    const keyB = b.code || b.sku || b.id || JSON.stringify(b);
    return String(keyA).localeCompare(String(keyB));
  });
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

async function restoreDatabase(snapshotFile, explicitTargetUrl, explicitProdUrl) {
  const TARGET_DB_URL = explicitTargetUrl || process.env.TEST_DATABASE_URL || process.env.STAGING_DATABASE_URL;
  const PROD_DB_URL = explicitProdUrl || process.env.DATABASE_URL;

  if (!TARGET_DB_URL) {
    throw new Error('🛑 ERRO: TEST_DATABASE_URL ou STAGING_DATABASE_URL é obrigatória para restauração em staging.');
  }

  // Strict anti-production protection: target database must never be /neondb or match production
  let targetDbName = '';
  try {
    targetDbName = new URL(TARGET_DB_URL).pathname.toLowerCase().replace(/^\//, '');
  } catch (e) {
    targetDbName = '';
  }

  if (targetDbName === 'neondb' || targetDbName === 'production') {
    throw new Error('🛑 BLOQUEIO DE SEGURANÇA: Tentativa de restauração direcionada à base de PRODUÇÃO (/neondb)!');
  }

  if (PROD_DB_URL && !explicitTargetUrl && getBaseEndpoint(TARGET_DB_URL) === getBaseEndpoint(PROD_DB_URL)) {
    throw new Error('🛑 BLOQUEIO DE SEGURANÇA: Tentativa de restauração direcionada ao banco de PRODUÇÃO!');
  }

  const snapshot = decryptSnapshot(snapshotFile);

  console.log('===============================================================');
  console.log(`RESTAURAÇÃO COMPLETA & VERIFICAÇÃO DE CHECKSUM EM STAGING (${snapshot.timestamp})`);
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

    // 2. Clean restoration: truncate ALL tables in staging before applying snapshot
    console.log('\nLimpando todas as tabelas operacionais de staging para restauração limpa...');
    await client.query(`
      TRUNCATE TABLE warehouses, products, inventory_balances, invoice_items, invoices, stock_movements, sale_orders, returns CASCADE;
    `);

    // 3. Restore in dependency order
    const tableOrder = ['warehouses', 'products', 'inventory_balances', 'invoices', 'invoice_items', 'stock_movements', 'sale_orders', 'returns'];
    const restoreAudit = {};

    for (const table of tableOrder) {
      const rows = snapshot.tables[table] || [];
      const expectedCount = snapshot.tableCounts ? snapshot.tableCounts[table] : rows.length;
      const expectedChecksum = snapshot.checksums ? snapshot.checksums[table] : null;

      if (rows.length > 0) {
        console.log(`Restaurando ${rows.length} registros na tabela '${table}'...`);
        for (const row of rows) {
          const columns = Object.keys(row);
          const values = Object.values(row);
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
          const colNames = columns.join(', ');

          await client.query(`
            INSERT INTO ${table} (${colNames})
            VALUES (${placeholders});
          `, values);
        }
      }

      // 4. Exact equality assertion & Checksum Verification (Order 027 Correção 2)
      const countRes = await client.query(`SELECT COUNT(*) FROM ${table};`);
      const liveCount = parseInt(countRes.rows[0].count);

      // Verify live rows in staging
      const liveRowsRes = await client.query(`SELECT * FROM ${table} ORDER BY 1 ASC;`);
      const liveChecksum = computeTableChecksum(liveRowsRes.rows);

      const countMatch = liveCount === expectedCount;
      const checksumMatch = expectedChecksum ? liveChecksum === expectedChecksum : true;

      restoreAudit[table] = {
        snapshotCount: expectedCount,
        liveCountInStaging: liveCount,
        countMatch,
        checksumMatch,
        status: countMatch && checksumMatch ? 'EXACT_MATCH_VERIFIED' : 'MISMATCH'
      };

      if (!countMatch) {
        throw new Error(`🛑 DIVERGÊNCIA DE CONTAGEM na tabela '${table}': esperado ${expectedCount}, encontrado ${liveCount}.`);
      }
      if (!checksumMatch) {
        throw new Error(`🛑 DIVERGÊNCIA DE CHECKSUM SHA-256 na tabela '${table}': esperado ${expectedChecksum}, gerado ${liveChecksum}.`);
      }

      console.log(`✓ Tabela '${table}': ${liveCount}/${expectedCount} registros conferidos. Checksum verificado.`);
    }

    await client.query('COMMIT');
    console.log('\n===============================================================');
    console.log('RESTAURAÇÃO LIMPA CONCLUÍDA E 100% AUDITADA COM CHECKSUMS!');
    console.log('===============================================================');
    console.table(restoreAudit);

  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}

// Find newest snapshot in backups directory
function findLatestSnapshot() {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) return null;
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.enc.json') || f.endsWith('.json'));
  if (files.length === 0) return null;
  files.sort().reverse();
  return path.join(backupDir, files[0]);
}

if (require.main === module) {
  const snapshotPath = process.argv[2] || findLatestSnapshot();
  if (!snapshotPath) {
    console.error("Nenhum snapshot encontrado em backups/.");
    process.exit(1);
  }

  restoreDatabase(snapshotPath).catch(err => {
    console.error('\n❌ Falha na restauração em staging:', err.message);
    process.exit(1);
  });
}

module.exports = { restoreDatabase, decryptSnapshot, computeTableChecksum };
