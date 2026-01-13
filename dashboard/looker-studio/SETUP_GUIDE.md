# Looker Studio Prototype - Setup Guide

## Overview

Build a functional prototype of the US Value Investing Dashboard using Google Looker Studio (free) with Google Sheets as the data source.

**Goal:** Validate the dashboard concept before investing in custom development.

---

## Step 1: Create Google Sheets Data Source

### 1.1 Create New Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet: **"ValueInvest_StockData"**
3. Create these sheets (tabs):

| Sheet Name | Purpose |
|------------|---------|
| `stocks` | Main stock data (all metrics) |
| `score_weights` | Scoring weight configuration |
| `sectors` | Sector reference list |
| `last_updated` | Data refresh timestamp |

### 1.2 Stocks Sheet Structure

Create these columns in the `stocks` sheet:

```
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| A: symbol | Text | Stock ticker | AAPL |
| B: company_name | Text | Full name | Apple Inc. |
| C: sector | Text | GICS Sector | Technology |
| D: industry | Text | Industry | Consumer Electronics |
| E: exchange | Text | NYSE/NASDAQ | NASDAQ |
| F: price | Number | Current price | 178.50 |
| G: market_cap | Number | Market cap ($) | 2800000000000 |
| H: market_cap_display | Text | Formatted | $2.8T |
| I: pe_ratio | Number | P/E ratio | 28.5 |
| J: roe | Number | ROE (decimal) | 0.147 |
| K: roe_pct | Text | ROE formatted | 14.7% |
| L: dividend_yield | Number | Div yield (decimal) | 0.0051 |
| M: dividend_yield_pct | Text | Yield formatted | 0.51% |
| N: debt_equity | Number | D/E ratio | 1.52 |
| O: beta | Number | Beta | 1.28 |
| P: roic | Number | ROIC (decimal) | 0.285 |
| Q: fcf_yield | Number | FCF Yield (decimal) | 0.035 |
| R: revenue_growth_1yr | Number | Rev growth (decimal) | 0.081 |
| S: eps | Number | EPS | 6.13 |
| T: ma_200 | Number | 200-day MA | 175.20 |
| U: score_valuation | Number | Valuation score (0-30) | 18 |
| V: score_quality | Number | Quality score (0-25) | 22 |
| W: score_growth | Number | Growth score (0-20) | 14 |
| X: score_dividend | Number | Dividend score (0-15) | 8 |
| Y: score_moat | Number | Moat score (0-10) | 7 |
| Z: total_score | Number | Total score (0-100) | 69 |
| AA: score_category | Text | Excellent/Good/Fair/Poor | Fair |
| AB: rank | Number | Current rank | 45 |
| AC: rank_change | Number | vs yesterday (+/-) | 2 |
| AD: is_profitable | Boolean | EPS > 0 | TRUE |
| AE: is_dividend_paying | Boolean | Yield > 0 | TRUE |
| AF: above_200ma | Boolean | Price > MA200 | TRUE |
| AG: is_penny_stock | Boolean | Price < $5 | FALSE |
| AH: last_updated | Date | Data timestamp | 2025-01-12 |
```

### 1.3 Header Row (Row 1)

Copy this exactly into Row 1:

```
symbol	company_name	sector	industry	exchange	price	market_cap	market_cap_display	pe_ratio	roe	roe_pct	dividend_yield	dividend_yield_pct	debt_equity	beta	roic	fcf_yield	revenue_growth_1yr	eps	ma_200	score_valuation	score_quality	score_growth	score_dividend	score_moat	total_score	score_category	rank	rank_change	is_profitable	is_dividend_paying	above_200ma	is_penny_stock	last_updated
```

---

## Step 2: Add Sample Data

Copy this sample data into the `stocks` sheet starting at Row 2:

```csv
AAPL,Apple Inc.,Technology,Consumer Electronics,NASDAQ,178.50,2800000000000,$2.8T,28.5,0.147,14.7%,0.0051,0.51%,1.52,1.28,0.285,0.035,0.081,6.13,175.20,18,22,14,8,7,69,Fair,45,2,TRUE,TRUE,TRUE,FALSE,2025-01-12
MSFT,Microsoft Corporation,Technology,Software,NASDAQ,378.90,2810000000000,$2.8T,35.2,0.389,38.9%,0.0074,0.74%,0.35,0.89,0.312,0.028,0.115,11.02,365.50,15,25,16,10,9,75,Good,12,-1,TRUE,TRUE,TRUE,FALSE,2025-01-12
JNJ,Johnson & Johnson,Healthcare,Drug Manufacturers,NYSE,156.80,378000000000,$378B,15.2,0.178,17.8%,0.0298,2.98%,0.44,0.55,0.165,0.052,0.042,10.12,152.40,24,21,12,14,8,79,Good,8,0,TRUE,TRUE,TRUE,FALSE,2025-01-12
BRK.B,Berkshire Hathaway,Financials,Insurance,NYSE,362.50,795000000000,$795B,8.5,0.089,8.9%,0,0%,0.22,0.87,0.112,0.068,0.095,42.65,348.20,28,18,15,0,10,71,Good,22,3,TRUE,FALSE,TRUE,FALSE,2025-01-12
PG,Procter & Gamble,Consumer Defensive,Household Products,NYSE,158.20,372000000000,$372B,25.8,0.312,31.2%,0.0241,2.41%,0.68,0.42,0.198,0.042,0.035,6.08,155.80,19,23,10,13,8,73,Good,18,-2,TRUE,TRUE,TRUE,FALSE,2025-01-12
XOM,Exxon Mobil,Energy,Oil & Gas,NYSE,104.50,418000000000,$418B,12.8,0.165,16.5%,0.0335,3.35%,0.21,0.95,0.142,0.085,0.125,8.12,98.60,26,20,17,15,7,85,Excellent,3,1,TRUE,TRUE,TRUE,FALSE,2025-01-12
UNH,UnitedHealth Group,Healthcare,Healthcare Plans,NYSE,528.40,486000000000,$486B,22.5,0.245,24.5%,0.0132,1.32%,0.72,0.68,0.185,0.038,0.128,23.48,512.30,20,22,18,11,8,79,Good,9,0,TRUE,TRUE,TRUE,FALSE,2025-01-12
V,Visa Inc.,Financials,Credit Services,NYSE,275.80,568000000000,$568B,30.2,0.425,42.5%,0.0078,0.78%,0.52,0.95,0.328,0.032,0.092,9.12,268.40,16,25,14,9,9,73,Good,17,1,TRUE,TRUE,TRUE,FALSE,2025-01-12
HD,Home Depot,Consumer Cyclical,Home Improvement,NYSE,365.20,365000000000,$365B,22.8,0.985,98.5%,0.0248,2.48%,42.5,1.05,0.412,0.045,0.042,16.02,358.90,19,18,12,13,7,69,Fair,42,-3,TRUE,TRUE,TRUE,FALSE,2025-01-12
CVX,Chevron Corporation,Energy,Oil & Gas,NYSE,152.80,280000000000,$280B,11.5,0.128,12.8%,0.0412,4.12%,0.15,1.12,0.098,0.092,0.085,13.28,145.60,27,19,16,15,6,83,Good,5,2,TRUE,TRUE,TRUE,FALSE,2025-01-12
KO,Coca-Cola,Consumer Defensive,Beverages,NYSE,62.40,269000000000,$269B,24.5,0.412,41.2%,0.0298,2.98%,1.52,0.58,0.285,0.038,0.025,2.55,60.80,18,22,8,14,9,71,Good,25,0,TRUE,TRUE,TRUE,FALSE,2025-01-12
PEP,PepsiCo,Consumer Defensive,Beverages,NYSE,172.80,237000000000,$237B,26.2,0.512,51.2%,0.0275,2.75%,2.15,0.55,0.198,0.035,0.042,6.62,168.50,17,21,10,14,8,70,Good,28,1,TRUE,TRUE,TRUE,FALSE,2025-01-12
ABBV,AbbVie Inc.,Healthcare,Drug Manufacturers,NYSE,168.50,298000000000,$298B,52.8,0.685,68.5%,0.0378,3.78%,5.85,0.82,0.142,0.028,0.045,3.19,162.40,12,16,10,15,7,60,Fair,65,-5,TRUE,TRUE,TRUE,FALSE,2025-01-12
MRK,Merck & Co.,Healthcare,Drug Manufacturers,NYSE,108.20,274000000000,$274B,28.5,0.285,28.5%,0.0278,2.78%,0.92,0.45,0.165,0.042,0.068,3.80,105.60,18,21,14,14,8,75,Good,14,0,TRUE,TRUE,TRUE,FALSE,2025-01-12
COST,Costco Wholesale,Consumer Defensive,Discount Stores,NASDAQ,568.90,252000000000,$252B,42.5,0.285,28.5%,0.0068,0.68%,0.35,0.82,0.225,0.022,0.085,13.38,552.40,10,23,15,8,9,65,Fair,52,2,TRUE,TRUE,TRUE,FALSE,2025-01-12
WMT,Walmart Inc.,Consumer Defensive,Discount Stores,NYSE,162.50,438000000000,$438B,28.8,0.185,18.5%,0.0135,1.35%,0.62,0.52,0.142,0.032,0.055,5.65,158.20,17,20,12,11,8,68,Fair,48,0,TRUE,TRUE,TRUE,FALSE,2025-01-12
BAC,Bank of America,Financials,Banks,NYSE,35.80,285000000000,$285B,11.2,0.098,9.8%,0.0268,2.68%,1.08,1.35,0.082,0.085,0.042,3.20,34.60,25,17,12,13,6,73,Good,19,1,TRUE,TRUE,TRUE,FALSE,2025-01-12
JPM,JPMorgan Chase,Financials,Banks,NYSE,198.50,572000000000,$572B,12.5,0.142,14.2%,0.0225,2.25%,1.15,1.12,0.125,0.068,0.085,15.88,192.40,24,19,15,12,8,78,Good,10,-1,TRUE,TRUE,TRUE,FALSE,2025-01-12
AVGO,Broadcom Inc.,Technology,Semiconductors,NASDAQ,168.50,698000000000,$698B,62.5,0.285,28.5%,0.0185,1.85%,1.65,1.25,0.198,0.018,0.425,2.70,158.90,8,20,20,12,8,68,Fair,46,3,TRUE,TRUE,TRUE,FALSE,2025-01-12
INTC,Intel Corporation,Technology,Semiconductors,NASDAQ,21.20,90000000000,$90B,-8.5,-0.015,-1.5%,0.0472,4.72%,0.48,1.05,-0.025,0.015,-0.185,-2.50,28.40,28,8,5,15,4,60,Fair,68,-8,FALSE,TRUE,FALSE,FALSE,2025-01-12
```

---

## Step 3: Create Looker Studio Report

### 3.1 Connect Data Source

1. Go to [Looker Studio](https://lookerstudio.google.com/)
2. Click **"Create"** → **"Report"**
3. Click **"Add data"** → **"Google Sheets"**
4. Select your **"ValueInvest_StockData"** spreadsheet
5. Select the **"stocks"** sheet
6. Click **"Add"**

### 3.2 Configure Data Types

In the data source panel, set these field types:

| Field | Type | Aggregation |
|-------|------|-------------|
| symbol | Text | None |
| company_name | Text | None |
| sector | Text | None |
| exchange | Text | None |
| price | Number (Currency) | None |
| market_cap | Number | None |
| pe_ratio | Number | None |
| roe | Percent | None |
| dividend_yield | Percent | None |
| debt_equity | Number | None |
| total_score | Number | None |
| rank | Number | None |
| is_profitable | Boolean | None |
| is_dividend_paying | Boolean | None |

---

## Step 4: Build Dashboard Components

### 4.1 Page Layout

Set canvas size: **1920 x 1080** (Widescreen)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER: Title + Last Updated                              [Filters Row]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────┐  ┌───────────┐  │
│  │                                                       │  │           │  │
│  │                    MAIN TABLE                         │  │  SCORE    │  │
│  │                                                       │  │  CHART    │  │
│  │                                                       │  │           │  │
│  │                                                       │  ├───────────┤  │
│  │                                                       │  │  SECTOR   │  │
│  │                                                       │  │  PIE      │  │
│  └───────────────────────────────────────────────────────┘  └───────────┘  │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  SCORECARDS     │  │                 │  │                 │             │
│  │  (KPIs)         │  │                 │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Add Filter Controls

**Insert → Add a control → Drop-down list**

| Control | Field | Position |
|---------|-------|----------|
| Sector Filter | sector | Top row |
| Exchange Filter | exchange | Top row |
| Score Category | score_category | Top row |
| Profitable Only | is_profitable | Top row |
| Dividend Paying | is_dividend_paying | Top row |

**Slider Controls (Limited in Looker Studio):**
- Use "Fixed-size list" or "Input box" for numeric filters
- P/E Max, ROE Min, Market Cap Min require calculated fields

### 4.3 Main Stock Table

**Insert → Add a chart → Table**

Configure columns:

| Column | Field | Width |
|--------|-------|-------|
| Rank | rank | 60px |
| Symbol | symbol | 80px |
| Company | company_name | 180px |
| Score | total_score | 70px |
| P/E | pe_ratio | 70px |
| ROE | roe_pct | 70px |
| Div Yield | dividend_yield_pct | 80px |
| D/E | debt_equity | 60px |
| Market Cap | market_cap_display | 100px |
| Sector | sector | 120px |

**Style Settings:**
- Enable row numbers: OFF
- Enable pagination: ON (20 rows per page)
- Enable sorting: ON
- Header background: #1F2937
- Header text: White
- Alternating row colors: ON

**Conditional Formatting for Score:**
1. Click on total_score column
2. Add conditional formatting:
   - 85-100: Background #10B981 (green)
   - 70-84: Background #FCD34D (yellow)
   - 50-69: Background #F3F4F6 (gray)
   - 0-49: Background #FEE2E2 (light red)

### 4.4 Score Distribution Chart

**Insert → Add a chart → Bar chart**

- Dimension: score_category
- Metric: Record Count
- Sort: Custom (Excellent, Good, Fair, Poor)

**Style:**
- Bar colors by category
- Show data labels: ON

### 4.5 Sector Breakdown Pie Chart

**Insert → Add a chart → Pie chart**

- Dimension: sector
- Metric: Record Count
- Show labels: ON
- Show legend: Right

### 4.6 KPI Scorecards

**Insert → Add a chart → Scorecard** (Create 4)

| Scorecard | Metric | Calculation |
|-----------|--------|-------------|
| Total Stocks | Record Count | Count |
| Avg Score | total_score | Average |
| Avg P/E | pe_ratio | Average |
| Avg Dividend Yield | dividend_yield | Average |

---

## Step 5: Advanced Filtering with Parameters

### 5.1 Create P/E Filter Parameter

1. **Resource → Manage added data sources → Edit**
2. **Add a parameter:**
   - Name: `pe_max_filter`
   - Data type: Number
   - Default: 50

3. **Create calculated field:**
   ```
   Name: pe_filter_applied
   Formula: CASE WHEN pe_ratio <= pe_max_filter THEN true ELSE false END
   ```

4. **Add to chart filter:** `pe_filter_applied = true`

### 5.2 Create ROE Filter Parameter

```
Parameter: roe_min_filter (Number, Default: 0)

Calculated field: roe_filter_applied
Formula: CASE WHEN roe >= roe_min_filter THEN true ELSE false END
```

### 5.3 Create Market Cap Filter Parameter

```
Parameter: market_cap_min_filter (Number, Default: 0)

Calculated field: market_cap_filter_applied
Formula: CASE WHEN market_cap >= market_cap_min_filter THEN true ELSE false END
```

### 5.4 Combined Filter Field

```
Name: passes_all_filters
Formula:
  pe_filter_applied AND
  roe_filter_applied AND
  market_cap_filter_applied
```

Apply this as a filter to the main table.

---

## Step 6: Create Input Controls

### 6.1 Add Parameter Input Boxes

**Insert → Add a control → Input box**

| Input | Parameter | Label |
|-------|-----------|-------|
| P/E Max | pe_max_filter | "Max P/E:" |
| ROE Min | roe_min_filter | "Min ROE:" |
| Market Cap Min | market_cap_min_filter | "Min Market Cap ($B):" |

Position these in the control panel area.

---

## Step 7: Styling

### 7.1 Theme Settings

**Theme → Edit theme**

```
Primary color: #3B82F6 (Blue)
Secondary color: #10B981 (Emerald)
Background: #F9FAFB
Font family: Inter / Roboto
```

### 7.2 Header Section

Add text box with title:
```
US Value Investing Dashboard
```
Font: 24px, Bold, Color: #1F2937

Add text box for last updated:
```
Data: Real-time • Stocks: 5000+ • Last Updated: {last_updated}
```

---

## Step 8: Publishing

1. Click **"View"** to preview
2. Click **"Share"** → **"Get report link"**
3. Set access: "Anyone with the link can view"
4. Copy sharable URL

---

## Looker Studio Limitations

| Feature Requested | Looker Studio Capability | Workaround |
|-------------------|-------------------------|------------|
| Real-time slider with live counts | No native sliders | Use input boxes + parameters |
| Expandable table rows | Not supported | Link to detail page |
| Hover tooltips with breakdown | Limited | Use drill-down pages |
| Custom score color gradient | Conditional formatting only | Use score_category field |
| Mobile card view | Auto-responsive | Limited control |
| Saved filter presets | Not built-in | Use URL parameters |
| Deep Analysis modal | Not supported | Link to separate page |

---

## Next Steps After Prototype

1. **Validate with stakeholders** - Does the layout work?
2. **Test filtering** - Are the controls intuitive?
3. **Identify gaps** - What's missing vs spec?
4. **Decide:** Continue with Looker Studio or move to custom app

If moving to custom app:
- Use this prototype as the design reference
- Port data schema directly to API
- Implement missing features (sliders, modals, etc.)

---

## Quick Links

- [Looker Studio](https://lookerstudio.google.com/)
- [Google Sheets](https://sheets.google.com/)
- [Looker Studio Help](https://support.google.com/looker-studio)

---

*Document Version: 1.0*
*Last Updated: January 2025*
