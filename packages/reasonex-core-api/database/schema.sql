-- ============================================
-- Reasonex Core API - Database Schema
-- Version: 1.0.0
-- Date: 2026-01-16
-- ============================================
-- This schema is idempotent - safe to run multiple times
-- Uses IF NOT EXISTS for all CREATE statements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

DO $$ BEGIN
    CREATE TYPE company_status AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('10-K', '10-Q', '8-K', 'EARNINGS', 'PROXY', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE processing_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE analysis_status AS ENUM ('DRAFT', 'VALIDATED', 'APPROVED', 'SUPERSEDED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE validation_status AS ENUM ('PASS', 'FLAG', 'FAIL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE review_tier AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'TIER_4');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE review_status AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'ESCALATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE change_trigger AS ENUM ('SCHEDULED', 'DOCUMENT', 'MARKET', 'MANUAL', 'API');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLE 1: companies
-- ============================================
-- Master list of companies being tracked

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    country VARCHAR(50) DEFAULT 'US',
    exchange VARCHAR(20),
    status company_status NOT NULL DEFAULT 'ACTIVE',
    priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100),
    tracking_since TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_analysis_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for companies
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
CREATE INDEX IF NOT EXISTS idx_companies_priority ON companies(priority DESC);

-- ============================================
-- TABLE 2: documents
-- ============================================
-- Source documents (SEC filings, earnings reports, etc.)

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    title VARCHAR(500),
    filing_date DATE NOT NULL,
    fiscal_year INTEGER,
    fiscal_quarter INTEGER CHECK (fiscal_quarter >= 1 AND fiscal_quarter <= 4),
    source_url TEXT,
    storage_path TEXT,
    file_hash VARCHAR(64),
    processing_status processing_status DEFAULT 'PENDING',
    processed_at TIMESTAMPTZ,
    page_count INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_filing_date ON documents(filing_date DESC);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(processing_status);

-- ============================================
-- TABLE 3: market_data
-- ============================================
-- Daily price and valuation snapshots

CREATE TABLE IF NOT EXISTS market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    -- Price data
    open_price DECIMAL(12,4),
    high_price DECIMAL(12,4),
    low_price DECIMAL(12,4),
    close_price DECIMAL(12,4),
    adj_close DECIMAL(12,4),
    volume BIGINT,
    -- Valuation metrics
    market_cap BIGINT,
    pe_ratio DECIMAL(10,2),
    pb_ratio DECIMAL(10,2),
    ps_ratio DECIMAL(10,2),
    ev_ebitda DECIMAL(10,2),
    p_fcf DECIMAL(10,2),
    dividend_yield DECIMAL(8,4),
    -- Quality metrics
    roe DECIMAL(8,4),
    roic DECIMAL(8,4),
    net_margin DECIMAL(8,4),
    debt_equity DECIMAL(10,2),
    interest_coverage DECIMAL(10,2),
    -- Growth metrics
    revenue_growth DECIMAL(8,4),
    eps_growth DECIMAL(8,4),
    fcf_growth DECIMAL(8,4),
    -- Metadata
    source VARCHAR(50) DEFAULT 'FMP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, date)
);

-- Indexes for market_data
CREATE INDEX IF NOT EXISTS idx_market_data_company_date ON market_data(company_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_date ON market_data(date DESC);

-- ============================================
-- TABLE 4: analyses
-- ============================================
-- Analysis results with tree data and scores

CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    status analysis_status NOT NULL DEFAULT 'DRAFT',
    -- Tree data (full structured analysis)
    tree_data JSONB NOT NULL DEFAULT '{}',
    -- Denormalized scores for fast queries
    moat_score DECIMAL(5,2),
    valuation_score DECIMAL(5,2),
    quality_score DECIMAL(5,2),
    growth_score DECIMAL(5,2),
    dividend_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    -- Classification
    classification VARCHAR(50),
    recommendation TEXT,
    -- Validation
    validation_status validation_status,
    confidence_score DECIMAL(5,2),
    -- Audit fields
    data_hash VARCHAR(64),
    lock_id UUID,
    analyst_id VARCHAR(100),
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, version)
);

-- Indexes for analyses
CREATE INDEX IF NOT EXISTS idx_analyses_company ON analyses(company_id);
CREATE INDEX IF NOT EXISTS idx_analyses_current ON analyses(company_id) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_analyses_overall_score ON analyses(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_classification ON analyses(classification);

-- ============================================
-- TABLE 5: rule_executions
-- ============================================
-- Audit log of rule engine executions

CREATE TABLE IF NOT EXISTS rule_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    rule_set_id VARCHAR(100) NOT NULL,
    rule_set_version VARCHAR(20),
    dimension VARCHAR(50) NOT NULL,
    rule_id VARCHAR(100) NOT NULL,
    field_name VARCHAR(100),
    input_value DECIMAL(15,4),
    output_score DECIMAL(5,2),
    max_score DECIMAL(5,2),
    weight DECIMAL(5,4),
    passed BOOLEAN,
    explanation TEXT,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for rule_executions
CREATE INDEX IF NOT EXISTS idx_rule_executions_analysis ON rule_executions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_rule_executions_dimension ON rule_executions(dimension);
CREATE INDEX IF NOT EXISTS idx_rule_executions_rule ON rule_executions(rule_id);

-- ============================================
-- TABLE 6: validation_results
-- ============================================
-- Results of validation checks

CREATE TABLE IF NOT EXISTS validation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    check_name VARCHAR(50) NOT NULL,  -- SCHEMA, COVERAGE, SOURCE, HALLUCINATION, RULES
    status validation_status NOT NULL,
    score DECIMAL(5,2),
    issues JSONB DEFAULT '[]',
    details JSONB DEFAULT '{}',
    executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for validation_results
CREATE INDEX IF NOT EXISTS idx_validation_results_analysis ON validation_results(analysis_id);
CREATE INDEX IF NOT EXISTS idx_validation_results_status ON validation_results(status);
CREATE INDEX IF NOT EXISTS idx_validation_results_check ON validation_results(check_name);

-- ============================================
-- TABLE 7: daily_changes
-- ============================================
-- Change tracking for knowledge base updates

CREATE TABLE IF NOT EXISTS daily_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    old_analysis_id UUID REFERENCES analyses(id),
    new_analysis_id UUID REFERENCES analyses(id),
    trigger_type change_trigger NOT NULL,
    trigger_source VARCHAR(255),
    -- Change details
    changes JSONB NOT NULL DEFAULT '{}',
    impact_summary TEXT,
    impact_score DECIMAL(5,2),
    materiality VARCHAR(20),  -- HIGH, MEDIUM, LOW
    -- Review workflow
    review_tier review_tier NOT NULL DEFAULT 'TIER_2',
    review_status review_status NOT NULL DEFAULT 'PENDING',
    reviewer_id VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    outcome VARCHAR(50),  -- APPROVED, REJECTED, ESCALATED
    -- Timestamps
    detected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for daily_changes
CREATE INDEX IF NOT EXISTS idx_daily_changes_company ON daily_changes(company_id);
CREATE INDEX IF NOT EXISTS idx_daily_changes_status ON daily_changes(review_status);
CREATE INDEX IF NOT EXISTS idx_daily_changes_pending ON daily_changes(review_status) WHERE review_status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_daily_changes_tier ON daily_changes(review_tier);
CREATE INDEX IF NOT EXISTS idx_daily_changes_detected ON daily_changes(detected_at DESC);

-- ============================================
-- TABLE 8: audit_log
-- ============================================
-- System-wide audit trail

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL,  -- API, ANALYSIS, VALIDATION, REVIEW, SYSTEM
    entity_type VARCHAR(50),  -- company, analysis, document, etc.
    entity_id UUID,
    actor_type VARCHAR(20) NOT NULL DEFAULT 'SYSTEM',  -- SYSTEM, USER, API
    actor_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB DEFAULT '{}',
    correlation_id UUID,
    trace_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_category ON audit_log(event_category);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_correlation ON audit_log(correlation_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- ============================================
-- TRIGGER: Ensure single current analysis per company
-- ============================================
-- Critical constraint: Only one analysis can have is_current = TRUE per company

CREATE OR REPLACE FUNCTION ensure_single_current_analysis()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act when is_current is being set to TRUE
    IF NEW.is_current = TRUE THEN
        -- Set all other analyses for this company to is_current = FALSE
        UPDATE analyses
        SET is_current = FALSE,
            status = CASE
                WHEN status = 'APPROVED' THEN 'SUPERSEDED'::analysis_status
                ELSE status
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE company_id = NEW.company_id
          AND id != NEW.id
          AND is_current = TRUE;

        -- Also update the company's last_analysis_at
        UPDATE companies
        SET last_analysis_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.company_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure it's current
DROP TRIGGER IF EXISTS trg_ensure_single_current_analysis ON analyses;

CREATE TRIGGER trg_ensure_single_current_analysis
    BEFORE INSERT OR UPDATE OF is_current ON analyses
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_current_analysis();

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
DROP TRIGGER IF EXISTS trg_companies_updated_at ON companies;
CREATE TRIGGER trg_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_documents_updated_at ON documents;
CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_analyses_updated_at ON analyses;
CREATE TRIGGER trg_analyses_updated_at
    BEFORE UPDATE ON analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS
-- ============================================

-- View: Current analyses with company info
CREATE OR REPLACE VIEW v_current_analyses AS
SELECT
    c.id AS company_id,
    c.ticker,
    c.name AS company_name,
    c.sector,
    c.industry,
    c.status AS company_status,
    c.priority,
    a.id AS analysis_id,
    a.version,
    a.overall_score,
    a.valuation_score,
    a.quality_score,
    a.growth_score,
    a.dividend_score,
    a.moat_score,
    a.classification,
    a.recommendation,
    a.validation_status,
    a.confidence_score,
    a.status AS analysis_status,
    a.created_at AS analysis_date,
    a.updated_at AS last_updated
FROM companies c
LEFT JOIN analyses a ON c.id = a.company_id AND a.is_current = TRUE
WHERE c.status = 'ACTIVE'
ORDER BY c.priority DESC, c.ticker;

-- View: Pending reviews
CREATE OR REPLACE VIEW v_pending_reviews AS
SELECT
    dc.id AS change_id,
    c.ticker,
    c.name AS company_name,
    dc.trigger_type,
    dc.trigger_source,
    dc.impact_summary,
    dc.impact_score,
    dc.materiality,
    dc.review_tier,
    dc.review_status,
    dc.detected_at,
    dc.changes
FROM daily_changes dc
JOIN companies c ON dc.company_id = c.id
WHERE dc.review_status = 'PENDING'
ORDER BY
    CASE dc.materiality
        WHEN 'HIGH' THEN 1
        WHEN 'MEDIUM' THEN 2
        WHEN 'LOW' THEN 3
        ELSE 4
    END,
    dc.detected_at DESC;

-- View: Latest market data per company
CREATE OR REPLACE VIEW v_latest_market_data AS
SELECT DISTINCT ON (company_id)
    md.*,
    c.ticker,
    c.name AS company_name
FROM market_data md
JOIN companies c ON md.company_id = c.id
ORDER BY md.company_id, md.date DESC;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE companies IS 'Master list of companies being tracked for value investing analysis';
COMMENT ON TABLE documents IS 'Source documents including SEC filings and earnings reports';
COMMENT ON TABLE market_data IS 'Daily price and valuation metric snapshots';
COMMENT ON TABLE analyses IS 'Investment analysis results with tree-structured data and scores';
COMMENT ON TABLE rule_executions IS 'Audit trail of rule engine score calculations';
COMMENT ON TABLE validation_results IS 'Results of 5-check validation framework';
COMMENT ON TABLE daily_changes IS 'Change detection and review workflow tracking';
COMMENT ON TABLE audit_log IS 'System-wide audit trail for all operations';

COMMENT ON TRIGGER trg_ensure_single_current_analysis ON analyses IS 'Ensures only one analysis per company can have is_current=TRUE';

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
