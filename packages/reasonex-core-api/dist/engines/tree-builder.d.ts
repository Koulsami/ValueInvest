import { Logger } from '../lib/logger';
export type LLMProvider = 'openai' | 'anthropic';
export interface LLMConfig {
    provider: LLMProvider;
    model: string;
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
    maxRetries?: number;
}
export interface TreeSchema {
    id: string;
    name: string;
    vertical: string;
    sections: TreeSection[];
    outputFormat: 'json' | 'markdown' | 'html';
}
export interface TreeSection {
    id: string;
    name: string;
    description: string;
    required: boolean;
    subSections?: TreeSection[];
}
export interface TreeNode {
    sectionId: string;
    sectionName: string;
    content: string;
    confidence: number;
    sources?: string[];
    children?: TreeNode[];
}
export interface TreeBuildOptions {
    schema: string | TreeSchema;
    llmConfig?: Partial<LLMConfig>;
    guidanceProfile?: string;
    debugMode?: boolean;
}
export interface TreeBuildResult {
    tree: TreeNode[];
    metadata: {
        schema: string;
        provider: string;
        model: string;
        tokensUsed: number;
        executionTime_ms: number;
        retries: number;
    };
    coverageReport: {
        totalSections: number;
        completedSections: number;
        missingSections: string[];
        coveragePercentage: number;
    };
    confidenceMap: Record<string, number>;
}
export declare class TreeBuilder {
    private logger;
    private tracer;
    private schemas;
    private openaiClient?;
    constructor(logger?: Logger);
    /**
     * Register a custom schema
     */
    registerSchema(schema: TreeSchema): void;
    /**
     * Get available schemas
     */
    getSchemas(): string[];
    /**
     * Get a specific schema
     */
    getSchema(id: string): TreeSchema | undefined;
    /**
     * Build system prompt for tree generation
     */
    private buildSystemPrompt;
    /**
     * Build user prompt for tree generation
     */
    private buildUserPrompt;
    /**
     * Call LLM to generate tree
     */
    private callLLM;
    /**
     * Parse LLM response into tree nodes
     */
    private parseResponse;
    /**
     * Calculate coverage report
     */
    private calculateCoverage;
    /**
     * Calculate confidence map
     */
    private calculateConfidenceMap;
    /**
     * Build analysis tree
     */
    buildTree(entity: Record<string, unknown>, documents: unknown[] | undefined, options: TreeBuildOptions): Promise<TreeBuildResult>;
}
export declare const treeBuilder: TreeBuilder;
export default treeBuilder;
//# sourceMappingURL=tree-builder.d.ts.map