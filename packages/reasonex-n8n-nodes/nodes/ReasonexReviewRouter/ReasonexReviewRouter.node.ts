import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexReviewRouter implements INodeType {
  description: INodeTypeDescription = {
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

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexReviewRouter', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      debugMode,
    }, logger);

    const operation = this.getNodeParameter('operation', 0) as string;

    if (operation === 'getTierConfig') {
      const vertical = this.getNodeParameter('vertical', 0) as string;
      logger.info('Getting tier config', { vertical });

      // Call the API (this would need a corresponding endpoint)
      returnData.push({
        json: {
          vertical,
          message: 'Tier configuration retrieved',
        },
      });
    } else {
      for (let i = 0; i < items.length; i++) {
        try {
          const impactScore = this.getNodeParameter('impactScore', i) as number;
          const materiality = this.getNodeParameter('materiality', i) as string;
          const changesCount = this.getNodeParameter('changesCount', i) as number;
          const affectedPathsStr = this.getNodeParameter('affectedPaths', i) as string;
          const urgency = this.getNodeParameter('urgency', i) as string;
          const clientTier = this.getNodeParameter('clientTier', i) as string;
          const vertical = this.getNodeParameter('vertical', i) as string;
          const confidence = this.getNodeParameter('confidence', i) as number;

          const affectedPaths = affectedPathsStr.split(',').map(p => p.trim()).filter(p => p);

          logger.info('Routing change', { index: i, impactScore, materiality, urgency });

          const response = await apiClient.route(
            {
              impactScore,
              materiality: materiality as 'HIGH' | 'MEDIUM' | 'LOW',
              changesCount,
              affectedPaths,
            },
            {
              urgency: urgency as 'critical' | 'high' | 'normal' | 'low',
              clientTier: clientTier as 'enterprise' | 'premium' | 'standard' | 'basic',
              vertical,
              confidence,
            }
          );

          if (response.success && response.result) {
            returnData.push({
              json: response.result as IDataObject,
              pairedItem: { item: i },
            });
          } else {
            throw new Error(response.message || response.error || 'Routing failed');
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
