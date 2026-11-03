#!/usr/bin/env node
/**
 * Fetches an official BCB PTAX USD daily bulletin via pinned HTTPS host.
 * Produces a sanitized manifest for INDEPENDENT REVIEW, never approves or
 * inserts documentary evidence and never connects to PostgreSQL.
 * Usage: node scripts/verify_bcb_ptax_source.cjs YYYY-MM-DD
 */
'use strict';
const {createHash}=require('node:crypto');
const {isValidDate,buildBcbUrl,readClosingObservation}=require('./lib/bcb_ptax_validation.cjs');
async function main(){
  const date=process.argv[2];
  if(!isValidDate(date)) throw new Error('INVALID_DATE: expected valid YYYY-MM-DD');
  const url=buildBcbUrl(date);
  const abort=new AbortController();
  const timeout=setTimeout(()=>abort.abort(),15000);
  let response;
  try{
    response=await fetch(url,{redirect:'error',signal:abort.signal,headers:{accept:'application/json'}});
    if(!response.ok) throw new Error('BCB_HTTP_ERROR: '+response.status);
    if(new URL(response.url).hostname!=='olinda.bcb.gov.br'||new URL(response.url).protocol!=='https:'){
      throw new Error('BCB_ORIGIN_UNVERIFIED');
    }
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length>512*1024) throw new Error('BCB_RESPONSE_OVERSIZE');
    const observed=readClosingObservation(JSON.parse(bytes.toString('utf8')),date);
    console.log(JSON.stringify({
      source:'BCB_PTAX_OFICIAL',evidenceKind:'BCB_OFFICIAL_DATASET',
      date,quoteType:'venda',rate:observed.rate,
      bulletinTimestamp:observed.timestamp,
      evidenceRef:url,
      evidenceSha256:createHash('sha256').update(bytes).digest('hex'),
      independentApproval:'PENDING',databaseWritten:false,
    },null,2));
  }finally{clearTimeout(timeout)}
}
main().catch(e=>{console.error('BCB_SOURCE_VERIFICATION_FAILED:',e.message);process.exitCode=2});
