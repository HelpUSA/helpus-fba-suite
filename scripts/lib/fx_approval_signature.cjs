'use strict';
const {verify}=require('node:crypto');

function assertApprovalClaims(a,now=new Date()){
  if(!a||typeof a!=='object')throw new Error('FX_APPROVAL_INVALID');
  if(!/^[a-z0-9-]{10,120}$/.test(a.importBatchId||''))throw new Error('FX_APPROVAL_BATCH_INVALID');
  if(!/^[0-9a-fA-F]{64}$/.test(a.evidenceSha256||''))throw new Error('FX_APPROVAL_DIGEST_INVALID');
  if(a.sourceSystem!=='BCB_OFFICIAL_DATASET'&&a.sourceSystem!=='SETTLEMENT_DOCUMENT')throw new Error('FX_APPROVAL_SOURCE_INVALID');
  if(!/^[a-zA-Z0-9_.@-]{3,120}$/.test(a.approvedBy||''))throw new Error('FX_APPROVAL_SIGNER_INVALID');
  if(typeof a.approvedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(a.approvedAt))throw new Error('FX_APPROVAL_TIME_INVALID');
  const ts=Date.parse(a.approvedAt);
  if(!Number.isFinite(ts)||ts>now.getTime()+5*60000||ts<now.getTime()-30*86400000)throw new Error('FX_APPROVAL_TIME_OUT_OF_RANGE');
}
function canonicalApproval(a){
  assertApprovalClaims(a);
  return Buffer.from([
    'FBA-P1-FX-APPROVAL-V1',
    a.importBatchId,
    a.evidenceSha256.toLowerCase(),
    a.sourceSystem,
    a.approvedBy,
    a.approvedAt,
  ].join('\n'),'utf8');
}
function verifySignedApproval(a,publicKeyPem){
  if(!publicKeyPem||typeof a.signature!=='string'||!/^[A-Za-z0-9+/]+={0,2}$/.test(a.signature))throw new Error('FX_APPROVAL_SIGNATURE_MISSING');
  const sig=Buffer.from(a.signature,'base64');
  if(sig.length!==64||!verify(null,canonicalApproval(a),publicKeyPem,sig))throw new Error('FX_APPROVAL_SIGNATURE_INVALID');
  return true;
}
module.exports={assertApprovalClaims,canonicalApproval,verifySignedApproval};
