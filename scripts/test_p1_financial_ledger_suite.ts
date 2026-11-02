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
  console.log('SUÍTE DE AUDITORIA & HARDENING FINAL P1: ORDEM 047');
  console.log('================================================================');

  const stagingUrl = process.env.STAGING_DATABASE_URL;
  if (!stagingUrl) {
    throw new Error('STAGING_DATABASE_URL ausente em .env.local');
  }

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
  // Sem qualquer bypass ou adulteração de registros compartilhados (Ordem 047 Item 1)
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
  isolatedPool.on('connect', async (client) => {
    await client.query(`SET search_path TO ${isolatedSchema}, public;`);
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
    // BLOCO 1: TAXAS DE CÂMBIO HISTÓRICAS, IMMUTABILITY & SYNTHETIC_TEST_RATE
    // -------------------------------------------------------------
    console.log('\n--- Bloco 1: Taxas FX, Imutabilidade e SYNTHETIC_TEST_RATE (Item 4) ---');

    // 1.1 Inserir taxa de teste documentada com SYNTHETIC_TEST_RATE
    const testFx: FxRateRecord = {
      rateDate: '2026-10-15',
      currencyFrom: 'USD',
      currencyTo: 'BRL',
      rate: 5.6842,
      source: 'SYNTHETIC_TEST_RATE',
      isFallback: false,
    };
    const savedFx = await recordFxRate(testFx, testClient);
    assert(savedFx.rate === 5.6842, 'Taxa de teste salva com precisão decimal');
    assert(savedFx.source === 'SYNTHETIC_TEST_RATE', 'Fonte SYNTHETIC_TEST_RATE registrada corretamente');

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
    assert(fallbackFx.source === 'SYNTHETIC_TEST_RATE_PRIOR_CLOSE', 'Fonte documenta _PRIOR_CLOSE no fallback');
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

    // -------------------------------------------------------------
    // BLOCO 2: IDEMPOTÊNCIA COM FINGERPRINT INTEGRAL (Item 2)
    // -------------------------------------------------------------
    console.log('\n--- Bloco 2: Idempotência com Fingerprint Integral (Item 2) ---');

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
      fxSource: 'SYNTHETIC_TEST_RATE',
      category: 'RECEITA_BRUTA',
      status: 'REALIZADO',
      metadata: { sku: 'TEST-SKU-1', quantity: 1 },
      environment: 'staging',
    };

    const recorded1 = await recordFinancialLedgerEntry(baseEntry, testClient);
    assert(recorded1.entryNumber === baseEntry.entryNumber, 'Lançamento gravado com sucesso no schema isolado');

    // 2.1 Reenvio com mesmo payload integral retorna exatamente o mesmo registro
    const recorded2 = await recordFinancialLedgerEntry({ ...baseEntry }, testClient);
    assert(recorded2.id === recorded1.id, 'Idempotência com fingerprint integral idêntico retorna mesmo registro');

    // 2.2 Teste de divergência em cada dimensão do fingerprint
    const divergenceTests = [
      { name: 'amountOriginal', patch: { amountOriginal: 200.00 } },
      { name: 'currency', patch: { currency: 'BRL' as const } },
      { name: 'marketplace', patch: { marketplace: 'Amazon BR' as const } },
      { name: 'competenceDate', patch: { competenceDate: '2026-10-16' } },
      { name: 'category', patch: { category: 'CMV' as const } },
      { name: 'entryDirection', patch: { entryDirection: 'DEBIT' as const } },
      { name: 'status', patch: { status: 'ESTIMADO' as const } },
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
    // BLOCO 3: CONCORRÊNCIA REAL COM PAYLOAD IGUAL E DIVERGENTE (Item 2)
    // -------------------------------------------------------------
    console.log('\n--- Bloco 3: Concorrência Real com Payload Igual e Divergente (Item 2) ---');

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
    console.log('    [Debug Concurrency] Unique IDs count:', uniqueIds.size, 'IDs:', Array.from(uniqueIds));
    assert(uniqueIds.size === 1, '10 inserções simultâneas concorrentes convergiram para exatamente 1 registro sem erro UNIQUE');

    // -------------------------------------------------------------
    // BLOCO 4: ESTORNOS COMPENSATÓRIOS & PRESERVAÇÃO DE CLASSIFICAÇÃO (Item 3)
    // -------------------------------------------------------------
    console.log('\n--- Bloco 4: Estornos Compensatórios e Preservação de Status (Item 3) ---');

    // 4.1 Estorno de lançamento REALIZADO permanece REALIZADO
    const revRealizado = await recordCompensatoryReversal(
      recorded1.entryNumber,
      'Cancelamento de pedido aprovado',
      'AUDITOR_SUPERADMIN',
      testClient
    );
    assert(revRealizado.status === 'REALIZADO', 'Estorno de registro REALIZADO preserva status REALIZADO');
    assert(revRealizado.entryDirection === 'DEBIT', 'Estorno inverte direção contábil (CREDIT -> DEBIT)');
    assert(revRealizado.category === 'RECEITA_BRUTA', 'Estorno neutraliza 1:1 categoria RECEITA_BRUTA');

    // 4.2 Lançamento ESTIMADO
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

    // 4.3 Estorno de lançamento ESTIMADO NÃO pode virar REALIZADO (Item 3)
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
    // BLOCO 5: IMUTABILIDADE DO TRIGGER & VERIFICAÇÃO ATIVA (Item 1)
    // -------------------------------------------------------------
    console.log('\n--- Bloco 5: Imutabilidade Estrita do Trigger (Item 1) ---');

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
    // BLOCO 6: VALIDAÇÃO DE PERÍODOS & SEGREGAÇÃO MULTICANAL (Item 5)
    // -------------------------------------------------------------
    console.log('\n--- Bloco 6: Validação de Períodos e Segregação Multicanal (Item 5) ---');

    // 6.1 Teste de intervalo invertido (startDate > endDate) -> INVALID_DATE_RANGE
    let invertedRangeBlocked = false;
    try {
      await calculateAuditedDre('2026-11-15:2026-10-15', testClient);
    } catch (e: any) {
      if (e.message.includes('INVALID_DATE_RANGE')) {
        invertedRangeBlocked = true;
      }
    }
    assert(invertedRangeBlocked, 'Intervalo de datas invertido dispara INVALID_DATE_RANGE');

    // 6.2 Teste de formato inválido -> INVALID_PERIOD_FORMAT
    let invalidFormatBlocked = false;
    try {
      await calculateAuditedDre('periodo-invalido', testClient);
    } catch (e: any) {
      if (e.message.includes('INVALID_PERIOD_FORMAT')) {
        invalidFormatBlocked = true;
      }
    }
    assert(invalidFormatBlocked, 'Formato de período textual arbitrário dispara INVALID_PERIOD_FORMAT');

    // 6.3 Teste de mês inválido (mês 13) -> INVALID_PERIOD_FORMAT
    let invalidMonthBlocked = false;
    try {
      await calculateAuditedDre('2026-13', testClient);
    } catch (e: any) {
      if (e.message.includes('INVALID_PERIOD_FORMAT')) {
        invalidMonthBlocked = true;
      }
    }
    assert(invalidMonthBlocked, 'Mês inexistente (2026-13) dispara INVALID_PERIOD_FORMAT');

    // 6.4 Inserir venda no Mercado Livre para testar segregação multicanal
    await recordFinancialLedgerEntry({
      entryNumber: `TEST-P1-ML-001-${Date.now()}`,
      idempotencyKey: `test-idemp-ml-${Date.now()}`,
      sourceEventType: 'ORDER_SALE',
      sourceId: 'ORD-ML-555',
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

    // 6.5 Calcular DRE e demonstrar segregação e moedas
    const dreResult = await calculateAuditedDre('2026-10', testClient);

    // Amazon US: moeda nativa USD
    assert(dreResult.us.currency === 'USD', 'Demonstrativo Amazon US expresso estritamente em moeda nativa USD');
    assert(dreResult.us.grossRevenue.total === 0.00, 'Receita Amazon US neutralizada pelo estorno 1:1 (100 - 100 = 0)');
    assert(dreResult.us.deductions.fulfillmentFees.total === 0.00, 'Tarifa FBA estimada da US neutralizada pelo estorno estimado (15 - 15 = 0)');

    // Amazon BR: moeda nativa BRL
    assert(dreResult.br.currency === 'BRL', 'Demonstrativo Amazon BR expresso estritamente em moeda nativa BRL');
    assert(dreResult.br.grossRevenue.total === 250.50, 'Receita Amazon BR contém exclusivamente suas vendas nativas (250.50 BRL)');

    // Mercado Livre: segregado em BRL
    assert(dreResult.ml.currency === 'BRL', 'Demonstrativo Mercado Livre expresso separadamente em BRL');
    assert(dreResult.ml.grossRevenue.total === 180.00, 'Receita Mercado Livre segregada com exatidão (180.00 BRL)');

    // Consolidado: soma em BRL via conversão autoritativa sem misturar USD diretamente
    // Consolidado Bruto = 250.50 (Amazon BR) + 180.00 (Mercado Livre) = 430.50 BRL
    assert(
      dreResult.consolidated.currency === 'BRL' && dreResult.consolidated.grossRevenue.total === 430.50,
      'Consolidado Global agrega exclusivamente valores em BRL convertidos (250.50 + 180.00 = 430.50 BRL, sem soma indevida de USD)'
    );

    // -------------------------------------------------------------
    // BLOCO 7: TEARDOWN CONTROLADO & AUDITORIA DE RECONCILIAÇÃO (Item 7)
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
