import fs from 'fs';
import path from 'path';
import { Client, Pool } from 'pg';
import {
  recordFxRate,
  getFxRate,
  recordFinancialLedgerEntry,
  recordCompensatoryReversal,
  calculateAuditedDre,
} from '../src/lib/db/postgresClient';
import { FinancialLedgerEntry, FxRateRecord } from '../src/lib/erpTypes';

// Native .env.local loader
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
  for (const l of lines) {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const m = trimmed.match(/^([^=]+)=(.*)$/);
    if (m) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1].trim()] = v;
    }
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('SUÍTE DE AUDITORIA & QA FINAL P1: ORDEM 049');
  console.log('================================================================');

  const rawStagingUrl = process.env.STAGING_DATABASE_URL;
  if (!rawStagingUrl) {
    throw new Error('STAGING_DATABASE_URL ausente em .env.local');
  }

  // Use unpooled direct endpoint for isolated test schema to ensure strict session-level search_path retention
  const stagingUrl = rawStagingUrl.replace('-pooler', '');

  // Connect client to verify database target
  const checkClient = new Client({
    connectionString: stagingUrl,
    ssl: { rejectUnauthorized: true },
  });
  await checkClient.connect();
  const dbInfo = await checkClient.query('SELECT current_database(), current_user;');
  console.log(`[Segurança] Conectado a: DB=${dbInfo.rows[0].current_database}, User=${dbInfo.rows[0].current_user}`);

  if (dbInfo.rows[0].current_database !== 'helpus_staging') {
    throw new Error(`ABORT: Target is ${dbInfo.rows[0].current_database}, not helpus_staging! Halting.`);
  }

  process.env.DATABASE_URL = stagingUrl;

  // -------------------------------------------------------------
  // SETUP DE TESTE ISOLADO & REVERSÍVEL (SCHEMA DEDICADO)
  // Sem qualquer bypass ou adulteração de registros compartilhados (Ordem 048)
  // -------------------------------------------------------------
  const isolatedSchema = 'p1_test_isolated';
  console.log(`\n[Isolamento] Configurando schema de teste controlado: ${isolatedSchema}...`);
  await checkClient.query(`DROP TABLE IF EXISTS ${isolatedSchema}.financial_ledger CASCADE;`);
  await checkClient.query(`DROP TABLE IF EXISTS ${isolatedSchema}.fx_rates CASCADE;`);
  await checkClient.query(`CREATE TABLE IF NOT EXISTS ${isolatedSchema}.fx_rates (LIKE public.fx_rates INCLUDING ALL);`);
  await checkClient.query(`CREATE TABLE IF NOT EXISTS ${isolatedSchema}.financial_ledger (LIKE public.financial_ledger INCLUDING ALL);`);

  // Anexar triggers de imutabilidade estrita no schema isolado
  await checkClient.query(`
    DROP TRIGGER IF EXISTS trg_prevent_financial_ledger_tampering ON ${isolatedSchema}.financial_ledger;
    CREATE TRIGGER trg_prevent_financial_ledger_tampering
    BEFORE UPDATE OR DELETE ON ${isolatedSchema}.financial_ledger
    FOR EACH ROW EXECUTE FUNCTION public.trg_protect_financial_ledger();

    DROP TRIGGER IF EXISTS trg_prevent_fx_rates_tampering ON ${isolatedSchema}.fx_rates;
    CREATE TRIGGER trg_prevent_fx_rates_tampering
    BEFORE UPDATE OR DELETE ON ${isolatedSchema}.fx_rates
    FOR EACH ROW EXECUTE FUNCTION public.trg_protect_fx_rates();
  `);

  // Configura pool para usar o schema isolado por padrão
  const isolatedPool = new Pool({
    connectionString: stagingUrl,
    ssl: { rejectUnauthorized: true },
    max: 12,
  });

  // Client específico do teste com search_path configurado
  const testClient = await isolatedPool.connect();
  await testClient.query(`SET search_path TO ${isolatedSchema}, public;`);

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`  [PASS] [${total}]: ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] [${total}]: ${desc}`);
      throw new Error(`Assertion failed: ${desc}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // BLOCO 1: TAXAS FX, IMUTABILIDADE & ALLOWLIST DE FX DOCUMENTAL EM REALIZADO (Ordem 049)
    // -------------------------------------------------------------
    console.log('\n--- Bloco 1: Taxas FX, Imutabilidade e Allowlist de FX Documental em REALIZADO (Ordem 049) ---');

    // 1.1 Inserir taxa de teste oficial documentada (BCB_PTAX_OFICIAL)
    const testFx: FxRateRecord = {
      rateDate: '2026-10-15',
      currencyFrom: 'USD',
      currencyTo: 'BRL',
      rate: 5.6842,
      source: 'BCB_PTAX_OFICIAL',
      isFallback: false,
    };
    const savedFx = await recordFxRate(testFx, testClient);
    assert(savedFx.rate === 5.6842, 'Taxa de teste salva com precisão decimal');
    assert(savedFx.source === 'BCB_PTAX_OFICIAL', 'Fonte BCB_PTAX_OFICIAL registrada corretamente');

    // 1.2 Recuperação idempotente da mesma taxa
    const idempFx = await recordFxRate(testFx, testClient);
    assert(idempFx.id === savedFx.id, 'Inserção idempotente com mesma cotação retorna registro existente');

    // 1.3 Tentativa de alteração retroativa com valor divergente -> Deve disparar FX_RATE_IMMUTABLE
    let fxMutationBlocked = false;
    try {
      await recordFxRate({ ...testFx, rate: 5.9999 }, testClient);
    } catch (e: any) {
      if (e.message.includes('FX_RATE_IMMUTABLE')) {
        fxMutationBlocked = true;
      }
    }
    assert(fxMutationBlocked, 'Alteração retroativa silenciosa de cotação histórica é estritamente proibida (FX_RATE_IMMUTABLE)');

    // 1.4 Trigger direto no banco bloqueia UPDATE em fx_rates
    let trgBlockedFxUpdate = false;
    try {
      await testClient.query(`UPDATE ${isolatedSchema}.fx_rates SET rate = 6.00 WHERE rate_date = '2026-10-15';`);
    } catch (e: any) {
      if (e.message.includes('Immutability violation')) {
        trgBlockedFxUpdate = true;
      }
    }
    assert(trgBlockedFxUpdate, 'Trigger trg_prevent_fx_rates_tampering bloqueia UPDATE em fx_rates');

    // 1.5 Recuperar fim de semana (prior close fallback documentado)
    const fallbackFx = await getFxRate('2026-10-18', 'USD', 'BRL', testClient);
    assert(fallbackFx.rate === 5.6842, 'Data sem cotação utiliza fechamento anterior documentado (prior close)');
    assert(fallbackFx.source === 'BCB_PTAX_OFICIAL_PRIOR_CLOSE', 'Fonte documenta _PRIOR_CLOSE no fallback');
    assert(fallbackFx.isFallback === true, 'Indicador isFallback ativado para prior close');

    // 1.6 Paridade de moedas idênticas
    const parityFx = await getFxRate('2026-10-15', 'BRL', 'BRL', testClient);
    assert(parityFx.rate === 1.0 && parityFx.source === 'PARITY', 'BRL->BRL retorna paridade exata 1.0');

    // 1.7 Cotação ausente dispara FX_RATE_UNAVAILABLE fail-closed
    let fxUnavailableCaught = false;
    try {
      await getFxRate('2024-01-01', 'USD', 'BRL', testClient);
    } catch (e: any) {
      if (e.message.includes('FX_RATE_UNAVAILABLE')) {
        fxUnavailableCaught = true;
      }
    }
    assert(fxUnavailableCaught, 'Cotação ausente dispara FX_RATE_UNAVAILABLE (proibido inventar cotação)');

    // 1.8 Rejeitar taxa FX arbitrária injetada em lançamento REALIZADO sem documento
    let arbitraryFxBlocked = false;
    try {
      await recordFinancialLedgerEntry({
        entryNumber: `TEST-P1-ARB-FX-${Date.now()}`,
        idempotencyKey: `idemp-arb-fx-${Date.now()}`,
        sourceEventType: 'ORDER_SALE',
        sourceId: 'ORD-ARB-001',
        marketplace: 'Amazon US',
        competenceDate: '2026-10-15',
        currency: 'USD',
        amountOriginal: 100.00,
        entryDirection: 'CREDIT',
        amountBrl: 699.00,
        fxRate: 6.99, // Arbitrary custom rate not matching the 5.6842 in fx_rates
        fxSource: 'INVENTED_SOURCE',
        category: 'RECEITA_BRUTA',
        status: 'REALIZADO',
        metadata: { sku: 'SKU-ARB', quantity: 1 },
        environment: 'staging',
      }, testClient);
    } catch (e: any) {
      if (e.message.includes('FX_ORIGIN_UNVERIFIED')) {
        arbitraryFxBlocked = true;
      }
    }
    assert(arbitraryFxBlocked, 'Lançamento REALIZADO com FX arbitrário sem origem documental é rejeitado com FX_ORIGIN_UNVERIFIED');

    // 1.9 Inserir taxa sintética (SYNTHETIC_TEST_RATE) e taxa de fallback para testes de governança cambial (Ordem 049)
    await recordFxRate({
      rateDate: '2026-09-10',
      currencyFrom: 'USD',
      currencyTo: 'BRL',
      rate: 5.5000,
      source: 'SYNTHETIC_TEST_RATE',
      isFallback: false,
    }, testClient);

    await recordFxRate({
      rateDate: '2026-09-09',
      currencyFrom: 'USD',
      currencyTo: 'BRL',
      rate: 5.4800,
      source: 'FALLBACK_POLICY',
      isFallback: true,
    }, testClient);

    // 1.10 Rejeitar lançamento REALIZADO em USD com SYNTHETIC_TEST_RATE mesmo com taxa idêntica ao banco
    let syntheticRealizadoBlocked = false;
    try {
      await recordFinancialLedgerEntry({
        entryNumber: `TEST-P1-SYNTH-REAL-${Date.now()}`,
        idempotencyKey: `idemp-synth-real-${Date.now()}`,
        sourceEventType: 'ORDER_SALE',
        sourceId: 'ORD-SYNTH-001',
        marketplace: 'Amazon US',
        competenceDate: '2026-09-10',
        currency: 'USD',
        amountOriginal: 100.00,
        entryDirection: 'CREDIT',
        amountBrl: 550.00,
        fxRate: 5.5000,
        fxSource: 'SYNTHETIC_TEST_RATE',
        category: 'RECEITA_BRUTA',
        status: 'REALIZADO',
        metadata: { sku: 'SKU-SYNTH', quantity: 1 },
        environment: 'staging',
      }, testClient);
    } catch (e: any) {
      if (e.message.includes('FX_ORIGIN_UNVERIFIED')) {
        syntheticRealizadoBlocked = true;
      }
    }
    assert(syntheticRealizadoBlocked, 'Lançamento REALIZADO em USD com SYNTHETIC_TEST_RATE é estritamente proibido (FX_ORIGIN_UNVERIFIED)');

    // 1.11 Rejeitar lançamento REALIZADO em USD com resolução automática de fonte sintética
    let autoResolvedSynthBlocked = false;
    try {
      await recordFinancialLedgerEntry({
        entryNumber: `TEST-P1-AUTOSYNTH-REAL-${Date.now()}`,
        idempotencyKey: `idemp-autosynth-real-${Date.now()}`,
        sourceEventType: 'ORDER_SALE',
        sourceId: 'ORD-AUTOSYNTH-002',
        marketplace: 'Amazon US',
        competenceDate: '2026-09-10',
        currency: 'USD',
        amountOriginal: 100.00,
        entryDirection: 'CREDIT',
        amountBrl: 0,
        fxRate: 0,
        fxSource: '', // Resolução automática encontra SYNTHETIC_TEST_RATE no banco
        category: 'RECEITA_BRUTA',
        status: 'REALIZADO',
        metadata: { sku: 'SKU-AUTOSYNTH', quantity: 1 },
        environment: 'staging',
      }, testClient);
    } catch (e: any) {
      if (e.message.includes('FX_ORIGIN_UNVERIFIED')) {
        autoResolvedSynthBlocked = true;
      }
    }
    assert(autoResolvedSynthBlocked, 'Resolução automática de taxa cambial sintética para REALIZADO é rejeitada com FX_ORIGIN_UNVERIFIED');

    // 1.12 Rejeitar lançamento REALIZADO em USD com FALLBACK_POLICY
    let fallbackPolicyBlocked = false;
    try {
      await recordFinancialLedgerEntry({
        entryNumber: `TEST-P1-FB-REAL-${Date.now()}`,
        idempotencyKey: `idemp-fb-real-${Date.now()}`,
        sourceEventType: 'ORDER_SALE',
        sourceId: 'ORD-FB-003',
        marketplace: 'Amazon US',
        competenceDate: '2026-09-09',
        currency: 'USD',
        amountOriginal: 100.00,
        entryDirection: 'CREDIT',
        amountBrl: 548.00,
        fxRate: 5.4800,
        fxSource: 'FALLBACK_POLICY',
        category: 'RECEITA_BRUTA',
        status: 'REALIZADO',
        metadata: { sku: 'SKU-FB', quantity: 1 },
        environment: 'staging',
      }, testClient);
    } catch (e: any) {
      if (e.message.includes('FX_ORIGIN_UNVERIFIED')) {
        fallbackPolicyBlocked = true;
      }
    }
    assert(fallbackPolicyBlocked, 'Lançamento REALIZADO em USD com FALLBACK_POLICY é proibido com FX_ORIGIN_UNVERIFIED');

    // 1.13 Permitir SYNTHETIC_TEST_RATE em lançamentos ESTIMADO e PROJETADO
    const estimSynthEntry = await recordFinancialLedgerEntry({
      entryNumber: `TEST-P1-SYNTH-EST-${Date.now()}`,
      idempotencyKey: `idemp-synth-est-${Date.now()}`,
      sourceEventType: 'ORDER_SALE',
      sourceId: 'ORD-EST-SYNTH-004',
      marketplace: 'Amazon US',
      competenceDate: '2026-09-10',
      currency: 'USD',
      amountOriginal: 100.00,
      entryDirection: 'CREDIT',
      amountBrl: 550.00,
      fxRate: 5.5000,
      fxSource: 'SYNTHETIC_TEST_RATE',
      category: 'RECEITA_BRUTA',
      status: 'ESTIMADO',
      metadata: { sku: 'SKU-EST-SYNTH', quantity: 1 },
      environment: 'staging',
    }, testClient);
    assert(estimSynthEntry.status === 'ESTIMADO', 'Lançamento ESTIMADO com taxa sintética é aceito com sucesso');

    const projSynthEntry = await recordFinancialLedgerEntry({
      entryNumber: `TEST-P1-SYNTH-PROJ-${Date.now()}`,
      idempotencyKey: `idemp-synth-proj-${Date.now()}`,
      sourceEventType: 'ORDER_SALE',
      sourceId: 'ORD-PROJ-SYNTH-005',
      marketplace: 'Amazon US',
      competenceDate: '2026-09-10',
      currency: 'USD',
      amountOriginal: 100.00,
      entryDirection: 'CREDIT',
      amountBrl: 550.00,
      fxRate: 5.5000,
      fxSource: 'SYNTHETIC_TEST_RATE',
      category: 'RECEITA_BRUTA',
      status: 'PROJETADO',
      metadata: { sku: 'SKU-PROJ-SYNTH', quantity: 1 },
      environment: 'staging',
    }, testClient);
    assert(projSynthEntry.status === 'PROJETADO', 'Lançamento PROJETADO com taxa sintética é aceito com sucesso');

    // 1.14 Rejeitar data calendário impossível em lançamento contábil (Ex: 2026-02-30)
    let impossibleDateBlocked = false;
    try {
      await recordFinancialLedgerEntry({
        entryNumber: `TEST-P1-IMP-DATE-${Date.now()}`,
        idempotencyKey: `idemp-imp-date-${Date.now()}`,
        sourceEventType: 'ORDER_SALE',
        sourceId: 'ORD-IMP-001',
        marketplace: 'Amazon US',
        competenceDate: '2026-02-30', // Impossible date
        currency: 'USD',
        amountOriginal: 100.00,
        entryDirection: 'CREDIT',
        amountBrl: 568.42,
        fxRate: 5.6842,
        fxSource: 'BCB_PTAX_OFICIAL',
        category: 'RECEITA_BRUTA',
        status: 'REALIZADO',
        metadata: { sku: 'SKU-IMP', quantity: 1 },
        environment: 'staging',
      }, testClient);
    } catch (e: any) {
      if (e.message.includes('INVALID_DATE_FORMAT')) {
        impossibleDateBlocked = true;
      }
    }
    assert(impossibleDateBlocked, 'Data de competência impossível no calendário (2026-02-30) é rejeitada com INVALID_DATE_FORMAT');

    // -------------------------------------------------------------
    // BLOCO 2: IDEMPOTÊNCIA COM FINGERPRINT INTEGRAL & METADADOS FINANCEIROS
    // -------------------------------------------------------------
    console.log('\n--- Bloco 2: Idempotência com Fingerprint Integral e Metadados Financeiros (Item 3) ---');

    const entryIdempKey = `test-idemp-${Date.now()}`;
    const baseEntry: FinancialLedgerEntry = {
      entryNumber: `TEST-P1-ORD-001-${Date.now()}`,
      idempotencyKey: entryIdempKey,
      sourceEventType: 'ORDER_SALE',
      sourceId: 'ORD-TEST-999',
      marketplace: 'Amazon US',
      competenceDate: '2026-10-15',
      currency: 'USD',
      amountOriginal: 100.00,
      entryDirection: 'CREDIT',
      amountBrl: 568.42,
      fxRate: 5.6842,
      fxSource: 'BCB_PTAX_OFICIAL',
      category: 'RECEITA_BRUTA',
      status: 'REALIZADO',
      metadata: { sku: 'TEST-SKU-1', quantity: 1, unitPrice: 100.00 },
      environment: 'staging',
    };

    const recorded1 = await recordFinancialLedgerEntry(baseEntry, testClient);
    assert(recorded1.entryNumber === baseEntry.entryNumber, 'Lançamento gravado com sucesso no schema isolado');

    // 2.1 Reenvio com mesmo payload integral retorna exatamente o mesmo registro (sem falsos conflitos)
    const recorded2 = await recordFinancialLedgerEntry({ ...baseEntry }, testClient);
    assert(recorded2.id === recorded1.id, 'Idempotência com fingerprint integral idêntico retorna mesmo registro');

    // 2.2 Reenvio com FX omitido (calculado automaticamente) converge sem falso conflito
    const recordedCalc = await recordFinancialLedgerEntry({
      ...baseEntry,
      fxRate: 0,
      fxSource: '',
    }, testClient);
    assert(recordedCalc.id === recorded1.id, 'Reenvio com FX calculado automaticamente converge determinísticamente sem falso conflito');

    // 2.3 Teste de divergência em cada dimensão do fingerprint
    const divergenceTests = [
      { name: 'amountOriginal', patch: { amountOriginal: 200.00 } },
      { name: 'currency', patch: { currency: 'BRL' as const } },
      { name: 'marketplace', patch: { marketplace: 'Amazon BR' as const } },
      { name: 'competenceDate', patch: { competenceDate: '2026-10-16' } },
      { name: 'category', patch: { category: 'CMV' as const } },
      { name: 'entryDirection', patch: { entryDirection: 'DEBIT' as const } },
      { name: 'status', patch: { status: 'ESTIMADO' as const } },
      { name: 'fxSource', patch: { fxSource: 'DIFFERENT_FX_SOURCE' } },
      { name: 'metadata.unitPrice', patch: { metadata: { sku: 'TEST-SKU-1', quantity: 1, unitPrice: 999.00 } } },
      { name: 'metadata.quantity', patch: { metadata: { sku: 'TEST-SKU-1', quantity: 50, unitPrice: 100.00 } } },
      { name: 'metadata.sku', patch: { metadata: { sku: 'CHANGED-SKU-99', quantity: 1, unitPrice: 100.00 } } },
    ];

    for (const dt of divergenceTests) {
      let mismatchCaught = false;
      try {
        await recordFinancialLedgerEntry({ ...baseEntry, ...dt.patch }, testClient);
      } catch (e: any) {
        if (e.message.includes('IDEMPOTENCY_PAYLOAD_MISMATCH')) {
          mismatchCaught = true;
        }
      }
      assert(mismatchCaught, `Divergência em '${dt.name}' detectada e rejeitada com IDEMPOTENCY_PAYLOAD_MISMATCH`);
    }

    // -------------------------------------------------------------
    // BLOCO 3: CONCORRÊNCIA REAL COM PAYLOAD IGUAL E DIVERGENTE
    // -------------------------------------------------------------
    console.log('\n--- Bloco 3: Concorrência Real com Payload Igual e Divergente (Item 3) ---');

    const concurrentKey = `test-concurrent-${Date.now()}`;
    const concurrentPayload: FinancialLedgerEntry = {
      entryNumber: `TEST-P1-CONC-${Date.now()}`,
      idempotencyKey: concurrentKey,
      sourceEventType: 'ORDER_SALE',
      sourceId: 'ORD-CONC-123',
      marketplace: 'Amazon BR',
      competenceDate: '2026-10-20',
      currency: 'BRL',
      amountOriginal: 250.50,
      entryDirection: 'CREDIT',
      amountBrl: 250.50,
      fxRate: 1.0,
      fxSource: 'PARITY_BRL',
      category: 'RECEITA_BRUTA',
      status: 'REALIZADO',
      metadata: { threadSafe: true },
      environment: 'staging',
    };

    // 10 workers simultâneos utilizando o pool isolado
    const concurrentPromises = Array.from({ length: 10 }, async (_, i) => {
      const c = await isolatedPool.connect();
      await c.query(`SET search_path TO ${isolatedSchema}, public;`);
      try {
        return await recordFinancialLedgerEntry(
          {
            ...concurrentPayload,
            entryNumber: `TEST-P1-CONC-${Date.now()}-${i}`,
          },
          c
        );
      } finally {
        c.release();
      }
    });

    const concurrentResults = await Promise.all(concurrentPromises);
    const uniqueIds = new Set(concurrentResults.map((r) => r.id));
    console.log('    [Debug Concurrency] Unique IDs:', Array.from(uniqueIds));
    assert(uniqueIds.size === 1, '10 inserções simultâneas concorrentes convergiram para exatamente 1 registro sem erro UNIQUE');

    // -------------------------------------------------------------
    // BLOCO 4: ESTORNOS COMPENSATÓRIOS MULTICANAL (US, BR, ML) & PRESERVAÇÃO
    // -------------------------------------------------------------
    console.log('\n--- Bloco 4: Estornos Multicanal (US, BR, ML) & Preservação (Item 5) ---');

    // 4.1 Estorno US REALIZADO
    const revUsRealizado = await recordCompensatoryReversal(
      recorded1.entryNumber,
      'Cancelamento pedido US',
      'AUDITOR_SUPERADMIN',
      testClient
    );
    assert(revUsRealizado.status === 'REALIZADO', 'Estorno US REALIZADO preserva status REALIZADO');
    assert(revUsRealizado.currency === 'USD', 'Estorno US preserva moeda USD');
    assert(revUsRealizado.category === 'RECEITA_BRUTA', 'Estorno US neutraliza 1:1 categoria RECEITA_BRUTA');
    assert(revUsRealizado.entryDirection === 'DEBIT', 'Estorno US inverte CREDIT para DEBIT');

    // 4.2 Lançamento e Estorno no Mercado Livre (BRL)
    const mlEntry: FinancialLedgerEntry = {
      entryNumber: `TEST-P1-ML-SALE-${Date.now()}`,
      idempotencyKey: `idemp-ml-sale-${Date.now()}`,
      sourceEventType: 'ORDER_SALE',
      sourceId: 'ORD-ML-SALE-101',
      marketplace: 'Mercado Livre',
      competenceDate: '2026-10-22',
      currency: 'BRL',
      amountOriginal: 180.00,
      entryDirection: 'CREDIT',
      amountBrl: 180.00,
      fxRate: 1.0,
      fxSource: 'PARITY_BRL',
      category: 'RECEITA_BRUTA',
      status: 'REALIZADO',
      metadata: { channel: 'Mercado Livre' },
      environment: 'staging',
    };
    const recordedMl = await recordFinancialLedgerEntry(mlEntry, testClient);
    const revMlRealizado = await recordCompensatoryReversal(
      recordedMl.entryNumber,
      'Devolução do comprador Mercado Livre',
      'AUDITOR_SUPERADMIN',
      testClient
    );
    assert(revMlRealizado.status === 'REALIZADO', 'Estorno ML preserva status REALIZADO');
    assert(revMlRealizado.marketplace === 'Mercado Livre', 'Estorno ML preserva canal Mercado Livre');
    assert(revMlRealizado.currency === 'BRL', 'Estorno ML preserva moeda BRL');

    // Inserir venda definitiva no Mercado Livre que permanecerá ativa
    await recordFinancialLedgerEntry({
      entryNumber: `TEST-P1-ML-KEEP-${Date.now()}`,
      idempotencyKey: `idemp-ml-keep-${Date.now()}`,
      sourceEventType: 'ORDER_SALE',
      sourceId: 'ORD-ML-KEEP-202',
      marketplace: 'Mercado Livre',
      competenceDate: '2026-10-25',
      currency: 'BRL',
      amountOriginal: 180.00,
      entryDirection: 'CREDIT',
      amountBrl: 180.00,
      fxRate: 1.0,
      fxSource: 'PARITY_BRL',
      category: 'RECEITA_BRUTA',
      status: 'REALIZADO',
      metadata: { platform: 'Mercado Livre' },
      environment: 'staging',
    }, testClient);

    // 4.3 Lançamento e Estorno de Taxa ESTIMADO
    const estEntry: FinancialLedgerEntry = {
      entryNumber: `TEST-P1-EST-FEE-${Date.now()}`,
      idempotencyKey: `idemp-est-fee-${Date.now()}`,
      sourceEventType: 'FULFILLMENT_FBA',
      sourceId: 'ORD-EST-001',
      marketplace: 'Amazon US',
      competenceDate: '2026-10-15',
      currency: 'USD',
      amountOriginal: 15.00,
      entryDirection: 'DEBIT',
      amountBrl: 85.26,
      fxRate: 5.6842,
      fxSource: 'SYNTHETIC_TEST_RATE',
      category: 'FULFILLMENT_FBA',
      status: 'ESTIMADO',
      metadata: { feeEstimate: true },
      environment: 'staging',
    };
    const recordedEst = await recordFinancialLedgerEntry(estEntry, testClient);
    assert(recordedEst.status === 'ESTIMADO', 'Lançamento original registrado como ESTIMADO');

    const revEstimado = await recordCompensatoryReversal(
      recordedEst.entryNumber,
      'Ajuste de estimativa de fulfillment',
      'AUDITOR_SUPERADMIN',
      testClient
    );
    assert(revEstimado.status === 'ESTIMADO', 'Estorno de registro ESTIMADO permanece estritamente ESTIMADO (não vira REALIZADO)');
    assert(revEstimado.entryDirection === 'CREDIT', 'Estorno de despesa ESTIMADA inverte DEBIT para CREDIT');
    assert(revEstimado.category === 'FULFILLMENT_FBA', 'Estorno mantém categoria FULFILLMENT_FBA');

    // -------------------------------------------------------------
    // BLOCO 5: IMUTABILIDADE DO TRIGGER & VERIFICAÇÃO ATIVA (Item 6)
    // -------------------------------------------------------------
    console.log('\n--- Bloco 5: Imutabilidade Estrita do Trigger (Item 6) ---');

    let trgBlockedUpdate = false;
    try {
      await testClient.query(
        `UPDATE ${isolatedSchema}.financial_ledger SET amount_original = 999 WHERE id = $1;`,
        [recorded1.id]
      );
    } catch (e: any) {
      if (e.message.includes('Immutability violation')) {
        trgBlockedUpdate = true;
      }
    }
    assert(trgBlockedUpdate, 'Trigger de imutabilidade bloqueia UPDATE em REALIZADO sem qualquer exceção de role');

    let trgBlockedDelete = false;
    try {
      await testClient.query(
        `DELETE FROM ${isolatedSchema}.financial_ledger WHERE id = $1;`,
        [recorded1.id]
      );
    } catch (e: any) {
      if (e.message.includes('Immutability violation')) {
        trgBlockedDelete = true;
      }
    }
    assert(trgBlockedDelete, 'Trigger de imutabilidade bloqueia DELETE em REALIZADO');

    // Verificar se trigger está formalmente ativo em pg_trigger
    const trgCheck = await checkClient.query(`
      SELECT tgname, tgenabled
      FROM pg_trigger
      WHERE tgname = 'trg_prevent_financial_ledger_tampering';
    `);
    assert(
      trgCheck.rows.length > 0 && trgCheck.rows[0].tgenabled === 'O',
      'Trigger de imutabilidade confirmado 100% ATIVO no PostgreSQL público (tgenabled = O)'
    );

    // -------------------------------------------------------------
    // BLOCO 6: VALIDAÇÃO DE DATAS CALENDÁRIO & SEGREGAÇÃO MULTICANAL (Item 2 & 5)
    // -------------------------------------------------------------
    console.log('\n--- Bloco 6: Validação de Datas Calendário e Segregação Multicanal (Item 2 & 5) ---');

    // 6.1 Intervalo invertido
    let invertedRangeBlocked = false;
    try {
      await calculateAuditedDre('2026-11-15:2026-10-15', testClient);
    } catch (e: any) {
      if (e.message.includes('INVALID_DATE_RANGE')) {
        invertedRangeBlocked = true;
      }
    }
    assert(invertedRangeBlocked, 'Intervalo de datas invertido dispara INVALID_DATE_RANGE');

    // 6.2 Data impossível no calendário em range (ex: 2026-02-30)
    let impossibleDateRangeBlocked = false;
    try {
      await calculateAuditedDre('2026-02-30:2026-03-15', testClient);
    } catch (e: any) {
      if (e.message.includes('INVALID_DATE_RANGE')) {
        impossibleDateRangeBlocked = true;
      }
    }
    assert(impossibleDateRangeBlocked, 'Data inexistente (2026-02-30) no intervalo dispara INVALID_DATE_RANGE');

    // 6.3 Data de 31 de Abril (mês de 30 dias)
    let april31Blocked = false;
    try {
      await calculateAuditedDre('2026-04-01:2026-04-31', testClient);
    } catch (e: any) {
      if (e.message.includes('INVALID_DATE_RANGE')) {
        april31Blocked = true;
      }
    }
    assert(april31Blocked, 'Data impossível (2026-04-31) no intervalo dispara INVALID_DATE_RANGE');

    // 6.4 Mês inválido (2026-13)
    let invalidMonthBlocked = false;
    try {
      await calculateAuditedDre('2026-13', testClient);
    } catch (e: any) {
      if (e.message.includes('INVALID_PERIOD_FORMAT')) {
        invalidMonthBlocked = true;
      }
    }
    assert(invalidMonthBlocked, 'Mês inexistente (2026-13) dispara INVALID_PERIOD_FORMAT');

    // 6.5 Ano fora de faixa (1999)
    let outOfRangeYearBlocked = false;
    try {
      await calculateAuditedDre('1999', testClient);
    } catch (e: any) {
      if (e.message.includes('INVALID_PERIOD_FORMAT')) {
        outOfRangeYearBlocked = true;
      }
    }
    assert(outOfRangeYearBlocked, 'Ano fora da faixa permitida (1999) dispara INVALID_PERIOD_FORMAT');

    // 6.6 Demonstrativo Multicanal DRE com Não-Duplicação e Preservação
    const dreResult = await calculateAuditedDre('2026-10', testClient);

    // Amazon US: neutralizada 1:1, sem distorção
    assert(dreResult.us.currency === 'USD', 'Demonstrativo Amazon US expresso estritamente em moeda nativa USD');
    assert(dreResult.us.grossRevenue.total === 0.00, 'Receita Amazon US neutralizada pelo estorno (100 - 100 = 0)');
    assert(dreResult.us.deductions.fulfillmentFees.total === 0.00, 'Tarifa FBA estimada US neutralizada pelo estorno (15 - 15 = 0)');

    // Amazon BR: nativa BRL
    assert(dreResult.br.currency === 'BRL', 'Demonstrativo Amazon BR expresso estritamente em moeda nativa BRL');
    assert(dreResult.br.grossRevenue.total === 250.50, 'Receita Amazon BR contém exclusivamente suas vendas nativas (250.50 BRL)');

    // Mercado Livre: ativo e segregado (venda 180 estornada + venda 180 mantida = 180.00)
    assert(dreResult.ml.currency === 'BRL', 'Demonstrativo Mercado Livre expresso separadamente em BRL');
    assert(dreResult.ml.grossRevenue.total === 180.00, 'Receita Mercado Livre segregada com exatidão (180.00 BRL)');
    assert(dreResult.ml.auditSummary.reversalEntries === 1, 'Auditoria do Mercado Livre documenta exatamente 1 estorno');

    // Consolidado Global: soma exclusiva em BRL via taxas autoritativas (sem soma indevida de USD)
    // Consolidado = 250.50 (Amazon BR) + 180.00 (Mercado Livre) = 430.50 BRL
    assert(
      dreResult.consolidated.currency === 'BRL' && dreResult.consolidated.grossRevenue.total === 430.50,
      'Consolidado Global agrega exclusivamente valores em BRL convertidos (250.50 + 180.00 = 430.50 BRL, sem soma indevida de USD)'
    );

    // -------------------------------------------------------------
    // BLOCO 7: TEARDOWN CONTROLADO & AUDITORIA DE RECONCILIAÇÃO
    // -------------------------------------------------------------
    console.log('\n--- Bloco 7: Teardown Controlado & Verificação da Base Pública ---');

    testClient.release();
    await isolatedPool.end();

    // Eliminação limpa das tabelas do schema isolado via DDL (sem violar trigger row-level)
    await checkClient.query(`DROP TABLE IF EXISTS ${isolatedSchema}.financial_ledger CASCADE;`);
    await checkClient.query(`DROP TABLE IF EXISTS ${isolatedSchema}.fx_rates CASCADE;`);
    console.log(`  Tabelas do schema isolado ${isolatedSchema} removidas com sucesso.`);

    // Garantir que a tabela pública financial_ledger permaneceu 100% intocada
    const publicCount = await checkClient.query(`SELECT count(*) FROM public.financial_ledger;`);
    assert(
      Number(publicCount.rows[0].count) === 0,
      'Tabela pública financial_ledger preservada com exatamente 0 registros (zero poluição em staging compartilhado)'
    );

    // Confirmar que triggers públicos continuam ativos e sem bypass
    const finalTrg = await checkClient.query(`
      SELECT tgname, tgenabled
      FROM pg_trigger
      WHERE tgname = 'trg_prevent_financial_ledger_tampering';
    `);
    assert(
      finalTrg.rows[0].tgenabled === 'O',
      'Trigger público trg_prevent_financial_ledger_tampering permanentemente ativo (tgenabled = O) e sem backdoor'
    );

    console.log('\n================================================================');
    console.log(`RESULTADO FINAL DA SUÍTE P1: ${passed}/${total} ASSERÇÕES APROVADAS! (100% PASS)`);
    console.log('================================================================');
  } finally {
    try {
      await checkClient.query(`DROP TABLE IF EXISTS ${isolatedSchema}.financial_ledger CASCADE;`);
      await checkClient.query(`DROP TABLE IF EXISTS ${isolatedSchema}.fx_rates CASCADE;`);
    } catch {}
    await checkClient.end();
  }
}

runTestSuite().catch((err) => {
  console.error('\n[FAIL] ERRO NA SUÍTE DE TESTES P1:', err);
  process.exit(1);
});
