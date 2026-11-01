import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
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
  console.log('SUÍTE DE AUDITORIA & REMEDIAÇÃO P1: FINANCIAL LEDGER & DRE (046)');
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

  // Ensure pristine baseline: clean up any leftover TEST-P1- records from aborted runs
  await checkClient.query(`SET helpus.test_cleanup_active = 'true';`);
  await checkClient.query(`DELETE FROM financial_ledger WHERE entry_number LIKE 'TEST-P1-%' OR entry_number LIKE 'REV-TEST-P1-%';`);
  await checkClient.query(`SET helpus.test_cleanup_active = 'false';`);

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS [${total}]: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL [${total}]: ${desc}`);
      throw new Error(`Assertion failed: ${desc}`);
    }
  }

  try {
    // -------------------------------------------------------------
    // BLOCO 1: TAXAS DE CÂMBIO HISTÓRICAS & POLÍTICA FAIL-CLOSED
    // -------------------------------------------------------------
    console.log('\n--- Bloco 1: Taxas de Câmbio Históricas & Política Fail-Closed ---');

    // 1.1 Inserir taxa histórica PTAX
    const testFx: FxRateRecord = {
      rateDate: '2026-10-15',
      currencyFrom: 'USD',
      currencyTo: 'BRL',
      rate: 5.6842,
      source: 'BCB_PTAX_OFICIAL',
      isFallback: false,
    };
    const savedFx = await recordFxRate(testFx);
    assert(savedFx.rate === 5.6842, 'Taxa histórica PTAX salva com precisão decimal');
    assert(savedFx.source === 'BCB_PTAX_OFICIAL', 'Fonte oficial gravada corretamente');

    // 1.2 Recuperar taxa exata
    const retrievedFx = await getFxRate('2026-10-15', 'USD', 'BRL');
    assert(retrievedFx.rate === 5.6842, 'Recuperação de taxa exata coincide');
    assert(!retrievedFx.isFallback, 'Recuperação exata não é fallback');

    // 1.3 Recuperar data de fim de semana (prior close fallback)
    const fallbackFx = await getFxRate('2026-10-18', 'USD', 'BRL');
    assert(fallbackFx.rate === 5.6842, 'Data de fim de semana utiliza fechamento anterior documentado');
    assert(fallbackFx.isFallback === true, 'Indicador de fallback ativado para data derivada');

    // 1.4 Moedas idênticas retornam paridade
    const parityFx = await getFxRate('2026-10-15', 'BRL', 'BRL');
    assert(parityFx.rate === 1.0 && parityFx.source === 'PARITY', 'BRL->BRL retorna paridade exata 1.0');

    // 1.5 Fail-Closed quando taxa não existe (Commit 05b906f / Ordem 046 Item 5)
    let fxErrorThrown = false;
    try {
      await getFxRate('2024-01-01', 'USD', 'BRL');
    } catch (e: any) {
      if (e.message.includes('FX_RATE_UNAVAILABLE')) {
        fxErrorThrown = true;
      }
    }
    assert(fxErrorThrown, 'Cotação ausente dispara FX_RATE_UNAVAILABLE (proibido sintetizar fallback arbitrário)');

    // -------------------------------------------------------------
    // BLOCO 2: IDEMPOTÊNCIA E DIVERGÊNCIA DE PAYLOAD
    // -------------------------------------------------------------
    console.log('\n--- Bloco 2: Idempotência e Divergência de Payload ---');

    const entryIdempKey = `test-idemp-${Date.now()}`;
    const testEntry: FinancialLedgerEntry = {
      entryNumber: `TEST-P1-ORD-001-${Date.now()}`,
      idempotencyKey: entryIdempKey,
      sourceEventType: 'ORDER_SALE',
      sourceId: 'ORD-TEST-999',
      marketplace: 'Amazon US',
      competenceDate: '2026-10-15',
      currency: 'USD',
      amountOriginal: 100.00,
      entryDirection: 'CREDIT',
      amountBrl: 0,
      fxRate: 0,
      fxSource: '',
      category: 'RECEITA_BRUTA',
      status: 'REALIZADO',
      metadata: { sku: 'TEST-SKU-1', quantity: 1 },
      environment: 'staging',
    };

    const recorded1 = await recordFinancialLedgerEntry(testEntry);
    assert(recorded1.entryNumber === testEntry.entryNumber, 'Lançamento original gravado com sucesso');
    assert(recorded1.amountBrl === 568.42, 'Conversão automática USD->BRL via taxa do dia (100 * 5.6842 = 568.42)');

    // Inserir novamente com mesmo payload exato
    const recorded2 = await recordFinancialLedgerEntry({ ...testEntry });
    assert(recorded2.id === recorded1.id, 'Idempotência com mesmo payload retorna mesmo ID');

    // Inserir com payload divergente (mesma idempotency_key, mas valor diferente) -> Deve falhar!
    let payloadMismatchCaught = false;
    try {
      await recordFinancialLedgerEntry({
        ...testEntry,
        amountOriginal: 999.99,
      });
    } catch (e: any) {
      if (e.message.includes('IDEMPOTENCY_PAYLOAD_MISMATCH')) {
        payloadMismatchCaught = true;
      }
    }
    assert(payloadMismatchCaught, 'Tentativa de reusar chave com payload divergente dispara IDEMPOTENCY_PAYLOAD_MISMATCH');

    // -------------------------------------------------------------
    // BLOCO 3: TESTE DE CONCORRÊNCIA REAL E RACE CONDITIONS
    // -------------------------------------------------------------
    console.log('\n--- Bloco 3: Teste de Concorrência Real e Race Conditions ---');

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

    // Executa 10 inserções paralelas simultâneas
    const concurrentPromises = Array.from({ length: 10 }, (_, i) =>
      recordFinancialLedgerEntry({
        ...concurrentPayload,
        entryNumber: `TEST-P1-CONC-${Date.now()}-${i}`,
      })
    );

    const concurrentResults = await Promise.all(concurrentPromises);
    const uniqueIds = new Set(concurrentResults.map((r) => r.id));
    assert(uniqueIds.size === 1, '10 inserções simultâneas concorrentes convergiram para exatamente 1 registro sem erro UNIQUE');

    // -------------------------------------------------------------
    // BLOCO 4: ESTORNO COMPENSATÓRIO COM NEUTRALIZAÇÃO 1:1
    // -------------------------------------------------------------
    console.log('\n--- Bloco 4: Estorno Compensatório com Neutralização 1:1 ---');

    const reversal = await recordCompensatoryReversal(
      recorded1.entryNumber,
      'Cliente cancelou pedido antes do despacho',
      'AUDITOR_SUPERADMIN'
    );

    assert(reversal.entryDirection === 'DEBIT', 'Estorno inverteu direção contábil (CREDIT -> DEBIT)');
    assert(reversal.category === 'RECEITA_BRUTA', 'Estorno manteve categoria original RECEITA_BRUTA para neutralização exata');
    assert(reversal.reversalOfId === recorded1.id, 'Estorno mantém vínculo explícito ao lançamento original (reversal_of_id)');
    assert(reversal.amountOriginal === 100.00, 'Valor do estorno igual ao original');

    // -------------------------------------------------------------
    // BLOCO 5: TRIGGER DE IMUTABILIDADE POSTGRESQL & VERIFICAÇÃO DE ATIVAÇÃO
    // -------------------------------------------------------------
    console.log('\n--- Bloco 5: Imutabilidade de Transações REALIZADAS ---');

    let triggerBlockedUpdate = false;
    try {
      await checkClient.query(
        `UPDATE financial_ledger SET amount_original = 500 WHERE id = $1;`,
        [recorded1.id]
      );
    } catch (e: any) {
      if (e.message.includes('Immutability violation')) {
        triggerBlockedUpdate = true;
      }
    }
    assert(triggerBlockedUpdate, 'Trigger impediu UPDATE direto em lançamento REALIZADO');

    let triggerBlockedDelete = false;
    try {
      await checkClient.query(
        `DELETE FROM financial_ledger WHERE id = $1;`,
        [recorded1.id]
      );
    } catch (e: any) {
      if (e.message.includes('Immutability violation')) {
        triggerBlockedDelete = true;
      }
    }
    assert(triggerBlockedDelete, 'Trigger impediu DELETE direto em lançamento REALIZADO');

    // Verificar se o gatilho está formalmente habilitado no catálogo do PostgreSQL
    const trgCheck = await checkClient.query(`
      SELECT tgname, tgenabled
      FROM pg_trigger
      WHERE tgname = 'trg_prevent_financial_ledger_tampering';
    `);
    assert(
      trgCheck.rows.length > 0 && trgCheck.rows[0].tgenabled === 'O',
      'Gatilho de imutabilidade confirmado 100% ATIVO no PostgreSQL (tgenabled=O)'
    );

    // -------------------------------------------------------------
    // BLOCO 6: SEGREGAÇÃO REALIZADO/ESTIMADO E PERIODIZAÇÃO COM VIRADA DE MÊS
    // -------------------------------------------------------------
    console.log('\n--- Bloco 6: Segregação e Periodização com Virada de Mês ---');

    // Lançamento em Novembro para testar virada de mês/ano
    await recordFinancialLedgerEntry({
      entryNumber: `TEST-P1-NOV-${Date.now()}`,
      idempotencyKey: `test-idemp-nov-${Date.now()}`,
      sourceEventType: 'ORDER_SALE',
      sourceId: 'ORD-NOV-001',
      marketplace: 'Amazon BR',
      competenceDate: '2026-11-05',
      currency: 'BRL',
      amountOriginal: 300.00,
      entryDirection: 'CREDIT',
      amountBrl: 300.00,
      fxRate: 1.0,
      fxSource: 'PARITY_BRL',
      category: 'RECEITA_BRUTA',
      status: 'REALIZADO',
      metadata: { month: 'November' },
      environment: 'staging',
    });

    // Inserir taxa estimada em Outubro
    await recordFinancialLedgerEntry({
      entryNumber: `TEST-P1-EST-FBA-${Date.now()}`,
      idempotencyKey: `test-est-fba-${Date.now()}`,
      sourceEventType: 'FULFILLMENT_FBA',
      sourceId: 'ORD-TEST-999',
      marketplace: 'Amazon US',
      competenceDate: '2026-10-15',
      currency: 'USD',
      amountOriginal: 3.25,
      entryDirection: 'DEBIT',
      amountBrl: 18.47,
      fxRate: 5.6842,
      fxSource: 'BCB_PTAX_OFICIAL',
      category: 'FULFILLMENT_FBA',
      status: 'ESTIMADO',
      metadata: { simulated: true },
      environment: 'staging',
    });

    // 6.1 DRE Filtrada por Outubro (Não pode conter Novembro)
    const dreOct = await calculateAuditedDre('2026-10');
    assert(dreOct.br.grossRevenue.total === 250.50, 'Filtro 2026-10 contém apenas vendas de Outubro');
    assert(dreOct.us.deductions.fulfillmentFees.estimado === 3.25, 'Tarifa FBA estimada presente em Outubro');
    assert(dreOct.us.deductions.fulfillmentFees.realizado === 0, 'Tarifa FBA estimada não polui realizado');

    // 6.2 DRE por Intervalo de Datas com Virada de Mês (2026-10-15 a 2026-11-15)
    const dreRange = await calculateAuditedDre('2026-10-15:2026-11-15');
    assert(
      dreRange.br.grossRevenue.total === 550.50,
      'Intervalo 2026-10-15:2026-11-15 engloba com precisão Outubro (250.50) + Novembro (300.00) = 550.50'
    );

    // 6.3 Verificação da neutralização do estorno:
    // Na US, venda foi 100.00 (CREDIT) e estorno foi 100.00 (DEBIT) em RECEITA_BRUTA
    // Logo, a Receita Bruta da US deve ser exatamente 0.00!
    assert(dreOct.us.grossRevenue.total === 0.00, 'Estorno neutralizou exatamente a Receita Bruta da US (100 - 100 = 0.00)');
    assert(dreOct.us.deductions.reversals.total === 100.00, 'Estorno registrado como métrica de auditoria');
    assert(dreOct.us.deductions.totalDeductions.total === 3.25, 'Deduções não sofrem dupla dedução pelo estorno (total = 3.25 da taxa FBA)');

    // -------------------------------------------------------------
    // BLOCO 7: RECONCILIAÇÃO & LIMPEZA CONTROLADA SEM DESATIVAR TRIGGER
    // -------------------------------------------------------------
    console.log('\n--- Bloco 7: Reconciliação & Limpeza Scoped em Staging ---');

    // Limpeza utilizando a variável de sessão helpus.test_cleanup_active no trigger
    await checkClient.query(`SET helpus.test_cleanup_active = 'true';`);
    const delRes = await checkClient.query(
      `DELETE FROM financial_ledger WHERE entry_number LIKE 'TEST-P1-%' OR entry_number LIKE 'REV-TEST-P1-%';`
    );
    await checkClient.query(`SET helpus.test_cleanup_active = 'false';`);
    console.log(`  Registros de teste excluídos com segurança transacional: ${delRes.rowCount}`);

    const countRes = await checkClient.query(`SELECT count(*) FROM financial_ledger;`);
    assert(Number(countRes.rows[0].count) === 0, 'Base de staging reconciliada para baseline 0 registros de ledger');

    // Reconfirmar que trigger permanece ativo após o encerramento da limpeza
    const finalTrgCheck = await checkClient.query(`
      SELECT tgname, tgenabled
      FROM pg_trigger
      WHERE tgname = 'trg_prevent_financial_ledger_tampering';
    `);
    assert(
      finalTrgCheck.rows[0].tgenabled === 'O',
      'Gatilho de imutabilidade permanentemente ATIVO e inviolado após a limpeza de staging'
    );

    console.log('\n================================================================');
    console.log(`RESULTADO DA AUDITORIA P1: ${passed}/${total} ASSERÇÕES APROVADAS! (100% PASS)`);
    console.log('================================================================');
  } finally {
    try {
      await checkClient.query(`SET helpus.test_cleanup_active = 'true';`);
      await checkClient.query(`DELETE FROM financial_ledger WHERE entry_number LIKE 'TEST-P1-%' OR entry_number LIKE 'REV-TEST-P1-%';`);
      await checkClient.query(`SET helpus.test_cleanup_active = 'false';`);
    } catch {}
    await checkClient.end();
  }
}

runTestSuite().catch((err) => {
  console.error('\n❌ ERRO NA SUÍTE DE TESTES P1:', err);
  process.exit(1);
});
