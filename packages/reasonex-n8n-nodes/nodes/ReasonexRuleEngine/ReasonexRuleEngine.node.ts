import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexRuleEngine implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reasonex Rule Engine',
    name: 'reasonexRuleEngine',
    icon: 'file:engine.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Score data using configurable rule sets',
    defaults: {
      name: 'Reasonex Rule Engine',
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
            name: 'Score',
            value: 'score',
            description: 'Score data against a rule set',
            action: 'Score data',
          },
          {
            name: 'Batch Score',
            value: 'batchScore',
            description: 'Score multiple items in batch',
            action: 'Batch score data',
          },
          {
            name: 'Get Rule Sets',
            value: 'getRuleSets',
            description: 'Get available rule sets',
            action: 'Get rule sets',
          },
        ],
        default: 'score',
      },
      // Score fields
      {
        displayName: 'Data',
        name: 'data',
        type: 'json',
        default: '={{ $json }}',
        required: true,
        displayOptions: {
          show: {
            operation: ['score'],
          },
        },
        description: 'The data object to score',
      },
      {
        displayName: 'Rule Set ID',
        name: 'ruleSetId',
        type: 'options',
        options: [
          { name: 'Investment V1', value: 'investment-v1' },
          { name: 'Legal Costs V1', value: 'legal-costs-v1' },
          { name: 'Custom', value: 'custom' },
        ],
        default: 'investment-v1',
        displayOptions: {
          show: {
            operation: ['score', 'batchScore'],
          },
        },
        description: 'The rule set to use for scoring',
      },
      {
        displayName: 'Custom Rule Set ID',
        name: 'customRuleSetId',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['score', 'batchScore'],
            ruleSetId: ['custom'],
          },
        },
        description: 'Custom rule set ID',
      },
      {
        displayName: 'Context',
        name: 'context',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            operation: ['score', 'batchScore'],
          },
        },
        description: 'Additional context for scoring (e.g., vertical, jurisdiction)',
      },
      // Batch Score fields
      {
        displayName: 'Items Field',
        name: 'itemsField',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['batchScore'],
          },
        },
        description: 'Field containing array of items to score (leave empty to use all input items)',
      },
      // Debug mode
      {
        displayName: 'Debug Mode',
        name: 'debugMode',
        type: 'boolean',
        default: false,
        description: 'Whether to include detailed scoring breakdown in output',
      },
      {
        displayName: 'Return Explanation',
        name: 'returnExplanation',
        type: 'boolean',
        default: true,
        displayOptions: {
          show: {
            operation: ['score'],
          },
        },
        description: 'Whether to include human-readable explanation',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexRuleEngine', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      debugMode,
    }, logger);

    const operation = this.getNodeParameter('operation', 0) as string;

    if (operation === 'getRuleSets') {
      logger.info('Getting rule sets');
      const response = await apiClient.getRuleSets();

      if (response.success && response.result) {
        returnData.push({
          json: response.result,
        });
      } else {
        throw new Error(response.message || response.error || 'Failed to get rule sets');
      }
    } else if (operation === 'batchScore') {
      const ruleSetIdParam = this.getNodeParameter('ruleSetId', 0) as string;
      const customRuleSetId = this.getNodeParameter('customRuleSetId', 0) as string;
      const ruleSetId = ruleSetIdParam === 'custom' ? customRuleSetId : ruleSetIdParam;
      const context = this.getNodeParameter('context', 0) as object;
      const itemsField = this.getNodeParameter('itemsField', 0) as string;

      // Get items to score
      let itemsToScore: Record<string, unknown>[];
      if (itemsField) {
        itemsToScore = items[0].json[itemsField] as IDataObject[];
      } else {
        itemsToScore = items.map(item => item.json);
      }

      logger.info('Batch scoring', { ruleSetId, itemCount: itemsToScore.length });

      const response = await apiClient.batchScore(itemsToScore, ruleSetId, context as IDataObject, debugMode);

      if (response.success && response.result) {
        returnData.push({
          json: response.result as IDataObject,
        });
      } else {
        throw new Error(response.message || response.error || 'Batch scoring failed');
      }
    } else {
      // Single score operation
      for (let i = 0; i < items.length; i++) {
        try {
          const data = this.getNodeParameter('data', i) as object;
          const ruleSetIdParam = this.getNodeParameter('ruleSetId', i) as string;
          const customRuleSetId = this.getNodeParameter('customRuleSetId', i) as string;
          const ruleSetId = ruleSetIdParam === 'custom' ? customRuleSetId : ruleSetIdParam;
          const context = this.getNodeParameter('context', i) as object;

          logger.info('Scoring item', { index: i, ruleSetId });

          const response = await apiClient.score(
            data as IDataObject,
            ruleSetId,
            context as IDataObject,
            debugMode
          );

          if (response.success && response.result) {
            returnData.push({
              json: response.result as IDataObject,
              pairedItem: { item: i },
            });
          } else {
            throw new Error(response.message || response.error || 'Scoring failed');
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
    }

    return [returnData];
  }
}
