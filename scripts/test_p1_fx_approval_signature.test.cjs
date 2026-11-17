'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {generateKeyPairSync,sign}=require('node:crypto');
const {canonicalApproval,verifySignedApproval}=require('./lib/fx_approval_signature.cjs');
const {privateKey,publicKey}=generateKeyPairSync('ed25519');
const publicPem=publicKey.export({format:'pem',type:'spki'});
function makeAttestation(){
 const a={importBatchId:'bcb-usd-2026-11-03-aabbccddeeff1122',
 evidenceSha256:'a'.repeat(64),sourceSystem:'BCB_OFFICIAL_DATASET',
 approvedBy:'independent.reviewer',approvedAt:new Date().toISOString()};
 a.signature=sign(null,canonicalApproval(a),privateKey).toString('base64');
 return a;
}
test('accepts valid Ed25519 independent approval signature',()=>{
 assert.equal(verifySignedApproval(makeAttestation(),publicPem),true);
});
test('fails closed on edited digest, signer and source after signing',()=>{
 const a=makeAttestation();
 assert.throws(()=>verifySignedApproval({...a,evidenceSha256:'b'.repeat(64)},publicPem),/SIGNATURE_INVALID/);
 assert.throws(()=>verifySignedApproval({...a,approvedBy:'another.reviewer'},publicPem),/SIGNATURE_INVALID/);
 assert.throws(()=>verifySignedApproval({...a,sourceSystem:'SETTLEMENT_DOCUMENT'},publicPem),/SIGNATURE_INVALID/);
});
test('rejects malformed, future and stale attestations',()=>{
 const a=makeAttestation();
 assert.throws(()=>verifySignedApproval({...a,approvedAt:'2026-11-03'},publicPem),/TIME_INVALID/);
 assert.throws(()=>verifySignedApproval({...a,approvedAt:new Date(Date.now()+86400000).toISOString()},publicPem),/TIME_OUT_OF_RANGE/);
 assert.throws(()=>verifySignedApproval({...a,approvedAt:new Date(Date.now()-40*86400000).toISOString()},publicPem),/TIME_OUT_OF_RANGE/);
});
test('fails when no trusted approver key exists',()=>{
 assert.throws(()=>verifySignedApproval(makeAttestation(),''),/SIGNATURE_MISSING/);
});
