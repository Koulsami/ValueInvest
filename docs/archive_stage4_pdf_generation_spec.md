# Stage 4: PDF Report Generation - Full Specification

## Overview
Convert deep analysis into professional PDF reports using HTML templates and Gotenberg/Puppeteer.

---

## 1. PDF Generation Options

### Option A: Gotenberg (Recommended)
- Docker-based HTML to PDF converter
- Chromium-based rendering
- No API limits
- Self-hosted

### Option B: Puppeteer Community Node
- Full Puppeteer API access
- Requires n8n-nodes-puppeteer package
- More complex setup

### Option C: Cloud Services
- PDFShift, DocRaptor, etc.
- API-based, paid services
- Simpler setup but recurring costs

---

## 2. Gotenberg Setup

### Docker Compose
```yaml
version: '3'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
    volumes:
      - ./n8n_data:/home/node/.n8n
      - ./reports:/reports

  gotenberg:
    image: gotenberg/gotenberg:7
    ports:
      - "3000:3000"
    command:
      - "gotenberg"
      - "--chromium-disable-javascript=true"
      - "--api-timeout=120s"
```

### Gotenberg Endpoints
```
# HTML to PDF
POST http://gotenberg:3000/forms/chromium/convert/html

# URL to PDF
POST http://gotenberg:3000/forms/chromium/convert/url

# Merge PDFs
POST http://gotenberg:3000/forms/pdfengines/merge
```

---

## 3. HTML Report Template

### Complete Template Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{symbol}} - Value Investment Report</title>
  <style>
    /* Page Setup */
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;

      @top-right {
        content: "{{symbol}} - Value Report";
        font-size: 9pt;
        color: #666;
      }

      @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 9pt;
        color: #666;
      }
    }

    @page :first {
      margin-top: 0;
    }

    /* Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
    }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%);
      color: white;
      page-break-after: always;
    }

    .cover-page h1 {
      font-size: 42pt;
      font-weight: 300;
      margin-bottom: 10px;
    }

    .cover-page .company-name {
      font-size: 24pt;
      font-weight: 400;
      margin-bottom: 30px;
    }

    .cover-page .report-type {
      font-size: 14pt;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 40px;
      opacity: 0.9;
    }

    .cover-page .date {
      font-size: 12pt;
      opacity: 0.8;
    }

    .cover-metrics {
      display: flex;
      gap: 40px;
      margin-top: 50px;
    }

    .cover-metric {
      text-align: center;
    }

    .cover-metric .value {
      font-size: 28pt;
      font-weight: 600;
    }

    .cover-metric .label {
      font-size: 10pt;
      text-transform: uppercase;
      opacity: 0.8;
    }

    /* Section Styles */
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }

    h2 {
      font-size: 16pt;
      color: #1a365d;
      border-bottom: 2px solid #2d5a87;
      padding-bottom: 8px;
      margin-bottom: 15px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 13pt;
      color: #2d5a87;
      margin: 15px 0 10px 0;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 12px;
      text-align: justify;
    }

    /* Recommendation Box */
    .recommendation-box {
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }

    .recommendation-box.buy {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
    }

    .recommendation-box.strong-buy {
      background: linear-gradient(135deg, #15803d 0%, #166534 100%);
      color: white;
    }

    .recommendation-box.hold {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .recommendation-box.sell {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }

    .recommendation-box .action {
      font-size: 24pt;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .recommendation-box .target {
      font-size: 14pt;
    }

    /* Score Card */
    .score-card {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }

    .score-item {
      text-align: center;
      flex: 1;
    }

    .score-item .score {
      font-size: 24pt;
      font-weight: 700;
      color: #1a365d;
    }

    .score-item .max {
      font-size: 12pt;
      color: #64748b;
    }

    .score-item .label {
      font-size: 9pt;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 5px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 10pt;
    }

    th {
      background: #1a365d;
      color: white;
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
    }

    td {
      padding: 8px;
      border-bottom: 1px solid #e2e8f0;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    /* Metric Boxes */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 15px 0;
    }

    .metric-box {
      background: #f8fafc;
      border-left: 4px solid #2d5a87;
      padding: 12px;
    }

    .metric-box .value {
      font-size: 18pt;
      font-weight: 700;
      color: #1a365d;
    }

    .metric-box .label {
      font-size: 9pt;
      color: #64748b;
      text-transform: uppercase;
    }

    /* Lists */
    ul, ol {
      margin: 10px 0 10px 25px;
    }

    li {
      margin-bottom: 8px;
    }

    /* Highlights */
    .highlight-green {
      color: #16a34a;
      font-weight: 600;
    }

    .highlight-red {
      color: #dc2626;
      font-weight: 600;
    }

    .highlight-yellow {
      color: #d97706;
      font-weight: 600;
    }

    /* Footer/Disclaimer */
    .disclaimer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 8pt;
      color: #64748b;
      page-break-inside: avoid;
    }

    /* Page Breaks */
    .page-break {
      page-break-after: always;
    }

    .no-break {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="report-type">Value Investment Analysis</div>
    <h1>{{symbol}}</h1>
    <div class="company-name">{{companyName}}</div>
    <div class="date">Report Date: {{reportDate}}</div>

    <div class="cover-metrics">
      <div class="cover-metric">
        <div class="value">{{totalScore}}</div>
        <div class="label">Value Score</div>
      </div>
      <div class="cover-metric">
        <div class="value">${{price}}</div>
        <div class="label">Current Price</div>
      </div>
      <div class="cover-metric">
        <div class="value">${{intrinsicValue}}</div>
        <div class="label">Intrinsic Value</div>
      </div>
      <div class="cover-metric">
        <div class="value">{{marginOfSafety}}</div>
        <div class="label">Margin of Safety</div>
      </div>
    </div>
  </div>

  <!-- Recommendation -->
  <div class="section">
    <h2>Investment Recommendation</h2>
    <div class="recommendation-box {{recommendationClass}}">
      <div class="action">{{recommendation}}</div>
      <div class="target">Target Price: ${{targetPrice}} | Expected Return: {{expectedReturn}}</div>
    </div>
  </div>

  <!-- Score Breakdown -->
  <div class="section">
    <h2>Value Score Breakdown</h2>
    <div class="score-card">
      <div class="score-item">
        <div class="score">{{valuationScore}}</div>
        <div class="max">/30</div>
        <div class="label">Valuation</div>
      </div>
      <div class="score-item">
        <div class="score">{{qualityScore}}</div>
        <div class="max">/25</div>
        <div class="label">Quality</div>
      </div>
      <div class="score-item">
        <div class="score">{{growthScore}}</div>
        <div class="max">/20</div>
        <div class="label">Growth</div>
      </div>
      <div class="score-item">
        <div class="score">{{dividendScore}}</div>
        <div class="max">/15</div>
        <div class="label">Dividend</div>
      </div>
      <div class="score-item">
        <div class="score">{{moatScore}}</div>
        <div class="max">/10</div>
        <div class="label">Moat</div>
      </div>
      <div class="score-item">
        <div class="score" style="color: #2d5a87;">{{totalScore}}</div>
        <div class="max">/100</div>
        <div class="label">Total</div>
      </div>
    </div>
  </div>

  <!-- Executive Summary -->
  <div class="section">
    <h2>Executive Summary</h2>
    {{executiveSummary}}
  </div>

  <div class="page-break"></div>

  <!-- Key Metrics -->
  <div class="section">
    <h2>Key Financial Metrics</h2>
    <div class="metrics-grid">
      <div class="metric-box">
        <div class="value">{{peRatio}}</div>
        <div class="label">P/E Ratio</div>
      </div>
      <div class="metric-box">
        <div class="value">{{pbRatio}}</div>
        <div class="label">P/B Ratio</div>
      </div>
      <div class="metric-box">
        <div class="value">{{evEbitda}}</div>
        <div class="label">EV/EBITDA</div>
      </div>
      <div class="metric-box">
        <div class="value">{{roe}}</div>
        <div class="label">ROE</div>
      </div>
      <div class="metric-box">
        <div class="value">{{roic}}</div>
        <div class="label">ROIC</div>
      </div>
      <div class="metric-box">
        <div class="value">{{debtEquity}}</div>
        <div class="label">Debt/Equity</div>
      </div>
      <div class="metric-box">
        <div class="value">{{netMargin}}</div>
        <div class="label">Net Margin</div>
      </div>
      <div class="metric-box">
        <div class="value">{{dividendYield}}</div>
        <div class="label">Dividend Yield</div>
      </div>
      <div class="metric-box">
        <div class="value">{{revenueGrowth}}</div>
        <div class="label">Revenue Growth</div>
      </div>
    </div>
  </div>

  <!-- Financial Performance -->
  <div class="section">
    <h2>Financial Performance (3-Year)</h2>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th class="text-right">{{year1}}</th>
          <th class="text-right">{{year2}}</th>
          <th class="text-right">{{year3}}</th>
          <th class="text-right">3Y CAGR</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Revenue</td>
          <td class="text-right">{{revenue1}}</td>
          <td class="text-right">{{revenue2}}</td>
          <td class="text-right">{{revenue3}}</td>
          <td class="text-right">{{revenueCAGR}}</td>
        </tr>
        <tr>
          <td>Net Income</td>
          <td class="text-right">{{netIncome1}}</td>
          <td class="text-right">{{netIncome2}}</td>
          <td class="text-right">{{netIncome3}}</td>
          <td class="text-right">{{netIncomeCAGR}}</td>
        </tr>
        <tr>
          <td>Free Cash Flow</td>
          <td class="text-right">{{fcf1}}</td>
          <td class="text-right">{{fcf2}}</td>
          <td class="text-right">{{fcf3}}</td>
          <td class="text-right">{{fcfCAGR}}</td>
        </tr>
        <tr>
          <td>EPS</td>
          <td class="text-right">{{eps1}}</td>
          <td class="text-right">{{eps2}}</td>
          <td class="text-right">{{eps3}}</td>
          <td class="text-right">{{epsCAGR}}</td>
        </tr>
      </tbody>
    </table>
    {{financialAnalysis}}
  </div>

  <div class="page-break"></div>

  <!-- DCF Valuation -->
  <div class="section">
    <h2>DCF Valuation Analysis</h2>
    <table>
      <thead>
        <tr>
          <th>Assumption</th>
          <th class="text-right">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Average Free Cash Flow (Base)</td>
          <td class="text-right">{{avgFCF}}</td>
        </tr>
        <tr>
          <td>Projected Growth Rate (5 Years)</td>
          <td class="text-right">{{growthRate}}</td>
        </tr>
        <tr>
          <td>Terminal Growth Rate</td>
          <td class="text-right">2.5%</td>
        </tr>
        <tr>
          <td>WACC (Discount Rate)</td>
          <td class="text-right">{{wacc}}</td>
        </tr>
        <tr>
          <td>Present Value of FCF</td>
          <td class="text-right">{{pvFCF}}</td>
        </tr>
        <tr>
          <td>Terminal Value (Discounted)</td>
          <td class="text-right">{{pvTerminal}}</td>
        </tr>
        <tr>
          <td><strong>Enterprise Value</strong></td>
          <td class="text-right"><strong>{{enterpriseValue}}</strong></td>
        </tr>
        <tr>
          <td><strong>Intrinsic Value per Share</strong></td>
          <td class="text-right"><strong>${{intrinsicValue}}</strong></td>
        </tr>
        <tr>
          <td>Current Stock Price</td>
          <td class="text-right">${{price}}</td>
        </tr>
        <tr>
          <td><strong>Margin of Safety</strong></td>
          <td class="text-right {{marginClass}}"><strong>{{marginOfSafety}}</strong></td>
        </tr>
      </tbody>
    </table>
    {{valuationAnalysis}}
  </div>

  <!-- Competitive Position -->
  <div class="section">
    <h2>Competitive Position & Moat</h2>
    {{competitivePosition}}
  </div>

  <div class="page-break"></div>

  <!-- Risks -->
  <div class="section">
    <h2>Risks & Concerns</h2>
    {{risksAndConcerns}}
  </div>

  <!-- Management Commitments -->
  <div class="section">
    <h2>Management Commitments (from 10-K)</h2>
    {{managementCommitments}}
    <p><em>Source: 10-K Filing dated {{tenKDate}}</em></p>
  </div>

  <!-- Disclaimer -->
  <div class="disclaimer">
    <p><strong>Disclaimer:</strong> This report is generated for informational purposes only and does not constitute investment advice, an offer to sell, or a solicitation of an offer to buy any securities. The analysis is based on publicly available data from Financial Modeling Prep API and SEC EDGAR filings, which may contain errors or omissions. Past performance does not guarantee future results. All investments involve risk, including the possible loss of principal.</p>
    <p>Investors should conduct their own due diligence and consult with a qualified financial advisor before making any investment decisions. The DCF valuation and projections are based on assumptions that may not reflect actual future performance.</p>
    <p><strong>Generated by:</strong> Automated Value Investment Screening System | <strong>Report Date:</strong> {{reportDate}}</p>
  </div>

</body>
</html>
```

---

## 4. n8n Workflow Design

### Node Sequence
```
[Input: Stage 3 Results]
      ↓
[Loop Over Items]
      ↓
[Code: Prepare Template Data]
      ↓
[Code: Generate HTML]
      ↓
[HTTP Request: Gotenberg PDF]
      ↓
[Move Binary Data]
      ↓
[Write Binary File] OR [Google Drive Upload]
      ↓
[Loop Back]
      ↓
[Aggregate: All Report Paths]
      ↓
[Optional: Send Email Summary]
      ↓
[Output: Report Generation Complete]
```

### Node Configurations

#### Node: Code - Prepare Template Data
```javascript
const data = $json;
const report = data.report;
const dcf = data.dcfAnalysis;
const financials = data.financials;

// Format currency values
const formatCurrency = (value) => {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
};

const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;

// Determine recommendation class
let recommendationClass = 'hold';
const rec = report.recommendation.action.toLowerCase();
if (rec.includes('strong buy')) recommendationClass = 'strong-buy';
else if (rec.includes('buy')) recommendationClass = 'buy';
else if (rec.includes('sell')) recommendationClass = 'sell';

// Margin of safety class
const marginClass = dcf.marginOfSafety > 0.15 ? 'highlight-green' :
                   dcf.marginOfSafety > 0 ? 'highlight-yellow' : 'highlight-red';

// Financial data for table
const rev = financials.revenue3Y;
const ni = financials.netIncome3Y;
const fcf = financials.fcf3Y;

return [{
  json: {
    // Basic Info
    symbol: data.symbol,
    companyName: data.companyName,
    reportDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }),

    // Scores
    totalScore: data.totalScore,
    valuationScore: data.valuationScore.toFixed(1),
    qualityScore: data.qualityScore.toFixed(1),
    growthScore: data.growthScore.toFixed(1),
    dividendScore: data.dividendScore.toFixed(1),
    moatScore: data.moatScore.toFixed(1),

    // Prices
    price: data.price.toFixed(2),
    intrinsicValue: dcf.intrinsicValue.toFixed(2),
    targetPrice: report.recommendation.targetPrice.toFixed(2),

    // Recommendation
    recommendation: report.recommendation.action,
    recommendationClass: recommendationClass,
    expectedReturn: report.recommendation.expectedReturn,
    marginOfSafety: dcf.marginOfSafetyPct,
    marginClass: marginClass,

    // Metrics
    peRatio: data.keyMetrics?.pe?.toFixed(1) || 'N/A',
    pbRatio: data.pbRatio?.toFixed(2) || 'N/A',
    evEbitda: data.evEbitda?.toFixed(1) || 'N/A',
    roe: formatPercent(data.roe || 0),
    roic: formatPercent(data.roic || 0),
    debtEquity: data.debtEquity?.toFixed(2) || 'N/A',
    netMargin: formatPercent(data.netMargin || 0),
    dividendYield: formatPercent(data.dividendYield || 0),
    revenueGrowth: formatPercent(data.revenueGrowth || 0),

    // DCF Values
    avgFCF: formatCurrency(dcf.avgFCF),
    growthRate: formatPercent(dcf.growthRate),
    wacc: formatPercent(dcf.wacc),
    pvFCF: formatCurrency(dcf.pvFCF),
    pvTerminal: formatCurrency(dcf.pvTerminal),
    enterpriseValue: formatCurrency(dcf.enterpriseValue),

    // Financial Table
    year1: rev[0]?.year || '2024',
    year2: rev[1]?.year || '2023',
    year3: rev[2]?.year || '2022',
    revenue1: formatCurrency(rev[0]?.value || 0),
    revenue2: formatCurrency(rev[1]?.value || 0),
    revenue3: formatCurrency(rev[2]?.value || 0),
    netIncome1: formatCurrency(ni[0]?.value || 0),
    netIncome2: formatCurrency(ni[1]?.value || 0),
    netIncome3: formatCurrency(ni[2]?.value || 0),
    fcf1: formatCurrency(fcf[0]?.value || 0),
    fcf2: formatCurrency(fcf[1]?.value || 0),
    fcf3: formatCurrency(fcf[2]?.value || 0),

    // Report Sections (HTML)
    executiveSummary: report.executiveSummary,
    financialAnalysis: report.financialAnalysis,
    valuationAnalysis: report.valuationAnalysis,
    competitivePosition: report.competitivePosition,
    risksAndConcerns: report.risksAndConcerns,
    managementCommitments: report.managementCommitments,
    tenKDate: data.tenKFilingDate
  }
}];
```

#### Node: Code - Generate HTML
```javascript
const d = $json;

// HTML template with all placeholders replaced
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${d.symbol} - Value Investment Report</title>
  <style>
    /* [Include all CSS from template above] */
    @page { size: A4; margin: 20mm 15mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #333; }
    .cover-page { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(135deg, #1a365d, #2d5a87); color: white; text-align: center; page-break-after: always; padding: 40px; }
    .cover-page h1 { font-size: 42pt; font-weight: 300; }
    .cover-page .company-name { font-size: 24pt; margin: 10px 0 30px; }
    .section { margin-bottom: 25px; }
    h2 { font-size: 16pt; color: #1a365d; border-bottom: 2px solid #2d5a87; padding-bottom: 8px; margin-bottom: 15px; }
    .recommendation-box { padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .recommendation-box.buy { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }
    .recommendation-box.strong-buy { background: linear-gradient(135deg, #15803d, #166534); color: white; }
    .recommendation-box.hold { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
    .recommendation-box.sell { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
    .recommendation-box .action { font-size: 24pt; font-weight: 700; }
    .score-card { display: flex; justify-content: space-between; background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .score-item { text-align: center; flex: 1; }
    .score-item .score { font-size: 24pt; font-weight: 700; color: #1a365d; }
    .score-item .max { font-size: 12pt; color: #64748b; }
    .score-item .label { font-size: 9pt; color: #64748b; text-transform: uppercase; }
    .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0; }
    .metric-box { background: #f8fafc; border-left: 4px solid #2d5a87; padding: 12px; }
    .metric-box .value { font-size: 18pt; font-weight: 700; color: #1a365d; }
    .metric-box .label { font-size: 9pt; color: #64748b; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 10pt; }
    th { background: #1a365d; color: white; padding: 10px 8px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .text-right { text-align: right; }
    .highlight-green { color: #16a34a; font-weight: 600; }
    .highlight-red { color: #dc2626; font-weight: 600; }
    .page-break { page-break-after: always; }
    .disclaimer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 8pt; color: #64748b; }
  </style>
</head>
<body>
  <div class="cover-page">
    <div style="font-size: 14pt; text-transform: uppercase; letter-spacing: 3px; opacity: 0.9;">Value Investment Analysis</div>
    <h1>${d.symbol}</h1>
    <div class="company-name">${d.companyName}</div>
    <div style="font-size: 12pt; opacity: 0.8;">Report Date: ${d.reportDate}</div>
    <div style="display: flex; gap: 40px; margin-top: 50px;">
      <div style="text-align: center;"><div style="font-size: 28pt; font-weight: 600;">${d.totalScore}</div><div style="font-size: 10pt; opacity: 0.8;">VALUE SCORE</div></div>
      <div style="text-align: center;"><div style="font-size: 28pt; font-weight: 600;">$${d.price}</div><div style="font-size: 10pt; opacity: 0.8;">CURRENT PRICE</div></div>
      <div style="text-align: center;"><div style="font-size: 28pt; font-weight: 600;">$${d.intrinsicValue}</div><div style="font-size: 10pt; opacity: 0.8;">INTRINSIC VALUE</div></div>
      <div style="text-align: center;"><div style="font-size: 28pt; font-weight: 600;">${d.marginOfSafety}</div><div style="font-size: 10pt; opacity: 0.8;">MARGIN OF SAFETY</div></div>
    </div>
  </div>

  <div class="section">
    <h2>Investment Recommendation</h2>
    <div class="recommendation-box ${d.recommendationClass}">
      <div class="action">${d.recommendation}</div>
      <div style="font-size: 14pt;">Target Price: $${d.targetPrice} | Expected Return: ${d.expectedReturn}</div>
    </div>
  </div>

  <div class="section">
    <h2>Value Score Breakdown</h2>
    <div class="score-card">
      <div class="score-item"><div class="score">${d.valuationScore}</div><div class="max">/30</div><div class="label">Valuation</div></div>
      <div class="score-item"><div class="score">${d.qualityScore}</div><div class="max">/25</div><div class="label">Quality</div></div>
      <div class="score-item"><div class="score">${d.growthScore}</div><div class="max">/20</div><div class="label">Growth</div></div>
      <div class="score-item"><div class="score">${d.dividendScore}</div><div class="max">/15</div><div class="label">Dividend</div></div>
      <div class="score-item"><div class="score">${d.moatScore}</div><div class="max">/10</div><div class="label">Moat</div></div>
      <div class="score-item"><div class="score" style="color: #2d5a87;">${d.totalScore}</div><div class="max">/100</div><div class="label">Total</div></div>
    </div>
  </div>

  <div class="section">
    <h2>Executive Summary</h2>
    ${d.executiveSummary}
  </div>

  <div class="page-break"></div>

  <div class="section">
    <h2>Key Financial Metrics</h2>
    <div class="metrics-grid">
      <div class="metric-box"><div class="value">${d.peRatio}</div><div class="label">P/E Ratio</div></div>
      <div class="metric-box"><div class="value">${d.pbRatio}</div><div class="label">P/B Ratio</div></div>
      <div class="metric-box"><div class="value">${d.evEbitda}</div><div class="label">EV/EBITDA</div></div>
      <div class="metric-box"><div class="value">${d.roe}</div><div class="label">ROE</div></div>
      <div class="metric-box"><div class="value">${d.roic}</div><div class="label">ROIC</div></div>
      <div class="metric-box"><div class="value">${d.debtEquity}</div><div class="label">Debt/Equity</div></div>
      <div class="metric-box"><div class="value">${d.netMargin}</div><div class="label">Net Margin</div></div>
      <div class="metric-box"><div class="value">${d.dividendYield}</div><div class="label">Div Yield</div></div>
      <div class="metric-box"><div class="value">${d.revenueGrowth}</div><div class="label">Rev Growth</div></div>
    </div>
  </div>

  <div class="section">
    <h2>Financial Performance (3-Year)</h2>
    <table>
      <tr><th>Metric</th><th class="text-right">${d.year1}</th><th class="text-right">${d.year2}</th><th class="text-right">${d.year3}</th></tr>
      <tr><td>Revenue</td><td class="text-right">${d.revenue1}</td><td class="text-right">${d.revenue2}</td><td class="text-right">${d.revenue3}</td></tr>
      <tr><td>Net Income</td><td class="text-right">${d.netIncome1}</td><td class="text-right">${d.netIncome2}</td><td class="text-right">${d.netIncome3}</td></tr>
      <tr><td>Free Cash Flow</td><td class="text-right">${d.fcf1}</td><td class="text-right">${d.fcf2}</td><td class="text-right">${d.fcf3}</td></tr>
    </table>
    ${d.financialAnalysis}
  </div>

  <div class="page-break"></div>

  <div class="section">
    <h2>DCF Valuation Analysis</h2>
    <table>
      <tr><th>Assumption</th><th class="text-right">Value</th></tr>
      <tr><td>Average Free Cash Flow</td><td class="text-right">${d.avgFCF}</td></tr>
      <tr><td>Growth Rate (5Y)</td><td class="text-right">${d.growthRate}</td></tr>
      <tr><td>Terminal Growth</td><td class="text-right">2.5%</td></tr>
      <tr><td>WACC</td><td class="text-right">${d.wacc}</td></tr>
      <tr><td>PV of FCF</td><td class="text-right">${d.pvFCF}</td></tr>
      <tr><td>PV of Terminal</td><td class="text-right">${d.pvTerminal}</td></tr>
      <tr><td><strong>Enterprise Value</strong></td><td class="text-right"><strong>${d.enterpriseValue}</strong></td></tr>
      <tr><td><strong>Intrinsic Value/Share</strong></td><td class="text-right"><strong>$${d.intrinsicValue}</strong></td></tr>
      <tr><td>Current Price</td><td class="text-right">$${d.price}</td></tr>
      <tr><td><strong>Margin of Safety</strong></td><td class="text-right ${d.marginClass}"><strong>${d.marginOfSafety}</strong></td></tr>
    </table>
    ${d.valuationAnalysis}
  </div>

  <div class="section">
    <h2>Competitive Position & Moat</h2>
    ${d.competitivePosition}
  </div>

  <div class="page-break"></div>

  <div class="section">
    <h2>Risks & Concerns</h2>
    ${d.risksAndConcerns}
  </div>

  <div class="section">
    <h2>Management Commitments</h2>
    ${d.managementCommitments}
    <p><em>Source: 10-K Filing dated ${d.tenKDate}</em></p>
  </div>

  <div class="disclaimer">
    <p><strong>Disclaimer:</strong> This report is for informational purposes only and does not constitute investment advice. The analysis is based on publicly available data which may contain errors. Past performance does not guarantee future results. Conduct your own due diligence before making investment decisions.</p>
    <p><strong>Generated:</strong> Automated Value Investment System | ${d.reportDate}</p>
  </div>
</body>
</html>`;

return [{
  json: {
    symbol: d.symbol,
    html: html,
    fileName: `${d.symbol}_ValueReport_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.pdf`
  }
}];
```

#### Node: HTTP Request - Gotenberg PDF
```json
{
  "method": "POST",
  "url": "http://gotenberg:3000/forms/chromium/convert/html",
  "sendBody": true,
  "contentType": "multipart-form-data",
  "bodyParameters": {
    "parameters": [
      {
        "name": "files",
        "parameterType": "formBinaryData",
        "inputDataFieldName": "={{ $json.html }}"
      },
      {
        "name": "marginTop",
        "value": "0.5"
      },
      {
        "name": "marginBottom",
        "value": "0.5"
      },
      {
        "name": "marginLeft",
        "value": "0.5"
      },
      {
        "name": "marginRight",
        "value": "0.5"
      }
    ]
  },
  "options": {
    "response": {
      "responseFormat": "file"
    },
    "timeout": 60000
  }
}
```

#### Node: Write Binary File
```json
{
  "fileName": "/reports/{{ $json.fileName }}",
  "options": {
    "append": false
  }
}
```

#### Node: Google Drive Upload (Alternative)
```json
{
  "operation": "upload",
  "name": "={{ $json.fileName }}",
  "parents": ["your-folder-id"],
  "binaryPropertyName": "data"
}
```

---

## 5. File Naming Convention

```
{SYMBOL}_ValueReport_{YYYYMMDD}.pdf

Examples:
- AAPL_ValueReport_20250112.pdf
- JNJ_ValueReport_20250112.pdf
- MSFT_ValueReport_20250112.pdf
```

---

## 6. Output Storage Options

### Option 1: Local Filesystem
```
/reports/
├── 2025-01-12/
│   ├── AAPL_ValueReport_20250112.pdf
│   ├── JNJ_ValueReport_20250112.pdf
│   └── summary.json
└── archive/
```

### Option 2: Google Drive
```
ValueInvestReports/
├── 2025-01/
│   ├── AAPL_ValueReport_20250112.pdf
│   └── JNJ_ValueReport_20250112.pdf
└── Archive/
```

### Option 3: S3/Cloud Storage
```
s3://value-invest-reports/
├── reports/2025/01/12/
└── index.json
```

---

## 7. Email Summary (Optional)

#### Gmail Node Configuration
```json
{
  "operation": "send",
  "to": "investor@example.com",
  "subject": "Value Investment Reports - {{ $now.format('MMMM D, YYYY') }}",
  "emailType": "html",
  "message": "<h2>Daily Value Investment Reports</h2><p>{{$json.reportCount}} reports generated.</p><h3>Top Recommendations:</h3><ul>{{$json.topRecommendations}}</ul>",
  "attachments": "data"
}
```

---

## 8. Testing Checklist

- [ ] Gotenberg container is running and accessible
- [ ] HTML template renders correctly in browser
- [ ] CSS styling appears in PDF output
- [ ] Page breaks work correctly (5-6 pages per report)
- [ ] Cover page displays all metrics
- [ ] Tables are properly formatted
- [ ] Recommendation box shows correct color
- [ ] File saves with correct naming convention
- [ ] PDF file size is reasonable (< 2MB)
- [ ] All 10 reports generate successfully
- [ ] Email delivery works (if enabled)
