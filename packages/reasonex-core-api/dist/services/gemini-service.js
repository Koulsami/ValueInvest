"use strict";
/**
 * Gemini Service - Document upload and RAG queries
 * Phase 3: Rule Development Workbench
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
exports.getGeminiService = getGeminiService;
const generative_ai_1 = require("@google/generative-ai");
const server_1 = require("@google/generative-ai/server");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../lib/logger");
const database_1 = require("../types/database");
// Prompt templates from spec
const RESEARCH_QUERY_SYSTEM_PROMPT = `You are a rule extraction assistant for the Reasonex platform. Your task is to search the provided documents and answer the user's question with specific, cited information.

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
EXCEPTIONS: [Any noted exceptions, or "None found"]`;
const RULE_GENERATION_SYSTEM_PROMPT = `You are a rule configuration generator for the Reasonex platform. Convert the provided research finding into a structured rule definition.

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

Output only the YAML rule definition, no explanation.`;
class GeminiService {
    genAI;
    fileManager;
    model;
    logger;
    constructor(logger) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.fileManager = new server_1.GoogleAIFileManager(apiKey);
        this.model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
        this.logger = logger || new logger_1.Logger(undefined, { service: 'gemini-service' });
    }
    /**
     * Upload a document to Gemini Files API
     */
    async uploadDocument(filePath, displayName, mimeType) {
        const startTime = Date.now();
        this.logger.info('Uploading document to Gemini', {
            operation: 'gemini_upload_start',
            displayName,
            filePath,
        });
        try {
            // Detect mime type if not provided
            const detectedMimeType = mimeType || this.detectMimeType(filePath);
            // Upload file to Gemini
            const uploadResult = await this.fileManager.uploadFile(filePath, {
                mimeType: detectedMimeType,
                displayName,
            });
            // Wait for file to be processed
            let file = await this.fileManager.getFile(uploadResult.file.name);
            while (file.state === server_1.FileState.PROCESSING) {
                await this.sleep(2000);
                file = await this.fileManager.getFile(uploadResult.file.name);
            }
            if (file.state === server_1.FileState.FAILED) {
                throw new Error(`File processing failed: ${file.name}`);
            }
            const duration = Date.now() - startTime;
            this.logger.info('Document uploaded successfully', {
                operation: 'gemini_upload_complete',
                displayName,
                fileUri: file.uri,
                state: file.state,
                duration_ms: duration,
            });
            return {
                fileUri: file.uri,
                fileName: file.name,
                mimeType: file.mimeType,
                sizeBytes: parseInt(file.sizeBytes || '0', 10),
                state: file.state,
            };
        }
        catch (error) {
            this.logger.error('Document upload failed', {
                operation: 'gemini_upload_error',
                displayName,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Upload a document from buffer (for multipart uploads)
     */
    async uploadDocumentFromBuffer(buffer, displayName, mimeType, tempDir = '/tmp') {
        // Write buffer to temp file
        const tempPath = path.join(tempDir, `gemini_upload_${Date.now()}_${displayName}`);
        try {
            fs.writeFileSync(tempPath, buffer);
            const result = await this.uploadDocument(tempPath, displayName, mimeType);
            return result;
        }
        finally {
            // Clean up temp file
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        }
    }
    /**
     * Delete a document from Gemini Files API
     */
    async deleteDocument(fileName) {
        this.logger.info('Deleting document from Gemini', {
            operation: 'gemini_delete',
            fileName,
        });
        try {
            await this.fileManager.deleteFile(fileName);
            this.logger.info('Document deleted successfully', {
                operation: 'gemini_delete_complete',
                fileName,
            });
        }
        catch (error) {
            this.logger.error('Document deletion failed', {
                operation: 'gemini_delete_error',
                fileName,
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Execute a research query with grounding on uploaded documents
     */
    async executeResearchQuery(queryText, documents) {
        const startTime = Date.now();
        this.logger.info('Executing research query', {
            operation: 'gemini_query_start',
            queryLength: queryText.length,
            documentCount: documents.length,
        });
        try {
            const model = this.genAI.getGenerativeModel({ model: this.model });
            // Build file parts for grounding
            const fileParts = documents.map(doc => ({
                fileData: {
                    mimeType: 'application/pdf',
                    fileUri: doc.fileUri,
                },
            }));
            // Build the prompt with system instruction
            const prompt = `${RESEARCH_QUERY_SYSTEM_PROMPT}

Documents provided: ${documents.map(d => d.displayName).join(', ')}

User Question: ${queryText}`;
            // Execute query with grounding
            const result = await model.generateContent([
                ...fileParts,
                { text: prompt },
            ]);
            const response = result.response;
            const responseText = response.text();
            const processingTimeMs = Date.now() - startTime;
            // Parse findings from response
            const findings = this.parseFindings(responseText, documents);
            const citations = this.extractCitations(responseText, documents);
            const confidence = this.determineOverallConfidence(findings);
            // Estimate tokens (rough approximation)
            const tokensUsed = Math.ceil((queryText.length + responseText.length) / 4);
            this.logger.info('Research query completed', {
                operation: 'gemini_query_complete',
                findingsCount: findings.length,
                citationsCount: citations.length,
                confidence,
                tokensUsed,
                processingTimeMs,
            });
            return {
                responseText,
                findings,
                citations,
                confidence,
                tokensUsed,
                processingTimeMs,
            };
        }
        catch (error) {
            this.logger.error('Research query failed', {
                operation: 'gemini_query_error',
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Generate a rule definition from research findings
     */
    async generateRule(findings, ruleContext) {
        const startTime = Date.now();
        this.logger.info('Generating rule from findings', {
            operation: 'gemini_rule_gen_start',
            findingsCount: findings.length,
            vertical: ruleContext.vertical,
            category: ruleContext.category,
        });
        try {
            const model = this.genAI.getGenerativeModel({ model: this.model });
            // Format findings for the prompt
            const findingsText = findings.map((f, i) => `
Finding ${i + 1}:
- Finding: ${f.finding}
- Quote: "${f.quote}"
- Source: ${f.source}
- Confidence: ${f.confidence}
- Exceptions: ${f.exceptions}
`).join('\n');
            const prompt = `${RULE_GENERATION_SYSTEM_PROMPT}

Vertical: ${ruleContext.vertical}
Category: ${ruleContext.category}
${ruleContext.suggestedRuleId ? `Suggested Rule ID: ${ruleContext.suggestedRuleId}` : ''}

Research Findings:
${findingsText}

Generate the YAML rule definition:`;
            const result = await model.generateContent(prompt);
            const response = result.response;
            const ruleYaml = response.text().trim();
            // Try to parse YAML to JSON
            const ruleDefinition = this.parseYamlToJson(ruleYaml);
            const tokensUsed = Math.ceil((prompt.length + ruleYaml.length) / 4);
            this.logger.info('Rule generation completed', {
                operation: 'gemini_rule_gen_complete',
                ruleId: ruleDefinition.rule_id,
                tokensUsed,
                duration_ms: Date.now() - startTime,
            });
            return {
                ruleYaml,
                ruleDefinition,
                tokensUsed,
            };
        }
        catch (error) {
            this.logger.error('Rule generation failed', {
                operation: 'gemini_rule_gen_error',
                error: error.message,
            });
            throw error;
        }
    }
    /**
     * Parse findings from Gemini response
     */
    parseFindings(responseText, documents) {
        const findings = [];
        // Split by FINDING: pattern
        const findingBlocks = responseText.split(/FINDING:\s*/i).filter(block => block.trim());
        for (const block of findingBlocks) {
            try {
                const finding = this.extractField(block, 'FINDING') || block.split('\n')[0]?.trim() || '';
                const quote = this.extractField(block, 'QUOTE') || '';
                const source = this.extractField(block, 'SOURCE') || '';
                const confidenceStr = this.extractField(block, 'CONFIDENCE') || 'MEDIUM';
                const exceptions = this.extractField(block, 'EXCEPTIONS') || 'None found';
                // Validate confidence level
                let confidence;
                if (confidenceStr.toUpperCase().includes('HIGH')) {
                    confidence = database_1.ConfidenceLevel.HIGH;
                }
                else if (confidenceStr.toUpperCase().includes('LOW')) {
                    confidence = database_1.ConfidenceLevel.LOW;
                }
                else {
                    confidence = database_1.ConfidenceLevel.MEDIUM;
                }
                if (finding) {
                    findings.push({
                        finding,
                        quote,
                        source,
                        confidence,
                        exceptions,
                    });
                }
            }
            catch (e) {
                // Skip malformed findings
                this.logger.warn('Could not parse finding block', { block: block.substring(0, 100) });
            }
        }
        return findings;
    }
    /**
     * Extract field value from text block
     */
    extractField(block, fieldName) {
        const patterns = [
            new RegExp(`${fieldName}:\\s*(.+?)(?=(?:FINDING|QUOTE|SOURCE|CONFIDENCE|EXCEPTIONS):|$)`, 'is'),
            new RegExp(`${fieldName}:\\s*(.+?)\\n`, 'i'),
        ];
        for (const pattern of patterns) {
            const match = block.match(pattern);
            if (match && match[1]) {
                return match[1].trim().replace(/^["']|["']$/g, '');
            }
        }
        return '';
    }
    /**
     * Extract citations from response
     */
    extractCitations(responseText, documents) {
        const citations = [];
        // Extract SOURCE references
        const sourcePattern = /SOURCE:\s*([^,\n]+)(?:,\s*(?:page\s*)?(\d+))?(?:,\s*(?:section\s*)?([^\n]+))?/gi;
        let match;
        while ((match = sourcePattern.exec(responseText)) !== null) {
            const docName = match[1]?.trim() || '';
            const page = match[2] ? parseInt(match[2], 10) : undefined;
            const section = match[3]?.trim();
            // Try to match document
            const doc = documents.find(d => d.displayName.toLowerCase().includes(docName.toLowerCase()) ||
                docName.toLowerCase().includes(d.displayName.toLowerCase()));
            // Extract surrounding text as quote
            const textMatch = responseText.substring(Math.max(0, match.index - 200), match.index).match(/QUOTE:\s*["']?([^"'\n]+)["']?/i);
            citations.push({
                documentId: doc?.fileUri || docName,
                documentName: doc?.displayName || docName,
                page,
                section,
                text: textMatch?.[1]?.trim() || '',
            });
        }
        return citations;
    }
    /**
     * Determine overall confidence from findings
     */
    determineOverallConfidence(findings) {
        if (findings.length === 0) {
            return database_1.ConfidenceLevel.LOW;
        }
        const highCount = findings.filter(f => f.confidence === database_1.ConfidenceLevel.HIGH).length;
        const lowCount = findings.filter(f => f.confidence === database_1.ConfidenceLevel.LOW).length;
        if (highCount >= findings.length / 2) {
            return database_1.ConfidenceLevel.HIGH;
        }
        else if (lowCount >= findings.length / 2) {
            return database_1.ConfidenceLevel.LOW;
        }
        return database_1.ConfidenceLevel.MEDIUM;
    }
    /**
     * Parse YAML to JSON (basic implementation)
     */
    parseYamlToJson(yamlText) {
        // Extract YAML block if wrapped in code fences
        const yamlMatch = yamlText.match(/```(?:yaml)?\s*([\s\S]*?)\s*```/);
        const cleanYaml = yamlMatch ? yamlMatch[1] : yamlText;
        // Basic YAML to JSON conversion
        // For production, use a proper YAML parser like js-yaml
        const result = {};
        const lines = cleanYaml.split('\n');
        let currentKey = '';
        let currentIndent = 0;
        const stack = [{ obj: result, indent: -1 }];
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#'))
                continue;
            const indent = line.search(/\S/);
            const keyValueMatch = trimmedLine.match(/^([a-z_][a-z0-9_]*)\s*:\s*(.*)$/i);
            if (keyValueMatch) {
                const [, key, value] = keyValueMatch;
                // Pop stack until we find the right level
                while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
                    stack.pop();
                }
                const currentObj = stack[stack.length - 1].obj;
                if (value.trim()) {
                    // Simple value
                    currentObj[key] = this.parseYamlValue(value.trim());
                }
                else {
                    // Nested object
                    const newObj = {};
                    currentObj[key] = newObj;
                    stack.push({ obj: newObj, indent });
                }
            }
            else if (trimmedLine.startsWith('- ')) {
                // Array item
                const currentObj = stack[stack.length - 1].obj;
                const lastKey = Object.keys(currentObj).pop();
                if (lastKey) {
                    if (!Array.isArray(currentObj[lastKey])) {
                        currentObj[lastKey] = [];
                    }
                    currentObj[lastKey].push(this.parseYamlValue(trimmedLine.substring(2).trim()));
                }
            }
        }
        return result;
    }
    /**
     * Parse a YAML value to appropriate type
     */
    parseYamlValue(value) {
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        // Boolean
        if (value.toLowerCase() === 'true')
            return true;
        if (value.toLowerCase() === 'false')
            return false;
        // Null
        if (value.toLowerCase() === 'null' || value === '~')
            return null;
        // Number
        const num = Number(value);
        if (!isNaN(num))
            return num;
        return value;
    }
    /**
     * Detect MIME type from file extension
     */
    detectMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.html': 'text/html',
            '.htm': 'text/html',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.json': 'application/json',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Check if Gemini service is available
     */
    async healthCheck() {
        try {
            const model = this.genAI.getGenerativeModel({ model: this.model });
            // Just verify the model can be instantiated
            return { status: 'healthy', model: this.model };
        }
        catch (error) {
            return { status: 'unhealthy', model: this.model };
        }
    }
}
exports.GeminiService = GeminiService;
// Export singleton for convenience
let geminiServiceInstance = null;
function getGeminiService(logger) {
    if (!geminiServiceInstance) {
        geminiServiceInstance = new GeminiService(logger);
    }
    return geminiServiceInstance;
}
//# sourceMappingURL=gemini-service.js.map