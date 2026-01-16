import { Router, Request, Response } from 'express';
import { TierRouter, ChangeInput, RoutingContext } from '../engines/tier-router';
import { ExplanationGenerator, ExplanationOptions } from '../engines/explanation-generator';
import { ScoringResult } from '../engines/rule-engine';
import { auditRepository } from '../repositories/audit-repository';

const router = Router();
const tierRouter = new TierRouter();
const explanationGenerator = new ExplanationGenerator();

/**
 * POST /api/v1/route
 * Route a change to appropriate review tier
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { change, context = {} } = req.body as {
      change: ChangeInput;
      context?: RoutingContext;
    };

    if (!change || typeof change !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "change" object',
        traceId: req.traceContext.traceId,
      });
    }

    // Validate required change properties
    if (typeof change.impactScore !== 'number' ||
        typeof change.materiality !== 'string' ||
        typeof change.changesCount !== 'number') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Change object must include impactScore (number), materiality (string), and changesCount (number)',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Routing request received', {
      operation: 'route',
      impactScore: change.impactScore,
      materiality: change.materiality,
      changesCount: change.changesCount,
      urgency: context.urgency || 'normal',
    });

    const result = await req.logger.time('route', async () => {
      return tierRouter.route(change, context);
    });

    // Audit log the routing decision
    try {
      const reviewerNames = result.reviewers?.map(r => r.role) || null;
      await auditRepository.logRoute(
        `Tier ${result.tier}`,
        reviewerNames,
        req
      );
    } catch (auditError) {
      req.logger.warn('Failed to audit route operation', {
        error: (auditError as Error).message,
      });
    }

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Routing failed', {
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
 * GET /api/v1/route/tiers/:vertical
 * Get tier configurations for a vertical
 */
router.get('/tiers/:vertical', (req: Request, res: Response) => {
  try {
    const { vertical } = req.params;
    const configs = tierRouter.getTierConfigs(vertical);

    res.json({
      success: true,
      result: {
        vertical,
        tiers: configs,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get tier configs', {
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
 * POST /api/v1/route/explain
 * Generate explanation for a scoring result
 */
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { scoringResult, options = {} } = req.body as {
      scoringResult: ScoringResult;
      options?: ExplanationOptions;
    };

    if (!scoringResult || typeof scoringResult !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "scoringResult" object',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Explanation request received', {
      operation: 'explain',
      ruleSetId: scoringResult.ruleSetId,
      audience: options.audience || 'professional',
      verbosity: options.verbosity || 'standard',
    });

    const result = await req.logger.time('explain', async () => {
      return explanationGenerator.generate(scoringResult, options);
    });

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Explanation generation failed', {
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
 * POST /api/v1/route/batch
 * Route multiple changes
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { changes, context = {} } = req.body as {
      changes: ChangeInput[];
      context?: RoutingContext;
    };

    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "changes" array',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Batch routing request received', {
      operation: 'batchRoute',
      changeCount: changes.length,
    });

    const results = await req.logger.time('batchRoute', async () => {
      return changes.map((change, index) => {
        try {
          return {
            index,
            success: true,
            result: tierRouter.route(change, context),
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
    const tierCounts = {
      tier1: results.filter(r => r.success && (r.result as { tier: number })?.tier === 1).length,
      tier2: results.filter(r => r.success && (r.result as { tier: number })?.tier === 2).length,
      tier3: results.filter(r => r.success && (r.result as { tier: number })?.tier === 3).length,
      tier4: results.filter(r => r.success && (r.result as { tier: number })?.tier === 4).length,
    };
    const autoApproveCount = results.filter(r =>
      r.success && (r.result as { autoApprove: boolean })?.autoApprove
    ).length;

    res.json({
      success: true,
      result: {
        items: results,
        summary: {
          total: changes.length,
          successful: successCount,
          failed: changes.length - successCount,
          autoApproved: autoApproveCount,
          ...tierCounts,
        },
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Batch routing failed', {
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
