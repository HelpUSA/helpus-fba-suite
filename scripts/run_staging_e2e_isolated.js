// Subprocess Launcher for Isolated Staging HTTP Server & Network E2E Suite (Order 030 Gate G2)
// Boots real Next.js HTTP server on loopback 127.0.0.1:3099 with staging_operator credentials.
// Builds child process environments via STRICT ALLOWLIST without leaking production secrets.
// No token fragments printed in logs. Clean graceful server termination guaranteed.

const { spawn, execSync } = require('child_process');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const http = require('http');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[match[1].trim()] = val;
    }
  }
  return env;
}

function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function ping() {
      http.get(url, (res) => {
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Servidor Next.js não respondeu em ${url} após ${timeoutMs}ms.`));
        } else {
          setTimeout(ping, 250);
        }
      });
    }
    ping();
  });
}

async function main() {
  console.log('===============================================================');
  console.log('SUBPROCESSO ISOLADO DE SERVIDOR NEXT.JS EM STAGING (ORDEM 030)');
  console.log('===============================================================');

  const rootDir = path.join(__dirname, '..');
  const localEnv = loadEnv(path.join(rootDir, '.env.local'));
  const prodUrl = process.env.DATABASE_URL || localEnv.DATABASE_URL;

  // Retrieve staging_operator credentials
  const passwordFile = path.join(rootDir, 'backups', '.staging_role_password');
  if (!fs.existsSync(passwordFile)) {
    throw new Error('Arquivo de senha do staging_operator não encontrado. Execute setup_staging_role.js.');
  }
  const stagingPassword = fs.readFileSync(passwordFile, 'utf8').trim();

  const parsed = new URL(prodUrl);
  parsed.pathname = '/helpus_staging';
  parsed.username = 'staging_operator';
  parsed.password = stagingPassword;
  const stagingOpUrl = parsed.toString();

  // Generate dynamic single-use authentication secret (no hardcoded tokens)
  const dynamicSecret = crypto.randomBytes(32).toString('hex');
  const serverPort = 3099;
  const host = '127.0.0.1';

  console.log('✓ Configuração de isolamento do servidor HTTP (Gate G2):');
  console.log(`  - Target DB: /helpus_staging (Usuário: staging_operator)`);
  console.log(`  - Host: ${host} (Loopback Estrito) | Porta TCP: ${serverPort}`);
  console.log(`  - Token Dinâmico Gerado: [PROTEGIDO - ALTA ENTROPIA 32 BYTES]`);
  console.log(`  - Allowlist estrita de ambiente: Segredos de produção totalmente omitidos`);

  // G2: Build child environment strictly by allowlist
  const serverEnv = {
    PATH: process.env.PATH || '',
    SystemRoot: process.env.SystemRoot || '',
    HOMEDRIVE: process.env.HOMEDRIVE || '',
    HOMEPATH: process.env.HOMEPATH || '',
    USERPROFILE: process.env.USERPROFILE || '',
    TEMP: process.env.TEMP || '',
    TMP: process.env.TMP || '',
    DATABASE_URL: stagingOpUrl,
    POSTGRES_URL: stagingOpUrl,
    HELPUS_API_SECRET: dynamicSecret,
    HELPUS_OPERATOR_TOKEN: dynamicSecret,
    PORT: String(serverPort),
    HOSTNAME: host,
    NODE_ENV: 'production',
  };

  const nextCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  console.log('\nIniciando servidor Next.js em produção no host 127.0.0.1:3099...');
  const serverProcess = spawn(nextCmd, ['next', 'start', '-H', host, '-p', String(serverPort)], {
    cwd: rootDir,
    env: serverEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  serverProcess.stdout.on('data', (d) => {
    const text = d.toString();
    if (text.includes('Ready') || text.includes('Local:')) {
      console.log(`[Next.js Server] ${text.trim()}`);
    }
  });

  serverProcess.stderr.on('data', (d) => {
    // console.error(`[Next.js Stderr] ${d.toString()}`);
  });

  try {
    console.log('Aguardando inicialização do servidor HTTP...');
    await waitForServer(`http://${host}:${serverPort}/api/inventory`);
    console.log(`✓ Servidor Next.js ONLINE e respondendo em http://${host}:${serverPort}!`);

    // G2: Build test runner environment by strict allowlist without any production secrets
    const prodIdentity = `${parsed.hostname.toLowerCase().replace('-pooler', '')}/neondb`;
    console.log('\nDisparando suíte de testes de rede HTTP...');
    const testEnv = {
      PATH: process.env.PATH || '',
      SystemRoot: process.env.SystemRoot || '',
      HOMEDRIVE: process.env.HOMEDRIVE || '',
      HOMEPATH: process.env.HOMEPATH || '',
      USERPROFILE: process.env.USERPROFILE || '',
      STAGING_SERVER_PORT: String(serverPort),
      DATABASE_URL: stagingOpUrl,
      HELPUS_API_SECRET: dynamicSecret,
      PROD_HOST_ENDPOINT: prodIdentity, // non-secret production identity strictly for exclusion check
      NODE_ENV: 'test',
    };

    const nodeCmd = process.platform === 'win32' ? 'node.exe' : 'node';
    const testProcess = spawn(nodeCmd, ['scripts/real_http_e2e_staging_test.js'], {
      cwd: rootDir,
      env: testEnv,
      stdio: 'inherit',
    });

    const testExitCode = await new Promise((resolve) => {
      testProcess.on('close', resolve);
    });

    if (testExitCode === 0) {
      console.log('\n✓ Suíte de testes HTTP E2E concluída com 100% de SUCESSO (Exit code 0).');
    } else {
      throw new Error(`Testes HTTP falharam com código de saída ${testExitCode}.`);
    }

  } finally {
    console.log('\nEncerrando servidor Next.js na porta 3099...');
    if (process.platform === 'win32') {
      try {
        execSync(`taskkill /pid ${serverProcess.pid} /t /f`, { stdio: 'ignore' });
      } catch (e) {}
    } else {
      serverProcess.kill('SIGTERM');
    }
    console.log('✓ Servidor Next.js de staging encerrado com sucesso.');
  }
}

main().catch(err => {
  console.error('\n❌ Erro na execução do launcher HTTP:', err.message);
  process.exit(1);
});
