# Reasonex Core API - Database

PostgreSQL database schema and setup for the Reasonex Core API.

## Prerequisites

- PostgreSQL 15 or higher
- `psql` command-line client

## Quick Start

### 1. Provision PostgreSQL on Railway

```bash
# From the project root
cd packages/reasonex-core-api
railway add -d postgres
```

Or via Railway dashboard:
1. Go to your project
2. Click "New" → "Database" → "PostgreSQL"
3. Wait for provisioning

### 2. Get Connection String

```bash
railway variables | grep DATABASE
```

Copy the `DATABASE_URL` value.

### 3. Run Schema

```bash
# Using the Railway connection
railway run psql -f database/schema.sql

# Or with explicit connection string
psql $DATABASE_URL -f database/schema.sql
```

### 4. Seed Data (Optional)

```bash
railway run psql -f database/seed.sql
```

### 5. Verify Setup

```bash
railway run psql -f database/verify.sql
```

## Files

| File | Description |
|------|-------------|
| `DATABASE_ASSESSMENT.md` | Assessment of existing database state |
| `schema.sql` | Complete database schema (8 tables, triggers, views) |
| `seed.sql` | Sample data for testing (10 companies, market data) |
| `verify.sql` | Verification queries to test setup |
| `README.md` | This file |

## Tables

| Table | Description | Rows (seeded) |
|-------|-------------|---------------|
| `companies` | Company master data | 10 |
| `documents` | Source documents (SEC filings) | 0 |
| `market_data` | Daily price/valuation snapshots | 10 |
| `analyses` | Analysis results with tree data | 1 |
| `rule_executions` | Audit log of rule runs | 0 |
| `validation_results` | Validation check results | 5 |
| `daily_changes` | Change tracking for KB updates | 0 |
| `audit_log` | System-wide audit trail | 1 |

## Views

| View | Description |
|------|-------------|
| `v_current_analyses` | Current analysis for each active company |
| `v_pending_reviews` | Changes awaiting review, sorted by priority |
| `v_latest_market_data` | Most recent market data per company |

## Critical Constraint

**Only one analysis can have `is_current = TRUE` per company.**

This is enforced by the `trg_ensure_single_current_analysis` trigger. When a new analysis is set as current, the trigger automatically:
1. Sets all other analyses for the same company to `is_current = FALSE`
2. Updates their status to `SUPERSEDED` if they were `APPROVED`
3. Updates the company's `last_analysis_at` timestamp

## Environment Variables

```bash
# Required for database connection
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require

# Optional
DATABASE_POOL_SIZE=10    # Max connections (default: 10)
DATABASE_SSL=true        # Force SSL (auto-detected for Railway)
```

## Local Development

For local development without Railway:

```bash
# Start PostgreSQL (Docker)
docker run --name reasonex-db -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:15

# Set local DATABASE_URL
export DATABASE_URL=postgresql://postgres:secret@localhost:5432/postgres

# Run schema
psql $DATABASE_URL -f database/schema.sql
psql $DATABASE_URL -f database/seed.sql
```

## Troubleshooting

### Connection Failed

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Railway variables
railway variables
```

### SSL Certificate Error

For Railway, use `sslmode=require` or `sslmode=no-verify`:

```bash
psql "$DATABASE_URL?sslmode=no-verify"
```

### Trigger Not Working

```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'trg_ensure_single_current_analysis';

-- Recreate if needed
\i database/schema.sql
```

## Schema Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  companies   │────<│  documents   │     │  market_data │
│              │     │              │     │              │
│ id           │     │ id           │     │ id           │
│ ticker       │     │ company_id   │     │ company_id   │
│ name         │     │ document_type│     │ date         │
│ sector       │     │ filing_date  │     │ close_price  │
│ status       │     │ ...          │     │ pe_ratio     │
└──────────────┘     └──────────────┘     │ ...          │
       │                                   └──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────────┐  ┌───────────────────┐
│  analyses    │────<│  rule_executions │  │ validation_results│
│              │     │                  │  │                   │
│ id           │     │ id               │  │ id                │
│ company_id   │     │ analysis_id      │  │ analysis_id       │
│ version      │     │ dimension        │  │ check_name        │
│ is_current   │     │ rule_id          │  │ status            │
│ tree_data    │     │ output_score     │  │ ...               │
│ overall_score│     │ ...              │  └───────────────────┘
└──────────────┘     └──────────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│ daily_changes│     │  audit_log   │
│              │     │              │
│ id           │     │ id           │
│ company_id   │     │ event_type   │
│ trigger_type │     │ entity_type  │
│ review_tier  │     │ actor_type   │
│ ...          │     │ ...          │
└──────────────┘     └──────────────┘
```
