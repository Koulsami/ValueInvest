"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analysis_repository_1 = require("../repositories/analysis-repository");
const rule_execution_repository_1 = require("../repositories/rule-execution-repository");
const validation_result_repository_1 = require("../repositories/validation-result-repository");
const router = (0, express_1.Router)();
/**
 * GET /api/v1/analyses/:id
 * Retrieve a specific analysis by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        req.logger.info('Get analysis request', {
            operation: 'getAnalysis',
            analysisId: id,
        });
        const analysis = await analysis_repository_1.analysisRepository.findByIdWithCompany(id);
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
    }
    catch (error) {
        req.logger.error('Failed to get analysis', {
            error: error.message,
        });
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
/**
 * GET /api/v1/analyses/:id/rule-executions
 * List all rule executions for an analysis
 */
router.get('/:id/rule-executions', async (req, res) => {
    try {
        const { id } = req.params;
        req.logger.info('Get rule executions request', {
            operation: 'getRuleExecutions',
            analysisId: id,
        });
        // Verify analysis exists
        const analysis = await analysis_repository_1.analysisRepository.findById(id);
        if (!analysis) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Analysis not found: ${id}`,
                traceId: req.traceContext.traceId,
            });
        }
        const executions = await rule_execution_repository_1.ruleExecutionRepository.findByAnalysisId(id);
        res.json({
            success: true,
            result: {
                analysis_id: id,
                count: executions.length,
                rule_executions: executions.map(exec => ({
                    id: exec.id,
                    rule_id: exec.ruleId,
                    rule_name: exec.ruleName,
                    category: exec.category,
                    input_value: exec.inputValue,
                    threshold_used: exec.thresholdUsed,
                    result_classification: exec.resultClassification,
                    score_awarded: exec.scoreAwarded,
                    execution_time_ms: exec.executionTimeMs,
                    created_at: exec.createdAt,
                })),
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to get rule executions', {
            error: error.message,
        });
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
/**
 * GET /api/v1/analyses/:id/validations
 * List all validation results for an analysis
 */
router.get('/:id/validations', async (req, res) => {
    try {
        const { id } = req.params;
        req.logger.info('Get validation results request', {
            operation: 'getValidationResults',
            analysisId: id,
        });
        // Verify analysis exists
        const analysis = await analysis_repository_1.analysisRepository.findById(id);
        if (!analysis) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Analysis not found: ${id}`,
                traceId: req.traceContext.traceId,
            });
        }
        const validations = await validation_result_repository_1.validationResultRepository.findByAnalysisId(id);
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
    }
    catch (error) {
        req.logger.error('Failed to get validation results', {
            error: error.message,
        });
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
exports.default = router;
//# sourceMappingURL=analyses.js.map