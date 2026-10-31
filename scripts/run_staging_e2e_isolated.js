// Subprocess Launcher for Isolated Staging E2E Tests (Order 028 Point 1 & 2)
// Initializes the isolated staging environment in a dedicated child process before any module or handler is loaded.
// Generates dynamic random tokens (zero hardcoded secrets) and strictly isolates staging from production.

const { spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

async function main() {
  console.log('===============================================================');
  console.log('SUBPROCESSO ISOLADO DE TESTES E2E EM STAGING (ORDEM 028)');
  console.log('===============================================================');

  const rootDir = path.join(__dirname, '..');
  const localEnv = loadEnvFile(path.join(rootDir, '.env.local'));
  const prodUrl = process.env.DATABASE_URL || localEnv.DATABASE_URL || process.env.POSTGRES_URL || localEnv.POSTGRES_URL;

  if (!prodUrl) {
    console.error('🛑 BLOQUEIO: DATABASE_URL ou POSTGRES_URL não encontrado.');
    process.exit(1);
  }

  // Derive isolated staging URL (switching pathname to /helpus_staging)
  const parsed = new URL(prodUrl);
  parsed.pathname = '/helpus_staging';
  const stagingUrl = parsed.toString();

  // Generate dynamic, single-use authentication secret (no hardcoded credentials)
  const dynamicSecret = crypto.randomBytes(32).toString('hex');

  console.log(`✓ Ambiente isolado preparado para subprocesso:`);
  console.log(`  - Target DB: helpus_staging`);
  console.log(`  - Subprocess Token Dinâmico Gerado: ${dynamicSecret.slice(0, 8)}... (32 bytes entropia)`);
  console.log(`  - Carregamento de módulos: estritamente após injeção das variáveis`);

  const childEnv = {
    ...process.env,
    ...localEnv,
    DATABASE_URL: stagingUrl,
    POSTGRES_URL: stagingUrl,
    TEST_DATABASE_URL: stagingUrl,
    PROD_DATABASE_URL: prodUrl,
    HELPUS_API_SECRET: dynamicSecret,
    HELPUS_OPERATOR_TOKEN: dynamicSecret,
    NODE_ENV: 'test',
  };

  const tsxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(tsxCmd, ['tsx', 'scripts/authenticated_e2e_staging_test.ts'], {
    cwd: rootDir,
    env: childEnv,
    stdio: 'inherit',
    shell: true,
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log('\n✓ Subprocesso de testes E2E isolados concluído com SUCESSO (exit code 0).');
      process.exit(0);
    } else {
      console.error(`\n❌ Subprocesso falhou com exit code ${code}.`);
      process.exit(code || 1);
    }
  });

  child.on('error', (err) => {
    console.error('❌ Falha ao disparar subprocesso:', err);
    process.exit(1);
  });
}

main();
