# Value Investment Screening Workflow - Claude Code Development Prompt

## PROJECT BRIEF

Build a complete n8n workflow that automates value investment screening and analysis of US public companies. The workflow should progress through four stages: preliminary screening (1000+ → ~100 companies), detailed scoring (~100 companies), narrowing to top candidates (~10), and generating comprehensive PDF reports with annual report analysis.

---

## TECHNICAL ENVIRONMENT

- **Platform**: n8n (self-hosted on Railway/Hostinger)
- **APIs**: Financial Modeling Prep (FMP) free tier (250 calls/day limit)
- **AI Services**: OpenAI GPT-4 or Groq for analysis
- **Output**: PDF reports via Puppeteer/Gotenberg
- **Storage**: Local filesystem or Google Drive integration
- **Trigger**: Manual trigger initially, Schedule trigger for daily automation

---

## WORKFLOW ARCHITECTURE

### Stage 1: Preliminary Screening (>1000 → ~100)

#### Requirements:
- Call FMP Stock Screener API with value investing filters
- Target parameters:
  - Market cap > $1B
  - P/E ratio < 15
  - ROE > 12%
  - Debt-to-Equity < 50%
  - Exchanges: NASDAQ, NYSE
  - Optional: Dividend yield > 2%
- Extract and store ~100 company symbols
- Implement error handling for API failures

#### API Endpoint:
```
GET https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=1000000000&pe<15&roe>12&debtToEquity<50&exchange=NASDAQ,NYSE&limit=100&apikey={YOUR_KEY}
```

#### n8n Nodes Needed:
- HTTP Request node (FMP screener)
- Code node (JavaScript) to extract symbols array
- Function node for additional filtering if needed

#### Code Example:
```javascript
// Extract symbols from FMP screener response
return items[0].json.map(item => ({
  symbol: item.symbol,
  companyName: item.companyName,
  sector: item.sector,
  marketCap: item.marketCap,
  pe: item.pe,
  roe: item.roe
}));
```

---

### Stage 2: Detailed Evaluation & Scoring (~100)

#### Requirements:
- Process each of the ~100 companies in batches (size: 10) to respect API limits
- For each company, fetch:
  - Company profile (`/profile/{symbol}`)
  - Key metrics TTM (`/key-metrics-ttm/{symbol}`)
- Use AI (OpenAI/Groq) to score each company 0-100 based on:
  - **30%** Valuation metrics (P/E < 15, P/B < 2)
  - **25%** Quality metrics (ROE > 15%, low debt, consistent profitability)
  - **20%** Growth (revenue growth > 5% YoY)
  - **15%** Dividend (yield, payout ratio, growth history)
  - **10%** Competitive moat (qualitative assessment)
- Output structured JSON with score and rationale
- Aggregate and sort companies by score descending

#### AI Scoring Prompt Template:
```
You are a value investment analyst. Score this company from 0-100 for value investing suitability.

Company Data:
{financial_metrics}

Scoring Criteria:
- Valuation (30%): P/E<15, P/B<2, P/FCF<12
- Quality (25%): ROE>15%, Debt/Equity<0.5, profit margins
- Growth (20%): Revenue growth >5% YoY, sustainable trajectory
- Dividend (15%): Yield >2%, payout ratio <60%, history
- Moat (10%): Competitive advantages, market position

Output JSON format:
{
  "symbol": "AAPL",
  "score": 85,
  "valuation_score": 25,
  "quality_score": 23,
  "growth_score": 18,
  "dividend_score": 12,
  "moat_score": 7,
  "rationale": "Brief explanation of strengths and concerns",
  "key_metrics": {
    "pe": 14.2,
    "roe": 16.5,
    "debt_equity": 0.35
  }
}
```

#### n8n Nodes Needed:
- Split In Batches node (batch size: 10)
- Multiple HTTP Request nodes (FMP API calls)
- OpenAI/Groq node with custom prompt
- Aggregate node to collect scores
- Sort node (by score descending)

#### FMP API Endpoints:
```
GET https://financialmodelingprep.com/api/v3/profile/{symbol}?apikey={YOUR_KEY}
GET https://financialmodelingprep.com/api/v3/key-metrics-ttm/{symbol}?apikey={YOUR_KEY}
```

---

### Stage 3: Narrow to Top 10 & Deep Analysis

#### Requirements:
- Filter to top 10 companies (score > 70 threshold)
- For each top company, gather:
  - 3 years of income statements
  - 3 years of balance sheets
  - Latest 10-K annual report from SEC EDGAR
- Use AI to perform deep analysis:
  - Summarize management commitments from 10-K (capex plans, buybacks, debt reduction, strategic initiatives)
  - Compare to industry peers
  - Perform simplified DCF valuation
  - Generate buy/hold/sell recommendation
- Structure output as HTML/Markdown for report generation

#### Deep Analysis Prompt Template:
```
You are a senior value investment analyst preparing a detailed report.

Company: {symbol} - {company_name}
Overall Score: {score}/100

Financial Data (3 years):
{income_statements}
{balance_sheets}

Annual Report Excerpts:
{10k_text}

Task: Generate a comprehensive value investment analysis report with the following sections:

1. EXECUTIVE SUMMARY (2-3 paragraphs)
   - Investment thesis
   - Key strengths and risks
   - Recommendation (Buy/Hold/Sell)

2. FINANCIAL PERFORMANCE ANALYSIS
   - Revenue and profitability trends
   - Margin analysis
   - Cash flow quality
   - Balance sheet strength

3. MANAGEMENT COMMITMENTS (from 10-K)
   - Capital allocation strategy
   - Planned investments and capex
   - Share buyback programs
   - Debt management plans
   - Strategic initiatives

4. VALUATION ANALYSIS
   - Current multiples vs. historical
   - Peer comparison
   - Simplified DCF estimate (state assumptions)
   - Margin of safety assessment

5. COMPETITIVE POSITION & MOAT
   - Industry dynamics
   - Competitive advantages
   - Market share trends
   - Threats and opportunities

6. RISKS & CONCERNS
   - Company-specific risks
   - Industry headwinds
   - Financial vulnerabilities

7. INVESTMENT RECOMMENDATION
   - Target price range
   - Expected return
   - Time horizon
   - Position sizing suggestion

Output as structured JSON with HTML-formatted sections for PDF generation.
```

#### n8n Nodes Needed:
- Filter node (score > 70)
- Loop Over Items node
- HTTP Request nodes (FMP financials, SEC EDGAR)
- OpenAI node (deep analysis with extended context)
- Code node to format data for AI prompt

#### FMP API Endpoints:
```
GET https://financialmodelingprep.com/api/v3/income-statement/{symbol}?limit=3&apikey={YOUR_KEY}
GET https://financialmodelingprep.com/api/v3/balance-sheet-statement/{symbol}?limit=3&apikey={YOUR_KEY}
```

#### SEC EDGAR Access:
```
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={symbol}&type=10-K&dateb=&owner=exclude&count=1
```

---

### Stage 4: PDF Report Generation

#### Requirements:
- Convert AI-generated analysis into professional PDF format
- Include:
  - Cover page with company logo and key metrics
  - Table of contents
  - All analysis sections
  - Charts/tables (optional but recommended)
  - Disclaimers and date stamp
- Save to designated folder with naming convention: `{symbol}_ValueReport_{YYYYMMDD}.pdf`
- Optional: Email reports or upload to Google Drive

#### Report Template Structure:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      margin: 40px; 
      line-height: 1.6;
    }
    h1 { 
      color: #2c3e50; 
      border-bottom: 3px solid #3498db; 
      padding-bottom: 10px;
    }
    h2 { 
      color: #34495e; 
      margin-top: 30px; 
      border-left: 4px solid #3498db;
      padding-left: 10px;
    }
    .metric-box { 
      background: #ecf0f1; 
      padding: 15px; 
      margin: 10px 0; 
      border-radius: 5px;
    }
    .recommendation { 
      font-size: 24px; 
      font-weight: bold; 
      padding: 20px; 
      text-align: center; 
      margin: 20px 0;
      border-radius: 5px;
    }
    .buy { background: #2ecc71; color: white; }
    .hold { background: #f39c12; color: white; }
    .sell { background: #e74c3c; color: white; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #34495e;
      color: white;
    }
    .score-badge {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 3px;
      font-weight: bold;
    }
    .score-high { background: #2ecc71; color: white; }
    .score-medium { background: #f39c12; color: white; }
    .score-low { background: #e74c3c; color: white; }
  </style>
</head>
<body>
  <h1>{{$json.symbol}} - Value Investment Analysis</h1>
  
  <div class="metric-box">
    <strong>Company Name:</strong> {{$json.companyName}}<br>
    <strong>Overall Score:</strong> 
    <span class="score-badge score-{{$json.scoreClass}}">{{$json.score}}/100</span><br>
    <strong>Report Date:</strong> {{$now.format('MMMM D, YYYY')}}<br>
    <strong>Sector:</strong> {{$json.sector}}<br>
    <strong>Market Cap:</strong> ${{$json.marketCap}}<br>
    <strong>Current Price:</strong> ${{$json.price}}
  </div>
  
  <div class="recommendation {{$json.recommendation.toLowerCase()}}">
    RECOMMENDATION: {{$json.recommendation}}
  </div>
  
  {{$json.htmlContent}}
  
  <footer style="margin-top: 50px; font-size: 12px; color: #7f8c8d; border-top: 1px solid #ddd; padding-top: 20px;">
    <p><em><strong>Disclaimer:</strong> This report is for informational purposes only and does not constitute investment advice. 
    The analysis is based on publicly available data and may contain errors or omissions. 
    Conduct your own due diligence and consult with a qualified financial advisor before making investment decisions. 
    Past performance does not guarantee future results.</em></p>
  </footer>
</body>
</html>
```

#### n8n Nodes Needed:
- HTML node to format template
- Puppeteer or Gotenberg node (PDF conversion)
- Write Binary File node (save locally) or Google Drive node
- Optional: Gmail node for email delivery

---

## IMPLEMENTATION REQUIREMENTS

### 1. Error Handling & Resilience

**Implementation Strategy:**
- Implement try-catch blocks in Code nodes
- Add IF nodes to check API response status codes
- Set retry logic for failed API calls (max 3 retries with exponential backoff)
- Log errors to a separate error tracking sheet/file

**Error Handling Code Example:**
```javascript
try {
  const response = items[0].json;
  
  if (!response || response.error) {
    throw new Error(`API Error: ${response?.error || 'Unknown error'}`);
  }
  
  return items;
} catch (error) {
  // Log error and continue with next item
  return [{
    json: {
      error: true,
      message: error.message,
      symbol: $json.symbol,
      timestamp: new Date().toISOString()
    }
  }];
}
```

---

### 2. Rate Limiting Strategy

**FMP Free Tier Analysis:**
- **Limit**: 250 calls/day
- **Calculation**: 
  - Screen: 1 call
  - Batch processing: 100 × 2 = 200 calls
  - Deep analysis: 10 × 2 = 20 calls
  - **Total**: ~221 calls ✓

**Implementation:**
- Add delay nodes between batches (2-3 seconds)
- Implement daily call counter to prevent overages
- Cache results to minimize repeated calls

**Rate Limiting Code:**
```javascript
// Add delay between API calls
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
await delay(2000); // 2 second delay
```

---

### 3. Data Persistence

**Storage Strategy:**
- Cache screened companies in Google Sheets or JSON file
- Store scores to avoid reprocessing
- Maintain historical scores for trend analysis
- Archive generated reports with timestamp

**Suggested Structure:**
```
/value-investment-workflow/
├── /cache/
│   ├── screened_companies_YYYYMMDD.json
│   └── scores_YYYYMMDD.json
├── /reports/
│   ├── AAPL_ValueReport_20250112.pdf
│   └── MSFT_ValueReport_20250112.pdf
└── /logs/
    └── workflow_log_YYYYMMDD.json
```

---

### 4. Configuration Variables

Create a separate Config node or environment variables:

```javascript
{
  "api_keys": {
    "fmp_api_key": "YOUR_FMP_KEY",
    "openai_api_key": "YOUR_OPENAI_KEY",
    "groq_api_key": "YOUR_GROQ_KEY"
  },
  "screening_filters": {
    "min_market_cap": 1000000000,
    "max_pe": 15,
    "min_roe": 12,
    "max_debt_equity": 50,
    "min_dividend_yield": 2,
    "exchanges": ["NASDAQ", "NYSE"],
    "excluded_sectors": ["Financial Services"]
  },
  "scoring_parameters": {
    "scoring_threshold": 70,
    "top_n_companies": 10,
    "batch_size": 10,
    "weights": {
      "valuation": 0.30,
      "quality": 0.25,
      "growth": 0.20,
      "dividend": 0.15,
      "moat": 0.10
    }
  },
  "output_settings": {
    "output_directory": "/value-reports/",
    "report_format": "pdf",
    "enable_email": true,
    "email_recipients": ["your@email.com"],
    "enable_google_drive": false
  },
  "workflow_settings": {
    "enable_caching": true,
    "cache_duration_hours": 24,
    "max_retries": 3,
    "retry_delay_ms": 2000
  }
}
```

---

## DELIVERABLES

### 1. Complete n8n Workflow JSON File
- Importable workflow file
- All nodes configured with placeholders for API keys
- Comments and documentation within nodes

### 2. Documentation Package
- **Setup Guide**: 
  - API key registration instructions
  - n8n installation and configuration
  - Node credential setup
- **User Manual**:
  - How to run the workflow
  - Customizing filters and parameters
  - Interpreting results
- **Technical Documentation**:
  - Node-by-node explanation
  - Data flow diagrams
  - API endpoint reference
- **Troubleshooting Guide**:
  - Common issues and solutions
  - API error codes
  - Debugging tips

### 3. Sample Outputs
- 2-3 example PDF reports
- Sample JSON data from each stage
- Screenshots of successful workflow execution

### 4. Testing Checklist
- [ ] Stage 1: Screening returns 80-120 companies
- [ ] Stage 2: All companies receive valid scores (0-100)
- [ ] Stage 3: Top 10 filtering works correctly
- [ ] Stage 4: PDFs generate without errors
- [ ] Error handling prevents crashes
- [ ] Rate limits are respected
- [ ] Reports are professional and readable
- [ ] File naming convention is correct
- [ ] Email notifications work (if enabled)

---

## SUCCESS CRITERIA

- [ ] Workflow successfully screens 100+ companies in < 5 minutes
- [ ] AI scoring produces consistent, reasonable scores
- [ ] Score distribution shows clear differentiation (not all 50-60)
- [ ] Top 10 filtering works correctly based on threshold
- [ ] PDF reports are professional, readable, and comprehensive
- [ ] Entire workflow completes within 30 minutes
- [ ] No API rate limit violations (< 250 calls/day)
- [ ] Error handling prevents workflow crashes on bad data
- [ ] Reports saved with correct naming convention
- [ ] All financial data is accurate and up-to-date
- [ ] 10-K summaries contain relevant management commitments
- [ ] Buy/Hold/Sell recommendations are logical and justified

---

## ADDITIONAL CONSIDERATIONS

### 1. Testing Approach
- **Phase 1 Testing**: Test with 5 companies before full run
- **Incremental Testing**: Test each stage independently
- **Validation**: Compare FMP data with Yahoo Finance for accuracy
- **Performance Testing**: Time each stage to identify bottlenecks

### 2. Modularity
- Build each stage as a sub-workflow that can be tested independently
- Create reusable components for:
  - API error handling
  - Data formatting
  - Report templating
- Use Execute Workflow nodes to chain sub-workflows

### 3. Monitoring & Alerts
- Add notification nodes for:
  - Workflow completion
  - Critical failures
  - API quota warnings (>200 calls used)
- Log key metrics:
  - Number of companies screened
  - Average score
  - Execution time per stage

### 4. Future Enhancements
- **Phase 2 Features**:
  - Add charting (price history, financial trends)
  - Implement portfolio tracking
  - Create comparison matrix for top candidates
- **Phase 3 Features**:
  - Add backtesting capability
  - Historical score tracking
  - Performance attribution analysis
- **Phase 4 Features**:
  - Create web dashboard for viewing reports
  - Real-time alerting for new opportunities
  - Integration with brokerage APIs

---

## DEVELOPMENT PHASES

### Phase 1: Foundation (Week 1)
- [ ] Set up n8n environment
- [ ] Configure API credentials
- [ ] Build and test Stage 1 (screening)
- [ ] Validate data quality

### Phase 2: Scoring (Week 2)
- [ ] Implement Stage 2 (scoring) with 10 test stocks
- [ ] Fine-tune AI prompts for consistent scoring
- [ ] Test batch processing and rate limiting
- [ ] Verify score accuracy

### Phase 3: Deep Analysis (Week 3)
- [ ] Add Stage 3 (deep analysis) for top 3 stocks
- [ ] Integrate SEC EDGAR data retrieval
- [ ] Test 10-K parsing and summarization
- [ ] Validate analysis quality

### Phase 4: Report Generation (Week 4)
- [ ] Create PDF generation with sample template
- [ ] Design professional report layout
- [ ] Test PDF rendering and styling
- [ ] Implement file naming and storage

### Phase 5: Integration (Week 5)
- [ ] Integration testing with full pipeline
- [ ] End-to-end testing with 100 companies
- [ ] Performance optimization
- [ ] Error handling validation

### Phase 6: Production (Week 6)
- [ ] Final optimization and refinement
- [ ] Documentation completion
- [ ] User acceptance testing
- [ ] Deployment to production environment

---

## TECHNICAL NOTES

### n8n Best Practices
1. **Use expressions**: `{{ $json.fieldName }}` for dynamic data
2. **Error workflows**: Create separate error handling workflows
3. **Credentials**: Store all API keys in n8n credentials manager
4. **Testing**: Use Manual trigger during development
5. **Logging**: Add Set node to log important values

### API Optimization Tips
1. **Parallel processing**: Use Split In Batches instead of loops where possible
2. **Conditional requests**: Only fetch data when needed (e.g., skip if cached)
3. **Data transformation**: Clean and format data immediately after API calls
4. **Response validation**: Always check for null/undefined values

### AI Prompt Engineering
1. **Be specific**: Clearly define output format (JSON, HTML, etc.)
2. **Provide examples**: Include sample inputs/outputs in prompts
3. **Set constraints**: Specify length, tone, and structure
4. **Request reasoning**: Ask AI to explain its scoring logic

---

## SUPPORT & RESOURCES

### Documentation Links
- n8n Documentation: https://docs.n8n.io/
- FMP API Docs: https://site.financialmodelingprep.com/developer/docs
- OpenAI API: https://platform.openai.com/docs
- SEC EDGAR: https://www.sec.gov/edgar/searchedgar/companysearch.html

### Community Resources
- n8n Community Forum: https://community.n8n.io/
- n8n Workflow Library: https://n8n.io/workflows
- FMP Community: https://financialmodelingprep.com/developer/docs/community

---

## FINAL INSTRUCTIONS

Please develop this n8n workflow **step-by-step**, testing each stage before proceeding to the next. 

**Development Guidelines:**
1. Start with Stage 1 only - get screening working perfectly
2. Add dummy data for Stages 2-4 initially to test data flow
3. Once flow is confirmed, implement real API calls stage by stage
4. Test with 5 companies first, then 10, then 20, then full 100
5. Document any API quirks, rate limit issues, or edge cases discovered
6. Provide clear comments in all Code nodes explaining logic
7. Create a separate "test mode" that uses cached data to avoid API calls

**Code Quality Requirements:**
- All JavaScript code must have error handling
- Use meaningful variable names
- Add comments for complex logic
- Follow consistent formatting
- Log important values for debugging

**Testing Requirements:**
- Test with both successful and failed API calls
- Verify handling of missing/null data
- Check edge cases (no results, API timeout, invalid symbols)
- Validate final PDF output for readability

---

## VERSION HISTORY

- **v1.0** (2025-01-12): Initial specification
- **v1.1** (TBD): Updates based on development feedback
- **v2.0** (TBD): Production-ready version with enhancements

---

**Document prepared for**: Claude Code Development  
**Project**: Automated Value Investment Screening System  
**Author**: Investment Analysis Team  
**Last Updated**: January 12, 2025
