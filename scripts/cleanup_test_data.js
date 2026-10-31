if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { Client } = require('pg');

async function cleanup() {
  const isSsl = !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: isSsl ? { rejectUnauthorized: false } : false
  });
  await client.connect();
  await client.query("UPDATE inventory_balances SET quantity = 0, updated_at = NOW() WHERE product_sku = 'NAT-RESV-60CAPS' AND warehouse_code = 'WH-BR-LOCAL-JPA';");
  await client.query("DELETE FROM invoices WHERE numero = 'TEST-INV-US-001';");
  console.log("Cleaned up test artifact rows. Clean context preserved.");
  await client.end();
}

cleanup().catch(console.error);
