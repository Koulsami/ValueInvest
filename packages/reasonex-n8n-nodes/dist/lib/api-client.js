"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasonexApiClient = void 0;
exports.createApiClient = createApiClient;
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const logger_1 = require("./logger");
// Reasonex API Client
class ReasonexApiClient {
    client;
    logger;
    traceId;
    debugMode;
    constructor(config, logger) {
        this.traceId = (0, uuid_1.v4)();
        this.debugMode = config.debugMode || false;
        this.logger = logger || new logger_1.NodeLogger('ReasonexApiClient', undefined, this.debugMode);
        this.client = axios_1.default.create({
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
        this.client.interceptors.request.use((requestConfig) => {
            this.logger.debug('API Request', {
                method: requestConfig.method,
                url: requestConfig.url,
                dataSize: JSON.stringify(requestConfig.data || {}).length,
            });
            return requestConfig;
        }, (error) => {
            this.logger.error('Request error', { error: error.message });
            return Promise.reject(error);
        });
        // Response interceptor for logging
        this.client.interceptors.response.use((response) => {
            this.logger.debug('API Response', {
                status: response.status,
                url: response.config.url,
                dataSize: JSON.stringify(response.data || {}).length,
            });
            return response;
        }, (error) => {
            this.logger.error('Response error', {
                status: error.response?.status,
                message: error.message,
                url: error.config?.url,
            });
            return Promise.reject(error);
        });
    }
    // Get current trace ID
    getTraceId() {
        return this.traceId;
    }
    // Generic request method
    async request(method, endpoint, data, config) {
        try {
            const response = await this.client.request({
                method,
                url: endpoint,
                data,
                ...config,
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response) {
                return error.response.data;
            }
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                traceId: this.traceId,
            };
        }
    }
    // Lock API
    async createLock(data, options) {
        return this.request('POST', '/api/v1/lock', { data, options });
    }
    async verifyLock(data, hash, lockTimestamp, options) {
        return this.request('POST', '/api/v1/lock/verify', { data, hash, lockTimestamp, options });
    }
    // Score API
    async score(data, ruleSetId, context, debugMode) {
        return this.request('POST', '/api/v1/score', { data, ruleSetId, context, debugMode });
    }
    async getRuleSets() {
        return this.request('GET', '/api/v1/score/rule-sets');
    }
    async getRuleSet(id) {
        return this.request('GET', `/api/v1/score/rule-sets/${id}`);
    }
    async batchScore(items, ruleSetId, context, debugMode) {
        return this.request('POST', '/api/v1/score/batch', { items, ruleSetId, context, debugMode });
    }
    // Validate API
    async validate(analysis, options) {
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
    async getValidationProfiles() {
        return this.request('GET', '/api/v1/validate/profiles');
    }
    // Tree API
    async buildTree(entity, documents, schema, options) {
        return this.request('POST', '/api/v1/tree', {
            entity,
            documents,
            schema,
            ...options,
        });
    }
    async getTreeSchemas() {
        return this.request('GET', '/api/v1/tree/schemas');
    }
    // Detect API
    async detectChanges(oldVersion, newVersion, options) {
        return this.request('POST', '/api/v1/detect', {
            oldVersion,
            newVersion,
            ...options,
        });
    }
    // Route API
    async route(change, context) {
        return this.request('POST', '/api/v1/route', { change, context });
    }
    async generateExplanation(scoringResult, options) {
        return this.request('POST', '/api/v1/route/explain', { scoringResult, options });
    }
    // Health check
    async healthCheck() {
        return this.request('GET', '/health');
    }
}
exports.ReasonexApiClient = ReasonexApiClient;
// Factory function
function createApiClient(config, logger) {
    return new ReasonexApiClient(config, logger);
}
//# sourceMappingURL=api-client.js.map