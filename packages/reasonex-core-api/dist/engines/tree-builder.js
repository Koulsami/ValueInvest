"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.treeBuilder = exports.TreeBuilder = void 0;
const openai_1 = __importDefault(require("openai"));
const logger_1 = require("../lib/logger");
const tracer_1 = require("../lib/tracer");
// Default schemas
const DEFAULT_SCHEMAS = {
    'company-6d': {
        id: 'company-6d',
        name: 'Company Analysis (6D Framework)',
        vertical: 'investment',
        outputFormat: 'json',
        sections: [
            {
                id: 'executive-summary',
                name: 'Executive Summary',
                description: 'Brief overview of investment thesis, key strengths, risks, and recommendation',
                required: true,
            },
            {
                id: 'business-overview',
                name: 'Business Overview',
                description: 'Company description, products/services, market position, business model',
                required: true,
            },
            {
                id: 'financial-health',
                name: 'Financial Health Assessment',
                description: 'Revenue trends, profitability, cash flow quality, balance sheet strength',
                required: true,
            },
            {
                id: 'competitive-moat',
                name: 'Competitive Moat Analysis',
                description: 'Competitive advantages, barriers to entry, market share, brand strength',
                required: true,
            },
            {
                id: 'growth-prospects',
                name: 'Growth Prospects',
                description: 'Growth drivers, market expansion opportunities, product pipeline',
                required: true,
            },
            {
                id: 'valuation',
                name: 'Valuation Assessment',
                description: 'Current multiples, historical comparison, peer comparison, intrinsic value',
                required: true,
            },
            {
                id: 'risks',
                name: 'Key Risks',
                description: 'Company-specific risks, industry headwinds, regulatory concerns',
                required: true,
            },
            {
                id: 'recommendation',
                name: 'Investment Recommendation',
                description: 'Buy/Hold/Sell recommendation with target price and time horizon',
                required: true,
            },
        ],
    },
    'legal-cost-tree': {
        id: 'legal-cost-tree',
        name: 'Legal Cost Analysis',
        vertical: 'legal',
        outputFormat: 'json',
        sections: [
            { id: 'case-summary', name: 'Case Summary', description: 'Brief overview of the case', required: true },
            { id: 'cost-breakdown', name: 'Cost Breakdown', description: 'Itemized legal costs', required: true },
            { id: 'time-allocation', name: 'Time Allocation', description: 'Time spent by task category', required: true },
            { id: 'reasonableness', name: 'Reasonableness Assessment', description: 'Assessment of cost reasonableness', required: true },
        ],
    },
};
// Tree Builder class
class TreeBuilder {
    logger;
    tracer;
    schemas = new Map();
    openaiClient;
    constructor(logger) {
        this.logger = logger || new logger_1.Logger(undefined, { service: 'reasonex-core-api', node: 'TreeBuilder' });
        this.tracer = new tracer_1.Tracer('TreeBuilder', this.logger);
        // Load default schemas
        for (const [id, schema] of Object.entries(DEFAULT_SCHEMAS)) {
            this.schemas.set(id, schema);
        }
        // Initialize OpenAI client if API key available
        if (process.env.OPENAI_API_KEY) {
            this.openaiClient = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
        }
    }
    /**
     * Register a custom schema
     */
    registerSchema(schema) {
        this.schemas.set(schema.id, schema);
        this.logger.info(`Registered tree schema: ${schema.id}`);
    }
    /**
     * Get available schemas
     */
    getSchemas() {
        return Array.from(this.schemas.keys());
    }
    /**
     * Get a specific schema
     */
    getSchema(id) {
        return this.schemas.get(id);
    }
    /**
     * Build system prompt for tree generation
     */
    buildSystemPrompt(schema) {
        const sectionsDescription = schema.sections
            .map(s => `- ${s.name}: ${s.description}${s.required ? ' (required)' : ''}`)
            .join('\n');
        return `You are an expert ${schema.vertical} analyst. Your task is to generate a structured analysis following the ${schema.name} framework.

Output Format: ${schema.outputFormat.toUpperCase()}

Required Sections:
${sectionsDescription}

Guidelines:
1. Be specific and factual, avoid vague statements
2. Support assertions with data when available
3. Acknowledge uncertainty where information is incomplete
4. Use professional, objective language
5. Structure output as valid JSON with the following format:

{
  "sections": [
    {
      "sectionId": "section-id",
      "sectionName": "Section Name",
      "content": "Detailed analysis content...",
      "confidence": 0.0-1.0,
      "sources": ["source1", "source2"]
    }
  ]
}`;
    }
    /**
     * Build user prompt for tree generation
     */
    buildUserPrompt(entity, documents, schema) {
        const entityJson = JSON.stringify(entity, null, 2);
        const docsPreview = documents.slice(0, 3).map((d, i) => {
            if (typeof d === 'string')
                return `Document ${i + 1}: ${d.slice(0, 500)}...`;
            if (typeof d === 'object')
                return `Document ${i + 1}: ${JSON.stringify(d).slice(0, 500)}...`;
            return `Document ${i + 1}: (unknown format)`;
        }).join('\n\n');
        return `Analyze the following entity and generate a ${schema.name}:

Entity Data:
${entityJson}

${documents.length > 0 ? `Supporting Documents (${documents.length} total):\n${docsPreview}` : 'No supporting documents provided.'}

Generate the analysis following the schema structure. Ensure all required sections are included.`;
    }
    /**
     * Call LLM to generate tree
     */
    async callLLM(systemPrompt, userPrompt, config) {
        const { provider, model, temperature = 0.3, maxTokens = 4000 } = config;
        if (provider === 'openai') {
            if (!this.openaiClient) {
                throw new Error('OpenAI client not initialized - set OPENAI_API_KEY');
            }
            const response = await this.openaiClient.chat.completions.create({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                temperature,
                max_tokens: maxTokens,
                response_format: { type: 'json_object' },
            });
            return {
                content: response.choices[0]?.message?.content || '',
                tokensUsed: response.usage?.total_tokens || 0,
            };
        }
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
    /**
     * Parse LLM response into tree nodes
     */
    parseResponse(content, schema) {
        try {
            // Clean up response
            let cleaned = content.trim();
            if (cleaned.startsWith('```json')) {
                cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            const parsed = JSON.parse(cleaned);
            if (!parsed.sections || !Array.isArray(parsed.sections)) {
                throw new Error('Response missing sections array');
            }
            return parsed.sections.map(s => ({
                sectionId: s.sectionId,
                sectionName: s.sectionName,
                content: s.content,
                confidence: s.confidence || 0.5,
                sources: s.sources,
                children: s.children,
            }));
        }
        catch (error) {
            this.logger.warn('Failed to parse LLM response as JSON', { error: error.message });
            // Return raw content as single node
            return [{
                    sectionId: 'raw-content',
                    sectionName: 'Analysis',
                    content,
                    confidence: 0.5,
                }];
        }
    }
    /**
     * Calculate coverage report
     */
    calculateCoverage(tree, schema) {
        const requiredSections = schema.sections.filter(s => s.required).map(s => s.id);
        const completedSections = tree.map(n => n.sectionId);
        const missingSections = requiredSections.filter(id => !completedSections.includes(id));
        return {
            totalSections: schema.sections.length,
            completedSections: completedSections.length,
            missingSections,
            coveragePercentage: requiredSections.length > 0
                ? ((requiredSections.length - missingSections.length) / requiredSections.length) * 100
                : 100,
        };
    }
    /**
     * Calculate confidence map
     */
    calculateConfidenceMap(tree) {
        const map = {};
        for (const node of tree) {
            map[node.sectionId] = node.confidence;
            if (node.children) {
                for (const child of node.children) {
                    map[`${node.sectionId}.${child.sectionId}`] = child.confidence;
                }
            }
        }
        return map;
    }
    /**
     * Build analysis tree
     */
    async buildTree(entity, documents = [], options) {
        return this.tracer.withSpan('buildTree', async (span) => {
            const startTime = Date.now();
            // Get schema
            const schema = typeof options.schema === 'string'
                ? this.schemas.get(options.schema)
                : options.schema;
            if (!schema) {
                span.setStatus(tracer_1.SpanStatus.ERROR, 'Schema not found');
                throw new Error(`Schema not found: ${options.schema}`);
            }
            span.setAttributes({
                schemaId: schema.id,
                entityKeys: Object.keys(entity).length,
                documentCount: documents.length,
            });
            this.logger.info('Building tree', {
                operation: 'buildTree',
                schemaId: schema.id,
                entityKeys: Object.keys(entity).length,
                documentCount: documents.length,
            });
            // Default LLM config
            const llmConfig = {
                provider: 'openai',
                model: 'gpt-4o-mini',
                temperature: 0.3,
                maxTokens: 4000,
                maxRetries: 3,
                ...options.llmConfig,
            };
            // Build prompts
            const systemPrompt = this.buildSystemPrompt(schema);
            const userPrompt = this.buildUserPrompt(entity, documents, schema);
            // Call LLM with retries
            let response = null;
            let retries = 0;
            while (retries < (llmConfig.maxRetries || 3)) {
                try {
                    response = await this.callLLM(systemPrompt, userPrompt, llmConfig);
                    break;
                }
                catch (error) {
                    retries++;
                    this.logger.warn(`LLM call failed, retry ${retries}`, { error: error.message });
                    if (retries >= (llmConfig.maxRetries || 3)) {
                        span.setStatus(tracer_1.SpanStatus.ERROR, 'LLM call failed');
                        throw error;
                    }
                    // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
                }
            }
            if (!response) {
                throw new Error('Failed to get LLM response');
            }
            // Parse response
            const tree = this.parseResponse(response.content, schema);
            // Calculate metrics
            const coverageReport = this.calculateCoverage(tree, schema);
            const confidenceMap = this.calculateConfidenceMap(tree);
            const executionTime = Date.now() - startTime;
            const result = {
                tree,
                metadata: {
                    schema: schema.id,
                    provider: llmConfig.provider,
                    model: llmConfig.model,
                    tokensUsed: response.tokensUsed,
                    executionTime_ms: executionTime,
                    retries,
                },
                coverageReport,
                confidenceMap,
            };
            span.setAttributes({
                tokensUsed: response.tokensUsed,
                coveragePercentage: coverageReport.coveragePercentage,
                executionTime_ms: executionTime,
            });
            this.logger.info('Tree built successfully', {
                operation: 'buildTree',
                schemaId: schema.id,
                tokensUsed: response.tokensUsed,
                coveragePercentage: coverageReport.coveragePercentage,
                executionTime_ms: executionTime,
            });
            return result;
        });
    }
}
exports.TreeBuilder = TreeBuilder;
// Default instance
exports.treeBuilder = new TreeBuilder();
exports.default = exports.treeBuilder;
//# sourceMappingURL=tree-builder.js.map