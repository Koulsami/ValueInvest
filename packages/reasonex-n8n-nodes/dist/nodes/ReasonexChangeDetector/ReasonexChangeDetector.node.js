"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasonexChangeDetector = void 0;
const api_client_1 = require("../../lib/api-client");
const logger_1 = require("../../lib/logger");
class ReasonexChangeDetector {
    description = {
        displayName: 'Reasonex Change Detector',
        name: 'reasonexChangeDetector',
        icon: 'file:detect.svg',
        group: ['transform'],
        version: 1,
        subtitle: 'Detect changes between versions',
        description: 'Detect and assess impact of changes between data versions',
        defaults: {
            name: 'Reasonex Change Detector',
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
                displayName: 'Old Version',
                name: 'oldVersion',
                type: 'json',
                default: '',
                required: true,
                description: 'The previous version of the data',
            },
            {
                displayName: 'New Version',
                name: 'newVersion',
                type: 'json',
                default: '={{ $json }}',
                required: true,
                description: 'The new version of the data',
            },
            {
                displayName: 'Comparison Depth',
                name: 'comparisonDepth',
                type: 'options',
                options: [
                    { name: 'Deep', value: 'deep' },
                    { name: 'Shallow', value: 'shallow' },
                ],
                default: 'deep',
                description: 'Depth of comparison',
            },
            {
                displayName: 'High Impact Fields',
                name: 'highImpactFields',
                type: 'string',
                default: 'totalScore,classification,recommendation',
                description: 'Comma-separated list of high impact fields',
            },
            {
                displayName: 'Numeric Tolerance (%)',
                name: 'numericTolerance',
                type: 'number',
                typeOptions: {
                    minValue: 0,
                    maxValue: 100,
                    numberStepSize: 0.5,
                },
                default: 1,
                description: 'Percentage tolerance for numeric changes',
            },
            {
                displayName: 'Ignore Fields',
                name: 'ignoreFields',
                type: 'string',
                default: 'timestamp,lastUpdated,_id',
                description: 'Comma-separated list of fields to ignore',
            },
            // Debug mode
            {
                displayName: 'Debug Mode',
                name: 'debugMode',
                type: 'boolean',
                default: false,
                description: 'Whether to include detailed debug info',
            },
        ],
    };
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('reasonexApi');
        const debugMode = this.getNodeParameter('debugMode', 0);
        const logger = (0, logger_1.createNodeLogger)('ReasonexChangeDetector', this, debugMode);
        const apiClient = (0, api_client_1.createApiClient)({
            baseUrl: credentials.apiBaseUrl,
            apiKey: credentials.apiKey,
            debugMode,
        }, logger);
        for (let i = 0; i < items.length; i++) {
            try {
                const oldVersionStr = this.getNodeParameter('oldVersion', i);
                const newVersionStr = this.getNodeParameter('newVersion', i);
                const comparisonDepth = this.getNodeParameter('comparisonDepth', i);
                const highImpactFieldsStr = this.getNodeParameter('highImpactFields', i);
                const numericTolerance = this.getNodeParameter('numericTolerance', i);
                const ignoreFieldsStr = this.getNodeParameter('ignoreFields', i);
                const oldVersion = typeof oldVersionStr === 'string' ? JSON.parse(oldVersionStr) : oldVersionStr;
                const newVersion = typeof newVersionStr === 'string' ? JSON.parse(newVersionStr) : newVersionStr;
                const highImpactFields = highImpactFieldsStr.split(',').map(f => f.trim()).filter(f => f);
                const ignoreFields = ignoreFieldsStr.split(',').map(f => f.trim()).filter(f => f);
                logger.info('Detecting changes', { index: i, comparisonDepth });
                const response = await apiClient.detectChanges(oldVersion, newVersion, {
                    materialityConfig: {
                        highImpactFields,
                        numericTolerance,
                        ignoreFields,
                    },
                    comparisonDepth: comparisonDepth,
                    debugMode,
                });
                if (response.success && response.result) {
                    returnData.push({
                        json: response.result,
                        pairedItem: { item: i },
                    });
                }
                else {
                    throw new Error(response.message || response.error || 'Change detection failed');
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
exports.ReasonexChangeDetector = ReasonexChangeDetector;
//# sourceMappingURL=ReasonexChangeDetector.node.js.map