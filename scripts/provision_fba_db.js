// Credentials must be provided at runtime, never committed to source control.
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function provisionDatabase() {
  const rootClient = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await rootClient.connect();
  
  const checkDb = await rootClient.query("SELECT 1 FROM pg_database WHERE datname = 'helpus_fba_suite'");
  if (checkDb.rows.length === 0) {
    console.log("Creating database 'helpus_fba_suite'...");
    await rootClient.query('CREATE DATABASE helpus_fba_suite');
    console.log("Database 'helpus_fba_suite' created successfully.");
  } else {
    console.log("Database 'helpus_fba_suite' already exists.");
  }
  await rootClient.end();

  // Now connect to helpus_fba_suite and apply schema.sql
  const fbaClient = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await fbaClient.connect();
  console.log("Connected to 'helpus_fba_suite'. Applying schema.sql...");
  
  const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  await fbaClient.query(schemaSql);
  console.log("Schema applied successfully!");

  // Verify tables
  const tablesRes = await fbaClient.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log("Provisioned tables:", tablesRes.rows.map(r => r.table_name));

  await fbaClient.end();
}

provisionDatabase().catch(err => {
  console.error("Provisioning failed:", err);
  process.exit(1);
});
