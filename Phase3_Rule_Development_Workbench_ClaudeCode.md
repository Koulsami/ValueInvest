# PHASE 3: Rule Development Workbench

## Implementation Prompt for Claude Code

---

**Document Type:** Implementation Specification  
**Phase:** 3 of 4  
**Prerequisites:** Phase 1 (Database) and Phase 2 (Runtime API) must be complete  
**Primary Technology:** Google Gemini Files API with Grounding

---

## 1. WHAT YOU ARE BUILDING

Build a Rule Development Workbench that helps domain experts create rule configurations for new verticals (healthcare, insurance, telecom) by using RAG-powered research on uploaded domain documents.

The workbench does NOT replace the runtime system. It produces YAML configuration files that the runtime system consumes. Think of it as a "rule authoring tool" that outputs configuration, not a system that executes rules.

**Key Insight:** The runtime system (Phase 2) applies pre-defined rules. This workbench helps experts DEFINE those rules by researching source documents.

---

## 2. THE PROBLEM THIS SOLVES

Currently, creating a rule set for a new vertical requires:

1. An expert manually reads hundreds of pages of regulations, guidelines, and precedents
2. The expert identifies thresholds, conditions, and exceptions
3. The expert manually writes YAML rule definitions
4. The expert creates test cases and validates rules
5. This process takes 4-6 weeks per vertical

With this workbench:

1. Expert uploads documents to Gemini
2. Expert asks natural language questions, gets cited answers
3. Workbench generates draft rule definitions from research findings
4. Expert reviews, edits, and validates
5. Process reduced to 1 week per vertical

---

## 3. CORE CONCEPT

The workbench has four stages that execute sequentially:

**Stage 1 - Ingest:** Upload domain documents to Gemini Files API. Gemini automatically chunks, embeds, and indexes them. Store file URIs for later queries.

**Stage 2 - Research:** Expert asks questions like "What are the cost thresholds for claims under $60,000?" Gemini searches the uploaded documents and returns answers with citations. Store research findings.

**Stage 3 - Define:** Convert research findings into structured rule definitions. Generate YAML rule configurations that match the format expected by the Phase 2 Rule Engine.

**Stage 4 - Validate:** Test the generated rules against known cases using the Phase 2 Runtime API. Iterate until all test cases pass.

**Output:** A production-ready YAML rule set file (e.g., `healthcare-v1.yaml`) that can be deployed to the runtime system.

---

## 4. TECHNOLOGY DECISIONS

**Document Storage and RAG:** Use Google Gemini Files API exclusively. Do not build custom chunking, embedding, or vector storage. Gemini handles all of this automatically when you upload files.

**LLM for Research:** Use Gemini 1.5 Pro with grounding enabled. When making generateContent calls, include the uploaded file URIs so Gemini searches them.

**Rule Validation:** Call the existing Phase 2 Runtime API endpoints. Do not duplicate the rule engine logic.

**Database:** Extend the existing PostgreSQL database from Phase 1. Add tables for research sessions, findings, draft rules, and test cases.

**API Framework:** Continue using FastAPI as established in Phase 2.

---

## 5. GEMINI FILES API INTEGRATION

### 5.1 Uploading Documents

When a user uploads a document, send it to the Gemini Files API. The API accepts PDFs, text files, and other document formats. After upload, Gemini returns a file URI that you store in your database.

The upload endpoint should accept multipart form data with the file and metadata (document name, vertical, document type). Call the Gemini Files API to upload, then store the returned URI along with your metadata.

Supported document types: PDF (primary), TXT, DOCX, HTML. Maximum file size follows Gemini's limits (currently 2GB per file).

### 5.2 Querying with Grounding

When the expert asks a research question, make a generateContent call to Gemini with:
- The user's question as the prompt
- The file URIs of all uploaded documents for this session
- A system instruction telling Gemini to search the documents and provide cited answers

Gemini will search the uploaded documents and return relevant passages with citations. The grounding metadata in the response tells you which document and which part of the document supports each claim.

### 5.3 Session Management

Group uploads and queries into "research sessions." A session belongs to one vertical and contains multiple documents and multiple queries. This allows the expert to build up context over time.

---

## 6. DATABASE SCHEMA ADDITIONS

Add these tables to the existing Phase 1 PostgreSQL database:

**research_sessions:** Tracks research sessions for rule development. Fields: session_id (UUID primary key), vertical (string), expert_name (string), status (enum: ACTIVE, COMPLETED, ABANDONED), created_at, updated_at.

**session_documents:** Links documents to sessions. Fields: id (UUID), session_id (foreign key), gemini_file_uri (string), display_name (string), document_type (enum: REGULATION, GUIDELINE, PRECEDENT, REFERENCE), file_size_bytes (integer), page_count (integer), upload_status (enum: UPLOADING, INDEXED, FAILED), uploaded_at.

**research_queries:** Stores queries and responses. Fields: query_id (UUID), session_id (foreign key), query_text (text), response_text (text), citations (JSONB array), confidence (enum: HIGH, MEDIUM, LOW), queried_at.

**draft_rules:** Stores generated rule definitions. Fields: rule_id (UUID), session_id (foreign key), rule_definition (JSONB), source_query_ids (UUID array), validation_status (enum: DRAFT, VALIDATED, DEPLOYED), created_at, updated_at.

**rule_test_cases:** Stores test cases for validation. Fields: test_case_id (UUID), session_id (foreign key), name (string), inputs (JSONB), expected_outputs (JSONB), actual_outputs (JSONB), passed (boolean), tested_at.

---

## 7. API ENDPOINTS TO BUILD

### 7.1 Session Management

**POST /api/v1/workbench/sessions** - Create a new research session. Accept vertical name and expert name. Return session_id.

**GET /api/v1/workbench/sessions/{session_id}** - Get session details including document count, query count, and rule count.

**GET /api/v1/workbench/sessions** - List all sessions with optional filters (vertical, status, date range).

**PATCH /api/v1/workbench/sessions/{session_id}** - Update session status (complete or abandon).

### 7.2 Document Ingestion

**POST /api/v1/workbench/sessions/{session_id}/documents** - Upload a document to the session. Accept multipart form with file and metadata. Upload to Gemini Files API, store URI and metadata. Return document record.

**GET /api/v1/workbench/sessions/{session_id}/documents** - List all documents in the session with their indexing status.

**DELETE /api/v1/workbench/sessions/{session_id}/documents/{document_id}** - Remove a document from the session. Also delete from Gemini if supported.

### 7.3 Research Queries

**POST /api/v1/workbench/sessions/{session_id}/queries** - Submit a research query. Call Gemini generateContent with grounding using all session documents. Parse response and extract citations. Store query and response. Return findings with citations.

**GET /api/v1/workbench/sessions/{session_id}/queries** - List all queries in the session with their responses.

**GET /api/v1/workbench/sessions/{session_id}/queries/{query_id}** - Get a specific query with full response and citations.

### 7.4 Rule Generation

**POST /api/v1/workbench/sessions/{session_id}/rules/generate** - Generate a draft rule from one or more research findings. Accept query_ids to use as source. Use Gemini to convert findings into rule YAML format. Store draft rule. Return rule definition.

**GET /api/v1/workbench/sessions/{session_id}/rules** - List all draft rules in the session.

**GET /api/v1/workbench/sessions/{session_id}/rules/{rule_id}** - Get a specific rule definition.

**PUT /api/v1/workbench/sessions/{session_id}/rules/{rule_id}** - Update a rule definition (expert edits).

**DELETE /api/v1/workbench/sessions/{session_id}/rules/{rule_id}** - Delete a draft rule.

### 7.5 Validation

**POST /api/v1/workbench/sessions/{session_id}/test-cases** - Add a test case. Accept name, inputs, and expected outputs.

**GET /api/v1/workbench/sessions/{session_id}/test-cases** - List all test cases.

**POST /api/v1/workbench/sessions/{session_id}/validate** - Run all test cases against current draft rules. Call the Phase 2 Runtime API /score endpoint with the draft rule set. Compare actual vs expected outputs. Return validation report with pass/fail for each case.

### 7.6 Export and Deploy

**POST /api/v1/workbench/sessions/{session_id}/export** - Export all validated rules as a single YAML file. Return the file content or a download link.

**POST /api/v1/workbench/sessions/{session_id}/deploy** - Copy the exported rule set to the Phase 2 runtime configuration directory. Trigger hot reload if supported.

---

## 8. GEMINI PROMPT TEMPLATES

### 8.1 Research Query System Prompt

When the expert submits a research question, use this system instruction for the Gemini call:

"You are a rule extraction assistant for the Reasonex platform. Your task is to search the provided documents and answer the user's question with specific, cited information.

For each finding:
1. State the specific threshold, condition, or rule you found
2. Quote the relevant text from the source
3. Cite the exact document, page, and section
4. Rate your confidence as HIGH (explicitly stated), MEDIUM (clearly implied), or LOW (inferred)
5. Note any exceptions or edge cases mentioned nearby

If the documents do not contain information to answer the question, say so clearly. Do not make up information.

Format each finding as:
FINDING: [The specific rule or threshold]
QUOTE: [Exact text from document]
SOURCE: [Document name, page, section]
CONFIDENCE: [HIGH/MEDIUM/LOW]
EXCEPTIONS: [Any noted exceptions, or "None found"]"

### 8.2 Rule Generation System Prompt

When generating a rule definition from research findings, use this system instruction:

"You are a rule configuration generator for the Reasonex platform. Convert the provided research finding into a structured rule definition.

The rule must be in YAML format with these fields:
- rule_id: A unique identifier in SCREAMING_SNAKE_CASE (e.g., FIN_ROIC, LEGAL_COST_SCALE_1)
- name: Human-readable name
- category: The dimension this rule belongs to
- rule_type: One of THRESHOLD, BOOLEAN, FORMULA, LOOKUP, or CONDITIONAL
- weight: Relative importance from 0.0 to 1.0
- inputs: List of input paths in the analysis tree
- [type-specific fields based on rule_type]
- rationale: Why this rule exists, citing the source
- source: Document, page, section reference

For THRESHOLD rules, include a thresholds list with min value, classification, and score for each band.
For BOOLEAN rules, include true_score and false_score.
For FORMULA rules, include the calculation formula as a string.
For CONDITIONAL rules, include a conditions list with if/then clauses.

Output only the YAML rule definition, no explanation."

---

## 9. RULE DEFINITION FORMAT

The generated rules must match the format expected by the Phase 2 Rule Engine. Here is the structure:

A rule set file contains:
- metadata section with rule_set_id, name, version, vertical, jurisdiction, effective_date, sources list, and validation info
- dimensions section listing each scoring dimension with dimension_id, name, and weight
- rules section containing all rule definitions

Each rule definition contains:
- rule_id (unique string)
- name (string)
- category (string matching a dimension_id)
- rule_type (THRESHOLD, BOOLEAN, FORMULA, LOOKUP, or CONDITIONAL)
- weight (float 0.0-1.0)
- inputs (list of objects with path and variable fields)
- type-specific fields (thresholds for THRESHOLD, formula for FORMULA, etc.)
- rationale (string explaining the rule)
- source (object with document, section, paragraph, confidence)

The aggregation section defines how dimension scores combine into overall score.

The recommendations section maps score ranges to recommendation labels.

---

## 10. VALIDATION LOGIC

When running validation:

1. Collect all draft rules from the session
2. Format them as a temporary rule set
3. For each test case:
   a. Call POST /api/v1/score on the Phase 2 Runtime API with the test case inputs and draft rule set
   b. Compare actual outputs to expected outputs
   c. Mark as passed if all expected values match within tolerance (default 5% for numeric values)
   d. Store actual outputs and pass/fail status
4. Calculate overall pass rate
5. Return detailed report showing each test case result and any mismatches

A rule set should not be deployed until it achieves 100% pass rate on all test cases.

---

## 11. FILE STRUCTURE

Add these files to the existing Phase 2 project structure:

Under app/routers/:
- workbench.py (all workbench endpoints)

Under app/services/:
- gemini_service.py (Gemini Files API and generateContent calls)
- rule_generator.py (convert findings to rules)
- validation_service.py (run test cases)
- export_service.py (generate YAML files)

Under app/models/:
- workbench_models.py (Pydantic models for sessions, documents, queries, rules, test cases)

Under app/db/:
- workbench_tables.py (SQLAlchemy models for new tables)

Under config/:
- gemini_config.py (API keys, model settings)

---

## 12. ENVIRONMENT VARIABLES

Add these environment variables:

GEMINI_API_KEY - Google AI API key for Gemini access
GEMINI_MODEL - Model to use, default "gemini-1.5-pro"
WORKBENCH_MAX_DOCUMENTS_PER_SESSION - Maximum documents allowed per session, default 50
WORKBENCH_MAX_FILE_SIZE_MB - Maximum file size for uploads, default 100
RULE_EXPORT_PATH - Directory where exported rule sets are saved

---

## 13. ERROR HANDLING

Handle these error scenarios:

**Document upload failures:** If Gemini rejects a file (too large, unsupported format, quota exceeded), return a clear error message and do not create the document record.

**Query failures:** If Gemini fails to respond or returns an error, retry up to 3 times with exponential backoff. If still failing, return an error indicating the service is temporarily unavailable.

**No relevant findings:** If Gemini cannot find information in the documents to answer a query, return a response indicating no findings rather than an error.

**Validation failures:** If the Phase 2 Runtime API is unavailable during validation, return an error. Do not mark test cases as failed due to infrastructure issues.

**Invalid rule YAML:** If the generated rule YAML is malformed, catch the error and return it to the user for manual correction.

---

## 14. IMPLEMENTATION ORDER

Build in this sequence:

**Step 1:** Add database tables. Run migrations to create research_sessions, session_documents, research_queries, draft_rules, and rule_test_cases tables.

**Step 2:** Build Gemini service. Implement document upload to Files API and generateContent with grounding. Test with a simple document and query.

**Step 3:** Build session and document endpoints. Allow creating sessions and uploading documents. Verify documents are indexed in Gemini.

**Step 4:** Build query endpoints. Allow submitting research questions and getting cited answers. Parse and store citations properly.

**Step 5:** Build rule generation. Implement conversion from findings to YAML rules. Allow expert editing.

**Step 6:** Build test case and validation endpoints. Integrate with Phase 2 Runtime API for scoring.

**Step 7:** Build export and deploy endpoints. Generate valid YAML files and copy to runtime configuration.

**Step 8:** Test end-to-end with a real vertical. Upload Singapore legal cost documents, research thresholds, generate rules, validate against known cases.

---

## 15. SUCCESS CRITERIA

The implementation is complete when:

1. An expert can create a research session and upload PDF documents
2. Documents are successfully indexed in Gemini (verified by successful queries)
3. Research queries return relevant findings with accurate citations
4. Draft rules can be generated from findings in valid YAML format
5. Rules can be manually edited through the API
6. Test cases can be created and run against draft rules
7. Validation correctly identifies passing and failing cases
8. Validated rule sets can be exported as YAML files
9. Exported files can be loaded by the Phase 2 Rule Engine
10. The full workflow from document upload to deployed rule set works end-to-end

---

## 16. WHAT NOT TO BUILD

Do not build:
- A web UI (API only for now)
- Custom vector storage or embeddings (use Gemini)
- Custom chunking logic (Gemini handles this)
- Duplicate rule execution logic (use Phase 2 API)
- User authentication (inherit from Phase 2)
- Document format conversion (require PDF upload)

---

## 17. DEPENDENCIES

Add these Python packages:
- google-generativeai (Gemini SDK)
- python-multipart (file uploads)

Do not add vector databases, embedding models, or LangChain. Gemini handles RAG internally.

---

**END OF SPECIFICATION**
