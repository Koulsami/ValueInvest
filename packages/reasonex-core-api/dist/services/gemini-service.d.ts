/**
 * Gemini Service - Document upload and RAG queries
 * Phase 3: Rule Development Workbench
 */
import { Logger } from '../lib/logger';
import { ConfidenceLevel, ResearchFinding, Citation } from '../types/database';
export interface GeminiUploadResult {
    fileUri: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    state: string;
}
export interface GeminiQueryResult {
    responseText: string;
    findings: ResearchFinding[];
    citations: Citation[];
    confidence: ConfidenceLevel;
    tokensUsed: number;
    processingTimeMs: number;
}
export interface GeminiRuleGenerationResult {
    ruleYaml: string;
    ruleDefinition: Record<string, unknown>;
    tokensUsed: number;
}
export interface DocumentInfo {
    fileUri: string;
    displayName: string;
}
export declare class GeminiService {
    private genAI;
    private fileManager;
    private model;
    private logger;
    constructor(logger?: Logger);
    /**
     * Upload a document to Gemini Files API
     */
    uploadDocument(filePath: string, displayName: string, mimeType?: string): Promise<GeminiUploadResult>;
    /**
     * Upload a document from buffer (for multipart uploads)
     */
    uploadDocumentFromBuffer(buffer: Buffer, displayName: string, mimeType: string, tempDir?: string): Promise<GeminiUploadResult>;
    /**
     * Delete a document from Gemini Files API
     */
    deleteDocument(fileName: string): Promise<void>;
    /**
     * Execute a research query with grounding on uploaded documents
     */
    executeResearchQuery(queryText: string, documents: DocumentInfo[]): Promise<GeminiQueryResult>;
    /**
     * Generate a rule definition from research findings
     */
    generateRule(findings: ResearchFinding[], ruleContext: {
        vertical: string;
        category: string;
        suggestedRuleId?: string;
    }): Promise<GeminiRuleGenerationResult>;
    /**
     * Parse findings from Gemini response
     */
    private parseFindings;
    /**
     * Extract field value from text block
     */
    private extractField;
    /**
     * Extract citations from response
     */
    private extractCitations;
    /**
     * Determine overall confidence from findings
     */
    private determineOverallConfidence;
    /**
     * Parse YAML to JSON (basic implementation)
     */
    private parseYamlToJson;
    /**
     * Parse a YAML value to appropriate type
     */
    private parseYamlValue;
    /**
     * Detect MIME type from file extension
     */
    private detectMimeType;
    /**
     * Sleep helper
     */
    private sleep;
    /**
     * Check if Gemini service is available
     */
    healthCheck(): Promise<{
        status: string;
        model: string;
    }>;
}
export declare function getGeminiService(logger?: Logger): GeminiService;
//# sourceMappingURL=gemini-service.d.ts.map