#!/usr/bin/env node
/**
 * Stage-only approval of a previously imported, independently verified FX batch.
 * Requires Ed25519 detached signature and a separately provisioned database role.
 * The private signing key must NEVER be placed on this host or in Git.
 * Usage: STAGING_FX_APPROVAL_DATABASE_URL=... FX_APPROVER_PUBLIC_KEY_FILE=...
 *        node scripts/approve_fx_batch_staging.cjs /private/path/attestation.json
 */
'use strict';
const {readFileSync}=require('node:fs');
const {Client}=require('pg');
const {verifySignedApproval}=require('./lib/fx_approval_signature.cjs');
async function main(){
  const dbUrl=process.env.STAGING_FX_APPROVAL_DATABASE_URL;
  const keyPath=process.env.FX_APPROVER_PUBLIC_KEY_FILE;
  const attestationPath=process.argv[2];
  if(!dbUrl||!keyPath||!attestationPath)throw new Error('FX_APPROVAL_CONFIG_REQUIRED');
  if(decodeURIComponent(new URL(dbUrl).pathname)!=='/helpus_staging')throw new Error('FX_APPROVAL_STAGING_ONLY');
  const att=JSON.parse(readFileSync(attestationPath,'utf8'));
  verifySignedApproval(att,readFileSync(keyPath,'utf8'));
  const client=new Client({connectionString:dbUrl,ssl:{rejectUnauthorized:true}});
  try{
    await client.connect();
    await client.query('BEGIN');
    const who=(await client.query('SELECT current_database() AS db, current_user AS actor')).rows[0];
    if(who.db!=='helpus_staging'||who.actor==='staging_operator')throw new Error('FX_APPROVAL_ROLE_FORBIDDEN');
    const fx=(await client.query(`SELECT id,evidence_sha256,evidence_kind,verified_by
      FROM public.fx_rates WHERE import_batch_id=$1 FOR SHARE`,[att.importBatchId])).rows;
    if(fx.length!==1)throw new Error('FX_APPROVAL_OBSERVATION_NOT_UNIQUE');
    const observation=fx[0];
    if(observation.evidence_sha256.toLowerCase()!==att.evidenceSha256.toLowerCase()||
       observation.evidence_kind!==att.sourceSystem||
       observation.verified_by===att.approvedBy)throw new Error('FX_APPROVAL_INDEPENDENCE_OR_DIGEST_FAILURE');
    const inserted=await client.query(`INSERT INTO public.fx_documentary_approvals
      (import_batch_id,evidence_sha256,source_system,approval_status,approved_by,approved_at)
      VALUES ($1,$2,$3,'APPROVED',$4,$5)
      ON CONFLICT (import_batch_id) DO NOTHING RETURNING import_batch_id`,
      [att.importBatchId,att.evidenceSha256.toLowerCase(),att.sourceSystem,att.approvedBy,att.approvedAt]);
    if(inserted.rows.length!==1)throw new Error('FX_APPROVAL_ALREADY_RECORDED_IMMUTABLE');
    await client.query('COMMIT');
    console.log(JSON.stringify({status:'APPROVAL_RECORDED_STAGING_ONLY',
      batch:att.importBatchId,actorRole:who.actor,productionUpdated:false}));
  }catch(e){
    await client.query('ROLLBACK').catch(()=>{});
    throw e;
  }finally{await client.end().catch(()=>{})}
}
if(require.main===module)main().catch(e=>{console.error('FX_APPROVAL_BLOCKED:',e.message);process.exitCode=2});
