-- Migration 002: Auditable Financial Ledger & Multi-Currency FX Engine (Phase P1)
-- Enforces double-entry style auditable transaction logging, historical FX conversion,
-- and strict separation between REALIZADO, ESTIMADO, and PROJETADO metrics.
-- STRICTLY ISOLATED TO STAGING ENVIRONMENT (Order 045).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Historical Foreign Exchange (FX) Rates Table
CREATE TABLE IF NOT EXISTS fx_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rate_date DATE NOT NULL,
    currency_from VARCHAR(10) NOT NULL,
    currency_to VARCHAR(10) NOT NULL,
    rate NUMERIC(10, 4) NOT NULL CHECK (rate > 0),
    source VARCHAR(50) NOT NULL, -- e.g. 'BCB_PTAX', 'OFFICIAL_SETTLEMENT', 'FALLBACK_POLICY'
    is_fallback BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_fx_rates UNIQUE (rate_date, currency_from, currency_to)
);

CREATE INDEX IF NOT EXISTS idx_fx_rates_lookup ON fx_rates(rate_date, currency_from, currency_to);

-- 2. Financial Ledger Table (Authoritative Accounting Engine)
CREATE TABLE IF NOT EXISTS financial_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_number VARCHAR(100) UNIQUE NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    source_event_type VARCHAR(50) NOT NULL CHECK (
        source_event_type IN (
            'ORDER_SALE',
            'INVOICE_PURCHASE',
            'MARKETPLACE_FEE',
            'FULFILLMENT_FBA',
            'PREP_SERVICE',
            'INBOUND_FREIGHT',
            'STORAGE_FEE',
            'TAX_SIMPLES',
            'CUSTOMER_RETURN',
            'REIMBURSEMENT',
            'COMPENSATION_REVERSAL',
            'ADJUSTMENT'
        )
    ),
    source_id VARCHAR(100) NOT NULL,
    marketplace VARCHAR(50) NOT NULL CHECK (
        marketplace IN (
            'Amazon US',
            'Amazon BR',
            'Mercado Livre',
            'CONSOLIDATED',
            'DIRECT_PURCHASE'
        )
    ),
    competence_date DATE NOT NULL,
    currency VARCHAR(10) NOT NULL CHECK (currency IN ('USD', 'BRL')),
    amount_original NUMERIC(14, 2) NOT NULL,
    entry_direction VARCHAR(10) NOT NULL CHECK (entry_direction IN ('CREDIT', 'DEBIT')),
    amount_brl NUMERIC(14, 2) NOT NULL,
    fx_rate NUMERIC(10, 4) NOT NULL DEFAULT 1.0000,
    fx_source VARCHAR(50) NOT NULL DEFAULT 'PARITY_BRL',
    category VARCHAR(50) NOT NULL CHECK (
        category IN (
            'RECEITA_BRUTA',
            'CMV',
            'TAXA_MARKETPLACE',
            'FULFILLMENT_FBA',
            'PREP',
            'FRETE',
            'ARMAZENAGEM',
            'IMPOSTO_DAS',
            'REEMBOLSO',
            'ESTORNO',
            'OUTRAS_DESPESAS'
        )
    ),
    status VARCHAR(20) NOT NULL CHECK (status IN ('REALIZADO', 'ESTIMADO', 'PROJETADO')),
    reversal_of_id UUID REFERENCES financial_ledger(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    environment VARCHAR(20) NOT NULL DEFAULT 'staging' CHECK (environment IN ('staging', 'production', 'sandbox'))
);

-- Indexes for high-performance DRE aggregations and audit lookups
CREATE INDEX IF NOT EXISTS idx_financial_ledger_competence ON financial_ledger(competence_date);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_marketplace ON financial_ledger(marketplace);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_category ON financial_ledger(category);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_status ON financial_ledger(status);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_source ON financial_ledger(source_event_type, source_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_reversal ON financial_ledger(reversal_of_id);

-- 3. Immutability Trigger for Realized Financial Entries (Strict Append-Only)
CREATE OR REPLACE FUNCTION trg_protect_financial_ledger()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'REALIZADO' THEN
        RAISE EXCEPTION 'Immutability violation: Cannot modify or delete REALIZADO financial ledger entry %. Reversals must be made through a COMPENSATION_REVERSAL entry.', OLD.entry_number;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_financial_ledger_tampering ON financial_ledger;
CREATE TRIGGER trg_prevent_financial_ledger_tampering
BEFORE UPDATE OR DELETE ON financial_ledger
FOR EACH ROW EXECUTE FUNCTION trg_protect_financial_ledger();

-- 4. Immutability Trigger for Historical FX Rates (Prohibits Retroactive Tampering)
CREATE OR REPLACE FUNCTION trg_protect_fx_rates()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Immutability violation: Historical fx_rates entries cannot be modified or deleted (% to % on %).', OLD.currency_from, OLD.currency_to, OLD.rate_date;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_fx_rates_tampering ON fx_rates;
CREATE TRIGGER trg_prevent_fx_rates_tampering
BEFORE UPDATE OR DELETE ON fx_rates
FOR EACH ROW EXECUTE FUNCTION trg_protect_fx_rates();
