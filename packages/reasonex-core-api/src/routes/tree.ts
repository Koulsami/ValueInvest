import { Router, Request, Response } from 'express';
import { TreeBuilder, TreeBuildOptions } from '../engines/tree-builder';
import { getDatabase } from '../lib/database';
import { companyRepository } from '../repositories/company-repository';
import { analysisRepository } from '../repositories/analysis-repository';
import { auditRepository } from '../repositories/audit-repository';
import { AnalysisStatus } from '../types/database';

const router = Router();
const treeBuilder = new TreeBuilder();

/**
 * POST /api/v1/tree
 * Build analysis tree
 */
router.post('/', async (req: Request, res: Response) => {
  const db = getDatabase();

  try {
    const { entity, documents = [], schema, llmConfig, guidanceProfile, debugMode = false, ticker, companyId } = req.body as {
      entity: Record<string, unknown>;
      documents?: unknown[];
      schema: string;
      llmConfig?: TreeBuildOptions['llmConfig'];
      guidanceProfile?: string;
      debugMode?: boolean;
      ticker?: string;
      companyId?: string;
    };

    if (!entity || typeof entity !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include an "entity" object',
        traceId: req.traceContext.traceId,
      });
    }

    if (!schema) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "schema" string',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Tree build request received', {
      operation: 'buildTree',
      schema,
      entityKeys: Object.keys(entity).length,
      documentCount: documents.length,
      debugMode,
      ticker: ticker || 'none',
    });

    const result = await req.logger.time('buildTree', async () => {
      return treeBuilder.buildTree(entity, documents, {
        schema,
        llmConfig,
        guidanceProfile,
        debugMode,
      });
    });

    // Determine if we should persist
    let persistedAnalysisId: string | null = null;
    let persisted = false;

    // Try to find company if ticker or companyId provided
    let resolvedCompanyId: string | null = null;

    if (companyId) {
      resolvedCompanyId = companyId;
    } else if (ticker) {
      const company = await companyRepository.findByTicker(ticker);
      if (company) {
        resolvedCompanyId = company.id;
      }
    }

    // Persist if we have a company reference
    if (resolvedCompanyId) {
      try {
        await db.transaction(async (client) => {
          // Find or create analysis
          let analysis = await analysisRepository.findCurrentByCompanyId(resolvedCompanyId!, client);

          // Wrap tree data for storage (tree is TreeNode[])
          const treeDataToStore = { nodes: result.tree || [] } as Record<string, unknown>;

          if (!analysis) {
            // Create new analysis
            analysis = await analysisRepository.create({
              companyId: resolvedCompanyId!,
              treeData: treeDataToStore,
              status: AnalysisStatus.DRAFT,
            }, client);
          } else if (analysis.status === AnalysisStatus.LOCKED) {
            // Create new version if current is locked
            analysis = await analysisRepository.create({
              companyId: resolvedCompanyId!,
              treeData: treeDataToStore,
              status: AnalysisStatus.DRAFT,
            }, client);
          } else {
            // Update existing draft with new tree
            analysis = await analysisRepository.updateTreeData(
              analysis.id,
              treeDataToStore,
              client
            );
          }

          // Audit log
          const entityName = (entity.ticker as string) || (entity.name as string) || 'unknown';
          await auditRepository.logTree(analysis.id, entityName, req, client);

          persistedAnalysisId = analysis.id;
          persisted = true;

          req.logger.info('Tree persisted', {
            analysisId: analysis.id,
          });
        });
      } catch (persistError) {
        req.logger.error('Failed to persist tree', {
          error: (persistError as Error).message,
        });
      }
    } else {
      // Standalone tree build - just audit log
      try {
        const entityName = (entity.ticker as string) || (entity.name as string) || 'unknown';
        await auditRepository.logTree(null, entityName, req);
      } catch (auditError) {
        req.logger.warn('Failed to audit standalone tree build', {
          error: (auditError as Error).message,
        });
      }
    }

    res.json({
      success: true,
      result: {
        analysis_id: persistedAnalysisId,
        persisted,
        ...result,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Tree building failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    const statusCode = (error as Error).message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({
      error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * GET /api/v1/tree/schemas
 * Get available tree schemas
 */
router.get('/schemas', (req: Request, res: Response) => {
  try {
    const schemas = treeBuilder.getSchemas();

    res.json({
      success: true,
      result: {
        schemas,
        count: schemas.length,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get schemas', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * GET /api/v1/tree/schemas/:id
 * Get a specific tree schema
 */
router.get('/schemas/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const schema = treeBuilder.getSchema(id);

    if (!schema) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Schema not found: ${id}`,
        traceId: req.traceContext.traceId,
      });
    }

    res.json({
      success: true,
      result: schema,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get schema', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

export default router;
