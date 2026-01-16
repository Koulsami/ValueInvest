-- ============================================
-- Phase 3: Rule Development Workbench Schema
-- ============================================
-- Adds tables for research sessions, document management,
-- research queries, draft rules, and test cases

-- ============================================
-- ENUM TYPES
-- ============================================

DO $$ BEGIN
    CREATE TYPE session_status AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_upload_status AS ENUM ('UPLOADING', 'INDEXED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE workbench_document_type AS ENUM ('REGULATION', 'GUIDELINE', 'PRECEDENT', 'REFERENCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE confidence_level AS ENUM ('HIGH', 'MEDIUM', 'LOW');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE rule_validation_status AS ENUM ('DRAFT', 'VALIDATED', 'DEPLOYED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLE 1: research_sessions
-- ============================================
-- Tracks research sessions for rule development

CREATE TABLE IF NOT EXISTS research_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vertical VARCHAR(100) NOT NULL,
    expert_name VARCHAR(255),
    description TEXT,
    status session_status NOT NULL DEFAULT 'ACTIVE',
    document_count INTEGER DEFAULT 0,
    query_count INTEGER DEFAULT 0,
    rule_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_research_sessions_vertical ON research_sessions(vertical);
CREATE INDEX IF NOT EXISTS idx_research_sessions_status ON research_sessions(status);
CREATE INDEX IF NOT EXISTS idx_research_sessions_created ON research_sessions(created_at DESC);

-- ============================================
-- TABLE 2: session_documents
-- ============================================
-- Links documents to research sessions

CREATE TABLE IF NOT EXISTS session_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    gemini_file_uri VARCHAR(500),
    gemini_file_name VARCHAR(255),
    display_name VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500),
    document_type workbench_document_type NOT NULL DEFAULT 'REFERENCE',
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    page_count INTEGER,
    upload_status document_upload_status NOT NULL DEFAULT 'UPLOADING',
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_session_documents_session ON session_documents(session_id);
CREATE INDEX IF NOT EXISTS idx_session_documents_status ON session_documents(upload_status);

-- ============================================
-- TABLE 3: research_queries
-- ============================================
-- Stores research queries and responses

CREATE TABLE IF NOT EXISTS research_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    response_text TEXT,
    findings JSONB DEFAULT '[]',
    citations JSONB DEFAULT '[]',
    confidence confidence_level,
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    error_message TEXT,
    queried_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_research_queries_session ON research_queries(session_id);
CREATE INDEX IF NOT EXISTS idx_research_queries_queried ON research_queries(queried_at DESC);

-- ============================================
-- TABLE 4: draft_rules
-- ============================================
-- Stores generated rule definitions

CREATE TABLE IF NOT EXISTS draft_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    rule_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    rule_type VARCHAR(50),
    rule_definition JSONB NOT NULL,
    rule_yaml TEXT,
    source_query_ids UUID[] DEFAULT '{}',
    validation_status rule_validation_status NOT NULL DEFAULT 'DRAFT',
    test_pass_count INTEGER DEFAULT 0,
    test_fail_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_draft_rules_session ON draft_rules(session_id);
CREATE INDEX IF NOT EXISTS idx_draft_rules_status ON draft_rules(validation_status);
CREATE INDEX IF NOT EXISTS idx_draft_rules_rule_id ON draft_rules(rule_id);

-- ============================================
-- TABLE 5: rule_test_cases
-- ============================================
-- Stores test cases for rule validation

CREATE TABLE IF NOT EXISTS rule_test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    inputs JSONB NOT NULL,
    expected_outputs JSONB NOT NULL,
    actual_outputs JSONB,
    passed BOOLEAN,
    error_message TEXT,
    execution_time_ms INTEGER,
    tested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rule_test_cases_session ON rule_test_cases(session_id);
CREATE INDEX IF NOT EXISTS idx_rule_test_cases_passed ON rule_test_cases(passed);

-- ============================================
-- TABLE 6: exported_rule_sets
-- ============================================
-- Tracks exported rule set files

CREATE TABLE IF NOT EXISTS exported_rule_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    rule_set_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    vertical VARCHAR(100) NOT NULL,
    yaml_content TEXT NOT NULL,
    file_path VARCHAR(500),
    rule_count INTEGER,
    test_case_count INTEGER,
    pass_rate DECIMAL(5,2),
    deployed_at TIMESTAMPTZ,
    deployed_to VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exported_rule_sets_session ON exported_rule_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_exported_rule_sets_vertical ON exported_rule_sets(vertical);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update session document count trigger
CREATE OR REPLACE FUNCTION update_session_document_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE research_sessions SET document_count = document_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.session_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE research_sessions SET document_count = document_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = OLD.session_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_document_count ON session_documents;
CREATE TRIGGER trg_update_document_count
    AFTER INSERT OR DELETE ON session_documents
    FOR EACH ROW EXECUTE FUNCTION update_session_document_count();

-- Update session query count trigger
CREATE OR REPLACE FUNCTION update_session_query_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE research_sessions SET query_count = query_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.session_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE research_sessions SET query_count = query_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = OLD.session_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_query_count ON research_queries;
CREATE TRIGGER trg_update_query_count
    AFTER INSERT OR DELETE ON research_queries
    FOR EACH ROW EXECUTE FUNCTION update_session_query_count();

-- Update session rule count trigger
CREATE OR REPLACE FUNCTION update_session_rule_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE research_sessions SET rule_count = rule_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.session_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE research_sessions SET rule_count = rule_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = OLD.session_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_rule_count ON draft_rules;
CREATE TRIGGER trg_update_rule_count
    AFTER INSERT OR DELETE ON draft_rules
    FOR EACH ROW EXECUTE FUNCTION update_session_rule_count();

-- Auto-update timestamps
DROP TRIGGER IF EXISTS trg_research_sessions_updated_at ON research_sessions;
CREATE TRIGGER trg_research_sessions_updated_at
    BEFORE UPDATE ON research_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_draft_rules_updated_at ON draft_rules;
CREATE TRIGGER trg_draft_rules_updated_at
    BEFORE UPDATE ON draft_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE research_sessions IS 'Phase 3: Research sessions for rule development workbench';
COMMENT ON TABLE session_documents IS 'Phase 3: Documents uploaded to Gemini for RAG queries';
COMMENT ON TABLE research_queries IS 'Phase 3: Research queries with Gemini responses and citations';
COMMENT ON TABLE draft_rules IS 'Phase 3: Draft rule definitions generated from research';
COMMENT ON TABLE rule_test_cases IS 'Phase 3: Test cases for validating draft rules';
COMMENT ON TABLE exported_rule_sets IS 'Phase 3: Exported rule set files ready for deployment';

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
