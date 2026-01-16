"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasonexValidation = void 0;
const api_client_1 = require("../../lib/api-client");
const logger_1 = require("../../lib/logger");
class ReasonexValidation {
    description = {
        displayName: 'Reasonex Validation',
        name: 'reasonexValidation',
        icon: 'file:validation.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Validate data with 5-check framework including hallucination detection',
        defaults: {
            name: 'Reasonex Validation',
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
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Validate',
                        value: 'validate',
                        description: 'Validate analysis data',
                        action: 'Validate data',
                    },
                    {
                        name: 'Get Profiles',
                        value: 'getProfiles',
                        description: 'Get available validation profiles',
                        action: 'Get profiles',
                    },
                ],
                default: 'validate',
            },
            // Validate fields
            {
                displayName: 'Analysis Data',
                name: 'analysis',
                type: 'json',
                default: '={{ $json }}',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['validate'],
                    },
                },
                description: 'The analysis data to validate',
            },
            {
                displayName: 'Validation Profile',
                name: 'profile',
                type: 'options',
                options: [
                    { name: 'Financial Strict', value: 'financial-strict' },
                    { name: 'General', value: 'general' },
                    { name: 'Custom', value: 'custom' },
                ],
                default: 'financial-strict',
                displayOptions: {
                    show: {
                        operation: ['validate'],
                    },
                },
                description: 'Validation profile to use',
            },
            {
                displayName: 'Custom Profile ID',
                name: 'customProfile',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['validate'],
                        profile: ['custom'],
                    },
                },
                description: 'Custom profile ID',
            },
            {
                displayName: 'Checks to Run',
                name: 'checks',
                type: 'multiOptions',
                options: [
                    { name: 'Schema Validation', value: 'schema' },
                    { name: 'Coverage Check', value: 'coverage' },
                    { name: 'Source Verification', value: 'sources' },
                    { name: 'Hallucination Detection', value: 'hallucination' },
                    { name: 'Rules Validation', value: 'rules' },
                ],
                default: ['schema', 'coverage', 'hallucination', 'rules'],
                displayOptions: {
                    show: {
                        operation: ['validate'],
                    },
                },
                description: 'Which validation checks to run',
            },
            {
                displayName: 'Strictness',
                name: 'strictness',
                type: 'options',
                options: [
                    { name: 'Strict', value: 'strict' },
                    { name: 'Normal', value: 'normal' },
                    { name: 'Lenient', value: 'lenient' },
                ],
                default: 'normal',
                displayOptions: {
                    show: {
                        operation: ['validate'],
                    },
                },
                description: 'Validation strictness level',
            },
            {
                displayName: 'Hallucination Sensitivity',
                name: 'hallucinationSensitivity',
                type: 'options',
                options: [
                    { name: 'High', value: 'high' },
                    { name: 'Medium', value: 'medium' },
                    { name: 'Low', value: 'low' },
                ],
                default: 'medium',
                displayOptions: {
                    show: {
                        operation: ['validate'],
                    },
                },
                description: 'Sensitivity for hallucination detection',
            },
            {
                displayName: 'Source Documents',
                name: 'sources',
                type: 'json',
                default: '[]',
                displayOptions: {
                    show: {
                        operation: ['validate'],
                    },
                },
                description: 'Source documents for verification',
            },
            {
                displayName: 'Scores',
                name: 'scores',
                type: 'json',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['validate'],
                    },
                },
                description: 'Scores to validate (from Rule Engine)',
            },
            // Debug mode
            {
                displayName: 'Debug Mode',
                name: 'debugMode',
                type: 'boolean',
                default: false,
                description: 'Whether to include detailed validation breakdown',
            },
        ],
    };
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('reasonexApi');
        const debugMode = this.getNodeParameter('debugMode', 0);
        const logger = (0, logger_1.createNodeLogger)('ReasonexValidation', this, debugMode);
        const apiClient = (0, api_client_1.createApiClient)({
            baseUrl: credentials.apiBaseUrl,
            apiKey: credentials.apiKey,
            debugMode,
        }, logger);
        const operation = this.getNodeParameter('operation', 0);
        if (operation === 'getProfiles') {
            logger.info('Getting validation profiles');
            const response = await apiClient.getValidationProfiles();
            if (response.success && response.result) {
                returnData.push({
                    json: response.result,
                });
            }
            else {
                throw new Error(response.message || response.error || 'Failed to get profiles');
            }
        }
        else {
            for (let i = 0; i < items.length; i++) {
                try {
                    const analysis = this.getNodeParameter('analysis', i);
                    const profileParam = this.getNodeParameter('profile', i);
                    const customProfile = this.getNodeParameter('customProfile', i);
                    const profile = profileParam === 'custom' ? customProfile : profileParam;
                    const checks = this.getNodeParameter('checks', i);
                    const strictness = this.getNodeParameter('strictness', i);
                    const hallucinationSensitivity = this.getNodeParameter('hallucinationSensitivity', i);
                    const sources = this.getNodeParameter('sources', i);
                    const scoresStr = this.getNodeParameter('scores', i);
                    let scores;
                    if (scoresStr && scoresStr.trim()) {
                        scores = typeof scoresStr === 'string' ? JSON.parse(scoresStr) : scoresStr;
                    }
                    logger.info('Validating item', { index: i, profile, checks });
                    const response = await apiClient.validate(analysis, {
                        sources: sources,
                        scores,
                        profile,
                        checks,
                        strictness: strictness,
                        hallucinationSensitivity: hallucinationSensitivity,
                        debugMode,
                    });
                    if (response.success && response.result) {
                        returnData.push({
                            json: response.result,
                            pairedItem: { item: i },
                        });
                    }
                    else {
                        throw new Error(response.message || response.error || 'Validation failed');
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
        }
        return [returnData];
    }
}
exports.ReasonexValidation = ReasonexValidation;
//# sourceMappingURL=ReasonexValidation.node.js.map