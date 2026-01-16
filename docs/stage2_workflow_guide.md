# Stage 2 - Value Scoring Workflow Guide

A beginner-friendly guide to understanding the n8n workflow for scoring value stocks.

---

## Table of Contents

1. [What is n8n?](#what-is-n8n)
2. [Workflow Overview](#workflow-overview)
3. [Node-by-Node Explanation](#node-by-node-explanation)
4. [Understanding Connections](#understanding-connections)
5. [The Batch Loop Explained](#the-batch-loop-explained)
6. [Why Some Nodes Look Disconnected](#why-some-nodes-look-disconnected)
7. [Scoring System Breakdown](#scoring-system-breakdown)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)

---

## What is n8n?

n8n (pronounced "n-eight-n") is a visual workflow automation tool. Think of it like connecting LEGO blocks:

- Each **node** (box) does one specific task
- **Connections** (lines) pass data from one node to the next
- Data flows left-to-right through the workflow
- When you click "Execute", data moves through all connected nodes

### Key Terms

| Term | Meaning |
|------|---------|
| **Node** | A box that performs one action (read data, call API, run code) |
| **Connection** | A line connecting two nodes; data flows through it |
| **Trigger** | The starting node that begins the workflow |
| **Input** | Data coming INTO a node |
| **Output** | Data going OUT of a node |
| **Execution** | One complete run of the workflow |

---

## Workflow Overview

### What This Workflow Does

1. Reads stocks from Stage 1 (already filtered for basic criteria)
2. Fetches detailed financial data from Financial Modeling Prep API
3. Calculates scores based on value investing criteria
4. Uses AI to analyze competitive advantages (moat)
5. Ranks all stocks and writes results to Google Sheets

### High-Level Flow

```
READ → BATCH → FETCH DATA → SCORE → AI ANALYSIS → RANK → WRITE
```

### Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         STAGE 2 WORKFLOW                                  │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Manual    │───▶│ Read Stage  │───▶│  Split In   │
│   Trigger   │    │  1 Results  │    │  Batches    │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                             │
                        ┌────────────────────┼────────────────────┐
                        │                    │                    │
                        │         OUTPUT 1 (items)                │
                        │                    │                    │
                        ▼                    ▼                    ▼
                 ┌────────────┐      ┌────────────┐      ┌────────────┐
                 │Get Profile │      │Get Metrics │      │ Get Ratios │
                 └─────┬──────┘      └─────┬──────┘      └─────┬──────┘
                       │                   │                   │
                       │            ┌──────┴──────┐            │
                       │            │ Get Growth  │            │
                       │            └──────┬──────┘            │
                       │                   │                   │
                       └───────────────────┼───────────────────┘
                                           │
                                           ▼
                                   ┌─────────────┐
                                   │   Merge     │
                                   │ API Results │
                                   └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │ Merge Data  │
                                   │   (Code)    │
                                   └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │ Calculate   │
                                   │ Base Scores │
                                   └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │  AI Moat    │
                                   │  Analysis   │
                                   └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │  Calculate  │
                                   │ Final Score │
                                   └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │ Rate Limit  │
                                   │  (Wait 3s)  │
                                   └──────┬──────┘
                                          │
                                          │ LOOPS BACK TO
                                          │ "Split In Batches"
                                          │
    ┌─────────────────────────────────────┘
    │
    │  When all batches complete:
    │
    │         OUTPUT 2 (done)
    │                │
    │                ▼
    │        ┌─────────────┐
    │        │ Aggregate   │
    │        │    All      │
    │        └──────┬──────┘
    │               │
    │               ▼
    │        ┌─────────────┐
    │        │ Sort & Rank │
    │        └──────┬──────┘
    │               │
    │               ▼
    │        ┌─────────────┐
    │        │   Write     │
    │        │  to Sheets  │
    │        └─────────────┘
    │
    └─────────────────────────────────────────────────────────────────────
```

---

## Node-by-Node Explanation

### 1. Manual Trigger

**Type:** Trigger
**Purpose:** Starts the workflow when you click "Execute"

```
Input:  Nothing (this is the start)
Output: Empty signal to begin workflow
```

**Notes:**
- This is always the first node
- Click "Execute Workflow" button to trigger
- Can be replaced with Schedule Trigger for automation

---

### 2. Read Stage 1 Results

**Type:** Google Sheets
**Purpose:** Reads all stocks from Stage1_Screened sheet

```
Input:  Trigger signal
Output: Array of ~50 stock objects
```

**Example Output:**
```json
[
  {
    "symbol": "AAPL",
    "company_name": "Apple Inc.",
    "sector": "Technology",
    "price": 175.50,
    "pe_ratio": 28.5
  },
  {
    "symbol": "MSFT",
    "company_name": "Microsoft Corporation",
    ...
  }
]
```

**Configuration:**
- Document ID: Your Google Sheet ID
- Sheet Name: "Stage1_Screened"
- Operation: Read

---

### 3. Split In Batches

**Type:** Split In Batches
**Purpose:** Processes stocks in small groups to avoid API rate limits

```
Input:  Array of 50 stocks
Output 1: 3 stocks at a time (to API nodes)
Output 2: Signal when ALL batches complete (to Aggregate)
```

**Why Batch Processing?**
- FMP API has rate limits (~300 calls/minute)
- Each stock needs 4 API calls
- Processing 50 stocks × 4 calls = 200 calls
- Batching spreads these calls over time

**This Node Has TWO Outputs:**

| Output | When It Fires | Where It Goes |
|--------|---------------|---------------|
| Output 1 (top) | Each batch of 3 items | To the 4 API nodes |
| Output 2 (bottom) | When ALL items processed | To Aggregate All |

---

### 4. Get Profile (HTTP Request)

**Type:** HTTP Request
**Purpose:** Fetches company profile from FMP API

```
Input:  Stock symbol (e.g., "AAPL")
Output: Company profile data
```

**API Endpoint:**
```
https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=YOUR_KEY
```

**Returns:**
```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "mktCap": 2800000000000,
  "price": 175.50,
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "description": "Apple Inc. designs..."
}
```

---

### 5. Get Key Metrics (HTTP Request)

**Type:** HTTP Request
**Purpose:** Fetches key financial metrics (TTM = Trailing Twelve Months)

**API Endpoint:**
```
https://financialmodelingprep.com/api/v3/key-metrics-ttm/AAPL
```

**Returns:**
```json
{
  "peRatioTTM": 28.5,
  "pbRatioTTM": 45.2,
  "roicTTM": 0.55,
  "enterpriseValueOverEBITDATTM": 22.1
}
```

---

### 6. Get Ratios (HTTP Request)

**Type:** HTTP Request
**Purpose:** Fetches financial ratios

**API Endpoint:**
```
https://financialmodelingprep.com/api/v3/ratios-ttm/AAPL
```

**Returns:**
```json
{
  "returnOnEquityTTM": 0.147,
  "netProfitMarginTTM": 0.25,
  "debtEquityRatioTTM": 1.87,
  "currentRatioTTM": 0.94,
  "dividendYieldTTM": 0.005
}
```

---

### 7. Get Growth (HTTP Request)

**Type:** HTTP Request
**Purpose:** Fetches 3-year growth history

**API Endpoint:**
```
https://financialmodelingprep.com/api/v3/financial-growth/AAPL?period=annual&limit=3
```

**Returns:**
```json
[
  { "revenueGrowth": 0.08, "epsgrowth": 0.10 },
  { "revenueGrowth": 0.33, "epsgrowth": 0.71 },
  { "revenueGrowth": 0.05, "epsgrowth": 0.09 }
]
```

---

### 8. Merge API Results

**Type:** Merge
**Purpose:** Combines all 4 API responses into one object

```
Input 1: Profile data
Input 2: Key Metrics data
Input 3: Ratios data
Input 4: Growth data
Output:  Combined object with all data
```

**Mode:** Multiplex
- Matches items by position (first profile with first metrics, etc.)

---

### 9. Merge Data (Code Node)

**Type:** Code (JavaScript)
**Purpose:** Cleans and organizes the merged API data

**What It Does:**
1. Extracts data from nested arrays
2. Calculates average growth over 3 years
3. Creates clean object with consistent field names

**Example Output:**
```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "sector": "Technology",
  "peRatio": 28.5,
  "pbRatio": 45.2,
  "roe": 0.147,
  "roic": 0.55,
  "netMargin": 0.25,
  "debtEquity": 1.87,
  "revenueGrowth": 0.153,
  "dividendYield": 0.005
}
```

---

### 10. Calculate Base Scores (Code Node)

**Type:** Code (JavaScript)
**Purpose:** Calculates value investing scores

**Scoring Categories:**

#### Valuation Score (0-30 points)
| Metric | Weight | What's Good |
|--------|--------|-------------|
| P/E Ratio | 40% | Lower is better (5-15 ideal) |
| P/B Ratio | 25% | Lower is better (<3 ideal) |
| EV/EBITDA | 20% | Lower is better (<10 ideal) |
| P/FCF | 15% | Lower is better (<15 ideal) |

#### Quality Score (0-25 points)
| Metric | Weight | What's Good |
|--------|--------|-------------|
| ROE | 30% | Higher is better (>15%) |
| ROIC | 25% | Higher is better (>12%) |
| Net Margin | 20% | Higher is better (>10%) |
| Debt/Equity | 15% | Lower is better (<1) |
| Interest Coverage | 10% | Higher is better (>5x) |

#### Growth Score (0-20 points)
| Metric | Weight | What's Good |
|--------|--------|-------------|
| Revenue Growth | 40% | Positive, steady growth |
| EPS Growth | 35% | Positive, steady growth |
| FCF Growth | 25% | Positive growth |

#### Dividend Score (0-15 points)
| Metric | Weight | What's Good |
|--------|--------|-------------|
| Dividend Yield | 60% | 2-5% ideal |
| Payout Ratio | 40% | 30-50% ideal |

**Base Total: 0-90 points**

---

### 11. AI Moat Analysis (OpenAI Node)

**Type:** OpenAI
**Purpose:** Uses GPT to analyze competitive advantages

**Prompt Sent:**
```
Analyze {Company} ({Symbol}) for value investing:
- Sector, Industry, Description
- Valuation metrics
- Quality metrics
- Growth metrics
- Dividend metrics
- Current Base Score

Respond with:
- moatScore (0-10)
- strengths (2-3 points)
- concerns (2-3 points)
- thesis (2 sentences)
```

**Example Response:**
```json
{
  "moatScore": 9,
  "strengths": [
    "Strong brand loyalty",
    "Ecosystem lock-in",
    "Massive cash reserves"
  ],
  "concerns": [
    "High valuation",
    "Dependence on iPhone sales"
  ],
  "thesis": "Apple's ecosystem and brand create a durable moat. Current valuation is high but justified by quality."
}
```

---

### 12. Calculate Final Score (Code Node)

**Type:** Code (JavaScript)
**Purpose:** Combines base scores with AI moat score

```
Final Score = Base Score (0-90) + Moat Score (0-10) = 0-100
```

**Classification:**
| Score Range | Classification |
|-------------|----------------|
| 80-100 | Excellent |
| 70-79 | Good |
| 60-69 | Fair |
| 50-59 | Below Average |
| 0-49 | Poor |

---

### 13. Rate Limit (Wait Node)

**Type:** Wait
**Purpose:** Pauses 3 seconds before next batch

**Why Needed:**
- FMP API rate limit: ~300 calls/minute
- 3 stocks × 4 API calls = 12 calls per batch
- 3 second wait = ~240 calls/minute (safe margin)

**After waiting:** Loops back to "Split In Batches" for next batch

---

### 14. Aggregate All

**Type:** Aggregate
**Purpose:** Collects all processed stocks into one array

```
Input:  Batches of scored stocks (3 at a time)
Output: Single array with ALL scored stocks
```

**Triggered by:** Output 2 of "Split In Batches" (when all done)

---

### 15. Sort & Rank (Code Node)

**Type:** Code (JavaScript)
**Purpose:** Sorts by score and assigns rankings

```javascript
// Sort by totalScore descending
items.sort((a, b) => b.totalScore - a.totalScore);

// Add rank
items.forEach((item, index) => {
  item.rank = index + 1;
});
```

---

### 16. Write Scored Results (Google Sheets)

**Type:** Google Sheets
**Purpose:** Writes final results to Stage2_Scored sheet

**Columns Written:**
- rank, symbol, companyName, sector, industry
- totalScore, classification
- valuationScore, qualityScore, growthScore, dividendScore, moatScore
- Key metrics (P/E, ROE, etc.)
- AI analysis (strengths, concerns, thesis)

---

## Understanding Connections

### How Connections Work

In n8n, connections are the lines between nodes:

```
[Node A] ────────▶ [Node B]
         connection
```

- Data flows through connections from left to right
- A node can have multiple outputs (multiple lines leaving)
- A node can have multiple inputs (multiple lines entering)

### Connection Types in This Workflow

#### 1. Simple Connection (one-to-one)
```
[Read Stage 1] ───▶ [Split In Batches]
```
All data from Read goes to Split.

#### 2. Parallel Connections (one-to-many)
```
                    ┌──▶ [Get Profile]
[Split In Batches] ─┼──▶ [Get Metrics]
                    ├──▶ [Get Ratios]
                    └──▶ [Get Growth]
```
Same data sent to 4 nodes simultaneously.

#### 3. Merge Connections (many-to-one)
```
[Get Profile] ──┐
[Get Metrics] ──┼──▶ [Merge API Results]
[Get Ratios]  ──┤
[Get Growth]  ──┘
```
4 inputs combined into one output.

#### 4. Loop Connection
```
[Rate Limit] ───▶ [Split In Batches]
                        │
                  (loops back)
```
Creates a loop for batch processing.

---

## The Batch Loop Explained

This is the most confusing part for beginners. Here's how it works:

### Split In Batches Has TWO Outputs

```
                         OUTPUT 1: "Items in batch"
                              │
┌─────────────────┐          │
│  Split In       │──────────┼──────▶ [Get Profile, etc.]
│  Batches        │          │
│                 │──────────┼──────▶ [Aggregate All]
└─────────────────┘          │
                              │
                         OUTPUT 2: "No more items"
```

### How The Loop Works

**Step 1:** 50 stocks enter Split In Batches

**Step 2:** Output 1 sends first 3 stocks to API nodes

**Step 3:** Those 3 stocks go through scoring

**Step 4:** Rate Limit waits 3 seconds

**Step 5:** Rate Limit connects BACK to Split In Batches

**Step 6:** Split In Batches sends next 3 stocks (Output 1)

**Step 7:** Repeat until no stocks left

**Step 8:** When empty, Output 2 fires → Aggregate All

### Visual Timeline

```
Batch 1: [AAPL, MSFT, GOOGL] → Score → Wait 3s → Loop back
Batch 2: [META, AMZN, TSLA]  → Score → Wait 3s → Loop back
Batch 3: [JPM, BAC, WFC]     → Score → Wait 3s → Loop back
...
Batch 17: [CAT, RTX]         → Score → Wait 3s → Loop back
No more items → Output 2 → Aggregate All → Sort → Write
```

---

## Why Some Nodes Look Disconnected

### Common Reasons

#### 1. Two Outputs from Split In Batches

The "Aggregate All" node connects to Output 2 of Split In Batches:

```
[Split In Batches]
        │
        ├── Output 1 ──▶ [Get Profile...]  (processes items)
        │
        └── Output 2 ──▶ [Aggregate All]   (when done)
```

This OUTPUT 2 line might look disconnected because:
- It only fires AFTER all batches complete
- It doesn't connect to the main processing chain
- In n8n UI, it may appear at the bottom, separate from main flow

#### 2. The Loop-Back Connection

The connection from "Rate Limit" back to "Split In Batches" creates a loop:

```
[Split In Batches] → ... → [Rate Limit]
        ▲                        │
        │                        │
        └────────────────────────┘
              (loop back)
```

This can look unusual because:
- It goes RIGHT-TO-LEFT (opposite of normal flow)
- It creates a visual loop in the canvas

#### 3. Error Handling Outputs

Some nodes have "onError" settings:
- `"onError": "continueRegularOutput"`
- This means if API fails, workflow continues without that data
- No visual connection for error path

### How to Verify Connections

In n8n, click on a node and look at:

1. **Input section:** Shows what's connected as input
2. **Output section:** Shows what's connected as output

Or look at the JSON workflow file:
```json
"connections": {
  "Split In Batches": {
    "main": [
      [  // Output 1
        { "node": "Get Profile", ... },
        { "node": "Get Key Metrics", ... },
        { "node": "Get Ratios", ... },
        { "node": "Get Growth", ... }
      ],
      [  // Output 2
        { "node": "Aggregate All", ... }
      ]
    ]
  }
}
```

---

## Scoring System Breakdown

### Total Score Composition

```
┌─────────────────────────────────────────────────────────────┐
│                    TOTAL SCORE: 0-100                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ VALUATION   │ │  QUALITY    │ │   GROWTH    │           │
│  │   0-30      │ │   0-25      │ │    0-20     │           │
│  │             │ │             │ │             │           │
│  │ • P/E       │ │ • ROE       │ │ • Revenue   │           │
│  │ • P/B       │ │ • ROIC      │ │ • EPS       │           │
│  │ • EV/EBITDA │ │ • Margins   │ │ • FCF       │           │
│  │ • P/FCF     │ │ • Debt      │ │             │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐                           │
│  │  DIVIDEND   │ │    MOAT     │                           │
│  │   0-15      │ │   0-10      │ ◀── AI Generated          │
│  │             │ │             │                           │
│  │ • Yield     │ │ • Brand     │                           │
│  │ • Payout    │ │ • Switching │                           │
│  │             │ │ • Network   │                           │
│  └─────────────┘ └─────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### What Each Score Measures

| Category | Question It Answers | Max Points |
|----------|---------------------|------------|
| Valuation | Is the stock cheap? | 30 |
| Quality | Is the company well-run? | 25 |
| Growth | Is it growing? | 20 |
| Dividend | Does it return cash? | 15 |
| Moat | Can competitors catch up? | 10 |

### Score Interpretation

| Total Score | Meaning | Action |
|-------------|---------|--------|
| 80-100 | Excellent value | Strong buy candidate |
| 70-79 | Good value | Worth deeper research |
| 60-69 | Fair value | Decent, not compelling |
| 50-59 | Below average | Likely better options |
| 0-49 | Poor value | Avoid |

---

## Troubleshooting Common Issues

### Issue 1: "Too many requests" Error

**Cause:** FMP API rate limit exceeded

**Fix:**
1. Reduce batch size (currently 3)
2. Increase wait time (currently 3000ms)
3. Check your FMP plan limits

### Issue 2: "Access to env vars denied"

**Cause:** n8n blocks environment variables

**Fix:** Replace `$env.VARIABLE` with hardcoded values

### Issue 3: Empty Results

**Cause:** API returning empty data

**Check:**
1. Is your FMP API key valid?
2. Are the stock symbols correct?
3. Is the Stage1_Screened sheet populated?

### Issue 4: AI Analysis Missing

**Cause:** OpenAI API error or rate limit

**Check:**
1. Is OpenAI API key configured?
2. Check OpenAI usage dashboard
3. Node has `"onError": "continueRegularOutput"` so workflow continues

### Issue 5: Loop Never Ends

**Cause:** Split In Batches misconfigured

**Check:**
1. Batch size is set (not 0)
2. Rate Limit connects back to Split In Batches
3. No items being added during loop

---

## Glossary

| Term | Definition |
|------|------------|
| **TTM** | Trailing Twelve Months - financial data from last 12 months |
| **P/E** | Price-to-Earnings ratio - stock price / earnings per share |
| **P/B** | Price-to-Book ratio - stock price / book value per share |
| **ROE** | Return on Equity - net income / shareholder equity |
| **ROIC** | Return on Invested Capital - how well company uses capital |
| **EV/EBITDA** | Enterprise Value to EBITDA - valuation metric |
| **FCF** | Free Cash Flow - cash after expenses and investments |
| **Moat** | Competitive advantage that protects profits |
| **Batch** | A small group of items processed together |
| **Node** | A single step/action in the workflow |

---

## Files Reference

| File | Purpose |
|------|---------|
| `workflows/stage2_scoring.json` | The complete workflow file |
| `workflows/stage2_profile_only.json` | Simplified version (profile only) |
| `docs/stage2_detailed_scoring_spec.md` | Detailed scoring formulas |

---

*Last updated: January 2026*
