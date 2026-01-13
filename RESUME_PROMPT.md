# Resume Prompt - Value Investing Dashboard

Copy everything below this line and paste it to continue:

---

## Project: US Value Investing Dashboard

**Location:** `/home/amee/ValueInvest/`

**GitHub:** https://github.com/Koulsami/ValueInvest

**n8n Instance:** https://valueinvest-production.up.railway.app

---

## Current Status

### What's Working ✅

| Component | Status | Notes |
|-----------|--------|-------|
| n8n on Railway | ✅ Running | Deployed via Railway CLI |
| FMP API | ✅ Connected | Free tier (limited endpoints) |
| Google Sheets | ✅ Connected | OAuth configured |
| Stage 1 Workflow | ✅ Working | `stage1_complete.json` - 50 stocks |
| Stage 2 Workflow | ✅ Working | `stage2_full_fields.json` - 34 fields |
| Looker Studio | ⚠️ Needs Update | Field names need to match new data |

### API Keys Configured

| Key | Location |
|-----|----------|
| FMP API | Hardcoded in workflows: `4x1WuP5kwdOeGA0lejzbQ3gAq2Ytcmpt` |
| OpenAI API | Railway env vars (not currently used - AI scoring removed) |
| Google Sheet ID | `1jMRAtD1tUQSYYD1gLWoHNw1IoBbUP-SPpBbStj01be0` |

---

## Working Workflows (Use These)

### Stage 1 - Complete
```
https://raw.githubusercontent.com/Koulsami/ValueInvest/main/workflows/stage1_complete.json
```
- Fetches 50 stocks from FMP `/stable/profile` endpoint
- Outputs 20 fields to `Stage1_Screened` tab

### Stage 2 - Full Fields
```
https://raw.githubusercontent.com/Koulsami/ValueInvest/main/workflows/stage2_full_fields.json
```
- Reads from `Stage1_Screened`
- Calculates scores + adds simulated data for missing fields
- Outputs 34 fields to `Stage2_Scored` tab

---

## Field Mapping Issue ⚠️

The original Looker Studio dashboard was built with `sample_stock_data.csv` which has specific field names. The new workflows produce similar but not identical field names.

### Fields Comparison

| Sample Data Field | Stage 2 Output Field | Match? |
|-------------------|---------------------|--------|
| symbol | symbol | ✅ |
| company_name | company_name | ✅ |
| sector | sector | ✅ |
| industry | industry | ✅ |
| exchange | exchange | ✅ |
| price | price | ✅ |
| market_cap | market_cap | ✅ |
| market_cap_display | market_cap_display | ✅ |
| pe_ratio | pe_ratio | ✅ |
| roe | roe | ✅ |
| roe_pct | roe_pct | ✅ |
| dividend_yield | dividend_yield | ✅ |
| dividend_yield_pct | dividend_yield_pct | ✅ |
| debt_equity | debt_equity | ✅ |
| beta | beta | ✅ |
| roic | roic | ✅ |
| fcf_yield | fcf_yield | ✅ |
| revenue_growth_1yr | revenue_growth_1yr | ✅ |
| eps | eps | ✅ |
| ma_200 | ma_200 | ✅ |
| score_valuation | score_valuation | ✅ |
| score_quality | score_quality | ✅ |
| score_growth | score_growth | ✅ |
| score_dividend | score_dividend | ✅ |
| score_moat | score_moat | ✅ |
| total_score | total_score | ✅ |
| score_category | score_category | ✅ |
| rank | rank | ✅ |
| rank_change | rank_change | ✅ |
| is_profitable | is_profitable | ✅ |
| is_dividend_paying | is_dividend_paying | ✅ |
| above_200ma | above_200ma | ✅ |
| is_penny_stock | is_penny_stock | ✅ |
| last_updated | last_updated | ✅ |

**All 34 fields should match now.**

---

## What Needs To Be Done

### Option A: Re-run Workflows & Reconnect Looker Studio
1. Clear `Stage1_Screened` tab (delete all data rows, keep headers)
2. Clear `Stage2_Scored` tab (delete all data rows, keep headers)
3. In n8n, import and run `Stage 1 - Complete`
4. In n8n, import and run `Stage 2 - Full Fields`
5. In Looker Studio:
   - Resource → Manage data sources
   - Edit the data source
   - Point to `Stage2_Scored` tab
   - Refresh fields
   - Fix any chart field mappings if needed

### Option B: Use Sample Data Directly
1. Copy data from `dashboard/looker-studio/sample_stock_data.csv`
2. Paste into `Stage2_Scored` tab
3. Reconnect Looker Studio (no field mismatches)

---

## FMP API Limitations (Free Tier)

| Endpoint | Status |
|----------|--------|
| `/stable/profile` | ✅ Works |
| `/stable/ratios-ttm` | ❌ Paid only for most stocks |
| `/stable/key-metrics-ttm` | ❌ Paid only |
| `/api/v3/*` (legacy) | ❌ Deprecated |

**Workaround:** Stage 2 generates simulated data for metrics not available on free tier (ROE, ROIC, D/E, etc.)

---

## File Structure

```
/home/amee/ValueInvest/
├── workflows/
│   ├── stage1_complete.json      ← USE THIS
│   ├── stage2_full_fields.json   ← USE THIS
│   ├── stage1_noloop.json        (old - works but fewer fields)
│   ├── stage2_profile_only.json  (old - works but fewer fields)
│   └── ... (other test versions)
├── dashboard/
│   └── looker-studio/
│       ├── sample_stock_data.csv  ← Original 40 stocks with all fields
│       ├── VALUE_INVESTING_101.md
│       └── STEP_BY_STEP_TUTORIAL.md
├── docs/
│   ├── MASTER_SPECIFICATION.md
│   └── stage1-4 specs...
├── Dockerfile
├── railway.toml
├── docker-compose.yml
├── DEPLOY.md
└── RESUME_PROMPT.md              ← This file
```

---

## Quick Commands

### Check n8n status
```bash
railway service status --all
```

### View n8n logs
```bash
railway logs
```

### Redeploy n8n
```bash
cd /home/amee/ValueInvest
railway up --detach
```

---

## Credentials Reference

| Service | Credential |
|---------|------------|
| n8n URL | https://valueinvest-production.up.railway.app |
| n8n Login | Use email (create account on first visit) |
| FMP API Key | `4x1WuP5kwdOeGA0lejzbQ3gAq2Ytcmpt` |
| Google Sheet ID | `1jMRAtD1tUQSYYD1gLWoHNw1IoBbUP-SPpBbStj01be0` |
| Looker Studio | https://lookerstudio.google.com/s/nzcSMM_-Nec |

---

## Next Steps When Resuming

1. **If Looker Studio fields are broken:**
   - Run both workflows to populate fresh data
   - In Looker Studio, reconnect data source to `Stage2_Scored`
   - Remap any broken chart fields

2. **If you want real data (not simulated):**
   - Upgrade FMP to Starter plan ($15/month)
   - Update workflows to use `/stable/ratios-ttm` endpoint

3. **If you want to add more stocks:**
   - Edit the Stock List node in Stage 1
   - Add more symbols to the array

4. **If you want AI moat analysis:**
   - OpenAI key is configured in Railway
   - Would need to add AI node back to Stage 2 workflow

---

**Tell me where you are and what you want to do next.**
