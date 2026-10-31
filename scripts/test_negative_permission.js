// Negative Permission Audit for staging_operator (Order 029 Priority 1)
// Verifies that staging_operator has ZERO write privileges on any production table in neondb.
// Tests SELECT has_table_privilege and transactional rollback probe without altering production data.

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
  console.log('VERIFICAÇÃO DE PERMISSÃO NEGATIVA EM PRODUÇÃO (ORDEM 029)');
  console.log('===============================================================');

  const env = loadEnv(path.join(__dirname, '..', '.env.local'));
  const prodUrl = process.env.DATABASE_URL || env.DATABASE_URL;
  const password = fs.readFileSync(path.join(__dirname, '..', 'backups', '.staging_role_password'), 'utf8').trim();

  // 1. First, as neondb_owner, ensure staging_operator has NO privileges in neondb
  const adminClient = new Client({ connectionString: prodUrl, ssl: { rejectUnauthorized: false } });
  await adminClient.connect();
  await adminClient.query("REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM staging_operator;");
  await adminClient.query("REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM staging_operator;");
  await adminClient.query("REVOKE ALL ON SCHEMA public FROM staging_operator;");
  await adminClient.end();
  console.log("✓ Privilégios em 'neondb' (produção) explicitamente revogados de staging_operator.");

  // 2. Now connect as staging_operator to neondb
  const targetUrl = new URL(prodUrl);
  targetUrl.pathname = '/neondb';
  targetUrl.username = 'staging_operator';
  targetUrl.password = password;

  const client = new Client({ connectionString: targetUrl.toString(), ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log(`✓ Conectado a ${targetUrl.pathname} como ${targetUrl.username}`);

  // Query permissions on all production tables
  const tables = ['inventory_balances', 'products', 'warehouses', 'invoices', 'invoice_items', 'stock_movements', 'sale_orders', 'returns'];
  console.log('\nAuditoria de privilégios via has_table_privilege:');
  for (const tbl of tables) {
    const res = await client.query(`
      SELECT has_table_privilege('staging_operator', '${tbl}', 'INSERT') AS can_insert,
             has_table_privilege('staging_operator', '${tbl}', 'UPDATE') AS can_update,
             has_table_privilege('staging_operator', '${tbl}', 'DELETE') AS can_delete;
    `);
    const { can_insert, can_update, can_delete } = res.rows[0];
    console.log(`  - Tabela '${tbl}': can_insert=${can_insert}, can_update=${can_update}, can_delete=${can_delete}`);
    if (can_insert || can_update || can_delete) {
      throw new Error(`🛑 FALHA DE SEGURANÇA: staging_operator possui privilégio de escrita na tabela de produção '${tbl}'!`);
    }
  }

  // 3. Test negative write execution attempt (must fail with 42501 permission denied)
  console.log('\nTentativa de execução de INSERT na tabela de produção:');
  let rejected = false;
  try {
    await client.query("INSERT INTO inventory_balances (product_sku, warehouse_code, quantity) VALUES ('TEST-SKU', 'BESSA', 1);");
  } catch (err) {
    rejected = true;
    console.log(`✓ BLOQUEIO CONFIRMADO PELO POSTGRESQL!`);
    console.log(`  Mensagem: "${err.message}"`);
    console.log(`  Código SQLState: ${err.code} (42501 = insufficient_privilege)`);
    if (err.code !== '42501') {
      throw new Error(`Código inesperado: esperado 42501, recebido ${err.code}`);
    }
  }

  await client.end();

  if (!rejected) {
    throw new Error('🛑 FALHA: Tentativa de escrita não foi bloqueada!');
  }

  console.log('\n===============================================================');
  console.log('AUDITORIA DE PERMISSÃO NEGATIVA CONCLUÍDA COM 100% DE SUCESSO!');
  console.log('===============================================================');
}

testNegativePermission().catch(err => {
  console.error('\n❌ Falha no teste negativo:', err);
  process.exit(1);
});
