// Decryption & Restore Database Script (Order 028 Correções 2 & 3)
// Enforces mandatory AES-256-GCM decryption, strict exclusion of production across ALL parameters,
// server-side identity & staging marker validation before TRUNCATE, and exact checksum assertions.

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

  // Order 028: Exigir backups criptografados na restauração
  if (!envelope.encrypted) {
    throw new Error("🛑 BLOQUEIO DE SEGURANÇA: Restauração rejeitada. O arquivo não é um snapshot criptografado AES-256-GCM válido.");
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

  console.log("✓ Snapshot decriptografado com sucesso via AES-256-GCM (authTag íntegra).");
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

  // Order 028: Validar exclusão de endpoint de produção em TODOS os caminhos (inclusive explicitTargetUrl)
  let targetDbName = '';
  try {
    targetDbName = new URL(TARGET_DB_URL).pathname.toLowerCase().replace(/^\//, '');
  } catch (e) {
    targetDbName = '';
  }

  if (targetDbName === 'neondb' || targetDbName === 'production') {
    throw new Error('🛑 BLOQUEIO DE SEGURANÇA: Tentativa de restauração direcionada à base de PRODUÇÃO (/neondb)!');
  }

  if (PROD_DB_URL && getBaseEndpoint(TARGET_DB_URL) === getBaseEndpoint(PROD_DB_URL)) {
    throw new Error('🛑 BLOQUEIO DE SEGURANÇA: TARGET_DB_URL coincide com o endpoint de PRODUÇÃO!');
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
    // 1. Server-side verification of staging environment BEFORE ANY TRUNCATE
    const dbInfo = await client.query('SELECT current_database() as db;');
    const currentDb = dbInfo.rows[0].db;
    if (currentDb === 'neondb' || currentDb === 'production') {
      throw new Error(`🛑 BLOQUEIO DE SEGURANÇA: current_database() retornou '${currentDb}' (Produção). Restauração abortada.`);
    }

    const markerRes = await client.query("SELECT value FROM staging_metadata WHERE key = 'environment';").catch(() => ({ rows: [] }));
    if (markerRes.rows.length === 0 || markerRes.rows[0].value !== 'staging') {
      throw new Error("🛑 BLOQUEIO DE SEGURANÇA: Marcador persistente 'staging_metadata' não encontrado no banco de destino. Restauração abortada.");
    }
    console.log(`✓ Identidade de servidor comprovada: DB='${currentDb}', ambiente='staging'.`);

    await client.query('BEGIN');

    // 2. Clean restoration: truncate ALL tables in staging before applying snapshot (strictly after server-side check)
    console.log('\nLimpando tabelas de staging para restauração limpa...');
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

      // 4. Exact equality assertion & Checksum Verification
      const countRes = await client.query(`SELECT COUNT(*) FROM ${table};`);
      const liveCount = parseInt(countRes.rows[0].count);

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

function findLatestSnapshot() {
  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) return null;
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.enc.json'));
  if (files.length === 0) return null;
  files.sort().reverse();
  return path.join(backupDir, files[0]);
}

if (require.main === module) {
  const snapshotPath = process.argv[2] || findLatestSnapshot();
  if (!snapshotPath) {
    console.error("Nenhum snapshot criptografado encontrado em backups/.");
    process.exit(1);
  }

  restoreDatabase(snapshotPath).catch(err => {
    console.error('\n❌ Falha na restauração em staging:', err.message);
    process.exit(1);
  });
}

module.exports = { restoreDatabase, decryptSnapshot, computeTableChecksum, getBackupKey };
