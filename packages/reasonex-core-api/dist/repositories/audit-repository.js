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
        eventType: row.event_type,
        eventCategory: row.event_category,
        entityType: row.entity_type,
        entityId: row.entity_id,
        actorType: row.actor_type,
        actorId: row.actor_id,
        action: row.action,
        oldValue: row.old_value,
        newValue: row.new_value,
        metadata: row.metadata || {},
        correlationId: row.correlation_id,
        traceId: row.trace_id,
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
/**
 * Extract trace ID from request
 */
function extractTraceId(req) {
    if (!req)
        return null;
    return req.traceContext?.traceId || null;
}
class AuditRepository {
    db = (0, database_1.getDatabase)();
    /**
     * Log an audit entry
     */
    async log(eventType, eventCategory, entityType, entityId, action, oldValue, newValue, metadata = {}, req, client) {
        const id = (0, uuid_1.v4)();
        const ipAddress = extractIpAddress(req);
        const userAgent = extractUserAgent(req);
        const traceId = extractTraceId(req);
        const sql = `
      INSERT INTO audit_log (
        id, event_type, event_category, entity_type, entity_id,
        actor_type, actor_id, action, old_value, new_value,
        metadata, trace_id, ip_address, user_agent
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
      RETURNING *
    `;
        const values = [
            id,
            eventType,
            eventCategory,
            entityType,
            entityId,
            'API', // actorType - default to API
            null, // actorId - not implemented yet
            action,
            oldValue ? JSON.stringify(oldValue) : null,
            newValue ? JSON.stringify(newValue) : null,
            JSON.stringify(metadata),
            traceId,
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
        return this.log('SCORE_ANALYSIS', 'ANALYSIS', 'analysis', analysisId, 'SCORE', null, {
            ...scores,
            rule_executions_count: ruleExecutionCount,
        }, { operation: 'score' }, req, client);
    }
    /**
     * Log a lock operation
     */
    async logLock(analysisId, dataHash, lockId, req, client) {
        return this.log('LOCK_ANALYSIS', 'ANALYSIS', 'analysis', analysisId, 'LOCK', null, {
            data_hash: dataHash,
            lock_id: lockId,
        }, { operation: 'lock' }, req, client);
    }
    /**
     * Log a validate operation
     */
    async logValidate(analysisId, status, checkCount, req, client) {
        return this.log('VALIDATE_ANALYSIS', 'VALIDATION', 'analysis', analysisId, 'VALIDATE', null, {
            validation_status: status,
            checks_count: checkCount,
        }, { operation: 'validate' }, req, client);
    }
    /**
     * Log a tree building operation
     */
    async logTree(analysisId, entity, req, client) {
        return this.log('BUILD_TREE', 'ANALYSIS', analysisId ? 'analysis' : null, analysisId, 'TREE', null, { entity }, { operation: 'tree_build' }, req, client);
    }
    /**
     * Log a change detection operation
     */
    async logDetect(changesCount, oldVersion, newVersion, req, client) {
        return this.log('DETECT_CHANGES', 'ANALYSIS', null, null, 'DETECT', null, {
            changes_count: changesCount,
            old_version: oldVersion,
            new_version: newVersion,
        }, { operation: 'detect_changes' }, req, client);
    }
    /**
     * Log a routing operation
     */
    async logRoute(tier, reviewers, req, client) {
        return this.log('ROUTE_DECISION', 'REVIEW', null, null, 'ROUTE', null, {
            tier,
            reviewers,
        }, { operation: 'route_decision' }, req, client);
    }
    /**
     * Find audit entries for an entity
     */
    async findByEntityId(entityType, entityId) {
        const sql = `
      SELECT * FROM audit_log
      WHERE entity_type = $1 AND entity_id = $2
      ORDER BY created_at DESC
    `;
        const result = await this.db.query(sql, [entityType, entityId]);
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