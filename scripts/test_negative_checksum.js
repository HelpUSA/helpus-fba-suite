// Negative Checksum Verification Test (Order 028 Correção 3)
// Proves that any corrupted, altered or tampered data in a snapshot is detected
// and strictly rejected by the checksum audit during restoration.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { decryptSnapshot, restoreDatabase, getBackupKey } = require('./restore_database');

async function testNegativeChecksum() {
  console.log('===============================================================');
  console.log('TESTE NEGATIVO DE CHECKSUM (DETECÇÃO DE CORRUPÇÃO DE DADOS)');
  console.log('===============================================================');

  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');

  const backupDir = path.join(__dirname, '..', 'backups');
  const validSnapshotPath = path.join(backupDir, 'latest_backup.enc.json');
  if (!fs.existsSync(validSnapshotPath)) {
    throw new Error('Snapshot original não encontrado em backups/latest_backup.enc.json');
  }

  // 1. Decrypt valid snapshot
  const snapshot = decryptSnapshot(validSnapshotPath);

  // 2. Intentionally tamper with data (e.g. change stock quantity of first item)
  console.log('\n[1/3] Simulando corrupção maliciosa de dados no snapshot...');
  const tamperedSnapshot = JSON.parse(JSON.stringify(snapshot));
  if (tamperedSnapshot.tables.inventory_balances.length > 0) {
    const originalQty = tamperedSnapshot.tables.inventory_balances[0].quantity;
    tamperedSnapshot.tables.inventory_balances[0].quantity = 99999; // Corrompido!
    console.log(`✓ Dado adulterado propositalmente: quantity de ${originalQty} para 99999.`);
  }

  // 3. Encrypt the tampered snapshot with original expected checksum intact
  const encryptionKey = getBackupKey();
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(encryptionKey, salt, 32);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(JSON.stringify(tamperedSnapshot), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  const tamperedEnvelope = {
    encrypted: true,
    algorithm: 'aes-256-gcm',
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    timestamp: tamperedSnapshot.timestamp,
    schema_version: tamperedSnapshot.schema_version,
    data: encrypted
  };

  const corruptFilePath = path.join(backupDir, 'test_corrupted_snapshot.enc.json');
  fs.writeFileSync(corruptFilePath, JSON.stringify(tamperedEnvelope, null, 2), { encoding: 'utf-8', mode: 0o600 });

  // 4. Attempt restoration with corrupted snapshot - MUST FAIL CLOSED
  console.log('\n[2/3] Tentando restaurar snapshot corrompido em staging...');
  const u = new URL(process.env.DATABASE_URL);
  u.pathname = '/helpus_staging';
  const stagingUrl = u.toString();

  let failedAsExpected = false;
  let capturedError = '';

  try {
    await restoreDatabase(corruptFilePath, stagingUrl, process.env.DATABASE_URL);
  } catch (err) {
    failedAsExpected = true;
    capturedError = err.message;
    console.log(`✓ Rejeição interceptada com sucesso pelo validador: "${capturedError}"`);
  } finally {
    if (fs.existsSync(corruptFilePath)) fs.unlinkSync(corruptFilePath);
  }

  console.log('\n[3/3] VERIFICAÇÃO DO RESULTADO DO TESTE NEGATIVO');
  if (failedAsExpected && capturedError.includes('DIVERGÊNCIA DE CHECKSUM')) {
    console.log('✓ TESTE NEGATIVO DE CHECKSUM APROVADO COM 100% DE SUCESSO!');
    console.log('  O sistema detectou e rejeitou a adulteração antes de efetivar qualquer COMMIT.');
  } else {
    throw new Error('❌ FALHA NO TESTE NEGATIVO: O validador aceitou dados corrompidos sem acusar divergência de checksum.');
  }
}

testNegativeChecksum().catch(err => {
  console.error('\n❌ Erro no teste negativo:', err.message);
  process.exit(1);
});
