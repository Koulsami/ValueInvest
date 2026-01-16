# Provision PostgreSQL Database

The database schema, client module, and seed data are ready. Follow these steps to provision the PostgreSQL database on Railway.

## Step 1: Add PostgreSQL to Railway

### Option A: Railway Dashboard (Recommended)

1. Go to [Railway Dashboard](https://railway.com/dashboard)
2. Open the `reasonex-core-api` project
3. Click **"New"** button (+ icon)
4. Select **"Database"**
5. Choose **"PostgreSQL"**
6. Wait for provisioning (~30 seconds)

### Option B: Railway CLI (requires TTY terminal)

```bash
cd /home/amee/ValueInvest/packages/reasonex-core-api
railway add -d postgres
```

## Step 2: Link Database to Service

After PostgreSQL is provisioned:

1. In Railway dashboard, click on the **PostgreSQL** service
2. Go to **"Variables"** tab
3. Copy the **DATABASE_URL** value
4. Click on your **reasonex-core-api** service
5. Go to **"Variables"** tab
6. Add variable: `DATABASE_URL` = (paste the URL)

Or use the "Reference" feature:
1. Click **"+ New Variable"**
2. Click **"Add Reference"**
3. Select **PostgreSQL** → **DATABASE_URL**

## Step 3: Run Schema

Connect to the database and run the schema:

```bash
# Get the DATABASE_URL
railway variables | grep DATABASE_URL

# Run schema (replace URL)
psql "postgresql://postgres:xxx@xxx.railway.internal:5432/railway" -f database/schema.sql

# Or using railway run
railway connect postgres
# Then paste schema.sql contents

# Or from local psql (use public URL)
psql "postgresql://postgres:xxx@xxx.railway.app:5432/railway?sslmode=require" -f database/schema.sql
```

## Step 4: Seed Data

```bash
psql "$DATABASE_URL" -f database/seed.sql
```

## Step 5: Verify

```bash
psql "$DATABASE_URL" -f database/verify.sql
```

## Step 6: Redeploy API

After adding DATABASE_URL to the service:

```bash
railway up --service reasonex-core-api
```

## Step 7: Test Health Endpoint

```bash
curl https://reasonex-core-api-production.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "api": "healthy",
    "database": "healthy",
    "database_latency_ms": 5
  }
}
```

## Troubleshooting

### Cannot connect to database

```bash
# Check if DATABASE_URL is set
railway variables | grep DATABASE

# Test connection
railway run psql -c "SELECT 1"
```

### SSL Error

Use `sslmode=require` for external connections:
```bash
psql "postgresql://...?sslmode=require"
```

### Schema already exists

The schema is idempotent - safe to run multiple times. It uses `IF NOT EXISTS` for all CREATE statements.
