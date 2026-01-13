# Stage 3: Deep Analysis & 10-K Integration - Full Specification

## Overview
On-demand deep analysis triggered from the dashboard when a user clicks "Deep Analysis" on a stock. Analyzes companies with financial statements, SEC 10-K reports, DCF valuation, and generates buy/hold/sell recommendations displayed in the dashboard modal.

**Trigger:** User clicks "Deep Analysis" button in dashboard
**Output:** JSON data displayed in Deep Analysis Modal (see `stage4_dashboard_ui_spec.md`)

---

## 1. API Endpoints Required

### FMP Financial Statements
```
# Income Statement (3 years)
GET https://financialmodelingprep.com/api/v3/income-statement/{symbol}?limit=3&apikey={KEY}

# Balance Sheet (3 years)
GET https://financialmodelingprep.com/api/v3/balance-sheet-statement/{symbol}?limit=3&apikey={KEY}

# Cash Flow Statement (3 years)
GET https://financialmodelingprep.com/api/v3/cash-flow-statement/{symbol}?limit=3&apikey={KEY}

# DCF Value (FMP calculated)
GET https://financialmodelingprep.com/api/v3/discounted-cash-flow/{symbol}?apikey={KEY}
```

### SEC EDGAR API
```
# Get Company CIK Mapping
GET https://www.sec.gov/files/company_tickers.json

# Get Company Submissions (Filing List)
GET https://data.sec.gov/submissions/CIK{10-digit-cik}.json

# Get Company Facts (XBRL Data)
GET https://data.sec.gov/api/xbrl/companyfacts/CIK{10-digit-cik}.json
```

### Required Headers for SEC
```
User-Agent: ValueInvestApp contact@yourcompany.com
Accept-Encoding: gzip, deflate
```

---

## 2. SEC EDGAR Integration

### 2.1 CIK Lookup
```javascript
async function getCIK(ticker) {
  const response = await fetch('https://www.sec.gov/files/company_tickers.json', {
    headers: { 'User-Agent': 'ValueInvestApp contact@example.com' }
  });
  const data = await response.json();

  for (const entry of Object.values(data)) {
    if (entry.ticker.toUpperCase() === ticker.toUpperCase()) {
      return String(entry.cik_str).padStart(10, '0');
    }
  }
  return null;
}
```

### 2.2 Get 10-K Filing URL
```javascript
async function get10KFilingUrl(cik) {
  const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'ValueInvestApp contact@example.com' }
  });
  const data = await response.json();

  const filings = data.filings.recent;
  for (let i = 0; i < filings.form.length; i++) {
    if (filings.form[i] === '10-K') {
      const accession = filings.accessionNumber[i].replace(/-/g, '');
      const primaryDoc = filings.primaryDocument[i];
      return `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accession}/${primaryDoc}`;
    }
  }
  return null;
}
```

### 2.3 10-K Section Extraction
Key sections to extract:

| Item | Section Name | Value Investing Relevance |
|------|--------------|---------------------------|
| 1 | Business | Understanding the company |
| 1A | Risk Factors | Key risks to monitor |
| 7 | MD&A | Management's perspective |
| 7A | Market Risk | Interest rate/currency exposure |
| 8 | Financial Statements | Audited financials |

```javascript
// Section markers in 10-K HTML
const sectionPatterns = {
  item1: /item\s*1[.\s]*business/i,
  item1a: /item\s*1a[.\s]*risk\s*factors/i,
  item7: /item\s*7[.\s]*management.*discussion/i,
  item7a: /item\s*7a[.\s]*quantitative.*qualitative/i,
  item8: /item\s*8[.\s]*financial\s*statements/i
};
```

---

## 3. DCF Valuation Model

### 3.1 Simplified DCF Formula
```javascript
function calculateDCF(fcfHistory, growthRate, discountRate, terminalGrowthRate, sharesOutstanding) {
  const projectionYears = 5;
  const lastFCF = fcfHistory[0]; // Most recent FCF

  // Project future FCF
  let projectedFCF = [];
  for (let i = 1; i <= projectionYears; i++) {
    projectedFCF.push(lastFCF * Math.pow(1 + growthRate, i));
  }

  // Discount projected FCF
  let pvFCF = 0;
  for (let i = 0; i < projectionYears; i++) {
    pvFCF += projectedFCF[i] / Math.pow(1 + discountRate, i + 1);
  }

  // Terminal Value (Gordon Growth Model)
  const terminalFCF = projectedFCF[projectionYears - 1] * (1 + terminalGrowthRate);
  const terminalValue = terminalFCF / (discountRate - terminalGrowthRate);
  const pvTerminal = terminalValue / Math.pow(1 + discountRate, projectionYears);

  // Enterprise Value
  const enterpriseValue = pvFCF + pvTerminal;

  // Intrinsic Value per Share (simplified - assumes no debt adjustment)
  const intrinsicValue = enterpriseValue / sharesOutstanding;

  return {
    projectedFCF,
    pvFCF,
    terminalValue,
    pvTerminal,
    enterpriseValue,
    intrinsicValue
  };
}
```

### 3.2 Growth Rate Estimation
```javascript
function estimateGrowthRate(financials) {
  // Historical FCF growth (3-year CAGR)
  const fcf = financials.cashFlow.map(cf => cf.freeCashFlow);
  const historicalGrowth = Math.pow(fcf[0] / fcf[2], 1/2) - 1;

  // Sustainable growth rate
  const roe = financials.avgROE;
  const retentionRate = 1 - financials.avgPayoutRatio;
  const sustainableGrowth = roe * retentionRate;

  // Analyst consensus (if available)
  const analystGrowth = financials.analystGrowthEstimate || null;

  // Conservative estimate: minimum of available estimates, capped at 15%
  const estimates = [historicalGrowth, sustainableGrowth, analystGrowth].filter(e => e !== null && e > 0);
  const conservativeGrowth = Math.min(...estimates, 0.15);

  return {
    historical: historicalGrowth,
    sustainable: sustainableGrowth,
    analyst: analystGrowth,
    conservative: conservativeGrowth
  };
}
```

### 3.3 Discount Rate (WACC) Estimation
```javascript
function estimateWACC(company) {
  // Risk-free rate (10-year Treasury)
  const riskFreeRate = 0.04; // 4%

  // Market risk premium
  const marketRiskPremium = 0.055; // 5.5%

  // Cost of equity (CAPM)
  const beta = company.beta || 1.0;
  const costOfEquity = riskFreeRate + beta * marketRiskPremium;

  // Cost of debt (approximate from interest expense / total debt)
  const costOfDebt = company.interestExpense / company.totalDebt || 0.05;
  const taxRate = 0.21; // US corporate tax rate
  const afterTaxCostOfDebt = costOfDebt * (1 - taxRate);

  // Capital structure weights
  const marketCap = company.marketCap;
  const totalDebt = company.totalDebt;
  const totalCapital = marketCap + totalDebt;
  const equityWeight = marketCap / totalCapital;
  const debtWeight = totalDebt / totalCapital;

  // WACC
  const wacc = equityWeight * costOfEquity + debtWeight * afterTaxCostOfDebt;

  return {
    costOfEquity,
    costOfDebt: afterTaxCostOfDebt,
    equityWeight,
    debtWeight,
    wacc
  };
}
```

### 3.4 Margin of Safety
```javascript
function calculateMarginOfSafety(intrinsicValue, currentPrice) {
  const marginOfSafety = (intrinsicValue - currentPrice) / intrinsicValue;

  let recommendation;
  if (marginOfSafety >= 0.35) recommendation = 'Strong Buy';
  else if (marginOfSafety >= 0.20) recommendation = 'Buy';
  else if (marginOfSafety >= 0.05) recommendation = 'Hold';
  else if (marginOfSafety >= -0.10) recommendation = 'Weak Hold';
  else recommendation = 'Sell';

  return {
    intrinsicValue,
    currentPrice,
    marginOfSafety,
    marginOfSafetyPct: (marginOfSafety * 100).toFixed(1) + '%',
    recommendation
  };
}
```

---

## 4. n8n Workflow Design

### Node Sequence
```
[Input: Top 10 from Stage 2]
      ↓
[Loop Over Items]
      ↓
[HTTP: Income Statement] ──┐
[HTTP: Balance Sheet]     ├── Parallel
[HTTP: Cash Flow]         │
[HTTP: DCF Value]─────────┘
      ↓
[Code: Get SEC CIK]
      ↓
[HTTP: SEC Submissions]
      ↓
[HTTP: Fetch 10-K Document]
      ↓
[Code: Extract 10-K Sections]
      ↓
[Code: Calculate DCF & WACC]
      ↓
[OpenAI: Deep Analysis (GPT-4)]
      ↓
[Code: Generate Report Data]
      ↓
[Wait: 500ms] (SEC rate limit)
      ↓
[Loop Back]
      ↓
[Aggregate All Reports]
      ↓
[Output: Deep Analysis Results]
```

### Node Configurations

#### Node: Code - Get SEC CIK
```javascript
const symbol = $json.symbol;

// Fetch CIK mapping
const response = await this.helpers.httpRequest({
  method: 'GET',
  url: 'https://www.sec.gov/files/company_tickers.json',
  headers: { 'User-Agent': 'ValueInvestApp contact@example.com' }
});

const tickers = JSON.parse(response);
let cik = null;

for (const entry of Object.values(tickers)) {
  if (entry.ticker.toUpperCase() === symbol.toUpperCase()) {
    cik = String(entry.cik_str).padStart(10, '0');
    break;
  }
}

return [{
  json: {
    ...$json,
    cik: cik
  }
}];
```

#### Node: HTTP - SEC Submissions
```json
{
  "method": "GET",
  "url": "https://data.sec.gov/submissions/CIK{{ $json.cik }}.json",
  "headers": {
    "User-Agent": "ValueInvestApp contact@example.com",
    "Accept-Encoding": "gzip, deflate"
  },
  "options": {
    "timeout": 30000
  }
}
```

#### Node: Code - Extract 10-K URL
```javascript
const submissions = $input.first().json;
const filings = submissions.filings.recent;

let tenKUrl = null;
let filingDate = null;

for (let i = 0; i < filings.form.length; i++) {
  if (filings.form[i] === '10-K') {
    const accession = filings.accessionNumber[i].replace(/-/g, '');
    const cikInt = parseInt($json.cik);
    tenKUrl = `https://www.sec.gov/Archives/edgar/data/${cikInt}/${accession}/${filings.primaryDocument[i]}`;
    filingDate = filings.filingDate[i];
    break;
  }
}

return [{
  json: {
    ...$json,
    tenKUrl: tenKUrl,
    tenKFilingDate: filingDate
  }
}];
```

#### Node: Code - Calculate DCF
```javascript
const data = $json;
const incomeStmt = $('Get Income Statement').first().json;
const balanceSheet = $('Get Balance Sheet').first().json;
const cashFlow = $('Get Cash Flow').first().json;

// Extract FCF history
const fcfHistory = cashFlow.map(cf => cf.freeCashFlow);
const avgFCF = fcfHistory.reduce((a, b) => a + b, 0) / fcfHistory.length;

// Calculate growth rate
const fcfGrowth = fcfHistory.length >= 2
  ? Math.pow(fcfHistory[0] / fcfHistory[fcfHistory.length - 1], 1 / (fcfHistory.length - 1)) - 1
  : 0.05;
const conservativeGrowth = Math.min(Math.max(fcfGrowth, 0.02), 0.15);

// Estimate WACC
const beta = data.beta || 1.0;
const riskFreeRate = 0.04;
const marketPremium = 0.055;
const costOfEquity = riskFreeRate + beta * marketPremium;

const totalDebt = balanceSheet[0].totalDebt || 0;
const marketCap = data.marketCap;
const equityWeight = marketCap / (marketCap + totalDebt);
const debtWeight = totalDebt / (marketCap + totalDebt);
const costOfDebt = 0.05 * 0.79; // Approximate after-tax

const wacc = equityWeight * costOfEquity + debtWeight * costOfDebt;

// 5-Year DCF Projection
const projectionYears = 5;
const terminalGrowth = 0.025;
let pvFCF = 0;

for (let i = 1; i <= projectionYears; i++) {
  const projectedFCF = avgFCF * Math.pow(1 + conservativeGrowth, i);
  pvFCF += projectedFCF / Math.pow(1 + wacc, i);
}

// Terminal Value
const terminalFCF = avgFCF * Math.pow(1 + conservativeGrowth, projectionYears) * (1 + terminalGrowth);
const terminalValue = terminalFCF / (wacc - terminalGrowth);
const pvTerminal = terminalValue / Math.pow(1 + wacc, projectionYears);

// Intrinsic Value
const enterpriseValue = pvFCF + pvTerminal;
const sharesOutstanding = incomeStmt[0].weightedAverageShsOut;
const netDebt = totalDebt - (balanceSheet[0].cashAndCashEquivalents || 0);
const equityValue = enterpriseValue - netDebt;
const intrinsicValue = equityValue / sharesOutstanding;

// Margin of Safety
const currentPrice = data.price;
const marginOfSafety = (intrinsicValue - currentPrice) / intrinsicValue;

let recommendation;
if (marginOfSafety >= 0.35) recommendation = 'Strong Buy';
else if (marginOfSafety >= 0.20) recommendation = 'Buy';
else if (marginOfSafety >= 0.05) recommendation = 'Hold';
else if (marginOfSafety >= -0.10) recommendation = 'Weak Hold';
else recommendation = 'Sell';

return [{
  json: {
    ...data,
    dcfAnalysis: {
      avgFCF: avgFCF,
      growthRate: conservativeGrowth,
      wacc: wacc,
      pvFCF: pvFCF,
      terminalValue: terminalValue,
      enterpriseValue: enterpriseValue,
      intrinsicValue: intrinsicValue,
      currentPrice: currentPrice,
      marginOfSafety: marginOfSafety,
      marginOfSafetyPct: (marginOfSafety * 100).toFixed(1) + '%',
      recommendation: recommendation
    },
    financials: {
      revenue3Y: incomeStmt.map(i => ({ year: i.calendarYear, value: i.revenue })),
      netIncome3Y: incomeStmt.map(i => ({ year: i.calendarYear, value: i.netIncome })),
      fcf3Y: cashFlow.map(c => ({ year: c.calendarYear, value: c.freeCashFlow })),
      totalDebt: totalDebt,
      totalEquity: balanceSheet[0].totalStockholdersEquity,
      cash: balanceSheet[0].cashAndCashEquivalents
    }
  }
}];
```

#### Node: OpenAI - Deep Analysis (GPT-4)
**System Prompt:**
```
You are a senior value investment analyst preparing a comprehensive report. Analyze all provided data and generate a detailed investment analysis following the exact structure provided. Be specific, cite numbers, and provide actionable insights.
```

**User Prompt:**
```
Generate a comprehensive value investment report for:

Company: {{ $json.companyName }} ({{ $json.symbol }})
Sector: {{ $json.sector }} | Industry: {{ $json.industry }}

CURRENT VALUATION:
- Stock Price: ${{ $json.price }}
- Market Cap: ${{ ($json.marketCap / 1e9).toFixed(2) }}B
- P/E Ratio: {{ $json.keyMetrics.pe }}
- Value Score: {{ $json.totalScore }}/100

DCF ANALYSIS:
- Intrinsic Value: ${{ $json.dcfAnalysis.intrinsicValue.toFixed(2) }}
- Margin of Safety: {{ $json.dcfAnalysis.marginOfSafetyPct }}
- DCF Recommendation: {{ $json.dcfAnalysis.recommendation }}

3-YEAR FINANCIALS:
Revenue: {{ JSON.stringify($json.financials.revenue3Y) }}
Net Income: {{ JSON.stringify($json.financials.netIncome3Y) }}
Free Cash Flow: {{ JSON.stringify($json.financials.fcf3Y) }}

BALANCE SHEET:
- Total Debt: ${{ ($json.financials.totalDebt / 1e9).toFixed(2) }}B
- Total Equity: ${{ ($json.financials.totalEquity / 1e9).toFixed(2) }}B
- Cash: ${{ ($json.financials.cash / 1e9).toFixed(2) }}B

10-K FILING DATE: {{ $json.tenKFilingDate }}

Generate a report with these sections (output as JSON with HTML-formatted content):
{
  "executiveSummary": "<p>2-3 paragraph summary...</p>",
  "financialAnalysis": "<h3>Revenue Trends</h3><p>...</p><h3>Profitability</h3><p>...</p>",
  "managementCommitments": "<ul><li>Capital allocation...</li><li>Strategic initiatives...</li></ul>",
  "valuationAnalysis": "<p>DCF assumptions and peer comparison...</p>",
  "competitivePosition": "<p>Moat analysis and industry dynamics...</p>",
  "risksAndConcerns": "<ul><li>Risk 1...</li><li>Risk 2...</li></ul>",
  "recommendation": {
    "action": "Buy/Hold/Sell",
    "targetPrice": 123.45,
    "expectedReturn": "15-20%",
    "timeHorizon": "12-18 months",
    "confidence": "High/Medium/Low"
  }
}
```

---

## 5. Output Schema

```json
{
  "symbol": "JNJ",
  "companyName": "Johnson & Johnson",
  "sector": "Healthcare",
  "industry": "Drug Manufacturers",
  "reportDate": "2025-01-12",
  "totalScore": 79,

  "dcfAnalysis": {
    "avgFCF": 18500000000,
    "growthRate": 0.06,
    "wacc": 0.085,
    "intrinsicValue": 185.50,
    "currentPrice": 156.50,
    "marginOfSafety": 0.156,
    "marginOfSafetyPct": "15.6%",
    "recommendation": "Buy"
  },

  "financials": {
    "revenue3Y": [
      {"year": "2024", "value": 85000000000},
      {"year": "2023", "value": 82000000000},
      {"year": "2022", "value": 79000000000}
    ],
    "netIncome3Y": [...],
    "fcf3Y": [...]
  },

  "report": {
    "executiveSummary": "<p>HTML content...</p>",
    "financialAnalysis": "<h3>...</h3><p>...</p>",
    "managementCommitments": "<ul>...</ul>",
    "valuationAnalysis": "<p>...</p>",
    "competitivePosition": "<p>...</p>",
    "risksAndConcerns": "<ul>...</ul>",
    "recommendation": {
      "action": "Buy",
      "targetPrice": 185.50,
      "expectedReturn": "18.5%",
      "timeHorizon": "12-18 months",
      "confidence": "Medium"
    }
  },

  "tenKFilingDate": "2024-02-21",
  "tenKUrl": "https://www.sec.gov/..."
}
```

---

## 6. API Call Budget

| API Call | Per Company | Total (10 companies) |
|----------|-------------|---------------------|
| Income Statement | 1 | 10 |
| Balance Sheet | 1 | 10 |
| Cash Flow | 1 | 10 |
| DCF Value | 1 | 10 |
| SEC CIK Lookup | 1 | 1 (cached) |
| SEC Submissions | 1 | 10 |
| **FMP Total** | 4 | 40 |
| **SEC Total** | 2 | 21 |
| **OpenAI** | 1 | 10 |

---

## 7. Error Handling

### SEC API Errors
```javascript
// Handle SEC rate limiting
if (response.status === 429) {
  // Wait and retry
  await new Promise(resolve => setTimeout(resolve, 10000));
  // Retry request
}

// Handle missing 10-K
if (!tenKUrl) {
  return [{
    json: {
      ...$json,
      tenKError: 'No 10-K filing found',
      tenKUrl: null
    }
  }];
}
```

### DCF Calculation Guards
```javascript
// Prevent division by zero
if (wacc <= terminalGrowth) {
  terminalGrowth = wacc - 0.01;
}

// Handle negative FCF
if (avgFCF <= 0) {
  return [{
    json: {
      ...$json,
      dcfError: 'Negative average FCF - DCF not applicable',
      dcfAnalysis: null
    }
  }];
}
```

---

## 8. Testing Checklist

- [ ] FMP financial statements return 3 years of data
- [ ] SEC CIK lookup works for all test symbols
- [ ] SEC submissions API returns 10-K filings
- [ ] DCF calculation produces reasonable intrinsic values
- [ ] WACC calculation is within 6-12% range
- [ ] Margin of safety recommendations are consistent
- [ ] OpenAI generates properly formatted JSON
- [ ] All report sections contain content
- [ ] Error handling prevents workflow crashes
- [ ] Rate limiting respects SEC 10 req/sec limit

---

## 9. Dashboard Integration

### API Endpoint for Dashboard
```javascript
// Express/Next.js API route
// GET /api/deep-analysis/:symbol
async function getDeepAnalysis(symbol) {
  // Check cache first (analysis valid for 24 hours)
  const cached = await cache.get(`deep-analysis:${symbol}`);
  if (cached && Date.now() - cached.timestamp < 86400000) {
    return cached.data;
  }

  // Trigger n8n workflow or run analysis directly
  const analysis = await runStage3Analysis(symbol);

  // Cache result
  await cache.set(`deep-analysis:${symbol}`, {
    data: analysis,
    timestamp: Date.now()
  });

  return analysis;
}
```

### Dashboard Modal Data Mapping
The output JSON maps directly to the Deep Analysis Modal in `stage4_dashboard_ui_spec.md`:

| Output Field | Modal Section |
|--------------|---------------|
| `dcfAnalysis.intrinsicValue` | DCF Intrinsic Value card |
| `dcfAnalysis.marginOfSafety` | Margin of Safety display |
| `dcfAnalysis.recommendation` | Recommendation badge |
| `report.executiveSummary` | Executive Summary section |
| `report.risksAndConcerns` | Risks section |
| `report.competitivePosition` | Moat Assessment section |
| `tenKFilingDate` | 10-K Highlights header |
