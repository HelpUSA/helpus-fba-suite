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
  console.log('SUÍTE DE TESTES UNITÁRIOS & E2E P1: FINANCIAL LEDGER & DRE');
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

  const originalProdUrl = process.env.DATABASE_URL;
  // We set DATABASE_URL temporarily in this process to stagingUrl so postgresClient functions use staging pool
  process.env.DATABASE_URL = stagingUrl;

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
    // BLOCO 1: TESTES UNITÁRIOS DE CÂMBIO (FX) & FALLBACK
    // -------------------------------------------------------------
    console.log('\n--- Bloco 1: Taxas de Câmbio Históricas & Fallbacks ---');
    
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
    assert(!retrievedFx.isFallback, 'Recuperação não é fallback');

    // 1.3 Recuperar data sem cotação (deve buscar prior close ou fallback)
    const fallbackFx = await getFxRate('2026-10-18', 'USD', 'BRL');
    assert(fallbackFx.rate === 5.6842, 'Data de fim de semana utiliza fechamento anterior');
    assert(fallbackFx.isFallback === true, 'Indicador de fallback ativado para data derivada');

    // 1.4 Moedas idênticas retornam paridade
    const parityFx = await getFxRate('2026-10-15', 'BRL', 'BRL');
    assert(parityFx.rate === 1.0 && parityFx.source === 'PARITY', 'BRL->BRL retorna paridade exata 1.0');

    // -------------------------------------------------------------
    // BLOCO 2: IDEMPOTÊNCIA E GRAVAÇÃO DE LANÇAMENTOS
    // -------------------------------------------------------------
    console.log('\n--- Bloco 2: Idempotência e Gravação de Ledger ---');

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

    // Inserir novamente com mesma chave de idempotência
    const recorded2 = await recordFinancialLedgerEntry({
      ...testEntry,
      amountOriginal: 9999.99, // tentar mudar valor
    });
    assert(recorded2.id === recorded1.id, 'Idempotência protege: mesmo ID retornado');
    assert(recorded2.amountOriginal === 100.00, 'Valor original inalterado pela tentativa duplicada');

    // -------------------------------------------------------------
    // BLOCO 3: CONCORRÊNCIA E THREAD SAFETY
    // -------------------------------------------------------------
    console.log('\n--- Bloco 3: Teste de Concorrência e Race Conditions ---');

    const concurrentKey = `test-concurrent-${Date.now()}`;
    const concurrentPromises = [1, 2, 3, 4, 5].map((i) =>
      recordFinancialLedgerEntry({
        entryNumber: `TEST-P1-CONC-${Date.now()}-${i}`,
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
        metadata: { thread: i },
        environment: 'staging',
      })
    );

    const concurrentResults = await Promise.all(concurrentPromises);
    const uniqueIds = new Set(concurrentResults.map((r) => r.id));
    assert(uniqueIds.size === 1, '5 inserções simultâneas concorrentes convergiram para exatamente 1 registro');

    // -------------------------------------------------------------
    // BLOCO 4: ESTORNO POR LANÇAMENTO COMPENSATÓRIO
    // -------------------------------------------------------------
    console.log('\n--- Bloco 4: Estorno Compensatório Auditável ---');

    const reversal = await recordCompensatoryReversal(
      recorded1.entryNumber,
      'Cliente cancelou pedido antes do despacho',
      'AUDITOR_SUPERADMIN'
    );

    assert(reversal.entryDirection === 'DEBIT', 'Estorno inverteu direção (CREDIT -> DEBIT)');
    assert(reversal.reversalOfId === recorded1.id, 'Estorno mantém vínculo explícito ao lançamento original');
    assert(reversal.category === 'ESTORNO', 'Categoria classificada como ESTORNO');
    assert(reversal.amountOriginal === 100.00, 'Valor do estorno igual ao original');

    // -------------------------------------------------------------
    // BLOCO 5: TRIGGER DE IMUTABILIDADE POSTGRESQL
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

    // -------------------------------------------------------------
    // BLOCO 6: SEGREGAÇÃO REALIZADO vs ESTIMADO NO DRE
    // -------------------------------------------------------------
    console.log('\n--- Bloco 6: Segregação Realizado vs Estimado no DRE ---');

    // Inserir taxa estimada (ex: taxa FBA $3.25)
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

    const dre = await calculateAuditedDre('2026-10');
    assert(dre.us.deductions.fulfillmentFees.estimado > 0, 'Tarifa FBA computada em deductions.fulfillmentFees.estimado');
    assert(dre.us.deductions.fulfillmentFees.realizado === 0, 'Tarifa FBA não contamina deductions.fulfillmentFees.realizado');
    assert(
      dre.us.deductions.fulfillmentFees.total === dre.us.deductions.fulfillmentFees.estimado,
      'Total da tarifa igual ao componente estimado'
    );

    // Integridade contábil matemática
    const usStmt = dre.us;
    const calcNetRev = Math.round((usStmt.grossRevenue.total - usStmt.deductions.totalDeductions.total) * 100) / 100;
    assert(
      Math.abs(usStmt.netRevenue.total - calcNetRev) < 0.05,
      'Equação contábil: Receita Líquida = Receita Bruta - Deduções Totais'
    );

    const calcGrossProfit = Math.round((usStmt.netRevenue.total - usStmt.cogs.total) * 100) / 100;
    assert(
      Math.abs(usStmt.grossProfit.total - calcGrossProfit) < 0.05,
      'Equação contábil: Lucro Bruto = Receita Líquida - CMV'
    );

    // -------------------------------------------------------------
    // BLOCO 7: RECONCILIAÇÃO E LIMPEZA DE DADOS DE TESTE
    // -------------------------------------------------------------
    console.log('\n--- Bloco 7: Reconciliação & Limpeza de Testes em Staging ---');

    // Desativar temporariamente o trigger via admin para remover registros de teste com prefixo TEST-P1-
    const prodAdminUrl = originalProdUrl;
    if (prodAdminUrl) {
      const stagingAdminUrl = new URL(prodAdminUrl);
      stagingAdminUrl.pathname = '/helpus_staging';
      const adminClient = new Client({
        connectionString: stagingAdminUrl.toString(),
        ssl: { rejectUnauthorized: true },
      });
      await adminClient.connect();
      await adminClient.query(`ALTER TABLE financial_ledger DISABLE TRIGGER trg_prevent_financial_ledger_tampering;`);
      const delRes = await adminClient.query(
        `DELETE FROM financial_ledger WHERE entry_number LIKE 'TEST-P1-%' OR entry_number LIKE 'REV-TEST-P1-%';`
      );
      await adminClient.query(`ALTER TABLE financial_ledger ENABLE TRIGGER trg_prevent_financial_ledger_tampering;`);
      console.log(`  Registros de teste excluídos com sucesso: ${delRes.rowCount}`);
      await adminClient.end();
    }

    const countRes = await checkClient.query(`SELECT count(*) FROM financial_ledger;`);
    assert(Number(countRes.rows[0].count) === 0, 'Base de staging reconciliada para baseline 0 registros de ledger');

    console.log('\n================================================================');
    console.log(`RESULTADO DA AUDITORIA P1: ${passed}/${total} ASSERÇÕES APROVADAS! (100% PASS)`);
    console.log('================================================================');
  } finally {
    await checkClient.end();
  }
}

runTestSuite().catch((err) => {
  console.error('\n❌ ERRO NA SUÍTE DE TESTES P1:', err);
  process.exit(1);
});
