# Stage 4: Interactive Dashboard UI Specification

## Overview

Replace PDF report generation with a Bloomberg Terminal-style interactive dashboard for US value investing. The dashboard provides real-time filtering, instant visual feedback, and maximum customizability.

---

## Design Philosophy

```
"Bloomberg Terminal but free - every conceivable filter at your fingertips"
```

**Core Principles:**
- Zero friction filtering
- Instant visual feedback (< 2 seconds for 5000 stocks)
- Progressive disclosure (simple → advanced)
- Mobile-first responsive design

---

## Layout Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTROL PANEL (Top 15%)                             │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │     CORE SLIDERS            │  │     QUICK TOGGLES + ACTIONS         │  │
│  │  P/E ════════════●══════    │  │  ☐ Penny Stocks  ☑️ Profitable      │  │
│  │  ROE ═══●════════════════   │  │  ☑️ Dividend Only  Exchange: [Both] │  │
│  │  MktCap ════════●════════   │  │  Sectors: [All ▾]                   │  │
│  │  DivYield ═══●═══════════   │  │  [🔍 Search] [↻ Screen] [💾 Save]   │  │
│  │  D/E ════════════●═══════   │  │  [📊 Deep Analysis] [🖨️ Print]     │  │
│  └─────────────────────────────┘  └─────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────┐  ┌───────────┐  │
│  │                 RESULTS TABLE (70%)                    │  │ SIDEBAR   │  │
│  │  Rank │ Symbol │ Score │ P/E │ ROE │ Div │ D/E │ ...  │  │ (20%)     │  │
│  │  ─────┼────────┼───────┼─────┼─────┼─────┼─────┼───── │  │           │  │
│  │   1   │ AAPL   │  87🟢 │ 9.2 │ 18% │ 2.1%│ 0.4 │ ... │  │ Score     │  │
│  │   2   │ MSFT   │  84🟢 │ 11  │ 22% │ 1.8%│ 0.3 │ ... │  │ Histogram │  │
│  │   3   │ JNJ    │  82🟢 │ 8.5 │ 15% │ 3.2%│ 0.5 │ ... │  │           │  │
│  │   ↓   │  ...   │  ...  │ ... │ ... │ ... │ ... │ ... │  │ Portfolio │  │
│  │       │ [Expanded row with charts when clicked]       │  │ Preview   │  │
│  └───────────────────────────────────────────────────────┘  └───────────┘  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                    ADVANCED PANEL (Collapsible)                             │
│  Beta [0.5-1.5]  ROIC [>10%]  FCF Yield [>3%]  Revenue Growth [>5%]        │
│  Custom Weights: Valuation[30] Quality[25] Growth[20] Div[15] Moat[10]     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Control Panel (Top 15% - Sticky)

#### Left Column: Core Sliders

| Slider | Range | Default | Live Count |
|--------|-------|---------|------------|
| P/E Ratio Max | 5 - 50 | 15 | "487 stocks" |
| ROE Minimum | 0% - 40% | 12% | Updates live |
| Market Cap Min | $100M - $500B | $1B | Logarithmic scale |
| Dividend Yield Min | 0% - 10% | 0% | Updates live |
| Debt/Equity Max | 0.0 - 3.0 | 1.0 | Updates live |

**Slider Behavior:**
```javascript
// Debounced filter update (300ms)
onSliderChange = debounce((metric, value) => {
  updateLiveCount(metric, value);  // Instant count
  filterTable(allFilters);          // 300ms debounce
}, 300);
```

#### Right Column: Quick Toggles

| Toggle | Default | Description |
|--------|---------|-------------|
| Include Penny Stocks (<$5) | OFF | Filter price < $5 |
| Show Only Profitable (EPS>0) | ON | Positive earnings |
| Price > 200d MA | OFF | Technical filter |
| Dividend Paying Only | OFF | Dividend yield > 0 |

**Dropdowns:**
- Exchange: `[NYSE] [NASDAQ] [Both]` - multi-select
- Sectors: `[All] [Technology] [Healthcare] [Financials] ...` - multi-select with checkboxes

#### Action Buttons

| Button | Action | Shortcut |
|--------|--------|----------|
| 🔍 Search | Focus symbol search | `/` |
| ↻ Screen Now | Force refresh data | `Ctrl+R` |
| 📊 Deep Analysis | Open modal for selected | `Enter` |
| 💾 Save Screen | Save current filter set | `Ctrl+S` |
| 🖨️ Print View | Print-friendly export | `Ctrl+P` |

---

### 2. Results Table (70% - Scrollable)

#### Column Definitions

| Column | Width | Sortable | Format |
|--------|-------|----------|--------|
| ☐ | 40px | No | Checkbox for bulk select |
| Rank | 60px | Yes | △▼ indicators |
| Symbol | 80px | Yes | Monospace, clickable |
| Company | 200px | Yes | Truncated with tooltip |
| Score | 80px | Yes | Color-coded badge |
| P/E | 70px | Yes | 1 decimal |
| ROE | 70px | Yes | Percentage |
| Div Yield | 80px | Yes | Percentage |
| D/E | 70px | Yes | 2 decimals |
| Market Cap | 100px | Yes | Abbreviated ($1.2B) |
| Sector | 120px | Yes | Industry name |
| Beta | 60px | Yes | 2 decimals |
| Δ Rank | 60px | No | +2 / -1 / NEW |

#### Score Color Coding

```css
.score-excellent { /* 85-100 */
  background: #10B981; /* Emerald */
  color: white;
}
.score-good { /* 70-84 */
  background: #FCD34D; /* Yellow */
  color: #1F2937;
}
.score-fair { /* 50-69 */
  background: #F3F4F6; /* Light Gray */
  color: #374151;
}
.score-poor { /* 0-49 */
  background: #FEE2E2; /* Light Red */
  color: #991B1B;
}
```

#### Row Interactions

**Hover:**
```
┌─────────────────────────────────────┐
│ Score Breakdown                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Valuation:  28/30  ██████████░░    │
│ Quality:    22/25  ████████████░   │
│ Growth:     16/20  ████████████    │
│ Dividend:   12/15  ████████████    │
│ Moat:        7/10  ██████████░░    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ Total:      85/100                  │
└─────────────────────────────────────┘
```

**Click (Expand Row):**
```
┌─────────────────────────────────────────────────────────────────┐
│ AAPL - Apple Inc.                                    [Collapse] │
├─────────────────────────────────────────────────────────────────┤
│  5-Year P/E Trend          │  Peer Percentile Ranks            │
│  ┌────────────────────┐    │  P/E:  ████████░░ 75th            │
│  │    ╱╲              │    │  ROE:  ██████████ 92nd            │
│  │   ╱  ╲    ╱╲      │    │  Div:  ██████░░░░ 55th            │
│  │  ╱    ╲__╱  ╲__   │    │  D/E:  ████████░░ 78th (lower=better)│
│  └────────────────────┘    │                                    │
│   2020  2021  2022  2023   │  Sector: Technology                │
├─────────────────────────────────────────────────────────────────┤
│ [📊 Full Deep Analysis]  [📈 Add to Watchlist]  [📋 Copy Data] │
└─────────────────────────────────────────────────────────────────┘
```

**Bulk Select (3+ rows):**
- Floating action bar appears
- "Deep Analysis on 5 stocks" button
- "Compare Selected" option
- "Export Selected" option

---

### 3. Right Sidebar (20% - Sticky)

#### Score Distribution Histogram

```
Score Distribution (487 stocks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
90-100 ██░░░░░░░░░░░░░░  12
80-89  ████████░░░░░░░░  45
70-79  ██████████████░░  89
60-69  ████████████████ 156
50-59  ██████████████░░ 124
40-49  ████████░░░░░░░░  48
 0-39  ██░░░░░░░░░░░░░░  13
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Top 10 avg: 82.3 | Median: 64
```

#### Mini Portfolio Preview

When stocks are selected:
```
┌─────────────────────────────┐
│ YOUR SELECTION (5 stocks)   │
├─────────────────────────────┤
│ Combined Metrics            │
│ ─────────────────────────── │
│ Avg Score:      78.4        │
│ Avg P/E:        11.2        │
│ Combined Yield:  2.8%       │
│ Avg D/E:         0.42       │
│                             │
│ vs S&P 500                  │
│ P/E:   11.2 vs 22.4 (50%↓)  │
│ Yield: 2.8% vs 1.4% (2x)    │
│                             │
│ Portfolio Score: 78/100 🟡  │
├─────────────────────────────┤
│ [Export] [Clear Selection]  │
└─────────────────────────────┘
```

---

### 4. Advanced Panel (Collapsible)

```
━━━ Advanced Filters ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ [▼ Collapse]

Beta Range        [0.5 ════════●════════ 1.5]
ROIC Minimum      [════●════════════════ 10%]
FCF Yield Min     [═══●═════════════════ 3%]
Revenue Growth    [════●════════════════ 5%]
EPS Growth 5yr    [═════●═══════════════ 8%]

Custom Score Weights (must total 100):
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Valuation    │ Quality      │ Growth       │ Dividend     │ Moat         │
│ [30]%        │ [25]%        │ [20]%        │ [15]%        │ [10]%        │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
                                                              Total: 100% ✓

[Reset to Defaults]                                    [Apply Custom Weights]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 5. Deep Analysis Modal

Triggered by: Row click → "Full Deep Analysis" or action button

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AAPL - Apple Inc. Deep Analysis               [✕ Close] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  VALUATION SUMMARY                          SCORE: 87/100 🟢                │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ DCF INTRINSIC VALUE             │  │ CURRENT PRICE                   │  │
│  │ $198.50                         │  │ $152.30                         │  │
│  │                                 │  │                                 │  │
│  │ Margin of Safety: 30.3% 🟢     │  │ Recommendation: STRONG BUY      │  │
│  └─────────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                             │
│  DCF ASSUMPTIONS                                                            │
│  ───────────────────────────────────────────────────────────────────────   │
│  Risk-Free Rate:    4.0%    │  Terminal Growth:    2.5%                    │
│  Market Premium:    5.5%    │  WACC:               8.2%                    │
│  Projection Years:  5       │  Beta:               1.12                    │
│                                                                             │
│  10-K HIGHLIGHTS (AI-Extracted)                                             │
│  ───────────────────────────────────────────────────────────────────────   │
│  • Revenue grew 8.1% YoY driven by Services segment (+14%)                 │
│  • Gross margin expanded 120bps to 43.8%                                   │
│  • Management guidance: "Expect continued growth in wearables"             │
│  • Risk factors: Supply chain concentration, regulatory scrutiny           │
│                                                                             │
│  COMPETITIVE MOAT                                                           │
│  ───────────────────────────────────────────────────────────────────────   │
│  AI Assessment: WIDE MOAT (8/10)                                           │
│  • Ecosystem lock-in: Very High                                            │
│  • Brand value: Exceptional                                                │
│  • Switching costs: High                                                   │
│  • Network effects: Moderate (App Store)                                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [📥 Download PDF]  [📋 Copy Summary]  [📈 Add to Watchlist]  [🔗 Share]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Responsive Design

### Desktop (≥1280px)
```
┌────────────────────────────────────────────────┐
│ Controls (sticky)                              │
├───────────────────────────────────┬────────────┤
│ Table (70%)                       │ Sidebar    │
│                                   │ (20%)      │
├───────────────────────────────────┴────────────┤
│ Advanced Panel (collapsible)                   │
└────────────────────────────────────────────────┘
```

### Tablet (768px - 1279px)
```
┌────────────────────────────────────┐
│ Controls (sticky, compact)         │
├────────────────────────────────────┤
│ Table (full width)                 │
├────────────────────────────────────┤
│ Sidebar → Bottom Drawer            │
└────────────────────────────────────┘
```

### Mobile (<768px)
```
┌────────────────────────────────────┐
│ Controls → Horizontal Carousel     │
│ [P/E] [ROE] [MktCap] [More ▸]     │
├────────────────────────────────────┤
│ Cards (not table)                  │
│ ┌────────────────────────────────┐ │
│ │ AAPL                    87 🟢  │ │
│ │ P/E: 9.2 │ ROE: 18% │ Div: 2.1%│ │
│ │ [Tap for details]              │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

---

## Data Requirements

### Real-Time Data (From Stage 2)

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
    epsGrowth5yr: number;
    price: number;
    ma200: number;
    eps: number;
  };
  sector: string;
  exchange: 'NYSE' | 'NASDAQ';
  rankChange: number; // vs yesterday
  lastUpdated: string;
}
```

### Deep Analysis Data (From Stage 3)

```typescript
interface DeepAnalysis {
  symbol: string;
  dcf: {
    intrinsicValue: number;
    currentPrice: number;
    marginOfSafety: number;
    recommendation: 'STRONG BUY' | 'BUY' | 'HOLD' | 'SELL';
    assumptions: {
      riskFreeRate: number;
      marketPremium: number;
      terminalGrowth: number;
      wacc: number;
      beta: number;
    };
  };
  tenKHighlights: string[];
  moatAssessment: {
    rating: number; // 1-10
    category: 'WIDE' | 'NARROW' | 'NONE';
    factors: string[];
  };
  peerComparison: {
    metric: string;
    value: number;
    percentile: number;
  }[];
  historicalPE: { year: number; pe: number }[];
}
```

---

## Persistence & Sharing

### Saved Screens

```typescript
interface SavedScreen {
  id: string;
  name: string; // "My Value Banks P/E<10"
  createdAt: string;
  filters: {
    peMax: number;
    roeMin: number;
    marketCapMin: number;
    dividendYieldMin: number;
    debtEquityMax: number;
    includePennyStocks: boolean;
    profitableOnly: boolean;
    above200dMA: boolean;
    dividendPayingOnly: boolean;
    exchanges: string[];
    sectors: string[];
    // Advanced
    betaRange: [number, number];
    roicMin: number;
    fcfYieldMin: number;
    revenueGrowthMin: number;
    customWeights: {
      valuation: number;
      quality: number;
      growth: number;
      dividend: number;
      moat: number;
    };
  };
}
```

### URL Parameters (Shareable)

```
https://dashboard.example.com?
  pe=12&
  roe=15&
  cap=1B&
  div=2&
  de=0.5&
  sectors=Technology,Healthcare&
  exchange=NASDAQ
```

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Initial load | < 3 seconds |
| Filter response | < 500ms (count update) |
| Table re-render | < 2 seconds (5000 rows) |
| Deep Analysis modal | < 1 second |
| Mobile first paint | < 2 seconds |

### Optimization Strategies

1. **Virtual scrolling** for table (only render visible rows)
2. **Debounced filtering** (300ms delay on slider change)
3. **Memoized calculations** for score distribution
4. **Lazy load** deep analysis data
5. **Service worker** for offline capability
6. **CDN-cached** static assets

---

## Technology Options

### Option A: Looker Studio (Prototype)
- **Pros:** Quick setup, Google Sheets integration, free
- **Cons:** Limited interactivity, no custom sliders, no expandable rows
- **Use for:** Initial prototype, stakeholder demos

### Option B: Custom Web App (Production)
- **Stack:** Next.js + React + TailwindCSS + Chart.js
- **Pros:** Full control, all features possible, best UX
- **Cons:** Development time required
- **Use for:** Final production dashboard

### Option C: Retool/Appsmith (Middle Ground)
- **Pros:** Fast development, good interactivity
- **Cons:** Monthly cost, some limitations
- **Use for:** MVP with full features

---

## Implementation Phases

### Phase 1: Data Pipeline
- Ensure Stages 1-3 output JSON data
- Set up data refresh schedule (daily)
- Create API endpoints for dashboard

### Phase 2: Looker Studio Prototype
- Connect to data source
- Build basic table with filters
- Validate with stakeholders

### Phase 3: Custom Dashboard MVP
- Core sliders + table
- Basic filtering
- Score display

### Phase 4: Full Features
- Expandable rows
- Deep analysis modal
- Saved screens
- Mobile responsive

### Phase 5: Polish
- Performance optimization
- Keyboard shortcuts
- Print view
- URL sharing

---

*Document Version: 1.0*
*Last Updated: January 2025*
*Replaces: stage4_pdf_generation_spec.md*
