import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexValidation implements INodeType {
  description: INodeTypeDescription = {
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

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexValidation', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      debugMode,
    }, logger);

    const operation = this.getNodeParameter('operation', 0) as string;

    if (operation === 'getProfiles') {
      logger.info('Getting validation profiles');
      const response = await apiClient.getValidationProfiles();

      if (response.success && response.result) {
        returnData.push({
          json: response.result,
        });
      } else {
        throw new Error(response.message || response.error || 'Failed to get profiles');
      }
    } else {
      for (let i = 0; i < items.length; i++) {
        try {
          const analysis = this.getNodeParameter('analysis', i) as object;
          const profileParam = this.getNodeParameter('profile', i) as string;
          const customProfile = this.getNodeParameter('customProfile', i) as string;
          const profile = profileParam === 'custom' ? customProfile : profileParam;
          const checks = this.getNodeParameter('checks', i) as string[];
          const strictness = this.getNodeParameter('strictness', i) as string;
          const hallucinationSensitivity = this.getNodeParameter('hallucinationSensitivity', i) as string;
          const sources = this.getNodeParameter('sources', i) as unknown[];
          const scoresStr = this.getNodeParameter('scores', i) as string;

          let scores: Record<string, unknown> | undefined;
          if (scoresStr && scoresStr.trim()) {
            scores = typeof scoresStr === 'string' ? JSON.parse(scoresStr) : scoresStr;
          }

          logger.info('Validating item', { index: i, profile, checks });

          const response = await apiClient.validate(
            analysis as IDataObject,
            {
              sources: sources as unknown[],
              scores,
              profile,
              checks,
              strictness: strictness as 'strict' | 'normal' | 'lenient',
              hallucinationSensitivity: hallucinationSensitivity as 'high' | 'medium' | 'low',
              debugMode,
            }
          );

          if (response.success && response.result) {
            returnData.push({
              json: response.result as IDataObject,
              pairedItem: { item: i },
            });
          } else {
            throw new Error(response.message || response.error || 'Validation failed');
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
