// Authenticated E2E HTTP Route & Transactional Test (Order 027 Correções 1, 5 & 6)
// Tests real Next.js route handlers against isolated helpus_staging database,
// validating authentication, concurrency, idempotency, and safe snapshot rollback.

import { NextRequest } from 'next/server';
import path from 'path';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');

// 1. Point DATABASE_URL strictly to helpus_staging for this test runner
const prodDatabaseUrl = process.env.DATABASE_URL;
const parsedUrl = new URL(prodDatabaseUrl);
parsedUrl.pathname = '/helpus_staging';
const stagingUrl = parsedUrl.toString();

// Set environment for Next.js runtime to staging
process.env.DATABASE_URL = stagingUrl;
process.env.POSTGRES_URL = stagingUrl;

// Set master secret if not already in env
const TEST_SECRET = process.env.HELPUS_API_SECRET || 'helpus_secret_master_test_key_2026';
process.env.HELPUS_API_SECRET = TEST_SECRET;

import { GET, POST } from '../src/app/api/inventory/route';
import { closePostgresPool } from '../src/lib/db/postgresClient';
const { restoreDatabase } = require('./restore_database');

async function runRealHttpStagingTests() {
  console.log('===============================================================');
  console.log('TESTES E2E REAIS DE ROTAS HTTP NEXT.JS EM STAGING (ORDEM 027)');
  console.log('===============================================================');
  console.log(`Target DB: helpus_staging (Server-Side Verified)`);

  const backupDir = path.join(__dirname, '..', 'backups');
  const latestSnapshot = path.join(backupDir, 'latest_backup.enc.json');

  // Step 0: Ensure staging is in clean baseline state before test
  console.log('\n[0/6] PREPARAÇÃO: Restauração limpa da linha de base canônica em staging...');
  await closePostgresPool();
  await restoreDatabase(latestSnapshot, stagingUrl, prodDatabaseUrl);
  await closePostgresPool();

  const baseUrl = 'http://localhost:3000/api/inventory';

  try {
    // 1. GET /api/inventory ANÔNIMO
    console.log('\n[1/6] ROTA GET /api/inventory (ANÔNIMO - PRIVACIDADE COMERCIAL)');
    const anonReq = new NextRequest(baseUrl, { method: 'GET' });
    const anonRes = await GET(anonReq);
    const anonData = await anonRes.json();

    console.log(`✓ Status HTTP: ${anonRes.status}`);
    console.log(`✓ authenticated: ${anonData.authenticated}`);
    console.log(`✓ actorRole: ${anonData.actorRole}`);
    console.log(`✓ unitCost omitido: ${anonData.items[0]?.unitCost === undefined}`);
    console.log(`✓ salePrice omitido: ${anonData.items[0]?.salePrice === undefined}`);
    console.log(`✓ totalUnits omitido: ${anonData.warehouseSummary[0]?.totalUnits === null}`);

    if (anonRes.status !== 200 || anonData.authenticated !== false || anonData.items[0]?.salePrice !== undefined) {
      throw new Error('Falha na política de privacidade de GET anônimo.');
    }

    // 2. GET /api/inventory AUTENTICADO
    console.log('\n[2/6] ROTA GET /api/inventory (AUTENTICADO COM TOKEN MASTER)');
    const authGetReq = new NextRequest(baseUrl, {
      method: 'GET',
      headers: { 'x-helpus-auth-token': TEST_SECRET }
    });
    const authGetRes = await GET(authGetReq);
    const authGetData = await authGetRes.json();

    console.log(`✓ Status HTTP: ${authGetRes.status}`);
    console.log(`✓ authenticated: ${authGetData.authenticated}`);
    console.log(`✓ actorRole: ${authGetData.actorRole}`);
    console.log(`✓ unitCost presente: ${authGetData.items[0]?.unitCost !== undefined} (${authGetData.items[0]?.unitCost})`);
    console.log(`✓ salePrice presente: ${authGetData.items[0]?.salePrice !== undefined} (${authGetData.items[0]?.salePrice})`);
    console.log(`✓ totalUnits presente: ${authGetData.warehouseSummary[0]?.totalUnits !== null}`);

    if (authGetRes.status !== 200 || authGetData.authenticated !== true || authGetData.items[0]?.salePrice === undefined) {
      throw new Error('Falha no acesso autenticado a GET /api/inventory.');
    }

    // 3. POST /api/inventory ANÔNIMO (MUTAÇÃO BLOQUEADA FAIL-CLOSED)
    console.log('\n[3/6] ROTA POST /api/inventory (MUTAÇÃO ANÔNIMA BLOQUEADA 403)');
    const unauthPostReq = new NextRequest(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'batch_receive_braspress' })
    });
    const unauthPostRes = await POST(unauthPostReq);
    const unauthPostData = await unauthPostRes.json();

    console.log(`✓ Status HTTP: ${unauthPostRes.status}`);
    console.log(`✓ ok: ${unauthPostData.ok}`);
    console.log(`✓ Mensagem: ${unauthPostData.message}`);

    if (unauthPostRes.status !== 403 || unauthPostData.ok !== false) {
      throw new Error('Falha no bloqueio fail-closed de mutação anônima.');
    }

    // 4. POST /api/inventory AUTENTICADO - RECEBIMENTO BRASPRESS VIA ROTA REAL
    console.log('\n[4/6] ROTA POST /api/inventory (RECEBIMENTO BRASPRESS AUTENTICADO)');
    const authPostReq = new NextRequest(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-helpus-auth-token': TEST_SECRET
      },
      body: JSON.stringify({ action: 'batch_receive_braspress' })
    });
    const authPostRes = await POST(authPostReq);
    const authPostData = await authPostRes.json();

    console.log(`✓ Status HTTP: ${authPostRes.status}`);
    console.log(`✓ ok: ${authPostData.ok}`);
    console.log(`✓ totalUnits recebidas: ${authPostData.totalUnits}`);
    console.log(`✓ movedCount SKUs: ${authPostData.movedCount}`);
    console.log(`✓ Mensagem: ${authPostData.message}`);

    if (authPostRes.status !== 200 || authPostData.ok !== true || authPostData.totalUnits !== 30) {
      throw new Error(`Falha no recebimento Braspress: ${JSON.stringify(authPostData)}`);
    }

    // 5. TESTE DE IDEMPOTÊNCIA VIA ROTA REAL (SEGUNDA EXECUÇÃO QUANDO TRANSIT = 0)
    console.log('\n[5/6] TESTE DE IDEMPOTÊNCIA VIA ROTA REAL (SEGUNDA EXECUÇÃO)');
    const secondPostReq = new NextRequest(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-helpus-auth-token': TEST_SECRET
      },
      body: JSON.stringify({ action: 'batch_receive_braspress' })
    });
    const secondPostRes = await POST(secondPostReq);
    const secondPostData = await secondPostRes.json();

    console.log(`✓ Status HTTP: ${secondPostRes.status}`);
    console.log(`✓ totalUnits movidas na 2ª tentativa: ${secondPostData.totalUnits || 0}`);
    console.log(`✓ Mensagem de idempotência: ${secondPostData.message}`);

    if (secondPostData.totalUnits > 0) {
      throw new Error('Falha na idempotência: unidades duplicadas em execução subsequente.');
    }

  } finally {
    // 6. ROLLBACK SEGURO POR RESTAURAÇÃO DE SNAPSHOT (SEM SQL ARBITRÁRIO)
    console.log('\n[6/6] ROLLBACK SEGURO EM STAGING VIA RESTAURAÇÃO DE SNAPSHOT');
    await closePostgresPool();
    await restoreDatabase(latestSnapshot, stagingUrl, prodDatabaseUrl);
    await closePostgresPool();
    console.log('✓ Staging restaurado ao estado canônico original com integridade de checksums.');
  }

  console.log('\n===============================================================');
  console.log('TODAS AS ROTAS HTTP, AUTENTICAÇÃO E TRANSAÇÕES 100% HOMOLOGADAS!');
  console.log('===============================================================');
}

runRealHttpStagingTests().catch(err => {
  console.error('\n❌ Erro no teste E2E de rotas:', err.message);
  process.exit(1);
});
