import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { NodeLogger } from './logger';

// API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
  message?: string;
  traceId?: string;
}

// API Client configuration
export interface ApiClientConfig {
  baseUrl: string;
  apiKey?: string;
  openaiApiKey?: string;
  timeout?: number;
  debugMode?: boolean;
}

// Reasonex API Client
export class ReasonexApiClient {
  private client: AxiosInstance;
  private logger: NodeLogger;
  private traceId: string;
  private debugMode: boolean;

  constructor(config: ApiClientConfig, logger?: NodeLogger) {
    this.traceId = uuidv4();
    this.debugMode = config.debugMode || false;
    this.logger = logger || new NodeLogger('ReasonexApiClient', undefined, this.debugMode);

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-ID': this.traceId,
        ...(config.apiKey && { 'X-API-Key': config.apiKey }),
        ...(config.openaiApiKey && { 'X-OpenAI-Key': config.openaiApiKey }),
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (requestConfig) => {
        this.logger.debug('API Request', {
          method: requestConfig.method,
          url: requestConfig.url,
          dataSize: JSON.stringify(requestConfig.data || {}).length,
        });
        return requestConfig;
      },
      (error) => {
        this.logger.error('Request error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug('API Response', {
          status: response.status,
          url: response.config.url,
          dataSize: JSON.stringify(response.data || {}).length,
        });
        return response;
      },
      (error) => {
        this.logger.error('Response error', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
        });
        return Promise.reject(error);
      }
    );
  }

  // Get current trace ID
  getTraceId(): string {
    return this.traceId;
  }

  // Generic request method
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.client.request({
        method,
        url: endpoint,
        data,
        ...config,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as ApiResponse<T>;
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        traceId: this.traceId,
      };
    }
  }

  // Lock API
  async createLock(data: Record<string, unknown>, options?: {
    algorithm?: 'SHA256' | 'SHA3-256' | 'SHA512';
    includeTimestamp?: boolean;
    canonicalization?: 'strict' | 'relaxed';
    schemaId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/lock', { data, options });
  }

  async verifyLock(data: Record<string, unknown>, hash: string, lockTimestamp?: string, options?: {
    algorithm?: 'SHA256' | 'SHA3-256' | 'SHA512';
    includeTimestamp?: boolean;
    canonicalization?: 'strict' | 'relaxed';
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/lock/verify', { data, hash, lockTimestamp, options });
  }

  // Score API
  async score(data: Record<string, unknown>, ruleSetId: string, context?: Record<string, unknown>, debugMode?: boolean): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/score', { data, ruleSetId, context, debugMode });
  }

  async getRuleSets(): Promise<ApiResponse<{ ruleSets: string[]; count: number }>> {
    return this.request('GET', '/api/v1/score/rule-sets');
  }

  async getRuleSet(id: string): Promise<ApiResponse> {
    return this.request('GET', `/api/v1/score/rule-sets/${id}`);
  }

  async batchScore(items: Record<string, unknown>[], ruleSetId: string, context?: Record<string, unknown>, debugMode?: boolean): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/score/batch', { items, ruleSetId, context, debugMode });
  }

  // Validate API
  async validate(analysis: Record<string, unknown>, options?: {
    sources?: unknown[];
    scores?: Record<string, unknown>;
    profile?: string;
    checks?: string[];
    strictness?: 'strict' | 'normal' | 'lenient';
    hallucinationSensitivity?: 'high' | 'medium' | 'low';
    debugMode?: boolean;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/validate', {
      analysis,
      sources: options?.sources,
      scores: options?.scores,
      profile: options?.profile,
      options: {
        checks: options?.checks,
        strictness: options?.strictness,
        hallucinationSensitivity: options?.hallucinationSensitivity,
        debugMode: options?.debugMode,
      },
    });
  }

  async getValidationProfiles(): Promise<ApiResponse<{ profiles: string[]; count: number }>> {
    return this.request('GET', '/api/v1/validate/profiles');
  }

  // Tree API
  async buildTree(entity: Record<string, unknown>, documents: unknown[], schema: string, options?: {
    llmConfig?: {
      provider?: 'openai' | 'anthropic';
      model?: string;
      temperature?: number;
      maxTokens?: number;
    };
    guidanceProfile?: string;
    debugMode?: boolean;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/tree', {
      entity,
      documents,
      schema,
      ...options,
    });
  }

  async getTreeSchemas(): Promise<ApiResponse<{ schemas: string[]; count: number }>> {
    return this.request('GET', '/api/v1/tree/schemas');
  }

  // Detect API
  async detectChanges(oldVersion: Record<string, unknown>, newVersion: Record<string, unknown>, options?: {
    materialityConfig?: {
      highImpactFields?: string[];
      mediumImpactFields?: string[];
      numericTolerance?: number;
      ignoreFields?: string[];
    };
    comparisonDepth?: 'shallow' | 'deep';
    debugMode?: boolean;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/detect', {
      oldVersion,
      newVersion,
      ...options,
    });
  }

  // Route API
  async route(change: {
    impactScore: number;
    materiality: 'HIGH' | 'MEDIUM' | 'LOW';
    changesCount: number;
    affectedPaths: string[];
  }, context?: {
    urgency?: 'critical' | 'high' | 'normal' | 'low';
    clientTier?: 'enterprise' | 'premium' | 'standard' | 'basic';
    vertical?: string;
    confidence?: number;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/route', { change, context });
  }

  async generateExplanation(scoringResult: Record<string, unknown>, options?: {
    audience?: 'expert' | 'professional' | 'consumer';
    verbosity?: 'brief' | 'standard' | 'detailed';
    includeCitations?: boolean;
    language?: string;
  }): Promise<ApiResponse> {
    return this.request('POST', '/api/v1/route/explain', { scoringResult, options });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{
    status: string;
    service: string;
    version: string;
    timestamp: string;
    uptime: number;
  }>> {
    return this.request('GET', '/health');
  }
}

// Factory function
export function createApiClient(config: ApiClientConfig, logger?: NodeLogger): ReasonexApiClient {
  return new ReasonexApiClient(config, logger);
}
