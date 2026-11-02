#!/usr/bin/env node
/**
 * Non-mutating source preflight for P1 FX provenance.
 * No DB connections, imports, environment variables or secrets.
 * Run: node scripts/check_p1_fx_source_release_gate.js
 * Nonzero means gate gaps; never interpret PASS as source authenticity.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const schema = read('scripts/migrations/003_fx_provenance_staging_review.sql');
const audit = read('scripts/audit_p1_fx_provenance_readonly.js');
const doc = read('docs/P1-FX-PROVENANCE-RELEASE-GATE.md');

const checks = [
  {
    id: 'FX-STATIC-01',
    description: 'No production migration execution path in reviewed migration label',
    pass: /STAGING REVIEW ONLY/.test(schema),
  },
  {
    id: 'FX-STATIC-02',
    description: 'USD realized requires linked FX ID',
    pass: /NEW\.status\s*<>\s*'REALIZADO'/.test(schema)
      && /NEW\.currency\s*<>\s*'USD'/.test(schema)
      && /NEW\.fx_rate_id\s+IS\s+NULL/.test(schema),
  },
  {
    id: 'FX-STATIC-03',
    description: 'FX source trigger function present',
    pass: /p1_require_verified_fx_provenance/.test(schema),
  },
  {
    id: 'FX-STATIC-04',
    description: 'Auditor checks P1 FX provenance trigger enabled',
    pass: /trg_p1_require_verified_fx_provenance/.test(audit),
  },
  {
    id: 'FX-STATIC-05',
    description: 'Auditor verifies TRUNCATE effective grant separately',
    pass: /has_table_privilege\([^\n]*'TRUNCATE'/.test(audit),
  },
  {
    id: 'FX-STATIC-06',
    description: 'Gate document explicitly forbids fabricated documentary proof',
    pass: /Não inventar hashes de comprovantes/.test(doc),
  },
  {
    id: 'FX-STATIC-07',
    description: 'Migration uses explicit approved-batch lookup rather than only batch ID presence',
    pass: /JOIN\s+public\.[a-z_]*batch/i.test(schema)
      || /FROM\s+public\.[a-z_]*batch/i.test(schema),
  },
  {
    id: 'FX-STATIC-08',
    description: 'Migration has guarded or versioned constraint creation',
    pass: /IF\s+NOT\s+EXISTS[\s\S]*?fx_provenance_hash_format/.test(schema)
      || /pg_constraint[\s\S]*?fx_provenance_hash_format/.test(schema),
  },
];
const failed = checks.filter(c => !c.pass);
console.log(JSON.stringify({
  scope: 'STATIC_SOURCE_ONLY',
  database_contacted: false,
  production_modified: false,
  checks,
  gate: failed.length ? 'BLOCKED_SOURCE_PRECHECK' : 'PASS_SOURCE_PRECHECK_ONLY',
  failed: failed.map(x => x.id),
}, null, 2));
process.exitCode = failed.length ? 2 : 0;
