import { Logger } from '../lib/logger';
export type HashAlgorithm = 'SHA256' | 'SHA3-256' | 'SHA512';
export type CanonicalizationMode = 'strict' | 'relaxed';
export interface LockOptions {
    algorithm?: HashAlgorithm;
    includeTimestamp?: boolean;
    canonicalization?: CanonicalizationMode;
    schemaId?: string;
    metadata?: Record<string, unknown>;
}
export interface LockResult {
    locked_data: Record<string, unknown>;
    data_hash: string;
    lock_timestamp: string;
    lock_id: string;
    algorithm: HashAlgorithm;
    canonicalization: CanonicalizationMode;
    schema_id?: string;
    metadata?: Record<string, unknown>;
}
export interface VerificationResult {
    valid: boolean;
    expected_hash: string;
    actual_hash: string;
    lock_id: string;
    verified_at: string;
    issues?: string[];
}
export declare class LockManager {
    private logger;
    private tracer;
    constructor(logger?: Logger);
    /**
     * Canonicalize data for consistent hashing
     * Ensures same data always produces same hash regardless of key order
     */
    canonicalize(data: unknown, mode?: CanonicalizationMode): string;
    /**
     * Compute hash of canonicalized data
     */
    computeHash(canonicalData: string, algorithm?: HashAlgorithm): string;
    /**
     * Create a lock for data
     */
    createLock(data: Record<string, unknown>, options?: LockOptions): LockResult;
    /**
     * Verify a lock against data
     */
    verifyLock(data: Record<string, unknown>, expectedHash: string, lockTimestamp?: string, options?: LockOptions): VerificationResult;
    /**
     * Compare two data objects and determine if they would produce the same hash
     */
    compareHashes(data1: Record<string, unknown>, data2: Record<string, unknown>, options?: LockOptions): {
        equal: boolean;
        hash1: string;
        hash2: string;
    };
}
export declare const lockManager: LockManager;
export default lockManager;
//# sourceMappingURL=lock-manager.d.ts.map