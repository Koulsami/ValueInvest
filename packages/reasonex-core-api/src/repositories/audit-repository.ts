/**
 * Audit Repository - Database operations for audit logging
 * Phase 2b: Database Integration
 */

import { PoolClient } from 'pg';
import { Request } from 'express';
import { getDatabase } from '../lib/database';
import { AuditLogEntry } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

// Event categories
export type EventCategory = 'API' | 'ANALYSIS' | 'VALIDATION' | 'REVIEW' | 'SYSTEM';

// Row to entity mapping helper
function rowToAuditLogEntry(row: Record<string, unknown>): AuditLogEntry {
  return {
    id: row.id as string,
    eventType: row.event_type as string,
    eventCategory: row.event_category as string,
    entityType: row.entity_type as string | null,
    entityId: row.entity_id as string | null,
    actorType: row.actor_type as string,
    actorId: row.actor_id as string | null,
    action: row.action as string,
    oldValue: row.old_value as Record<string, unknown> | null,
    newValue: row.new_value as Record<string, unknown> | null,
    metadata: (row.metadata as Record<string, unknown>) || {},
    correlationId: row.correlation_id as string | null,
    traceId: row.trace_id as string | null,
    ipAddress: row.ip_address as string | null,
    userAgent: row.user_agent as string | null,
    createdAt: new Date(row.created_at as string),
  };
}

/**
 * Extract IP address from request
 */
function extractIpAddress(req?: Request): string | null {
  if (!req) return null;

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
function extractUserAgent(req?: Request): string | null {
  if (!req) return null;
  const userAgent = req.headers['user-agent'];
  return userAgent || null;
}

/**
 * Extract trace ID from request
 */
function extractTraceId(req?: Request): string | null {
  if (!req) return null;
  return req.traceContext?.traceId || null;
}

export class AuditRepository {
  private db = getDatabase();

  /**
   * Log an audit entry
   */
  async log(
    eventType: string,
    eventCategory: EventCategory,
    entityType: string | null,
    entityId: string | null,
    action: string,
    oldValue: Record<string, unknown> | null,
    newValue: Record<string, unknown> | null,
    metadata: Record<string, unknown> = {},
    req?: Request,
    client?: PoolClient
  ): Promise<AuditLogEntry> {
    const id = uuidv4();
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
  async logScore(
    analysisId: string,
    scores: Record<string, unknown>,
    ruleExecutionCount: number,
    req?: Request,
    client?: PoolClient
  ): Promise<AuditLogEntry> {
    return this.log(
      'SCORE_ANALYSIS',
      'ANALYSIS',
      'analysis',
      analysisId,
      'SCORE',
      null,
      {
        ...scores,
        rule_executions_count: ruleExecutionCount,
      },
      { operation: 'score' },
      req,
      client
    );
  }

  /**
   * Log a lock operation
   */
  async logLock(
    analysisId: string,
    dataHash: string,
    lockId: string,
    req?: Request,
    client?: PoolClient
  ): Promise<AuditLogEntry> {
    return this.log(
      'LOCK_ANALYSIS',
      'ANALYSIS',
      'analysis',
      analysisId,
      'LOCK',
      null,
      {
        data_hash: dataHash,
        lock_id: lockId,
      },
      { operation: 'lock' },
      req,
      client
    );
  }

  /**
   * Log a validate operation
   */
  async logValidate(
    analysisId: string,
    status: string,
    checkCount: number,
    req?: Request,
    client?: PoolClient
  ): Promise<AuditLogEntry> {
    return this.log(
      'VALIDATE_ANALYSIS',
      'VALIDATION',
      'analysis',
      analysisId,
      'VALIDATE',
      null,
      {
        validation_status: status,
        checks_count: checkCount,
      },
      { operation: 'validate' },
      req,
      client
    );
  }

  /**
   * Log a tree building operation
   */
  async logTree(
    analysisId: string | null,
    entity: string,
    req?: Request,
    client?: PoolClient
  ): Promise<AuditLogEntry> {
    return this.log(
      'BUILD_TREE',
      'ANALYSIS',
      analysisId ? 'analysis' : null,
      analysisId,
      'TREE',
      null,
      { entity },
      { operation: 'tree_build' },
      req,
      client
    );
  }

  /**
   * Log a change detection operation
   */
  async logDetect(
    changesCount: number,
    oldVersion: string | null,
    newVersion: string | null,
    req?: Request,
    client?: PoolClient
  ): Promise<AuditLogEntry> {
    return this.log(
      'DETECT_CHANGES',
      'ANALYSIS',
      null,
      null,
      'DETECT',
      null,
      {
        changes_count: changesCount,
        old_version: oldVersion,
        new_version: newVersion,
      },
      { operation: 'detect_changes' },
      req,
      client
    );
  }

  /**
   * Log a routing operation
   */
  async logRoute(
    tier: string,
    reviewers: string[] | null,
    req?: Request,
    client?: PoolClient
  ): Promise<AuditLogEntry> {
    return this.log(
      'ROUTE_DECISION',
      'REVIEW',
      null,
      null,
      'ROUTE',
      null,
      {
        tier,
        reviewers,
      },
      { operation: 'route_decision' },
      req,
      client
    );
  }

  /**
   * Find audit entries for an entity
   */
  async findByEntityId(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
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
  async findRecent(limit: number = 50): Promise<AuditLogEntry[]> {
    const sql = `
      SELECT * FROM audit_log
      ORDER BY created_at DESC
      LIMIT $1
    `;

    const result = await this.db.query(sql, [limit]);
    return result.rows.map(rowToAuditLogEntry);
  }
}

// Export singleton instance
export const auditRepository = new AuditRepository();
