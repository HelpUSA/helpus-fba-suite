'use strict';
/** Static code contract only; does not authenticate evidence or contact Neon. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sql=read('scripts/migrations/003_fx_provenance_staging_review.sql');
const client=read('src/lib/db/postgresClient.ts');
const types=read('src/lib/erpTypes.ts');
const preflight=read('scripts/check_p1_fx_source_release_gate.js');

test('003 uses staging guard, one transaction and exactly one ledger provenance trigger',()=>{
  assert.match(sql,/current_database\(\) <> 'helpus_staging'/);
  assert.equal((sql.match(/^BEGIN;$/gm)||[]).length,1);
  assert.equal((sql.match(/^COMMIT;$/gm)||[]).length,1);
  assert.equal((sql.match(/CREATE TRIGGER trg_p1_require_verified_fx_provenance/g)||[]).length,1);
  assert.match(sql,/fx_provenance_hash_format/);
});
test('documentary batch approval uses independent, immutable, non-operational role',()=>{
  assert.match(sql,/CREATE TABLE IF NOT EXISTS public\.fx_documentary_approvals/);
  assert.match(sql,/approval_status\s*<>\s*'APPROVED'/);
  assert.match(sql,/approved\.approved_by\s*=\s*fx\.verified_by/);
  assert.match(sql,/REVOKE ALL ON TABLE public\.fx_documentary_approvals FROM PUBLIC, staging_operator/);
  assert.match(sql,/trg_p1_protect_fx_documentary_approvals/);
});
test('runtime links recorded realized FX to exact observation with legacy schema support',()=>{
  assert.match(types,/fxRateId\?: string/);
  assert.match(client,/attname = 'fx_rate_id'/);
  assert.match(client,/FX_PROVENANCE_UNVERIFIED: verified rate reference/);
  assert.match(client,/hasFxReference \? ', fx_rate_id' : ''/);
  assert.match(client,/fxRateId: orig\.fx_rate_id \|\| undefined/);
});
test('source preflight deliberately rejects blanket readiness without trusted importer',()=>{
  assert.match(preflight,/FX-STATIC-09/);
  assert.match(preflight,/pass: false/);
});
