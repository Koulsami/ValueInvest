import { NodeLogger } from './logger';
export interface ApiResponse<T = unknown> {
    success: boolean;
    result?: T;
    error?: string;
    message?: string;
    traceId?: string;
}
export interface ApiClientConfig {
    baseUrl: string;
    apiKey?: string;
    openaiApiKey?: string;
    timeout?: number;
    debugMode?: boolean;
}
export declare class ReasonexApiClient {
    private client;
    private logger;
    private traceId;
    private debugMode;
    constructor(config: ApiClientConfig, logger?: NodeLogger);
    getTraceId(): string;
    private request;
    createLock(data: Record<string, unknown>, options?: {
        algorithm?: 'SHA256' | 'SHA3-256' | 'SHA512';
        includeTimestamp?: boolean;
        canonicalization?: 'strict' | 'relaxed';
        schemaId?: string;
        metadata?: Record<string, unknown>;
    }): Promise<ApiResponse>;
    verifyLock(data: Record<string, unknown>, hash: string, lockTimestamp?: string, options?: {
        algorithm?: 'SHA256' | 'SHA3-256' | 'SHA512';
        includeTimestamp?: boolean;
        canonicalization?: 'strict' | 'relaxed';
    }): Promise<ApiResponse>;
    score(data: Record<string, unknown>, ruleSetId: string, context?: Record<string, unknown>, debugMode?: boolean): Promise<ApiResponse>;
    getRuleSets(): Promise<ApiResponse<{
        ruleSets: string[];
        count: number;
    }>>;
    getRuleSet(id: string): Promise<ApiResponse>;
    batchScore(items: Record<string, unknown>[], ruleSetId: string, context?: Record<string, unknown>, debugMode?: boolean): Promise<ApiResponse>;
    validate(analysis: Record<string, unknown>, options?: {
        sources?: unknown[];
        scores?: Record<string, unknown>;
        profile?: string;
        checks?: string[];
        strictness?: 'strict' | 'normal' | 'lenient';
        hallucinationSensitivity?: 'high' | 'medium' | 'low';
        debugMode?: boolean;
    }): Promise<ApiResponse>;
    getValidationProfiles(): Promise<ApiResponse<{
        profiles: string[];
        count: number;
    }>>;
    buildTree(entity: Record<string, unknown>, documents: unknown[], schema: string, options?: {
        llmConfig?: {
            provider?: 'openai' | 'anthropic';
            model?: string;
            temperature?: number;
            maxTokens?: number;
        };
        guidanceProfile?: string;
        debugMode?: boolean;
    }): Promise<ApiResponse>;
    getTreeSchemas(): Promise<ApiResponse<{
        schemas: string[];
        count: number;
    }>>;
    detectChanges(oldVersion: Record<string, unknown>, newVersion: Record<string, unknown>, options?: {
        materialityConfig?: {
            highImpactFields?: string[];
            mediumImpactFields?: string[];
            numericTolerance?: number;
            ignoreFields?: string[];
        };
        comparisonDepth?: 'shallow' | 'deep';
        debugMode?: boolean;
    }): Promise<ApiResponse>;
    route(change: {
        impactScore: number;
        materiality: 'HIGH' | 'MEDIUM' | 'LOW';
        changesCount: number;
        affectedPaths: string[];
    }, context?: {
        urgency?: 'critical' | 'high' | 'normal' | 'low';
        clientTier?: 'enterprise' | 'premium' | 'standard' | 'basic';
        vertical?: string;
        confidence?: number;
    }): Promise<ApiResponse>;
    generateExplanation(scoringResult: Record<string, unknown>, options?: {
        audience?: 'expert' | 'professional' | 'consumer';
        verbosity?: 'brief' | 'standard' | 'detailed';
        includeCitations?: boolean;
        language?: string;
    }): Promise<ApiResponse>;
    healthCheck(): Promise<ApiResponse<{
        status: string;
        service: string;
        version: string;
        timestamp: string;
        uptime: number;
    }>>;
}
export declare function createApiClient(config: ApiClientConfig, logger?: NodeLogger): ReasonexApiClient;
//# sourceMappingURL=api-client.d.ts.map