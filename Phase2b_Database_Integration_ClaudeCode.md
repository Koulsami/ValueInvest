# PHASE 2b: Database Integration

## Implementation Prompt for Claude Code

---

**Document Type:** Implementation Specification  
**Phase:** 2b (insert between Phase 2 and Phase 3)  
**Prerequisites:** Phase 2a (Database Schema) must be complete with all 8 tables created  
**Outcome:** All API endpoints persist their results to the database

---

## 1. WHAT YOU ARE BUILDING

Integrate the existing API endpoints with the existing PostgreSQL database so that all operations are persisted. Currently the database schema exists and the API endpoints work, but they are not connected. Results are returned to the caller but never saved.

After this phase, every score calculation, every validation check, every lock operation, and every API call will be recorded in the database with full audit trails.

---

## 2. THE PROBLEM THIS SOLVES

Current state: The /score endpoint calculates scores and returns them, but the rule_executions table remains empty. The /validate endpoint runs checks and returns results, but the validation_results table has only test data. There is no way to retrieve past analyses or audit what happened.

Required state: Every API operation persists its inputs, outputs, and metadata to the appropriate database tables. Users can query historical analyses. The system maintains complete audit trails for regulatory compliance.

---

## 3. EXISTING INFRASTRUCTURE

### Database Tables (Already Created)

The following tables exist and are empty or have only seed data:

**companies** - 10 rows of seed data. Contains ticker, name, sector, industry, status, priority, last_analysis_at.

**documents** - 0 rows. Will store references to source documents (SEC filings). Fields include company_id, document_type, filing_date, s3_path, content_hash.

**market_data** - 10 rows of seed data. Contains daily price and ratio snapshots per company.

**analyses** - 2 rows of seed data. This is the main table for storing analysis results. Fields include company_id, version, is_current, status, tree_data (JSONB), all score fields, classification, recommendation, validation_status, data_hash, lock_id.

**rule_executions** - 0 rows. Must store every rule that runs during scoring. Fields include analysis_id, rule_id, rule_name, category, input_value, threshold_used, result_classification, score_awarded, execution_time_ms.

**validation_results** - 5 rows of test data. Must store every validation check result. Fields include analysis_id, check_name, status (PASS/FLAG/FAIL), details (JSONB), executed_at.

**daily_changes** - 0 rows. For future KB update workflow. Not part of this phase.

**audit_log** - 1 row of test data. Must store every API operation. Fields include table_name, record_id, action, old_values, new_values, user_id, ip_address, user_agent, created_at.

### API Endpoints (Already Working)

**POST /api/v1/score** - Accepts data and ruleSetId, returns scores and classification. Currently does not persist anything.

**POST /api/v1/lock** - Accepts data, returns data_hash and lock_id. Currently does not persist anything.

**POST /api/v1/validate** - Accepts analysis object, returns validation status and check results. Currently does not persist anything.

**POST /api/v1/tree** - Accepts entity and documents, returns tree structure. Currently does not persist anything.

**POST /api/v1/detect** - Accepts old and new versions, returns changes. Currently does not persist anything.

**POST /api/v1/route** - Accepts change object, returns routing decision. Currently does not persist anything.

**GET /health** - Returns service health including database status. No changes needed.

### Database Client (Already Created)

The file src/lib/database.ts provides a singleton database client with:
- Connection pooling (max 10 connections)
- queryAll(sql, params) - returns array of rows
- queryOne(sql, params) - returns single row or null
- transaction(callback) - executes callback within transaction
- healthCheck() - returns connection status

---

## 4. INTEGRATION REQUIREMENTS

### 4.1 Score Endpoint Integration

When POST /api/v1/score is called:

First, determine if this is for an existing company or ad-hoc analysis. Check if the request includes a company_id or ticker field. If it includes a ticker, look up the company_id from the companies table. If no company reference is provided, treat it as an ad-hoc analysis that still gets logged but not linked to a company.

Second, if a company is identified, create or update an analysis record. Query the analyses table for the current analysis (is_current = true) for this company. If one exists and its status is DRAFT, update it. If one exists and its status is APPROVED, create a new version. If none exists, create version 1.

Third, execute the scoring logic as currently implemented. This part does not change.

Fourth, after scoring completes, insert one row into rule_executions for each rule that was evaluated. Each row must include: the analysis_id (if company-linked), rule_id, rule_name, category, the input value that was evaluated, the threshold that was applied, the resulting classification, the score awarded, and the execution time in milliseconds.

Fifth, update the analysis record with the calculated scores. Set moat_score, valuation_score, quality_score, growth_score, dividend_score, overall_score, classification, and recommendation. Set status to SCORED. Set updated_at to current timestamp.

Sixth, insert an audit_log record with action INSERT or UPDATE, the table name analyses, the record_id, and the new_values as JSONB.

Seventh, return the response as currently implemented, but add the analysis_id to the response so the caller can reference it.

### 4.2 Lock Endpoint Integration

When POST /api/v1/lock is called:

First, execute the lock logic as currently implemented to generate the data_hash and lock_id.

Second, if the request includes an analysis_id, update that analysis record. Set data_hash to the generated hash, lock_id to the generated ID, and status to LOCKED. The LOCKED status indicates the tree_data is now immutable.

Third, if no analysis_id is provided but a ticker is provided, find the current analysis for that company and update it.

Fourth, if neither is provided, this is a standalone lock operation. Still log it to audit_log but do not update any analysis.

Fifth, insert an audit_log record with action LOCK, table_name analyses (if applicable), and the hash details.

Sixth, return the response as currently implemented.

### 4.3 Validate Endpoint Integration

When POST /api/v1/validate is called:

First, execute the validation logic as currently implemented to run all five checks.

Second, if the request includes an analysis_id, link the validation results to that analysis. If it includes a ticker, look up the current analysis for that company.

Third, insert one row into validation_results for each check that was executed. Each row must include: analysis_id (if linked), check_name (SCHEMA, COVERAGE, SOURCE, HALLUCINATION, RULE_EXECUTION), status (PASS, FLAG, or FAIL), and details as JSONB containing the specific findings.

Fourth, update the analysis record if linked. Set validation_status based on the overall result (PASSED if all checks pass, FLAGGED if any check flags, FAILED if any check fails). Set status to VALIDATED.

Fifth, insert an audit_log record.

Sixth, return the response as currently implemented, but add the analysis_id if one was linked.

### 4.4 Tree Endpoint Integration

When POST /api/v1/tree is called:

First, execute the tree building logic as currently implemented.

Second, if the request includes a company_id or ticker, create or update an analysis record. Store the generated tree in the tree_data JSONB field. Set status to DRAFT.

Third, insert an audit_log record.

Fourth, return the response as currently implemented, but add the analysis_id.

### 4.5 Detect Endpoint Integration

When POST /api/v1/detect is called:

First, execute the change detection logic as currently implemented.

Second, log the detection operation to audit_log. Include the old and new version identifiers and the number of changes detected.

Third, return the response as currently implemented. Do not insert into daily_changes yet - that is for the future KB update workflow.

### 4.6 Route Endpoint Integration

When POST /api/v1/route is called:

First, execute the routing logic as currently implemented.

Second, log the routing decision to audit_log. Include the determined tier and reviewers.

Third, return the response as currently implemented.

---

## 5. NEW ENDPOINTS TO ADD

### 5.1 Get Analysis

**GET /api/v1/analyses/{analysis_id}** - Retrieve a specific analysis by ID.

Query the analyses table for the given ID. Join with companies to include ticker and name. Include the tree_data, all scores, classification, recommendation, validation_status, and timestamps.

Return 404 if not found.

### 5.2 Get Current Analysis by Ticker

**GET /api/v1/companies/{ticker}/analysis** - Retrieve the current analysis for a company.

Look up the company by ticker. Query analyses where company_id matches and is_current is true.

Return 404 if company not found or no current analysis exists.

### 5.3 List Analyses for Company

**GET /api/v1/companies/{ticker}/analyses** - List all analysis versions for a company.

Look up the company by ticker. Query all analyses for that company_id ordered by version descending.

Support optional query parameters: status (filter by status), limit (default 10), offset (default 0).

### 5.4 Get Rule Executions

**GET /api/v1/analyses/{analysis_id}/rule-executions** - List all rule executions for an analysis.

Query rule_executions where analysis_id matches. Order by category then rule_id.

### 5.5 Get Validation Results

**GET /api/v1/analyses/{analysis_id}/validations** - List all validation results for an analysis.

Query validation_results where analysis_id matches. Order by executed_at descending.

### 5.6 List Companies

**GET /api/v1/companies** - List all tracked companies.

Query companies table. Support optional query parameters: status (filter by status), sector (filter by sector), limit (default 50), offset (default 0), sort (ticker, name, priority, last_analysis_at).

### 5.7 Get Company

**GET /api/v1/companies/{ticker}** - Get company details.

Query companies table by ticker. Include latest market_data if available by joining with v_latest_market_data view.

Return 404 if not found.

---

## 6. TRANSACTION HANDLING

All write operations that touch multiple tables must use database transactions. If any insert or update fails, the entire operation must roll back.

For the score endpoint: the transaction must include inserting/updating the analysis record and inserting all rule_execution records. If inserting the 15th rule execution fails, the analysis update and the first 14 rule executions must all roll back.

For the validate endpoint: the transaction must include inserting all validation_result records and updating the analysis record.

Use the existing transaction method from the database client: db.transaction(async (client) => { ... }). All queries within the callback use the provided client, not the main db object.

---

## 7. ERROR HANDLING

If a database insert or update fails, catch the error and return a 500 response with error details. Do not return partial results.

If a foreign key constraint fails (e.g., invalid company_id), return a 400 response explaining the invalid reference.

If a unique constraint fails (e.g., duplicate analysis version), handle it gracefully. For analyses, this might mean incrementing the version and retrying.

Log all database errors to the application log with full context including the SQL that failed and the parameters.

---

## 8. AUDIT LOG REQUIREMENTS

Every write operation must create an audit_log entry. The entry must include:

- table_name: The primary table affected (e.g., analyses, rule_executions)
- record_id: The UUID of the created or updated record
- action: One of INSERT, UPDATE, DELETE, LOCK, VALIDATE, SCORE
- old_values: For updates, the previous values as JSONB. Null for inserts.
- new_values: The new values as JSONB
- user_id: If authentication is implemented, the user ID. Otherwise null.
- ip_address: Extract from request headers (X-Forwarded-For or socket remote address)
- user_agent: Extract from request User-Agent header
- created_at: Current timestamp

For operations that affect multiple records (e.g., inserting 20 rule_executions), create one audit_log entry for the parent operation (the analysis) rather than 20 individual entries. Include a summary in new_values like rule_executions_count: 20.

---

## 9. RESPONSE FORMAT CHANGES

All endpoints that create or update analyses must include the analysis_id in their response so callers can use it for subsequent operations.

Current score response:
```
{
  "success": true,
  "result": {
    "scores": { ... },
    "classification": "Good"
  }
}
```

New score response:
```
{
  "success": true,
  "result": {
    "analysis_id": "uuid-here",
    "scores": { ... },
    "classification": "Good",
    "persisted": true
  }
}
```

Add a "persisted" boolean to indicate whether the result was saved to the database. This will be true for company-linked analyses and false for ad-hoc analyses without a company reference.

---

## 10. IMPLEMENTATION ORDER

Build in this sequence:

**Step 1:** Create a new file src/repositories/analysis-repository.ts. Implement functions for: findByCompanyId, findCurrentByCompanyId, findById, create, update, updateScores, updateValidation, updateLock. Each function should use the database client and return typed objects.

**Step 2:** Create src/repositories/rule-execution-repository.ts. Implement functions for: createMany (bulk insert), findByAnalysisId.

**Step 3:** Create src/repositories/validation-result-repository.ts. Implement functions for: createMany (bulk insert), findByAnalysisId.

**Step 4:** Create src/repositories/audit-repository.ts. Implement a single function: log(table, recordId, action, oldValues, newValues, request). Extract IP and user agent from the request object.

**Step 5:** Create src/repositories/company-repository.ts. Implement functions for: findByTicker, findById, list, updateLastAnalysisAt.

**Step 6:** Modify the score endpoint in src/routes/score.ts (or wherever it lives). Import the repositories. Add logic to create/update analysis, insert rule executions, and log to audit. Wrap in transaction.

**Step 7:** Modify the lock endpoint. Add logic to update analysis with hash and lock_id. Log to audit.

**Step 8:** Modify the validate endpoint. Add logic to insert validation results and update analysis status. Wrap in transaction. Log to audit.

**Step 9:** Modify the tree endpoint. Add logic to create/update analysis with tree_data. Log to audit.

**Step 10:** Modify detect and route endpoints. Add audit logging only.

**Step 11:** Add the new GET endpoints. Create src/routes/analyses.ts for analysis endpoints. Create src/routes/companies.ts for company endpoints. Register routes in main app.

**Step 12:** Test end-to-end. Call POST /score with a ticker, verify analysis and rule_executions are created. Call GET to retrieve them. Verify audit_log entries.

---

## 11. TYPE DEFINITIONS

Create or update TypeScript interfaces for the database records:

**Analysis interface:** id (string), companyId (string), version (number), isCurrent (boolean), status (AnalysisStatus enum), treeData (object), moatScore (number or null), valuationScore (number or null), qualityScore (number or null), growthScore (number or null), dividendScore (number or null), overallScore (number or null), classification (string or null), recommendation (string or null), validationStatus (ValidationStatus enum or null), confidenceScore (number or null), dataHash (string or null), lockId (string or null), createdAt (Date), updatedAt (Date).

**AnalysisStatus enum:** DRAFT, SCORED, LOCKED, VALIDATED, APPROVED, SUPERSEDED, REJECTED.

**ValidationStatus enum:** PENDING, PASSED, FLAGGED, FAILED.

**RuleExecution interface:** id (string), analysisId (string), ruleId (string), ruleName (string), category (string), inputValue (number or string or null), thresholdUsed (string or null), resultClassification (string), scoreAwarded (number), executionTimeMs (number), createdAt (Date).

**ValidationResult interface:** id (string), analysisId (string), checkName (string), status (CheckStatus enum), details (object), executedAt (Date).

**CheckStatus enum:** PASS, FLAG, FAIL.

**AuditLogEntry interface:** id (string), tableName (string), recordId (string), action (string), oldValues (object or null), newValues (object or null), userId (string or null), ipAddress (string or null), userAgent (string or null), createdAt (Date).

**Company interface:** id (string), ticker (string), name (string), sector (string or null), industry (string or null), country (string), exchange (string or null), status (CompanyStatus enum), priority (number), trackingSince (Date), lastAnalysisAt (Date or null), metadata (object), createdAt (Date), updatedAt (Date).

**CompanyStatus enum:** ACTIVE, PAUSED, ARCHIVED.

---

## 12. SQL QUERY PATTERNS

For inserting rule executions in bulk, use a single INSERT with multiple value sets rather than individual inserts. This is more efficient and maintains transaction integrity.

For the single-current trigger: the database already has a trigger that ensures only one analysis per company has is_current=true. When you insert or update an analysis with is_current=true, the trigger automatically sets any other current analysis for that company to is_current=false. You do not need to handle this in application code.

For getting the latest market data: use the v_latest_market_data view which already filters to the most recent date per company.

---

## 13. CONFIGURATION

No new environment variables are needed. The DATABASE_URL is already configured and used by the existing database client.

Ensure the database client is initialized before the API routes are registered. The existing health check already verifies database connectivity.

---

## 14. TESTING CHECKLIST

After implementation, verify:

1. POST /api/v1/score with ticker "NVDA" creates an analysis record with is_current=true
2. The analysis has all score fields populated
3. The rule_executions table has one row per rule evaluated (approximately 15-20 rows)
4. The audit_log has an entry with action SCORE
5. GET /api/v1/analyses/{id} returns the created analysis
6. GET /api/v1/companies/NVDA/analysis returns the same analysis
7. POST /api/v1/score with same ticker updates the existing analysis (same ID, version 1)
8. POST /api/v1/lock with the analysis_id sets data_hash and status to LOCKED
9. POST /api/v1/validate with the analysis_id creates validation_results and updates validation_status
10. Calling score again after lock creates version 2 (cannot modify locked analysis)
11. Version 1 has is_current=false, version 2 has is_current=true (trigger worked)
12. GET /api/v1/companies/NVDA/analyses returns both versions
13. POST /api/v1/score without ticker still works but returns persisted=false
14. All operations complete within acceptable time (under 500ms for score)

---

## 15. SUCCESS CRITERIA

The implementation is complete when:

1. Every POST /score call for a known company creates/updates an analysis record
2. Every rule execution is logged to rule_executions table
3. Every POST /validate call creates validation_result records
4. Every POST /lock call updates the analysis with hash and lock status
5. Every write operation creates an audit_log entry
6. All new GET endpoints return correct data from the database
7. Transactions properly roll back on partial failures
8. The single-current trigger correctly manages analysis versions
9. Response times remain acceptable (no more than 100ms overhead)
10. All 14 test checklist items pass

---

## 16. WHAT NOT TO BUILD

Do not build:
- New database tables (schema is complete)
- Authentication system (defer to later phase)
- Rate limiting on new endpoints (use existing if any)
- Caching layer (not needed yet)
- Background jobs for persistence (do synchronously)
- daily_changes population (that is for KB update workflow)

---

**END OF SPECIFICATION**
