'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {isValidDate,buildBcbUrl,readClosingObservation}=require('./lib/bcb_ptax_validation.cjs');
test('rejects impossible calendar dates',()=>{
  assert.equal(isValidDate('2026-02-30'),false);
  assert.equal(isValidDate('2024-02-29'),true);
  assert.equal(isValidDate('2026-11-03'),true);
});
test('pins BCB HTTPS origin and day in query',()=>{
  const url=new URL(buildBcbUrl('2026-11-03'));
  assert.equal(url.hostname,'olinda.bcb.gov.br');
  assert.equal(url.protocol,'https:');
  assert.equal(url.searchParams.get('@dataCotacao'),"'11-03-2026'");
  assert.equal(url.searchParams.get('$format'),'json');
});
const row={tipoBoletim:'Fechamento',cotacaoVenda:5.1234,dataHoraCotacao:'2026-11-03 13:05:00.000'};
test('accepts exactly one valid BCB closing bulletin',()=>{
  assert.equal(readClosingObservation({value:[row]},'2026-11-03').rate,5.1234);
});
test('rejects empty, duplicate, synthetic, and wrong-date closing bullets',()=>{
  assert.throws(()=>readClosingObservation({value:[]},'2026-11-03'),/NOT_UNIQUE/);
  assert.throws(()=>readClosingObservation({value:[row,row]},'2026-11-03'),/NOT_UNIQUE/);
  assert.throws(()=>readClosingObservation({value:[{...row,cotacaoVenda:NaN}]},'2026-11-03'),/RATE_INVALID/);
  assert.throws(()=>readClosingObservation({value:[{...row,dataHoraCotacao:'2026-11-02 13:00'}]},'2026-11-03'),/DATE_MISMATCH/);
});
