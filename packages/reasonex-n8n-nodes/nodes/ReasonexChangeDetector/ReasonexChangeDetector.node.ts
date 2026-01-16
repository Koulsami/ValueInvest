import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { createApiClient } from '../../lib/api-client';
import { createNodeLogger } from '../../lib/logger';

export class ReasonexChangeDetector implements INodeType {
  description: INodeTypeDescription = {
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

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('reasonexApi');
    const debugMode = this.getNodeParameter('debugMode', 0) as boolean;
    const logger = createNodeLogger('ReasonexChangeDetector', this, debugMode);

    const apiClient = createApiClient({
      baseUrl: credentials.apiBaseUrl as string,
      apiKey: credentials.apiKey as string,
      debugMode,
    }, logger);

    for (let i = 0; i < items.length; i++) {
      try {
        const oldVersionStr = this.getNodeParameter('oldVersion', i) as string;
        const newVersionStr = this.getNodeParameter('newVersion', i) as string;
        const comparisonDepth = this.getNodeParameter('comparisonDepth', i) as string;
        const highImpactFieldsStr = this.getNodeParameter('highImpactFields', i) as string;
        const numericTolerance = this.getNodeParameter('numericTolerance', i) as number;
        const ignoreFieldsStr = this.getNodeParameter('ignoreFields', i) as string;

        const oldVersion = typeof oldVersionStr === 'string' ? JSON.parse(oldVersionStr) : oldVersionStr;
        const newVersion = typeof newVersionStr === 'string' ? JSON.parse(newVersionStr) : newVersionStr;

        const highImpactFields = highImpactFieldsStr.split(',').map(f => f.trim()).filter(f => f);
        const ignoreFields = ignoreFieldsStr.split(',').map(f => f.trim()).filter(f => f);

        logger.info('Detecting changes', { index: i, comparisonDepth });

        const response = await apiClient.detectChanges(
          oldVersion,
          newVersion,
          {
            materialityConfig: {
              highImpactFields,
              numericTolerance,
              ignoreFields,
            },
            comparisonDepth: comparisonDepth as 'shallow' | 'deep',
            debugMode,
          }
        );

        if (response.success && response.result) {
          returnData.push({
            json: response.result as IDataObject,
            pairedItem: { item: i },
          });
        } else {
          throw new Error(response.message || response.error || 'Change detection failed');
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
