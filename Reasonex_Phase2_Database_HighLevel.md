# Phase 2: Database Implementation

## Context

Based on Phase 0 and Phase 1 analysis, the Reasonex system has:
- ✅ Working Core API (TypeScript/Express on Railway) with 7 engines
- ✅ Working n8n Nodes (TypeScript) with 7 nodes
- ✅ Existing tree database (may contain company/analysis data)
- ❌ **No integrated persistence layer** - API results are not stored

**Goal**: Implement database layer that integrates with any existing tree database and adds missing tables for complete system persistence.

---

## Pre-Implementation: Assess Existing Database

Before creating new tables, assess what already exists:

### Step 1: Check for Existing Database

Check if there's an existing database connection configured:
- Look for DATABASE_URL in environment variables
- Check for any existing database configuration files
- Look for any existing SQL files or migration scripts

### Step 2: If Database Exists, Catalog Existing Tables

Run discovery queries to understand current state:
- List all existing tables
- Document existing table schemas
- Check for existing data (especially company/analysis data)
- Note any existing indexes and constraints

### Step 3: Document Findings

Create `DATABASE_ASSESSMENT.md` with:
- Connection details (host, database name)
- List of existing tables
- Row counts for each table
- Schema summary for key tables
- Recommendation: extend vs replace

---

## What You Must Build

### 1. Database Connection

If no database exists:
- Provision PostgreSQL 15+ (Railway recommended)
- Configure DATABASE_URL environment variable

If database exists:
- Use existing connection
- Extend schema with missing tables only

### 2. Required Tables

The system needs these 8 tables. **Check if any already exist before creating:**

| Table | Purpose | Create If Missing |
|-------|---------|-------------------|
| `companies` | Companies being tracked | Check first - may exist |
| `documents` | Source documents (SEC filings) | Likely new |
| `market_data` | Daily price/valuation snapshots | Likely new |
| `analyses` | Analysis results with tree data | Check first - may exist as different name |
| `rule_executions` | Audit log of rule runs | Likely new |
| `validation_results` | Validation check results | Likely new |
| `daily_changes` | Change tracking for KB updates | Likely new |
| `audit_log` | System-wide audit trail | Likely new |

### 3. Integration Strategy

**If existing tree database has company/analysis data:**
- Map existing tables to the required schema
- Create views to provide consistent interface if schemas differ
- Add missing columns via ALTER TABLE if structure is close
- Do NOT delete or replace existing data

**If starting fresh:**
- Create all 8 tables with recommended schema
- Seed with test data

---

## Table Requirements (High-Level)

### companies
- Unique ticker symbol
- Company name, sector, industry
- Tracking status (ACTIVE/PAUSED/ARCHIVED)
- Priority ranking (1-100)
- Timestamps

### documents
- Links to company (foreign key)
- Document type (10-K, 10-Q, 8-K, earnings, etc.)
- Filing date, fiscal year/quarter
- Storage path or URL
- Processing status

### market_data
- Links to company (foreign key)
- Date-specific (unique per company+date)
- Price data (open, high, low, close)
- Valuation metrics (P/E, EV/EBITDA, etc.)
- Market cap

### analyses
- Links to company (foreign key)
- Version number (unique per company)
- **is_current flag** - critical: only one TRUE per company
- Tree data as JSONB
- Denormalized scores (moat, financial, valuation, etc.)
- Overall score and recommendation
- Validation status
- Timestamps and audit fields

### rule_executions
- Links to analysis (foreign key)
- Rule identifier and category
- Input value used
- Output score produced
- Execution timestamp

### validation_results
- Links to analysis (foreign key)
- Check name (SCHEMA, COVERAGE, SOURCE, HALLUCINATION, RULES)
- Status (PASS/FLAG/FAIL)
- Details as JSONB

### daily_changes
- Links to company and old/new analyses
- Trigger type and source
- Change details (what changed, impact)
- Review status and tier
- Reviewer and outcome

### audit_log
- Event type and category
- Entity reference (type + ID)
- Actor (system or user)
- Old/new values as JSONB
- Correlation ID for tracing

---

## Critical Constraint: Single Current Analysis

The most important data integrity rule:

**Only one analysis can have `is_current = TRUE` per company.**

Implement this via database trigger:
- When inserting/updating an analysis with is_current = TRUE
- Automatically set all other analyses for same company to is_current = FALSE
- Optionally mark superseded analyses with status = 'SUPERSEDED'

Test this thoroughly - it's the foundation of the versioning system.

---

## Views Required

### v_current_analyses
- Join companies with their current analysis
- Show: ticker, name, sector, scores, recommendation, confidence
- Filter: only ACTIVE companies

### v_pending_reviews
- Show daily_changes awaiting review
- Order by: priority (CRITICAL > HIGH > MEDIUM > LOW), then date
- Include: ticker, change type, impact, tier

---

## Seed Data (If Creating Fresh)

If no existing data, seed with:
- 10 companies: NVDA, AAPL, MSFT, GOOGL, AMZN, META, TSLA, JPM, V, JNJ
- Current market data for each
- At least 1 complete analysis (NVDA recommended - has interesting moat story)

If existing data present:
- Do NOT overwrite
- May add missing companies if desired

---

## Database Client Module

Create/update `core-api/src/lib/database.ts` (or equivalent) with:

1. **Connection Pool** - Reuse connections, don't create per-request
2. **Query Helper** - Execute queries with logging
3. **Transaction Helper** - Wrap operations in BEGIN/COMMIT/ROLLBACK
4. **Health Check** - Simple SELECT 1 to verify connection

The module should:
- Read DATABASE_URL from environment
- Handle SSL for production (Railway requires it)
- Log query execution time
- Handle errors gracefully

---

## Health Endpoint Update

Update `/health` endpoint to report database status:

```
GET /health

Response:
{
  "status": "healthy" | "degraded",
  "services": {
    "api": "healthy",
    "database": "healthy" | "unhealthy"
  }
}
```

---

## File Structure

```
database/
├── assessment.md       # Document existing database state
├── schema.sql          # New/modified tables (idempotent)
├── seed.sql            # Test data (skip if data exists)
├── verify.sql          # Verification queries
└── README.md           # Setup and migration instructions

core-api/src/lib/
└── database.ts         # Connection module
```

---

## Acceptance Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | Database assessment completed | `DATABASE_ASSESSMENT.md` exists |
| 2 | Database accessible | `SELECT 1` succeeds |
| 3 | All 8 tables exist (or mapped) | Table list shows all required |
| 4 | Single-current trigger works | Insert test passes |
| 5 | Views return data | `SELECT * FROM v_current_analyses LIMIT 1` works |
| 6 | Company data exists | At least 1 company in database |
| 7 | Foreign keys enforced | Invalid FK insert fails |
| 8 | Health endpoint reports database | `/health` shows database status |
| 9 | Existing data preserved | No data loss if database existed |
| 10 | Schema is idempotent | Can run schema.sql twice without error |

---

## Evidence Required

Create `PHASE2_COMPLETE.md` containing:

1. **Database assessment summary** - What existed before, what was added
2. **Table list** - All tables now available
3. **Data counts** - Companies, analyses, etc.
4. **Trigger test** - Proof single-current works
5. **Health endpoint** - JSON output showing database healthy
6. **Files created/modified** - List of deliverables

---

## Important Notes

1. **Preserve existing data** - Never drop tables with data without explicit approval
2. **Use IF NOT EXISTS** - Make all CREATE statements idempotent
3. **Test trigger thoroughly** - This is the most critical constraint
4. **Document decisions** - Explain any schema mapping choices
5. **Environment variables** - No hardcoded connection strings

---

## What NOT To Do

- Do not delete existing tables or data
- Do not modify existing Core API logic (persistence integration is Phase 3)
- Do not create n8n workflows
- Do not add tables beyond the 8 specified
- Do not hardcode any credentials

---

## After Completion

Share `PHASE2_COMPLETE.md` with evidence. The architect will review and provide Phase 3, which will integrate persistence into the Core API endpoints.

---

**END OF PHASE 2**
