"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const change_detector_1 = require("../engines/change-detector");
const audit_repository_1 = require("../repositories/audit-repository");
const router = (0, express_1.Router)();
const changeDetector = new change_detector_1.ChangeDetector();
/**
 * POST /api/v1/detect
 * Detect changes between two versions
 */
router.post('/', async (req, res) => {
    try {
        const { oldVersion, newVersion, materialityConfig, comparisonDepth, debugMode = false } = req.body;
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
            const oldVersionId = oldVersion.version || oldVersion.id || null;
            const newVersionId = newVersion.version || newVersion.id || null;
            await audit_repository_1.auditRepository.logDetect(result.changes?.length || 0, oldVersionId, newVersionId, req);
        }
        catch (auditError) {
            req.logger.warn('Failed to audit detect operation', {
                error: auditError.message,
            });
        }
        res.json({
            success: true,
            result,
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Change detection failed', {
            error: error.message,
            stack: error.stack,
        });
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
/**
 * POST /api/v1/detect/batch
 * Detect changes for multiple version pairs
 */
router.post('/batch', async (req, res) => {
    try {
        const { pairs, options = {} } = req.body;
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
        const highMaterialityCount = results.filter(r => r.success && r.result?.materiality === 'HIGH').length;
        res.json({
            success: true,
            result: {
                items: results,
                summary: {
                    total: pairs.length,
                    successful: successCount,
                    failed: pairs.length - successCount,
                    highMateriality: highMaterialityCount,
                    mediumMateriality: results.filter(r => r.success && r.result?.materiality === 'MEDIUM').length,
                    lowMateriality: results.filter(r => r.success && r.result?.materiality === 'LOW').length,
                },
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Batch change detection failed', {
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
//# sourceMappingURL=detect.js.map