if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
const { Client } = require('pg');

const products = [
  {
    sku: 'HU-SIL-CABLE-FBA-2026',
    asin: 'B0HLTXWCV7',
    title: 'HelpUS Reusable Silicone Cable Ties 20 Pack Cord Management Straps',
    marketplace: 'Amazon US',
    currency: 'USD',
    unitCost: 1.25,
    salePrice: 9.99,
    imageUrl: '/images/products/silicone-cable-ties-main.jpg',
    supplierName: 'Teshuai Silicone / Shandsome',
    reorderPoint: 20,
    balances: { 'WH-USA-FBA-RYY2': 50 }
  },
  {
    sku: 'NAT-RESV-60CAPS',
    ncm: '21069030',
    title: 'Resveratrol Softgel 60 Cápsulas - Nativos do Brasil',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    unitCost: 25.76,
    salePrice: 79.90,
    imageUrl: '/images/products/nat-resv-60caps.png',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    reorderPoint: 3,
    balances: { 'WH-BR-TRANSIT-BRASPRESS': 5 }
  },
  {
    sku: 'NAT-MAG-TREON-60C',
    ncm: '21069030',
    title: 'Magnésio L-Treonato 60 Cápsulas - Nativos do Brasil',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    unitCost: 15.80,
    salePrice: 59.90,
    imageUrl: '/images/products/nat-mag-treon-60c.png',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    reorderPoint: 3,
    balances: { 'WH-BR-TRANSIT-BRASPRESS': 5 }
  },
  {
    sku: 'NAT-COQ10-VITE-60C',
    ncm: '21069030',
    title: 'Co-Q10 com Vitamina E 60 Cápsulas - Nativos do Brasil',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    unitCost: 21.26,
    salePrice: 69.90,
    imageUrl: '/images/products/nat-coq10-vite-60c.png',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    reorderPoint: 3,
    balances: { 'WH-BR-TRANSIT-BRASPRESS': 5 }
  },
  {
    sku: 'NAT-COLAG-VITC-60C',
    ncm: '21069030',
    title: 'Colágeno Hidrolisado com Vit C 60 Cápsulas - Nativos do Brasil',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    unitCost: 17.93,
    salePrice: 54.90,
    imageUrl: '/images/products/nat-colageno-hidro-60c.png',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    reorderPoint: 3,
    balances: { 'WH-BR-TRANSIT-BRASPRESS': 5 }
  },
  {
    sku: 'NAT-6MAG-60C',
    ncm: '21069030',
    title: '6 Magnésios Quelato & Complex 60 Cápsulas - Nativos do Brasil',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    unitCost: 18.41,
    salePrice: 59.90,
    imageUrl: '/images/products/nat-6mag-60caps.png',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    reorderPoint: 3,
    balances: { 'WH-BR-TRANSIT-BRASPRESS': 5 }
  },
  {
    sku: 'NAT-NAC-60C',
    ncm: '21069030',
    title: 'NAC Acetilcisteína 60 Cápsulas - Nativos do Brasil',
    marketplace: 'Amazon BR',
    currency: 'BRL',
    unitCost: 17.57,
    salePrice: 54.90,
    imageUrl: '/images/products/nat-nac-60caps.png',
    supplierName: 'Nativos do Brasil Produtos Naturais',
    reorderPoint: 3,
    balances: { 'WH-BR-TRANSIT-BRASPRESS': 5 }
  }
];

async function seed() {
  const isSsl = !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: isSsl ? { rejectUnauthorized: false } : false
  });
  await client.connect();
  console.log("Connected to Neon PostgreSQL for initial catalog seed...");

  for (const p of products) {
    await client.query(`
      INSERT INTO products (sku, asin, ncm, title, marketplace, currency, unit_cost, sale_price, image_url, supplier_name, reorder_point)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (sku) DO UPDATE SET 
        title = EXCLUDED.title,
        unit_cost = EXCLUDED.unit_cost,
        sale_price = EXCLUDED.sale_price,
        image_url = EXCLUDED.image_url,
        updated_at = NOW();
    `, [p.sku, p.asin || null, p.ncm || null, p.title, p.marketplace, p.currency, p.unitCost, p.salePrice, p.imageUrl, p.supplierName, p.reorderPoint]);

    for (const [wh, qty] of Object.entries(p.balances)) {
      await client.query(`
        INSERT INTO inventory_balances (product_sku, warehouse_code, quantity, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (product_sku, warehouse_code) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW();
      `, [p.sku, wh, qty]);
    }
  }

  const countRes = await client.query('SELECT COUNT(*) FROM products;');
  const balRes = await client.query('SELECT COUNT(*) FROM inventory_balances;');
  console.log(`Seeded successfully! Total products: ${countRes.rows[0].count}, Total balance rows: ${balRes.rows[0].count}`);

  await client.end();
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
