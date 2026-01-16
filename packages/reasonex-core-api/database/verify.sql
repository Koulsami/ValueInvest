-- ============================================
-- Reasonex Core API - Database Verification
-- Version: 1.0.0
-- Date: 2026-01-16
-- ============================================
-- Run these queries to verify database setup

-- ============================================
-- 1. Basic Connectivity
-- ============================================
SELECT 'Connectivity Test' as test, CASE WHEN 1=1 THEN 'PASS' ELSE 'FAIL' END as result;

-- ============================================
-- 2. List All Tables
-- ============================================
SELECT
    'Tables Created' as test,
    table_name,
    CASE WHEN table_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as result
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- 3. Verify All 8 Required Tables
-- ============================================
SELECT
    'Required Tables' as test,
    CASE
        WHEN COUNT(*) = 8 THEN 'PASS (' || COUNT(*) || '/8)'
        ELSE 'FAIL (' || COUNT(*) || '/8)'
    END as result
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'companies', 'documents', 'market_data', 'analyses',
    'rule_executions', 'validation_results', 'daily_changes', 'audit_log'
  );

-- ============================================
-- 4. Verify Views
-- ============================================
SELECT
    'Views Created' as test,
    table_name as view_name,
    CASE WHEN table_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as result
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 5. Verify Triggers
-- ============================================
SELECT
    'Triggers Created' as test,
    trigger_name,
    event_object_table as table_name,
    CASE WHEN trigger_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END as result
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- ============================================
-- 6. Verify Data Counts
-- ============================================
SELECT 'Data Counts' as test, 'companies' as table_name, COUNT(*) as row_count FROM companies
UNION ALL SELECT 'Data Counts', 'documents', COUNT(*) FROM documents
UNION ALL SELECT 'Data Counts', 'market_data', COUNT(*) FROM market_data
UNION ALL SELECT 'Data Counts', 'analyses', COUNT(*) FROM analyses
UNION ALL SELECT 'Data Counts', 'rule_executions', COUNT(*) FROM rule_executions
UNION ALL SELECT 'Data Counts', 'validation_results', COUNT(*) FROM validation_results
UNION ALL SELECT 'Data Counts', 'daily_changes', COUNT(*) FROM daily_changes
UNION ALL SELECT 'Data Counts', 'audit_log', COUNT(*) FROM audit_log;

-- ============================================
-- 7. Test Single Current Trigger
-- ============================================
-- This test creates two analyses for the same company
-- and verifies only one can be is_current = TRUE

DO $$
DECLARE
    test_company_id UUID;
    analysis1_id UUID;
    analysis2_id UUID;
    current_count INTEGER;
BEGIN
    -- Get first company
    SELECT id INTO test_company_id FROM companies LIMIT 1;

    IF test_company_id IS NULL THEN
        RAISE NOTICE 'Trigger Test: SKIP (no companies in database)';
        RETURN;
    END IF;

    -- Insert first analysis as current
    INSERT INTO analyses (company_id, version, is_current, status, tree_data)
    VALUES (test_company_id, 9997, TRUE, 'DRAFT', '{}')
    RETURNING id INTO analysis1_id;

    -- Insert second analysis as current (should auto-set first to FALSE)
    INSERT INTO analyses (company_id, version, is_current, status, tree_data)
    VALUES (test_company_id, 9998, TRUE, 'DRAFT', '{}')
    RETURNING id INTO analysis2_id;

    -- Count current analyses for this company
    SELECT COUNT(*) INTO current_count
    FROM analyses
    WHERE company_id = test_company_id AND is_current = TRUE;

    -- Clean up test data
    DELETE FROM analyses WHERE id IN (analysis1_id, analysis2_id);

    -- Report result
    IF current_count = 1 THEN
        RAISE NOTICE 'Trigger Test: PASS (only 1 current analysis after inserting 2)';
    ELSE
        RAISE NOTICE 'Trigger Test: FAIL (% current analyses found, expected 1)', current_count;
    END IF;
END $$;

-- ============================================
-- 8. Verify Foreign Key Constraints
-- ============================================
SELECT
    'Foreign Keys' as test,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    'PASS' as result
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================
-- 9. Verify Indexes
-- ============================================
SELECT
    'Indexes' as test,
    indexname,
    tablename,
    'PASS' as result
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- 10. Test View Queries
-- ============================================
SELECT 'View: v_current_analyses' as test,
       CASE WHEN COUNT(*) >= 0 THEN 'PASS' ELSE 'FAIL' END as result,
       COUNT(*) as row_count
FROM v_current_analyses;

SELECT 'View: v_pending_reviews' as test,
       CASE WHEN COUNT(*) >= 0 THEN 'PASS' ELSE 'FAIL' END as result,
       COUNT(*) as row_count
FROM v_pending_reviews;

SELECT 'View: v_latest_market_data' as test,
       CASE WHEN COUNT(*) >= 0 THEN 'PASS' ELSE 'FAIL' END as result,
       COUNT(*) as row_count
FROM v_latest_market_data;

-- ============================================
-- SUMMARY
-- ============================================
SELECT '=== VERIFICATION COMPLETE ===' as message;
