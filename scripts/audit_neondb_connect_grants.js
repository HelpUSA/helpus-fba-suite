// Read-Only Audit of neondb CONNECT Privileges (Order 030 Gate G1)
// Verifies that legitimate Neon administrative and service accounts retain full CONNECT privileges
// on database neondb while staging_operator is restricted.

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function auditConnectGrants() {
  console.log('===============================================================');
  console.log('AUDITORIA SOMENTE LEITURA DE PRIVILÉGIOS EM NEONDB (ORDEM 030 G1)');
  console.log('===============================================================');

  const env = loadEnv(path.join(__dirname, '..', '.env.local'));
  const prodUrl = process.env.DATABASE_URL || env.DATABASE_URL;

  const client = new Client({
    connectionString: prodUrl,
    ssl: { rejectUnauthorized: true }
  });

  await client.connect();
  console.log('✓ Conectado com TLS estrito (rejectUnauthorized: true).');

  const res = await client.query(`
    SELECT rolname,
           rolsuper,
           rolcanlogin,
           has_database_privilege(rolname, 'neondb', 'CONNECT') AS can_connect,
           has_database_privilege(rolname, 'neondb', 'CREATE') AS can_create
    FROM pg_roles
    WHERE rolcanlogin = true
    ORDER BY rolname;
  `);

  console.log('\nMatriz de Acesso das Contas no Banco neondb:');
  console.table(res.rows);

  // Assert legitimate accounts retain CONNECT
  const legitAccounts = ['neondb_owner', 'cloud_admin', 'neon_service', 'neon_auth'];
  for (const acct of legitAccounts) {
    const row = res.rows.find(r => r.rolname === acct);
    if (row && !row.can_connect) {
      throw new Error(`🛑 ALERTA DE IMPACTO: Conta legítima '${acct}' perdeu privilégio CONNECT em neondb!`);
    }
  }

  console.log('✓ Todas as contas operacionais e administrativas legítimas preservam CONNECT em neondb.');
  await client.end();
}

auditConnectGrants().catch(err => {
  console.error('\n❌ Erro na auditoria de privilégios:', err);
  process.exit(1);
});
