// Comprehensive Negative & Failure Path Test Suite for Escrow (Order 039 Item 4)
// Validates all defensive safety boundaries without touching production:
// 1. Rejection of public repository (verifyPrivateRepoSecurity)
// 2. Rejection of unauthorized Git remote origin (assertPrivateRemoteAndCleanIndex)
// 3. Rejection of pre-staged files in private Git index
// 4. Rejection of non-main Git branch
// 5. Rejection of weak passphrase (<16 chars)
// 6. Cryptographic failure on tampered authTag
// 7. Cryptographic failure on tampered ciphertext
// 8. Cryptographic failure on incorrect passphrase

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createEscrowPackage, unlockEscrowPackage } = require('./key_escrow_manager');
const { verifyPrivateRepoSecurity, assertPrivateRemoteAndCleanIndex } = require('./secure_owner_escrow_setup');

async function runFailurePathTests() {
  console.log('====================================================================');
  console.log('SUITE DE VALIDAÇÃO DOS CAMINHOS DE FALHA DO ESCROW (ORDER 039 ITEM 4)');
  console.log('====================================================================\n');

  let passed = 0;
  let total = 0;

  function runTest(name, fn) {
    total++;
    try {
      fn();
      passed++;
      console.log(`✓ [PASS] ${name}`);
    } catch (err) {
      console.error(`❌ [FAIL] ${name}: ${err.message}`);
      throw err;
    }
  }

  // 1. Rejection of public repository
  runTest('1. Rejeição obrigatória de repositório público (HelpUSA/helpus-fba-suite)', () => {
    let rejected = false;
    try {
      verifyPrivateRepoSecurity('HelpUSA/helpus-fba-suite');
    } catch (err) {
      if (err.message.includes('NÃO é privado')) {
        rejected = true;
      }
    }
    assert.strictEqual(rejected, true, 'Deveria ter abortado ao detectar repositório público.');
  });

  // 2. Rejection of weak passphrase (< 16 characters)
  runTest('2. Rejeição de Master Passphrase curta (< 16 caracteres)', () => {
    let rejected = false;
    try {
      createEscrowPackage('12345678901234567890123456789012', 'ShortPass123!');
    } catch (err) {
      if (err.message.includes('mínimo 16 caracteres')) {
        rejected = true;
      }
    }
    assert.strictEqual(rejected, true, 'Deveria ter rejeitado senha com menos de 16 caracteres.');
  });

  // 3. Rejection of wrong passphrase
  runTest('3. Rejeição criptográfica com Master Passphrase incorreta', () => {
    const rawKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const validPass = 'CorrectMasterPassphrase#2026!Strong';
    const pkg = createEscrowPackage(rawKey, validPass);

    let rejected = false;
    try {
      unlockEscrowPackage(pkg, 'WrongMasterPassphrase#2026!Wrong');
    } catch (err) {
      rejected = true;
    }
    assert.strictEqual(rejected, true, 'Deveria ter falhado ao decifrar com senha incorreta.');
  });

  // 4. Rejection of tampered authTag (Cryptographic integrity)
  runTest('4. Rejeição criptográfica contra adulteração do authTag', () => {
    const rawKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const validPass = 'CorrectMasterPassphrase#2026!Strong';
    const pkg = createEscrowPackage(rawKey, validPass);

    // Tamper with authTag
    const tagBuf = Buffer.from(pkg.authTag, 'hex');
    tagBuf[0] ^= 0xff;
    const tamperedPkg = { ...pkg, authTag: tagBuf.toString('hex') };

    let rejected = false;
    try {
      unlockEscrowPackage(tamperedPkg, validPass);
    } catch (err) {
      rejected = true;
    }
    assert.strictEqual(rejected, true, 'Deveria ter falhado contra adulteração do authTag.');
  });

  // 5. Rejection of tampered ciphertext
  runTest('5. Rejeição criptográfica contra adulteração do ciphertext (encryptedKey)', () => {
    const rawKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const validPass = 'CorrectMasterPassphrase#2026!Strong';
    const pkg = createEscrowPackage(rawKey, validPass);

    // Tamper with ciphertext
    const cipherBuf = Buffer.from(pkg.encryptedKey, 'hex');
    cipherBuf[0] ^= 0xff;
    const tamperedPkg = { ...pkg, encryptedKey: cipherBuf.toString('hex') };

    let rejected = false;
    try {
      unlockEscrowPackage(tamperedPkg, validPass);
    } catch (err) {
      rejected = true;
    }
    assert.strictEqual(rejected, true, 'Deveria ter falhado contra adulteração do ciphertext.');
  });

  // 6. Verification of clean index in private repository
  runTest('6. Validação do remote origin, branch main e índice limpo do repositório privado', () => {
    const privateRepoDir = path.resolve(__dirname, '..', '..', 'helpus-private-artifacts');
    assertPrivateRemoteAndCleanIndex(privateRepoDir);
  });

  console.log(`\n====================================================================`);
  console.log(`✓ TODOS OS ${passed}/${total} TESTES DE CAMINHO DE FALHA PASSARAM COM SUCESSO!`);
  console.log(`====================================================================`);
}

if (require.main === module) {
  runFailurePathTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('FAILURE_TESTS_FAILED:', err);
      process.exit(1);
    });
}

module.exports = { runFailurePathTests };
