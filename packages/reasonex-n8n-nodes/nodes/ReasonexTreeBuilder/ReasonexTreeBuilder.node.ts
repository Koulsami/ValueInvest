import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexTreeBuilder implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Reasonex Tree Builder',
    name: 'reasonexTreeBuilder',
    icon: 'file:tree.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Build structured analysis trees using AI',
    defaults: {
      name: 'Reasonex Tree Builder',
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
            name: 'Build Tree',
            value: 'buildTree',
            description: 'Build analysis tree from entity and documents',
            action: 'Build analysis tree',
          },
          {
            name: 'Get Schemas',
            value: 'getSchemas',
            description: 'Get available tree schemas',
            action: 'Get schemas',
          },
        ],
        default: 'buildTree',
      },
      // Build Tree fields
      {
        displayName: 'Entity',
        name: 'entity',
        type: 'json',
        default: '={{ $json }}',
        required: true,
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'The entity to analyze (e.g., company data)',
      },
      {
        displayName: 'Documents',
        name: 'documents',
        type: 'json',
        default: '[]',
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'Source documents for analysis',
      },
      {
        displayName: 'Schema',
        name: 'schema',
        type: 'options',
        options: [
          { name: 'Company Analysis (6D)', value: 'company-6d' },
          { name: 'Legal Cost Tree', value: 'legal-cost-tree' },
          { name: 'Custom', value: 'custom' },
        ],
        default: 'company-6d',
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'Tree schema to use',
      },
      {
        displayName: 'Custom Schema ID',
        name: 'customSchema',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['buildTree'],
            schema: ['custom'],
          },
        },
        description: 'Custom schema ID',
      },
      {
        displayName: 'LLM Provider',
        name: 'llmProvider',
        type: 'options',
        options: [
          { name: 'OpenAI', value: 'openai' },
          { name: 'Anthropic', value: 'anthropic' },
        ],
        default: 'openai',
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'AI provider to use',
      },
      {
        displayName: 'Model',
        name: 'llmModel',
        type: 'options',
        options: [
          { name: 'GPT-4o Mini', value: 'gpt-4o-mini' },
          { name: 'GPT-4o', value: 'gpt-4o' },
          { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
          { name: 'Claude 3 Sonnet', value: 'claude-sonnet-4-20250514' },
          { name: 'Claude 3 Opus', value: 'claude-opus-4-20250514' },
        ],
        default: 'gpt-4o-mini',
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'AI model to use',
      },
      {
        displayName: 'Temperature',
        name: 'temperature',
        type: 'number',
        typeOptions: {
          minValue: 0,
          maxValue: 1,
          numberStepSize: 0.1,
        },
        default: 0.3,
        displayOptions: {
          show: {
            operation: ['buildTree'],
          },
        },
        description: 'AI temperature (0 = deterministic, 1 = creative)',
      },
      // Debug mode
      {
        displayName: 'Debug Mode',
        name: 'debugMode',
        type: 'boolean',
        default: false,
        description: 'Whether to include detailed metadata in output',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexTreeBuilder', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      openaiApiKey: credentials.openaiApiKey as string,
      debugMode,
    }, logger);

    const operation = this.getNodeParameter('operation', 0) as string;

    if (operation === 'getSchemas') {
      logger.info('Getting tree schemas');
      const response = await apiClient.getTreeSchemas();

      if (response.success && response.result) {
        returnData.push({
          json: response.result,
        });
      } else {
        throw new Error(response.message || response.error || 'Failed to get schemas');
      }
    } else {
      for (let i = 0; i < items.length; i++) {
        try {
          const entity = this.getNodeParameter('entity', i) as object;
          const documents = this.getNodeParameter('documents', i) as unknown[];
          const schemaParam = this.getNodeParameter('schema', i) as string;
          const customSchema = this.getNodeParameter('customSchema', i) as string;
          const schema = schemaParam === 'custom' ? customSchema : schemaParam;
          const llmProvider = this.getNodeParameter('llmProvider', i) as string;
          const llmModel = this.getNodeParameter('llmModel', i) as string;
          const temperature = this.getNodeParameter('temperature', i) as number;

          logger.info('Building tree', { index: i, schema, llmProvider, llmModel });

          const response = await apiClient.buildTree(
            entity as IDataObject,
            documents,
            schema,
            {
              llmConfig: {
                provider: llmProvider as 'openai' | 'anthropic',
                model: llmModel,
                temperature,
              },
              debugMode,
            }
          );

          if (response.success && response.result) {
            returnData.push({
              json: response.result as IDataObject,
              pairedItem: { item: i },
            });
          } else {
            throw new Error(response.message || response.error || 'Tree building failed');
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
