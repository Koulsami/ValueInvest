/**
 * Workbench Repository - Database operations for Phase 3 Rule Development Workbench
 */

import { PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../lib/database';
import {
  ResearchSession,
  SessionDocument,
  ResearchQuery,
  DraftRule,
  RuleTestCase,
  ExportedRuleSet,
  SessionStatus,
  DocumentUploadStatus,
  WorkbenchDocumentType,
  ConfidenceLevel,
  RuleValidationStatus,
  CreateResearchSessionInput,
  CreateSessionDocumentInput,
  CreateResearchQueryInput,
  CreateDraftRuleInput,
  UpdateDraftRuleInput,
  CreateRuleTestCaseInput,
  ListSessionsParams,
  ResearchFinding,
  Citation,
} from '../types/database';

// Row to entity mapping helpers
function rowToResearchSession(row: Record<string, unknown>): ResearchSession {
  return {
    id: row.id as string,
    vertical: row.vertical as string,
    expertName: row.expert_name as string | null,
    description: row.description as string | null,
    status: row.status as SessionStatus,
    documentCount: Number(row.document_count),
    queryCount: Number(row.query_count),
    ruleCount: Number(row.rule_count),
    metadata: (row.metadata as Record<string, unknown>) || {},
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function rowToSessionDocument(row: Record<string, unknown>): SessionDocument {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    geminiFileUri: row.gemini_file_uri as string | null,
    geminiFileName: row.gemini_file_name as string | null,
    displayName: row.display_name as string,
    originalFilename: row.original_filename as string | null,
    documentType: row.document_type as WorkbenchDocumentType,
    mimeType: row.mime_type as string | null,
    fileSizeBytes: row.file_size_bytes ? Number(row.file_size_bytes) : null,
    pageCount: row.page_count ? Number(row.page_count) : null,
    uploadStatus: row.upload_status as DocumentUploadStatus,
    errorMessage: row.error_message as string | null,
    metadata: (row.metadata as Record<string, unknown>) || {},
    uploadedAt: new Date(row.uploaded_at as string),
  };
}

function rowToResearchQuery(row: Record<string, unknown>): ResearchQuery {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    queryText: row.query_text as string,
    responseText: row.response_text as string | null,
    findings: (row.findings as ResearchFinding[]) || [],
    citations: (row.citations as Citation[]) || [],
    confidence: row.confidence as ConfidenceLevel | null,
    tokensUsed: row.tokens_used ? Number(row.tokens_used) : null,
    processingTimeMs: row.processing_time_ms ? Number(row.processing_time_ms) : null,
    errorMessage: row.error_message as string | null,
    queriedAt: new Date(row.queried_at as string),
  };
}

function rowToDraftRule(row: Record<string, unknown>): DraftRule {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    ruleId: row.rule_id as string,
    name: row.name as string,
    category: row.category as string | null,
    ruleType: row.rule_type as string | null,
    ruleDefinition: (row.rule_definition as Record<string, unknown>) || {},
    ruleYaml: row.rule_yaml as string | null,
    sourceQueryIds: (row.source_query_ids as string[]) || [],
    validationStatus: row.validation_status as RuleValidationStatus,
    testPassCount: Number(row.test_pass_count),
    testFailCount: Number(row.test_fail_count),
    notes: row.notes as string | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function rowToRuleTestCase(row: Record<string, unknown>): RuleTestCase {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    name: row.name as string,
    description: row.description as string | null,
    inputs: (row.inputs as Record<string, unknown>) || {},
    expectedOutputs: (row.expected_outputs as Record<string, unknown>) || {},
    actualOutputs: row.actual_outputs as Record<string, unknown> | null,
    passed: row.passed as boolean | null,
    errorMessage: row.error_message as string | null,
    executionTimeMs: row.execution_time_ms ? Number(row.execution_time_ms) : null,
    testedAt: row.tested_at ? new Date(row.tested_at as string) : null,
    createdAt: new Date(row.created_at as string),
  };
}

function rowToExportedRuleSet(row: Record<string, unknown>): ExportedRuleSet {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    ruleSetId: row.rule_set_id as string,
    name: row.name as string,
    version: row.version as string,
    vertical: row.vertical as string,
    yamlContent: row.yaml_content as string,
    filePath: row.file_path as string | null,
    ruleCount: row.rule_count ? Number(row.rule_count) : null,
    testCaseCount: row.test_case_count ? Number(row.test_case_count) : null,
    passRate: row.pass_rate ? Number(row.pass_rate) : null,
    deployedAt: row.deployed_at ? new Date(row.deployed_at as string) : null,
    deployedTo: row.deployed_to as string | null,
    createdAt: new Date(row.created_at as string),
  };
}

export class WorkbenchRepository {
  private db = getDatabase();

  // ============================================
  // Research Sessions
  // ============================================

  async createSession(input: CreateResearchSessionInput, client?: PoolClient): Promise<ResearchSession> {
    const id = uuidv4();
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

  async findSessionById(id: string): Promise<ResearchSession | null> {
    const sql = `SELECT * FROM research_sessions WHERE id = $1`;
    const result = await this.db.query(sql, [id]);
    return result.rows.length > 0 ? rowToResearchSession(result.rows[0]) : null;
  }

  async listSessions(params: ListSessionsParams = {}): Promise<{ sessions: ResearchSession[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
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

  async updateSessionStatus(id: string, status: SessionStatus, client?: PoolClient): Promise<ResearchSession | null> {
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

  async createDocument(input: CreateSessionDocumentInput, client?: PoolClient): Promise<SessionDocument> {
    const id = uuidv4();
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
      input.documentType || WorkbenchDocumentType.REFERENCE,
      input.mimeType || null,
      input.fileSizeBytes || null,
      input.pageCount || null,
      input.geminiFileUri ? DocumentUploadStatus.INDEXED : DocumentUploadStatus.UPLOADING,
    ];

    const queryFn = client
      ? () => client.query(sql, values)
      : () => this.db.query(sql, values);

    const result = await queryFn();
    return rowToSessionDocument(result.rows[0]);
  }

  async updateDocumentStatus(
    id: string,
    status: DocumentUploadStatus,
    geminiFileUri?: string,
    geminiFileName?: string,
    errorMessage?: string,
    client?: PoolClient
  ): Promise<SessionDocument | null> {
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

  async findDocumentsBySessionId(sessionId: string): Promise<SessionDocument[]> {
    const sql = `
      SELECT * FROM session_documents
      WHERE session_id = $1
      ORDER BY uploaded_at DESC
    `;
    const result = await this.db.query(sql, [sessionId]);
    return result.rows.map(rowToSessionDocument);
  }

  async findDocumentById(id: string): Promise<SessionDocument | null> {
    const sql = `SELECT * FROM session_documents WHERE id = $1`;
    const result = await this.db.query(sql, [id]);
    return result.rows.length > 0 ? rowToSessionDocument(result.rows[0]) : null;
  }

  async deleteDocument(id: string, client?: PoolClient): Promise<boolean> {
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

  async createQuery(input: CreateResearchQueryInput, client?: PoolClient): Promise<ResearchQuery> {
    const id = uuidv4();
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

  async updateQueryResponse(
    id: string,
    responseText: string,
    findings: ResearchFinding[],
    citations: Citation[],
    confidence: ConfidenceLevel,
    tokensUsed: number,
    processingTimeMs: number,
    errorMessage?: string,
    client?: PoolClient
  ): Promise<ResearchQuery | null> {
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

  async findQueriesBySessionId(sessionId: string): Promise<ResearchQuery[]> {
    const sql = `
      SELECT * FROM research_queries
      WHERE session_id = $1
      ORDER BY queried_at DESC
    `;
    const result = await this.db.query(sql, [sessionId]);
    return result.rows.map(rowToResearchQuery);
  }

  async findQueryById(id: string): Promise<ResearchQuery | null> {
    const sql = `SELECT * FROM research_queries WHERE id = $1`;
    const result = await this.db.query(sql, [id]);
    return result.rows.length > 0 ? rowToResearchQuery(result.rows[0]) : null;
  }

  // ============================================
  // Draft Rules
  // ============================================

  async createDraftRule(input: CreateDraftRuleInput, client?: PoolClient): Promise<DraftRule> {
    const id = uuidv4();
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

  async updateDraftRule(id: string, input: UpdateDraftRuleInput, client?: PoolClient): Promise<DraftRule | null> {
    const updates: string[] = [];
    const values: unknown[] = [id];
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

  async updateDraftRuleStatus(id: string, status: RuleValidationStatus, client?: PoolClient): Promise<DraftRule | null> {
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

  async updateDraftRuleTestCounts(
    id: string,
    passCount: number,
    failCount: number,
    client?: PoolClient
  ): Promise<DraftRule | null> {
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

  async findDraftRulesBySessionId(sessionId: string): Promise<DraftRule[]> {
    const sql = `
      SELECT * FROM draft_rules
      WHERE session_id = $1
      ORDER BY created_at DESC
    `;
    const result = await this.db.query(sql, [sessionId]);
    return result.rows.map(rowToDraftRule);
  }

  async findDraftRuleById(id: string): Promise<DraftRule | null> {
    const sql = `SELECT * FROM draft_rules WHERE id = $1`;
    const result = await this.db.query(sql, [id]);
    return result.rows.length > 0 ? rowToDraftRule(result.rows[0]) : null;
  }

  async deleteDraftRule(id: string, client?: PoolClient): Promise<boolean> {
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

  async createTestCase(input: CreateRuleTestCaseInput, client?: PoolClient): Promise<RuleTestCase> {
    const id = uuidv4();
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

  async updateTestCaseResult(
    id: string,
    actualOutputs: Record<string, unknown>,
    passed: boolean,
    executionTimeMs: number,
    errorMessage?: string,
    client?: PoolClient
  ): Promise<RuleTestCase | null> {
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

  async findTestCasesBySessionId(sessionId: string): Promise<RuleTestCase[]> {
    const sql = `
      SELECT * FROM rule_test_cases
      WHERE session_id = $1
      ORDER BY created_at DESC
    `;
    const result = await this.db.query(sql, [sessionId]);
    return result.rows.map(rowToRuleTestCase);
  }

  async findTestCaseById(id: string): Promise<RuleTestCase | null> {
    const sql = `SELECT * FROM rule_test_cases WHERE id = $1`;
    const result = await this.db.query(sql, [id]);
    return result.rows.length > 0 ? rowToRuleTestCase(result.rows[0]) : null;
  }

  async deleteTestCase(id: string, client?: PoolClient): Promise<boolean> {
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

  async createExportedRuleSet(
    sessionId: string,
    ruleSetId: string,
    name: string,
    version: string,
    vertical: string,
    yamlContent: string,
    ruleCount: number,
    testCaseCount: number,
    passRate: number,
    filePath?: string,
    client?: PoolClient
  ): Promise<ExportedRuleSet> {
    const id = uuidv4();
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

  async updateDeployment(id: string, deployedTo: string, client?: PoolClient): Promise<ExportedRuleSet | null> {
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

  async findExportedRuleSetsBySessionId(sessionId: string): Promise<ExportedRuleSet[]> {
    const sql = `
      SELECT * FROM exported_rule_sets
      WHERE session_id = $1
      ORDER BY created_at DESC
    `;
    const result = await this.db.query(sql, [sessionId]);
    return result.rows.map(rowToExportedRuleSet);
  }

  async findExportedRuleSetById(id: string): Promise<ExportedRuleSet | null> {
    const sql = `SELECT * FROM exported_rule_sets WHERE id = $1`;
    const result = await this.db.query(sql, [id]);
    return result.rows.length > 0 ? rowToExportedRuleSet(result.rows[0]) : null;
  }
}

// Export singleton instance
export const workbenchRepository = new WorkbenchRepository();
