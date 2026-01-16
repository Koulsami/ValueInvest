"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tree_builder_1 = require("../engines/tree-builder");
const database_1 = require("../lib/database");
const company_repository_1 = require("../repositories/company-repository");
const analysis_repository_1 = require("../repositories/analysis-repository");
const audit_repository_1 = require("../repositories/audit-repository");
const database_2 = require("../types/database");
const router = (0, express_1.Router)();
const treeBuilder = new tree_builder_1.TreeBuilder();
/**
 * POST /api/v1/tree
 * Build analysis tree
 */
router.post('/', async (req, res) => {
    const db = (0, database_1.getDatabase)();
    try {
        const { entity, documents = [], schema, llmConfig, guidanceProfile, debugMode = false, ticker, companyId } = req.body;
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
        // Persist if we have a company reference
        if (resolvedCompanyId) {
            try {
                await db.transaction(async (client) => {
                    // Find or create analysis
                    let analysis = await analysis_repository_1.analysisRepository.findCurrentByCompanyId(resolvedCompanyId, client);
                    // Wrap tree data for storage (tree is TreeNode[])
                    const treeDataToStore = { nodes: result.tree || [] };
                    if (!analysis) {
                        // Create new analysis
                        analysis = await analysis_repository_1.analysisRepository.create({
                            companyId: resolvedCompanyId,
                            treeData: treeDataToStore,
                            status: database_2.AnalysisStatus.DRAFT,
                        }, client);
                    }
                    else if (analysis.status === database_2.AnalysisStatus.LOCKED) {
                        // Create new version if current is locked
                        analysis = await analysis_repository_1.analysisRepository.create({
                            companyId: resolvedCompanyId,
                            treeData: treeDataToStore,
                            status: database_2.AnalysisStatus.DRAFT,
                        }, client);
                    }
                    else {
                        // Update existing draft with new tree
                        analysis = await analysis_repository_1.analysisRepository.updateTreeData(analysis.id, treeDataToStore, client);
                    }
                    // Audit log
                    const entityName = entity.ticker || entity.name || 'unknown';
                    await audit_repository_1.auditRepository.logTree(analysis.id, entityName, req, client);
                    persistedAnalysisId = analysis.id;
                    persisted = true;
                    req.logger.info('Tree persisted', {
                        analysisId: analysis.id,
                    });
                });
            }
            catch (persistError) {
                req.logger.error('Failed to persist tree', {
                    error: persistError.message,
                });
            }
        }
        else {
            // Standalone tree build - just audit log
            try {
                const entityName = entity.ticker || entity.name || 'unknown';
                await audit_repository_1.auditRepository.logTree(null, entityName, req);
            }
            catch (auditError) {
                req.logger.warn('Failed to audit standalone tree build', {
                    error: auditError.message,
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
    }
    catch (error) {
        req.logger.error('Tree building failed', {
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
 * GET /api/v1/tree/schemas
 * Get available tree schemas
 */
router.get('/schemas', (req, res) => {
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
    }
    catch (error) {
        req.logger.error('Failed to get schemas', {
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
 * GET /api/v1/tree/schemas/:id
 * Get a specific tree schema
 */
router.get('/schemas/:id', (req, res) => {
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
    }
    catch (error) {
        req.logger.error('Failed to get schema', {
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
//# sourceMappingURL=tree.js.map