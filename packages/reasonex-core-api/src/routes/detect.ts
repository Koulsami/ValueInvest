import { Router, Request, Response } from 'express';
import { ChangeDetector, DetectionOptions } from '../engines/change-detector';
import { auditRepository } from '../repositories/audit-repository';

const router = Router();
const changeDetector = new ChangeDetector();

/**
 * POST /api/v1/detect
 * Detect changes between two versions
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { oldVersion, newVersion, materialityConfig, comparisonDepth, debugMode = false } = req.body as {
      oldVersion: Record<string, unknown>;
      newVersion: Record<string, unknown>;
      materialityConfig?: DetectionOptions['materialityConfig'];
      comparisonDepth?: 'shallow' | 'deep';
      debugMode?: boolean;
    };

    if (!oldVersion || typeof oldVersion !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include an "oldVersion" object',
        traceId: req.traceContext.traceId,
      });
    }

    if (!newVersion || typeof newVersion !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "newVersion" object',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Change detection request received', {
      operation: 'detectChanges',
      oldVersionKeys: Object.keys(oldVersion).length,
      newVersionKeys: Object.keys(newVersion).length,
      comparisonDepth: comparisonDepth || 'deep',
      debugMode,
    });

    const result = await req.logger.time('detectChanges', async () => {
      return changeDetector.detectChanges(oldVersion, newVersion, {
        materialityConfig,
        comparisonDepth,
        debugMode,
      });
    });

    // Audit log the detection operation
    try {
      const oldVersionId = (oldVersion.version as string) || (oldVersion.id as string) || null;
      const newVersionId = (newVersion.version as string) || (newVersion.id as string) || null;
      await auditRepository.logDetect(
        result.changes?.length || 0,
        oldVersionId,
        newVersionId,
        req
      );
    } catch (auditError) {
      req.logger.warn('Failed to audit detect operation', {
        error: (auditError as Error).message,
      });
    }

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Change detection failed', {
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * POST /api/v1/detect/batch
 * Detect changes for multiple version pairs
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { pairs, options = {} } = req.body as {
      pairs: Array<{ oldVersion: Record<string, unknown>; newVersion: Record<string, unknown> }>;
      options?: DetectionOptions;
    };

    if (!pairs || !Array.isArray(pairs)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "pairs" array',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Batch change detection request received', {
      operation: 'batchDetectChanges',
      pairCount: pairs.length,
    });

    const results = await req.logger.time('batchDetectChanges', async () => {
      return pairs.map((pair, index) => {
        try {
          return {
            index,
            success: true,
            result: changeDetector.detectChanges(pair.oldVersion, pair.newVersion, options),
          };
        } catch (error) {
          return {
            index,
            success: false,
            error: (error as Error).message,
          };
        }
      });
    });

    const successCount = results.filter(r => r.success).length;
    const highMaterialityCount = results.filter(r =>
      r.success && (r.result as { materiality: string })?.materiality === 'HIGH'
    ).length;

    res.json({
      success: true,
      result: {
        items: results,
        summary: {
          total: pairs.length,
          successful: successCount,
          failed: pairs.length - successCount,
          highMateriality: highMaterialityCount,
          mediumMateriality: results.filter(r =>
            r.success && (r.result as { materiality: string })?.materiality === 'MEDIUM'
          ).length,
          lowMateriality: results.filter(r =>
            r.success && (r.result as { materiality: string })?.materiality === 'LOW'
          ).length,
        },
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Batch change detection failed', {
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
