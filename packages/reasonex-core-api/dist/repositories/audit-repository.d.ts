/**
 * Audit Repository - Database operations for audit logging
 * Phase 2b: Database Integration
 */
import { PoolClient } from 'pg';
import { Request } from 'express';
import { AuditLogEntry } from '../types/database';
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'LOCK' | 'VALIDATE' | 'SCORE' | 'DETECT' | 'ROUTE' | 'TREE';
export declare class AuditRepository {
    private db;
    /**
     * Log an audit entry
     */
    log(tableName: string, recordId: string, action: AuditAction, oldValues: Record<string, unknown> | null, newValues: Record<string, unknown> | null, req?: Request, client?: PoolClient): Promise<AuditLogEntry>;
    /**
     * Log a score operation
     */
    logScore(analysisId: string, scores: Record<string, unknown>, ruleExecutionCount: number, req?: Request, client?: PoolClient): Promise<AuditLogEntry>;
    /**
     * Log a lock operation
     */
    logLock(analysisId: string, dataHash: string, lockId: string, req?: Request, client?: PoolClient): Promise<AuditLogEntry>;
    /**
     * Log a validate operation
     */
    logValidate(analysisId: string, status: string, checkCount: number, req?: Request, client?: PoolClient): Promise<AuditLogEntry>;
    /**
     * Log a tree building operation
     */
    logTree(analysisId: string | null, entity: string, req?: Request, client?: PoolClient): Promise<AuditLogEntry>;
    /**
     * Log a change detection operation
     */
    logDetect(changesCount: number, oldVersion: string | null, newVersion: string | null, req?: Request, client?: PoolClient): Promise<AuditLogEntry>;
    /**
     * Log a routing operation
     */
    logRoute(tier: string, reviewers: string[] | null, req?: Request, client?: PoolClient): Promise<AuditLogEntry>;
    /**
     * Find audit entries for a record
     */
    findByRecordId(tableName: string, recordId: string): Promise<AuditLogEntry[]>;
    /**
     * Find recent audit entries
     */
    findRecent(limit?: number): Promise<AuditLogEntry[]>;
}
export declare const auditRepository: AuditRepository;
//# sourceMappingURL=audit-repository.d.ts.map