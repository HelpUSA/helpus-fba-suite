'use strict';
/**
 * Static regression gate for P1 003 staging migration.
 * Does not connect to PostgreSQL, does not execute SQL, and does not inspect credentials.
 * Run: node --test scripts/test_p1_fx_003_integrity.test.cjs
 */
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const sql = readFileSync(join(__dirname,'migrations','003_fx_provenance_staging_review.sql'),'utf8');

test('003 is explicitly staging-only and DB guard precedes DDL',()=>{
  const guard=sql.indexOf("current_database() <> 'helpus_staging'");
  const ddl=sql.indexOf('ALTER TABLE public.fx_rates');
  assert.ok(guard>0 && ddl>guard);
  assert.match(sql,/P1_STAGING_ONLY/);
});
test('003 has one transaction boundary and one FX trigger/function',()=>{
  const count=pattern=>(sql.match(pattern)||[]).length;
  assert.equal(count(/^BEGIN;$/gm),1);
  assert.equal(count(/^COMMIT;$/gm),1);
  assert.equal(count(/CREATE OR REPLACE FUNCTION public\.p1_require_verified_fx_provenance/g),1);
  assert.equal(count(/CREATE TRIGGER trg_p1_require_verified_fx_provenance/g),1);
  assert.match(sql,/COMMIT;\s*$/);
});
test('003 provenance-hash CHECK is complete and create is idempotent',()=>{
  assert.match(sql,/IF NOT EXISTS \(\s*SELECT 1 FROM pg_constraint/);
  assert.match(sql,/conrelid = 'public\.fx_rates'::regclass/);
  assert.match(sql,/CHECK \(evidence_sha256 IS NULL OR evidence_sha256 ~ '\^\[0-9a-fA-F\]\{64\}\$'\);/);
  assert.match(sql,/END\s*\$constraint\$;/);
});
test('003 blocks undocumented realized USD and keeps immutable ledger',()=>{
  assert.match(sql,/NEW\.status <> 'REALIZADO' OR NEW\.currency <> 'USD'/);
  assert.match(sql,/NEW\.fx_rate_id IS NULL/);
  assert.match(sql,/FX_PROVENANCE_UNVERIFIED/);
  assert.match(sql,/REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER\s+ON public\.financial_ledger FROM staging_operator/);
});
test('003 does not fabricate historical documentary evidence',()=>{
  assert.doesNotMatch(sql,/UPDATE\s+(?:public\.)?fx_rates\s+SET\s+verified_at/i);
  assert.doesNotMatch(sql,/INSERT\s+INTO\s+(?:public\.)?fx_rates/i);
});
