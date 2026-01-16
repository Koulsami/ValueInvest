"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rule_engine_1 = require("../engines/rule-engine");
const database_1 = require("../lib/database");
const company_repository_1 = require("../repositories/company-repository");
const analysis_repository_1 = require("../repositories/analysis-repository");
const rule_execution_repository_1 = require("../repositories/rule-execution-repository");
const audit_repository_1 = require("../repositories/audit-repository");
const database_2 = require("../types/database");
const router = (0, express_1.Router)();
const ruleEngine = new rule_engine_1.RuleEngine();
/**
 * Convert scoring result to rule execution inputs
 */
function buildRuleExecutionInputs(analysisId, result, ruleSetId) {
    const executions = [];
    for (const dimension of result.scores.dimensions) {
        for (const rule of dimension.ruleExecutions) {
            executions.push({
                analysisId,
                ruleSetId,
                ruleSetVersion: '1.0', // TODO: Get from rule set metadata
                dimension: dimension.dimensionId,
                ruleId: rule.ruleId,
                fieldName: rule.ruleId, // Using ruleId as field name
                inputValue: rule.inputValue !== null && rule.inputValue !== undefined
                    ? typeof rule.inputValue === 'number' ? rule.inputValue : null
                    : null,
                outputScore: rule.rawScore,
                maxScore: rule.maxScore,
                weight: rule.weight,
                passed: rule.passed,
                explanation: rule.targetValue !== undefined
                    ? `Target: ${JSON.stringify(rule.targetValue)}`
                    : null,
            });
        }
    }
    return executions;
}
/**
 * Build scores input from scoring result
 */
function buildScoresInput(result) {
    // Find dimension scores
    const findDimensionScore = (id) => {
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
router.post('/', async (req, res) => {
    const db = (0, database_1.getDatabase)();
    try {
        const { data, ruleSetId, context, debugMode = false, ticker, companyId, analysisId } = req.body;
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
        let persistedAnalysisId = null;
        let persisted = false;
        // Try to find company if ticker or companyId provided
        let resolvedCompanyId = null;
        if (companyId) {
            resolvedCompanyId = companyId;
        }
        else if (ticker) {
            const company = await company_repository_1.companyRepository.findByTicker(ticker);
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
                        analysis = await analysis_repository_1.analysisRepository.findById(analysisId, client);
                        if (!analysis) {
                            throw new Error(`Analysis not found: ${analysisId}`);
                        }
                        // Check if locked - need to create new version
                        if (analysis.status === database_2.AnalysisStatus.LOCKED) {
                            // Create new version
                            analysis = await analysis_repository_1.analysisRepository.create({
                                companyId: analysis.companyId || undefined,
                                status: database_2.AnalysisStatus.DRAFT,
                            }, client);
                            req.logger.info('Created new analysis version (previous was locked)', {
                                newAnalysisId: analysis.id,
                                previousAnalysisId: analysisId,
                            });
                        }
                        else {
                            // Delete old rule executions before re-scoring
                            await rule_execution_repository_1.ruleExecutionRepository.deleteByAnalysisId(analysis.id, client);
                        }
                    }
                    else if (resolvedCompanyId) {
                        // Find or create analysis for company
                        const currentAnalysis = await analysis_repository_1.analysisRepository.findCurrentByCompanyId(resolvedCompanyId, client);
                        if (currentAnalysis && currentAnalysis.status === database_2.AnalysisStatus.DRAFT) {
                            // Update existing draft
                            analysis = currentAnalysis;
                            await rule_execution_repository_1.ruleExecutionRepository.deleteByAnalysisId(analysis.id, client);
                        }
                        else if (currentAnalysis && currentAnalysis.status === database_2.AnalysisStatus.LOCKED) {
                            // Create new version if locked
                            analysis = await analysis_repository_1.analysisRepository.create({
                                companyId: resolvedCompanyId,
                                status: database_2.AnalysisStatus.DRAFT,
                            }, client);
                        }
                        else if (!currentAnalysis) {
                            // Create first analysis
                            analysis = await analysis_repository_1.analysisRepository.create({
                                companyId: resolvedCompanyId,
                                status: database_2.AnalysisStatus.DRAFT,
                            }, client);
                        }
                        else {
                            // Re-score existing (SCORED, VALIDATED, etc.)
                            analysis = currentAnalysis;
                            await rule_execution_repository_1.ruleExecutionRepository.deleteByAnalysisId(analysis.id, client);
                        }
                    }
                    if (!analysis) {
                        throw new Error('Failed to create or find analysis');
                    }
                    // Update analysis with scores
                    const scoresInput = buildScoresInput(result);
                    await analysis_repository_1.analysisRepository.updateScores(analysis.id, scoresInput, client);
                    // Insert rule executions
                    const ruleExecutionInputs = buildRuleExecutionInputs(analysis.id, result, ruleSetId);
                    await rule_execution_repository_1.ruleExecutionRepository.createMany(ruleExecutionInputs, client);
                    // Update company last_analysis_at
                    if (resolvedCompanyId) {
                        await company_repository_1.companyRepository.updateLastAnalysisAt(resolvedCompanyId, client);
                    }
                    // Audit log
                    await audit_repository_1.auditRepository.logScore(analysis.id, {
                        overall_score: result.scores.total,
                        classification: result.classification,
                        execution_time_ms: executionTime,
                    }, ruleExecutionInputs.length, req, client);
                    persistedAnalysisId = analysis.id;
                    persisted = true;
                    req.logger.info('Scoring persisted', {
                        analysisId: analysis.id,
                        ruleExecutionsCount: ruleExecutionInputs.length,
                    });
                });
            }
            catch (persistError) {
                req.logger.error('Failed to persist scoring result', {
                    error: persistError.message,
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
    }
    catch (error) {
        req.logger.error('Scoring failed', {
            error: error.message,
            stack: error.stack,
        });
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
/**
 * GET /api/v1/score/rule-sets
 * Get available rule sets
 */
router.get('/rule-sets', (req, res) => {
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
    }
    catch (error) {
        req.logger.error('Failed to get rule sets', {
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
 * GET /api/v1/score/rule-sets/:id
 * Get a specific rule set definition
 */
router.get('/rule-sets/:id', (req, res) => {
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
    }
    catch (error) {
        req.logger.error('Failed to get rule set', {
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
 * POST /api/v1/score/validate-data
 * Validate data has required fields for a rule set
 */
router.post('/validate-data', async (req, res) => {
    try {
        const { data, ruleSetId } = req.body;
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
    }
    catch (error) {
        req.logger.error('Data validation failed', {
            error: error.message,
        });
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
            error: statusCode === 404 ? 'Not Found' : 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
/**
 * POST /api/v1/score/batch
 * Score multiple data items against a rule set
 */
router.post('/batch', async (req, res) => {
    try {
        const { items, ruleSetId, context, debugMode = false } = req.body;
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
                }
                catch (error) {
                    return {
                        index,
                        success: false,
                        error: error.message,
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
    }
    catch (error) {
        req.logger.error('Batch scoring failed', {
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
//# sourceMappingURL=score.js.map