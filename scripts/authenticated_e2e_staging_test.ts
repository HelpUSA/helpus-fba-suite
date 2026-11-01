// Authenticated E2E HTTP Route & Transactional Test (Order 028)
// Executed strictly inside an isolated child subprocess spawned by run_staging_e2e_isolated.js.
// Environment variables (DATABASE_URL, POSTGRES_URL, HELPUS_API_SECRET) are fully set before module load.

import { NextRequest } from 'next/server';
import path from 'path';
import { getPostgresPool, closePostgresPool } from '../src/lib/db/postgresClient';
import { GET, POST } from '../src/app/api/inventory/route';
const { restoreDatabase } = require('./restore_database');

// 1. Mandatory environment assertions (No hardcoded secrets, no in-module mutation)
const rawStagingUrl = process.env.DATABASE_URL;
if (!rawStagingUrl) {
  throw new Error('🛑 BLOQUEIO: DATABASE_URL ausente no subprocesso de teste.');
}
const stagingUrl: string = rawStagingUrl;

const parsedUrl = new URL(stagingUrl);
const dbName = parsedUrl.pathname.replace(/^\//, '').toLowerCase();
if (dbName === 'neondb' || dbName === 'production') {
  throw new Error(`🛑 BLOQUEIO CRÍTICO: Tentativa de executar testes E2E diretamente contra o banco '${dbName}'!`);
}

const rawSecret = process.env.HELPUS_API_SECRET;
if (!rawSecret || rawSecret.length < 32) {
  throw new Error('🛑 BLOQUEIO: HELPUS_API_SECRET dinâmico não fornecido pelo inicializador.');
}
const TEST_SECRET: string = rawSecret;

const rawProdUrl = process.env.PROD_DATABASE_URL;
if (!rawProdUrl) {
  throw new Error('🛑 BLOQUEIO: PROD_DATABASE_URL não configurado para verificação cruzada de exclusão.');
}
const prodDatabaseUrl: string = rawProdUrl;

async function verifyStagingPoolIdentity() {
  const pool = getPostgresPool();
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT current_database() AS db,
             COALESCE((SELECT value FROM staging_metadata WHERE key = 'environment' LIMIT 1), 'unknown') AS env_marker
    `);
    const { db, env_marker } = res.rows[0];
    console.log(`✓ Verificação direta de identidade pelo Pool: DB='${db}', staging_metadata.environment='${env_marker}'`);

    if (db !== 'helpus_staging' || env_marker !== 'staging') {
      throw new Error(`🛑 BLOQUEIO DE ISOLAMENTO: O pool de conexões não está conectado ao banco de staging isolado! (db=${db}, marker=${env_marker})`);
    }
  } finally {
    client.release();
  }
}

async function runRealHttpStagingTests() {
  console.log('===============================================================');
  console.log('TESTES E2E REAIS DE ROTAS HTTP NEXT.JS EM STAGING (ORDEM 028)');
  console.log('===============================================================');
  console.log(`Subprocess Target DB: ${stagingUrl.replace(/:[^:@]+@/, ':***@')}`);

  // Step 0: Ensure staging is in clean baseline state before test
  console.log('\n[0/6] PREPARAÇÃO: Restauração limpa da linha de base canônica em staging...');
  const backupDir = path.join(__dirname, '..', 'backups');
  const latestSnapshot = path.join(backupDir, 'latest_backup.enc.json');

  await closePostgresPool();
  await restoreDatabase(latestSnapshot, stagingUrl, prodDatabaseUrl);
  await closePostgresPool();

  // Step 0.1: Server-side validation via the actual Pool used by Next.js handlers
  await verifyStagingPoolIdentity();

  const baseUrl = 'http://localhost:3000/api/inventory';

  try {
    // 1. GET /api/inventory ANÔNIMO (Verificação de políticas de privacidade)
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

    // 2. GET /api/inventory AUTENTICADO COM TOKEN DINÂMICO
    console.log('\n[2/6] ROTA GET /api/inventory (AUTENTICADO COM TOKEN DINÂMICO)');
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
