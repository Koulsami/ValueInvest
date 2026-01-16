# Reasonex Proprietary n8n Nodes Specification

**Document Purpose:** Technical specification for converting Python microservices into proprietary n8n nodes  
**Audience:** Solution Architect  
**Date:** January 2026  
**Status:** For Review

---

## Executive Summary

This document outlines the strategy to convert Reasonex's Python microservices into proprietary n8n nodes. This approach:

1. **Protects IP** - Core algorithms hidden in compiled/obfuscated nodes
2. **Enables Reuse** - Same nodes work across verticals (Legal, Healthcare, Insurance, Finance)
3. **Simplifies Deployment** - Single n8n package instead of multiple microservices
4. **Creates Product** - Licensable node package for enterprise customers

---

## Current vs Proposed Architecture

### Current State

```
┌─────────────────────────────────────────────────────────────────┐
│                         n8n WORKFLOWS                           │
│  (Standard nodes: HTTP, Postgres, S3, Slack, Code blocks)       │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP calls
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PYTHON MICROSERVICES                         │
│  • Rule Engine (scoring logic, thresholds)                      │
│  • Validator (5 checks, hallucination detection)                │
│  • Lock Manager (hashing, immutability)                         │
│  • LLM Worker (prompts, tree creation)                          │
│  • KB Updater (change detection, routing)                       │
└─────────────────────────────────────────────────────────────────┘
```

### Proposed State

```
┌─────────────────────────────────────────────────────────────────┐
│                         n8n WORKFLOWS                           │
│  Standard nodes + PROPRIETARY REASONEX NODES                    │
│  (All IP hidden inside compiled/obfuscated nodes)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Proprietary Node Specifications

### Node 1: Reasonex Lock Node 🔒

**Source Python:** `lock_manager.py`

#### Core IP Protected
- Hash algorithm selection and configuration
- Canonical serialization method
- Tamper detection logic
- Immutability enforcement

#### Cross-Vertical Applications
| Vertical | Use Case |
|----------|----------|
| Investment | Lock extracted financial facts |
| Legal | Lock case facts and cost calculations |
| Healthcare | Lock diagnoses and treatment plans |
| Insurance | Lock claim assessments |

#### Node Interface

**Inputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | JSON | Object to lock |
| `schema_id` | String | Optional schema reference |
| `metadata` | JSON | Additional context |

**Outputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `locked_data` | JSON | Original data with lock metadata |
| `data_hash` | String | SHA256 hash |
| `lock_timestamp` | ISO DateTime | When locked |
| `lock_id` | UUID | Unique identifier |

**Settings:**
| Setting | Options | Default |
|---------|---------|---------|
| Hash Algorithm | SHA256 / SHA3-256 / BLAKE3 | SHA256 |
| Include Timestamp in Hash | Yes / No | Yes |
| Canonical Serialization | Strict / Relaxed | Strict |

---

### Node 2: Reasonex Rule Engine Node ⚙️

**Source Python:** `rule_engine.py`, `rules/*.py`

#### Core IP Protected
- Rule execution framework
- Threshold evaluation logic
- Score aggregation algorithms
- Weight system and configuration
- Recommendation determination

#### Cross-Vertical Applications
| Vertical | Use Case |
|----------|----------|
| Investment | Financial scoring, moat analysis |
| Legal | Cost calculations, deadline rules |
| Healthcare | Dosing rules, protocol compliance |
| Insurance | Risk scoring, coverage determination |

#### Node Interface

**Inputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `locked_data` | JSON | Locked facts from Lock Node |
| `rule_set_id` | String | Which rules to apply |
| `context` | JSON | Additional context (jurisdiction, specialty) |

**Outputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `scores` | JSON | Dimension scores object |
| `overall_score` | Number | Aggregated score (0-100) |
| `recommendation` | String | Classification result |
| `rule_executions` | Array | Detailed log of each rule |
| `explanation` | String | Human-readable summary |

**Settings:**
| Setting | Options | Default |
|---------|---------|---------|
| Rule Set | Dropdown of configured sets | - |
| Aggregation Method | Weighted Average / Max / Custom | Weighted Average |
| Return Explanation | Yes / No | Yes |
| Strict Mode | Fail on missing / Use defaults | Use defaults |

---

### Node 3: Reasonex Validation Firewall Node 🛡️

**Source Python:** `validator.py`, `checks/*.py`

#### Core IP Protected
- 5-check validation framework
- Hallucination detection algorithms
- Plausibility check logic
- Source verification methods
- Schema validation rules

#### Cross-Vertical Applications
| Vertical | Use Case |
|----------|----------|
| Investment | Verify financial data accuracy |
| Legal | Verify case citations and precedents |
| Healthcare | Verify drug interactions, contraindications |
| Insurance | Verify claim facts against documentation |

#### Node Interface

**Inputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `analysis` | JSON | Analysis to validate |
| `source_documents` | Array | Original source documents |
| `scores` | JSON | Calculated scores (for rule verification) |
| `validation_profile` | String | Which checks to run |

**Outputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | Enum | PASS / FLAG / FAIL |
| `checks` | Array | Individual check results |
| `issues` | Array | Detected issues |
| `confidence` | Number | Overall confidence score |

**Settings:**
| Setting | Options | Default |
|---------|---------|---------|
| Checks to Run | Multi-select: Schema, Coverage, Sources, Hallucination, Rules | All |
| Strictness | Strict / Normal / Lenient | Normal |
| Hallucination Sensitivity | High / Medium / Low | Medium |
| Source Verification Depth | Sample / Full | Sample |

---

### Node 4: Reasonex Tree Builder Node 🌳

**Source Python:** `llm_worker.py`, `tree_builder.py`, `prompts.py`

#### Core IP Protected
- 6D structure methodology
- Guidance framework
- Prompt engineering templates
- Adaptive tree generation logic
- Schema enforcement

#### Cross-Vertical Applications
| Vertical | Use Case |
|----------|----------|
| Investment | Company analysis trees |
| Legal | Case analysis trees, cost breakdowns |
| Healthcare | Patient assessment trees |
| Insurance | Claim evaluation trees |

#### Node Interface

**Inputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `entity` | JSON | Entity to analyze |
| `documents` | Array | Source documents |
| `context_data` | JSON | Additional context |
| `schema` | String | Output schema/template ID |

**Outputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `tree` | JSON | Complete analysis tree |
| `metadata` | JSON | LLM usage stats |
| `coverage_report` | JSON | What was/wasn't covered |
| `confidence_map` | JSON | Confidence by section |

**Settings:**
| Setting | Options | Default |
|---------|---------|---------|
| LLM Provider | Claude / GPT-4 / Custom | Claude |
| Model | Provider-specific dropdown | claude-sonnet-4-20250514 |
| Schema | Dropdown of configured schemas | - |
| Guidance Profile | Dropdown | Default |
| Max Retries | 1-5 | 3 |
| Temperature | 0-1 | 0 |

---

### Node 5: Reasonex Change Detector Node 🔍

**Source Python:** `kb_updater.py`, `change_detector.py`

#### Core IP Protected
- Diff algorithms for structured data
- Impact calculation methodology
- Materiality threshold logic
- Change categorization rules

#### Cross-Vertical Applications
| Vertical | Use Case |
|----------|----------|
| Investment | Detect earnings updates, filing changes |
| Legal | Detect case updates, precedent changes |
| Healthcare | Detect condition changes, lab result updates |
| Insurance | Detect claim amendments, new evidence |

#### Node Interface

**Inputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `old_version` | JSON | Previous analysis/assessment |
| `new_version` | JSON | New analysis/assessment |
| `materiality_config` | JSON | What constitutes significant change |

**Outputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `changes` | Array | Detected changes |
| `impact_score` | Number | Overall impact score |
| `materiality` | Enum | HIGH / MEDIUM / LOW |
| `affected_paths` | Array | Which data paths changed |

**Settings:**
| Setting | Options | Default |
|---------|---------|---------|
| Comparison Depth | Shallow / Deep | Deep |
| Numeric Tolerance | Percentage (0-100) | 1% |
| Ignore Fields | Comma-separated list | - |

---

### Node 6: Reasonex Review Router Node 📋

**Source Python:** `tier_router.py`

#### Core IP Protected
- Tiering logic and thresholds
- Escalation rules
- Auto-approval criteria
- SLA determination

#### Cross-Vertical Applications
| Vertical | Use Case |
|----------|----------|
| Investment | Route to junior/senior analysts |
| Legal | Route to junior/senior lawyers |
| Healthcare | Route to nurses/physicians/specialists |
| Insurance | Route to adjusters/managers/underwriters |

#### Node Interface

**Inputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `change` | JSON | Change record from Change Detector |
| `context` | JSON | Additional context (urgency, client tier) |

**Outputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `tier` | Number | 1-4 (Auto / Standard / Senior / Exception) |
| `reviewers` | Array | Suggested reviewers |
| `channel` | String | Notification channel |
| `sla_hours` | Number | Expected review time |
| `auto_approve` | Boolean | Whether to auto-approve |

**Settings:**
| Setting | Options | Default |
|---------|---------|---------|
| Tier Configuration | JSON config | - |
| Auto-Approve Rules | Configurable rules | - |
| Escalation Rules | Configurable rules | - |

---

### Node 7: Reasonex Explanation Generator Node 💬

**Source Python:** Part of `rule_engine.py`

#### Core IP Protected
- Natural language explanation templates
- Reasoning chain construction
- Audience-appropriate language adjustment
- Citation formatting

#### Cross-Vertical Applications
| Vertical | Use Case |
|----------|----------|
| Investment | Explain investment recommendations |
| Legal | Explain cost calculations to clients |
| Healthcare | Explain treatment recommendations |
| Insurance | Explain coverage decisions |

#### Node Interface

**Inputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `rule_executions` | Array | From Rule Engine |
| `scores` | JSON | Dimension and overall scores |
| `recommendation` | String | Final recommendation |
| `audience` | String | Target audience level |

**Outputs:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `summary` | String | One-paragraph summary |
| `key_factors` | Array | Top 3-5 factors |
| `detailed_explanation` | String | Full explanation |
| `citations` | Array | Supporting evidence |

**Settings:**
| Setting | Options | Default |
|---------|---------|---------|
| Verbosity | Brief / Standard / Detailed | Standard |
| Audience | Expert / Professional / Consumer | Professional |
| Include Citations | Yes / No | Yes |
| Language | English / Other | English |

---

## Node Portfolio Summary

| Node | Core IP Protected | Cross-Vertical Value | Priority |
|------|-------------------|---------------------|----------|
| **Lock Node** | Hashing, immutability | ⭐⭐⭐⭐⭐ | Phase 1 |
| **Rule Engine Node** | Scoring framework | ⭐⭐⭐⭐⭐ | Phase 1 |
| **Validation Firewall Node** | Hallucination detection | ⭐⭐⭐⭐⭐ | Phase 1 |
| **Tree Builder Node** | 6D structure, prompts | ⭐⭐⭐⭐ | Phase 2 |
| **Change Detector Node** | Impact algorithms | ⭐⭐⭐⭐ | Phase 2 |
| **Review Router Node** | Tiering logic | ⭐⭐⭐ | Phase 3 |
| **Explanation Generator Node** | NLG templates | ⭐⭐⭐ | Phase 3 |

---

## Package Structure

```
@reasonex/n8n-nodes/
│
├── nodes/
│   ├── ReasonexLock/
│   │   ├── ReasonexLock.node.ts          # Node UI definition
│   │   ├── ReasonexLock.node.json        # Node metadata
│   │   └── lock.compiled.js              # Obfuscated core logic
│   │
│   ├── ReasonexRuleEngine/
│   │   ├── ReasonexRuleEngine.node.ts
│   │   ├── ReasonexRuleEngine.node.json
│   │   └── engine.compiled.js
│   │
│   ├── ReasonexValidation/
│   │   ├── ReasonexValidation.node.ts
│   │   ├── ReasonexValidation.node.json
│   │   └── validation.compiled.js
│   │
│   ├── ReasonexTreeBuilder/
│   │   ├── ReasonexTreeBuilder.node.ts
│   │   ├── ReasonexTreeBuilder.node.json
│   │   └── builder.compiled.js
│   │
│   ├── ReasonexChangeDetector/
│   │   ├── ReasonexChangeDetector.node.ts
│   │   ├── ReasonexChangeDetector.node.json
│   │   └── detector.compiled.js
│   │
│   ├── ReasonexReviewRouter/
│   │   ├── ReasonexReviewRouter.node.ts
│   │   ├── ReasonexReviewRouter.node.json
│   │   └── router.compiled.js
│   │
│   └── ReasonexExplanation/
│       ├── ReasonexExplanation.node.ts
│       ├── ReasonexExplanation.node.json
│       └── explanation.compiled.js
│
├── credentials/
│   └── ReasonexApi.credentials.ts        # License key validation
│
├── config/
│   ├── rule-sets/                        # Encrypted rule configurations
│   ├── schemas/                          # Tree schemas by vertical
│   └── validation-profiles/              # Validation configurations
│
└── package.json
```

---

## Vertical Configuration

The same nodes serve multiple verticals through configuration profiles:

| Vertical | Rule Set | Validation Profile | Tree Schema |
|----------|----------|-------------------|-------------|
| **Investment** | `investment-v1` | `financial-strict` | `company-6d` |
| **Legal (MyKraws)** | `sg-legal-costs-v1` | `legal-strict` | `legal-cost-tree` |
| **Healthcare** | `clinical-protocols-v1` | `medical-strict` | `patient-assessment` |
| **Insurance** | `claims-scoring-v1` | `claims-validation` | `claim-evaluation` |

### Example: Same Workflow, Different Configurations

**Legal Cost Calculation:**
```
[Documents] → [Tree Builder: legal-cost-tree] → [Lock] → [Rule Engine: sg-legal-costs-v1] → [Validation: legal-strict] → [Output]
```

**Investment Analysis:**
```
[Documents] → [Tree Builder: company-6d] → [Lock] → [Rule Engine: investment-v1] → [Validation: financial-strict] → [Output]
```

**Healthcare Assessment:**
```
[Documents] → [Tree Builder: patient-assessment] → [Lock] → [Rule Engine: clinical-protocols-v1] → [Validation: medical-strict] → [Output]
```

---

## IP Protection Techniques

| Technique | Application | Effectiveness |
|-----------|-------------|---------------|
| **JavaScript Obfuscation** | Core logic compiled and obfuscated using tools like javascript-obfuscator | High |
| **License Key Validation** | Nodes check license on every execution | High |
| **Server-Side Components** | Most sensitive logic executed via Reasonex API | Very High |
| **Encrypted Configuration** | Rule sets encrypted, decrypted at runtime with license key | High |
| **Time-Limited Tokens** | Evaluation licenses expire after trial period | Medium |
| **Code Signing** | Package signed to prevent tampering | Medium |

### Recommended Approach: Hybrid

```
┌─────────────────────────────────────────────────────────────────┐
│                      n8n NODE (Client-Side)                     │
│  • UI/UX logic (TypeScript)                                     │
│  • Input validation                                             │
│  • License check                                                │
│  • API call orchestration                                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Encrypted API calls
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   REASONEX CLOUD API (Server-Side)              │
│  • Core algorithms (never exposed)                              │
│  • Rule execution                                               │
│  • Hallucination detection                                      │
│  • Score calculation                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Core Nodes (Weeks 1-4)
**Nodes:** Lock, Rule Engine, Validation Firewall

**Rationale:** These contain the highest-value IP and are required for any vertical.

**Deliverables:**
- Three working n8n nodes
- License validation system
- Basic obfuscation

### Phase 2: Analysis Nodes (Weeks 5-8)
**Nodes:** Tree Builder, Change Detector

**Rationale:** Essential for automation and continuous operation.

**Deliverables:**
- Two additional nodes
- Multi-vertical schema support
- LLM provider abstraction

### Phase 3: Workflow Nodes (Weeks 9-12)
**Nodes:** Review Router, Explanation Generator

**Rationale:** Nice-to-have for complete workflow automation.

**Deliverables:**
- Two additional nodes
- Slack/Teams integration templates
- Multi-language explanation support

---

## Technical Considerations

### n8n Node Development Requirements
- TypeScript for node definitions
- n8n-node-dev package for scaffolding
- Testing with n8n-nodes-base test utilities

### Python to JavaScript Conversion Options
1. **Rewrite in TypeScript** - Best performance, full control
2. **Pyodide** - Run Python in browser (larger bundle, slower)
3. **Server-side API** - Keep Python, expose via API (recommended for sensitive IP)

### Recommended: Hybrid Approach
- Simple logic (hashing, formatting): TypeScript
- Complex algorithms (hallucination detection, scoring): Server-side API
- Rule configurations: Encrypted JSON, decrypted with license key

---

## Next Steps

1. **Architect Review** - Review this specification and provide feedback
2. **Security Review** - Assess IP protection approach
3. **POC Development** - Build Lock Node as proof of concept
4. **License System Design** - Design license key infrastructure
5. **Cloud API Design** - Design server-side API for sensitive operations

---

## Appendix: Node Naming Conventions

All nodes follow the pattern: `Reasonex [Function] Node`

| Internal Name | Display Name | Icon |
|---------------|--------------|------|
| `ReasonexLock` | Reasonex Lock | 🔒 |
| `ReasonexRuleEngine` | Reasonex Rule Engine | ⚙️ |
| `ReasonexValidation` | Reasonex Validation | 🛡️ |
| `ReasonexTreeBuilder` | Reasonex Tree Builder | 🌳 |
| `ReasonexChangeDetector` | Reasonex Change Detector | 🔍 |
| `ReasonexReviewRouter` | Reasonex Review Router | 📋 |
| `ReasonexExplanation` | Reasonex Explanation | 💬 |

---

**Document End**
