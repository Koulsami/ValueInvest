"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("../engines/validator");
const database_1 = require("../lib/database");
const company_repository_1 = require("../repositories/company-repository");
const analysis_repository_1 = require("../repositories/analysis-repository");
const validation_result_repository_1 = require("../repositories/validation-result-repository");
const audit_repository_1 = require("../repositories/audit-repository");
const database_2 = require("../types/database");
const router = (0, express_1.Router)();
const validator = new validator_1.Validator();
/**
 * Map validation check result to database check status
 */
function mapCheckStatus(check) {
    if (check.passed && check.score >= 0.8) {
        return database_2.CheckStatus.PASS;
    }
    else if (check.passed || check.score >= 0.5) {
        return database_2.CheckStatus.FLAG;
    }
    else {
        return database_2.CheckStatus.FAIL;
    }
}
/**
 * Map validation status string to database enum
 */
function mapValidationStatus(status) {
    switch (status) {
        case 'PASS':
            return database_2.ValidationStatus.PASS;
        case 'FLAG':
            return database_2.ValidationStatus.FLAG;
        case 'FAIL':
            return database_2.ValidationStatus.FAIL;
        default:
            return database_2.ValidationStatus.PASS; // Default to PASS if unknown
    }
}
/**
 * Build validation result inputs from check results
 */
function buildValidationResultInputs(analysisId, checks) {
    return checks.map(check => ({
        analysisId,
        checkName: check.checkType.toUpperCase(),
        status: mapCheckStatus(check),
        details: {
            score: check.score,
            passed: check.passed,
            issues: check.issues,
            duration_ms: check.duration_ms,
            ...check.details,
        },
    }));
}
/**
 * POST /api/v1/validate
 * Validate analysis data
 */
router.post('/', async (req, res) => {
    const db = (0, database_1.getDatabase)();
    try {
        const { analysis, sources, scores, profile, options = {}, analysisId, ticker } = req.body;
        if (!analysis || typeof analysis !== 'object') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Request body must include an "analysis" object',
                traceId: req.traceContext.traceId,
            });
        }
        // Merge sources and scores into analysis if provided separately
        const analysisData = {
            ...analysis,
            ...(sources && { source_documents: sources }),
            ...(scores && { scores }),
        };
        req.logger.info('Validation request received', {
            operation: 'validate',
            profile: profile || 'general',
            dataKeys: Object.keys(analysis).length,
            hasSources: !!sources,
            hasScores: !!scores,
            analysisId: analysisId || 'none',
            ticker: ticker || 'none',
        });
        const result = await req.logger.time('validate', async () => {
            return validator.validate(analysisData, {
                profile: profile || 'general',
                ...options,
            });
        });
        // Determine if we should persist
        let persistedAnalysisId = null;
        let persisted = false;
        // Try to find analysis to update
        let targetAnalysisId = null;
        if (analysisId) {
            targetAnalysisId = analysisId;
        }
        else if (ticker) {
            const company = await company_repository_1.companyRepository.findByTicker(ticker);
            if (company) {
                const currentAnalysis = await analysis_repository_1.analysisRepository.findCurrentByCompanyId(company.id);
                if (currentAnalysis) {
                    targetAnalysisId = currentAnalysis.id;
                }
            }
        }
        if (targetAnalysisId) {
            try {
                await db.transaction(async (client) => {
                    // Insert validation results
                    const validationInputs = buildValidationResultInputs(targetAnalysisId, result.checks);
                    await validation_result_repository_1.validationResultRepository.createMany(validationInputs, client);
                    // Update analysis validation status
                    const validationStatus = mapValidationStatus(result.status);
                    await analysis_repository_1.analysisRepository.updateValidation(targetAnalysisId, validationStatus, client);
                    // Audit log
                    await audit_repository_1.auditRepository.logValidate(targetAnalysisId, result.status, result.checks.length, req, client);
                    persistedAnalysisId = targetAnalysisId;
                    persisted = true;
                    req.logger.info('Validation persisted', {
                        analysisId: targetAnalysisId,
                        status: result.status,
                        checksCount: result.checks.length,
                    });
                });
            }
            catch (persistError) {
                req.logger.error('Failed to persist validation', {
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
        req.logger.error('Validation failed', {
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
 * GET /api/v1/validate/profiles
 * Get available validation profiles
 */
router.get('/profiles', (req, res) => {
    try {
        const profiles = validator.getProfiles();
        res.json({
            success: true,
            result: {
                profiles,
                count: profiles.length,
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to get validation profiles', {
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
 * POST /api/v1/validate/quick
 * Quick validation with default profile
 */
router.post('/quick', async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || typeof data !== 'object') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Request body must include a "data" object',
                traceId: req.traceContext.traceId,
            });
        }
        const result = validator.validate(data, {
            profile: 'general',
            checks: ['schema', 'coverage'],
            strictness: 'lenient',
        });
        res.json({
            success: true,
            result: {
                status: result.status,
                confidence: result.confidence,
                issueCount: result.issues.length,
                summary: result.summary,
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Quick validation failed', {
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
 * POST /api/v1/validate/batch
 * Validate multiple items
 */
router.post('/batch', async (req, res) => {
    try {
        const { items, profile, options = {} } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Request body must include an "items" array',
                traceId: req.traceContext.traceId,
            });
        }
        req.logger.info('Batch validation request received', {
            operation: 'batchValidate',
            profile: profile || 'general',
            itemCount: items.length,
        });
        const results = await req.logger.time('batchValidate', async () => {
            return items.map((item, index) => {
                try {
                    return {
                        index,
                        success: true,
                        result: validator.validate(item, {
                            profile: profile || 'general',
                            ...options,
                        }),
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
        const passCount = results.filter(r => r.success && r.result?.status === 'PASS').length;
        res.json({
            success: true,
            result: {
                items: results,
                summary: {
                    total: items.length,
                    successful: successCount,
                    failed: items.length - successCount,
                    passed: passCount,
                    flagged: results.filter(r => r.success && r.result?.status === 'FLAG').length,
                    rejected: results.filter(r => r.success && r.result?.status === 'FAIL').length,
                },
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Batch validation failed', {
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
//# sourceMappingURL=validate.js.map