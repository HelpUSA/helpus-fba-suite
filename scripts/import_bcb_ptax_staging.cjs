#!/usr/bin/env node
/**
 * Stage-only importer for a real HTTPS BCB closing observation.
 * Does NOT approve the independently reviewed documentary batch.
 * Requires a separately provisioned, least-privilege DB import credential.
 * Usage: STAGING_FX_IMPORT_DATABASE_URL=... node scripts/import_bcb_ptax_staging.cjs YYYY-MM-DD
 */
'use strict';
const {Client}=require('pg');
const {fetchBcbManifest}=require('./verify_bcb_ptax_source.cjs');

async function main(){
  const date=process.argv[2];
  const raw=process.env.STAGING_FX_IMPORT_DATABASE_URL;
  if(!raw)throw new Error('STAGING_FX_IMPORT_DATABASE_URL_REQUIRED');
  const url=new URL(raw);
  if(decodeURIComponent(url.pathname)!=='/helpus_staging')throw new Error('STAGING_ONLY_TARGET_BLOCKED');
  // Acquire directly from the official TLS endpoint BEFORE opening the DB.
  const m=await fetchBcbManifest(date);
  const client=new Client({connectionString:raw,ssl:{rejectUnauthorized:true}});
  try{
    await client.connect();
    await client.query('BEGIN');
    const info=(await client.query('SELECT current_database() AS db, current_user AS actor')).rows[0];
    if(info.db!=='helpus_staging'||info.actor==='staging_operator'){
      throw new Error('STAGING_IMPORT_ROLE_NOT_AUTHORIZED');
    }
    const columns=(await client.query(`SELECT column_name FROM information_schema.columns
      WHERE table_schema='public' AND table_name='fx_rates'`)).rows.map(x=>x.column_name);
    for(const col of ['evidence_ref','evidence_sha256','evidence_kind','verified_at','verified_by','import_batch_id']){
      if(!columns.includes(col))throw new Error('PROVENANCE_MIGRATION_003_REQUIRED');
    }
    const batchId='bcb-usd-'+m.date+'-'+m.evidenceSha256.slice(0,16);
    const result=await client.query(`INSERT INTO public.fx_rates
      (rate_date,currency_from,currency_to,rate,source,is_fallback,
       evidence_ref,evidence_sha256,evidence_kind,verified_at,verified_by,import_batch_id)
      VALUES ($1,'USD','BRL',$2,'BCB_PTAX_OFICIAL',false,
        $3,$4,'BCB_OFFICIAL_DATASET',NOW(),$5,$6)
      ON CONFLICT (rate_date,currency_from,currency_to) DO NOTHING
      RETURNING id`,[m.date,m.rate,m.evidenceRef,m.evidenceSha256,info.actor,batchId]);
    if(result.rows.length!==1){
      throw new Error('FX_RATE_ALREADY_EXISTS: immutable observation requires independent review, not overwrite');
    }
    await client.query('COMMIT');
    console.log(JSON.stringify({
      status:'IMPORTED_UNAPPROVED',database:'helpus_staging',
      rateDate:m.date,source:m.source,rate:m.rate,
      evidenceSha256:m.evidenceSha256,importBatchId:batchId,
      approved:false,ledgerPostingAuthorized:false
    },null,2));
  }catch(e){
    await client.query('ROLLBACK').catch(()=>{});
    throw e;
  }finally{await client.end().catch(()=>{})}
}
if(require.main===module){
  main().catch(e=>{console.error('BCB_STAGING_IMPORT_BLOCKED:',e.message);process.exitCode=2});
}
