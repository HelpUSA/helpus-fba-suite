#!/usr/bin/env node
/** Read-only FX documentary metadata gate; never claims to authenticate a document. */
'use strict';
const {Client}=require('pg');
async function main(){
  const raw=process.env.STAGING_DATABASE_URL;
  if(!raw)throw new Error('STAGING_DATABASE_URL_REQUIRED');
  if(decodeURIComponent(new URL(raw).pathname)!=='/helpus_staging')throw new Error('STAGING_ONLY_TARGET_BLOCKED');
  const client=new Client({connectionString:raw,ssl:{rejectUnauthorized:true}});
  try{
    await client.connect();
    await client.query('BEGIN READ ONLY');
    const who=(await client.query('SELECT current_database() AS db')).rows[0];
    if(who.db!=='helpus_staging')throw new Error('STAGING_ONLY_TARGET_BLOCKED');
    const fxColumns=(await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='fx_rates'")).rows.map(x=>x.column_name);
    const ledgerColumns=(await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='financial_ledger'")).rows.map(x=>x.column_name);
    const missing=['evidence_ref','evidence_sha256','evidence_kind','verified_at','verified_by','import_batch_id'].filter(x=>!fxColumns.includes(x));
    if(!ledgerColumns.includes('fx_rate_id'))missing.push('financial_ledger.fx_rate_id');
    const approvalExists=(await client.query("SELECT to_regclass('public.fx_documentary_approvals') IS NOT NULL AS present")).rows[0].present;
    if(!approvalExists)missing.push('fx_documentary_approvals');
    const privQueries=[
      "SELECT",
      ...['fx_rates','financial_ledger'].flatMap(t=>
        ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'].map(p=>
          "has_table_privilege('staging_operator','public."+t+"','"+p+"') AS "+(t==='fx_rates'?'fx_':'ledger_')+p.toLowerCase()
        )
      )
    ].join(', ').replace('SELECT, ','SELECT ');
    const grants=(await client.query(privQueries)).rows[0];
    const ops=['insert','update','delete','truncate','references','trigger'];
    const scopeOk=grants.fx_select&&!ops.some(p=>grants['fx_'+p])&&
      grants.ledger_select&&grants.ledger_insert&&!ops.slice(1).some(p=>grants['ledger_'+p]);
    const approvalRights=approvalExists?(await client.query([
      "SELECT",
      ...['INSERT','UPDATE','DELETE','TRUNCATE','TRIGGER'].map(p=>
        "has_table_privilege('staging_operator','public.fx_documentary_approvals','"+p+"') AS "+p.toLowerCase())
    ].join(', ').replace('SELECT, ','SELECT '))).rows[0]:{insert:true};
    const leastPrivilege=!!scopeOk&&!Object.values(approvalRights).some(Boolean);
    const expected=['trg_prevent_financial_ledger_tampering','trg_prevent_fx_rates_tampering',
      'trg_p1_require_verified_fx_provenance','trg_p1_protect_fx_documentary_approvals'];
    const trg=(await client.query("SELECT tgname,tgenabled FROM pg_trigger WHERE tgname=ANY($1::text[]) AND NOT tgisinternal",[expected])).rows;
    const triggersEnabled=trg.length===expected.length&&trg.every(x=>x.tgenabled==='O');
    let total=null,approvedMetadata=null;
    if(missing.length===0){
      const query=[
        "SELECT count(*)::int AS total,",
        "count(*) FILTER (WHERE NULLIF(BTRIM(f.evidence_ref),'') IS NOT NULL",
        "AND f.evidence_sha256 ~ '^[a-fA-F0-9]{64}$'",
        "AND f.verified_at IS NOT NULL AND f.verified_at<=NOW()",
        "AND NULLIF(BTRIM(f.verified_by),'') IS NOT NULL",
        "AND f.evidence_kind IN ('BCB_OFFICIAL_DATASET','SETTLEMENT_DOCUMENT')",
        "AND f.currency_from='USD' AND f.currency_to='BRL' AND f.rate=l.fx_rate",
        "AND (l.fx_source=f.source OR (l.fx_source=f.source||'_PRIOR_CLOSE'",
        "AND f.rate_date<l.competence_date AND l.competence_date-f.rate_date<=7))",
        "AND a.approval_status='APPROVED' AND LOWER(a.evidence_sha256)=LOWER(f.evidence_sha256)",
        "AND a.source_system=f.evidence_kind AND a.approved_by<>f.verified_by",
        "AND a.approved_at>=f.verified_at AND a.approved_at<=NOW())::int AS documented",
        "FROM public.financial_ledger l LEFT JOIN public.fx_rates f ON f.id=l.fx_rate_id",
        "LEFT JOIN public.fx_documentary_approvals a ON a.import_batch_id=f.import_batch_id",
        "WHERE l.status='REALIZADO' AND l.currency='USD'"
      ].join(' ');
      const counts=(await client.query(query)).rows[0];
      total=counts.total;approvedMetadata=counts.documented;
    }
    const metadataPass=missing.length===0&&leastPrivilege&&triggersEnabled&&total===approvedMetadata;
    console.log(JSON.stringify({
      target:'helpus_staging',missingColumnsOrTables:missing,leastPrivilege,triggersEnabled,
      totalUsdRealized:total,approvedMetadataUsdRealized:approvedMetadata,
      databaseMetadataGate:metadataPass?'PASS_DB_METADATA_ONLY':'BLOCKED',
      externalDocumentAuthenticity:'NOT_VERIFIED_BY_THIS_SCRIPT',
      releaseGate:'BLOCKED_UNTIL_INDEPENDENT_DOCUMENT_AUTHENTICITY_REVIEW'
    },null,2));
    if(!metadataPass)process.exitCode=2;
  }finally{
    try{await client.query('ROLLBACK')}catch{}
    await client.end().catch(()=>{});
  }
}
main().catch(e=>{console.error('P1_FX_PROVENANCE_GATE_FAILED:',e.message);process.exitCode=2});
