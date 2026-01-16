import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexExplanation implements INodeType {
  description: INodeTypeDescription = {
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

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexExplanation', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      debugMode,
    }, logger);

    for (let i = 0; i < items.length; i++) {
      try {
        const scoringResultStr = this.getNodeParameter('scoringResult', i) as string;
        const audience = this.getNodeParameter('audience', i) as string;
        const verbosity = this.getNodeParameter('verbosity', i) as string;
        const includeCitations = this.getNodeParameter('includeCitations', i) as boolean;
        const language = this.getNodeParameter('language', i) as string;

        const scoringResult = typeof scoringResultStr === 'string'
          ? JSON.parse(scoringResultStr)
          : scoringResultStr;

        logger.info('Generating explanation', { index: i, audience, verbosity });

        const response = await apiClient.generateExplanation(
          scoringResult,
          {
            audience: audience as 'expert' | 'professional' | 'consumer',
            verbosity: verbosity as 'brief' | 'standard' | 'detailed',
            includeCitations,
            language,
          }
        );

        if (response.success && response.result) {
          returnData.push({
            json: response.result as IDataObject,
            pairedItem: { item: i },
          });
        } else {
          throw new Error(response.message || response.error || 'Explanation generation failed');
        }
      } catch (error) {
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
