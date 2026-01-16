"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasonexExplanation = void 0;
const api_client_1 = require("../../lib/api-client");
const logger_1 = require("../../lib/logger");
class ReasonexExplanation {
    description = {
        displayName: 'Reasonex Explanation',
        name: 'reasonexExplanation',
        icon: 'file:explanation.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["audience"]}} explanation',
        description: 'Generate human-readable explanations for scoring results',
        defaults: {
            name: 'Reasonex Explanation',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'reasonexApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Scoring Result',
                name: 'scoringResult',
                type: 'json',
                default: '={{ $json }}',
                required: true,
                description: 'The scoring result from Rule Engine to explain',
            },
            {
                displayName: 'Audience',
                name: 'audience',
                type: 'options',
                options: [
                    { name: 'Expert', value: 'expert', description: 'Technical, detailed explanations' },
                    { name: 'Professional', value: 'professional', description: 'Business-level explanations' },
                    { name: 'Consumer', value: 'consumer', description: 'Simple, accessible explanations' },
                ],
                default: 'professional',
                description: 'Target audience for the explanation',
            },
            {
                displayName: 'Verbosity',
                name: 'verbosity',
                type: 'options',
                options: [
                    { name: 'Brief', value: 'brief', description: 'Short summary only' },
                    { name: 'Standard', value: 'standard', description: 'Summary with key factors' },
                    { name: 'Detailed', value: 'detailed', description: 'Full breakdown with all details' },
                ],
                default: 'standard',
                description: 'Level of detail in explanation',
            },
            {
                displayName: 'Include Citations',
                name: 'includeCitations',
                type: 'boolean',
                default: true,
                description: 'Whether to include data citations in explanation',
            },
            {
                displayName: 'Language',
                name: 'language',
                type: 'options',
                options: [
                    { name: 'English', value: 'en' },
                ],
                default: 'en',
                description: 'Language for explanation',
            },
            // Debug mode
            {
                displayName: 'Debug Mode',
                name: 'debugMode',
                type: 'boolean',
                default: false,
                description: 'Whether to include generation metadata',
            },
        ],
    };
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('reasonexApi');
        const debugMode = this.getNodeParameter('debugMode', 0);
        const logger = (0, logger_1.createNodeLogger)('ReasonexExplanation', this, debugMode);
        const apiClient = (0, api_client_1.createApiClient)({
            baseUrl: credentials.apiBaseUrl,
            apiKey: credentials.apiKey,
            debugMode,
        }, logger);
        for (let i = 0; i < items.length; i++) {
            try {
                const scoringResultStr = this.getNodeParameter('scoringResult', i);
                const audience = this.getNodeParameter('audience', i);
                const verbosity = this.getNodeParameter('verbosity', i);
                const includeCitations = this.getNodeParameter('includeCitations', i);
                const language = this.getNodeParameter('language', i);
                const scoringResult = typeof scoringResultStr === 'string'
                    ? JSON.parse(scoringResultStr)
                    : scoringResultStr;
                logger.info('Generating explanation', { index: i, audience, verbosity });
                const response = await apiClient.generateExplanation(scoringResult, {
                    audience: audience,
                    verbosity: verbosity,
                    includeCitations,
                    language,
                });
                if (response.success && response.result) {
                    returnData.push({
                        json: response.result,
                        pairedItem: { item: i },
                    });
                }
                else {
                    throw new Error(response.message || response.error || 'Explanation generation failed');
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error instanceof Error ? error.message : String(error),
                        },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.ReasonexExplanation = ReasonexExplanation;
//# sourceMappingURL=ReasonexExplanation.node.js.map