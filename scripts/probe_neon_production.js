const https = require('https');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function probe() {
  console.log('--- PROBING PRODUCTION WITH NEON POSTGRESQL (dpl_GmEvHqpqFWKJmUutFqossbLJXr83) ---');

  // 1. GET /api/inventory (connected to Neon PostgreSQL with Commercial Privacy)
  const invRes = await request('https://fba.helpusbr.com/api/inventory');
  console.log('GET /api/inventory status:', invRes.status);
  try {
    const json = JSON.parse(invRes.body);
    console.log('OK:', json.ok);
    console.log('Authenticated:', json.authenticated);
    console.log('Actor Role:', json.actorRole);
    console.log('Total Products Returned:', json.items ? json.items.length : 0);
    if (json.items && json.items.length > 0) {
      console.log('Sample Product SKUs:', json.items.map(i => i.sku));
      console.log('Sample salePrice (should be undefined for anonymous):', json.items[0].salePrice);
      console.log('Sample balances (should be empty for anonymous):', JSON.stringify(json.items[0].balances));
    }
  } catch (e) {
    console.log('Raw body preview:', invRes.body.slice(0, 300));
  }

  // 2. GET /api/finance/dre
  const dreRes = await request('https://fba.helpusbr.com/api/finance/dre');
  console.log('\nGET /api/finance/dre status:', dreRes.status);

  // 3. GET /api/invoices (should remain 403 Forbidden for unauthorized requests)
  const invoicesRes = await request('https://fba.helpusbr.com/api/invoices');
  console.log('\nGET /api/invoices (unauthorized) status:', invoicesRes.status);

  // 4. POST /api/inventory (unauthorized mutation should remain 403 Forbidden)
  const postRes = await request('https://fba.helpusbr.com/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sku: 'TEST-SKU', name: 'Test' }),
  });
  console.log('\nPOST /api/inventory (unauthorized) status:', postRes.status);
}

probe().catch(console.error);
