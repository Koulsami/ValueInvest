import { Router, Request, Response } from 'express';
import { LockManager, LockOptions } from '../engines/lock-manager';
import { getDatabase } from '../lib/database';
import { companyRepository } from '../repositories/company-repository';
import { analysisRepository } from '../repositories/analysis-repository';
import { auditRepository } from '../repositories/audit-repository';

const router = Router();
const lockManager = new LockManager();

/**
 * POST /api/v1/lock
 * Create a lock for data
 */
router.post('/', async (req: Request, res: Response) => {
  const db = getDatabase();

  try {
    const { data, options = {}, analysisId, ticker } = req.body as {
      data: Record<string, unknown>;
      options?: LockOptions;
      analysisId?: string;
      ticker?: string;
    };

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "data" object',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Lock request received', {
      operation: 'createLock',
      dataKeys: Object.keys(data).length,
      algorithm: options.algorithm || 'SHA256',
      analysisId: analysisId || 'none',
      ticker: ticker || 'none',
    });

    const result = await req.logger.time('createLock', async () => {
      return lockManager.createLock(data, options);
    });

    // Determine if we should persist (analysis-linked)
    let persistedAnalysisId: string | null = null;
    let persisted = false;

    // Try to find analysis to lock
    let targetAnalysisId: string | null = null;

    if (analysisId) {
      targetAnalysisId = analysisId;
    } else if (ticker) {
      const company = await companyRepository.findByTicker(ticker);
      if (company) {
        const currentAnalysis = await analysisRepository.findCurrentByCompanyId(company.id);
        if (currentAnalysis) {
          targetAnalysisId = currentAnalysis.id;
        }
      }
    }

    if (targetAnalysisId) {
      try {
        await db.transaction(async (client) => {
          // Update analysis with lock
          const updatedAnalysis = await analysisRepository.updateLock(
            targetAnalysisId!,
            result.data_hash,
            result.lock_id,
            client
          );

          // Audit log
          await auditRepository.logLock(
            updatedAnalysis.id,
            result.data_hash,
            result.lock_id,
            req,
            client
          );

          persistedAnalysisId = updatedAnalysis.id;
          persisted = true;

          req.logger.info('Lock persisted', {
            analysisId: updatedAnalysis.id,
            status: updatedAnalysis.status,
          });
        });
      } catch (persistError) {
        req.logger.error('Failed to persist lock', {
          error: (persistError as Error).message,
        });
        // Don't fail the request, just mark as not persisted
      }
    } else {
      // Standalone lock - just audit log
      try {
        await auditRepository.logLock(
          'standalone',
          result.data_hash,
          result.lock_id,
          req
        );
      } catch (auditError) {
        req.logger.warn('Failed to audit standalone lock', {
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
    req.logger.error('Lock creation failed', {
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
 * POST /api/v1/lock/verify
 * Verify a lock against data
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { data, hash, lockTimestamp, options = {} } = req.body as {
      data: Record<string, unknown>;
      hash: string;
      lockTimestamp?: string;
      options?: LockOptions;
    };

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "data" object',
        traceId: req.traceContext.traceId,
      });
    }

    if (!hash || typeof hash !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "hash" string',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Lock verification request received', {
      operation: 'verifyLock',
      hashPrefix: hash.slice(0, 16),
    });

    const result = await req.logger.time('verifyLock', async () => {
      return lockManager.verifyLock(data, hash, lockTimestamp, options);
    });

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Lock verification failed', {
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
 * POST /api/v1/lock/compare
 * Compare hashes of two data objects
 */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { data1, data2, options = {} } = req.body as {
      data1: Record<string, unknown>;
      data2: Record<string, unknown>;
      options?: LockOptions;
    };

    if (!data1 || !data2) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include "data1" and "data2" objects',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Hash comparison request received', {
      operation: 'compareHashes',
    });

    const result = lockManager.compareHashes(data1, data2, options);

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Hash comparison failed', {
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
