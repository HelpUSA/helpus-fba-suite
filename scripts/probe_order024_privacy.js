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
  console.log('=== SONDAGEM DE PRIVACIDADE & SEGURANÇA (ORDEM 024) ===');

  // 1. GET /api/inventory ANÔNIMO (Dados sensíveis devem vir omitidos/mascarados)
  const anonRes = await request('https://fba.helpusbr.com/api/inventory');
  console.log('1. GET /api/inventory (Anônimo) Status:', anonRes.status);
  const anonJson = JSON.parse(anonRes.body);
  console.log('   - ok:', anonJson.ok);
  console.log('   - authenticated:', anonJson.authenticated);
  console.log('   - actorRole:', anonJson.actorRole);
  console.log('   - unitCost de amostra:', anonJson.items[0]?.unitCost);
  console.log('   - supplierName de amostra:', anonJson.items[0]?.supplierName);
  console.log('   - totalValue em armazém:', anonJson.warehouseSummary[0]?.totalValue);
  console.log('   - recentMovements count:', anonJson.recentMovements?.length);
  console.log('   - orders count:', anonJson.orders?.length);

  // 2. GET /api/finance/dre
  const dreRes = await request('https://fba.helpusbr.com/api/finance/dre');
  console.log('\n2. GET /api/finance/dre Status:', dreRes.status);

  // 3. GET /api/invoices (Não autenticado deve ser 403)
  const invoicesRes = await request('https://fba.helpusbr.com/api/invoices');
  console.log('\n3. GET /api/invoices (Não autenticado) Status:', invoicesRes.status);

  // 4. POST /api/inventory (Mutação sem token deve ser 403)
  const postRes = await request('https://fba.helpusbr.com/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'batch_receive_braspress' }),
  });
  console.log('\n4. POST /api/inventory (Mutação sem token) Status:', postRes.status);
}

probe().catch(console.error);
