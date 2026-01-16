"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasonexLock = void 0;
const api_client_1 = require("../../lib/api-client");
const logger_1 = require("../../lib/logger");
class ReasonexLock {
    description = {
        displayName: 'Reasonex Lock',
        name: 'reasonexLock',
        icon: 'file:lock.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Lock data with cryptographic hashing for immutability',
        defaults: {
            name: 'Reasonex Lock',
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
                        name: 'Create Lock',
                        value: 'createLock',
                        description: 'Create a cryptographic lock for data',
                        action: 'Create a cryptographic lock',
                    },
                    {
                        name: 'Verify Lock',
                        value: 'verifyLock',
                        description: 'Verify data integrity against a lock',
                        action: 'Verify a cryptographic lock',
                    },
                ],
                default: 'createLock',
            },
            // Create Lock fields
            {
                displayName: 'Data',
                name: 'data',
                type: 'json',
                default: '={{ $json }}',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['createLock'],
                    },
                },
                description: 'The data object to lock',
            },
            {
                displayName: 'Hash Algorithm',
                name: 'algorithm',
                type: 'options',
                options: [
                    { name: 'SHA-256', value: 'SHA256' },
                    { name: 'SHA3-256', value: 'SHA3-256' },
                    { name: 'SHA-512', value: 'SHA512' },
                ],
                default: 'SHA256',
                displayOptions: {
                    show: {
                        operation: ['createLock'],
                    },
                },
                description: 'Hash algorithm to use',
            },
            {
                displayName: 'Include Timestamp',
                name: 'includeTimestamp',
                type: 'boolean',
                default: true,
                displayOptions: {
                    show: {
                        operation: ['createLock'],
                    },
                },
                description: 'Whether to include timestamp in hash calculation',
            },
            {
                displayName: 'Canonicalization',
                name: 'canonicalization',
                type: 'options',
                options: [
                    { name: 'Strict', value: 'strict' },
                    { name: 'Relaxed', value: 'relaxed' },
                ],
                default: 'strict',
                displayOptions: {
                    show: {
                        operation: ['createLock'],
                    },
                },
                description: 'JSON canonicalization mode',
            },
            {
                displayName: 'Schema ID',
                name: 'schemaId',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['createLock'],
                    },
                },
                description: 'Optional schema identifier for the data',
            },
            // Verify Lock fields
            {
                displayName: 'Data to Verify',
                name: 'verifyData',
                type: 'json',
                default: '={{ $json }}',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['verifyLock'],
                    },
                },
                description: 'The data to verify',
            },
            {
                displayName: 'Expected Hash',
                name: 'expectedHash',
                type: 'string',
                default: '',
                required: true,
                displayOptions: {
                    show: {
                        operation: ['verifyLock'],
                    },
                },
                description: 'The hash to verify against',
            },
            {
                displayName: 'Lock Timestamp',
                name: 'lockTimestamp',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        operation: ['verifyLock'],
                    },
                },
                description: 'Original lock timestamp (if timestamp was included in hash)',
            },
            // Debug mode
            {
                displayName: 'Debug Mode',
                name: 'debugMode',
                type: 'boolean',
                default: false,
                description: 'Whether to enable detailed logging',
            },
        ],
    };
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('reasonexApi');
        const debugMode = this.getNodeParameter('debugMode', 0);
        const logger = (0, logger_1.createNodeLogger)('ReasonexLock', this, debugMode);
        const apiClient = (0, api_client_1.createApiClient)({
            baseUrl: credentials.apiBaseUrl,
            apiKey: credentials.apiKey,
            debugMode,
        }, logger);
        for (let i = 0; i < items.length; i++) {
            try {
                const operation = this.getNodeParameter('operation', i);
                if (operation === 'createLock') {
                    const data = this.getNodeParameter('data', i);
                    const algorithm = this.getNodeParameter('algorithm', i);
                    const includeTimestamp = this.getNodeParameter('includeTimestamp', i);
                    const canonicalization = this.getNodeParameter('canonicalization', i);
                    const schemaId = this.getNodeParameter('schemaId', i);
                    logger.info('Creating lock', { algorithm, includeTimestamp, canonicalization });
                    const response = await apiClient.createLock(data, {
                        algorithm: algorithm,
                        includeTimestamp,
                        canonicalization: canonicalization,
                        schemaId: schemaId || undefined,
                    });
                    if (response.success && response.result) {
                        returnData.push({
                            json: response.result,
                            pairedItem: { item: i },
                        });
                    }
                    else {
                        throw new Error(response.message || response.error || 'Lock creation failed');
                    }
                }
                else if (operation === 'verifyLock') {
                    const verifyData = this.getNodeParameter('verifyData', i);
                    const expectedHash = this.getNodeParameter('expectedHash', i);
                    const lockTimestamp = this.getNodeParameter('lockTimestamp', i);
                    logger.info('Verifying lock', { hashPrefix: expectedHash.slice(0, 16) });
                    const response = await apiClient.verifyLock(verifyData, expectedHash, lockTimestamp || undefined);
                    if (response.success && response.result) {
                        returnData.push({
                            json: response.result,
                            pairedItem: { item: i },
                        });
                    }
                    else {
                        throw new Error(response.message || response.error || 'Lock verification failed');
                    }
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
exports.ReasonexLock = ReasonexLock;
//# sourceMappingURL=ReasonexLock.node.js.map