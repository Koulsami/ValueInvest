/**
 * Audit Repository - Database operations for audit logging
 * Phase 2b: Database Integration
 */

import { PoolClient } from 'pg';
import { Request } from 'express';
import { getDatabase } from '../lib/database';
import { AuditLogEntry } from '../types/database';
import { v4 as uuidv4 } from 'uuid';

// Audit action types
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'LOCK' | 'VALIDATE' | 'SCORE' | 'DETECT' | 'ROUTE' | 'TREE';

// Row to entity mapping helper
function rowToAuditLogEntry(row: Record<string, unknown>): AuditLogEntry {
  return {
    id: row.id as string,
    tableName: row.table_name as string,
    recordId: row.record_id as string,
    action: row.action as string,
    oldValues: row.old_values as Record<string, unknown> | null,
    newValues: row.new_values as Record<string, unknown> | null,
    userId: row.user_id as string | null,
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

export class AuditRepository {
  private db = getDatabase();

  /**
   * Log an audit entry
   */
  async log(
    tableName: string,
    recordId: string,
    action: AuditAction,
    oldValues: Record<string, unknown> | null,
    newValues: Record<string, unknown> | null,
    req?: Request,
    client?: PoolClient
  ): Promise<AuditLogEntry> {
    const id = uuidv4();
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
  async logScore(
    analysisId: string,
    scores: Record<string, unknown>,
    ruleExecutionCount: number,
    req?: Request,
    client?: PoolClient
  ): Promise<AuditLogEntry> {
    return this.log(
      'analyses',
      analysisId,
      'SCORE',
      null,
      {
        ...scores,
        rule_executions_count: ruleExecutionCount,
        operation: 'score',
      },
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
      'analyses',
      analysisId,
      'LOCK',
      null,
      {
        data_hash: dataHash,
        lock_id: lockId,
        operation: 'lock',
      },
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
      'analyses',
      analysisId,
      'VALIDATE',
      null,
      {
        validation_status: status,
        checks_count: checkCount,
        operation: 'validate',
      },
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
    const recordId = analysisId || 'ad-hoc';
    return this.log(
      'analyses',
      recordId,
      'TREE',
      null,
      {
        entity,
        operation: 'tree_build',
      },
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
      'analyses',
      'detect-operation',
      'DETECT',
      null,
      {
        changes_count: changesCount,
        old_version: oldVersion,
        new_version: newVersion,
        operation: 'detect_changes',
      },
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
      'analyses',
      'route-operation',
      'ROUTE',
      null,
      {
        tier,
        reviewers,
        operation: 'route_decision',
      },
      req,
      client
    );
  }

  /**
   * Find audit entries for a record
   */
  async findByRecordId(tableName: string, recordId: string): Promise<AuditLogEntry[]> {
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
