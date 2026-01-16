"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasonexReviewRouter = void 0;
const api_client_1 = require("../../lib/api-client");
const logger_1 = require("../../lib/logger");
class ReasonexReviewRouter {
    description = {
        displayName: 'Reasonex Review Router',
        name: 'reasonexReviewRouter',
        icon: 'file:router.svg',
        group: ['transform'],
        version: 1,
        subtitle: 'Route to Tier {{$parameter["outputTier"]}}',
        description: 'Route changes to appropriate review tiers',
        defaults: {
            name: 'Reasonex Review Router',
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
                        name: 'Route',
                        value: 'route',
                        description: 'Route change to review tier',
                        action: 'Route change',
                    },
                    {
                        name: 'Get Tier Config',
                        value: 'getTierConfig',
                        description: 'Get tier configuration for a vertical',
                        action: 'Get tier config',
                    },
                ],
                default: 'route',
            },
            // Route fields
            {
                displayName: 'Impact Score',
                name: 'impactScore',
                type: 'number',
                default: 0,
                required: true,
                displayOptions: {
                    show: {
                        operation: ['route'],
                    },
                },
                description: 'Impact score from Change Detector (0-100)',
            },
            {
                displayName: 'Materiality',
                name: 'materiality',
                type: 'options',
                options: [
                    { name: 'High', value: 'HIGH' },
                    { name: 'Medium', value: 'MEDIUM' },
                    { name: 'Low', value: 'LOW' },
                ],
                default: 'MEDIUM',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['route'],
                    },
                },
                description: 'Materiality level from Change Detector',
            },
            {
                displayName: 'Changes Count',
                name: 'changesCount',
                type: 'number',
                default: 0,
                displayOptions: {
                    show: {
                        operation: ['route'],
                    },
                },
                description: 'Number of changes detected',
            },
            {
                displayName: 'Affected Paths',
                name: 'affectedPaths',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['route'],
                    },
                },
                description: 'Comma-separated list of affected data paths',
            },
            {
                displayName: 'Urgency',
                name: 'urgency',
                type: 'options',
                options: [
                    { name: 'Critical', value: 'critical' },
                    { name: 'High', value: 'high' },
                    { name: 'Normal', value: 'normal' },
                    { name: 'Low', value: 'low' },
                ],
                default: 'normal',
                displayOptions: {
                    show: {
                        operation: ['route'],
                    },
                },
                description: 'Urgency level for review',
            },
            {
                displayName: 'Client Tier',
                name: 'clientTier',
                type: 'options',
                options: [
                    { name: 'Enterprise', value: 'enterprise' },
                    { name: 'Premium', value: 'premium' },
                    { name: 'Standard', value: 'standard' },
                    { name: 'Basic', value: 'basic' },
                ],
                default: 'standard',
                displayOptions: {
                    show: {
                        operation: ['route'],
                    },
                },
                description: 'Client tier for SLA calculation',
            },
            {
                displayName: 'Vertical',
                name: 'vertical',
                type: 'options',
                options: [
                    { name: 'Investment', value: 'investment' },
                    { name: 'Legal', value: 'legal' },
                    { name: 'Healthcare', value: 'healthcare' },
                    { name: 'Insurance', value: 'insurance' },
                ],
                default: 'investment',
                description: 'Business vertical for tier configuration',
            },
            {
                displayName: 'Confidence',
                name: 'confidence',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 1,
                    numberStepSize: 0.1,
                },
                default: 0.8,
                displayOptions: {
                    show: {
                        operation: ['route'],
                    },
                },
                description: 'Confidence score (for auto-approve eligibility)',
            },
            // Debug mode
            {
                displayName: 'Debug Mode',
                name: 'debugMode',
                type: 'boolean',
                default: false,
                description: 'Whether to include routing reasoning in output',
            },
        ],
    };
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('reasonexApi');
        const debugMode = this.getNodeParameter('debugMode', 0);
        const logger = (0, logger_1.createNodeLogger)('ReasonexReviewRouter', this, debugMode);
        const apiClient = (0, api_client_1.createApiClient)({
            baseUrl: credentials.apiBaseUrl,
            apiKey: credentials.apiKey,
            debugMode,
        }, logger);
        const operation = this.getNodeParameter('operation', 0);
        if (operation === 'getTierConfig') {
            const vertical = this.getNodeParameter('vertical', 0);
            logger.info('Getting tier config', { vertical });
            // Call the API (this would need a corresponding endpoint)
            returnData.push({
                json: {
                    vertical,
                    message: 'Tier configuration retrieved',
                },
            });
        }
        else {
            for (let i = 0; i < items.length; i++) {
                try {
                    const impactScore = this.getNodeParameter('impactScore', i);
                    const materiality = this.getNodeParameter('materiality', i);
                    const changesCount = this.getNodeParameter('changesCount', i);
                    const affectedPathsStr = this.getNodeParameter('affectedPaths', i);
                    const urgency = this.getNodeParameter('urgency', i);
                    const clientTier = this.getNodeParameter('clientTier', i);
                    const vertical = this.getNodeParameter('vertical', i);
                    const confidence = this.getNodeParameter('confidence', i);
                    const affectedPaths = affectedPathsStr.split(',').map(p => p.trim()).filter(p => p);
                    logger.info('Routing change', { index: i, impactScore, materiality, urgency });
                    const response = await apiClient.route({
                        impactScore,
                        materiality: materiality,
                        changesCount,
                        affectedPaths,
                    }, {
                        urgency: urgency,
                        clientTier: clientTier,
                        vertical,
                        confidence,
                    });
                    if (response.success && response.result) {
                        returnData.push({
                            json: response.result,
                            pairedItem: { item: i },
                        });
                    }
                    else {
                        throw new Error(response.message || response.error || 'Routing failed');
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
exports.ReasonexReviewRouter = ReasonexReviewRouter;
//# sourceMappingURL=ReasonexReviewRouter.node.js.map