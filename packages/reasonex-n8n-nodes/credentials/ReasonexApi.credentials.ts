import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class ReasonexApi implements ICredentialType {
  name = 'reasonexApi';
  displayName = 'Reasonex API';
  documentationUrl = 'https://docs.reasonex.ai/api';

  properties: INodeProperties[] = [
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

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
        'X-OpenAI-Key': '={{$credentials.openaiApiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.apiBaseUrl}}',
      url: '/health',
      method: 'GET',
    },
  };
}
