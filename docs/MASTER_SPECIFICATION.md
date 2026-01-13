# Value Investment Screening System - Master Specification

## Quick Reference

| Document | Description |
|----------|-------------|
| [Stage 1 Spec](./stage1_preliminary_screening_spec.md) | Preliminary Screening (5000+ → ~500) |
| [Stage 2 Spec](./stage2_detailed_scoring_spec.md) | Detailed Scoring (~500 companies) |
| [Stage 3 Spec](./stage3_deep_analysis_spec.md) | Deep Analysis (On-demand) |
| [Stage 4 Spec](./stage4_dashboard_ui_spec.md) | Interactive Dashboard UI |

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               US VALUE INVESTING DASHBOARD - BLOOMBERG STYLE                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │   STAGE 1    │    │   STAGE 2    │    │   STAGE 3    │    │  STAGE 4  │ │
│  │  Screening   │───▶│   Scoring    │───▶│Deep Analysis │───▶│ DASHBOARD │ │
│  │  5000+ → 500 │    │   All Scored │    │  On-Demand   │    │    UI     │ │
│  └──────────────┘    └──────────────┘    └──────────────┘    └───────────┘ │
│        │                   │                   │                   │        │
│        ▼                   ▼                   ▼                   ▼        │
│   FMP Screener        FMP Ratios          SEC EDGAR          Looker Studio │
│   FMP Ratios TTM      OpenAI              FMP Financials     (Prototype)   │
│                                           OpenAI GPT-4       → Custom App  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Design Philosophy:** "Bloomberg Terminal but free - every filter at your fingertips"

---

## Dashboard Features

### Control Panel (Top 15% - Sticky)
- **Core Sliders:** P/E, ROE, Market Cap, Dividend Yield, Debt/Equity
- **Live Counts:** Each slider shows "X stocks match" in real-time
- **Quick Toggles:** Penny stocks, Profitable only, 200d MA, Dividend paying
- **Actions:** Search, Screen, Deep Analysis, Save, Print

### Results Table (70%)
- Sortable columns: Rank, Symbol, Score, P/E, ROE, Div, D/E, MktCap, Sector
- Color-coded scores (85+: Green, 70-84: Yellow, <70: White)
- Expandable rows with charts and peer comparisons
- Bulk select for multi-stock analysis

### Sidebar (20%)
- Score distribution histogram
- Mini portfolio preview for selected stocks
- Combined metrics vs S&P 500

### Advanced Panel (Collapsible)
- Beta, ROIC, FCF Yield, Revenue Growth filters
- Custom score weight adjustment

---

## API Budget Summary

### FMP API (250 calls/day free tier)

| Stage | API Calls | Strategy |
|-------|-----------|----------|
| Stage 1 | ~200 | Initial screening |
| Stage 2 | ~400 | Detailed metrics (batch over 2 days) |
| Stage 3 | ~10/analysis | On-demand only |
| **Daily Refresh** | ~50 | Price/score updates |

### SEC EDGAR API (10 requests/second)
- No daily limit
- Requires User-Agent header
- Used only for Stage 3 deep analysis (on-demand)

### OpenAI API
- ~500 calls for full Stage 2 scoring
- ~1 call per Stage 3 deep analysis
- Cost: ~$5-10 per full run (GPT-4)

---

## Complete Technology Stack

```yaml
Data Pipeline:
  - n8n (self-hosted on Railway/Hostinger)
  - Scheduled daily refresh

APIs:
  - Financial Modeling Prep (FMP)
  - SEC EDGAR
  - OpenAI GPT-4 / Groq

Dashboard:
  Phase 1: Looker Studio (Prototype)
    - Quick setup
    - Google Sheets integration
    - Stakeholder validation

  Phase 2: Custom Web App (Production)
    - Next.js + React
    - TailwindCSS
    - Chart.js / Recharts
    - Full interactivity

Data Storage:
  - Google Sheets (Looker Studio source)
  - PostgreSQL / Supabase (Production)
  - JSON cache files
```

---

## Value Scoring Framework

### Category Weights (100 points total, user-adjustable)

| Category | Default Points | Key Metrics |
|----------|----------------|-------------|
| **Valuation** | 30 | P/E, P/B, EV/EBITDA, P/FCF |
| **Quality** | 25 | ROE, ROIC, Margins, Debt |
| **Growth** | 20 | Revenue, EPS, FCF growth |
| **Dividend** | 15 | Yield, Payout, Growth |
| **Moat** | 10 | AI assessment, ROIC consistency |

### Score Color Coding (Dashboard)

| Score | Color | CSS |
|-------|-------|-----|
| 85-100 | Emerald Green | `#10B981` |
| 70-84 | Yellow | `#FCD34D` |
| 50-69 | Light Gray | `#F3F4F6` |
| 0-49 | Light Red | `#FEE2E2` |

---

## Key Screening Thresholds (Default, User-Adjustable)

### Dashboard Slider Defaults
| Metric | Range | Default |
|--------|-------|---------|
| P/E Ratio Max | 5-50 | 15 |
| ROE Minimum | 0%-40% | 12% |
| Market Cap Min | $100M-$500B | $1B |
| Dividend Yield Min | 0%-10% | 0% |
| Debt/Equity Max | 0-3.0 | 1.0 |

### Deep Analysis Recommendation
| Margin of Safety | Recommendation |
|------------------|----------------|
| >= 35% | Strong Buy |
| 20-34% | Buy |
| 5-19% | Hold |
| -10% to 4% | Weak Hold |
| < -10% | Sell |

---

## Implementation Phases

### Phase 1: Data Pipeline
- [ ] Set up n8n environment
- [ ] Configure API credentials (FMP, OpenAI)
- [ ] Build Stage 1 screening workflow
- [ ] Build Stage 2 scoring workflow
- [ ] Output to Google Sheets for Looker Studio

### Phase 2: Looker Studio Prototype
- [ ] Connect Google Sheets data source
- [ ] Build basic filterable table
- [ ] Add score distribution chart
- [ ] Validate with stakeholders
- [ ] Gather feedback on UX

### Phase 3: Custom Dashboard MVP
- [ ] Set up Next.js project
- [ ] Implement core sliders with live counts
- [ ] Build interactive results table
- [ ] Add sorting and basic filtering

### Phase 4: Full Dashboard Features
- [ ] Expandable row details
- [ ] Deep analysis modal (Stage 3 integration)
- [ ] Sidebar visualizations
- [ ] Saved screens functionality
- [ ] URL parameter sharing

### Phase 5: Mobile & Polish
- [ ] Responsive design (tablet, mobile)
- [ ] Performance optimization (virtual scrolling)
- [ ] Keyboard shortcuts
- [ ] Print view
- [ ] Service worker for offline

---

## Configuration Template

```javascript
// Master Configuration
const CONFIG = {
  // API Keys
  api: {
    fmpKey: process.env.FMP_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
    groqKey: process.env.GROQ_API_KEY
  },

  // Stage 1: Screening (broader for dashboard filtering)
  screening: {
    minMarketCap: 100000000,   // $100M (let users filter up)
    exchanges: ['NASDAQ', 'NYSE'],
    excludedSectors: [],       // Include all for user filtering
    targetCompanies: 5000      // Full US market
  },

  // Stage 2: Scoring
  scoring: {
    defaultWeights: {
      valuation: 0.30,
      quality: 0.25,
      growth: 0.20,
      dividend: 0.15,
      moat: 0.10
    }
  },

  // Stage 3: DCF (on-demand)
  dcf: {
    riskFreeRate: 0.04,
    marketPremium: 0.055,
    terminalGrowth: 0.025,
    projectionYears: 5
  },

  // Dashboard Defaults
  dashboard: {
    defaultFilters: {
      peMax: 15,
      roeMin: 0.12,
      marketCapMin: 1000000000,
      dividendYieldMin: 0,
      debtEquityMax: 1.0
    },
    refreshInterval: 86400000  // 24 hours
  },

  // Rate Limiting
  rateLimits: {
    fmpDelayMs: 200,
    secDelayMs: 100,
    batchSize: 10
  }
};
```

---

## Data Schema

### Stock Data (Dashboard Display)

```typescript
interface StockData {
  symbol: string;
  companyName: string;
  score: number;
  scoreBreakdown: {
    valuation: number;
    quality: number;
    growth: number;
    dividend: number;
    moat: number;
  };
  metrics: {
    pe: number;
    roe: number;
    dividendYield: number;
    debtEquity: number;
    marketCap: number;
    beta: number;
    roic: number;
    fcfYield: number;
    revenueGrowth1yr: number;
    price: number;
    ma200: number;
    eps: number;
  };
  sector: string;
  exchange: 'NYSE' | 'NASDAQ';
  rankChange: number;
  lastUpdated: string;
}
```

---

## Error Recovery Procedures

### API Rate Limit Exceeded
1. Queue remaining requests
2. Resume next day (FMP) or after cooldown (SEC)
3. Serve cached data to dashboard

### Missing Financial Data
1. Log missing symbol
2. Exclude from scoring (show as "N/A")
3. Continue with available data

### Dashboard Data Stale
1. Show "Last updated: X hours ago" warning
2. Trigger manual refresh option
3. Use cached data until refresh completes

---

## Files Structure

```
/home/amee/ValueInvest/
├── docs/
│   ├── MASTER_SPECIFICATION.md
│   ├── value_investment_workflow_prompt.md
│   ├── stage1_preliminary_screening_spec.md
│   ├── stage2_detailed_scoring_spec.md
│   ├── stage3_deep_analysis_spec.md
│   ├── stage4_dashboard_ui_spec.md          # NEW
│   └── stage4_pdf_generation_spec.md        # ARCHIVED
├── workflows/
│   ├── stage1_screening.json
│   ├── stage2_scoring.json
│   └── stage3_analysis.json
├── dashboard/                                # NEW
│   ├── looker-studio/
│   │   └── data-source-config.md
│   └── web-app/
│       ├── src/
│       ├── package.json
│       └── ...
└── data/
    ├── stocks.json                          # Full dataset
    └── deep-analysis/
        └── {SYMBOL}_analysis.json
```

---

## Next Steps

1. **Review dashboard UI spec** in `stage4_dashboard_ui_spec.md`
2. **Set up data pipeline** (n8n + FMP API)
3. **Build Looker Studio prototype** for quick validation
4. **Iterate on UX** based on feedback
5. **Build custom web app** for full feature set

---

## Support Resources

| Resource | URL |
|----------|-----|
| n8n Docs | https://docs.n8n.io/ |
| FMP API Docs | https://site.financialmodelingprep.com/developer/docs |
| SEC EDGAR API | https://www.sec.gov/developer |
| OpenAI API | https://platform.openai.com/docs |
| Looker Studio | https://lookerstudio.google.com/ |
| Next.js Docs | https://nextjs.org/docs |
| TailwindCSS | https://tailwindcss.com/docs |

---

*Document Version: 2.0*
*Last Updated: January 2025*
*Change: Replaced PDF reports with Interactive Dashboard*
