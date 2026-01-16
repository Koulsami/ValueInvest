"use strict";
/**
 * Workbench Repository - Database operations for Phase 3 Rule Development Workbench
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.workbenchRepository = exports.WorkbenchRepository = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../lib/database");
const database_2 = require("../types/database");
// Row to entity mapping helpers
function rowToResearchSession(row) {
    return {
        id: row.id,
        vertical: row.vertical,
        expertName: row.expert_name,
        description: row.description,
        status: row.status,
        documentCount: Number(row.document_count),
        queryCount: Number(row.query_count),
        ruleCount: Number(row.rule_count),
        metadata: row.metadata || {},
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}
function rowToSessionDocument(row) {
    return {
        id: row.id,
        sessionId: row.session_id,
        geminiFileUri: row.gemini_file_uri,
        geminiFileName: row.gemini_file_name,
        displayName: row.display_name,
        originalFilename: row.original_filename,
        documentType: row.document_type,
        mimeType: row.mime_type,
        fileSizeBytes: row.file_size_bytes ? Number(row.file_size_bytes) : null,
        pageCount: row.page_count ? Number(row.page_count) : null,
        uploadStatus: row.upload_status,
        errorMessage: row.error_message,
        metadata: row.metadata || {},
        uploadedAt: new Date(row.uploaded_at),
    };
}
function rowToResearchQuery(row) {
    return {
        id: row.id,
        sessionId: row.session_id,
        queryText: row.query_text,
        responseText: row.response_text,
        findings: row.findings || [],
        citations: row.citations || [],
        confidence: row.confidence,
        tokensUsed: row.tokens_used ? Number(row.tokens_used) : null,
        processingTimeMs: row.processing_time_ms ? Number(row.processing_time_ms) : null,
        errorMessage: row.error_message,
        queriedAt: new Date(row.queried_at),
    };
}
function rowToDraftRule(row) {
    return {
        id: row.id,
        sessionId: row.session_id,
        ruleId: row.rule_id,
        name: row.name,
        category: row.category,
        ruleType: row.rule_type,
        ruleDefinition: row.rule_definition || {},
        ruleYaml: row.rule_yaml,
        sourceQueryIds: row.source_query_ids || [],
        validationStatus: row.validation_status,
        testPassCount: Number(row.test_pass_count),
        testFailCount: Number(row.test_fail_count),
        notes: row.notes,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}
function rowToRuleTestCase(row) {
    return {
        id: row.id,
        sessionId: row.session_id,
        name: row.name,
        description: row.description,
        inputs: row.inputs || {},
        expectedOutputs: row.expected_outputs || {},
        actualOutputs: row.actual_outputs,
        passed: row.passed,
        errorMessage: row.error_message,
        executionTimeMs: row.execution_time_ms ? Number(row.execution_time_ms) : null,
        testedAt: row.tested_at ? new Date(row.tested_at) : null,
        createdAt: new Date(row.created_at),
    };
}
function rowToExportedRuleSet(row) {
    return {
        id: row.id,
        sessionId: row.session_id,
        ruleSetId: row.rule_set_id,
        name: row.name,
        version: row.version,
        vertical: row.vertical,
        yamlContent: row.yaml_content,
        filePath: row.file_path,
        ruleCount: row.rule_count ? Number(row.rule_count) : null,
        testCaseCount: row.test_case_count ? Number(row.test_case_count) : null,
        passRate: row.pass_rate ? Number(row.pass_rate) : null,
        deployedAt: row.deployed_at ? new Date(row.deployed_at) : null,
        deployedTo: row.deployed_to,
        createdAt: new Date(row.created_at),
    };
}
class WorkbenchRepository {
    db = (0, database_1.getDatabase)();
    // ============================================
    // Research Sessions
    // ============================================
    async createSession(input, client) {
        const id = (0, uuid_1.v4)();
        const sql = `
      INSERT INTO research_sessions (id, vertical, expert_name, description, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [
            id,
            input.vertical,
            input.expertName || null,
            input.description || null,
            JSON.stringify(input.metadata || {}),
        ];
        const queryFn = client
            ? () => client.query(sql, values)
            : () => this.db.query(sql, values);
        const result = await queryFn();
        return rowToResearchSession(result.rows[0]);
    }
    async findSessionById(id) {
        const sql = `SELECT * FROM research_sessions WHERE id = $1`;
        const result = await this.db.query(sql, [id]);
        return result.rows.length > 0 ? rowToResearchSession(result.rows[0]) : null;
    }
    async listSessions(params = {}) {
        const conditions = [];
        const values = [];
        let paramIndex = 1;
        if (params.vertical) {
            conditions.push(`vertical = $${paramIndex++}`);
            values.push(params.vertical);
        }
        if (params.status) {
            conditions.push(`status = $${paramIndex++}`);
            values.push(params.status);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const limit = params.limit || 50;
        const offset = params.offset || 0;
        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM research_sessions ${whereClause}`;
        const countResult = await this.db.query(countSql, values);
        const total = parseInt(countResult.rows[0].total, 10);
        // Get sessions
        const sql = `
      SELECT * FROM research_sessions
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
        const result = await this.db.query(sql, [...values, limit, offset]);
        return {
            sessions: result.rows.map(rowToResearchSession),
            total,
        };
    }
    async updateSessionStatus(id, status, client) {
        const sql = `
      UPDATE research_sessions
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
        const queryFn = client
            ? () => client.query(sql, [id, status])
            : () => this.db.query(sql, [id, status]);
        const result = await queryFn();
        return result.rows.length > 0 ? rowToResearchSession(result.rows[0]) : null;
    }
    // ============================================
    // Session Documents
    // ============================================
    async createDocument(input, client) {
        const id = (0, uuid_1.v4)();
        const sql = `
      INSERT INTO session_documents (
        id, session_id, gemini_file_uri, gemini_file_name, display_name,
        original_filename, document_type, mime_type, file_size_bytes, page_count,
        upload_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
        const values = [
            id,
            input.sessionId,
            input.geminiFileUri || null,
            input.geminiFileName || null,
            input.displayName,
            input.originalFilename || null,
            input.documentType || database_2.WorkbenchDocumentType.REFERENCE,
            input.mimeType || null,
            input.fileSizeBytes || null,
            input.pageCount || null,
            input.geminiFileUri ? database_2.DocumentUploadStatus.INDEXED : database_2.DocumentUploadStatus.UPLOADING,
        ];
        const queryFn = client
            ? () => client.query(sql, values)
            : () => this.db.query(sql, values);
        const result = await queryFn();
        return rowToSessionDocument(result.rows[0]);
    }
    async updateDocumentStatus(id, status, geminiFileUri, geminiFileName, errorMessage, client) {
        const sql = `
      UPDATE session_documents
      SET upload_status = $2,
          gemini_file_uri = COALESCE($3, gemini_file_uri),
          gemini_file_name = COALESCE($4, gemini_file_name),
          error_message = $5
      WHERE id = $1
      RETURNING *
    `;
        const values = [id, status, geminiFileUri, geminiFileName, errorMessage || null];
        const queryFn = client
            ? () => client.query(sql, values)
            : () => this.db.query(sql, values);
        const result = await queryFn();
        return result.rows.length > 0 ? rowToSessionDocument(result.rows[0]) : null;
    }
    async findDocumentsBySessionId(sessionId) {
        const sql = `
      SELECT * FROM session_documents
      WHERE session_id = $1
      ORDER BY uploaded_at DESC
    `;
        const result = await this.db.query(sql, [sessionId]);
        return result.rows.map(rowToSessionDocument);
    }
    async findDocumentById(id) {
        const sql = `SELECT * FROM session_documents WHERE id = $1`;
        const result = await this.db.query(sql, [id]);
        return result.rows.length > 0 ? rowToSessionDocument(result.rows[0]) : null;
    }
    async deleteDocument(id, client) {
        const sql = `DELETE FROM session_documents WHERE id = $1`;
        const queryFn = client
            ? () => client.query(sql, [id])
            : () => this.db.query(sql, [id]);
        const result = await queryFn();
        return (result.rowCount ?? 0) > 0;
    }
    // ============================================
    // Research Queries
    // ============================================
    async createQuery(input, client) {
        const id = (0, uuid_1.v4)();
        const sql = `
      INSERT INTO research_queries (id, session_id, query_text)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
        const values = [id, input.sessionId, input.queryText];
        const queryFn = client
            ? () => client.query(sql, values)
            : () => this.db.query(sql, values);
        const result = await queryFn();
        return rowToResearchQuery(result.rows[0]);
    }
    async updateQueryResponse(id, responseText, findings, citations, confidence, tokensUsed, processingTimeMs, errorMessage, client) {
        const sql = `
      UPDATE research_queries
      SET response_text = $2,
          findings = $3,
          citations = $4,
          confidence = $5,
          tokens_used = $6,
          processing_time_ms = $7,
          error_message = $8
      WHERE id = $1
      RETURNING *
    `;
        const values = [
            id,
            responseText,
            JSON.stringify(findings),
            JSON.stringify(citations),
            confidence,
            tokensUsed,
            processingTimeMs,
            errorMessage || null,
        ];
        const queryFn = client
            ? () => client.query(sql, values)
            : () => this.db.query(sql, values);
        const result = await queryFn();
        return result.rows.length > 0 ? rowToResearchQuery(result.rows[0]) : null;
    }
    async findQueriesBySessionId(sessionId) {
        const sql = `
      SELECT * FROM research_queries
      WHERE session_id = $1
      ORDER BY queried_at DESC
    `;
        const result = await this.db.query(sql, [sessionId]);
        return result.rows.map(rowToResearchQuery);
    }
    async findQueryById(id) {
        const sql = `SELECT * FROM research_queries WHERE id = $1`;
        const result = await this.db.query(sql, [id]);
        return result.rows.length > 0 ? rowToResearchQuery(result.rows[0]) : null;
    }
    // ============================================
    // Draft Rules
    // ============================================
    async createDraftRule(input, client) {
        const id = (0, uuid_1.v4)();
        const sql = `
      INSERT INTO draft_rules (
        id, session_id, rule_id, name, category, rule_type,
        rule_definition, rule_yaml, source_query_ids
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const values = [
            id,
            input.sessionId,
            input.ruleId,
            input.name,
            input.category || null,
            input.ruleType || null,
            JSON.stringify(input.ruleDefinition),
            input.ruleYaml || null,
            input.sourceQueryIds || [],
        ];
        const queryFn = client
            ? () => client.query(sql, values)
            : () => this.db.query(sql, values);
        const result = await queryFn();
        return rowToDraftRule(result.rows[0]);
    }
    async updateDraftRule(id, input, client) {
        const updates = [];
        const values = [id];
        let paramIndex = 2;
        if (input.name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(input.name);
        }
        if (input.category !== undefined) {
            updates.push(`category = $${paramIndex++}`);
            values.push(input.category);
        }
        if (input.ruleType !== undefined) {
            updates.push(`rule_type = $${paramIndex++}`);
            values.push(input.ruleType);
        }
        if (input.ruleDefinition !== undefined) {
            updates.push(`rule_definition = $${paramIndex++}`);
            values.push(JSON.stringify(input.ruleDefinition));
        }
        if (input.ruleYaml !== undefined) {
            updates.push(`rule_yaml = $${paramIndex++}`);
            values.push(input.ruleYaml);
        }
        if (input.notes !== undefined) {
            updates.push(`notes = $${paramIndex++}`);
            values.push(input.notes);
        }
        if (updates.length === 0) {
            return this.findDraftRuleById(id);
        }
        updates.push('updated_at = CURRENT_TIMESTAMP');
        const sql = `
      UPDATE draft_rules
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
        const queryFn = client
            ? () => client.query(sql, values)
            : () => this.db.query(sql, values);
        const result = await queryFn();
        return result.rows.length > 0 ? rowToDraftRule(result.rows[0]) : null;
    }
    async updateDraftRuleStatus(id, status, client) {
        const sql = `
      UPDATE draft_rules
      SET validation_status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
        const queryFn = client
            ? () => client.query(sql, [id, status])
            : () => this.db.query(sql, [id, status]);
        const result = await queryFn();
        return result.rows.length > 0 ? rowToDraftRule(result.rows[0]) : null;
    }
    async updateDraftRuleTestCounts(id, passCount, failCount, client) {
        const sql = `
      UPDATE draft_rules
      SET test_pass_count = $2, test_fail_count = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
        const queryFn = client
            ? () => client.query(sql, [id, passCount, failCount])
            : () => this.db.query(sql, [id, passCount, failCount]);
        const result = await queryFn();
        return result.rows.length > 0 ? rowToDraftRule(result.rows[0]) : null;
    }
    async findDraftRulesBySessionId(sessionId) {
        const sql = `
      SELECT * FROM draft_rules
      WHERE session_id = $1
      ORDER BY created_at DESC
    `;
        const result = await this.db.query(sql, [sessionId]);
        return result.rows.map(rowToDraftRule);
    }
    async findDraftRuleById(id) {
        const sql = `SELECT * FROM draft_rules WHERE id = $1`;
        const result = await this.db.query(sql, [id]);
        return result.rows.length > 0 ? rowToDraftRule(result.rows[0]) : null;
    }
    async deleteDraftRule(id, client) {
        const sql = `DELETE FROM draft_rules WHERE id = $1`;
        const queryFn = client
            ? () => client.query(sql, [id])
            : () => this.db.query(sql, [id]);
        const result = await queryFn();
        return (result.rowCount ?? 0) > 0;
    }
    // ============================================
    // Rule Test Cases
    // ============================================
    async createTestCase(input, client) {
        const id = (0, uuid_1.v4)();
        const sql = `
      INSERT INTO rule_test_cases (id, session_id, name, description, inputs, expected_outputs)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
        const values = [
            id,
            input.sessionId,
            input.name,
            input.description || null,
            JSON.stringify(input.inputs),
            JSON.stringify(input.expectedOutputs),
        ];
        const queryFn = client
            ? () => client.query(sql, values)
            : () => this.db.query(sql, values);
        const result = await queryFn();
        return rowToRuleTestCase(result.rows[0]);
    }
    async updateTestCaseResult(id, actualOutputs, passed, executionTimeMs, errorMessage, client) {
        const sql = `
      UPDATE rule_test_cases
      SET actual_outputs = $2,
          passed = $3,
          execution_time_ms = $4,
          error_message = $5,
          tested_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
        const values = [
            id,
            JSON.stringify(actualOutputs),
            passed,
            executionTimeMs,
            errorMessage || null,
        ];
        const queryFn = client
            ? () => client.query(sql, values)
            : () => this.db.query(sql, values);
        const result = await queryFn();
        return result.rows.length > 0 ? rowToRuleTestCase(result.rows[0]) : null;
    }
    async findTestCasesBySessionId(sessionId) {
        const sql = `
      SELECT * FROM rule_test_cases
      WHERE session_id = $1
      ORDER BY created_at DESC
    `;
        const result = await this.db.query(sql, [sessionId]);
        return result.rows.map(rowToRuleTestCase);
    }
    async findTestCaseById(id) {
        const sql = `SELECT * FROM rule_test_cases WHERE id = $1`;
        const result = await this.db.query(sql, [id]);
        return result.rows.length > 0 ? rowToRuleTestCase(result.rows[0]) : null;
    }
    async deleteTestCase(id, client) {
        const sql = `DELETE FROM rule_test_cases WHERE id = $1`;
        const queryFn = client
            ? () => client.query(sql, [id])
            : () => this.db.query(sql, [id]);
        const result = await queryFn();
        return (result.rowCount ?? 0) > 0;
    }
    // ============================================
    // Exported Rule Sets
    // ============================================
    async createExportedRuleSet(sessionId, ruleSetId, name, version, vertical, yamlContent, ruleCount, testCaseCount, passRate, filePath, client) {
        const id = (0, uuid_1.v4)();
        const sql = `
      INSERT INTO exported_rule_sets (
        id, session_id, rule_set_id, name, version, vertical,
        yaml_content, file_path, rule_count, test_case_count, pass_rate
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
        const values = [
            id, sessionId, ruleSetId, name, version, vertical,
            yamlContent, filePath || null, ruleCount, testCaseCount, passRate,
        ];
        const queryFn = client
            ? () => client.query(sql, values)
            : () => this.db.query(sql, values);
        const result = await queryFn();
        return rowToExportedRuleSet(result.rows[0]);
    }
    async updateDeployment(id, deployedTo, client) {
        const sql = `
      UPDATE exported_rule_sets
      SET deployed_at = CURRENT_TIMESTAMP, deployed_to = $2
      WHERE id = $1
      RETURNING *
    `;
        const queryFn = client
            ? () => client.query(sql, [id, deployedTo])
            : () => this.db.query(sql, [id, deployedTo]);
        const result = await queryFn();
        return result.rows.length > 0 ? rowToExportedRuleSet(result.rows[0]) : null;
    }
    async findExportedRuleSetsBySessionId(sessionId) {
        const sql = `
      SELECT * FROM exported_rule_sets
      WHERE session_id = $1
      ORDER BY created_at DESC
    `;
        const result = await this.db.query(sql, [sessionId]);
        return result.rows.map(rowToExportedRuleSet);
    }
    async findExportedRuleSetById(id) {
        const sql = `SELECT * FROM exported_rule_sets WHERE id = $1`;
        const result = await this.db.query(sql, [id]);
        return result.rows.length > 0 ? rowToExportedRuleSet(result.rows[0]) : null;
    }
}
exports.WorkbenchRepository = WorkbenchRepository;
// Export singleton instance
exports.workbenchRepository = new WorkbenchRepository();
//# sourceMappingURL=workbench-repository.js.map