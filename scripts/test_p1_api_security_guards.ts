import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { GET as getDreRoute } from '../src/app/api/finance/dre/route';

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

async function runSecurityTests() {
  console.log('================================================================');
  console.log('TESTES DE SEGURANÇA RBAC & FAIL-CLOSED: /api/finance/dre (P1)');
  console.log('================================================================');

  if (process.env.STAGING_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.STAGING_DATABASE_URL;
  }

  process.env.HELPUS_OPERATOR_TOKEN = 'staging-operator-token-valid-12345';
  process.env.HELPUS_API_SECRET = 'master-secret-valid-99999';

  let total = 0;
  let passed = 0;

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

  // Test 1: Anonymous request -> 403 Forbidden
  const reqAnon = new NextRequest('http://localhost:3000/api/finance/dre');
  const resAnon = await getDreRoute(reqAnon);
  const dataAnon = await resAnon.json();
  assert(resAnon.status === 403, 'Acesso anônimo retorna HTTP 403 Forbidden');
  assert(dataAnon.success === false, 'Resposta contém success: false');

  // Test 2: Authenticated request in PRODUCTION mode (fail-closed check)
  (process.env as any).NODE_ENV = 'production';
  process.env.VERCEL = '1';
  delete process.env.P1_HOMOLOGATED_PRODUCTION;

  const reqAuthProd = new NextRequest('http://localhost:3000/api/finance/dre', {
    headers: {
      'x-api-key': 'staging-operator-token-valid-12345',
    },
  });
  const resProd = await getDreRoute(reqAuthProd);
  const dataProd = await resProd.json();
  assert(resProd.status === 503, 'Produção não homologada retorna HTTP 503 Fail-Closed');
  assert(dataProd.status === 'P1_NOT_HOMOLOGATED', 'Status retornado é P1_NOT_HOMOLOGATED');

  // Test 3: Authenticated request in STAGING mode
  (process.env as any).NODE_ENV = 'development';
  delete process.env.VERCEL;

  const reqAuthDev = new NextRequest('http://localhost:3000/api/finance/dre?period=2026-10', {
    headers: {
      'x-api-key': 'staging-operator-token-valid-12345',
    },
  });
  const resDev = await getDreRoute(reqAuthDev);
  const dataDev = await resDev.json();
  assert(resDev.status === 200, 'Acesso autenticado de operador em staging/dev retorna HTTP 200 OK');
  assert(dataDev.success === true, 'DRE calculada com sucesso');
  assert(dataDev.statements && dataDev.statements.consolidated, 'Estrutura consolidada presente no retorno');

  // Test 4: Reject client-supplied PTAX parameter (Commit bf07968 / Order 046 Item 7)
  const reqPtaxRejection = new NextRequest('http://localhost:3000/api/finance/dre?period=2026-10&ptax=6.15', {
    headers: {
      'x-api-key': 'staging-operator-token-valid-12345',
    },
  });
  const resPtax = await getDreRoute(reqPtaxRejection);
  const dataPtax = await resPtax.json();
  assert(resPtax.status === 400, 'Requisição com PTAX customizada é rejeitada com HTTP 400 Bad Request');
  assert(dataPtax.error === 'PTAX customizada não permitida na DRE auditada.', 'Mensagem de bloqueio de PTAX customizada confirmada');

  console.log('\n================================================================');
  console.log(`RESULTADO DA SEGURANÇA P1: ${passed}/${total} TESTES APROVADOS! (100% PASS)`);
  console.log('================================================================');
}

runSecurityTests().catch((err) => {
  console.error('\n❌ ERRO NOS TESTES DE SEGURANÇA P1:', err);
  process.exit(1);
});
