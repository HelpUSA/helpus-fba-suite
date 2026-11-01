// End-to-End Escrow Recovery Drill (Order 035 Gate G4.2)
// Proves:
// 1. Creation of an encrypted Key Escrow package with independent Master Passphrase.
// 2. Negative test: Rejection of corrupted Master Passphrase via AES-256-GCM authTag failure.
// 3. Positive test: Decryption of backup key using valid Master Passphrase.
// 4. Truly independent clean-room disaster recovery into helpus_staging using ONLY remote snapshot.

const fs = require('fs');
const path = require('path');
const { createEscrowPackage, unlockEscrowPackage } = require('./key_escrow_manager');
const { testIndependentRemoteRestore } = require('./test_gdrive_restore');

// Load environment variables for staging database
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

async function runEscrowRecoveryDrill() {
  console.log('====================================================================');
  console.log('ESCROW RECOVERY DRILL & CRYPTOGRAPHIC SEPARATION TEST');
  console.log('====================================================================');

  // Obtain raw key for escrow demonstration
  const rawKeyPath = path.join(__dirname, '..', 'backups', '.backup_secret_key');
  const rawKey = fs.readFileSync(rawKeyPath, 'utf-8').trim();

  // Master Secret held only by Owner / SuperAdmin (injected via env or sample test token)
  const OWNER_MASTER_PASSPHRASE = process.env.MASTER_PASSPHRASE;
  if (!OWNER_MASTER_PASSPHRASE || OWNER_MASTER_PASSPHRASE.length < 16) {
    throw new Error('BLOCKED_ON_OWNER_MASTER_SECRET: provide a strong owner-controlled passphrase through a protected input mechanism; no test-password fallback is allowed.');
  }

  console.log('1. Generating encrypted Escrow package using Master Passphrase (scrypt + AES-256-GCM)...');
  const escrowPackage = createEscrowPackage(rawKey, OWNER_MASTER_PASSPHRASE);
  console.log('✓ Escrow Package created successfully:');
  console.log({
    type: escrowPackage.type,
    kdf: escrowPackage.kdf,
    algorithm: escrowPackage.algorithm,
    salt_length_bytes: Buffer.from(escrowPackage.salt, 'hex').length,
    iv_length_bytes: Buffer.from(escrowPackage.iv, 'hex').length,
    authTag_length_bytes: Buffer.from(escrowPackage.authTag, 'hex').length,
    encryptedKey_length_hex: escrowPackage.encryptedKey.length
  });

  // Keep test material in memory; writing locally does not establish independent custody.
  // The owner must separately authorize an external private escrow destination.
  console.log('✓ Escrow package built in memory; off-host custody remains unverified.');

  // Negative test: Try unlocking with WRONG passphrase
  console.log('\n2. Negative Test: Attempting escrow unlock with INCORRECT Master Passphrase...');
  let wrongPassphraseRejected = false;
  try {
    unlockEscrowPackage(escrowPackage, 'WrongPassphrase123!');
  } catch (err) {
    wrongPassphraseRejected = true;
    console.log('✓ Senha incorreta rejeitada pela autenticação do escrow.');
  }
  if (!wrongPassphraseRejected) {
    throw new Error('FALHA DE SEGURANÇA: Escrow aceitou uma senha mestra incorreta.');
  }

  // Positive test: Unlock escrow package with CORRECT passphrase
  console.log('\n3. Positive Test: Unlocking escrow package with AUTHORIZED Master Passphrase...');
  const recoveredKey = unlockEscrowPackage(escrowPackage, OWNER_MASTER_PASSPHRASE);
  if (recoveredKey !== rawKey) {
    throw new Error('Chave recuperada do escrow diverge da chave original!');
  }
  console.log('✓ Chave de backup recuperada com sucesso via autenticação AES-256-GCM.');

  // Clean-room restore using ONLY recovered key and remote Google Drive snapshot
  console.log('\n4. Executing Clean-Room Restore with recovered key and remote Google Drive snapshot...');
  const restoreRes = await testIndependentRemoteRestore({
    explicitKey: recoveredKey,
    remotePath: 'G:\\Meu Drive\\Backup\\HelpUS_ERP_Database_Custody\\latest_backup.enc.json',
    stagingUrl: process.env.STAGING_DATABASE_URL
  });

  console.log('\n====================================================================');
  console.log('✓ ESCROW RECOVERY DRILL CONCLUÍDO COM SUCESSO TOTAL');
  console.log('====================================================================');
  return restoreRes;
}

runEscrowRecoveryDrill()
  .then(() => {
    console.log('ESCROW_DRILL_PASSED');
    process.exit(0);
  })
  .catch(err => {
    console.error('ESCROW_DRILL_FAILED:', err);
    process.exit(1);
  });
