if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function provisionStaging() {
  const isSsl = !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');

  // Step 1: Connect to server to ensure helpus_staging database exists
  const adminClient = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: isSsl ? { rejectUnauthorized: true } : false
  });
  await adminClient.connect();

  console.log("=== PROVISIONAMENTO DO BANCO DE STAGING ISOLADO (ORDEM 026) ===");
  const dbsRes = await adminClient.query("SELECT datname FROM pg_database WHERE datname = 'helpus_staging';");
  if (dbsRes.rows.length === 0) {
    console.log("Criando banco de dados 'helpus_staging' no Neon Cloud...");
    await adminClient.query('CREATE DATABASE helpus_staging;');
    console.log("✓ Banco 'helpus_staging' criado com sucesso!");
  } else {
    console.log("✓ Banco 'helpus_staging' já existe no Neon Cloud.");
  }
  await adminClient.end();

  // Step 2: Construct Staging Database URL by replacing database path
  const parsedUrl = new URL(process.env.DATABASE_URL);
  parsedUrl.pathname = '/helpus_staging';
  const stagingUrl = parsedUrl.toString();

  // Step 3: Connect to helpus_staging
  const stagingClient = new Client({
    connectionString: stagingUrl,
    ssl: isSsl ? { rejectUnauthorized: true } : false
  });
  await stagingClient.connect();
  console.log("Conectado ao banco 'helpus_staging' com TLS estrito!");

  // Step 4: Apply persistent staging marker (Order 026 Prioridade 2)
  await stagingClient.query(`
    CREATE TABLE IF NOT EXISTS staging_metadata (
      key VARCHAR(50) PRIMARY KEY,
      value TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await stagingClient.query(`
    INSERT INTO staging_metadata (key, value)
    VALUES ('environment', 'staging'), ('isolation_verified', 'true'), ('owner', 'HelpUS Staging Isolated')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
  `);
  console.log("✓ Marcador persistente de ambiente 'staging' gravado com sucesso.");

  // Step 5: Apply schema.sql
  const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await stagingClient.query(schemaSql);
  console.log("✓ Schema relacional aplicado com sucesso em helpus_staging!");

  // Verify tables
  const tables = await stagingClient.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' ORDER BY table_name;
  `);
  console.log("Tabelas provisionadas em staging:", tables.rows.map(r => r.table_name).join(', '));

  await stagingClient.end();
  console.log("\nSTAGING_DATABASE_URL pronta para testes:");
  console.log(stagingUrl.replace(/:[^:@]+@/, ':***@'));
}

provisionStaging().catch(err => {
  console.error("Erro no provisionamento de staging:", err);
  process.exit(1);
});
