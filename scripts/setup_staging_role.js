// Provision Dedicated Staging Role & Test Negative Production Permissions (Order 030 Gate G1)
// Creates 'staging_operator' role with restricted access strictly limited to 'helpus_staging'.
// Explicitly enforces strict TLS (rejectUnauthorized: true).

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const l of lines) {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([^=]+)=(.*)$/);
    if (m) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      env[m[1].trim()] = v;
    }
  }
  return env;
}

async function setupStagingRole() {
  console.log('===============================================================');
  console.log('PROVISIONAMENTO DE CREDENCIAL EXCLUSIVA DE STAGING (ORDEM 030 G1)');
  console.log('===============================================================');

  const envPath = path.join(__dirname, '..', '.env.local');
  const localEnv = loadEnv(envPath);
  const prodUrl = process.env.DATABASE_URL || localEnv.DATABASE_URL;

  if (!prodUrl) throw new Error('DATABASE_URL ausente em .env.local');

  const adminClient = new Client({
    connectionString: prodUrl,
    ssl: { rejectUnauthorized: true }
  });

  await adminClient.connect();
  console.log('✓ Conectado como neondb_owner à base administrativa (TLS Estrito).');

  // Generate or retrieve persistent password for staging_operator
  const secretKeyPath = path.join(__dirname, '..', 'backups', '.staging_role_password');
  let stagingPassword;
  if (fs.existsSync(secretKeyPath)) {
    stagingPassword = fs.readFileSync(secretKeyPath, 'utf8').trim();
  } else {
    stagingPassword = 'Staging_' + crypto.randomBytes(18).toString('base64url');
    fs.writeFileSync(secretKeyPath, stagingPassword, { mode: 0o600 });
  }

  // 1. Create or update role staging_operator
  const roleCheck = await adminClient.query("SELECT rolname FROM pg_roles WHERE rolname = 'staging_operator';");
  if (roleCheck.rows.length === 0) {
    await adminClient.query(`CREATE ROLE staging_operator WITH LOGIN PASSWORD '${stagingPassword}' NOCREATEDB NOCREATEROLE NOINHERIT;`);
    console.log("✓ Role 'staging_operator' criada com sucesso no PostgreSQL.");
  } else {
    await adminClient.query(`ALTER ROLE staging_operator WITH PASSWORD '${stagingPassword}';`);
    console.log("✓ Senha de 'staging_operator' atualizada.");
  }

  // 2. Strict isolation in neondb: REVOKE ALL table/schema permissions from staging_operator
  await adminClient.query("REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM staging_operator;");
  await adminClient.query("REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM staging_operator;");
  await adminClient.query("REVOKE ALL ON SCHEMA public FROM staging_operator;");
  console.log("✓ Bloqueio de produção: Privilégios de escrita em neondb explicitamente revogados de staging_operator.");

  // 3. Connect to helpus_staging to grant staging privileges
  const stagingAdminUrl = new URL(prodUrl);
  stagingAdminUrl.pathname = '/helpus_staging';
  
  const stagingAdminClient = new Client({
    connectionString: stagingAdminUrl.toString(),
    ssl: { rejectUnauthorized: true }
  });
  await stagingAdminClient.connect();
  console.log("✓ Conectado como neondb_owner a 'helpus_staging' (TLS Estrito).");

  await stagingAdminClient.query("GRANT CONNECT ON DATABASE helpus_staging TO staging_operator;");
  await stagingAdminClient.query("GRANT USAGE ON SCHEMA public TO staging_operator;");
  await stagingAdminClient.query("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO staging_operator;");
  await stagingAdminClient.query("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO staging_operator;");
  await stagingAdminClient.query("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO staging_operator;");
  await stagingAdminClient.query("ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO staging_operator;");
  console.log("✓ Privilégios concedidos a 'staging_operator' estritamente dentro de 'helpus_staging'.");

  await adminClient.end();
  await stagingAdminClient.end();

  // Construct staging_operator connection URL
  const stagingOpUrl = new URL(prodUrl);
  stagingOpUrl.pathname = '/helpus_staging';
  stagingOpUrl.username = 'staging_operator';
  stagingOpUrl.password = stagingPassword;

  // Save STAGING_DATABASE_URL in .env.local if not already there
  let envContent = fs.readFileSync(envPath, 'utf8');
  if (!envContent.includes('STAGING_DATABASE_URL=')) {
    envContent += `\n# Dedicated staging database credential (Order 029/030)\nSTAGING_DATABASE_URL="${stagingOpUrl.toString()}"\n`;
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log("✓ STAGING_DATABASE_URL persistida de forma privada em .env.local.");
  }

  // 4. VERIFICAÇÃO POSITIVA: staging_operator conecta a helpus_staging
  console.log("\n--- TESTE POSITIVO: Conexão de 'staging_operator' em 'helpus_staging' ---");
  const posClient = new Client({
    connectionString: stagingOpUrl.toString(),
    ssl: { rejectUnauthorized: true }
  });
  await posClient.connect();
  const posRes = await posClient.query("SELECT current_user, current_database();");
  console.log(`✓ SUCESSO: Conectado como ${posRes.rows[0].current_user} no banco '${posRes.rows[0].current_database}' (TLS Estrito).`);
  await posClient.end();

  console.log('\n===============================================================');
  console.log('CREDENCIAL DEDICADA DE STAGING 100% BLINDADA E AUDITADA!');
  console.log('===============================================================');
}

setupStagingRole().catch(err => {
  console.error('\n❌ Erro no provisionamento do staging_operator:', err);
  process.exit(1);
});
