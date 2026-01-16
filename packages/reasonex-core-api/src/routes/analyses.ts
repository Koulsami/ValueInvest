import { Router, Request, Response } from 'express';
import { analysisRepository } from '../repositories/analysis-repository';
import { ruleExecutionRepository } from '../repositories/rule-execution-repository';
import { validationResultRepository } from '../repositories/validation-result-repository';

const router = Router();

/**
 * GET /api/v1/analyses/:id
 * Retrieve a specific analysis by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    req.logger.info('Get analysis request', {
      operation: 'getAnalysis',
      analysisId: id,
    });

    const analysis = await analysisRepository.findByIdWithCompany(id);

    if (!analysis) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Analysis not found: ${id}`,
        traceId: req.traceContext.traceId,
      });
    }

    res.json({
      success: true,
      result: {
        id: analysis.id,
        company_id: analysis.companyId,
        company_ticker: analysis.companyTicker,
        company_name: analysis.companyName,
        version: analysis.version,
        is_current: analysis.isCurrent,
        status: analysis.status,
        tree_data: analysis.treeData,
        scores: {
          moat: analysis.moatScore,
          valuation: analysis.valuationScore,
          quality: analysis.qualityScore,
          growth: analysis.growthScore,
          dividend: analysis.dividendScore,
          overall: analysis.overallScore,
        },
        classification: analysis.classification,
        recommendation: analysis.recommendation,
        validation_status: analysis.validationStatus,
        confidence_score: analysis.confidenceScore,
        data_hash: analysis.dataHash,
        lock_id: analysis.lockId,
        created_at: analysis.createdAt,
        updated_at: analysis.updatedAt,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get analysis', {
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
 * GET /api/v1/analyses/:id/rule-executions
 * List all rule executions for an analysis
 */
router.get('/:id/rule-executions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    req.logger.info('Get rule executions request', {
      operation: 'getRuleExecutions',
      analysisId: id,
    });

    // Verify analysis exists
    const analysis = await analysisRepository.findById(id);
    if (!analysis) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Analysis not found: ${id}`,
        traceId: req.traceContext.traceId,
      });
    }

    const executions = await ruleExecutionRepository.findByAnalysisId(id);

    res.json({
      success: true,
      result: {
        analysis_id: id,
        count: executions.length,
        rule_executions: executions.map(exec => ({
          id: exec.id,
          rule_set_id: exec.ruleSetId,
          rule_set_version: exec.ruleSetVersion,
          dimension: exec.dimension,
          rule_id: exec.ruleId,
          field_name: exec.fieldName,
          input_value: exec.inputValue,
          output_score: exec.outputScore,
          max_score: exec.maxScore,
          weight: exec.weight,
          passed: exec.passed,
          explanation: exec.explanation,
          executed_at: exec.executedAt,
        })),
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get rule executions', {
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
 * GET /api/v1/analyses/:id/validations
 * List all validation results for an analysis
 */
router.get('/:id/validations', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    req.logger.info('Get validation results request', {
      operation: 'getValidationResults',
      analysisId: id,
    });

    // Verify analysis exists
    const analysis = await analysisRepository.findById(id);
    if (!analysis) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Analysis not found: ${id}`,
        traceId: req.traceContext.traceId,
      });
    }

    const validations = await validationResultRepository.findByAnalysisId(id);

    res.json({
      success: true,
      result: {
        analysis_id: id,
        count: validations.length,
        validation_results: validations.map(val => ({
          id: val.id,
          check_name: val.checkName,
          status: val.status,
          details: val.details,
          executed_at: val.executedAt,
        })),
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get validation results', {
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
