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
        ruleSetId: row.rule_set_id,
        ruleSetVersion: row.rule_set_version,
        dimension: row.dimension,
        ruleId: row.rule_id,
        fieldName: row.field_name,
        inputValue: row.input_value !== null ? Number(row.input_value) : null,
        outputScore: Number(row.output_score),
        maxScore: Number(row.max_score),
        weight: Number(row.weight),
        passed: row.passed,
        explanation: row.explanation,
        executedAt: new Date(row.executed_at),
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
            valuePlaceholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
            values.push(id, exec.analysisId, exec.ruleSetId, exec.ruleSetVersion, exec.dimension, exec.ruleId, exec.fieldName, exec.inputValue, exec.outputScore, exec.maxScore, exec.weight, exec.passed, exec.explanation);
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
    async findByAnalysisId(analysisId) {
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