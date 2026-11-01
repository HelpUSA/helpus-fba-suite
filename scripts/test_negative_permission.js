// Read-Only Negative Permission Audit for staging_operator (Order 030 Gate G1)
// Audits permissions strictly via read-only introspection (has_table_privilege, has_schema_privilege).
// ZERO mutative queries or test INSERTs are executed against the production database.
// Strict TLS enforced (rejectUnauthorized: true).

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

async function testNegativePermission() {
  console.log('===============================================================');
  console.log('AUDITORIA DE PERMISSÃO NEGATIVA SOMENTE LEITURA (ORDEM 030 G1)');
  console.log('===============================================================');

  const env = loadEnv(path.join(__dirname, '..', '.env.local'));
  const prodUrl = process.env.DATABASE_URL || env.DATABASE_URL;
  const passwordFile = path.join(__dirname, '..', 'backups', '.staging_role_password');
  const password = fs.readFileSync(passwordFile, 'utf8').trim();

  // 1. Audit production permissions as staging_operator with strict TLS
  const targetUrl = new URL(prodUrl);
  targetUrl.pathname = '/neondb';
  targetUrl.username = 'staging_operator';
  targetUrl.password = password;

  const client = new Client({
    connectionString: targetUrl.toString(),
    ssl: { rejectUnauthorized: true }
  });

  await client.connect();
  console.log(`✓ Conectado a ${targetUrl.pathname} como ${targetUrl.username} (TLS Estrito: rejectUnauthorized=true)`);

  // Introspect privileges across all production tables
  const tables = ['inventory_balances', 'products', 'warehouses', 'invoices', 'invoice_items', 'stock_movements', 'sale_orders', 'returns'];
  console.log('\nAuditoria estrita de privilégios (has_table_privilege em neondb):');
  for (const tbl of tables) {
    const res = await client.query(`
      SELECT has_table_privilege('staging_operator', '${tbl}', 'INSERT') AS can_insert,
             has_table_privilege('staging_operator', '${tbl}', 'UPDATE') AS can_update,
             has_table_privilege('staging_operator', '${tbl}', 'DELETE') AS can_delete;
    `);
    const { can_insert, can_update, can_delete } = res.rows[0];
    console.log(`  - Tabela '${tbl.padEnd(20)}': INSERT=${can_insert}, UPDATE=${can_update}, DELETE=${can_delete}`);
    if (can_insert || can_update || can_delete) {
      throw new Error(`🛑 FALHA DE SEGURANÇA: staging_operator possui privilégio de escrita na tabela de produção '${tbl}'!`);
    }
  }

  // Introspect schema & database privileges
  const metaRes = await client.query(`
    SELECT has_schema_privilege('staging_operator', 'public', 'CREATE') AS can_create_in_schema,
           has_database_privilege('staging_operator', 'neondb', 'CREATE') AS can_create_in_db;
  `);
  console.log('\nAuditoria de privilégios estruturais em neondb:');
  console.log(`  - Criar tabelas no schema public: ${metaRes.rows[0].can_create_in_schema}`);
  console.log(`  - Criar schemas no banco neondb: ${metaRes.rows[0].can_create_in_db}`);

  if (metaRes.rows[0].can_create_in_schema || metaRes.rows[0].can_create_in_db) {
    throw new Error('🛑 FALHA DE SEGURANÇA: staging_operator possui privilégios de criação em neondb!');
  }

  await client.end();

  // 2. Introspect staging permissions to confirm full isolation
  const stagingUrl = new URL(prodUrl);
  stagingUrl.pathname = '/helpus_staging';
  stagingUrl.username = 'staging_operator';
  stagingUrl.password = password;

  const stagingClient = new Client({
    connectionString: stagingUrl.toString(),
    ssl: { rejectUnauthorized: true }
  });
  await stagingClient.connect();

  const stagingPermRes = await stagingClient.query(`
    SELECT has_table_privilege('staging_operator', 'inventory_balances', 'INSERT') AS can_insert,
           has_table_privilege('staging_operator', 'inventory_balances', 'SELECT') AS can_select;
  `);
  console.log('\nAuditoria de privilégios na base autorizada helpus_staging:');
  console.log(`  - Tabela 'inventory_balances': INSERT=${stagingPermRes.rows[0].can_insert}, SELECT=${stagingPermRes.rows[0].can_select}`);

  if (!stagingPermRes.rows[0].can_insert || !stagingPermRes.rows[0].can_select) {
    throw new Error('🛑 FALHA: staging_operator deve possuir acesso em helpus_staging!');
  }

  await stagingClient.end();

  console.log('\n===============================================================');
  console.log('✓ AUDITORIA SOMENTE LEITURA CONCLUÍDA: staging_operator 100% ISOLADO');
  console.log('  ZERO privilégios de escrita em produção e ZERO testes de INSERT.');
  console.log('===============================================================');
}

testNegativePermission().catch(err => {
  console.error('\n❌ Falha no teste negativo:', err);
  process.exit(1);
});
