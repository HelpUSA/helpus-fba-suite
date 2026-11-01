// Credentials must be provided at runtime, never committed to source control.
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function provisionDatabase() {
  const connectionString = process.env.DATABASE_URL;
  const isSsl = !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');

  const fbaClient = new Client({
    connectionString,
    ssl: isSsl ? { rejectUnauthorized: true } : false
  });
  await fbaClient.connect();
  console.log("Connected to PostgreSQL cloud database (Strict TLS: rejectUnauthorized=true). Applying schema.sql...");
  
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
