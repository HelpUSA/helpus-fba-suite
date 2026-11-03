-- Migration 003 — FX documentary provenance; STAGING REVIEW ONLY.
-- NOT in auto-migration. Never run against production without separate approval.
-- Hash labels and reviewer names alone do not prove official provenance.
BEGIN;
DO $guard$
BEGIN
  IF current_database() <> 'helpus_staging' THEN
    RAISE EXCEPTION 'P1_STAGING_ONLY: expected helpus_staging';
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

DO $constraint$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
    WHERE conname='fx_provenance_hash_format'
      AND conrelid='public.fx_rates'::regclass) THEN
    ALTER TABLE public.fx_rates ADD CONSTRAINT fx_provenance_hash_format
      CHECK (evidence_sha256 IS NULL OR evidence_sha256 ~ '^[0-9a-fA-F]{64}$');
  END IF;
END
$constraint$;

-- A separately authorized reviewer must approve a document batch; operational
-- users cannot create approvals. Corrections require a new immutable batch.
CREATE TABLE IF NOT EXISTS public.fx_documentary_approvals (
  import_batch_id VARCHAR(120) PRIMARY KEY,
  evidence_sha256 VARCHAR(64) NOT NULL CHECK (evidence_sha256 ~ '^[0-9a-fA-F]{64}$'),
  source_system VARCHAR(40) NOT NULL CHECK (source_system IN ('BCB_OFFICIAL_DATASET','SETTLEMENT_DOCUMENT')),
  approval_status VARCHAR(16) NOT NULL CHECK (approval_status IN ('APPROVED','REJECTED')),
  approved_by VARCHAR(120) NOT NULL CHECK (LENGTH(BTRIM(approved_by)) > 0),
  approved_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION public.p1_protect_fx_documentary_approvals()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'FX_BATCH_IMMUTABLE: approval records are append-only';
END
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_p1_protect_fx_documentary_approvals ON public.fx_documentary_approvals;
CREATE TRIGGER trg_p1_protect_fx_documentary_approvals
BEFORE UPDATE OR DELETE ON public.fx_documentary_approvals
FOR EACH ROW EXECUTE FUNCTION public.p1_protect_fx_documentary_approvals();
REVOKE ALL ON TABLE public.fx_documentary_approvals FROM PUBLIC, staging_operator;

-- No fake approval backfill. Legacy FX remains unverified.
CREATE OR REPLACE FUNCTION public.p1_require_verified_fx_provenance()
RETURNS TRIGGER AS $$
DECLARE fx RECORD;
DECLARE approved RECORD;
BEGIN
  IF NEW.status <> 'REALIZADO' OR NEW.currency <> 'USD' THEN
    RETURN NEW;
  END IF;
  IF NEW.fx_rate_id IS NULL THEN
    RAISE EXCEPTION 'FX_PROVENANCE_UNVERIFIED: fx_rate_id required';
  END IF;
  SELECT id, rate_date, rate, source, currency_from, currency_to,
         evidence_ref, evidence_sha256, evidence_kind, verified_at,
         verified_by, import_batch_id
    INTO fx FROM public.fx_rates WHERE id=NEW.fx_rate_id;
  IF NOT FOUND OR fx.currency_from <> 'USD' OR fx.currency_to <> 'BRL'
     OR NULLIF(BTRIM(fx.evidence_ref), '') IS NULL
     OR fx.evidence_sha256 IS NULL OR fx.evidence_sha256 !~ '^[0-9a-fA-F]{64}$'
     OR fx.verified_at IS NULL OR fx.verified_at > NOW()
     OR NULLIF(BTRIM(fx.verified_by), '') IS NULL
     OR NULLIF(BTRIM(fx.import_batch_id), '') IS NULL
     OR fx.evidence_kind NOT IN ('BCB_OFFICIAL_DATASET','SETTLEMENT_DOCUMENT')
     OR fx.source NOT IN ('BCB_PTAX','BCB_PTAX_OFICIAL','BACEN_PTAX','OFFICIAL_SETTLEMENT')
     OR fx.rate <> NEW.fx_rate THEN
    RAISE EXCEPTION 'FX_PROVENANCE_UNVERIFIED: invalid documentary observation';
  END IF;

  SELECT approval_status, evidence_sha256, source_system, approved_at, approved_by
    INTO approved FROM public.fx_documentary_approvals
    WHERE import_batch_id=fx.import_batch_id;
  IF NOT FOUND OR approved.approval_status <> 'APPROVED'
     OR LOWER(approved.evidence_sha256) <> LOWER(fx.evidence_sha256)
     OR approved.source_system <> fx.evidence_kind
     OR approved.approved_by = fx.verified_by
     OR approved.approved_at IS NULL OR approved.approved_at > NOW()
     OR NULLIF(BTRIM(approved.approved_by), '') IS NULL THEN
    RAISE EXCEPTION 'FX_PROVENANCE_UNVERIFIED: independent approval missing';
  END IF;

  IF NEW.fx_source = fx.source THEN
    IF fx.rate_date <> NEW.competence_date THEN
      RAISE EXCEPTION 'FX_PROVENANCE_UNVERIFIED: FX date mismatch';
    END IF;
  ELSIF NEW.fx_source = fx.source || '_PRIOR_CLOSE' THEN
    IF fx.rate_date >= NEW.competence_date OR
       NEW.competence_date - fx.rate_date > 7 THEN
      RAISE EXCEPTION 'FX_PROVENANCE_UNVERIFIED: prior-close window invalid';
    END IF;
  ELSE
    RAISE EXCEPTION 'FX_PROVENANCE_UNVERIFIED: source mismatch';
  END IF;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_p1_require_verified_fx_provenance ON public.financial_ledger;
CREATE TRIGGER trg_p1_require_verified_fx_provenance
BEFORE INSERT ON public.financial_ledger
FOR EACH ROW EXECUTE FUNCTION public.p1_require_verified_fx_provenance();

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.fx_rates FROM staging_operator;
GRANT SELECT ON public.fx_rates TO staging_operator;
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.financial_ledger FROM staging_operator;
GRANT SELECT, INSERT ON public.financial_ledger TO staging_operator;
COMMIT;
