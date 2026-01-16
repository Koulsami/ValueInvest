"use strict";
/**
 * Validation Result Repository - Database operations for validation results
 * Phase 2b: Database Integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationResultRepository = exports.ValidationResultRepository = void 0;
const database_1 = require("../lib/database");
const uuid_1 = require("uuid");
// Row to entity mapping helper
function rowToValidationResult(row) {
    return {
        id: row.id,
        analysisId: row.analysis_id,
        checkName: row.check_name,
        status: row.status,
        details: row.details || {},
        executedAt: new Date(row.executed_at),
    };
}
class ValidationResultRepository {
    db = (0, database_1.getDatabase)();
    /**
     * Create multiple validation results in a single batch insert
     */
    async createMany(results, client) {
        if (results.length === 0) {
            return [];
        }
        // Build bulk insert SQL
        const values = [];
        const valuePlaceholders = [];
        let paramIndex = 1;
        for (const result of results) {
            const id = (0, uuid_1.v4)();
            valuePlaceholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
            values.push(id, result.analysisId, result.checkName, result.status, JSON.stringify(result.details));
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
    async findByAnalysisId(analysisId) {
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
    async findLatestByAnalysisId(analysisId) {
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
    async countByAnalysisId(analysisId) {
        const sql = `
      SELECT COUNT(*) as count FROM validation_results
      WHERE analysis_id = $1
    `;
        const result = await this.db.query(sql, [analysisId]);
        return parseInt(result.rows[0].count, 10);
    }
}
exports.ValidationResultRepository = ValidationResultRepository;
// Export singleton instance
exports.validationResultRepository = new ValidationResultRepository();
//# sourceMappingURL=validation-result-repository.js.map