-- ============================================
-- Reasonex Core API - Seed Data
-- Version: 1.0.0
-- Date: 2026-01-16
-- ============================================
-- Initial data for testing and development
-- Safe to run multiple times (uses ON CONFLICT)

-- ============================================
-- SEED COMPANIES (10 stocks)
-- ============================================

INSERT INTO companies (ticker, name, sector, industry, exchange, priority, status)
VALUES
    ('NVDA', 'NVIDIA Corporation', 'Technology', 'Semiconductors', 'NASDAQ', 95, 'ACTIVE'),
    ('AAPL', 'Apple Inc.', 'Technology', 'Consumer Electronics', 'NASDAQ', 90, 'ACTIVE'),
    ('MSFT', 'Microsoft Corporation', 'Technology', 'Software - Infrastructure', 'NASDAQ', 90, 'ACTIVE'),
    ('GOOGL', 'Alphabet Inc.', 'Technology', 'Internet Content & Information', 'NASDAQ', 85, 'ACTIVE'),
    ('AMZN', 'Amazon.com Inc.', 'Consumer Cyclical', 'Internet Retail', 'NASDAQ', 85, 'ACTIVE'),
    ('META', 'Meta Platforms Inc.', 'Technology', 'Internet Content & Information', 'NASDAQ', 80, 'ACTIVE'),
    ('TSLA', 'Tesla Inc.', 'Consumer Cyclical', 'Auto Manufacturers', 'NASDAQ', 75, 'ACTIVE'),
    ('JPM', 'JPMorgan Chase & Co.', 'Financial Services', 'Banks - Diversified', 'NYSE', 70, 'ACTIVE'),
    ('V', 'Visa Inc.', 'Financial Services', 'Credit Services', 'NYSE', 70, 'ACTIVE'),
    ('JNJ', 'Johnson & Johnson', 'Healthcare', 'Drug Manufacturers', 'NYSE', 65, 'ACTIVE')
ON CONFLICT (ticker) DO UPDATE SET
    name = EXCLUDED.name,
    sector = EXCLUDED.sector,
    industry = EXCLUDED.industry,
    exchange = EXCLUDED.exchange,
    priority = EXCLUDED.priority,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- SEED MARKET DATA (latest snapshot)
-- ============================================

-- Insert market data for each company
INSERT INTO market_data (
    company_id, date,
    close_price, market_cap,
    pe_ratio, pb_ratio, ev_ebitda, p_fcf, dividend_yield,
    roe, roic, net_margin, debt_equity, interest_coverage,
    revenue_growth, eps_growth, fcf_growth
)
SELECT
    c.id,
    CURRENT_DATE,
    CASE c.ticker
        WHEN 'NVDA' THEN 875.50
        WHEN 'AAPL' THEN 185.25
        WHEN 'MSFT' THEN 420.75
        WHEN 'GOOGL' THEN 175.30
        WHEN 'AMZN' THEN 185.60
        WHEN 'META' THEN 505.20
        WHEN 'TSLA' THEN 248.50
        WHEN 'JPM' THEN 195.40
        WHEN 'V' THEN 285.60
        WHEN 'JNJ' THEN 155.80
    END,
    CASE c.ticker
        WHEN 'NVDA' THEN 2150000000000
        WHEN 'AAPL' THEN 2850000000000
        WHEN 'MSFT' THEN 3120000000000
        WHEN 'GOOGL' THEN 2180000000000
        WHEN 'AMZN' THEN 1920000000000
        WHEN 'META' THEN 1280000000000
        WHEN 'TSLA' THEN 790000000000
        WHEN 'JPM' THEN 565000000000
        WHEN 'V' THEN 580000000000
        WHEN 'JNJ' THEN 375000000000
    END,
    -- PE Ratio
    CASE c.ticker
        WHEN 'NVDA' THEN 65.5
        WHEN 'AAPL' THEN 28.5
        WHEN 'MSFT' THEN 35.2
        WHEN 'GOOGL' THEN 25.8
        WHEN 'AMZN' THEN 58.3
        WHEN 'META' THEN 28.5
        WHEN 'TSLA' THEN 72.5
        WHEN 'JPM' THEN 11.2
        WHEN 'V' THEN 30.5
        WHEN 'JNJ' THEN 15.8
    END,
    -- PB Ratio
    CASE c.ticker
        WHEN 'NVDA' THEN 52.5
        WHEN 'AAPL' THEN 48.2
        WHEN 'MSFT' THEN 12.8
        WHEN 'GOOGL' THEN 6.5
        WHEN 'AMZN' THEN 8.2
        WHEN 'META' THEN 8.5
        WHEN 'TSLA' THEN 15.2
        WHEN 'JPM' THEN 1.8
        WHEN 'V' THEN 14.5
        WHEN 'JNJ' THEN 5.8
    END,
    -- EV/EBITDA
    CASE c.ticker
        WHEN 'NVDA' THEN 55.2
        WHEN 'AAPL' THEN 22.5
        WHEN 'MSFT' THEN 25.8
        WHEN 'GOOGL' THEN 16.5
        WHEN 'AMZN' THEN 18.2
        WHEN 'META' THEN 15.8
        WHEN 'TSLA' THEN 45.5
        WHEN 'JPM' THEN 8.5
        WHEN 'V' THEN 22.5
        WHEN 'JNJ' THEN 12.8
    END,
    -- P/FCF
    CASE c.ticker
        WHEN 'NVDA' THEN 85.5
        WHEN 'AAPL' THEN 28.2
        WHEN 'MSFT' THEN 35.5
        WHEN 'GOOGL' THEN 22.8
        WHEN 'AMZN' THEN 35.5
        WHEN 'META' THEN 22.5
        WHEN 'TSLA' THEN 95.2
        WHEN 'JPM' THEN 8.5
        WHEN 'V' THEN 32.5
        WHEN 'JNJ' THEN 18.5
    END,
    -- Dividend Yield
    CASE c.ticker
        WHEN 'NVDA' THEN 0.0003
        WHEN 'AAPL' THEN 0.0052
        WHEN 'MSFT' THEN 0.0072
        WHEN 'GOOGL' THEN 0.0000
        WHEN 'AMZN' THEN 0.0000
        WHEN 'META' THEN 0.0040
        WHEN 'TSLA' THEN 0.0000
        WHEN 'JPM' THEN 0.0225
        WHEN 'V' THEN 0.0075
        WHEN 'JNJ' THEN 0.0305
    END,
    -- ROE
    CASE c.ticker
        WHEN 'NVDA' THEN 0.85
        WHEN 'AAPL' THEN 1.65
        WHEN 'MSFT' THEN 0.38
        WHEN 'GOOGL' THEN 0.28
        WHEN 'AMZN' THEN 0.22
        WHEN 'META' THEN 0.32
        WHEN 'TSLA' THEN 0.22
        WHEN 'JPM' THEN 0.16
        WHEN 'V' THEN 0.48
        WHEN 'JNJ' THEN 0.22
    END,
    -- ROIC
    CASE c.ticker
        WHEN 'NVDA' THEN 0.65
        WHEN 'AAPL' THEN 0.55
        WHEN 'MSFT' THEN 0.28
        WHEN 'GOOGL' THEN 0.22
        WHEN 'AMZN' THEN 0.12
        WHEN 'META' THEN 0.25
        WHEN 'TSLA' THEN 0.15
        WHEN 'JPM' THEN 0.08
        WHEN 'V' THEN 0.25
        WHEN 'JNJ' THEN 0.15
    END,
    -- Net Margin
    CASE c.ticker
        WHEN 'NVDA' THEN 0.55
        WHEN 'AAPL' THEN 0.25
        WHEN 'MSFT' THEN 0.35
        WHEN 'GOOGL' THEN 0.22
        WHEN 'AMZN' THEN 0.06
        WHEN 'META' THEN 0.28
        WHEN 'TSLA' THEN 0.12
        WHEN 'JPM' THEN 0.32
        WHEN 'V' THEN 0.52
        WHEN 'JNJ' THEN 0.18
    END,
    -- Debt/Equity
    CASE c.ticker
        WHEN 'NVDA' THEN 0.41
        WHEN 'AAPL' THEN 1.95
        WHEN 'MSFT' THEN 0.35
        WHEN 'GOOGL' THEN 0.05
        WHEN 'AMZN' THEN 0.85
        WHEN 'META' THEN 0.12
        WHEN 'TSLA' THEN 0.08
        WHEN 'JPM' THEN 1.25
        WHEN 'V' THEN 0.55
        WHEN 'JNJ' THEN 0.45
    END,
    -- Interest Coverage
    CASE c.ticker
        WHEN 'NVDA' THEN 250.5
        WHEN 'AAPL' THEN 45.2
        WHEN 'MSFT' THEN 42.8
        WHEN 'GOOGL' THEN 185.5
        WHEN 'AMZN' THEN 8.5
        WHEN 'META' THEN 125.5
        WHEN 'TSLA' THEN 15.2
        WHEN 'JPM' THEN 3.5
        WHEN 'V' THEN 28.5
        WHEN 'JNJ' THEN 22.5
    END,
    -- Revenue Growth
    CASE c.ticker
        WHEN 'NVDA' THEN 1.25
        WHEN 'AAPL' THEN 0.02
        WHEN 'MSFT' THEN 0.15
        WHEN 'GOOGL' THEN 0.12
        WHEN 'AMZN' THEN 0.12
        WHEN 'META' THEN 0.22
        WHEN 'TSLA' THEN 0.18
        WHEN 'JPM' THEN 0.08
        WHEN 'V' THEN 0.10
        WHEN 'JNJ' THEN 0.05
    END,
    -- EPS Growth
    CASE c.ticker
        WHEN 'NVDA' THEN 5.85
        WHEN 'AAPL' THEN 0.08
        WHEN 'MSFT' THEN 0.22
        WHEN 'GOOGL' THEN 0.35
        WHEN 'AMZN' THEN 0.85
        WHEN 'META' THEN 0.65
        WHEN 'TSLA' THEN 0.25
        WHEN 'JPM' THEN 0.15
        WHEN 'V' THEN 0.15
        WHEN 'JNJ' THEN 0.08
    END,
    -- FCF Growth
    CASE c.ticker
        WHEN 'NVDA' THEN 3.50
        WHEN 'AAPL' THEN 0.05
        WHEN 'MSFT' THEN 0.18
        WHEN 'GOOGL' THEN 0.45
        WHEN 'AMZN' THEN 1.25
        WHEN 'META' THEN 0.55
        WHEN 'TSLA' THEN 0.35
        WHEN 'JPM' THEN 0.12
        WHEN 'V' THEN 0.12
        WHEN 'JNJ' THEN 0.05
    END
FROM companies c
WHERE c.ticker IN ('NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'V', 'JNJ')
ON CONFLICT (company_id, date) DO UPDATE SET
    close_price = EXCLUDED.close_price,
    market_cap = EXCLUDED.market_cap,
    pe_ratio = EXCLUDED.pe_ratio,
    pb_ratio = EXCLUDED.pb_ratio,
    ev_ebitda = EXCLUDED.ev_ebitda,
    p_fcf = EXCLUDED.p_fcf,
    dividend_yield = EXCLUDED.dividend_yield,
    roe = EXCLUDED.roe,
    roic = EXCLUDED.roic,
    net_margin = EXCLUDED.net_margin,
    debt_equity = EXCLUDED.debt_equity,
    interest_coverage = EXCLUDED.interest_coverage,
    revenue_growth = EXCLUDED.revenue_growth,
    eps_growth = EXCLUDED.eps_growth,
    fcf_growth = EXCLUDED.fcf_growth;

-- ============================================
-- SEED ANALYSIS (NVDA - Complete Example)
-- ============================================

INSERT INTO analyses (
    company_id,
    version,
    is_current,
    status,
    tree_data,
    moat_score,
    valuation_score,
    quality_score,
    growth_score,
    dividend_score,
    overall_score,
    classification,
    recommendation,
    validation_status,
    confidence_score,
    analyst_id
)
SELECT
    c.id,
    1,
    TRUE,
    'APPROVED',
    '{
        "company": {
            "ticker": "NVDA",
            "name": "NVIDIA Corporation",
            "sector": "Technology"
        },
        "moat": {
            "score": 9.5,
            "category": "Wide",
            "factors": [
                {"name": "Technology Leadership", "strength": "High", "description": "Dominant in AI/ML GPU market"},
                {"name": "Network Effects", "strength": "High", "description": "CUDA ecosystem lock-in"},
                {"name": "Switching Costs", "strength": "High", "description": "Developer ecosystem dependency"},
                {"name": "Brand", "strength": "High", "description": "Premium pricing power"}
            ],
            "risks": ["Competition from AMD, custom chips", "Cyclical semiconductor market"],
            "summary": "NVIDIA has one of the widest moats in technology due to its dominant position in AI accelerators and the CUDA software ecosystem."
        },
        "valuation": {
            "pe_ratio": 65.5,
            "pb_ratio": 52.5,
            "ev_ebitda": 55.2,
            "p_fcf": 85.5,
            "assessment": "Premium valuation justified by growth"
        },
        "quality": {
            "roe": 0.85,
            "roic": 0.65,
            "net_margin": 0.55,
            "debt_equity": 0.41,
            "interest_coverage": 250.5,
            "assessment": "Exceptional quality metrics"
        },
        "growth": {
            "revenue_growth": 1.25,
            "eps_growth": 5.85,
            "fcf_growth": 3.50,
            "assessment": "Explosive growth driven by AI demand"
        },
        "dividend": {
            "yield": 0.0003,
            "payout_ratio": 0.01,
            "assessment": "Minimal dividend, reinvesting in growth"
        }
    }'::jsonb,
    9.5,  -- moat_score
    5.0,  -- valuation_score (low due to high PE)
    25.0, -- quality_score (max)
    20.0, -- growth_score (max)
    0.0,  -- dividend_score
    59.5, -- overall_score
    'Fair',
    'Hold - Exceptional company with premium valuation. Quality and growth metrics are outstanding but valuation limits upside.',
    'PASS',
    0.95,
    'system'
FROM companies c
WHERE c.ticker = 'NVDA'
ON CONFLICT (company_id, version) DO UPDATE SET
    tree_data = EXCLUDED.tree_data,
    moat_score = EXCLUDED.moat_score,
    valuation_score = EXCLUDED.valuation_score,
    quality_score = EXCLUDED.quality_score,
    growth_score = EXCLUDED.growth_score,
    dividend_score = EXCLUDED.dividend_score,
    overall_score = EXCLUDED.overall_score,
    classification = EXCLUDED.classification,
    recommendation = EXCLUDED.recommendation,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- SEED VALIDATION RESULTS (for NVDA analysis)
-- ============================================

INSERT INTO validation_results (analysis_id, check_name, status, score, details)
SELECT
    a.id,
    check_name,
    'PASS'::validation_status,
    1.0,
    '{}'::jsonb
FROM analyses a
CROSS JOIN (
    VALUES ('SCHEMA'), ('COVERAGE'), ('SOURCE'), ('HALLUCINATION'), ('RULES')
) AS checks(check_name)
WHERE a.company_id = (SELECT id FROM companies WHERE ticker = 'NVDA')
  AND a.is_current = TRUE
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED AUDIT LOG ENTRY
-- ============================================

INSERT INTO audit_log (
    event_type,
    event_category,
    entity_type,
    entity_id,
    actor_type,
    actor_id,
    action,
    new_value,
    metadata
)
SELECT
    'DATABASE_SEEDED',
    'SYSTEM',
    'database',
    NULL,
    'SYSTEM',
    'seed.sql',
    'Initial database seed completed',
    json_build_object(
        'companies_count', (SELECT COUNT(*) FROM companies),
        'market_data_count', (SELECT COUNT(*) FROM market_data),
        'analyses_count', (SELECT COUNT(*) FROM analyses)
    )::jsonb,
    json_build_object('version', '1.0.0')::jsonb;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show seeded data summary
SELECT 'Companies' as table_name, COUNT(*) as row_count FROM companies
UNION ALL
SELECT 'Market Data', COUNT(*) FROM market_data
UNION ALL
SELECT 'Analyses', COUNT(*) FROM analyses
UNION ALL
SELECT 'Validation Results', COUNT(*) FROM validation_results
UNION ALL
SELECT 'Audit Log', COUNT(*) FROM audit_log;

-- ============================================
-- SEED COMPLETE
-- ============================================
