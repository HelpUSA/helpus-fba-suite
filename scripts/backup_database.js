if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function backupDatabase() {
  const isSsl = !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: isSsl ? { rejectUnauthorized: true } : false
  });
  await client.connect();

  console.log("=== BACKUP & SNAPSHOT DO BANCO NEON CLOUD (ORDEM 024) ===");

  const tables = ['warehouses', 'products', 'inventory_balances', 'stock_movements', 'invoices', 'invoice_items', 'sale_orders', 'returns'];
  const snapshot = {
    timestamp: new Date().toISOString(),
    engine: 'PostgreSQL 18.6 Neon Cloud',
    tables: {}
  };

  for (const table of tables) {
    const res = await client.query(`SELECT * FROM ${table} ORDER BY 1 ASC;`);
    snapshot.tables[table] = res.rows;
    console.log(`✓ Tabela '${table}': ${res.rows.length} registros exportados.`);
  }

  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const filename = `backup_neon_prod_${Date.now()}.json`;
  const filepath = path.join(backupDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');

  console.log(`\nSnapshot exportado com sucesso em: ${filepath}`);
  await client.end();
}

backupDatabase().catch(err => {
  console.error("Backup failed:", err);
  process.exit(1);
});
