if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { Client } = require('pg');

async function readOnlyAudit() {
  const isSsl = !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: isSsl ? { rejectUnauthorized: true } : false
  });
  await client.connect();

  console.log("=== AUDITORIA SOMENTE LEITURA DO NEON CLOUD (ORDEM 023) ===");

  // 1. Balances
  const balances = await client.query(`
    SELECT b.product_sku, p.title, b.warehouse_code, b.quantity, b.updated_at
    FROM inventory_balances b
    LEFT JOIN products p ON b.product_sku = p.sku
    ORDER BY b.product_sku, b.warehouse_code;
  `);
  console.log("\n--- SALDOS DE ESTOQUE ATUAIS (inventory_balances) ---");
  console.table(balances.rows);

  // 2. Stock Movements Ledger
  const movements = await client.query(`
    SELECT id, timestamp, sku, product_title, movement_type, from_warehouse, to_warehouse, quantity, document_ref
    FROM stock_movements
    ORDER BY timestamp DESC;
  `);
  console.log("\n--- MOVIMENTAÇÕES DE ESTOQUE (stock_movements) ---");
  console.log(`Total de movimentações no ledger: ${movements.rows.length}`);
  if (movements.rows.length > 0) {
    console.table(movements.rows);
  } else {
    console.log("Zero movimentações fictícias registradas no ledger de auditoria.");
  }

  // 3. Invoices
  const invoices = await client.query(`
    SELECT id, tipo, numero, fornecedor_nome, valor_total, moeda, status, itens_count
    FROM invoices
    ORDER BY data_emissao DESC;
  `);
  console.log("\n--- NOTAS FISCAIS / INVOICES (invoices) ---");
  console.log(`Total de invoices: ${invoices.rows.length}`);
  if (invoices.rows.length > 0) {
    console.table(invoices.rows);
  }

  // 4. Products Catalog
  const products = await client.query(`
    SELECT sku, title, marketplace, currency, unit_cost, sale_price
    FROM products
    ORDER BY sku;
  `);
  console.log("\n--- CATÁLOGO DE PRODUTOS (products) ---");
  console.table(products.rows);

  await client.end();
}

readOnlyAudit().catch(err => {
  console.error("Read-only audit failed:", err);
  process.exit(1);
});
