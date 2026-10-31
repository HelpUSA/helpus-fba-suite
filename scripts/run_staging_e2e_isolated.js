// Subprocess Launcher for Isolated Staging HTTP Server & Network E2E Suite (Order 029 Priority 2)
// Boots real Next.js HTTP server on port 3099 in production mode with staging_operator credentials.
// Executes network HTTP requests over TCP loopback and guarantees clean server termination.

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
  console.log('SUBPROCESSO ISOLADO DE SERVIDOR NEXT.JS EM STAGING (ORDEM 029)');
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

  // Generate dynamic one-time authentication token
  const dynamicSecret = crypto.randomBytes(32).toString('hex');
  const serverPort = 3099;

  console.log('✓ Configuração de isolamento do servidor HTTP:');
  console.log(`  - Target DB: /helpus_staging (Usuário: staging_operator)`);
  console.log(`  - Porta TCP: ${serverPort}`);
  console.log(`  - Token Dinâmico Gerado: ${dynamicSecret.slice(0, 8)}... (32 bytes entropia)`);
  console.log(`  - Credenciais de produção: Omitidas do ambiente do servidor`);

  // Environment for Next.js HTTP server
  const serverEnv = {
    ...process.env,
    DATABASE_URL: stagingOpUrl,
    POSTGRES_URL: stagingOpUrl,
    HELPUS_API_SECRET: dynamicSecret,
    HELPUS_OPERATOR_TOKEN: dynamicSecret,
    PORT: String(serverPort),
    NODE_ENV: 'production',
  };

  const nextCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  console.log('\nIniciando servidor Next.js em produção na porta 3099...');
  const serverProcess = spawn(nextCmd, ['next', 'start', '-p', String(serverPort)], {
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

  let serverClosed = false;
  serverProcess.on('exit', (code) => {
    serverClosed = true;
  });

  try {
    console.log('Aguardando inicialização do servidor HTTP...');
    await waitForServer(`http://127.0.0.1:${serverPort}/api/inventory`);
    console.log(`✓ Servidor Next.js ONLINE e respondendo em http://127.0.0.1:${serverPort}!`);

    // Run Network HTTP E2E tests
    console.log('\nDisparando suíte de testes de rede HTTP...');
    const testEnv = {
      ...process.env,
      STAGING_SERVER_PORT: String(serverPort),
      DATABASE_URL: stagingOpUrl,
      HELPUS_API_SECRET: dynamicSecret,
      PROD_DATABASE_URL: prodUrl,
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
