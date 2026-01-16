/**
 * Validation Result Repository - Database operations for validation results
 * Phase 2b: Database Integration
 */

import { PoolClient } from 'pg';
import { getDatabase } from '../lib/database';
import { ValidationResult, CreateValidationResultInput, CheckStatus } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

// Row to entity mapping helper
function rowToValidationResult(row: Record<string, unknown>): ValidationResult {
  return {
    id: row.id as string,
    analysisId: row.analysis_id as string,
    checkName: row.check_name as string,
    status: row.status as CheckStatus,
    details: (row.details as Record<string, unknown>) || {},
    executedAt: new Date(row.executed_at as string),
  };
}

export class ValidationResultRepository {
  private db = getDatabase();

  /**
   * Create multiple validation results in a single batch insert
   */
  async createMany(
    results: CreateValidationResultInput[],
    client?: PoolClient
  ): Promise<ValidationResult[]> {
    if (results.length === 0) {
      return [];
    }

    // Build bulk insert SQL
    const values: unknown[] = [];
    const valuePlaceholders: string[] = [];
    let paramIndex = 1;

    for (const result of results) {
      const id = uuidv4();
      valuePlaceholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      values.push(
        id,
        result.analysisId,
        result.checkName,
        result.status,
        JSON.stringify(result.details)
      );
    }

    const sql = `
      INSERT INTO validation_results (
        id, analysis_id, check_name, status, details
      ) VALUES ${valuePlaceholders.join(', ')}
      RETURNING *
    `;

    const queryFn = client
      ? () => client.query(sql, values)
      : () => this.db.query(sql, values);

    const dbResult = await queryFn();
    return dbResult.rows.map(rowToValidationResult);
  }

  /**
   * Find all validation results for an analysis
   */
  async findByAnalysisId(analysisId: string): Promise<ValidationResult[]> {
    const sql = `
      SELECT * FROM validation_results
      WHERE analysis_id = $1
      ORDER BY executed_at DESC
    `;

    const result = await this.db.query(sql, [analysisId]);
    return result.rows.map(rowToValidationResult);
  }

  /**
   * Find latest validation results for an analysis (one per check_name)
   */
  async findLatestByAnalysisId(analysisId: string): Promise<ValidationResult[]> {
    const sql = `
      SELECT DISTINCT ON (check_name) *
      FROM validation_results
      WHERE analysis_id = $1
      ORDER BY check_name, executed_at DESC
    `;

    const result = await this.db.query(sql, [analysisId]);
    return result.rows.map(rowToValidationResult);
  }

  /**
   * Count validation results for an analysis
   */
  async countByAnalysisId(analysisId: string): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count FROM validation_results
      WHERE analysis_id = $1
    `;

    const result = await this.db.query(sql, [analysisId]);
    return parseInt(result.rows[0].count, 10);
  }
}

// Export singleton instance
export const validationResultRepository = new ValidationResultRepository();
