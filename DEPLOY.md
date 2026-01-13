# Deploy Value Investing Pipeline

This guide deploys n8n with your stock screening/scoring workflows to Railway (free tier).

## Prerequisites

You need accounts for:
1. **GitHub** - To store the code
2. **Railway** - To host n8n (free $5/month credit)
3. **FMP API** - Financial data (free 250 calls/day)
4. **OpenAI** - AI analysis (pay-as-you-go, ~$0.01/stock)
5. **Google Cloud** - For Sheets API access

---

## Step 1: Get API Keys (5 minutes)

### 1.1 FMP API Key
1. Go to https://site.financialmodelingprep.com/developer/docs
2. Click "Get Free API Key"
3. Sign up and copy your API key

### 1.2 OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key (starts with `sk-`)

---

## Step 2: Create GitHub Repository (2 minutes)

### Option A: Using GitHub CLI (if installed)
```bash
cd /home/amee/ValueInvest
gh repo create ValueInvest --public --source=. --push
```

### Option B: Manual
1. Go to https://github.com/new
2. Name: `ValueInvest`
3. Make it **Public**
4. Don't initialize with README
5. Create repository
6. Then run:
```bash
cd /home/amee/ValueInvest
git remote add origin https://github.com/YOUR_USERNAME/ValueInvest.git
git push -u origin main
```

---

## Step 3: Deploy to Railway (5 minutes)

1. Go to https://railway.app
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your `ValueInvest` repository
6. Railway will auto-detect the Dockerfile

### Configure Environment Variables

In Railway dashboard → Your project → Variables tab, add:

| Variable | Value |
|----------|-------|
| `N8N_BASIC_AUTH_ACTIVE` | `true` |
| `N8N_BASIC_AUTH_USER` | `admin` |
| `N8N_BASIC_AUTH_PASSWORD` | (choose a secure password) |
| `FMP_API_KEY` | (your FMP key) |
| `OPENAI_API_KEY` | (your OpenAI key) |
| `GOOGLE_SHEET_ID` | (from Step 4) |

### Generate Domain

1. Go to Settings → Networking
2. Click "Generate Domain"
3. You'll get a URL like: `valueinvest-production.up.railway.app`

---

## Step 4: Set Up Google Sheets (10 minutes)

### 4.1 Create a New Google Sheet

1. Go to https://sheets.google.com
2. Create a new spreadsheet
3. Name it: `Value Investing Data`
4. Create two sheets (tabs):
   - `Stage1_Screened`
   - `Stage2_Scored`

### 4.2 Get the Sheet ID

From the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

Copy the `SHEET_ID_HERE` part and add it to Railway variables.

### 4.3 Set Up Google Cloud Credentials (for n8n)

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable **Google Sheets API**:
   - APIs & Services → Enable APIs → Search "Sheets" → Enable
4. Create OAuth credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth Client ID
   - Application type: Web application
   - Name: `n8n Value Investing`
   - Authorized redirect URIs: `https://YOUR-RAILWAY-URL.up.railway.app/rest/oauth2-credential/callback`
5. Download the JSON credentials

### 4.4 Configure n8n with Google Sheets

1. Open your n8n instance: `https://YOUR-RAILWAY-URL.up.railway.app`
2. Log in with your credentials
3. Go to **Credentials** → **Add Credential** → **Google Sheets OAuth2**
4. Enter your Client ID and Client Secret from Google Cloud
5. Click **Connect** and authorize

---

## Step 5: Import Workflows (2 minutes)

1. In n8n, go to **Workflows**
2. Click **Import from File**
3. Upload `workflows/stage1_screening.json`
4. Repeat for `workflows/stage2_scoring.json`

### Update Workflow Credentials

For each workflow:
1. Open the workflow
2. Click on the **Google Sheets** node
3. Select your Google Sheets credential
4. Save the workflow

---

## Step 6: Test the Pipeline (5 minutes)

### Test Stage 1 (Screening)

1. Open `Stage 1 - Stock Screening` workflow
2. Click **Execute Workflow**
3. Watch the execution
4. Check Google Sheets - `Stage1_Screened` should have data

### Test Stage 2 (Scoring)

1. Open `Stage 2 - Value Scoring` workflow
2. Click **Execute Workflow**
3. This will read from Stage1 and write to Stage2

---

## Step 7: Schedule Daily Runs (Optional)

1. Edit each workflow
2. Replace **Manual Trigger** with **Schedule Trigger**
3. Set to run daily at 6 AM:
   - Trigger: Schedule
   - Mode: Every Day
   - Hour: 6
   - Minute: 0
4. Activate the workflow (toggle in top right)

---

## Troubleshooting

### "API rate limit exceeded"
- FMP free tier = 250 calls/day
- Stage 1 needs ~800 calls (batch over 4 days)
- Or upgrade to FMP paid plan

### "Google Sheets permission denied"
- Re-authorize the Google Sheets credential
- Make sure the Sheet is shared with the service account

### "OpenAI error"
- Check your API key is valid
- Check you have credits in your OpenAI account

### Workflow not saving data
- Check the `GOOGLE_SHEET_ID` environment variable
- Verify sheet names match: `Stage1_Screened`, `Stage2_Scored`

---

## Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway | $5/month credit | $0.000463/vCPU-min |
| FMP | 250 calls/day | $15/mo (unlimited) |
| OpenAI | Pay-as-you-go | ~$0.01/stock scored |
| Google Sheets | Free | Free |

**Estimated monthly cost: $0-5** (within free tiers)

---

## Next Steps

Once the pipeline is running:
1. Connect your Looker Studio dashboard to the Google Sheet
2. Or build a custom Next.js dashboard (see `docs/stage4_dashboard_ui_spec.md`)
