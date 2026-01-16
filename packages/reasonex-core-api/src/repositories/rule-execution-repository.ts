/**
 * Rule Execution Repository - Database operations for rule executions
 * Phase 2b: Database Integration
 */

import { PoolClient } from 'pg';
import { getDatabase } from '../lib/database';
import { RuleExecution, CreateRuleExecutionInput } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

// Row to entity mapping helper
function rowToRuleExecution(row: Record<string, unknown>): RuleExecution {
  return {
    id: row.id as string,
    analysisId: row.analysis_id as string,
    ruleSetId: row.rule_set_id as string,
    ruleSetVersion: row.rule_set_version as string,
    dimension: row.dimension as string,
    ruleId: row.rule_id as string,
    fieldName: row.field_name as string,
    inputValue: row.input_value !== null ? Number(row.input_value) : null,
    outputScore: Number(row.output_score),
    maxScore: Number(row.max_score),
    weight: Number(row.weight),
    passed: row.passed as boolean,
    explanation: row.explanation as string | null,
    executedAt: new Date(row.executed_at as string),
  };
}

export class RuleExecutionRepository {
  private db = getDatabase();

  /**
   * Create multiple rule executions in a single batch insert
   */
  async createMany(
    executions: CreateRuleExecutionInput[],
    client?: PoolClient
  ): Promise<RuleExecution[]> {
    if (executions.length === 0) {
      return [];
    }

    // Build bulk insert SQL
    const values: unknown[] = [];
    const valuePlaceholders: string[] = [];
    let paramIndex = 1;

    for (const exec of executions) {
      const id = uuidv4();
      valuePlaceholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      values.push(
        id,
        exec.analysisId,
        exec.ruleSetId,
        exec.ruleSetVersion,
        exec.dimension,
        exec.ruleId,
        exec.fieldName,
        exec.inputValue,
        exec.outputScore,
        exec.maxScore,
        exec.weight,
        exec.passed,
        exec.explanation
      );
    }

    const sql = `
      INSERT INTO rule_executions (
        id, analysis_id, rule_set_id, rule_set_version, dimension,
        rule_id, field_name, input_value, output_score, max_score,
        weight, passed, explanation
      ) VALUES ${valuePlaceholders.join(', ')}
      RETURNING *
    `;

    const queryFn = client
      ? () => client.query(sql, values)
      : () => this.db.query(sql, values);

    const result = await queryFn();
    return result.rows.map(rowToRuleExecution);
  }

  /**
   * Find all rule executions for an analysis
   */
  async findByAnalysisId(analysisId: string): Promise<RuleExecution[]> {
    const sql = `
      SELECT * FROM rule_executions
      WHERE analysis_id = $1
      ORDER BY dimension, rule_id
    `;

    const result = await this.db.query(sql, [analysisId]);
    return result.rows.map(rowToRuleExecution);
  }

  /**
   * Count rule executions for an analysis
   */
  async countByAnalysisId(analysisId: string, client?: PoolClient): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count FROM rule_executions
      WHERE analysis_id = $1
    `;

    const queryFn = client
      ? () => client.query(sql, [analysisId])
      : () => this.db.query(sql, [analysisId]);

    const result = await queryFn();
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Delete all rule executions for an analysis (for re-scoring)
   */
  async deleteByAnalysisId(analysisId: string, client?: PoolClient): Promise<number> {
    const sql = `
      DELETE FROM rule_executions
      WHERE analysis_id = $1
    `;

    const queryFn = client
      ? () => client.query(sql, [analysisId])
      : () => this.db.query(sql, [analysisId]);

    const result = await queryFn();
    return result.rowCount || 0;
  }
}

// Export singleton instance
export const ruleExecutionRepository = new RuleExecutionRepository();
