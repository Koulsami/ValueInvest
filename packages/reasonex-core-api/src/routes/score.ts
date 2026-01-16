import { Router, Request, Response } from 'express';
import { RuleEngine, ScoringResult, InvestmentScoringResult } from '../engines/rule-engine';
import { getDatabase } from '../lib/database';
import { companyRepository } from '../repositories/company-repository';
import { analysisRepository } from '../repositories/analysis-repository';
import { ruleExecutionRepository } from '../repositories/rule-execution-repository';
import { auditRepository } from '../repositories/audit-repository';
import {
  AnalysisStatus,
  CreateRuleExecutionInput,
  UpdateAnalysisScoresInput,
} from '../types/database';

const router = Router();
const ruleEngine = new RuleEngine();

/**
 * Convert scoring result to rule execution inputs
 */
function buildRuleExecutionInputs(
  analysisId: string,
  result: ScoringResult | InvestmentScoringResult
): CreateRuleExecutionInput[] {
  const executions: CreateRuleExecutionInput[] = [];

  for (const dimension of result.scores.dimensions) {
    for (const rule of dimension.ruleExecutions) {
      executions.push({
        analysisId,
        ruleId: rule.ruleId,
        ruleName: rule.ruleId, // Using ruleId as name since we don't have separate name
        category: dimension.dimensionId,
        inputValue: rule.inputValue !== null && rule.inputValue !== undefined
          ? typeof rule.inputValue === 'number' ? rule.inputValue : String(rule.inputValue)
          : null,
        thresholdUsed: JSON.stringify(rule.targetValue),
        resultClassification: rule.passed ? 'PASS' : 'FAIL',
        scoreAwarded: rule.rawScore,
        executionTimeMs: 0, // We don't track individual rule timing
      });
    }
  }

  return executions;
}

/**
 * Build scores input from scoring result
 */
function buildScoresInput(result: ScoringResult | InvestmentScoringResult): UpdateAnalysisScoresInput {
  // Find dimension scores
  const findDimensionScore = (id: string): number | null => {
    const dim = result.scores.dimensions.find(d => d.dimensionId === id);
    return dim ? dim.rawScore : null;
  };

  return {
    moatScore: findDimensionScore('moat'),
    valuationScore: findDimensionScore('valuation'),
    qualityScore: findDimensionScore('quality'),
    growthScore: findDimensionScore('growth'),
    dividendScore: findDimensionScore('dividend'),
    overallScore: result.scores.total,
    classification: result.classification,
    recommendation: result.recommendation,
  };
}

/**
 * POST /api/v1/score
 * Score data against a rule set
 */
router.post('/', async (req: Request, res: Response) => {
  const db = getDatabase();

  try {
    const { data, ruleSetId, context, debugMode = false, ticker, companyId, analysisId } = req.body as {
      data: Record<string, unknown>;
      ruleSetId: string;
      context?: Record<string, unknown>;
      debugMode?: boolean;
      ticker?: string;
      companyId?: string;
      analysisId?: string;
    };

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "data" object',
        traceId: req.traceContext.traceId,
      });
    }

    if (!ruleSetId || typeof ruleSetId !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "ruleSetId" string',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Score request received', {
      operation: 'score',
      ruleSetId,
      dataKeys: Object.keys(data).length,
      debugMode,
      ticker: ticker || 'none',
    });

    // Execute scoring
    const startTime = Date.now();
    const result = await req.logger.time('score', async () => {
      return ruleEngine.score(data, ruleSetId, context, debugMode);
    });
    const executionTime = Date.now() - startTime;

    // Determine if we should persist (company-linked)
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

    // Persist if we have a company or analysisId
    if (resolvedCompanyId || analysisId) {
      try {
        await db.transaction(async (client) => {
          let analysis;

          if (analysisId) {
            // Update existing analysis
            analysis = await analysisRepository.findById(analysisId, client);

            if (!analysis) {
              throw new Error(`Analysis not found: ${analysisId}`);
            }

            // Check if locked - need to create new version
            if (analysis.status === AnalysisStatus.LOCKED) {
              // Create new version
              analysis = await analysisRepository.create({
                companyId: analysis.companyId || undefined,
                status: AnalysisStatus.DRAFT,
              }, client);

              req.logger.info('Created new analysis version (previous was locked)', {
                newAnalysisId: analysis.id,
                previousAnalysisId: analysisId,
              });
            } else {
              // Delete old rule executions before re-scoring
              await ruleExecutionRepository.deleteByAnalysisId(analysis.id, client);
            }
          } else if (resolvedCompanyId) {
            // Find or create analysis for company
            const currentAnalysis = await analysisRepository.findCurrentByCompanyId(resolvedCompanyId, client);

            if (currentAnalysis && currentAnalysis.status === AnalysisStatus.DRAFT) {
              // Update existing draft
              analysis = currentAnalysis;
              await ruleExecutionRepository.deleteByAnalysisId(analysis.id, client);
            } else if (currentAnalysis && currentAnalysis.status === AnalysisStatus.LOCKED) {
              // Create new version if locked
              analysis = await analysisRepository.create({
                companyId: resolvedCompanyId,
                status: AnalysisStatus.DRAFT,
              }, client);
            } else if (!currentAnalysis) {
              // Create first analysis
              analysis = await analysisRepository.create({
                companyId: resolvedCompanyId,
                status: AnalysisStatus.DRAFT,
              }, client);
            } else {
              // Re-score existing (SCORED, VALIDATED, etc.)
              analysis = currentAnalysis;
              await ruleExecutionRepository.deleteByAnalysisId(analysis.id, client);
            }
          }

          if (!analysis) {
            throw new Error('Failed to create or find analysis');
          }

          // Update analysis with scores
          const scoresInput = buildScoresInput(result);
          await analysisRepository.updateScores(analysis.id, scoresInput, client);

          // Insert rule executions
          const ruleExecutionInputs = buildRuleExecutionInputs(analysis.id, result);
          await ruleExecutionRepository.createMany(ruleExecutionInputs, client);

          // Update company last_analysis_at
          if (resolvedCompanyId) {
            await companyRepository.updateLastAnalysisAt(resolvedCompanyId, client);
          }

          // Audit log
          await auditRepository.logScore(
            analysis.id,
            {
              overall_score: result.scores.total,
              classification: result.classification,
              execution_time_ms: executionTime,
            },
            ruleExecutionInputs.length,
            req,
            client
          );

          persistedAnalysisId = analysis.id;
          persisted = true;

          req.logger.info('Scoring persisted', {
            analysisId: analysis.id,
            ruleExecutionsCount: ruleExecutionInputs.length,
          });
        });
      } catch (persistError) {
        req.logger.error('Failed to persist scoring result', {
          error: (persistError as Error).message,
        });
        // Don't fail the request, just mark as not persisted
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
    req.logger.error('Scoring failed', {
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
 * GET /api/v1/score/rule-sets
 * Get available rule sets
 */
router.get('/rule-sets', (req: Request, res: Response) => {
  try {
    const ruleSets = ruleEngine.getRuleSets();

    res.json({
      success: true,
      result: {
        ruleSets,
        count: ruleSets.length,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get rule sets', {
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
 * GET /api/v1/score/rule-sets/:id
 * Get a specific rule set definition
 */
router.get('/rule-sets/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ruleSet = ruleEngine.getRuleSet(id);

    if (!ruleSet) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Rule set not found: ${id}`,
        traceId: req.traceContext.traceId,
      });
    }

    res.json({
      success: true,
      result: ruleSet,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get rule set', {
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
 * POST /api/v1/score/validate-data
 * Validate data has required fields for a rule set
 */
router.post('/validate-data', async (req: Request, res: Response) => {
  try {
    const { data, ruleSetId } = req.body as {
      data: Record<string, unknown>;
      ruleSetId: string;
    };

    if (!data || !ruleSetId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include "data" and "ruleSetId"',
        traceId: req.traceContext.traceId,
      });
    }

    const result = ruleEngine.validateData(data, ruleSetId);

    res.json({
      success: true,
      result,
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Data validation failed', {
      error: (error as Error).message,
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
 * POST /api/v1/score/batch
 * Score multiple data items against a rule set
 */
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { items, ruleSetId, context, debugMode = false } = req.body as {
      items: Record<string, unknown>[];
      ruleSetId: string;
      context?: Record<string, unknown>;
      debugMode?: boolean;
    };

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include an "items" array',
        traceId: req.traceContext.traceId,
      });
    }

    if (!ruleSetId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body must include a "ruleSetId"',
        traceId: req.traceContext.traceId,
      });
    }

    req.logger.info('Batch score request received', {
      operation: 'batchScore',
      ruleSetId,
      itemCount: items.length,
    });

    const results = await req.logger.time('batchScore', async () => {
      return items.map((item, index) => {
        try {
          return {
            index,
            success: true,
            result: ruleEngine.score(item, ruleSetId, context, debugMode),
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

    res.json({
      success: true,
      result: {
        items: results,
        summary: {
          total: items.length,
          successful: successCount,
          failed: items.length - successCount,
        },
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Batch scoring failed', {
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
