# Reasonex Core API & n8n Nodes

## Documentation

A proprietary scoring, validation, and analysis engine with custom n8n nodes for workflow automation.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Core API Reference](#core-api-reference)
   - [Health Check](#health-check)
   - [Lock Endpoint](#lock-endpoint)
   - [Score Endpoint](#score-endpoint)
   - [Validate Endpoint](#validate-endpoint)
   - [Tree Endpoint](#tree-endpoint)
   - [Detect Endpoint](#detect-endpoint)
   - [Route Endpoint](#route-endpoint)
5. [n8n Nodes Reference](#n8n-nodes-reference)
   - [Reasonex Lock](#reasonex-lock-node)
   - [Reasonex Rule Engine](#reasonex-rule-engine-node)
   - [Reasonex Validation](#reasonex-validation-node)
   - [Reasonex Tree Builder](#reasonex-tree-builder-node)
   - [Reasonex Change Detector](#reasonex-change-detector-node)
   - [Reasonex Review Router](#reasonex-review-router-node)
   - [Reasonex Explanation](#reasonex-explanation-node)
6. [Installation](#installation)
7. [Configuration](#configuration)
8. [Rule Sets](#rule-sets)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Reasonex is a hybrid system consisting of:

- **Core API**: Express.js backend deployed on Railway that handles scoring algorithms, validation logic, and data processing
- **n8n Nodes**: 7 custom nodes for n8n workflow automation that communicate with the Core API

### Key Features

- **Data Locking**: Cryptographic hashing (SHA-256, SHA3-256, SHA-512) for data immutability
- **Rule-Based Scoring**: Configurable rule sets for multi-dimensional scoring
- **5-Check Validation**: Schema, coverage, sources, hallucination, and rules validation
- **AI-Powered Analysis**: LLM integration for structured data extraction
- **Change Detection**: Deep diff with materiality assessment
- **Tiered Review Routing**: Automatic routing based on impact and confidence
- **Explanation Generation**: Human-readable explanations for any audience

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         n8n Workflows                           │
│                    (Visual Workflow Editor)                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                  @reasonex/n8n-nodes (NPM)                      │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │  Lock   │ │  Rule   │ │Validate │ │  Tree   │              │
│  │  Node   │ │ Engine  │ │  Node   │ │ Builder │              │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘              │
│       │           │           │           │                    │
│  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐                          │
│  │ Change  │ │ Review  │ │  Explan │                          │
│  │Detector │ │ Router  │ │ ation   │                          │
│  └────┬────┘ └────┬────┘ └────┬────┘                          │
└───────┼───────────┼───────────┼─────────────────────────────────┘
        │           │           │
        └───────────┼───────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              Reasonex Core API (Railway)                        │
│              https://reasonex-core-api-production.up.railway.app│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      Express.js                          │   │
│  │  /api/v1/lock  /api/v1/score  /api/v1/validate          │   │
│  │  /api/v1/tree  /api/v1/detect /api/v1/route             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│  │   Lock    │ │   Rule    │ │ Validator │ │   Tree    │      │
│  │  Manager  │ │  Engine   │ │           │ │  Builder  │      │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                    │
│  │  Change   │ │   Tier    │ │Explanation│                    │
│  │ Detector  │ │  Router   │ │ Generator │                    │
│  └───────────┘ └───────────┘ └───────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Test the API

```bash
# Check API is running
curl https://reasonex-core-api-production.up.railway.app/

# Health check
curl https://reasonex-core-api-production.up.railway.app/health

# Score some data
curl -X POST https://reasonex-core-api-production.up.railway.app/api/v1/score \
  -H "Content-Type: application/json" \
  -d '{"data": {"peRatio": 12, "roe": 20}, "ruleSetId": "investment-v1"}'
```

### Install n8n Nodes

```bash
cd /home/amee/ValueInvest/packages/reasonex-n8n-nodes
npm link

mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm link @reasonex/n8n-nodes

# Restart n8n
```

---

## Core API Reference

**Base URL**: `https://reasonex-core-api-production.up.railway.app`

### Health Check

Check if the API is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "service": "reasonex-core-api",
  "version": "1.0.0",
  "timestamp": "2026-01-16T06:24:10.789Z",
  "uptime": 1364.38
}
```

---

### Lock Endpoint

Create cryptographic locks for data immutability or verify existing locks.

**Endpoint**: `POST /api/v1/lock`

#### Create Lock

**Request**:
```json
{
  "data": {
    "ticker": "AAPL",
    "score": 85,
    "analysis": { ... }
  },
  "options": {
    "algorithm": "SHA256",
    "includeTimestamp": true,
    "canonicalization": "strict",
    "schemaId": "company-analysis-v1"
  }
}
```

**Options**:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `algorithm` | string | `"SHA256"` | Hash algorithm: `SHA256`, `SHA3-256`, `SHA512` |
| `includeTimestamp` | boolean | `true` | Include timestamp in hash calculation |
| `canonicalization` | string | `"strict"` | JSON serialization mode: `strict`, `relaxed` |
| `schemaId` | string | `null` | Optional schema identifier |

**Response**:
```json
{
  "success": true,
  "result": {
    "locked_data": { ... },
    "data_hash": "372cfa5847c619bb42be46b95eb8051bdf2de33d3176f6a07eb86ba9d0f6b991",
    "lock_timestamp": "2026-01-16T06:09:18.966Z",
    "lock_id": "1e4bbbd0-ada8-4f77-8723-918dcd5b1220",
    "algorithm": "SHA256",
    "canonicalization": "strict"
  },
  "traceId": "a79a1cbf-b040-488b-94ad-4ca2aefae595"
}
```

#### Verify Lock

**Request**:
```json
{
  "data": { ... },
  "hash": "372cfa5847c619bb...",
  "timestamp": "2026-01-16T06:09:18.966Z",
  "verify": true
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "valid": true,
    "computed_hash": "372cfa5847c619bb...",
    "expected_hash": "372cfa5847c619bb...",
    "match": true
  }
}
```

---

### Score Endpoint

Score data using configurable rule sets.

**Endpoint**: `POST /api/v1/score`

**Request**:
```json
{
  "data": {
    "peRatio": 12,
    "pbRatio": 1.2,
    "evEbitda": 8,
    "pFcf": 15,
    "roe": 22,
    "roic": 18,
    "netMargin": 15,
    "debtEquity": 0.4,
    "interestCoverage": 12,
    "revenueGrowth": 8,
    "epsGrowth": 10,
    "fcfGrowth": 7,
    "dividendYield": 3.2,
    "payoutRatio": 0.35,
    "moatScore": 7
  },
  "ruleSetId": "investment-v1",
  "context": {
    "vertical": "investment"
  }
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "ruleSetId": "investment-v1",
    "ruleSetName": "Value Investment Scoring",
    "vertical": "investment",
    "timestamp": "2026-01-16T06:09:31.118Z",
    "scores": {
      "dimensions": [
        {
          "dimensionId": "valuation",
          "dimensionName": "Valuation",
          "weight": 0.3,
          "maxScore": 30,
          "rawScore": 7.02,
          "weightedScore": 2.1,
          "ruleExecutions": [
            {
              "ruleId": "pe-ratio",
              "field": "peRatio",
              "inputValue": 12,
              "operator": "lt",
              "targetValue": 25,
              "passed": true,
              "rawScore": 6.4,
              "explanation": "peRatio=12 lt 25 -> score: 6.40/12"
            }
          ],
          "explanation": "Valuation: 7.02/30 (4/4 rules passed)"
        }
      ],
      "total": 49.38,
      "maxPossible": 100,
      "percentage": 49.38
    },
    "classification": "Consider",
    "recommendation": "Potential value - warrants deeper analysis",
    "explanation": "Total Score: 49.38/100 (49.4%)\nClassification: Consider\n..."
  },
  "traceId": "67b11c1e-6a13-4378-8940-02a7a9ae5b1d"
}
```

**Available Rule Sets**:
| Rule Set ID | Description |
|-------------|-------------|
| `investment-v1` | Value investment scoring with 5 dimensions |

**Scoring Dimensions (investment-v1)**:
| Dimension | Weight | Max Score | Fields |
|-----------|--------|-----------|--------|
| Valuation | 30% | 30 | peRatio, pbRatio, evEbitda, pFcf |
| Quality | 25% | 25 | roe, roic, netMargin, debtEquity, interestCoverage |
| Growth | 20% | 20 | revenueGrowth, epsGrowth, fcfGrowth |
| Dividend | 15% | 15 | dividendYield, payoutRatio |
| Moat | 10% | 10 | moatScore |

**Classification Thresholds**:
| Score Range | Classification | Recommendation |
|-------------|----------------|----------------|
| 80-100 | Strong Buy | Excellent value metrics |
| 65-79 | Buy | Good value metrics |
| 50-64 | Consider | Potential value - warrants deeper analysis |
| 35-49 | Hold | Mixed signals - monitor closely |
| 0-34 | Avoid | Poor value metrics |

---

### Validate Endpoint

Validate analysis data using the 5-check framework.

**Endpoint**: `POST /api/v1/validate`

**Request**:
```json
{
  "analysis": {
    "ticker": "AAPL",
    "companyName": "Apple Inc.",
    "industry": "Technology",
    "peRatio": 25.5,
    "revenue": 394328000000
  },
  "options": {
    "sources": [
      {
        "type": "10-K",
        "url": "https://...",
        "date": "2024-01-15"
      }
    ],
    "scores": {
      "total": 72,
      "dimensions": { ... }
    },
    "profile": "financial-strict",
    "checks": ["schema", "coverage", "sources", "hallucination", "rules"],
    "strictness": "normal",
    "hallucinationSensitivity": "medium"
  }
}
```

**Validation Checks**:
| Check | Description |
|-------|-------------|
| `schema` | JSON Schema validation |
| `coverage` | Required fields present |
| `sources` | Data traceable to sources |
| `hallucination` | AI output plausibility |
| `rules` | Scores within valid ranges |

**Response**:
```json
{
  "success": true,
  "result": {
    "status": "PASS",
    "checks": [
      {
        "checkType": "schema",
        "passed": true,
        "score": 1,
        "issues": [],
        "duration_ms": 2
      },
      {
        "checkType": "coverage",
        "passed": true,
        "score": 0.95,
        "issues": [],
        "details": {
          "requiredFields": ["ticker", "companyName"],
          "missingFields": [],
          "coverageRatio": 1
        }
      },
      {
        "checkType": "hallucination",
        "passed": true,
        "score": 0.92,
        "issues": [
          {
            "severity": "warning",
            "code": "UNUSUAL_VALUE",
            "message": "peRatio value 25.5 is unusually high"
          }
        ]
      }
    ],
    "issues": [],
    "confidence": 0.96,
    "timestamp": "2026-01-16T06:09:31.806Z",
    "summary": "PASS: 5/5 checks passed, confidence: 96.0%"
  }
}
```

**Status Values**:
| Status | Description |
|--------|-------------|
| `PASS` | All checks passed |
| `FLAG` | Some warnings, review recommended |
| `FAIL` | Critical issues found |

---

### Tree Endpoint

Build structured analysis trees using AI (LLM).

**Endpoint**: `POST /api/v1/tree`

**Request**:
```json
{
  "entity": {
    "ticker": "AAPL",
    "companyName": "Apple Inc."
  },
  "documents": [
    {
      "type": "10-K",
      "content": "Annual report text...",
      "url": "https://..."
    }
  ],
  "schema": "company-6d",
  "llmConfig": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "temperature": 0.3
  }
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "tree": {
      "entity": { ... },
      "sections": [
        {
          "id": "business_model",
          "name": "Business Model",
          "content": { ... },
          "confidence": 0.92,
          "sources": ["10-K page 5"]
        }
      ]
    },
    "metadata": {
      "schema": "company-6d",
      "llmProvider": "openai",
      "llmModel": "gpt-4o-mini",
      "tokensUsed": 1250,
      "processingTime_ms": 3200
    }
  }
}
```

**Note**: Requires `OPENAI_API_KEY` environment variable on the server.

---

### Detect Endpoint

Detect and assess changes between data versions.

**Endpoint**: `POST /api/v1/detect`

**Request**:
```json
{
  "oldVersion": {
    "score": 75,
    "classification": "Consider",
    "peRatio": 18,
    "roe": 15
  },
  "newVersion": {
    "score": 85,
    "classification": "Buy",
    "peRatio": 14,
    "roe": 18
  },
  "options": {
    "materialityConfig": {
      "highImpactFields": ["score", "classification", "recommendation"],
      "numericTolerance": 1,
      "ignoreFields": ["timestamp", "lastUpdated"]
    },
    "comparisonDepth": "deep"
  }
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "changes": [
      {
        "path": "score",
        "changeType": "modified",
        "oldValue": 75,
        "newValue": 85,
        "impact": 0.2,
        "description": "score: changed from 75 to 85"
      },
      {
        "path": "classification",
        "changeType": "modified",
        "oldValue": "Consider",
        "newValue": "Buy",
        "impact": 1,
        "description": "classification: changed - HIGH IMPACT"
      }
    ],
    "impactScore": 60,
    "materiality": "HIGH",
    "affectedPaths": ["score", "classification", "peRatio", "roe"],
    "summary": "4 changes detected (HIGH materiality)",
    "timestamp": "2026-01-16T06:09:32.340Z"
  }
}
```

**Materiality Levels**:
| Level | Impact Score | Description |
|-------|--------------|-------------|
| HIGH | 50-100 | Significant changes requiring review |
| MEDIUM | 20-49 | Notable changes |
| LOW | 0-19 | Minor changes |

---

### Route Endpoint

Route changes to appropriate review tiers.

**Endpoint**: `POST /api/v1/route`

**Request**:
```json
{
  "change": {
    "impactScore": 60,
    "materiality": "HIGH",
    "changesCount": 4,
    "affectedPaths": ["score", "classification"]
  },
  "context": {
    "urgency": "normal",
    "clientTier": "standard",
    "vertical": "investment",
    "confidence": 0.85
  }
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "tier": 3,
    "tierConfig": {
      "tier": 3,
      "name": "Senior Review",
      "description": "Significant changes requiring senior analyst review",
      "slaHours": 24,
      "autoApproveEligible": false,
      "requiredReviewers": [
        { "role": "analyst", "level": "senior" }
      ],
      "notificationChannel": "email"
    },
    "reviewers": [
      { "role": "analyst", "level": "senior" }
    ],
    "channel": "email",
    "slaHours": 24,
    "autoApprove": false,
    "reasoning": [
      "High materiality (HIGH) or impact (60)"
    ],
    "timestamp": "2026-01-16T06:09:40.087Z"
  }
}
```

**Review Tiers**:
| Tier | Name | SLA | Auto-Approve | Description |
|------|------|-----|--------------|-------------|
| 1 | Auto-Approve | 0h | Yes | Low impact, high confidence |
| 2 | Standard Review | 8h | No | Normal changes |
| 3 | Senior Review | 24h | No | Significant changes |
| 4 | Exception Handling | 72h | No | Critical changes |

---

## n8n Nodes Reference

### Reasonex Lock Node

Create and verify cryptographic data locks.

**Operations**:
- **Create Lock**: Hash data for immutability
- **Verify Lock**: Verify data against existing hash

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| Data | JSON | The data to lock |
| Hash Algorithm | Select | SHA-256, SHA3-256, SHA-512 |
| Include Timestamp | Boolean | Include timestamp in hash |
| Canonicalization | Select | Strict or Relaxed |
| Schema ID | String | Optional schema identifier |
| Debug Mode | Boolean | Enable detailed logging |

**Output**:
```json
{
  "locked_data": { ... },
  "data_hash": "abc123...",
  "lock_timestamp": "2026-01-16T...",
  "lock_id": "uuid-here"
}
```

---

### Reasonex Rule Engine Node

Score data using configurable rule sets.

**Operations**:
- **Score**: Score single item
- **Batch Score**: Score multiple items
- **Get Rule Sets**: List available rule sets

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| Data | JSON | The data to score |
| Rule Set ID | Select | investment-v1, legal-costs-v1, custom |
| Context | JSON | Additional scoring context |
| Return Explanation | Boolean | Include human-readable explanation |
| Debug Mode | Boolean | Include detailed breakdown |

**Output**:
```json
{
  "scores": {
    "dimensions": [...],
    "total": 72.5,
    "percentage": 72.5
  },
  "classification": "Buy",
  "recommendation": "Good value metrics",
  "explanation": "..."
}
```

---

### Reasonex Validation Node

Validate data with the 5-check framework.

**Operations**:
- **Validate**: Run validation checks
- **Get Profiles**: List validation profiles

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| Analysis Data | JSON | Data to validate |
| Validation Profile | Select | financial-strict, general, custom |
| Checks to Run | Multi-select | schema, coverage, sources, hallucination, rules |
| Strictness | Select | strict, normal, lenient |
| Hallucination Sensitivity | Select | high, medium, low |
| Source Documents | JSON | Source documents for verification |
| Scores | JSON | Scores from Rule Engine |

**Output**:
```json
{
  "status": "PASS",
  "checks": [...],
  "issues": [],
  "confidence": 0.95
}
```

---

### Reasonex Tree Builder Node

Build structured analysis trees using AI.

**Operations**:
- **Build Tree**: Generate analysis tree
- **Get Schemas**: List available schemas

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| Entity | JSON | Entity to analyze |
| Documents | JSON | Source documents |
| Schema | Select | company-6d, legal-cost-tree, custom |
| LLM Provider | Select | openai, anthropic |
| Model | Select | gpt-4o-mini, gpt-4o, claude-3-sonnet |
| Temperature | Number | 0-1, lower = more deterministic |

**Output**:
```json
{
  "tree": {
    "sections": [...],
    "confidence": 0.9
  },
  "metadata": {
    "tokensUsed": 1500
  }
}
```

---

### Reasonex Change Detector Node

Detect changes between data versions.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| Old Version | JSON | Previous version |
| New Version | JSON | Current version |
| Comparison Depth | Select | deep, shallow |
| High Impact Fields | String | Comma-separated field names |
| Numeric Tolerance (%) | Number | Tolerance for numeric changes |
| Ignore Fields | String | Fields to skip |

**Output**:
```json
{
  "changes": [...],
  "impactScore": 45,
  "materiality": "MEDIUM",
  "affectedPaths": ["field1", "field2"]
}
```

---

### Reasonex Review Router Node

Route changes to review tiers.

**Operations**:
- **Route**: Determine review tier
- **Get Tier Config**: Get tier configuration

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| Impact Score | Number | 0-100 impact score |
| Materiality | Select | HIGH, MEDIUM, LOW |
| Changes Count | Number | Number of changes |
| Affected Paths | String | Comma-separated paths |
| Urgency | Select | critical, high, normal, low |
| Client Tier | Select | enterprise, premium, standard, basic |
| Vertical | Select | investment, legal, healthcare, insurance |
| Confidence | Number | 0-1 confidence score |

**Output**:
```json
{
  "tier": 2,
  "tierConfig": { ... },
  "reviewers": [...],
  "slaHours": 8,
  "autoApprove": false
}
```

---

### Reasonex Explanation Node

Generate human-readable explanations.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| Scoring Result | JSON | Result from Rule Engine |
| Audience | Select | expert, professional, consumer |
| Verbosity | Select | brief, standard, detailed |
| Include Citations | Boolean | Include data citations |
| Language | Select | en (more coming) |

**Output**:
```json
{
  "summary": "Apple Inc. scores 72/100...",
  "sections": [
    {
      "title": "Valuation",
      "content": "The company shows attractive valuation..."
    }
  ],
  "recommendation": "Consider for portfolio",
  "caveats": ["Limited dividend history"]
}
```

---

## Installation

### Core API (Already Deployed)

The Core API is deployed at:
```
https://reasonex-core-api-production.up.railway.app
```

To deploy your own instance:

```bash
cd /home/amee/ValueInvest/packages/reasonex-core-api

# Install dependencies
npm install

# Build
npm run build

# Deploy to Railway
railway up --service reasonex-core-api
```

### n8n Nodes

```bash
# Build the nodes package
cd /home/amee/ValueInvest/packages/reasonex-n8n-nodes
npm install
npm run build

# Link to n8n
npm link
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm link @reasonex/n8n-nodes

# Restart n8n
systemctl restart n8n
# OR
n8n start
```

### Configure Credentials in n8n

1. Open n8n UI
2. Go to **Credentials** → **Add Credential**
3. Search for **Reasonex API**
4. Enter:
   - **API Base URL**: `https://reasonex-core-api-production.up.railway.app`
   - **API Key**: Your API key (use `test-key` for testing)
   - **OpenAI API Key**: (Optional) For Tree Builder node

---

## Configuration

### Environment Variables (Core API)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment |
| `LOG_LEVEL` | info | Logging level |
| `CORS_ORIGIN` | * | CORS origin |
| `OPENAI_API_KEY` | - | For Tree Builder |
| `ANTHROPIC_API_KEY` | - | For Tree Builder (alternative) |

### Debug Mode

All nodes support a **Debug Mode** toggle that:
- Enables detailed logging
- Includes calculation breakdowns
- Adds timing for sub-operations
- Returns debug info in output

---

## Rule Sets

### investment-v1

Value investment scoring based on fundamental analysis.

**Dimensions**:

#### Valuation (30%)
| Rule | Field | Operator | Target | Max Score |
|------|-------|----------|--------|-----------|
| P/E Ratio | peRatio | < | 25 | 12 |
| P/B Ratio | pbRatio | < | 5 | 12 |
| EV/EBITDA | evEbitda | < | 20 | 12 |
| P/FCF | pFcf | < | 25 | 12 |

#### Quality (25%)
| Rule | Field | Operator | Target | Max Score |
|------|-------|----------|--------|-----------|
| ROE | roe | > | 0 | 12 |
| ROIC | roic | > | 0 | 12 |
| Net Margin | netMargin | > | 0 | 12 |
| Debt/Equity | debtEquity | < | 2 | 12 |
| Interest Coverage | interestCoverage | > | 2 | 12 |

#### Growth (20%)
| Rule | Field | Operator | Target | Max Score |
|------|-------|----------|--------|-----------|
| Revenue Growth | revenueGrowth | > | 0 | 12 |
| EPS Growth | epsGrowth | > | 0 | 12 |
| FCF Growth | fcfGrowth | > | 0 | 12 |

#### Dividend (15%)
| Rule | Field | Operator | Target | Max Score |
|------|-------|----------|--------|-----------|
| Dividend Yield | dividendYield | > | 0 | 12 |
| Payout Ratio | payoutRatio | between | [0.2, 0.6] | 12 |

#### Moat (10%)
| Rule | Field | Operator | Target | Max Score |
|------|-------|----------|--------|-----------|
| Moat Score | moatScore | >= | 0 | 10 |

---

## Examples

### Example 1: Score a Stock

```bash
curl -X POST https://reasonex-core-api-production.up.railway.app/api/v1/score \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "peRatio": 15,
      "pbRatio": 2.0,
      "evEbitda": 10,
      "pFcf": 18,
      "roe": 20,
      "roic": 15,
      "netMargin": 12,
      "debtEquity": 0.5,
      "interestCoverage": 8,
      "revenueGrowth": 10,
      "epsGrowth": 12,
      "fcfGrowth": 8,
      "dividendYield": 2.5,
      "payoutRatio": 0.4,
      "moatScore": 6
    },
    "ruleSetId": "investment-v1"
  }'
```

### Example 2: Detect Changes After Re-analysis

```bash
curl -X POST https://reasonex-core-api-production.up.railway.app/api/v1/detect \
  -H "Content-Type: application/json" \
  -d '{
    "oldVersion": {
      "ticker": "MSFT",
      "score": 68,
      "classification": "Consider",
      "peRatio": 32
    },
    "newVersion": {
      "ticker": "MSFT",
      "score": 74,
      "classification": "Buy",
      "peRatio": 28
    }
  }'
```

### Example 3: Full Workflow in n8n

1. **HTTP Request** → Fetch stock data from API
2. **Reasonex Lock** → Lock the raw data
3. **Reasonex Rule Engine** → Score the data
4. **Reasonex Validation** → Validate the analysis
5. **Reasonex Change Detector** → Compare with previous version
6. **Reasonex Review Router** → Determine review tier
7. **Reasonex Explanation** → Generate report
8. **Send Email** → Notify reviewers

---

## Troubleshooting

### API Returns 404

The root URL `/` now shows API info. Make sure you're using the correct endpoint paths like `/api/v1/score`.

### n8n Nodes Not Appearing

1. Ensure the build completed: `npm run build`
2. Check the link: `npm link`
3. Verify custom directory: `ls ~/.n8n/custom/node_modules`
4. Restart n8n completely

### Scoring Returns Low Scores

Check field names match exactly (camelCase):
- ✅ `peRatio` (correct)
- ❌ `pe_ratio` (incorrect)
- ❌ `PE_Ratio` (incorrect)

### Tree Builder Fails

Ensure `OPENAI_API_KEY` is set in Railway environment variables.

### Debug Mode

Enable Debug Mode on any node to see detailed logs in the n8n execution panel.

---

## File Structure

```
/home/amee/ValueInvest/packages/
├── reasonex-core-api/           # Railway API
│   ├── src/
│   │   ├── index.ts             # Express app
│   │   ├── routes/              # API endpoints
│   │   │   ├── lock.ts
│   │   │   ├── score.ts
│   │   │   ├── validate.ts
│   │   │   ├── tree.ts
│   │   │   ├── detect.ts
│   │   │   └── route.ts
│   │   ├── engines/             # Core logic
│   │   │   ├── lock-manager.ts
│   │   │   ├── rule-engine.ts
│   │   │   ├── validator.ts
│   │   │   ├── tree-builder.ts
│   │   │   ├── change-detector.ts
│   │   │   ├── tier-router.ts
│   │   │   └── explanation-generator.ts
│   │   ├── config/
│   │   │   └── rule-sets/
│   │   │       └── investment-v1.json
│   │   └── lib/
│   │       ├── logger.ts
│   │       └── tracer.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── test-api.sh
│
└── reasonex-n8n-nodes/          # n8n nodes package
    ├── nodes/
    │   ├── ReasonexLock/
    │   ├── ReasonexRuleEngine/
    │   ├── ReasonexValidation/
    │   ├── ReasonexTreeBuilder/
    │   ├── ReasonexChangeDetector/
    │   ├── ReasonexReviewRouter/
    │   └── ReasonexExplanation/
    ├── credentials/
    │   └── ReasonexApi.credentials.ts
    ├── lib/
    │   ├── logger.ts
    │   └── api-client.ts
    ├── package.json
    └── tsconfig.json
```

---

## Support

- **API Health**: https://reasonex-core-api-production.up.railway.app/health
- **Test Script**: `/home/amee/ValueInvest/packages/reasonex-core-api/test-api.sh`

---

*Documentation generated for Reasonex Core API v1.0.0*
