// Interactive & Secure Owner Key Escrow Setup (Order 037 & 038 Gate G4.2)
// Provides a zero-leakage, interactive local workflow for the Master SuperAdmin:
// 1. Silent, non-echoed passphrase entry (never logged, never in shell history).
// 2. Encrypts the 256-bit backup key into an authenticated AES-256-GCM escrow package.
// 3. Verifies that HelpUSA/helpus-private-artifacts is strictly PRIVATE via GitHub API.
// 4. Atomically writes ONLY the encrypted envelope to the private repo and pushes to GitHub remote.
// 5. Verifies off-host presence and fetches the object independently via GitHub REST API.
// 6. Restores exclusively in isolated staging with decrypted key without disk key fallback.

const readline = require('readline');
const { Writable } = require('stream');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');
const { createEscrowPackage, unlockEscrowPackage } = require('./key_escrow_manager');
const { testIndependentRemoteRestore } = require('./test_gdrive_restore');

function askMuted(query) {
  return new Promise((resolve) => {
    let muted = false;
    const mutableStdout = new Writable({
      write(chunk, encoding, callback) {
        if (!muted) {
          process.stdout.write(chunk, encoding);
        }
        callback();
      }
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true
    });

    process.stdout.write(query);
    muted = true;

    rl.question('', (answer) => {
      muted = false;
      process.stdout.write('\n');
      rl.close();
      resolve(answer.trim());
    });
  });
}

function verifyPrivateRepoSecurity(repoSlug = 'HelpUSA/helpus-private-artifacts') {
  try {
    const raw = execSync(`gh repo view ${repoSlug} --json isPrivate,name,owner`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    const info = JSON.parse(raw);
    if (!info.isPrivate) {
      throw new Error(`🛑 ABORTE DE SEGURANÇA: O repositório ${repoSlug} NÃO é privado!`);
    }
    console.log(`✓ Verificação de segurança: Repositório '${repoSlug}' confirmado estritamente PRIVADO (isPrivate: true).`);
    return true;
  } catch (err) {
    throw new Error(`Falha ao auditar privacidade do repositório remoto: ${err.message}`);
  }
}

async function getPassphraseInteractively() {
  console.log('\n====================================================================');
  console.log('CONFIGURAÇÃO INTERATIVA SEGURA DO ESCROW CRIPTOGRÁFICO (MASTER SUPERADMIN)');
  console.log('====================================================================');
  console.log('A senha mestra NUNCA será exibida na tela, salva em log ou armazenada em disco.\n');

  while (true) {
    const p1 = await askMuted('Digite a Master Passphrase (mínimo 16 caracteres de alta entropia): ');
    if (p1.length < 16) {
      console.log('❌ Senha muito curta (mínimo 16 caracteres). Tente novamente.\n');
      continue;
    }
    const p2 = await askMuted('Confirme a Master Passphrase: ');
    if (p1 !== p2) {
      console.log('❌ As senhas não coincidem. Tente novamente.\n');
      continue;
    }
    console.log('✓ Senha confirmada com sucesso (máscara de segurança aplicada).\n');
    return p1;
  }
}

async function runSyntheticOffhostVerification() {
  console.log('====================================================================');
  console.log('INICIANDO TESTE SINTÉTICO OFF-HOST (ORDER 038 ITEM 6)');
  console.log('====================================================================');
  
  verifyPrivateRepoSecurity('HelpUSA/helpus-private-artifacts');

  const privateRepoDir = path.resolve(__dirname, '..', '..', 'helpus-private-artifacts');
  if (!fs.existsSync(privateRepoDir)) {
    throw new Error('Diretório local do repositório privado não encontrado: ' + privateRepoDir);
  }

  // Generate synthetic sample key and synthetic passphrase
  const syntheticKey = crypto.randomBytes(32).toString('hex');
  const syntheticPassphrase = 'Synthetic#TestPassphrase@Entropy' + crypto.randomBytes(8).toString('hex');

  console.log('1. Gerando pacote de escrow sintético com scrypt N=16384 + AES-256-GCM...');
  const syntheticEscrow = createEscrowPackage(syntheticKey, syntheticPassphrase);

  const escrowDir = path.join(privateRepoDir, 'escrow');
  if (!fs.existsSync(escrowDir)) fs.mkdirSync(escrowDir, { recursive: true });
  const syntheticFilePath = path.join(escrowDir, 'synthetic_test_escrow.enc.json');

  fs.writeFileSync(syntheticFilePath, JSON.stringify(syntheticEscrow, null, 2), { encoding: 'utf-8', mode: 0o600 });
  console.log('2. Arquivo sintético gravado localmente no workspace privado.');

  console.log('3. Realizando staging estrito e push para repositório PRIVADO remoto...');
  execSync(`git -C "${privateRepoDir}" add escrow/synthetic_test_escrow.enc.json`, { stdio: 'pipe' });
  execSync(`git -C "${privateRepoDir}" commit -m "test: synthetic escrow custody verification (Order 038)"`, { stdio: 'pipe' });
  execSync(`git -C "${privateRepoDir}" push origin main`, { stdio: 'pipe' });
  console.log('✓ Push para GitHub privado executado com sucesso.');

  console.log('4. Consultando objeto remoto diretamente via API GitHub (gh api contents)...');
  const apiOut = execSync(`gh api repos/HelpUSA/helpus-private-artifacts/contents/escrow/synthetic_test_escrow.enc.json`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  const remoteFileObj = JSON.parse(apiOut);
  const remoteJsonStr = Buffer.from(remoteFileObj.content, 'base64').toString('utf-8');
  const remoteEnvelope = JSON.parse(remoteJsonStr);

  console.log('5. Decifrando objeto retornado da nuvem GitHub com a passphrase sintética...');
  const unlockedSynthetic = unlockEscrowPackage(remoteEnvelope, syntheticPassphrase);
  if (unlockedSynthetic !== syntheticKey) {
    throw new Error('FALHA CRÍTICA: Chave decifrada via API remota divergiu do original!');
  }
  console.log('✓ Leitura remota via API e decriptografia AES-256-GCM comprovadas com 100% de integridade.');

  console.log('6. Limpando artefato de teste sintético do repositório remoto...');
  execSync(`git -C "${privateRepoDir}" rm escrow/synthetic_test_escrow.enc.json`, { stdio: 'pipe' });
  execSync(`git -C "${privateRepoDir}" commit -m "chore: purge synthetic test escrow artifact"`, { stdio: 'pipe' });
  execSync(`git -C "${privateRepoDir}" push origin main`, { stdio: 'pipe' });
  console.log('✓ Repositório privado limpo com sucesso.');

  console.log('\n====================================================================');
  console.log('✓ FLUXO TÉCNICO OFF-HOST VALIDADO COM SUCESSO (PIPELINE 100% OPERACIONAL)');
  console.log('====================================================================');
  return {
    verifiedRepo: 'HelpUSA/helpus-private-artifacts',
    remoteSha: remoteFileObj.sha,
    syntheticDrillPassed: true
  };
}

async function runSecureOwnerSetup() {
  verifyPrivateRepoSecurity('HelpUSA/helpus-private-artifacts');

  const rawKeyPath = path.join(__dirname, '..', 'backups', '.backup_secret_key');
  if (!fs.existsSync(rawKeyPath)) {
    throw new Error('Chave original de backup não encontrada em backups/.backup_secret_key.');
  }
  const rawKey = fs.readFileSync(rawKeyPath, 'utf-8').trim();

  // 1. Get Passphrase securely without echo
  const passphrase = await getPassphraseInteractively();

  // 2. Generate Escrow Package
  console.log('1. Cifrando chave de backup com Master Passphrase (scrypt N=16384 + AES-256-GCM)...');
  const escrowPackage = createEscrowPackage(rawKey, passphrase);
  console.log('✓ Pacote de Escrow gerado com sucesso (salt=16B, IV=12B, authTag=16B).');

  // 3. Define authorized private off-host destination
  const privateRepoDir = path.resolve(__dirname, '..', '..', 'helpus-private-artifacts');
  if (!fs.existsSync(privateRepoDir)) {
    throw new Error('Diretório local do repositório privado não encontrado: ' + privateRepoDir);
  }
  const destDir = path.join(privateRepoDir, 'escrow');
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const escrowDestPath = path.join(destDir, 'backup_key_escrow.enc.json');

  // 4. Atomic write of ONLY the encrypted package
  const tempPath = `${escrowDestPath}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(escrowPackage, null, 2), { encoding: 'utf-8', mode: 0o600 });
  fs.renameSync(tempPath, escrowDestPath);
  console.log('2. Pacote de Escrow gravado atomicamente no workspace privado autorizado.');

  // 5. Specific Staging and Push to Private Remote
  console.log('3. Enviando pacote de escrow para repositório PRIVADO remoto (git push)...');
  execSync(`git -C "${privateRepoDir}" add escrow/backup_key_escrow.enc.json`, { stdio: 'pipe' });
  execSync(`git -C "${privateRepoDir}" commit -m "chore(escrow): update encrypted backup key escrow package"`, { stdio: 'pipe' });
  execSync(`git -C "${privateRepoDir}" push origin main`, { stdio: 'pipe' });
  console.log('✓ Push para GitHub privado executado com sucesso.');

  // 6. Independent readback via GitHub API
  console.log('4. Verificando presença e integridade do objeto via API GitHub (gh api contents)...');
  const apiOut = execSync(`gh api repos/HelpUSA/helpus-private-artifacts/contents/escrow/backup_key_escrow.enc.json`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
  const remoteFileObj = JSON.parse(apiOut);
  const remoteJsonStr = Buffer.from(remoteFileObj.content, 'base64').toString('utf-8');
  const remoteEnvelope = JSON.parse(remoteJsonStr);

  const unlockedKey = unlockEscrowPackage(remoteEnvelope, passphrase);
  if (unlockedKey !== rawKey) {
    throw new Error('FALHA CRÍTICA: Chave recuperada da API remota não confere com a chave original!');
  }
  console.log('✓ Integridade e custódia remota off-host comprovadas via API GitHub.');

  // 7. Clean-room restore drill in staging using unlocked key
  console.log('5. Executando drill de restauração clean-room em staging com a chave obtida do escrow...');
  const remoteSnapshot = 'G:\\Meu Drive\\Backup\\HelpUS_ERP_Database_Custody\\latest_backup.enc.json';

  // Load staging URL if not already in env
  if (!process.env.STAGING_DATABASE_URL) {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('STAGING_DATABASE_URL=')) {
          process.env.STAGING_DATABASE_URL = trimmed.split('=')[1].replace(/['"]/g, '').trim();
        }
      }
    }
  }

  const restoreRes = await testIndependentRemoteRestore({
    explicitKey: unlockedKey,
    remotePath: remoteSnapshot,
    stagingUrl: process.env.STAGING_DATABASE_URL
  });

  console.log('\n====================================================================');
  console.log('✓ CUSTÓDIA DE ESCROW OFF-HOST E RECUPERAÇÃO EM STAGING CONCLUÍDAS COM 100% DE SUCESSO');
  console.log('====================================================================');
  console.log('AVISO DE SEGURANÇA: Salve sua Master Passphrase no seu cofre de senhas');
  console.log('corporativo. O Antigravity e o ChatGPT NÃO conhecem nem guardam esta senha.');

  return {
    remoteSha: remoteFileObj.sha,
    createdAt: escrowPackage.createdAt,
    restoreRes
  };
}

if (require.main === module) {
  const isSynthetic = process.argv.includes('--test-synthetic');
  if (isSynthetic) {
    runSyntheticOffhostVerification()
      .then((res) => {
        console.log('SYNTHETIC_OFFHOST_TEST_PASSED');
        process.exit(0);
      })
      .catch((err) => {
        console.error('SYNTHETIC_OFFHOST_TEST_FAILED:', err.message);
        process.exit(1);
      });
  } else {
    runSecureOwnerSetup()
      .then((res) => {
        console.log('OWNER_OFFHOST_SETUP_SUCCESS');
        process.exit(0);
      })
      .catch((err) => {
        console.error('OWNER_SETUP_FAILED:', err.message);
        process.exit(1);
      });
  }
}

module.exports = {
  runSecureOwnerSetup,
  runSyntheticOffhostVerification
};
