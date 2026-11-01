// Comprehensive Negative Security & Cryptographic Integrity Test (Order 030 Gates G1 & G3)
// Proves:
// 1. Rejection of corrupted snapshot data via SHA-256 table checksum audit before COMMIT.
// 2. Immediate post-abortion checksum audit proving staging state was untouched (NO restore needed).
// 3. Rejection of tampered ciphertext (envelope.data) via AES-256-GCM authTag failure.
// 4. Rejection of tampered authentication tag (envelope.authTag) via AES-256-GCM.
// 5. Strict TLS (rejectUnauthorized: true) across all connections.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const { decryptSnapshot, restoreDatabase, getBackupKey, computeTableChecksum } = require('./restore_database');

async function getStagingChecksums(stagingUrl) {
  const client = new Client({ connectionString: stagingUrl, ssl: { rejectUnauthorized: true } });
  await client.connect();
  const tables = ['warehouses', 'products', 'inventory_balances', 'invoices', 'invoice_items', 'stock_movements', 'sale_orders', 'returns'];
  const checksums = {};
  for (const table of tables) {
    const res = await client.query(`SELECT * FROM ${table} ORDER BY 1 ASC;`);
    checksums[table] = {
      count: res.rows.length,
      checksum: computeTableChecksum(res.rows)
    };
  }
  await client.end();
  return checksums;
}

function assertStateMatches(currentState, baselineState, stageName) {
  for (const [tbl, initial] of Object.entries(baselineState)) {
    const current = currentState[tbl];
    if (initial.count !== current.count || initial.checksum !== current.checksum) {
      throw new Error(`🛑 FALHA DE ISOLAMENTO [${stageName}]: Tabela '${tbl}' foi alterada durante tentativa abortada! (Contagem: ${initial.count} -> ${current.count}, Checksum match: ${initial.checksum === current.checksum})`);
    }
  }
  console.log(`✓ Verificação imediata pós-aborto [${stageName}]: 8/8 tabelas 100% IDÊNTICAS à baseline canônica.`);
}

async function runComprehensiveNegativeTests() {
  console.log('===============================================================');
  console.log('AUDITORIA DE TESTES NEGATIVOS CRIPTOGRÁFICOS E TRANSACIONAIS (ORDEM 030)');
  console.log('===============================================================');

  const stagingUrl = process.env.STAGING_DATABASE_URL || process.env.TEST_DATABASE_URL || (() => {
    const prod = process.env.DATABASE_URL;
    const p = new URL(prod);
    p.pathname = '/helpus_staging';
    return p.toString();
  })();

  const prodUrl = process.env.DATABASE_URL;
  const backupDir = path.join(__dirname, '..', 'backups');
  const validSnapshotPath = path.join(backupDir, 'latest_backup.enc.json');

  if (!fs.existsSync(validSnapshotPath)) {
    throw new Error('Snapshot latest_backup.enc.json não encontrado para teste negativo.');
  }

  // 0. Ensure clean baseline and capture initial checksums
  console.log('\n[0/4] Restauração baseline e captura de checksums iniciais...');
  await restoreDatabase(validSnapshotPath, stagingUrl, prodUrl);
  const baselineState = await getStagingChecksums(stagingUrl);
  console.log(`✓ Baseline staging capturado com TLS estrito: ${Object.keys(baselineState).length} tabelas conferidas.`);

  // TEST 1: Tampered Data inside valid AES-256-GCM envelope
  console.log('\n[1/4] TESTE NEGATIVO 1: Adulteração de dados internos (Checksum Mismatch)...');
  const rawEnvelope = JSON.parse(fs.readFileSync(validSnapshotPath, 'utf8'));
  const validData = decryptSnapshot(validSnapshotPath);

  // Alter balance quantity maliciously
  const tamperedData = JSON.parse(JSON.stringify(validData));
  if (tamperedData.tables && tamperedData.tables.inventory_balances && tamperedData.tables.inventory_balances.length > 0) {
    tamperedData.tables.inventory_balances[0].quantity = 99999;
  }

  // Re-encrypt tampered data with valid key to test table checksum verifier
  const key = getBackupKey();
  const salt1 = crypto.randomBytes(16);
  const iv1 = crypto.randomBytes(12);
  const derivedKey1 = crypto.scryptSync(key, salt1, 32);
  const cipher1 = crypto.createCipheriv('aes-256-gcm', derivedKey1, iv1);
  let encData1 = cipher1.update(JSON.stringify(tamperedData), 'utf8', 'hex');
  encData1 += cipher1.final('hex');
  const authTag1 = cipher1.getAuthTag().toString('hex');

  const tamperedDataFile = path.join(backupDir, 'tampered_data_test.enc.json');
  fs.writeFileSync(tamperedDataFile, JSON.stringify({
    ...rawEnvelope,
    salt: salt1.toString('hex'),
    iv: iv1.toString('hex'),
    authTag: authTag1,
    data: encData1
  }, null, 2));

  let test1Blocked = false;
  try {
    await restoreDatabase(tamperedDataFile, stagingUrl, prodUrl);
  } catch (err) {
    test1Blocked = true;
    console.log(`✓ Interceptação confirmada no Teste 1: "${err.message}"`);
  } finally {
    if (fs.existsSync(tamperedDataFile)) fs.unlinkSync(tamperedDataFile);
  }
  if (!test1Blocked) throw new Error('Falha no Teste 1: Adulteração de dados não foi interceptada!');

  // AUDITORIA IMEDIATA PÓS-ABORTO (SEM RESTORE PREVENTIVO)
  const stateAfterTest1 = await getStagingChecksums(stagingUrl);
  assertStateMatches(stateAfterTest1, baselineState, 'Pós-Teste 1 Dados Adulterados');

  // TEST 2: Tampered Ciphertext (envelope.data bit flip)
  console.log('\n[2/4] TESTE NEGATIVO 2: Adulteração de Ciphertext (Corrupção de bits cifrados)...');
  const tamperedCipherFile = path.join(backupDir, 'tampered_ciphertext_test.enc.json');
  const badCipherHex = rawEnvelope.data.slice(0, 10) + 'ffffffff' + rawEnvelope.data.slice(18);
  fs.writeFileSync(tamperedCipherFile, JSON.stringify({
    ...rawEnvelope,
    data: badCipherHex
  }, null, 2));

  let test2Blocked = false;
  try {
    decryptSnapshot(tamperedCipherFile);
  } catch (err) {
    test2Blocked = true;
    console.log(`✓ Rejeição criptográfica confirmada no Teste 2 (Ciphertext adulterado):`);
    console.log(`  Mensagem: "${err.message}"`);
  } finally {
    if (fs.existsSync(tamperedCipherFile)) fs.unlinkSync(tamperedCipherFile);
  }
  if (!test2Blocked) throw new Error('Falha no Teste 2: Ciphertext adulterado não causou erro criptográfico!');

  // AUDITORIA IMEDIATA PÓS-ABORTO (SEM RESTORE PREVENTIVO)
  const stateAfterTest2 = await getStagingChecksums(stagingUrl);
  assertStateMatches(stateAfterTest2, baselineState, 'Pós-Teste 2 Ciphertext Adulterado');

  // TEST 3: Tampered AuthTag (envelope.authTag bit flip)
  console.log('\n[3/4] TESTE NEGATIVO 3: Adulteração de AuthTag (Violação de Autenticidade)...');
  const tamperedTagFile = path.join(backupDir, 'tampered_authtag_test.enc.json');
  const badTagHex = '00000000' + rawEnvelope.authTag.slice(8);
  fs.writeFileSync(tamperedTagFile, JSON.stringify({
    ...rawEnvelope,
    authTag: badTagHex
  }, null, 2));

  let test3Blocked = false;
  try {
    decryptSnapshot(tamperedTagFile);
  } catch (err) {
    test3Blocked = true;
    console.log(`✓ Rejeição criptográfica confirmada no Teste 3 (AuthTag adulterada):`);
    console.log(`  Mensagem: "${err.message}"`);
  } finally {
    if (fs.existsSync(tamperedTagFile)) fs.unlinkSync(tamperedTagFile);
  }
  if (!test3Blocked) throw new Error('Falha no Teste 3: AuthTag adulterada não causou erro criptográfico!');

  // AUDITORIA IMEDIATA PÓS-ABORTO (SEM RESTORE PREVENTIVO)
  const stateAfterTest3 = await getStagingChecksums(stagingUrl);
  assertStateMatches(stateAfterTest3, baselineState, 'Pós-Teste 3 AuthTag Adulterada');

  // TEST 4: Final Summary Audit
  console.log('\n[4/4] AUDITORIA DE EQUIVALÊNCIA GLOBAL DO ESTADO DE STAGING...');
  console.log('Auditoria de Equivalência (Baseline vs Pós-Testes Negativos Imediatos):');
  for (const [tbl, initial] of Object.entries(baselineState)) {
    const post = stateAfterTest3[tbl];
    console.log(`  - ${tbl.padEnd(20)}: Contagem (${initial.count} -> ${post.count}) | Checksum Match: ${initial.checksum === post.checksum}`);
  }

  console.log('\n===============================================================');
  console.log('✓ AUDITORIA NEGATIVA G1 & G3 CONCLUÍDA COM 100% DE SUCESSO:');
  console.log('  Todas as adulterações foram rejeitadas e o banco manteve integridade');
  console.log('  imediata pós-aborto SEM necessidade de restauração emergencial!');
  console.log('===============================================================');
}

runComprehensiveNegativeTests().catch(err => {
  console.error('\n❌ Erro na auditoria de testes negativos:', err.message);
  process.exit(1);
});
