#!/usr/bin/env node
/**
 * Official BCB PTAX USD closing quote collector. NO DB writes or approvals.
 * Usage: node scripts/verify_bcb_ptax_source.cjs YYYY-MM-DD
 */
'use strict';
const {createHash}=require('node:crypto');
const {isValidDate,buildBcbUrl,readClosingObservation}=require('./lib/bcb_ptax_validation.cjs');
async function fetchBcbManifest(date,fetchFn=fetch){
  if(!isValidDate(date))throw new Error('INVALID_DATE: expected valid YYYY-MM-DD');
  const url=buildBcbUrl(date),abort=new AbortController();
  const timeout=setTimeout(()=>abort.abort(),15000);
  try{
    const response=await fetchFn(url,{redirect:'error',signal:abort.signal,headers:{accept:'application/json'}});
    if(!response.ok)throw new Error('BCB_HTTP_ERROR: '+response.status);
    const resolved=new URL(response.url);
    if(resolved.hostname!=='olinda.bcb.gov.br'||resolved.protocol!=='https:')throw new Error('BCB_ORIGIN_UNVERIFIED');
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length>512*1024)throw new Error('BCB_RESPONSE_OVERSIZE');
    const observed=readClosingObservation(JSON.parse(bytes.toString('utf8')),date);
    return {
      source:'BCB_PTAX_OFICIAL', evidenceKind:'BCB_OFFICIAL_DATASET',
      date,quoteType:'venda',rate:observed.rate,bulletinTimestamp:observed.timestamp,
      evidenceRef:url,evidenceSha256:createHash('sha256').update(bytes).digest('hex'),
      independentApproval:'PENDING',databaseWritten:false,
    };
  }finally{clearTimeout(timeout)}
}
if(require.main===module){
  fetchBcbManifest(process.argv[2]).then(v=>console.log(JSON.stringify(v,null,2)))
    .catch(e=>{console.error('BCB_SOURCE_VERIFICATION_FAILED:',e.message);process.exitCode=2});
}
module.exports={fetchBcbManifest};
