// True Network HTTP E2E Test Suite against Next.js Server on Isolated Staging (Order 030 Gate G3)
// Executes actual HTTP requests over network TCP sockets against Next.js server on 127.0.0.1:3099.
// Features external try/finally ensuring canonical baseline restoration & checksum verification on all exit paths.
// Strict assertions on second request idempotency and dynamic credential injection.

const { restoreDatabase } = require('./restore_database');
const path = require('path');

async function testRealHttpNetworkE2E() {
  console.log('===============================================================');
  console.log('TESTES E2E REAIS VIA REDE HTTP (TCP LOOPBACK) EM STAGING (ORDEM 030)');
  console.log('===============================================================');

  const serverPort = process.env.STAGING_SERVER_PORT || '3099';
  const baseUrl = `http://127.0.0.1:${serverPort}/api/inventory`;
  const authToken = process.env.HELPUS_API_SECRET;
  const stagingUrl = process.env.DATABASE_URL;
  const prodIdentity = process.env.PROD_HOST_ENDPOINT;

  if (!authToken || authToken.length < 32) {
    throw new Error('🛑 BLOQUEIO: HELPUS_API_SECRET dinâmico ausente ou insuficiente.');
  }

  if (!stagingUrl || !stagingUrl.includes('staging_operator') || !stagingUrl.includes('/helpus_staging')) {
    throw new Error(`🛑 BLOQUEIO DE ISOLAMENTO: DATABASE_URL deve conter staging_operator e /helpus_staging.`);
  }

  if (!prodIdentity) {
    throw new Error('🛑 BLOQUEIO: PROD_HOST_ENDPOINT (identidade não-secreta de produção) é obrigatório.');
  }

  console.log(`✓ Servidor Alvo: http://127.0.0.1:${serverPort} (Loopback Estrito)`);
  console.log(`✓ Conexão DB do Servidor: staging_operator @ helpus_staging`);
  console.log(`✓ Identidade de Produção para Exclusão: ${prodIdentity}`);

  const backupDir = path.join(__dirname, '..', 'backups');
  const snapshotPath = path.join(backupDir, 'latest_backup.enc.json');

  // Step 0: Initial Canonical Baseline
  console.log('\n[0/6] RESTAURAÇÃO BASELINE INICIAL EM STAGING...');
  await restoreDatabase(snapshotPath, stagingUrl, prodIdentity);

  try {
    // 1. GET /api/inventory ANÔNIMO VIA REDE HTTP
    console.log('\n[1/6] REQUISIÇÃO HTTP REAL GET (ANÔNIMO - REDE TCP)');
    const anonRes = await fetch(baseUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const anonData = await anonRes.json();

    console.log(`✓ Status HTTP Real: ${anonRes.status} (Esperado: 200)`);
    console.log(`✓ authenticated: ${anonData.authenticated}`);
    console.log(`✓ actorRole: ${anonData.actorRole}`);
    console.log(`✓ unitCost omitido: ${anonData.items[0]?.unitCost === undefined}`);
    console.log(`✓ salePrice omitido: ${anonData.items[0]?.salePrice === undefined}`);
    console.log(`✓ totalUnits omitido: ${anonData.warehouseSummary[0]?.totalUnits === null}`);

    if (anonRes.status !== 200 || anonData.authenticated !== false || anonData.items[0]?.salePrice !== undefined) {
      throw new Error('Falha na asserção de privacidade comercial anônima via rede HTTP.');
    }

    // 2. GET /api/inventory AUTENTICADO VIA CABEÇALHO HTTP
    console.log('\n[2/6] REQUISIÇÃO HTTP REAL GET (AUTENTICADO COM TOKEN DINÂMICO)');
    const authGetRes = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-helpus-auth-token': authToken
      }
    });
    const authGetData = await authGetRes.json();

    console.log(`✓ Status HTTP Real: ${authGetRes.status} (Esperado: 200)`);
    console.log(`✓ authenticated: ${authGetData.authenticated}`);
    console.log(`✓ actorRole: ${authGetData.actorRole}`);
    console.log(`✓ unitCost presente: ${authGetData.items[0]?.unitCost !== undefined} (Valor: ${authGetData.items[0]?.unitCost})`);
    console.log(`✓ salePrice presente: ${authGetData.items[0]?.salePrice !== undefined} (Valor: ${authGetData.items[0]?.salePrice})`);
    console.log(`✓ totalUnits presente: ${authGetData.warehouseSummary[0]?.totalUnits !== null}`);

    if (authGetRes.status !== 200 || authGetData.authenticated !== true || authGetData.items[0]?.salePrice === undefined) {
      throw new Error('Falha no acesso autenticado via rede HTTP.');
    }

    // 3. POST /api/inventory ANÔNIMO (MUTAÇÃO BLOQUEADA FAIL-CLOSED)
    console.log('\n[3/6] REQUISIÇÃO HTTP REAL POST (ANÔNIMO - BLOQUEIO FAIL-CLOSED)');
    const unauthPostRes = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'batch_receive_braspress' })
    });
    const unauthPostData = await unauthPostRes.json();

    console.log(`✓ Status HTTP Real: ${unauthPostRes.status} (Esperado: 403 Forbidden)`);
    console.log(`✓ ok: ${unauthPostData.ok}`);
    console.log(`✓ Mensagem: "${unauthPostData.message}"`);

    if (unauthPostRes.status !== 403 || unauthPostData.ok !== false) {
      throw new Error('Falha no bloqueio fail-closed de mutação anônima via rede HTTP.');
    }

    // 4. POST /api/inventory AUTENTICADO - RECEBIMENTO BRASPRESS VIA TRANSAÇÃO
    console.log('\n[4/6] REQUISIÇÃO HTTP REAL POST (AUTENTICADO - RECEBIMENTO BRASPRESS)');
    const authPostRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-helpus-auth-token': authToken
      },
      body: JSON.stringify({ action: 'batch_receive_braspress' })
    });
    const authPostData = await authPostRes.json();

    console.log(`✓ Status HTTP Real: ${authPostRes.status} (Esperado: 200)`);
    console.log(`✓ ok: ${authPostData.ok}`);
    console.log(`✓ totalUnits recebidas: ${authPostData.totalUnits}`);
    console.log(`✓ movedCount SKUs: ${authPostData.movedCount}`);
    console.log(`✓ Mensagem: "${authPostData.message}"`);

    if (authPostRes.status !== 200 || authPostData.ok !== true || authPostData.totalUnits !== 30) {
      throw new Error(`Falha no recebimento transacional em lote via rede HTTP: ${JSON.stringify(authPostData)}`);
    }

    // 5. TESTE DE IDEMPOTÊNCIA VIA REDE HTTP (SEGUNDA EXECUÇÃO)
    console.log('\n[5/6] TESTE DE IDEMPOTÊNCIA VIA REDE HTTP (SEGUNDA EXECUÇÃO)');
    const secondPostRes = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-helpus-auth-token': authToken
      },
      body: JSON.stringify({ action: 'batch_receive_braspress' })
    });
    const secondPostData = await secondPostRes.json();

    console.log(`✓ Status HTTP Real: ${secondPostRes.status} (Esperado: 200)`);
    console.log(`✓ ok na 2ª tentativa: ${secondPostData.ok} (Esperado: true)`);
    console.log(`✓ totalUnits movidas na 2ª tentativa: ${secondPostData.totalUnits} (Esperado: 0)`);
    console.log(`✓ movedCount SKUs na 2ª tentativa: ${secondPostData.movedCount} (Esperado: 0)`);
    console.log(`✓ Mensagem de idempotência: "${secondPostData.message}"`);

    // Order 031 Ponto 1: asserção estrita exigindo totalUnits === 0 e movedCount === 0; rejeitar null, undefined e valores negativos
    if (
      secondPostRes.status !== 200 ||
      secondPostData.ok !== true ||
      secondPostData.totalUnits !== 0 ||
      secondPostData.movedCount !== 0
    ) {
      throw new Error(`🛑 FALHA DE IDEMPOTÊNCIA: Segunda chamada não retornou exatamente 0 unidades e 0 SKUs! (status=${secondPostRes.status}, ok=${secondPostData.ok}, totalUnits=${secondPostData.totalUnits}, movedCount=${secondPostData.movedCount})`);
    }

  } finally {
    // 6. ROLLBACK SEGURO EM STAGING VIA RESTAURAÇÃO DE SNAPSHOT CANÔNICO
    // Executed unconditionally, guaranteeing clean baseline state even if assertions fail
    console.log('\n[6/6] BLOCO FINALLY: ROLLBACK OBRIGATÓRIO EM STAGING & AUDITORIA DE CHECKSUM');
    await restoreDatabase(snapshotPath, stagingUrl, prodIdentity);
    console.log('✓ Staging restaurado ao estado canônico original com integridade de checksums 100% auditada.');
  }

  console.log('\n===============================================================');
  console.log('✓ TODOS OS TESTES HTTP VIA REDE TCP FORAM HOMOLOGADOS COM SUCESSO!');
  console.log('===============================================================');
}

testRealHttpNetworkE2E().catch(err => {
  console.error('\n❌ Falha nos testes HTTP reais via rede:', err);
  process.exit(1);
});
