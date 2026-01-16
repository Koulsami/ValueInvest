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
    ruleId: row.rule_id as string,
    ruleName: row.rule_name as string,
    category: row.category as string,
    inputValue: row.input_value as number | string | null,
    thresholdUsed: row.threshold_used as string | null,
    resultClassification: row.result_classification as string,
    scoreAwarded: Number(row.score_awarded),
    executionTimeMs: Number(row.execution_time_ms),
    createdAt: new Date(row.created_at as string),
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
      valuePlaceholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      values.push(
        id,
        exec.analysisId,
        exec.ruleId,
        exec.ruleName,
        exec.category,
        exec.inputValue,
        exec.thresholdUsed,
        exec.resultClassification,
        exec.scoreAwarded,
        exec.executionTimeMs
      );
    }

    const sql = `
      INSERT INTO rule_executions (
        id, analysis_id, rule_id, rule_name, category,
        input_value, threshold_used, result_classification,
        score_awarded, execution_time_ms
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
      ORDER BY category, rule_id
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
