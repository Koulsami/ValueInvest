"use strict";
/**
 * Rule Execution Repository - Database operations for rule executions
 * Phase 2b: Database Integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ruleExecutionRepository = exports.RuleExecutionRepository = void 0;
const database_1 = require("../lib/database");
const uuid_1 = require("uuid");
// Row to entity mapping helper
function rowToRuleExecution(row) {
    return {
        id: row.id,
        analysisId: row.analysis_id,
        ruleId: row.rule_id,
        ruleName: row.rule_name,
        category: row.category,
        inputValue: row.input_value,
        thresholdUsed: row.threshold_used,
        resultClassification: row.result_classification,
        scoreAwarded: Number(row.score_awarded),
        executionTimeMs: Number(row.execution_time_ms),
        createdAt: new Date(row.created_at),
    };
}
class RuleExecutionRepository {
    db = (0, database_1.getDatabase)();
    /**
     * Create multiple rule executions in a single batch insert
     */
    async createMany(executions, client) {
        if (executions.length === 0) {
            return [];
        }
        // Build bulk insert SQL
        const values = [];
        const valuePlaceholders = [];
        let paramIndex = 1;
        for (const exec of executions) {
            const id = (0, uuid_1.v4)();
            valuePlaceholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
            values.push(id, exec.analysisId, exec.ruleId, exec.ruleName, exec.category, exec.inputValue, exec.thresholdUsed, exec.resultClassification, exec.scoreAwarded, exec.executionTimeMs);
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
    async findByAnalysisId(analysisId) {
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
    async countByAnalysisId(analysisId, client) {
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
    async deleteByAnalysisId(analysisId, client) {
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
exports.RuleExecutionRepository = RuleExecutionRepository;
// Export singleton instance
exports.ruleExecutionRepository = new RuleExecutionRepository();
//# sourceMappingURL=rule-execution-repository.js.map