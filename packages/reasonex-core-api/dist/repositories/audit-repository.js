"use strict";
/**
 * Audit Repository - Database operations for audit logging
 * Phase 2b: Database Integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRepository = exports.AuditRepository = void 0;
const database_1 = require("../lib/database");
const uuid_1 = require("uuid");
// Row to entity mapping helper
function rowToAuditLogEntry(row) {
    return {
        id: row.id,
        tableName: row.table_name,
        recordId: row.record_id,
        action: row.action,
        oldValues: row.old_values,
        newValues: row.new_values,
        userId: row.user_id,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: new Date(row.created_at),
    };
}
/**
 * Extract IP address from request
 */
function extractIpAddress(req) {
    if (!req)
        return null;
    // Try various headers for IP
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
        return ips.split(',')[0].trim();
    }
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
        return Array.isArray(realIp) ? realIp[0] : realIp;
    }
    return req.ip || req.socket?.remoteAddress || null;
}
/**
 * Extract user agent from request
 */
function extractUserAgent(req) {
    if (!req)
        return null;
    const userAgent = req.headers['user-agent'];
    return userAgent || null;
}
class AuditRepository {
    db = (0, database_1.getDatabase)();
    /**
     * Log an audit entry
     */
    async log(tableName, recordId, action, oldValues, newValues, req, client) {
        const id = (0, uuid_1.v4)();
        const ipAddress = extractIpAddress(req);
        const userAgent = extractUserAgent(req);
        const sql = `
      INSERT INTO audit_log (
        id, table_name, record_id, action, old_values, new_values,
        user_id, ip_address, user_agent
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
      RETURNING *
    `;
        const values = [
            id,
            tableName,
            recordId,
            action,
            oldValues ? JSON.stringify(oldValues) : null,
            newValues ? JSON.stringify(newValues) : null,
            null, // userId - not implemented yet
            ipAddress,
            userAgent,
        ];
        const queryFn = client
            ? () => client.query(sql, values)
            : () => this.db.query(sql, values);
        const result = await queryFn();
        return rowToAuditLogEntry(result.rows[0]);
    }
    /**
     * Log a score operation
     */
    async logScore(analysisId, scores, ruleExecutionCount, req, client) {
        return this.log('analyses', analysisId, 'SCORE', null, {
            ...scores,
            rule_executions_count: ruleExecutionCount,
            operation: 'score',
        }, req, client);
    }
    /**
     * Log a lock operation
     */
    async logLock(analysisId, dataHash, lockId, req, client) {
        return this.log('analyses', analysisId, 'LOCK', null, {
            data_hash: dataHash,
            lock_id: lockId,
            operation: 'lock',
        }, req, client);
    }
    /**
     * Log a validate operation
     */
    async logValidate(analysisId, status, checkCount, req, client) {
        return this.log('analyses', analysisId, 'VALIDATE', null, {
            validation_status: status,
            checks_count: checkCount,
            operation: 'validate',
        }, req, client);
    }
    /**
     * Log a tree building operation
     */
    async logTree(analysisId, entity, req, client) {
        const recordId = analysisId || 'ad-hoc';
        return this.log('analyses', recordId, 'TREE', null, {
            entity,
            operation: 'tree_build',
        }, req, client);
    }
    /**
     * Log a change detection operation
     */
    async logDetect(changesCount, oldVersion, newVersion, req, client) {
        return this.log('analyses', 'detect-operation', 'DETECT', null, {
            changes_count: changesCount,
            old_version: oldVersion,
            new_version: newVersion,
            operation: 'detect_changes',
        }, req, client);
    }
    /**
     * Log a routing operation
     */
    async logRoute(tier, reviewers, req, client) {
        return this.log('analyses', 'route-operation', 'ROUTE', null, {
            tier,
            reviewers,
            operation: 'route_decision',
        }, req, client);
    }
    /**
     * Find audit entries for a record
     */
    async findByRecordId(tableName, recordId) {
        const sql = `
      SELECT * FROM audit_log
      WHERE table_name = $1 AND record_id = $2
      ORDER BY created_at DESC
    `;
        const result = await this.db.query(sql, [tableName, recordId]);
        return result.rows.map(rowToAuditLogEntry);
    }
    /**
     * Find recent audit entries
     */
    async findRecent(limit = 50) {
        const sql = `
      SELECT * FROM audit_log
      ORDER BY created_at DESC
      LIMIT $1
    `;
        const result = await this.db.query(sql, [limit]);
        return result.rows.map(rowToAuditLogEntry);
    }
}
exports.AuditRepository = AuditRepository;
// Export singleton instance
exports.auditRepository = new AuditRepository();
//# sourceMappingURL=audit-repository.js.map