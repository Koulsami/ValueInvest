# Stage 1: Preliminary Screening - Full Specification

## Overview
Filter 1000+ US public companies down to ~100 candidates using value investing criteria.

---

## 1. API Endpoints Required

### Primary: FMP Stock Screener
```
GET https://financialmodelingprep.com/api/v3/stock-screener?
    marketCapMoreThan=1000000000&
    exchange=NASDAQ,NYSE&
    isActivelyTrading=true&
    isEtf=false&
    isFund=false&
    limit=1000&
    apikey={YOUR_KEY}
```

**Important Limitation**: FMP Stock Screener does NOT support direct filtering by P/E, ROE, or Debt-to-Equity. These must be filtered in a secondary step.

### Secondary: Ratios TTM (for each screened stock)
```
GET https://financialmodelingprep.com/api/v3/ratios-ttm/{symbol}?apikey={YOUR_KEY}
```

### Alternative: Bulk Ratios (reduces API calls)
```
GET https://financialmodelingprep.com/api/v3/ratios-ttm-bulk?apikey={YOUR_KEY}
```
*Note: May require paid tier*

---

## 2. Screening Criteria

### Tier 1 - Basic Filters (Stock Screener API)
| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `marketCapMoreThan` | 1,000,000,000 | Large/mid-cap stability |
| `exchange` | NASDAQ,NYSE | Major US exchanges |
| `isActivelyTrading` | true | Tradeable stocks |
| `isEtf` | false | Exclude ETFs |
| `isFund` | false | Exclude funds |
| `country` | US | US companies only |

### Tier 2 - Value Filters (Post-Processing)
| Metric | Threshold | FMP Field |
|--------|-----------|-----------|
| P/E Ratio | < 15 | `peRatioTTM` |
| P/B Ratio | < 2.0 | `priceToBookRatioTTM` |
| ROE | > 12% | `returnOnEquityTTM` |
| Debt-to-Equity | < 1.0 | `debtEquityRatioTTM` |
| Current Ratio | > 1.2 | `currentRatioTTM` |

### Tier 3 - Optional Filters
| Metric | Threshold | FMP Field |
|--------|-----------|-----------|
| Dividend Yield | > 1% | `dividendYieldTTM` |
| Interest Coverage | > 3.0 | `interestCoverageTTM` |
| Gross Margin | > 20% | `grossProfitMarginTTM` |

### Sector Exclusions (Optional)
Exclude high-debt sectors where metrics don't apply:
- Financial Services (banks use different metrics)
- Real Estate (REITs use FFO, not P/E)

---

## 3. n8n Workflow Design

### Node Sequence
```
[Manual Trigger]
      ↓
[Set Config Node] - Store API keys and parameters
      ↓
[HTTP Request: Stock Screener] - Get initial list
      ↓
[Code: Extract Symbols] - Parse response
      ↓
[Split In Batches: 50] - Batch for rate limiting
      ↓
[HTTP Request: Ratios TTM] - Get financial ratios
      ↓
[Wait: 100ms] - Rate limiting
      ↓
[Loop Back to Split In Batches]
      ↓
[Aggregate: Merge All Results]
      ↓
[Code: Apply Value Filters] - Filter by P/E, ROE, etc.
      ↓
[Sort: By Market Cap Descending]
      ↓
[Limit: 100 Results]
      ↓
[Code: Format Output]
      ↓
[Write to File / Google Sheets]
```

### Node Configurations

#### Node 1: Set Config
```javascript
// Configuration node - set these values
return [{
  json: {
    config: {
      fmpApiKey: "YOUR_FMP_API_KEY",
      filters: {
        minMarketCap: 1000000000,
        maxPE: 15,
        minROE: 0.12,
        maxDebtEquity: 1.0,
        minCurrentRatio: 1.2,
        exchanges: ["NASDAQ", "NYSE"],
        excludedSectors: ["Financial Services", "Real Estate"]
      },
      batchSize: 50,
      targetCompanies: 100
    }
  }
}];
```

#### Node 2: HTTP Request - Stock Screener
```json
{
  "method": "GET",
  "url": "https://financialmodelingprep.com/api/v3/stock-screener",
  "qs": {
    "marketCapMoreThan": "={{ $json.config.filters.minMarketCap }}",
    "exchange": "NASDAQ,NYSE",
    "isActivelyTrading": "true",
    "isEtf": "false",
    "isFund": "false",
    "limit": "1000",
    "apikey": "={{ $json.config.fmpApiKey }}"
  },
  "options": {
    "timeout": 30000,
    "retry": {
      "maxRetries": 3,
      "retryInterval": 2000
    }
  }
}
```

#### Node 3: Code - Extract Symbols
```javascript
const config = $('Set Config').first().json.config;
const screenedStocks = $input.first().json;

// Filter out excluded sectors
const filteredStocks = screenedStocks.filter(stock => {
  return !config.filters.excludedSectors.includes(stock.sector);
});

// Map to required format
return filteredStocks.map(stock => ({
  json: {
    symbol: stock.symbol,
    companyName: stock.companyName,
    sector: stock.sector,
    industry: stock.industry,
    marketCap: stock.marketCap,
    price: stock.price,
    exchange: stock.exchangeShortName
  }
}));
```

#### Node 4: HTTP Request - Ratios TTM
```json
{
  "method": "GET",
  "url": "https://financialmodelingprep.com/api/v3/ratios-ttm/{{ $json.symbol }}",
  "qs": {
    "apikey": "={{ $('Set Config').first().json.config.fmpApiKey }}"
  },
  "options": {
    "timeout": 10000
  }
}
```

#### Node 5: Code - Apply Value Filters
```javascript
const config = $('Set Config').first().json.config;
const items = $input.all();

const filtered = items.filter(item => {
  const ratios = item.json[0]; // Ratios TTM response is an array

  if (!ratios) return false;

  // Apply value investing filters
  const passesFilters = (
    ratios.peRatioTTM > 0 &&
    ratios.peRatioTTM < config.filters.maxPE &&
    ratios.returnOnEquityTTM > config.filters.minROE &&
    ratios.debtEquityRatioTTM < config.filters.maxDebtEquity &&
    ratios.currentRatioTTM > config.filters.minCurrentRatio
  );

  return passesFilters;
});

// Combine original data with ratios
return filtered.map(item => {
  const ratios = item.json[0];
  const originalData = $('Code: Extract Symbols').all()
    .find(s => s.json.symbol === ratios.symbol)?.json || {};

  return {
    json: {
      ...originalData,
      symbol: ratios.symbol,
      peRatio: ratios.peRatioTTM,
      pbRatio: ratios.priceToBookRatioTTM,
      roe: ratios.returnOnEquityTTM,
      roa: ratios.returnOnAssetsTTM,
      debtEquity: ratios.debtEquityRatioTTM,
      currentRatio: ratios.currentRatioTTM,
      dividendYield: ratios.dividendYieldTTM,
      grossMargin: ratios.grossProfitMarginTTM,
      operatingMargin: ratios.operatingProfitMarginTTM,
      netMargin: ratios.netProfitMarginTTM
    }
  };
});
```

#### Node 6: Code - Format Final Output
```javascript
const items = $input.all().map(i => i.json);

// Sort by market cap descending
items.sort((a, b) => b.marketCap - a.marketCap);

// Take top 100
const top100 = items.slice(0, 100);

// Add ranking
return top100.map((stock, index) => ({
  json: {
    rank: index + 1,
    ...stock,
    marketCapFormatted: `$${(stock.marketCap / 1e9).toFixed(2)}B`,
    screeningDate: new Date().toISOString().split('T')[0]
  }
}));
```

---

## 4. API Call Budget Analysis

| Step | Calls | Notes |
|------|-------|-------|
| Stock Screener | 1 | Returns up to 1000 stocks |
| Ratios TTM | ~800 | After sector exclusions |
| **Total** | ~801 | Within 250/day if batched over 4 days |

### Optimization Strategies

1. **Cache Results**: Store screener results, only refresh weekly
2. **Incremental Updates**: Only fetch ratios for new symbols
3. **Use Bulk Endpoints**: If available on your plan
4. **Multi-Day Batching**: Process 200 stocks/day over 4 days

---

## 5. Output Schema

```json
{
  "rank": 1,
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "exchange": "NASDAQ",
  "marketCap": 2850000000000,
  "marketCapFormatted": "$2850.00B",
  "price": 178.50,
  "peRatio": 28.5,
  "pbRatio": 45.2,
  "roe": 1.47,
  "roa": 0.28,
  "debtEquity": 1.76,
  "currentRatio": 0.99,
  "dividendYield": 0.0054,
  "grossMargin": 0.44,
  "operatingMargin": 0.30,
  "netMargin": 0.25,
  "screeningDate": "2025-01-12"
}
```

---

## 6. Error Handling

### HTTP Request Errors
```javascript
// In Code node after HTTP Request
try {
  const response = $input.first().json;

  if (!response || response.error) {
    throw new Error(`API Error: ${response?.error || 'Empty response'}`);
  }

  if (!Array.isArray(response)) {
    throw new Error('Invalid response format');
  }

  return response.map(item => ({ json: item }));

} catch (error) {
  // Log error and return empty for this batch
  console.error(`Error processing: ${error.message}`);
  return [{
    json: {
      error: true,
      message: error.message,
      timestamp: new Date().toISOString()
    }
  }];
}
```

### Missing Data Handling
```javascript
// Safe accessor for potentially missing fields
const safeGet = (obj, path, defaultValue = null) => {
  return path.split('.').reduce((acc, part) =>
    acc && acc[part] !== undefined ? acc[part] : defaultValue, obj);
};

// Usage
const pe = safeGet(ratios, 'peRatioTTM', 999); // Default to 999 (fail filter)
```

---

## 7. Testing Checklist

- [ ] Stock screener returns 500+ companies
- [ ] Excluded sectors are filtered correctly
- [ ] Ratios API returns valid data for sample stocks
- [ ] Value filters produce 80-120 companies
- [ ] No duplicate symbols in output
- [ ] All required fields populated
- [ ] Output file/sheet created successfully
- [ ] Error handling prevents workflow crashes
- [ ] Rate limiting stays within API quota

---

## 8. Sample Test Run

### Test with 5 Stocks First
```javascript
// Add this filter before batching
const testSymbols = ['AAPL', 'MSFT', 'GOOGL', 'JNJ', 'PG'];
const testMode = true;

if (testMode) {
  return items.filter(i => testSymbols.includes(i.json.symbol));
}
```

### Expected Results for Test Stocks
| Symbol | Expected P/E | Expected ROE | Pass Filter? |
|--------|-------------|--------------|--------------|
| AAPL | ~28 | ~147% | No (P/E too high) |
| MSFT | ~35 | ~38% | No (P/E too high) |
| JNJ | ~15 | ~20% | Maybe |
| PG | ~25 | ~32% | No (P/E too high) |
