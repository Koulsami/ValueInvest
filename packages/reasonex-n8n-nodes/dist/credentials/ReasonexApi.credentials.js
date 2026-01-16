"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReasonexApi = void 0;
class ReasonexApi {
    name = 'reasonexApi';
    displayName = 'Reasonex API';
    documentationUrl = 'https://docs.reasonex.ai/api';
    properties = [
        {
            displayName: 'API Base URL',
            name: 'apiBaseUrl',
            type: 'string',
            default: 'https://reasonex-core-api-production.up.railway.app',
            description: 'The base URL for the Reasonex Core API',
        },
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            description: 'Your Reasonex API key (optional for basic usage)',
        },
        {
            displayName: 'OpenAI API Key',
            name: 'openaiApiKey',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            description: 'OpenAI API key for Tree Builder operations (optional)',
        },
    ];
    authenticate = {
        type: 'generic',
        properties: {
            headers: {
                'X-API-Key': '={{$credentials.apiKey}}',
                'X-OpenAI-Key': '={{$credentials.openaiApiKey}}',
            },
        },
    };
    test = {
        request: {
            baseURL: '={{$credentials.apiBaseUrl}}',
            url: '/health',
            method: 'GET',
        },
    };
}
exports.ReasonexApi = ReasonexApi;
//# sourceMappingURL=ReasonexApi.credentials.js.map