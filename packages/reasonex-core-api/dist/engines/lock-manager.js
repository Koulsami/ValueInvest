"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lockManager = exports.LockManager = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const uuid_1 = require("uuid");
const logger_1 = require("../lib/logger");
const tracer_1 = require("../lib/tracer");
// Lock Manager class
class LockManager {
    logger;
    tracer;
    constructor(logger) {
        this.logger = logger || new logger_1.Logger(undefined, { service: 'reasonex-core-api', node: 'LockManager' });
        this.tracer = new tracer_1.Tracer('LockManager', this.logger);
    }
    /**
     * Canonicalize data for consistent hashing
     * Ensures same data always produces same hash regardless of key order
     */
    canonicalize(data, mode = 'strict') {
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
            const obj = data;
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
    computeHash(canonicalData, algorithm = 'SHA256') {
        return this.tracer.withSpanSync('computeHash', (span) => {
            span.setAttribute('algorithm', algorithm);
            span.setAttribute('input_length', canonicalData.length);
            let hash;
            switch (algorithm) {
                case 'SHA256':
                    hash = crypto_js_1.default.SHA256(canonicalData).toString(crypto_js_1.default.enc.Hex);
                    break;
                case 'SHA3-256':
                    hash = crypto_js_1.default.SHA3(canonicalData, { outputLength: 256 }).toString(crypto_js_1.default.enc.Hex);
                    break;
                case 'SHA512':
                    hash = crypto_js_1.default.SHA512(canonicalData).toString(crypto_js_1.default.enc.Hex);
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
    createLock(data, options = {}) {
        return this.tracer.withSpanSync('createLock', (span) => {
            const { algorithm = 'SHA256', includeTimestamp = true, canonicalization = 'strict', schemaId, metadata, } = options;
            span.setAttributes({
                algorithm,
                includeTimestamp,
                canonicalization,
                hasSchemaId: !!schemaId,
                hasMetadata: !!metadata,
            });
            const lockId = (0, uuid_1.v4)();
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
            const result = {
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
    verifyLock(data, expectedHash, lockTimestamp, options = {}) {
        return this.tracer.withSpanSync('verifyLock', (span) => {
            const { algorithm = 'SHA256', includeTimestamp = true, canonicalization = 'strict', } = options;
            span.setAttributes({
                algorithm,
                includeTimestamp,
                canonicalization,
            });
            const verifiedAt = new Date().toISOString();
            const verificationId = (0, uuid_1.v4)();
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
            const issues = [];
            if (!valid) {
                issues.push('Hash mismatch - data may have been tampered with');
                this.logger.warn('Lock verification failed', {
                    operation: 'verifyLock',
                    verificationId,
                    expectedHashPrefix: expectedHash.slice(0, 16),
                    actualHashPrefix: actualHash.slice(0, 16),
                });
            }
            const result = {
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
                span.setStatus(tracer_1.SpanStatus.ERROR, 'Hash mismatch');
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
    compareHashes(data1, data2, options = {}) {
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
exports.LockManager = LockManager;
// Default instance
exports.lockManager = new LockManager();
exports.default = exports.lockManager;
//# sourceMappingURL=lock-manager.js.map