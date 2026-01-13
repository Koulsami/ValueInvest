# Stage 2: Detailed Evaluation & Scoring - Full Specification

## Overview
Score ~100 companies from Stage 1 using AI-powered analysis with a 0-100 value investing score.

---

## 1. API Endpoints Required

### Company Profile
```
GET https://financialmodelingprep.com/api/v3/profile/{symbol}?apikey={YOUR_KEY}
```

### Key Metrics TTM
```
GET https://financialmodelingprep.com/api/v3/key-metrics-ttm/{symbol}?apikey={YOUR_KEY}
```

### Financial Ratios TTM
```
GET https://financialmodelingprep.com/api/v3/ratios-ttm/{symbol}?apikey={YOUR_KEY}
```

### Financial Growth (Year-over-Year)
```
GET https://financialmodelingprep.com/api/v3/financial-growth/{symbol}?period=annual&limit=3&apikey={YOUR_KEY}
```

---

## 2. Scoring Framework

### Category Weights
| Category | Weight | Description |
|----------|--------|-------------|
| Valuation | 30% | How cheap is the stock? |
| Quality | 25% | How good is the business? |
| Growth | 20% | Is it growing sustainably? |
| Dividend | 15% | Income and safety |
| Moat | 10% | Competitive advantage |

### 2.1 Valuation Scoring (30 points max)

| Metric | Weight | Score Formula |
|--------|--------|---------------|
| P/E Ratio | 40% | `max(0, 12 - (PE - 5) * 0.8)` |
| P/B Ratio | 25% | `max(0, 12 - (PB * 6))` |
| EV/EBITDA | 20% | `max(0, 12 - (EVEBITDA - 4) * 0.8)` |
| P/FCF | 15% | `max(0, 12 - (PFCF - 5) * 0.6)` |

```javascript
function calculateValuationScore(metrics) {
  const peScore = Math.max(0, Math.min(12, 12 - (metrics.peRatio - 5) * 0.8));
  const pbScore = Math.max(0, Math.min(12, 12 - metrics.pbRatio * 6));
  const evEbitdaScore = Math.max(0, Math.min(12, 12 - (metrics.evEbitda - 4) * 0.8));
  const pfcfScore = Math.max(0, Math.min(12, 12 - (metrics.pFcf - 5) * 0.6));

  return (peScore * 0.40 + pbScore * 0.25 + evEbitdaScore * 0.20 + pfcfScore * 0.15) * 2.5;
}
```

### 2.2 Quality Scoring (25 points max)

| Metric | Weight | Score Formula |
|--------|--------|---------------|
| ROE | 30% | `min(12, ROE * 40)` (25% ROE = 10) |
| ROIC | 25% | `min(12, ROIC * 60)` (20% ROIC = 12) |
| Net Margin | 20% | `min(12, netMargin * 60)` |
| Debt/Equity | 15% | `max(0, 12 - DE * 6)` |
| Interest Coverage | 10% | `min(12, coverage * 1.5)` |

```javascript
function calculateQualityScore(metrics) {
  const roeScore = Math.min(12, metrics.roe * 40);
  const roicScore = Math.min(12, metrics.roic * 60);
  const marginScore = Math.min(12, metrics.netMargin * 60);
  const debtScore = Math.max(0, 12 - metrics.debtEquity * 6);
  const coverageScore = Math.min(12, (metrics.interestCoverage || 10) * 1.5);

  return (roeScore * 0.30 + roicScore * 0.25 + marginScore * 0.20 +
          debtScore * 0.15 + coverageScore * 0.10) * 2.08;
}
```

### 2.3 Growth Scoring (20 points max)

| Metric | Weight | Score Formula |
|--------|--------|---------------|
| Revenue Growth (3Y) | 40% | `min(12, revGrowth * 60)` |
| EPS Growth (3Y) | 35% | `min(12, epsGrowth * 40)` |
| FCF Growth (3Y) | 25% | `min(12, fcfGrowth * 40)` |

```javascript
function calculateGrowthScore(growth) {
  const revScore = Math.min(12, Math.max(0, growth.revenueGrowth * 60));
  const epsScore = Math.min(12, Math.max(0, growth.epsGrowth * 40));
  const fcfScore = Math.min(12, Math.max(0, growth.fcfGrowth * 40));

  return (revScore * 0.40 + epsScore * 0.35 + fcfScore * 0.25) * 1.67;
}
```

### 2.4 Dividend Scoring (15 points max)

| Metric | Weight | Score Formula |
|--------|--------|---------------|
| Dividend Yield | 35% | `min(12, yield * 300)` (4% = 12) |
| Payout Ratio | 35% | `12 - abs(payout - 0.40) * 20` |
| Dividend Growth | 30% | `min(12, divGrowth * 120)` |

```javascript
function calculateDividendScore(metrics) {
  // No dividend = 0 score
  if (!metrics.dividendYield || metrics.dividendYield <= 0) {
    return 0;
  }

  const yieldScore = Math.min(12, metrics.dividendYield * 300);
  // Optimal payout is 40%, penalize deviation
  const payoutScore = Math.max(0, 12 - Math.abs(metrics.payoutRatio - 0.40) * 20);
  const growthScore = Math.min(12, (metrics.dividendGrowth || 0) * 120);

  return (yieldScore * 0.35 + payoutScore * 0.35 + growthScore * 0.30) * 1.25;
}
```

### 2.5 Moat Scoring (10 points max)

| Factor | Weight | Assessment |
|--------|--------|------------|
| ROIC Consistency | 40% | 5+ years ROIC > 15% |
| Margin Stability | 30% | Gross margin variance |
| Market Position | 30% | AI qualitative assessment |

```javascript
function calculateMoatScore(metrics, historicalData) {
  // ROIC consistency (need historical data)
  const roicConsistency = historicalData.roicHistory.filter(r => r > 0.15).length / 5;
  const roicScore = roicConsistency * 12;

  // Margin stability (low variance = stable)
  const marginVariance = calculateVariance(historicalData.grossMargins);
  const marginScore = Math.max(0, 12 - marginVariance * 100);

  // Market position (will be assessed by AI)
  const positionScore = metrics.aiMoatAssessment || 6; // Default to average

  return (roicScore * 0.40 + marginScore * 0.30 + positionScore * 0.30) * 0.83;
}
```

---

## 3. Piotroski F-Score Integration

### F-Score Components (0-9 scale)
```javascript
function calculateFScore(current, prior) {
  let score = 0;

  // Profitability (4 points)
  if (current.netIncome > 0) score++;                    // F_ROA
  if (current.operatingCashFlow > 0) score++;            // F_CFO
  if (current.roa > prior.roa) score++;                  // F_DELTA_ROA
  if (current.operatingCashFlow > current.netIncome) score++; // F_ACCRUAL

  // Leverage & Liquidity (3 points)
  if (current.longTermDebtRatio < prior.longTermDebtRatio) score++; // F_DELTA_LEVER
  if (current.currentRatio > prior.currentRatio) score++;           // F_DELTA_LIQUID
  if (current.sharesOutstanding <= prior.sharesOutstanding) score++; // F_EQ_OFFER

  // Operating Efficiency (2 points)
  if (current.grossMargin > prior.grossMargin) score++;  // F_DELTA_MARGIN
  if (current.assetTurnover > prior.assetTurnover) score++; // F_DELTA_TURN

  return score;
}
```

### F-Score Bonus Points
| F-Score | Bonus to Final Score |
|---------|---------------------|
| 8-9 | +5 points |
| 7 | +3 points |
| 6 | +1 point |
| 0-2 | -5 points |

---

## 4. n8n Workflow Design

### Node Sequence
```
[Input: Stage 1 Results]
      ↓
[Split In Batches: 10]
      ↓
[HTTP Request: Profile] ──┐
[HTTP Request: Key Metrics]├── Run in Parallel
[HTTP Request: Ratios TTM]─┤
[HTTP Request: Growth]─────┘
      ↓
[Code: Merge API Data]
      ↓
[Code: Calculate Base Scores]
      ↓
[OpenAI: AI Analysis & Moat Assessment]
      ↓
[Code: Parse AI Response]
      ↓
[Code: Calculate Final Score]
      ↓
[Wait: 200ms]
      ↓
[Loop Back]
      ↓
[Aggregate All Results]
      ↓
[Sort: By Score Descending]
      ↓
[Output: Scored Companies]
```

### Node Configurations

#### Node: HTTP Requests (Parallel)
```json
{
  "nodes": [
    {
      "name": "Get Profile",
      "type": "HTTP Request",
      "url": "https://financialmodelingprep.com/api/v3/profile/{{ $json.symbol }}",
      "qs": { "apikey": "{{ $credentials.fmpApiKey }}" }
    },
    {
      "name": "Get Key Metrics",
      "type": "HTTP Request",
      "url": "https://financialmodelingprep.com/api/v3/key-metrics-ttm/{{ $json.symbol }}",
      "qs": { "apikey": "{{ $credentials.fmpApiKey }}" }
    },
    {
      "name": "Get Ratios",
      "type": "HTTP Request",
      "url": "https://financialmodelingprep.com/api/v3/ratios-ttm/{{ $json.symbol }}",
      "qs": { "apikey": "{{ $credentials.fmpApiKey }}" }
    },
    {
      "name": "Get Growth",
      "type": "HTTP Request",
      "url": "https://financialmodelingprep.com/api/v3/financial-growth/{{ $json.symbol }}",
      "qs": { "period": "annual", "limit": "3", "apikey": "{{ $credentials.fmpApiKey }}" }
    }
  ]
}
```

#### Node: Code - Merge API Data
```javascript
const symbol = $('Split In Batches').first().json.symbol;
const profile = $('Get Profile').first().json[0] || {};
const keyMetrics = $('Get Key Metrics').first().json[0] || {};
const ratios = $('Get Ratios').first().json[0] || {};
const growth = $('Get Growth').first().json || [];

// Calculate average growth over 3 years
const avgRevGrowth = growth.length > 0
  ? growth.reduce((sum, g) => sum + (g.revenueGrowth || 0), 0) / growth.length
  : 0;
const avgEpsGrowth = growth.length > 0
  ? growth.reduce((sum, g) => sum + (g.epsgrowth || 0), 0) / growth.length
  : 0;

return [{
  json: {
    symbol: symbol,
    companyName: profile.companyName,
    sector: profile.sector,
    industry: profile.industry,
    description: profile.description?.substring(0, 500),
    marketCap: profile.mktCap,
    price: profile.price,

    // Valuation metrics
    peRatio: ratios.peRatioTTM || keyMetrics.peRatioTTM,
    pbRatio: ratios.priceToBookRatioTTM || keyMetrics.pbRatioTTM,
    evEbitda: keyMetrics.enterpriseValueOverEBITDATTM,
    pFcf: ratios.priceToFreeCashFlowsRatioTTM,

    // Quality metrics
    roe: ratios.returnOnEquityTTM,
    roa: ratios.returnOnAssetsTTM,
    roic: keyMetrics.roicTTM,
    netMargin: ratios.netProfitMarginTTM,
    grossMargin: ratios.grossProfitMarginTTM,
    debtEquity: ratios.debtEquityRatioTTM,
    currentRatio: ratios.currentRatioTTM,
    interestCoverage: ratios.interestCoverageTTM,

    // Growth metrics
    revenueGrowth: avgRevGrowth,
    epsGrowth: avgEpsGrowth,

    // Dividend metrics
    dividendYield: ratios.dividendYieldTTM || keyMetrics.dividendYieldTTM,
    payoutRatio: ratios.payoutRatioTTM || keyMetrics.payoutRatioTTM
  }
}];
```

#### Node: Code - Calculate Base Scores
```javascript
const data = $input.first().json;

// Valuation Score (30 points max)
const peScore = Math.max(0, Math.min(12, 12 - ((data.peRatio || 20) - 5) * 0.8));
const pbScore = Math.max(0, Math.min(12, 12 - (data.pbRatio || 3) * 6));
const evScore = Math.max(0, Math.min(12, 12 - ((data.evEbitda || 15) - 4) * 0.8));
const pfcfScore = Math.max(0, Math.min(12, 12 - ((data.pFcf || 20) - 5) * 0.6));
const valuationScore = (peScore * 0.40 + pbScore * 0.25 + evScore * 0.20 + pfcfScore * 0.15) * 2.5;

// Quality Score (25 points max)
const roeScore = Math.min(12, (data.roe || 0) * 40);
const roicScore = Math.min(12, (data.roic || 0) * 60);
const marginScore = Math.min(12, (data.netMargin || 0) * 60);
const debtScore = Math.max(0, 12 - (data.debtEquity || 2) * 6);
const coverageScore = Math.min(12, (data.interestCoverage || 5) * 1.5);
const qualityScore = (roeScore * 0.30 + roicScore * 0.25 + marginScore * 0.20 +
                     debtScore * 0.15 + coverageScore * 0.10) * 2.08;

// Growth Score (20 points max)
const revGrowthScore = Math.min(12, Math.max(0, (data.revenueGrowth || 0) * 60));
const epsGrowthScore = Math.min(12, Math.max(0, (data.epsGrowth || 0) * 40));
const growthScore = (revGrowthScore * 0.60 + epsGrowthScore * 0.40) * 1.67;

// Dividend Score (15 points max)
let dividendScore = 0;
if (data.dividendYield && data.dividendYield > 0) {
  const yieldScore = Math.min(12, data.dividendYield * 300);
  const payoutScore = Math.max(0, 12 - Math.abs((data.payoutRatio || 0.5) - 0.40) * 20);
  dividendScore = (yieldScore * 0.50 + payoutScore * 0.50) * 1.25;
}

return [{
  json: {
    ...data,
    scores: {
      valuation: Math.round(valuationScore * 10) / 10,
      quality: Math.round(qualityScore * 10) / 10,
      growth: Math.round(growthScore * 10) / 10,
      dividend: Math.round(dividendScore * 10) / 10,
      baseTotal: Math.round((valuationScore + qualityScore + growthScore + dividendScore) * 10) / 10
    }
  }
}];
```

#### Node: OpenAI - AI Analysis
**System Prompt:**
```
You are a value investment analyst. Analyze the company data and provide:
1. A moat score (0-10) based on competitive advantages
2. Key investment strengths (2-3 bullet points)
3. Key investment concerns (2-3 bullet points)
4. Brief investment thesis (2 sentences)

Respond in JSON format only.
```

**User Prompt:**
```
Analyze this company for value investing:

Company: {{ $json.companyName }} ({{ $json.symbol }})
Sector: {{ $json.sector }}
Industry: {{ $json.industry }}

Description: {{ $json.description }}

Key Metrics:
- P/E: {{ $json.peRatio }}
- ROE: {{ ($json.roe * 100).toFixed(1) }}%
- ROIC: {{ ($json.roic * 100).toFixed(1) }}%
- Debt/Equity: {{ $json.debtEquity }}
- Revenue Growth: {{ ($json.revenueGrowth * 100).toFixed(1) }}%
- Net Margin: {{ ($json.netMargin * 100).toFixed(1) }}%
- Dividend Yield: {{ ($json.dividendYield * 100).toFixed(2) }}%

Current Base Score: {{ $json.scores.baseTotal }}/85

Provide your analysis in this exact JSON format:
{
  "moatScore": <0-10>,
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"],
  "thesis": "Brief investment thesis here."
}
```

#### Node: Code - Calculate Final Score
```javascript
const data = $input.first().json;
const aiResponse = JSON.parse($('OpenAI').first().json.message.content);

// Moat Score (10 points max)
const moatScore = (aiResponse.moatScore || 5);

// Final Score Calculation
const finalScore = Math.round(
  data.scores.valuation +
  data.scores.quality +
  data.scores.growth +
  data.scores.dividend +
  moatScore
);

// Score Classification
let classification;
if (finalScore >= 80) classification = 'Excellent';
else if (finalScore >= 70) classification = 'Good';
else if (finalScore >= 60) classification = 'Fair';
else if (finalScore >= 50) classification = 'Below Average';
else classification = 'Poor';

return [{
  json: {
    symbol: data.symbol,
    companyName: data.companyName,
    sector: data.sector,
    industry: data.industry,
    marketCap: data.marketCap,
    price: data.price,

    // Individual Scores
    valuationScore: data.scores.valuation,
    qualityScore: data.scores.quality,
    growthScore: data.scores.growth,
    dividendScore: data.scores.dividend,
    moatScore: moatScore,

    // Final Score
    totalScore: finalScore,
    maxScore: 100,
    classification: classification,

    // Key Metrics
    keyMetrics: {
      pe: data.peRatio,
      roe: data.roe,
      debtEquity: data.debtEquity
    },

    // AI Analysis
    strengths: aiResponse.strengths,
    concerns: aiResponse.concerns,
    thesis: aiResponse.thesis,

    // Metadata
    scoringDate: new Date().toISOString()
  }
}];
```

---

## 5. API Call Budget

| API Call | Per Company | Total (100 companies) |
|----------|-------------|----------------------|
| Profile | 1 | 100 |
| Key Metrics TTM | 1 | 100 |
| Ratios TTM | 1 | 100 |
| Financial Growth | 1 | 100 |
| **FMP Total** | 4 | 400 |
| OpenAI | 1 | 100 |

**Strategy**: Process over 2 days (200 FMP calls/day) to stay within free tier.

---

## 6. Output Schema

```json
{
  "symbol": "JNJ",
  "companyName": "Johnson & Johnson",
  "sector": "Healthcare",
  "industry": "Drug Manufacturers",
  "marketCap": 385000000000,
  "price": 156.50,
  "valuationScore": 22.5,
  "qualityScore": 21.3,
  "growthScore": 14.2,
  "dividendScore": 12.8,
  "moatScore": 8.5,
  "totalScore": 79,
  "maxScore": 100,
  "classification": "Good",
  "keyMetrics": {
    "pe": 14.2,
    "roe": 0.205,
    "debtEquity": 0.45
  },
  "strengths": [
    "Strong brand portfolio with pricing power",
    "Consistent dividend growth for 60+ years"
  ],
  "concerns": [
    "Talc litigation overhang",
    "Slower growth in mature segments"
  ],
  "thesis": "JNJ is a defensive healthcare giant trading at reasonable valuations with a wide moat from its diversified business model and strong brands. The company offers reliable dividend income with moderate growth potential.",
  "scoringDate": "2025-01-12T10:30:00.000Z"
}
```

---

## 7. Testing Checklist

- [ ] All 4 FMP endpoints return valid data
- [ ] Base scores calculate correctly (0-85 range)
- [ ] AI responses parse as valid JSON
- [ ] Final scores in 0-100 range
- [ ] Score distribution shows differentiation (not all 50-60)
- [ ] Top scores align with known quality companies
- [ ] Error handling for missing data works
- [ ] Batch processing completes without timeout
