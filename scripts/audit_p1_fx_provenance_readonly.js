#!/usr/bin/env node
/**
 * P1 read-only release gate: independent checks for documentary FX provenance.
 *
 * No UPDATE/DELETE/DDL, no credential output, no guessed claims of official sourcing.
 * Expected database: helpus_staging. Exit nonzero on incomplete gate.
 */
'use strict';
const { Client } = require('pg');

async function main() {
  const url = process.env.STAGING_DATABASE_URL;
  if (!url) throw new Error('GATE_CONFIG: STAGING_DATABASE_URL required');
  const parsed = new URL(url);
  if (decodeURIComponent(parsed.pathname) !== '/helpus_staging') {
    throw new Error('GATE_TARGET_BLOCKED: URL must target helpus_staging');
  }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: true } });
  try {
    await client.connect();
    await client.query('BEGIN READ ONLY');
    const info = (await client.query('SELECT current_database() AS db, current_user AS role')).rows[0];
    if (info.db !== 'helpus_staging') throw new Error('GATE_TARGET_BLOCKED: non-staging database');
    const columns = (await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='fx_rates'"
    )).rows.map(row => row.column_name);
    const expected = ['evidence_ref', 'evidence_sha256', 'evidence_kind', 'verified_at', 'verified_by', 'import_batch_id'];
    const ledgerColumns = (await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='financial_ledger'"
    )).rows.map(row => row.column_name);
    const missing = expected.filter(k => !columns.includes(k));
    if (!ledgerColumns.includes('fx_rate_id')) missing.push('financial_ledger.fx_rate_id');
    const [privileges, trigger] = await Promise.all([
      client.query(`SELECT
        has_table_privilege('staging_operator','public.fx_rates','SELECT') AS fx_select,
        has_table_privilege('staging_operator','public.fx_rates','INSERT') AS fx_insert,
        has_table_privilege('staging_operator','public.fx_rates','UPDATE') AS fx_update,
        has_table_privilege('staging_operator','public.fx_rates','DELETE') AS fx_delete,
        has_table_privilege('staging_operator','public.financial_ledger','SELECT') AS ledger_select,
        has_table_privilege('staging_operator','public.financial_ledger','INSERT') AS ledger_insert,
        has_table_privilege('staging_operator','public.financial_ledger','UPDATE') AS ledger_update,
        has_table_privilege('staging_operator','public.financial_ledger','DELETE') AS ledger_delete`),
      client.query("SELECT tgname,tgenabled FROM pg_trigger WHERE tgname IN ('trg_prevent_financial_ledger_tampering','trg_prevent_fx_rates_tampering','trg_p1_require_verified_fx_provenance') AND NOT tgisinternal")
    ]);
    const grants = privileges.rows[0];
    const protectedTriggers = trigger.rows.every(t => t.tgenabled === 'O') && trigger.rows.length === 3;
    const leastPrivilege = grants.fx_select && !grants.fx_insert && !grants.fx_update && !grants.fx_delete &&
      grants.ledger_select && grants.ledger_insert && !grants.ledger_update && !grants.ledger_delete;
    let totalUsdRealized = null, verifiedUsdRealized = null;
    if (missing.length === 0) {
      const counts = (await client.query(`SELECT count(*)::int AS total,
        count(*) FILTER (WHERE NULLIF(BTRIM(f.evidence_ref), '') IS NOT NULL AND
          f.evidence_sha256 ~ '^[a-fA-F0-9]{64}
        FROM financial_ledger l
        LEFT JOIN fx_rates f ON f.id = l.fx_rate_id
        WHERE l.status = 'REALIZADO' AND l.currency = 'USD'`)).rows[0];
      totalUsdRealized = counts.total;
      verifiedUsdRealized = counts.documented;
    }
    const result = {
      database: info.db, // Do not disclose username/connection string
      schemaEvidenceColumnsPresent: missing.length === 0,
      missingColumns: missing,
      fxOperationalReadOnly: !!(grants.fx_select && !grants.fx_insert && !grants.fx_update && !grants.fx_delete),
      ledgerOperationalAppendOnly: !!(grants.ledger_select && grants.ledger_insert && !grants.ledger_update && !grants.ledger_delete),
      triggersEnabled: protectedTriggers,
      documentaryImporterValidated: false, // This read-only check cannot authenticate external documents.
      releaseGate: 'BLOCKED_UNTIL_DOCUMENTARY_IMPORTER_AND_REVIEW',
      totalUsdRealized,
      documentedUsdRealized: verifiedUsdRealized,
      gate: missing.length === 0 && leastPrivilege && protectedTriggers && totalUsdRealized === verifiedUsdRealized ? 'PASS_DB_METADATA_ONLY' : 'BLOCKED',
    };
    console.log(JSON.stringify(result, null, 2));
    if (result.gate === 'BLOCKED') process.exitCode = 2;
    await client.query('ROLLBACK');
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch(err => {
  console.error('P1_FX_PROVENANCE_GATE_FAILED:', err.message);
  process.exitCode = 2;
});
 AND
          f.verified_at IS NOT NULL AND f.verified_at <= NOW() AND
          NULLIF(BTRIM(f.verified_by), '') IS NOT NULL AND
          NULLIF(BTRIM(f.import_batch_id), '') IS NOT NULL AND
          f.evidence_kind IN ('BCB_OFFICIAL_DATASET', 'SETTLEMENT_DOCUMENT') AND
          f.currency_from = l.currency AND f.currency_to = 'BRL' AND
          f.rate = l.fx_rate AND
          (l.fx_source = f.source OR l.fx_source = f.source || '_PRIOR_CLOSE')
        )::int AS documented
        FROM financial_ledger l
        LEFT JOIN fx_rates f ON f.id = l.fx_rate_id
        WHERE l.status = 'REALIZADO' AND l.currency = 'USD'`)).rows[0];
      totalUsdRealized = counts.total;
      verifiedUsdRealized = counts.documented;
    }
    const result = {
      database: info.db, // Do not disclose username/connection string
      schemaEvidenceColumnsPresent: missing.length === 0,
      missingColumns: missing,
      fxOperationalReadOnly: !!(grants.fx_select && !grants.fx_insert && !grants.fx_update && !grants.fx_delete),
      ledgerOperationalAppendOnly: !!(grants.ledger_select && grants.ledger_insert && !grants.ledger_update && !grants.ledger_delete),
      triggersEnabled: protectedTriggers,
      documentaryImporterValidated: false, // This read-only check cannot authenticate external documents.
      releaseGate: 'BLOCKED_UNTIL_DOCUMENTARY_IMPORTER_AND_REVIEW',
      totalUsdRealized,
      documentedUsdRealized: verifiedUsdRealized,
      gate: missing.length === 0 && leastPrivilege && protectedTriggers && totalUsdRealized === verifiedUsdRealized ? 'PASS_DB_METADATA_ONLY' : 'BLOCKED',
    };
    console.log(JSON.stringify(result, null, 2));
    if (result.gate === 'BLOCKED') process.exitCode = 2;
    await client.query('ROLLBACK');
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch(err => {
  console.error('P1_FX_PROVENANCE_GATE_FAILED:', err.message);
  process.exitCode = 2;
});
