-- P1 FX provenance (003) — STAGING REVIEW ONLY; NOT INCLUDED IN THE AUTO-MIGRATION.
-- This migration MUST NOT run on neondb until independently approved.
-- Hash fields and claimed verification are necessary but insufficient: authenticated
-- ingestion and separate documentary verification are still required.
BEGIN;
-- Defense in depth: SQL must not execute against production even when launched
-- with the wrong connection string. A failed assertion aborts the transaction.
DO $guard$
BEGIN
  IF current_database() <> 'helpus_staging' THEN
    RAISE EXCEPTION 'P1_STAGING_ONLY: connected to %, expected helpus_staging', current_database();
  END IF;
END
$guard$;
ALTER TABLE public.fx_rates
  ADD COLUMN IF NOT EXISTS evidence_ref TEXT,
  ADD COLUMN IF NOT EXISTS evidence_sha256 VARCHAR(64),
  ADD COLUMN IF NOT EXISTS evidence_kind VARCHAR(40),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by VARCHAR(120),
  ADD COLUMN IF NOT EXISTS import_batch_id VARCHAR(120);
ALTER TABLE public.financial_ledger
  ADD COLUMN IF NOT EXISTS fx_rate_id UUID REFERENCES public.fx_rates(id);
-- Rerunnable constraint creation, checked against public.fx_rates only.
DO $constraint$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fx_provenance_hash_format'
      AND conrelid = 'public.fx_rates'::regclass
  ) THEN
    ALTER TABLE public.fx_rates
      ADD CONSTRAINT fx_provenance_hash_format
      CHECK (evidence_sha256 IS NULL OR evidence_sha256 ~ '^[0-9a-fA-F]{64}$');
  END IF;
END
$constraint$;
-- No UPDATE to legacy rates or fake provenance backfill.
-- The existing trigger prohibits any UPDATE or DELETE on fx_rates.
-- New USD REALIZADO entries must link an already verified FX record.
CREATE OR REPLACE FUNCTION public.p1_require_verified_fx_provenance()
RETURNS TRIGGER AS $$
DECLARE fx RECORD;
BEGIN
  IF NEW.status <> 'REALIZADO' OR NEW.currency <> 'USD' THEN
    RETURN NEW;
  END IF;
  IF NEW.fx_rate_id IS NULL THEN
    RAISE EXCEPTION 'FX_PROVENANCE_UNVERIFIED: verified fx_rate_id required';
  END IF;
  SELECT id, rate_date, rate, source, evidence_ref, evidence_sha256,
         evidence_kind, verified_at, verified_by, import_batch_id
    INTO fx FROM public.fx_rates WHERE id=NEW.fx_rate_id;
  IF NOT FOUND OR fx.evidence_ref IS NULL OR fx.evidence_sha256 IS NULL
      OR fx.evidence_sha256 !~ '^[0-9a-fA-F]{64}$'
      OR fx.verified_at IS NULL OR fx.verified_by IS NULL
      OR fx.import_batch_id IS NULL
      OR fx.evidence_kind NOT IN ('BCB_OFFICIAL_DATASET','SETTLEMENT_DOCUMENT')
      OR fx.source NOT IN ('BCB_PTAX','BCB_PTAX_OFICIAL','BACEN_PTAX','OFFICIAL_SETTLEMENT')
      OR fx.rate <> NEW.fx_rate THEN
    RAISE EXCEPTION 'FX_PROVENANCE_UNVERIFIED: missing or untrusted FX evidence';
  END IF;
  IF NEW.fx_source = fx.source THEN
    IF fx.rate_date <> NEW.competence_date THEN
      RAISE EXCEPTION 'FX_PROVENANCE_UNVERIFIED: FX date mismatch';
    END IF;
  ELSIF NEW.fx_source = fx.source || '_PRIOR_CLOSE' THEN
    IF fx.rate_date >= NEW.competence_date OR
       NEW.competence_date - fx.rate_date > 7 THEN
      RAISE EXCEPTION 'FX_PROVENANCE_UNVERIFIED: unsupported prior-close date';
    END IF;
  ELSE
    RAISE EXCEPTION 'FX_PROVENANCE_UNVERIFIED: FX source mismatch';
  END IF;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_p1_require_verified_fx_provenance ON public.financial_ledger;
CREATE TRIGGER trg_p1_require_verified_fx_provenance
BEFORE INSERT ON public.financial_ledger
FOR EACH ROW EXECUTE FUNCTION public.p1_require_verified_fx_provenance();
-- Staging operational role cannot forge proofs or tamper with posted entries.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.fx_rates FROM staging_operator;
GRANT SELECT ON public.fx_rates TO staging_operator;
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.financial_ledger FROM staging_operator;
GRANT SELECT, INSERT ON public.financial_ledger TO staging_operator;
COMMIT;
