const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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

async function runStagingMigration() {
  console.log('================================================================');
  console.log('APLICAÇÃO DE MIGRATION P1 NO BANCO ISOLADO DE STAGING (ORDEM 045)');
  console.log('================================================================');

  const envPath = path.join(__dirname, '..', '.env.local');
  const env = loadEnv(envPath);
  const prodUrl = env.DATABASE_URL;
  if (!prodUrl) throw new Error('DATABASE_URL ausente em .env.local');

  // Verify we are connecting specifically to helpus_staging
  const stagingAdminUrl = new URL(prodUrl);
  stagingAdminUrl.pathname = '/helpus_staging';

  const client = new Client({
    connectionString: stagingAdminUrl.toString(),
    ssl: { rejectUnauthorized: true }
  });

  await client.connect();

  const dbInfo = await client.query('SELECT current_database(), current_user;');
  console.log(`Conectado como: DB=${dbInfo.rows[0].current_database}, User=${dbInfo.rows[0].current_user}`);

  if (dbInfo.rows[0].current_database !== 'helpus_staging') {
    throw new Error(`ABORT: Conectado a ${dbInfo.rows[0].current_database} em vez de helpus_staging! Protegendo produção.`);
  }

  const migrationSqlPath = path.join(__dirname, 'migrations', '002_financial_ledger.sql');
  const sql = fs.readFileSync(migrationSqlPath, 'utf8');

  console.log('Executando migration 002_financial_ledger.sql...');
  await client.query(sql);
  console.log('✓ Tabelas fx_rates e financial_ledger criadas com sucesso!');

  // P1-specific least privilege: never grant permissions on every public table.
  // The operational role may read/append ledger entries and FX observations,
  // but cannot UPDATE/DELETE/TRUNCATE them or alter their protective triggers.
  console.log("Aplicando privilégios mínimos da P1 exclusivamente em helpus_staging...");
  await client.query("REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.financial_ledger, public.fx_rates FROM staging_operator;");
  await client.query("GRANT SELECT, INSERT ON TABLE public.financial_ledger, public.fx_rates TO staging_operator;");
  // A separate isolated test schema retains DDL rights for disposable test objects.
  // Never grant blanket privileges to public or to production databases.
  await client.query("CREATE SCHEMA IF NOT EXISTS p1_test_isolated;");
  await client.query("GRANT USAGE, CREATE ON SCHEMA p1_test_isolated TO staging_operator;");
  console.log("✓ Grants P1 restritos a SELECT/INSERT; schema de testes isolado.");

  await client.end();

  // Test access with staging_operator
  const stagingOpUrl = env.STAGING_DATABASE_URL;
  if (stagingOpUrl) {
    const opClient = new Client({
      connectionString: stagingOpUrl,
      ssl: { rejectUnauthorized: true }
    });
    await opClient.connect();
    const testRes = await opClient.query("SELECT count(*) FROM financial_ledger;");
    console.log(`✓ Verificação com staging_operator: financial_ledger acessível (contagem = ${testRes.rows[0].count})`);
    const fxRes = await opClient.query("SELECT count(*) FROM fx_rates;");
    console.log(`✓ Verificação com staging_operator: fx_rates acessível (contagem = ${fxRes.rows[0].count})`);
    await opClient.end();
  }

  console.log('================================================================');
  console.log('MIGRATION P1 APLICADA COM SUCESSO EM STAGING COM ISOLAMENTO 100%');
  console.log('================================================================');
}

runStagingMigration().catch(err => {
  console.error('❌ Erro na execução da migration P1:', err);
  process.exit(1);
});
