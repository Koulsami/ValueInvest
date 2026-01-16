import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../lib/logger';
import { Tracer, SpanStatus } from '../lib/tracer';

// Hash algorithms supported
export type HashAlgorithm = 'SHA256' | 'SHA3-256' | 'SHA512';

// Canonicalization modes
export type CanonicalizationMode = 'strict' | 'relaxed';

// Lock options interface
export interface LockOptions {
  algorithm?: HashAlgorithm;
  includeTimestamp?: boolean;
  canonicalization?: CanonicalizationMode;
  schemaId?: string;
  metadata?: Record<string, unknown>;
}

// Lock result interface
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

// Verification result interface
export interface VerificationResult {
  valid: boolean;
  expected_hash: string;
  actual_hash: string;
  lock_id: string;
  verified_at: string;
  issues?: string[];
}

// Lock Manager class
export class LockManager {
  private logger: Logger;
  private tracer: Tracer;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger(undefined, { service: 'reasonex-core-api', node: 'LockManager' });
    this.tracer = new Tracer('LockManager', this.logger);
  }

  /**
   * Canonicalize data for consistent hashing
   * Ensures same data always produces same hash regardless of key order
   */
  canonicalize(data: unknown, mode: CanonicalizationMode = 'strict'): string {
    return this.tracer.withSpanSync('canonicalize', (span) => {
      span.setAttribute('mode', mode);
      span.setAttribute('data_type', typeof data);

      if (data === null || data === undefined) {
        return 'null';
      }

      if (typeof data !== 'object') {
        return JSON.stringify(data);
      }

      if (Array.isArray(data)) {
        const canonicalArray = data.map(item => this.canonicalize(item, mode));
        return `[${canonicalArray.join(',')}]`;
      }

      // Object canonicalization
      const obj = data as Record<string, unknown>;
      const keys = Object.keys(obj).sort();

      if (mode === 'relaxed') {
        // Relaxed mode: ignore null/undefined values
        const filtered = keys.filter(k => obj[k] !== null && obj[k] !== undefined);
        const pairs = filtered.map(k => `${JSON.stringify(k)}:${this.canonicalize(obj[k], mode)}`);
        return `{${pairs.join(',')}}`;
      }

      // Strict mode: include all keys
      const pairs = keys.map(k => `${JSON.stringify(k)}:${this.canonicalize(obj[k], mode)}`);
      const result = `{${pairs.join(',')}}`;

      span.setAttribute('output_length', result.length);
      return result;
    });
  }

  /**
   * Compute hash of canonicalized data
   */
  computeHash(canonicalData: string, algorithm: HashAlgorithm = 'SHA256'): string {
    return this.tracer.withSpanSync('computeHash', (span) => {
      span.setAttribute('algorithm', algorithm);
      span.setAttribute('input_length', canonicalData.length);

      let hash: string;

      switch (algorithm) {
        case 'SHA256':
          hash = CryptoJS.SHA256(canonicalData).toString(CryptoJS.enc.Hex);
          break;
        case 'SHA3-256':
          hash = CryptoJS.SHA3(canonicalData, { outputLength: 256 }).toString(CryptoJS.enc.Hex);
          break;
        case 'SHA512':
          hash = CryptoJS.SHA512(canonicalData).toString(CryptoJS.enc.Hex);
          break;
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`);
      }

      span.setAttribute('hash_length', hash.length);
      this.logger.debug(`Hash computed`, { algorithm, hashPrefix: hash.slice(0, 16) });

      return hash;
    });
  }

  /**
   * Create a lock for data
   */
  createLock(data: Record<string, unknown>, options: LockOptions = {}): LockResult {
    return this.tracer.withSpanSync('createLock', (span) => {
      const {
        algorithm = 'SHA256',
        includeTimestamp = true,
        canonicalization = 'strict',
        schemaId,
        metadata,
      } = options;

      span.setAttributes({
        algorithm,
        includeTimestamp,
        canonicalization,
        hasSchemaId: !!schemaId,
        hasMetadata: !!metadata,
      });

      const lockId = uuidv4();
      const lockTimestamp = new Date().toISOString();

      this.logger.info('Creating lock', {
        operation: 'createLock',
        lockId,
        algorithm,
        dataKeys: Object.keys(data).length,
      });

      // Prepare data for hashing
      let dataToHash = { ...data };

      if (includeTimestamp) {
        dataToHash = {
          ...dataToHash,
          _lock_timestamp: lockTimestamp,
        };
      }

      // Canonicalize and hash
      const canonicalData = this.canonicalize(dataToHash, canonicalization);
      const dataHash = this.computeHash(canonicalData, algorithm);

      const result: LockResult = {
        locked_data: data,
        data_hash: dataHash,
        lock_timestamp: lockTimestamp,
        lock_id: lockId,
        algorithm,
        canonicalization,
      };

      if (schemaId) {
        result.schema_id = schemaId;
      }

      if (metadata) {
        result.metadata = metadata;
      }

      this.logger.info('Lock created', {
        operation: 'createLock',
        lockId,
        hashPrefix: dataHash.slice(0, 16),
        dataSize: JSON.stringify(data).length,
      });

      span.setAttributes({
        lockId,
        hashPrefix: dataHash.slice(0, 16),
      });

      return result;
    });
  }

  /**
   * Verify a lock against data
   */
  verifyLock(
    data: Record<string, unknown>,
    expectedHash: string,
    lockTimestamp?: string,
    options: LockOptions = {}
  ): VerificationResult {
    return this.tracer.withSpanSync('verifyLock', (span) => {
      const {
        algorithm = 'SHA256',
        includeTimestamp = true,
        canonicalization = 'strict',
      } = options;

      span.setAttributes({
        algorithm,
        includeTimestamp,
        canonicalization,
      });

      const verifiedAt = new Date().toISOString();
      const verificationId = uuidv4();

      this.logger.info('Verifying lock', {
        operation: 'verifyLock',
        verificationId,
        expectedHashPrefix: expectedHash.slice(0, 16),
      });

      // Prepare data for hashing (same as createLock)
      let dataToHash = { ...data };

      if (includeTimestamp && lockTimestamp) {
        dataToHash = {
          ...dataToHash,
          _lock_timestamp: lockTimestamp,
        };
      }

      // Canonicalize and hash
      const canonicalData = this.canonicalize(dataToHash, canonicalization);
      const actualHash = this.computeHash(canonicalData, algorithm);

      const valid = actualHash === expectedHash;
      const issues: string[] = [];

      if (!valid) {
        issues.push('Hash mismatch - data may have been tampered with');
        this.logger.warn('Lock verification failed', {
          operation: 'verifyLock',
          verificationId,
          expectedHashPrefix: expectedHash.slice(0, 16),
          actualHashPrefix: actualHash.slice(0, 16),
        });
      }

      const result: VerificationResult = {
        valid,
        expected_hash: expectedHash,
        actual_hash: actualHash,
        lock_id: verificationId,
        verified_at: verifiedAt,
      };

      if (issues.length > 0) {
        result.issues = issues;
      }

      span.setAttributes({
        valid,
        verificationId,
      });

      if (!valid) {
        span.setStatus(SpanStatus.ERROR, 'Hash mismatch');
      }

      this.logger.info('Lock verification complete', {
        operation: 'verifyLock',
        verificationId,
        valid,
      });

      return result;
    });
  }

  /**
   * Compare two data objects and determine if they would produce the same hash
   */
  compareHashes(
    data1: Record<string, unknown>,
    data2: Record<string, unknown>,
    options: LockOptions = {}
  ): { equal: boolean; hash1: string; hash2: string } {
    const { algorithm = 'SHA256', canonicalization = 'strict' } = options;

    const canonical1 = this.canonicalize(data1, canonicalization);
    const canonical2 = this.canonicalize(data2, canonicalization);

    const hash1 = this.computeHash(canonical1, algorithm);
    const hash2 = this.computeHash(canonical2, algorithm);

    return {
      equal: hash1 === hash2,
      hash1,
      hash2,
    };
  }
}

// Default instance
export const lockManager = new LockManager();

export default lockManager;
