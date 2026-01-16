"use strict";
/**
 * Workbench Routes - Phase 3 Rule Development Workbench API
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const database_1 = require("../lib/database");
const workbench_repository_1 = require("../repositories/workbench-repository");
const gemini_service_1 = require("../services/gemini-service");
const database_2 = require("../types/database");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: (parseInt(process.env.WORKBENCH_MAX_FILE_SIZE_MB || '100', 10)) * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'text/plain',
            'text/html',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, TXT, HTML, DOC, DOCX`));
        }
    },
});
// Helper to get Gemini service (lazy initialization)
function getGemini(req) {
    return (0, gemini_service_1.getGeminiService)(req.logger);
}
// ============================================
// Database Migration Endpoint
// ============================================
/**
 * POST /api/v1/workbench/migrate
 * Run Phase 3 database migration (admin only)
 */
router.post('/migrate', async (req, res) => {
    try {
        const { adminKey } = req.body;
        // Simple auth check (in production, use proper auth)
        if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'phase3-migrate') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid admin key',
                traceId: req.traceContext.traceId,
            });
        }
        req.logger.info('Running Phase 3 migration', {
            operation: 'phase3_migration',
        });
        const db = (0, database_1.getDatabase)();
        // Run migration SQL
        const migrationSQL = `
      -- Create extension if not exists
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Create enum types
      DO $$ BEGIN CREATE TYPE session_status AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN CREATE TYPE document_upload_status AS ENUM ('UPLOADING', 'INDEXED', 'FAILED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN CREATE TYPE workbench_document_type AS ENUM ('REGULATION', 'GUIDELINE', 'PRECEDENT', 'REFERENCE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN CREATE TYPE confidence_level AS ENUM ('HIGH', 'MEDIUM', 'LOW'); EXCEPTION WHEN duplicate_object THEN null; END $$;
      DO $$ BEGIN CREATE TYPE rule_validation_status AS ENUM ('DRAFT', 'VALIDATED', 'DEPLOYED'); EXCEPTION WHEN duplicate_object THEN null; END $$;

      -- Create research_sessions table
      CREATE TABLE IF NOT EXISTS research_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vertical VARCHAR(100) NOT NULL,
        expert_name VARCHAR(255),
        description TEXT,
        status session_status NOT NULL DEFAULT 'ACTIVE',
        document_count INTEGER DEFAULT 0,
        query_count INTEGER DEFAULT 0,
        rule_count INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create session_documents table
      CREATE TABLE IF NOT EXISTS session_documents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
        gemini_file_uri VARCHAR(500),
        gemini_file_name VARCHAR(255),
        display_name VARCHAR(500) NOT NULL,
        original_filename VARCHAR(500),
        document_type workbench_document_type NOT NULL DEFAULT 'REFERENCE',
        mime_type VARCHAR(100),
        file_size_bytes BIGINT,
        page_count INTEGER,
        upload_status document_upload_status NOT NULL DEFAULT 'UPLOADING',
        error_message TEXT,
        metadata JSONB DEFAULT '{}',
        uploaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create research_queries table
      CREATE TABLE IF NOT EXISTS research_queries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
        query_text TEXT NOT NULL,
        response_text TEXT,
        findings JSONB DEFAULT '[]',
        citations JSONB DEFAULT '[]',
        confidence confidence_level,
        tokens_used INTEGER,
        processing_time_ms INTEGER,
        error_message TEXT,
        queried_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create draft_rules table
      CREATE TABLE IF NOT EXISTS draft_rules (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
        rule_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        rule_type VARCHAR(50),
        rule_definition JSONB NOT NULL,
        rule_yaml TEXT,
        source_query_ids UUID[] DEFAULT '{}',
        validation_status rule_validation_status NOT NULL DEFAULT 'DRAFT',
        test_pass_count INTEGER DEFAULT 0,
        test_fail_count INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create rule_test_cases table
      CREATE TABLE IF NOT EXISTS rule_test_cases (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        inputs JSONB NOT NULL,
        expected_outputs JSONB NOT NULL,
        actual_outputs JSONB,
        passed BOOLEAN,
        error_message TEXT,
        execution_time_ms INTEGER,
        tested_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create exported_rule_sets table
      CREATE TABLE IF NOT EXISTS exported_rule_sets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
        rule_set_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        version VARCHAR(50) NOT NULL,
        vertical VARCHAR(100) NOT NULL,
        yaml_content TEXT NOT NULL,
        file_path VARCHAR(500),
        rule_count INTEGER,
        test_case_count INTEGER,
        pass_rate DECIMAL(5,2),
        deployed_at TIMESTAMPTZ,
        deployed_to VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_research_sessions_vertical ON research_sessions(vertical);
      CREATE INDEX IF NOT EXISTS idx_research_sessions_status ON research_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_session_documents_session ON session_documents(session_id);
      CREATE INDEX IF NOT EXISTS idx_research_queries_session ON research_queries(session_id);
      CREATE INDEX IF NOT EXISTS idx_draft_rules_session ON draft_rules(session_id);
      CREATE INDEX IF NOT EXISTS idx_rule_test_cases_session ON rule_test_cases(session_id);
      CREATE INDEX IF NOT EXISTS idx_exported_rule_sets_session ON exported_rule_sets(session_id);
    `;
        await db.query(migrationSQL);
        // Create triggers for auto-updating counts
        const triggerSQL = `
      -- Update session document count trigger
      CREATE OR REPLACE FUNCTION update_session_document_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE research_sessions SET document_count = document_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.session_id;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE research_sessions SET document_count = document_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = OLD.session_id;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_update_document_count ON session_documents;
      CREATE TRIGGER trg_update_document_count
        AFTER INSERT OR DELETE ON session_documents
        FOR EACH ROW EXECUTE FUNCTION update_session_document_count();

      -- Update session query count trigger
      CREATE OR REPLACE FUNCTION update_session_query_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE research_sessions SET query_count = query_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.session_id;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE research_sessions SET query_count = query_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = OLD.session_id;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_update_query_count ON research_queries;
      CREATE TRIGGER trg_update_query_count
        AFTER INSERT OR DELETE ON research_queries
        FOR EACH ROW EXECUTE FUNCTION update_session_query_count();

      -- Update session rule count trigger
      CREATE OR REPLACE FUNCTION update_session_rule_count()
      RETURNS TRIGGER AS $$
      BEGIN
        IF TG_OP = 'INSERT' THEN
          UPDATE research_sessions SET rule_count = rule_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = NEW.session_id;
        ELSIF TG_OP = 'DELETE' THEN
          UPDATE research_sessions SET rule_count = rule_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = OLD.session_id;
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_update_rule_count ON draft_rules;
      CREATE TRIGGER trg_update_rule_count
        AFTER INSERT OR DELETE ON draft_rules
        FOR EACH ROW EXECUTE FUNCTION update_session_rule_count();
    `;
        await db.query(triggerSQL);
        req.logger.info('Phase 3 migration completed successfully', {
            operation: 'phase3_migration_complete',
        });
        res.json({
            success: true,
            message: 'Phase 3 migration completed successfully',
            tables: [
                'research_sessions',
                'session_documents',
                'research_queries',
                'draft_rules',
                'rule_test_cases',
                'exported_rule_sets',
            ],
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Migration failed', {
            error: error.message,
        });
        res.status(500).json({
            error: 'Migration Failed',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
// ============================================
// Session Management Endpoints
// ============================================
/**
 * POST /api/v1/workbench/sessions
 * Create a new research session
 */
router.post('/sessions', async (req, res) => {
    try {
        const { vertical, expertName, description, metadata } = req.body;
        if (!vertical || typeof vertical !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'vertical is required and must be a string',
                traceId: req.traceContext.traceId,
            });
        }
        req.logger.info('Creating research session', {
            operation: 'create_session',
            vertical,
            expertName,
        });
        const session = await workbench_repository_1.workbenchRepository.createSession({
            vertical,
            expertName,
            description,
            metadata,
        });
        res.status(201).json({
            success: true,
            result: session,
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to create session', {
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
 * GET /api/v1/workbench/sessions
 * List all research sessions
 */
router.get('/sessions', async (req, res) => {
    try {
        const { vertical, status, limit, offset } = req.query;
        const params = {
            vertical: vertical,
            status: status,
            limit: limit ? parseInt(limit, 10) : undefined,
            offset: offset ? parseInt(offset, 10) : undefined,
        };
        const { sessions, total } = await workbench_repository_1.workbenchRepository.listSessions(params);
        res.json({
            success: true,
            result: {
                sessions,
                total,
                limit: params.limit || 50,
                offset: params.offset || 0,
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to list sessions', {
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
 * GET /api/v1/workbench/sessions/:sessionId
 * Get session details
 */
router.get('/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        res.json({
            success: true,
            result: session,
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to get session', {
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
 * PATCH /api/v1/workbench/sessions/:sessionId
 * Update session status
 */
router.patch('/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { status } = req.body;
        if (!status || !Object.values(database_2.SessionStatus).includes(status)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: `status must be one of: ${Object.values(database_2.SessionStatus).join(', ')}`,
                traceId: req.traceContext.traceId,
            });
        }
        const session = await workbench_repository_1.workbenchRepository.updateSessionStatus(sessionId, status);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        res.json({
            success: true,
            result: session,
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to update session', {
            error: error.message,
        });
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
// ============================================
// Document Ingestion Endpoints
// ============================================
/**
 * POST /api/v1/workbench/sessions/:sessionId/documents
 * Upload a document to the session
 */
router.post('/sessions/:sessionId/documents', upload.single('file'), async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { displayName, documentType } = req.body;
        const file = req.file;
        // Verify session exists
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        if (!file) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'file is required',
                traceId: req.traceContext.traceId,
            });
        }
        // Check document limit
        const maxDocs = parseInt(process.env.WORKBENCH_MAX_DOCUMENTS_PER_SESSION || '50', 10);
        if (session.documentCount >= maxDocs) {
            return res.status(400).json({
                error: 'Bad Request',
                message: `Maximum documents per session (${maxDocs}) exceeded`,
                traceId: req.traceContext.traceId,
            });
        }
        req.logger.info('Uploading document', {
            operation: 'upload_document',
            sessionId,
            filename: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
        });
        // Create document record first (with UPLOADING status)
        const docName = displayName || file.originalname;
        const document = await workbench_repository_1.workbenchRepository.createDocument({
            sessionId,
            displayName: docName,
            originalFilename: file.originalname,
            documentType: documentType || database_2.WorkbenchDocumentType.REFERENCE,
            mimeType: file.mimetype,
            fileSizeBytes: file.size,
        });
        // Upload to Gemini asynchronously
        try {
            const gemini = getGemini(req);
            const uploadResult = await gemini.uploadDocumentFromBuffer(file.buffer, docName, file.mimetype);
            // Update document with Gemini info
            const updatedDoc = await workbench_repository_1.workbenchRepository.updateDocumentStatus(document.id, database_2.DocumentUploadStatus.INDEXED, uploadResult.fileUri, uploadResult.fileName);
            req.logger.info('Document uploaded successfully', {
                operation: 'upload_document_complete',
                documentId: document.id,
                geminiFileUri: uploadResult.fileUri,
            });
            res.status(201).json({
                success: true,
                result: updatedDoc,
                traceId: req.traceContext.traceId,
            });
        }
        catch (uploadError) {
            // Update document with error
            await workbench_repository_1.workbenchRepository.updateDocumentStatus(document.id, database_2.DocumentUploadStatus.FAILED, undefined, undefined, uploadError.message);
            req.logger.error('Document upload to Gemini failed', {
                error: uploadError.message,
                documentId: document.id,
            });
            res.status(500).json({
                error: 'Upload Failed',
                message: `Failed to upload to Gemini: ${uploadError.message}`,
                documentId: document.id,
                traceId: req.traceContext.traceId,
            });
        }
    }
    catch (error) {
        req.logger.error('Failed to upload document', {
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
 * GET /api/v1/workbench/sessions/:sessionId/documents
 * List all documents in the session
 */
router.get('/sessions/:sessionId/documents', async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Verify session exists
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        const documents = await workbench_repository_1.workbenchRepository.findDocumentsBySessionId(sessionId);
        res.json({
            success: true,
            result: {
                documents,
                count: documents.length,
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to list documents', {
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
 * DELETE /api/v1/workbench/sessions/:sessionId/documents/:documentId
 * Delete a document from the session
 */
router.delete('/sessions/:sessionId/documents/:documentId', async (req, res) => {
    try {
        const { sessionId, documentId } = req.params;
        const document = await workbench_repository_1.workbenchRepository.findDocumentById(documentId);
        if (!document || document.sessionId !== sessionId) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Document ${documentId} not found in session ${sessionId}`,
                traceId: req.traceContext.traceId,
            });
        }
        // Try to delete from Gemini if it was uploaded
        if (document.geminiFileName) {
            try {
                const gemini = getGemini(req);
                await gemini.deleteDocument(document.geminiFileName);
            }
            catch (deleteError) {
                req.logger.warn('Failed to delete from Gemini', {
                    error: deleteError.message,
                    geminiFileName: document.geminiFileName,
                });
                // Continue with local deletion even if Gemini delete fails
            }
        }
        await workbench_repository_1.workbenchRepository.deleteDocument(documentId);
        res.json({
            success: true,
            message: 'Document deleted',
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to delete document', {
            error: error.message,
        });
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
// ============================================
// Research Query Endpoints
// ============================================
/**
 * POST /api/v1/workbench/sessions/:sessionId/queries
 * Submit a research query
 */
router.post('/sessions/:sessionId/queries', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { queryText } = req.body;
        if (!queryText || typeof queryText !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'queryText is required',
                traceId: req.traceContext.traceId,
            });
        }
        // Verify session exists
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        // Get indexed documents
        const documents = await workbench_repository_1.workbenchRepository.findDocumentsBySessionId(sessionId);
        const indexedDocs = documents.filter(d => d.uploadStatus === database_2.DocumentUploadStatus.INDEXED && d.geminiFileUri);
        if (indexedDocs.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No indexed documents in session. Upload documents first.',
                traceId: req.traceContext.traceId,
            });
        }
        req.logger.info('Executing research query', {
            operation: 'research_query',
            sessionId,
            queryLength: queryText.length,
            documentCount: indexedDocs.length,
        });
        // Create query record
        const query = await workbench_repository_1.workbenchRepository.createQuery({
            sessionId,
            queryText,
        });
        try {
            // Execute Gemini query
            const gemini = getGemini(req);
            const docInfos = indexedDocs.map(d => ({
                fileUri: d.geminiFileUri,
                displayName: d.displayName,
            }));
            const result = await gemini.executeResearchQuery(queryText, docInfos);
            // Update query with results
            const updatedQuery = await workbench_repository_1.workbenchRepository.updateQueryResponse(query.id, result.responseText, result.findings, result.citations, result.confidence, result.tokensUsed, result.processingTimeMs);
            req.logger.info('Research query completed', {
                operation: 'research_query_complete',
                queryId: query.id,
                findingsCount: result.findings.length,
                confidence: result.confidence,
            });
            res.status(201).json({
                success: true,
                result: updatedQuery,
                traceId: req.traceContext.traceId,
            });
        }
        catch (queryError) {
            // Update query with error
            await workbench_repository_1.workbenchRepository.updateQueryResponse(query.id, '', [], [], database_2.ConfidenceLevel.LOW, 0, 0, queryError.message);
            req.logger.error('Research query failed', {
                error: queryError.message,
                queryId: query.id,
            });
            res.status(500).json({
                error: 'Query Failed',
                message: `Research query failed: ${queryError.message}`,
                queryId: query.id,
                traceId: req.traceContext.traceId,
            });
        }
    }
    catch (error) {
        req.logger.error('Failed to process query', {
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
 * GET /api/v1/workbench/sessions/:sessionId/queries
 * List all queries in the session
 */
router.get('/sessions/:sessionId/queries', async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Verify session exists
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        const queries = await workbench_repository_1.workbenchRepository.findQueriesBySessionId(sessionId);
        res.json({
            success: true,
            result: {
                queries,
                count: queries.length,
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to list queries', {
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
 * GET /api/v1/workbench/sessions/:sessionId/queries/:queryId
 * Get a specific query with full response
 */
router.get('/sessions/:sessionId/queries/:queryId', async (req, res) => {
    try {
        const { sessionId, queryId } = req.params;
        const query = await workbench_repository_1.workbenchRepository.findQueryById(queryId);
        if (!query || query.sessionId !== sessionId) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Query ${queryId} not found in session ${sessionId}`,
                traceId: req.traceContext.traceId,
            });
        }
        res.json({
            success: true,
            result: query,
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to get query', {
            error: error.message,
        });
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
// ============================================
// Rule Generation Endpoints
// ============================================
/**
 * POST /api/v1/workbench/sessions/:sessionId/rules/generate
 * Generate a draft rule from research findings
 */
router.post('/sessions/:sessionId/rules/generate', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { queryIds, category, suggestedRuleId } = req.body;
        if (!queryIds || !Array.isArray(queryIds) || queryIds.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'queryIds array is required',
                traceId: req.traceContext.traceId,
            });
        }
        // Verify session exists
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        // Get queries and collect findings
        const allFindings = [];
        for (const queryId of queryIds) {
            const query = await workbench_repository_1.workbenchRepository.findQueryById(queryId);
            if (query && query.sessionId === sessionId && query.findings.length > 0) {
                allFindings.push(...query.findings);
            }
        }
        if (allFindings.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No findings found in the specified queries',
                traceId: req.traceContext.traceId,
            });
        }
        req.logger.info('Generating rule from findings', {
            operation: 'generate_rule',
            sessionId,
            queryIds,
            findingsCount: allFindings.length,
        });
        try {
            // Generate rule using Gemini
            const gemini = getGemini(req);
            const result = await gemini.generateRule(allFindings, {
                vertical: session.vertical,
                category: category || session.vertical,
                suggestedRuleId,
            });
            // Extract rule ID and name from generated definition
            const ruleId = result.ruleDefinition.rule_id || suggestedRuleId || `RULE_${Date.now()}`;
            const ruleName = result.ruleDefinition.name || ruleId;
            // Create draft rule
            const draftRule = await workbench_repository_1.workbenchRepository.createDraftRule({
                sessionId,
                ruleId,
                name: ruleName,
                category: result.ruleDefinition.category || category,
                ruleType: result.ruleDefinition.rule_type,
                ruleDefinition: result.ruleDefinition,
                ruleYaml: result.ruleYaml,
                sourceQueryIds: queryIds,
            });
            req.logger.info('Rule generated successfully', {
                operation: 'generate_rule_complete',
                draftRuleId: draftRule.id,
                ruleId: draftRule.ruleId,
            });
            res.status(201).json({
                success: true,
                result: draftRule,
                traceId: req.traceContext.traceId,
            });
        }
        catch (genError) {
            req.logger.error('Rule generation failed', {
                error: genError.message,
            });
            res.status(500).json({
                error: 'Generation Failed',
                message: `Failed to generate rule: ${genError.message}`,
                traceId: req.traceContext.traceId,
            });
        }
    }
    catch (error) {
        req.logger.error('Failed to generate rule', {
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
 * GET /api/v1/workbench/sessions/:sessionId/rules
 * List all draft rules in the session
 */
router.get('/sessions/:sessionId/rules', async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Verify session exists
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        const rules = await workbench_repository_1.workbenchRepository.findDraftRulesBySessionId(sessionId);
        res.json({
            success: true,
            result: {
                rules,
                count: rules.length,
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to list rules', {
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
 * GET /api/v1/workbench/sessions/:sessionId/rules/:ruleId
 * Get a specific rule definition
 */
router.get('/sessions/:sessionId/rules/:ruleId', async (req, res) => {
    try {
        const { sessionId, ruleId } = req.params;
        const rule = await workbench_repository_1.workbenchRepository.findDraftRuleById(ruleId);
        if (!rule || rule.sessionId !== sessionId) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Rule ${ruleId} not found in session ${sessionId}`,
                traceId: req.traceContext.traceId,
            });
        }
        res.json({
            success: true,
            result: rule,
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to get rule', {
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
 * PUT /api/v1/workbench/sessions/:sessionId/rules/:ruleId
 * Update a rule definition (expert edits)
 */
router.put('/sessions/:sessionId/rules/:ruleId', async (req, res) => {
    try {
        const { sessionId, ruleId } = req.params;
        const { name, category, ruleType, ruleDefinition, ruleYaml, notes } = req.body;
        const existingRule = await workbench_repository_1.workbenchRepository.findDraftRuleById(ruleId);
        if (!existingRule || existingRule.sessionId !== sessionId) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Rule ${ruleId} not found in session ${sessionId}`,
                traceId: req.traceContext.traceId,
            });
        }
        const updatedRule = await workbench_repository_1.workbenchRepository.updateDraftRule(ruleId, {
            name,
            category,
            ruleType,
            ruleDefinition,
            ruleYaml,
            notes,
        });
        res.json({
            success: true,
            result: updatedRule,
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to update rule', {
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
 * DELETE /api/v1/workbench/sessions/:sessionId/rules/:ruleId
 * Delete a draft rule
 */
router.delete('/sessions/:sessionId/rules/:ruleId', async (req, res) => {
    try {
        const { sessionId, ruleId } = req.params;
        const rule = await workbench_repository_1.workbenchRepository.findDraftRuleById(ruleId);
        if (!rule || rule.sessionId !== sessionId) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Rule ${ruleId} not found in session ${sessionId}`,
                traceId: req.traceContext.traceId,
            });
        }
        await workbench_repository_1.workbenchRepository.deleteDraftRule(ruleId);
        res.json({
            success: true,
            message: 'Rule deleted',
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to delete rule', {
            error: error.message,
        });
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
// ============================================
// Test Case and Validation Endpoints
// ============================================
/**
 * POST /api/v1/workbench/sessions/:sessionId/test-cases
 * Add a test case
 */
router.post('/sessions/:sessionId/test-cases', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { name, description, inputs, expectedOutputs } = req.body;
        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'name is required',
                traceId: req.traceContext.traceId,
            });
        }
        if (!inputs || typeof inputs !== 'object') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'inputs object is required',
                traceId: req.traceContext.traceId,
            });
        }
        if (!expectedOutputs || typeof expectedOutputs !== 'object') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'expectedOutputs object is required',
                traceId: req.traceContext.traceId,
            });
        }
        // Verify session exists
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        const testCase = await workbench_repository_1.workbenchRepository.createTestCase({
            sessionId,
            name,
            description,
            inputs,
            expectedOutputs,
        });
        res.status(201).json({
            success: true,
            result: testCase,
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to create test case', {
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
 * GET /api/v1/workbench/sessions/:sessionId/test-cases
 * List all test cases
 */
router.get('/sessions/:sessionId/test-cases', async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Verify session exists
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        const testCases = await workbench_repository_1.workbenchRepository.findTestCasesBySessionId(sessionId);
        res.json({
            success: true,
            result: {
                testCases,
                count: testCases.length,
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to list test cases', {
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
 * DELETE /api/v1/workbench/sessions/:sessionId/test-cases/:testCaseId
 * Delete a test case
 */
router.delete('/sessions/:sessionId/test-cases/:testCaseId', async (req, res) => {
    try {
        const { sessionId, testCaseId } = req.params;
        const testCase = await workbench_repository_1.workbenchRepository.findTestCaseById(testCaseId);
        if (!testCase || testCase.sessionId !== sessionId) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Test case ${testCaseId} not found in session ${sessionId}`,
                traceId: req.traceContext.traceId,
            });
        }
        await workbench_repository_1.workbenchRepository.deleteTestCase(testCaseId);
        res.json({
            success: true,
            message: 'Test case deleted',
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to delete test case', {
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
 * POST /api/v1/workbench/sessions/:sessionId/validate
 * Run all test cases against current draft rules
 */
router.post('/sessions/:sessionId/validate', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { tolerance = 0.05 } = req.body;
        // Verify session exists
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        // Get draft rules
        const rules = await workbench_repository_1.workbenchRepository.findDraftRulesBySessionId(sessionId);
        if (rules.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No draft rules in session',
                traceId: req.traceContext.traceId,
            });
        }
        // Get test cases
        const testCases = await workbench_repository_1.workbenchRepository.findTestCasesBySessionId(sessionId);
        if (testCases.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No test cases in session',
                traceId: req.traceContext.traceId,
            });
        }
        req.logger.info('Running validation', {
            operation: 'validate_rules',
            sessionId,
            ruleCount: rules.length,
            testCaseCount: testCases.length,
        });
        // Build temporary rule set from draft rules
        const ruleSet = {
            metadata: {
                rule_set_id: `${session.vertical}-draft`,
                name: `${session.vertical} Draft Rules`,
                version: '0.0.1-draft',
                vertical: session.vertical,
            },
            rules: rules.map(r => r.ruleDefinition),
        };
        // Run each test case
        const results = [];
        let passCount = 0;
        let failCount = 0;
        for (const testCase of testCases) {
            const startTime = Date.now();
            try {
                // Call our own scoring endpoint internally
                // In production, this would call the Phase 2 Runtime API
                // For now, we'll simulate by comparing expected vs inputs
                const actualOutputs = await runTestCase(testCase.inputs, ruleSet);
                const executionTimeMs = Date.now() - startTime;
                // Compare outputs with tolerance
                const passed = compareOutputs(actualOutputs, testCase.expectedOutputs, tolerance);
                // Update test case with results
                await workbench_repository_1.workbenchRepository.updateTestCaseResult(testCase.id, actualOutputs, passed, executionTimeMs);
                if (passed) {
                    passCount++;
                }
                else {
                    failCount++;
                }
                results.push({
                    testCaseId: testCase.id,
                    name: testCase.name,
                    passed,
                    executionTimeMs,
                    expectedOutputs: testCase.expectedOutputs,
                    actualOutputs,
                });
            }
            catch (testError) {
                failCount++;
                await workbench_repository_1.workbenchRepository.updateTestCaseResult(testCase.id, {}, false, Date.now() - startTime, testError.message);
                results.push({
                    testCaseId: testCase.id,
                    name: testCase.name,
                    passed: false,
                    error: testError.message,
                });
            }
        }
        // Update rule validation status based on results
        const allPassed = failCount === 0;
        for (const rule of rules) {
            await workbench_repository_1.workbenchRepository.updateDraftRuleTestCounts(rule.id, passCount, failCount);
            if (allPassed) {
                await workbench_repository_1.workbenchRepository.updateDraftRuleStatus(rule.id, database_2.RuleValidationStatus.VALIDATED);
            }
        }
        const passRate = testCases.length > 0
            ? (passCount / testCases.length) * 100
            : 0;
        req.logger.info('Validation completed', {
            operation: 'validate_rules_complete',
            sessionId,
            passCount,
            failCount,
            passRate,
        });
        res.json({
            success: true,
            result: {
                passCount,
                failCount,
                totalTestCases: testCases.length,
                passRate: Math.round(passRate * 100) / 100,
                allPassed,
                results,
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Validation failed', {
            error: error.message,
        });
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
// ============================================
// Export and Deploy Endpoints
// ============================================
/**
 * POST /api/v1/workbench/sessions/:sessionId/export
 * Export all validated rules as a single YAML file
 */
router.post('/sessions/:sessionId/export', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { version = '1.0.0', name } = req.body;
        // Verify session exists
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        // Get validated rules only
        const rules = await workbench_repository_1.workbenchRepository.findDraftRulesBySessionId(sessionId);
        const validatedRules = rules.filter(r => r.validationStatus === database_2.RuleValidationStatus.VALIDATED ||
            r.validationStatus === database_2.RuleValidationStatus.DEPLOYED);
        if (validatedRules.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No validated rules to export. Run validation first.',
                traceId: req.traceContext.traceId,
            });
        }
        // Get test cases for pass rate
        const testCases = await workbench_repository_1.workbenchRepository.findTestCasesBySessionId(sessionId);
        const passedCount = testCases.filter(tc => tc.passed === true).length;
        const passRate = testCases.length > 0
            ? (passedCount / testCases.length) * 100
            : 0;
        // Generate YAML content
        const ruleSetId = `${session.vertical}-v${version.replace(/\./g, '_')}`;
        const ruleSetName = name || `${session.vertical} Rules v${version}`;
        const yamlContent = generateRuleSetYaml(ruleSetId, ruleSetName, version, session.vertical, validatedRules);
        // Optionally save to file
        let filePath;
        const exportPath = process.env.RULE_EXPORT_PATH;
        if (exportPath) {
            const filename = `${ruleSetId}.yaml`;
            filePath = path.join(exportPath, filename);
            // Ensure directory exists
            if (!fs.existsSync(exportPath)) {
                fs.mkdirSync(exportPath, { recursive: true });
            }
            fs.writeFileSync(filePath, yamlContent);
        }
        // Create export record
        const exported = await workbench_repository_1.workbenchRepository.createExportedRuleSet(sessionId, ruleSetId, ruleSetName, version, session.vertical, yamlContent, validatedRules.length, testCases.length, passRate, filePath);
        req.logger.info('Rules exported', {
            operation: 'export_rules',
            sessionId,
            ruleSetId,
            ruleCount: validatedRules.length,
            filePath,
        });
        res.status(201).json({
            success: true,
            result: {
                exportId: exported.id,
                ruleSetId,
                name: ruleSetName,
                version,
                vertical: session.vertical,
                ruleCount: validatedRules.length,
                testCaseCount: testCases.length,
                passRate: Math.round(passRate * 100) / 100,
                filePath,
                yamlContent,
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Export failed', {
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
 * POST /api/v1/workbench/sessions/:sessionId/deploy
 * Deploy the exported rule set to runtime configuration
 */
router.post('/sessions/:sessionId/deploy', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { exportId, targetPath } = req.body;
        if (!exportId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'exportId is required',
                traceId: req.traceContext.traceId,
            });
        }
        // Get the exported rule set
        const exported = await workbench_repository_1.workbenchRepository.findExportedRuleSetById(exportId);
        if (!exported || exported.sessionId !== sessionId) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Export ${exportId} not found in session ${sessionId}`,
                traceId: req.traceContext.traceId,
            });
        }
        // Default target path is the config/rule-sets directory
        const deployPath = targetPath || path.join(__dirname, '..', 'config', 'rule-sets');
        const filename = `${exported.ruleSetId}.yaml`;
        const fullPath = path.join(deployPath, filename);
        // Ensure directory exists
        if (!fs.existsSync(deployPath)) {
            fs.mkdirSync(deployPath, { recursive: true });
        }
        // Write the file
        fs.writeFileSync(fullPath, exported.yamlContent);
        // Update deployment info
        await workbench_repository_1.workbenchRepository.updateDeployment(exportId, fullPath);
        // Update all rules to DEPLOYED status
        const rules = await workbench_repository_1.workbenchRepository.findDraftRulesBySessionId(sessionId);
        for (const rule of rules) {
            if (rule.validationStatus === database_2.RuleValidationStatus.VALIDATED) {
                await workbench_repository_1.workbenchRepository.updateDraftRuleStatus(rule.id, database_2.RuleValidationStatus.DEPLOYED);
            }
        }
        req.logger.info('Rules deployed', {
            operation: 'deploy_rules',
            sessionId,
            exportId,
            deployPath: fullPath,
        });
        res.json({
            success: true,
            result: {
                exportId,
                ruleSetId: exported.ruleSetId,
                deployedTo: fullPath,
                deployedAt: new Date().toISOString(),
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Deploy failed', {
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
 * GET /api/v1/workbench/sessions/:sessionId/exports
 * List all exports for a session
 */
router.get('/sessions/:sessionId/exports', async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Verify session exists
        const session = await workbench_repository_1.workbenchRepository.findSessionById(sessionId);
        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Session ${sessionId} not found`,
                traceId: req.traceContext.traceId,
            });
        }
        const exports = await workbench_repository_1.workbenchRepository.findExportedRuleSetsBySessionId(sessionId);
        res.json({
            success: true,
            result: {
                exports: exports.map(e => ({
                    ...e,
                    yamlContent: undefined, // Exclude large content from list
                })),
                count: exports.length,
            },
            traceId: req.traceContext.traceId,
        });
    }
    catch (error) {
        req.logger.error('Failed to list exports', {
            error: error.message,
        });
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message,
            traceId: req.traceContext.traceId,
        });
    }
});
// ============================================
// Helper Functions
// ============================================
/**
 * Run a test case against the rule set
 * In production, this would call the Phase 2 Runtime API
 */
async function runTestCase(inputs, ruleSet) {
    // Simplified implementation - in production, call /api/v1/score
    // For now, return a mock result based on inputs
    return {
        scored: true,
        timestamp: new Date().toISOString(),
        inputs_received: Object.keys(inputs).length,
        rule_set_version: ruleSet.metadata?.version,
    };
}
/**
 * Compare actual vs expected outputs with tolerance
 */
function compareOutputs(actual, expected, tolerance) {
    for (const key of Object.keys(expected)) {
        const expectedVal = expected[key];
        const actualVal = actual[key];
        if (typeof expectedVal === 'number' && typeof actualVal === 'number') {
            // Numeric comparison with tolerance
            const diff = Math.abs(expectedVal - actualVal);
            const threshold = Math.abs(expectedVal) * tolerance;
            if (diff > threshold) {
                return false;
            }
        }
        else if (expectedVal !== actualVal) {
            // Exact match for non-numeric
            return false;
        }
    }
    return true;
}
/**
 * Generate YAML content for a rule set
 */
function generateRuleSetYaml(ruleSetId, name, version, vertical, rules) {
    const lines = [];
    // Metadata section
    lines.push('# Rule Set Configuration');
    lines.push(`# Generated: ${new Date().toISOString()}`);
    lines.push('');
    lines.push('metadata:');
    lines.push(`  rule_set_id: ${ruleSetId}`);
    lines.push(`  name: "${name}"`);
    lines.push(`  version: "${version}"`);
    lines.push(`  vertical: ${vertical}`);
    lines.push(`  generated_by: reasonex-workbench`);
    lines.push(`  generated_at: ${new Date().toISOString()}`);
    lines.push('');
    // Rules section
    lines.push('rules:');
    for (const rule of rules) {
        if (rule.ruleYaml) {
            // Use the generated YAML (indent it properly)
            const yamlLines = rule.ruleYaml.split('\n');
            lines.push(`  # Rule: ${rule.ruleId}`);
            for (const yamlLine of yamlLines) {
                if (yamlLine.trim()) {
                    lines.push(`  ${yamlLine}`);
                }
            }
            lines.push('');
        }
        else {
            // Generate YAML from definition
            lines.push(`  - rule_id: ${rule.ruleId}`);
            const def = rule.ruleDefinition;
            for (const [key, value] of Object.entries(def)) {
                if (key !== 'rule_id') {
                    if (typeof value === 'object') {
                        lines.push(`    ${key}: ${JSON.stringify(value)}`);
                    }
                    else {
                        lines.push(`    ${key}: ${value}`);
                    }
                }
            }
            lines.push('');
        }
    }
    return lines.join('\n');
}
exports.default = router;
//# sourceMappingURL=workbench.js.map