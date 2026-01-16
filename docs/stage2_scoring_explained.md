# Stage 2 - Value Scoring Workflow: Complete Explanation

This document explains every part of the `stage2_scoring.json` n8n workflow in detail.

---

## Table of Contents

1. [Purpose of This Workflow](#purpose-of-this-workflow)
2. [Complete Node List](#complete-node-list)
3. [Visual Flow Diagram](#visual-flow-diagram)
4. [Connection Map](#connection-map)
5. [Detailed Node Explanations](#detailed-node-explanations)
6. [The Batch Processing Loop](#the-batch-processing-loop)
7. [Data Flow Example](#data-flow-example)
8. [Scoring Formulas](#scoring-formulas)

---

## Purpose of This Workflow

**Input:** List of ~50 stocks from Stage 1 (already filtered for basic criteria)

**Output:** Ranked list of stocks with detailed scores written to Google Sheets

**What it does:**
1. Reads stocks from Google Sheets (Stage1_Screened)
2. Fetches detailed financial data from 4 different API endpoints
3. Calculates value investing scores (Valuation, Quality, Growth, Dividend)
4. Uses AI (GPT-4o-mini) to analyze competitive moat
5. Combines all scores into a final ranking
6. Writes results to Google Sheets (Stage2_Scored)

---

## Complete Node List

The workflow has **16 nodes** in total:

| # | Node Name | Node Type | Purpose |
|---|-----------|-----------|---------|
| 1 | Manual Trigger | Trigger | Starts the workflow |
| 2 | Read Stage 1 Results | Google Sheets | Reads input stocks |
| 3 | Split In Batches | Split In Batches | Processes 3 stocks at a time |
| 4 | Get Profile | HTTP Request | Fetches company profile |
| 5 | Get Key Metrics | HTTP Request | Fetches financial metrics |
| 6 | Get Ratios | HTTP Request | Fetches financial ratios |
| 7 | Get Growth | HTTP Request | Fetches growth history |
| 8 | Merge API Results | Merge | Combines 4 API responses |
| 9 | Merge Data | Code | Cleans and organizes data |
| 10 | Calculate Base Scores | Code | Calculates 4 score categories |
| 11 | AI Moat Analysis | OpenAI | Analyzes competitive advantage |
| 12 | Calculate Final Score | Code | Combines base + moat scores |
| 13 | Rate Limit | Wait | Pauses 3 seconds between batches |
| 14 | Aggregate All | Aggregate | Collects all processed stocks |
| 15 | Sort & Rank | Code | Sorts by score, adds rank |
| 16 | Write Scored Results | Google Sheets | Writes final output |

---

## Visual Flow Diagram

```
                                    STAGE 2 - VALUE SCORING WORKFLOW
═══════════════════════════════════════════════════════════════════════════════════════

┌─────────────────┐
│  1. MANUAL      │
│     TRIGGER     │
│                 │
│  (Click to      │
│   start)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. READ        │
│  STAGE 1        │
│  RESULTS        │
│                 │
│  (Google        │
│   Sheets)       │
└────────┬────────┘
         │
         │  ~50 stocks
         ▼
┌─────────────────┐
│  3. SPLIT IN    │──────────────────────────────────────────────────────┐
│     BATCHES     │                                                      │
│                 │                                                      │
│  (3 at a time)  │                                                      │
└────────┬────────┘                                                      │
         │                                                               │
         │ OUTPUT 1: 3 stocks                              OUTPUT 2: When done
         │                                                               │
         ├──────────────┬──────────────┬──────────────┐                  │
         │              │              │              │                  │
         ▼              ▼              ▼              ▼                  │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│ 4. GET      │ │ 5. GET KEY  │ │ 6. GET      │ │ 7. GET      │          │
│    PROFILE  │ │    METRICS  │ │    RATIOS   │ │    GROWTH   │          │
│             │ │             │ │             │ │             │          │
│ (HTTP)      │ │ (HTTP)      │ │ (HTTP)      │ │ (HTTP)      │          │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘          │
       │               │               │               │                 │
       │    Input 0    │    Input 1    │    Input 2    │    Input 3      │
       └───────────────┴───────────────┴───────────────┘                 │
                                │                                        │
                                ▼                                        │
                       ┌─────────────────┐                               │
                       │  8. MERGE API   │                               │
                       │     RESULTS     │                               │
                       │                 │                               │
                       │  (Combines 4    │                               │
                       │   API responses)│                               │
                       └────────┬────────┘                               │
                                │                                        │
                                ▼                                        │
                       ┌─────────────────┐                               │
                       │  9. MERGE DATA  │                               │
                       │                 │                               │
                       │  (Code: cleans  │                               │
                       │   & organizes)  │                               │
                       └────────┬────────┘                               │
                                │                                        │
                                ▼                                        │
                       ┌─────────────────┐                               │
                       │  10. CALCULATE  │                               │
                       │   BASE SCORES   │                               │
                       │                 │                               │
                       │  (Valuation,    │                               │
                       │   Quality,      │                               │
                       │   Growth,       │                               │
                       │   Dividend)     │                               │
                       └────────┬────────┘                               │
                                │                                        │
                                ▼                                        │
                       ┌─────────────────┐                               │
                       │  11. AI MOAT    │                               │
                       │   ANALYSIS      │  ◄── THIS NODE MUST BE        │
                       │                 │      CONNECTED!               │
                       │  (OpenAI        │                               │
                       │   GPT-4o-mini)  │                               │
                       └────────┬────────┘                               │
                                │                                        │
                                ▼                                        │
                       ┌─────────────────┐                               │
                       │  12. CALCULATE  │                               │
                       │   FINAL SCORE   │                               │
                       │                 │                               │
                       │  (Base + Moat   │                               │
                       │   = Total)      │                               │
                       └────────┬────────┘                               │
                                │                                        │
                                ▼                                        │
                       ┌─────────────────┐                               │
                       │  13. RATE       │                               │
                       │      LIMIT      │                               │
                       │                 │                               │
                       │  (Wait 3 sec)   │                               │
                       └────────┬────────┘                               │
                                │                                        │
                                │                                        │
         ┌──────────────────────┘                                        │
         │                                                               │
         │  LOOPS BACK to process next batch                             │
         │                                                               │
         └──────────────────────────────────────────────────────────────►│
                                                                         │
                                                                         │
                                                                         ▼
                                                              ┌─────────────────┐
                                                              │  14. AGGREGATE  │
                                                              │      ALL        │
                                                              │                 │
                                                              │  (Collects all  │
                                                              │   results)      │
                                                              └────────┬────────┘
                                                                       │
                                                                       ▼
                                                              ┌─────────────────┐
                                                              │  15. SORT &     │
                                                              │      RANK       │
                                                              │                 │
                                                              │  (Orders by     │
                                                              │   score)        │
                                                              └────────┬────────┘
                                                                       │
                                                                       ▼
                                                              ┌─────────────────┐
                                                              │  16. WRITE      │
                                                              │   SCORED        │
                                                              │   RESULTS       │
                                                              │                 │
                                                              │  (Google        │
                                                              │   Sheets)       │
                                                              └─────────────────┘
```

---

## Connection Map

This is the exact connection structure from the JSON file:

```
FROM NODE                    →    TO NODE                      (Output → Input)
─────────────────────────────────────────────────────────────────────────────────
Manual Trigger               →    Read Stage 1 Results         (main → main:0)
Read Stage 1 Results         →    Split In Batches             (main → main:0)
Split In Batches             →    Get Profile                  (main:0 → main:0)
Split In Batches             →    Get Key Metrics              (main:0 → main:0)
Split In Batches             →    Get Ratios                   (main:0 → main:0)
Split In Batches             →    Get Growth                   (main:0 → main:0)
Split In Batches             →    Aggregate All                (main:1 → main:0)  ← OUTPUT 2
Get Profile                  →    Merge API Results            (main → main:0)
Get Key Metrics              →    Merge API Results            (main → main:1)
Get Ratios                   →    Merge API Results            (main → main:2)
Get Growth                   →    Merge API Results            (main → main:3)
Merge API Results            →    Merge Data                   (main → main:0)
Merge Data                   →    Calculate Base Scores        (main → main:0)
Calculate Base Scores        →    AI Moat Analysis             (main → main:0)   ← IMPORTANT!
AI Moat Analysis             →    Calculate Final Score        (main → main:0)   ← IMPORTANT!
Calculate Final Score        →    Rate Limit                   (main → main:0)
Rate Limit                   →    Split In Batches             (main → main:0)   ← LOOP BACK
Aggregate All                →    Sort & Rank                  (main → main:0)
Sort & Rank                  →    Write Scored Results         (main → main:0)
```

### Critical Connections to Check

If any of these are missing, the workflow will break:

1. **Calculate Base Scores → AI Moat Analysis**
2. **AI Moat Analysis → Calculate Final Score**
3. **Rate Limit → Split In Batches** (the loop)
4. **Split In Batches (Output 2) → Aggregate All**

---

## Detailed Node Explanations

### Node 1: Manual Trigger

**What it is:** The starting point of the workflow.

**What it does:** When you click "Execute Workflow" in n8n, this node fires and sends a signal to the next node.

**Configuration:** None needed.

**In the JSON:**
```json
{
  "name": "Manual Trigger",
  "type": "n8n-nodes-base.manualTrigger",
  "position": [0, 0]
}
```

---

### Node 2: Read Stage 1 Results

**What it is:** A Google Sheets node.

**What it does:** Reads all rows from the "Stage1_Screened" sheet.

**Input:** Trigger signal from Manual Trigger.

**Output:** Array of stock objects (one per row).

**Configuration:**
- Document ID: `1jMRAtD1tUQSYYD1gLWoHNw1IoBbUP-SPpBbStj01be0`
- Sheet Name: `Stage1_Screened`
- Operation: Read

**Example output:**
```json
[
  { "symbol": "AAPL", "company_name": "Apple Inc.", "sector": "Technology", ... },
  { "symbol": "MSFT", "company_name": "Microsoft", "sector": "Technology", ... },
  // ... ~50 stocks
]
```

---

### Node 3: Split In Batches

**What it is:** A batching node that processes items in groups.

**What it does:** Takes all ~50 stocks and sends them 3 at a time to the next nodes.

**Why needed:** To avoid hitting API rate limits (FMP allows ~300 calls/minute).

**Configuration:**
- Batch Size: 3
- Options: {}

**TWO OUTPUTS:**

| Output | Name | When it fires | Where it goes |
|--------|------|---------------|---------------|
| Output 0 (top) | Items | Each batch of 3 | To 4 HTTP nodes |
| Output 1 (bottom) | Done | When ALL batches complete | To Aggregate All |

**Visual in n8n:**
```
                    ┌──── Output 0 (top) ────→ [HTTP nodes]
[Split In Batches] ─┤
                    └──── Output 1 (bottom) ─→ [Aggregate All]
```

---

### Nodes 4-7: HTTP Request Nodes (API Calls)

These 4 nodes run **in parallel** for each stock:

#### Node 4: Get Profile
- **URL:** `https://financialmodelingprep.com/api/v3/profile/{symbol}`
- **Returns:** Company name, description, market cap, price, sector, industry

#### Node 5: Get Key Metrics
- **URL:** `https://financialmodelingprep.com/api/v3/key-metrics-ttm/{symbol}`
- **Returns:** ROIC, EV/EBITDA, P/B ratio

#### Node 6: Get Ratios
- **URL:** `https://financialmodelingprep.com/api/v3/ratios-ttm/{symbol}`
- **Returns:** ROE, ROA, margins, debt ratios, dividend yield

#### Node 7: Get Growth
- **URL:** `https://financialmodelingprep.com/api/v3/financial-growth/{symbol}`
- **Returns:** 3 years of revenue, EPS, FCF growth

**All 4 nodes have:**
- Timeout: 10 seconds
- Error handling: Continue on error (so one failed API call doesn't break the workflow)

---

### Node 8: Merge API Results

**What it is:** A Merge node.

**What it does:** Combines the 4 separate API responses into one object.

**Mode:** Multiplex
- This mode matches items by position
- Profile[0] + Metrics[0] + Ratios[0] + Growth[0] = Combined[0]

**Has 4 inputs:**
- Input 0: From Get Profile
- Input 1: From Get Key Metrics
- Input 2: From Get Ratios
- Input 3: From Get Growth

---

### Node 9: Merge Data (Code)

**What it is:** A JavaScript code node.

**What it does:**
1. Extracts data from nested API response arrays
2. Calculates average growth over 3 years
3. Creates a clean, flat object with all metrics

**Key code sections:**
```javascript
// Extract from arrays (APIs return arrays)
const p = Array.isArray(profile) ? profile[0] : profile;

// Calculate 3-year average growth
const avgRevGrowth = g.reduce((sum, item) => sum + (item.revenueGrowth || 0), 0) / g.length;

// Return clean object
return [{
  json: {
    symbol: batchItem.symbol,
    peRatio: r.peRatioTTM,
    roe: r.returnOnEquityTTM,
    // ... all metrics
  }
}];
```

---

### Node 10: Calculate Base Scores (Code)

**What it is:** A JavaScript code node.

**What it does:** Calculates 4 score categories based on financial metrics.

**Score Categories:**

| Category | Max Points | Metrics Used |
|----------|------------|--------------|
| Valuation | 30 | P/E, P/B, EV/EBITDA, P/FCF |
| Quality | 25 | ROE, ROIC, Net Margin, Debt/Equity, Interest Coverage |
| Growth | 20 | Revenue Growth, EPS Growth, FCF Growth |
| Dividend | 15 | Dividend Yield, Payout Ratio |

**Base Total: 0-90 points** (Moat score added later)

---

### Node 11: AI Moat Analysis (OpenAI)

**What it is:** An OpenAI node that calls GPT-4o-mini.

**What it does:** Analyzes the company's competitive advantages (moat).

**Prompt sent to AI:**
```
Analyze {Company} ({Symbol}) for value investing:
- Sector, Industry, Description
- Valuation: P/E, P/B, EV/EBITDA
- Quality: ROE, ROIC, D/E
- Growth: Revenue, EPS
- Dividend: Yield

Base Score: XX/90

Respond with JSON:
{"moatScore": 0-10, "strengths": [...], "concerns": [...], "thesis": "..."}
```

**AI Response example:**
```json
{
  "moatScore": 8,
  "strengths": ["Strong brand", "High switching costs"],
  "concerns": ["Regulatory risk", "Competition"],
  "thesis": "Apple's ecosystem creates strong lock-in. Fair value at current prices."
}
```

**Configuration:**
- Model: gpt-4o-mini
- Temperature: 0.3 (more consistent responses)
- Max Tokens: 500

**IMPORTANT:** This node MUST be connected:
- Input from: Calculate Base Scores
- Output to: Calculate Final Score

---

### Node 12: Calculate Final Score (Code)

**What it is:** A JavaScript code node.

**What it does:**
1. Parses the AI response (handles JSON formatting)
2. Adds moat score (0-10) to base score (0-90)
3. Calculates final score (0-100)
4. Assigns classification (Excellent/Good/Fair/etc.)

**Key code:**
```javascript
// Parse AI response
const parsed = JSON.parse(aiResponse.message.content);
moatScore = parsed.moatScore;

// Calculate final
const totalScore = baseScore + moatScore;

// Classify
if (totalScore >= 80) classification = 'Excellent';
else if (totalScore >= 70) classification = 'Good';
// ...
```

---

### Node 13: Rate Limit (Wait)

**What it is:** A Wait node.

**What it does:** Pauses for 3 seconds before processing the next batch.

**Why needed:**
- FMP API rate limit: ~300 calls/minute
- Each batch makes 12 API calls (3 stocks × 4 APIs)
- 3 second pause = ~240 calls/minute (safe margin)

**Configuration:**
- Amount: 3000 (milliseconds = 3 seconds)

**Connects back to:** Split In Batches (creates the loop)

---

### Node 14: Aggregate All

**What it is:** An Aggregate node.

**What it does:** Collects all the individually processed stocks into one array.

**When it runs:** Only when Split In Batches has processed ALL items (Output 1).

**Input:** All scored stocks (arriving one batch at a time).

**Output:** Single array with all ~50 scored stocks.

---

### Node 15: Sort & Rank (Code)

**What it is:** A JavaScript code node.

**What it does:**
1. Sorts all stocks by totalScore (highest first)
2. Assigns rank (1, 2, 3, ...)

**Code:**
```javascript
// Sort descending
items.sort((a, b) => b.totalScore - a.totalScore);

// Add rank
items.forEach((item, index) => {
  item.rank = index + 1;
});
```

---

### Node 16: Write Scored Results (Google Sheets)

**What it is:** A Google Sheets node.

**What it does:** Writes the final ranked results to the Stage2_Scored sheet.

**Configuration:**
- Document ID: `1jMRAtD1tUQSYYD1gLWoHNw1IoBbUP-SPpBbStj01be0`
- Sheet Name: `Stage2_Scored`
- Operation: Append (or overwrite)

**Columns written:**
- rank, symbol, companyName, sector, industry
- totalScore, classification
- valuationScore, qualityScore, growthScore, dividendScore, moatScore
- peRatio, pbRatio, roe, roic, debtEquity, dividendYield
- strengths, concerns, thesis
- scoringDate

---

## The Batch Processing Loop

This is how the loop works step by step:

### Step 1: Initial Load
```
[Read Stage 1] outputs 50 stocks
     │
     ▼
[Split In Batches] receives 50 stocks
```

### Step 2: First Batch
```
[Split In Batches] sends stocks 1-3 to HTTP nodes (Output 0)
     │
     ├─→ [Get Profile]    ─┐
     ├─→ [Get Key Metrics] ├─→ [Merge] → [Score] → [AI] → [Final] → [Wait 3s]
     ├─→ [Get Ratios]     ─┤
     └─→ [Get Growth]     ─┘
```

### Step 3: Loop Back
```
[Wait 3s] → [Split In Batches] (remembers position, sends stocks 4-6)
```

### Step 4: Repeat
```
Batch 2: stocks 4-6
Batch 3: stocks 7-9
...
Batch 17: stocks 49-50 (last batch, only 2 items)
```

### Step 5: Complete
```
[Split In Batches] has no more items
     │
     ▼ (Output 1 fires)
     │
[Aggregate All] ← receives signal that all batches done
     │
     ▼ collects all 50 scored stocks
     │
[Sort & Rank] → [Write to Sheets]
```

---

## Data Flow Example

Let's trace one stock (AAPL) through the workflow:

### Stage A: Read
```json
// From Google Sheets
{
  "symbol": "AAPL",
  "company_name": "Apple Inc.",
  "sector": "Technology",
  "price": 175.50,
  "pe_ratio": 28.5
}
```

### Stage B: API Calls
```json
// Get Profile
{ "companyName": "Apple Inc.", "mktCap": 2800000000000, "description": "..." }

// Get Key Metrics
{ "roicTTM": 0.55, "enterpriseValueOverEBITDATTM": 22.1 }

// Get Ratios
{ "returnOnEquityTTM": 0.147, "debtEquityRatioTTM": 1.87, "dividendYieldTTM": 0.005 }

// Get Growth (3 years)
[{ "revenueGrowth": 0.08 }, { "revenueGrowth": 0.33 }, { "revenueGrowth": 0.05 }]
```

### Stage C: Merged & Cleaned
```json
{
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "peRatio": 28.5,
  "pbRatio": 45.2,
  "roe": 0.147,
  "roic": 0.55,
  "debtEquity": 1.87,
  "revenueGrowth": 0.153,  // average of 3 years
  "dividendYield": 0.005
}
```

### Stage D: Base Scores
```json
{
  "symbol": "AAPL",
  // ... metrics ...
  "scores": {
    "valuation": 12.5,    // out of 30
    "quality": 18.2,      // out of 25
    "growth": 14.1,       // out of 20
    "dividend": 1.9,      // out of 15
    "baseTotal": 46.7     // out of 90
  }
}
```

### Stage E: AI Analysis
```json
{
  "moatScore": 9,
  "strengths": ["Ecosystem lock-in", "Brand loyalty", "Services growth"],
  "concerns": ["High valuation", "China exposure"],
  "thesis": "Apple's ecosystem moat justifies premium. Strong buy on dips."
}
```

### Stage F: Final Score
```json
{
  "rank": 5,
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "totalScore": 56,         // 46.7 + 9 = 55.7 → rounded to 56
  "classification": "Fair",
  "valuationScore": 12.5,
  "qualityScore": 18.2,
  "growthScore": 14.1,
  "dividendScore": 1.9,
  "moatScore": 9,
  "strengths": "Ecosystem lock-in | Brand loyalty | Services growth",
  "concerns": "High valuation | China exposure",
  "thesis": "Apple's ecosystem moat justifies premium. Strong buy on dips."
}
```

---

## Scoring Formulas

### Valuation Score (0-30 points)

```javascript
// P/E Score (40% weight)
peScore = 12 - (pe - 5) * 0.8
// P/E of 5 = 12 points, P/E of 20 = 0 points

// P/B Score (25% weight)
pbScore = 12 - pb * 4
// P/B of 1 = 8 points, P/B of 3 = 0 points

// EV/EBITDA Score (20% weight)
evScore = 12 - (evEbitda - 4) * 0.8
// EV/EBITDA of 4 = 12 points, EV/EBITDA of 19 = 0 points

// P/FCF Score (15% weight)
pfcfScore = 12 - (pFcf - 5) * 0.6
// P/FCF of 5 = 12 points, P/FCF of 25 = 0 points

// Weighted total × 2.5 to scale to 30 max
valuationScore = (peScore*0.40 + pbScore*0.25 + evScore*0.20 + pfcfScore*0.15) * 2.5
```

### Quality Score (0-25 points)

```javascript
// ROE Score (30% weight)
roeScore = roe * 40  // 15% ROE = 6 points

// ROIC Score (25% weight)
roicScore = roic * 60  // 20% ROIC = 12 points

// Net Margin Score (20% weight)
marginScore = netMargin * 60  // 10% margin = 6 points

// Debt Score (15% weight) - lower is better
debtScore = 12 - debtEquity * 4  // D/E of 0.5 = 10 points

// Interest Coverage (10% weight)
coverageScore = interestCoverage * 1.2  // 10x coverage = 12 points

// Weighted total × 2.08 to scale to 25 max
qualityScore = (roeScore*0.30 + roicScore*0.25 + marginScore*0.20 + debtScore*0.15 + coverageScore*0.10) * 2.08
```

### Growth Score (0-20 points)

```javascript
// Revenue Growth (40% weight)
revGrowthScore = revenueGrowth * 60  // 20% growth = 12 points

// EPS Growth (35% weight)
epsGrowthScore = epsGrowth * 40  // 30% growth = 12 points

// FCF Growth (25% weight)
fcfGrowthScore = fcfGrowth * 40  // 30% growth = 12 points

// Weighted total × 1.67 to scale to 20 max
growthScore = (revGrowthScore*0.40 + epsGrowthScore*0.35 + fcfGrowthScore*0.25) * 1.67
```

### Dividend Score (0-15 points)

```javascript
// Only if company pays dividends
if (dividendYield > 0) {
  // Yield Score (60% weight)
  yieldScore = dividendYield * 300  // 4% yield = 12 points

  // Payout Ratio Score (40% weight) - 40% is ideal
  payoutScore = 12 - |payoutRatio - 0.40| * 20

  // Weighted total × 1.25 to scale to 15 max
  dividendScore = (yieldScore*0.60 + payoutScore*0.40) * 1.25
}
```

### Moat Score (0-10 points)

This is determined by AI based on:
- Brand strength
- Switching costs
- Network effects
- Cost advantages
- Intangible assets (patents, licenses)

### Final Score

```javascript
totalScore = valuationScore + qualityScore + growthScore + dividendScore + moatScore
// Maximum: 30 + 25 + 20 + 15 + 10 = 100 points
```

### Classification

| Score Range | Classification |
|-------------|----------------|
| 80-100 | Excellent |
| 70-79 | Good |
| 60-69 | Fair |
| 50-59 | Below Average |
| 0-49 | Poor |

---

## Summary

The workflow processes stocks in this order:

1. **Read** stocks from Google Sheets
2. **Batch** them into groups of 3
3. **Fetch** 4 types of financial data per stock
4. **Merge** the API responses
5. **Calculate** base scores (Valuation, Quality, Growth, Dividend)
6. **Analyze** competitive moat with AI
7. **Combine** base + moat into final score
8. **Wait** 3 seconds (rate limiting)
9. **Loop** back for next batch
10. **Aggregate** all scored stocks
11. **Sort** by score and add ranking
12. **Write** results to Google Sheets

---

*Document created: January 2026*
*Workflow file: `/home/amee/ValueInvest/workflows/stage2_scoring.json`*
