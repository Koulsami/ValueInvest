/**
 * Analysis Repository - Database operations for analyses
 * Phase 2b: Database Integration
 */

import { PoolClient } from 'pg';
import { getDatabase } from '../lib/database';
import {
  Analysis,
  AnalysisStatus,
  AnalysisWithCompany,
  CreateAnalysisInput,
  UpdateAnalysisScoresInput,
  ValidationStatus,
  ListAnalysesParams,
} from '../types/database';
import { v4 as uuidv4 } from 'uuid';

// Row to entity mapping helper
function rowToAnalysis(row: Record<string, unknown>): Analysis {
  return {
    id: row.id as string,
    companyId: row.company_id as string | null,
    version: row.version as number,
    isCurrent: row.is_current as boolean,
    status: row.status as AnalysisStatus,
    treeData: (row.tree_data as Record<string, unknown>) || {},
    moatScore: row.moat_score !== null ? Number(row.moat_score) : null,
    valuationScore: row.valuation_score !== null ? Number(row.valuation_score) : null,
    qualityScore: row.quality_score !== null ? Number(row.quality_score) : null,
    growthScore: row.growth_score !== null ? Number(row.growth_score) : null,
    dividendScore: row.dividend_score !== null ? Number(row.dividend_score) : null,
    overallScore: row.overall_score !== null ? Number(row.overall_score) : null,
    classification: row.classification as string | null,
    recommendation: row.recommendation as string | null,
    validationStatus: row.validation_status as ValidationStatus | null,
    confidenceScore: row.confidence_score !== null ? Number(row.confidence_score) : null,
    dataHash: row.data_hash as string | null,
    lockId: row.lock_id as string | null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

function rowToAnalysisWithCompany(row: Record<string, unknown>): AnalysisWithCompany {
  const analysis = rowToAnalysis(row);
  return {
    ...analysis,
    companyTicker: row.ticker as string | undefined,
    companyName: row.company_name as string | undefined,
  };
}

export class AnalysisRepository {
  private db = getDatabase();

  /**
   * Find analysis by ID
   */
  async findById(id: string, client?: PoolClient): Promise<Analysis | null> {
    const sql = `
      SELECT * FROM analyses
      WHERE id = $1
    `;

    const queryFn = client
      ? () => client.query(sql, [id])
      : () => this.db.query(sql, [id]);

    const result = await queryFn();

    if (result.rows.length === 0) {
      return null;
    }

    return rowToAnalysis(result.rows[0]);
  }

  /**
   * Find analysis by ID with company info
   */
  async findByIdWithCompany(id: string): Promise<AnalysisWithCompany | null> {
    const sql = `
      SELECT a.*, c.ticker, c.name as company_name
      FROM analyses a
      LEFT JOIN companies c ON a.company_id = c.id
      WHERE a.id = $1
    `;

    const result = await this.db.query(sql, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return rowToAnalysisWithCompany(result.rows[0]);
  }

  /**
   * Find current analysis for a company
   */
  async findCurrentByCompanyId(companyId: string, client?: PoolClient): Promise<Analysis | null> {
    const sql = `
      SELECT * FROM analyses
      WHERE company_id = $1 AND is_current = true
    `;

    const queryFn = client
      ? () => client.query(sql, [companyId])
      : () => this.db.query(sql, [companyId]);

    const result = await queryFn();

    if (result.rows.length === 0) {
      return null;
    }

    return rowToAnalysis(result.rows[0]);
  }

  /**
   * Find all analyses for a company
   */
  async findByCompanyId(companyId: string, params: ListAnalysesParams = {}): Promise<Analysis[]> {
    const { status, limit = 10, offset = 0 } = params;

    const conditions = ['company_id = $1'];
    const values: unknown[] = [companyId];
    let paramIndex = 2;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    const sql = `
      SELECT * FROM analyses
      WHERE ${conditions.join(' AND ')}
      ORDER BY version DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const result = await this.db.query(sql, [...values, limit, offset]);
    return result.rows.map(rowToAnalysis);
  }

  /**
   * Get the next version number for a company
   */
  async getNextVersion(companyId: string, client?: PoolClient): Promise<number> {
    const sql = `
      SELECT COALESCE(MAX(version), 0) + 1 as next_version
      FROM analyses
      WHERE company_id = $1
    `;

    const queryFn = client
      ? () => client.query(sql, [companyId])
      : () => this.db.query(sql, [companyId]);

    const result = await queryFn();
    return parseInt(result.rows[0].next_version, 10);
  }

  /**
   * Create a new analysis
   */
  async create(input: CreateAnalysisInput, client?: PoolClient): Promise<Analysis> {
    const id = uuidv4();
    let version = 1;

    // Get next version if company is specified
    if (input.companyId) {
      version = await this.getNextVersion(input.companyId, client);
    }

    const sql = `
      INSERT INTO analyses (
        id, company_id, version, is_current, status, tree_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
      RETURNING *
    `;

    const values = [
      id,
      input.companyId || null,
      version,
      true, // New analyses are always current (trigger handles the old ones)
      input.status || AnalysisStatus.DRAFT,
      JSON.stringify(input.treeData || {}),
    ];

    const queryFn = client
      ? () => client.query(sql, values)
      : () => this.db.query(sql, values);

    const result = await queryFn();
    return rowToAnalysis(result.rows[0]);
  }

  /**
   * Update analysis with scores
   */
  async updateScores(
    id: string,
    scores: UpdateAnalysisScoresInput,
    client?: PoolClient
  ): Promise<Analysis> {
    const sql = `
      UPDATE analyses
      SET moat_score = $2,
          valuation_score = $3,
          quality_score = $4,
          growth_score = $5,
          dividend_score = $6,
          overall_score = $7,
          classification = $8,
          recommendation = $9,
          status = 'SCORED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      scores.moatScore,
      scores.valuationScore,
      scores.qualityScore,
      scores.growthScore,
      scores.dividendScore,
      scores.overallScore,
      scores.classification,
      scores.recommendation,
    ];

    const queryFn = client
      ? () => client.query(sql, values)
      : () => this.db.query(sql, values);

    const result = await queryFn();

    if (result.rows.length === 0) {
      throw new Error(`Analysis not found: ${id}`);
    }

    return rowToAnalysis(result.rows[0]);
  }

  /**
   * Update analysis with lock data
   */
  async updateLock(
    id: string,
    dataHash: string,
    lockId: string,
    client?: PoolClient
  ): Promise<Analysis> {
    const sql = `
      UPDATE analyses
      SET data_hash = $2,
          lock_id = $3,
          status = 'LOCKED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const queryFn = client
      ? () => client.query(sql, [id, dataHash, lockId])
      : () => this.db.query(sql, [id, dataHash, lockId]);

    const result = await queryFn();

    if (result.rows.length === 0) {
      throw new Error(`Analysis not found: ${id}`);
    }

    return rowToAnalysis(result.rows[0]);
  }

  /**
   * Update analysis validation status
   */
  async updateValidation(
    id: string,
    validationStatus: ValidationStatus,
    client?: PoolClient
  ): Promise<Analysis> {
    const sql = `
      UPDATE analyses
      SET validation_status = $2,
          status = 'VALIDATED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const queryFn = client
      ? () => client.query(sql, [id, validationStatus])
      : () => this.db.query(sql, [id, validationStatus]);

    const result = await queryFn();

    if (result.rows.length === 0) {
      throw new Error(`Analysis not found: ${id}`);
    }

    return rowToAnalysis(result.rows[0]);
  }

  /**
   * Update tree data
   */
  async updateTreeData(
    id: string,
    treeData: Record<string, unknown>,
    client?: PoolClient
  ): Promise<Analysis> {
    const sql = `
      UPDATE analyses
      SET tree_data = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const queryFn = client
      ? () => client.query(sql, [id, JSON.stringify(treeData)])
      : () => this.db.query(sql, [id, JSON.stringify(treeData)]);

    const result = await queryFn();

    if (result.rows.length === 0) {
      throw new Error(`Analysis not found: ${id}`);
    }

    return rowToAnalysis(result.rows[0]);
  }

  /**
   * Check if analysis is locked
   */
  async isLocked(id: string, client?: PoolClient): Promise<boolean> {
    const analysis = await this.findById(id, client);
    return analysis?.status === AnalysisStatus.LOCKED;
  }
}

// Export singleton instance
export const analysisRepository = new AnalysisRepository();
