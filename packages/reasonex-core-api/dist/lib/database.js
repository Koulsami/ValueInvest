"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
exports.getDatabase = getDatabase;
exports.initDatabase = initDatabase;
exports.closeDatabase = closeDatabase;
const pg_1 = require("pg");
const logger_1 = require("./logger");
// Database client class
class Database {
    pool = null;
    logger;
    config;
    isConnected = false;
    constructor(config, logger) {
        this.logger = logger || new logger_1.Logger(undefined, { service: 'reasonex-core-api', node: 'Database' });
        // Build config from environment or provided config
        this.config = this.buildConfig(config);
    }
    /**
     * Build database configuration from environment or provided config
     */
    buildConfig(config) {
        const connectionString = config?.connectionString || process.env.DATABASE_URL;
        if (connectionString) {
            // Parse SSL requirement (Railway requires SSL)
            const useSSL = process.env.NODE_ENV === 'production' ||
                connectionString.includes('railway.app') ||
                process.env.DATABASE_SSL === 'true';
            return {
                connectionString,
                ssl: useSSL ? { rejectUnauthorized: false } : false,
                max: config?.max || parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
                idleTimeoutMillis: config?.idleTimeoutMillis || 30000,
                connectionTimeoutMillis: config?.connectionTimeoutMillis || 10000,
            };
        }
        // Fallback to individual config values
        return {
            host: config?.host || process.env.DATABASE_HOST || 'localhost',
            port: config?.port || parseInt(process.env.DATABASE_PORT || '5432', 10),
            database: config?.database || process.env.DATABASE_NAME || 'reasonex',
            user: config?.user || process.env.DATABASE_USER || 'postgres',
            password: config?.password || process.env.DATABASE_PASSWORD,
            ssl: config?.ssl ?? false,
            max: config?.max || 10,
            idleTimeoutMillis: config?.idleTimeoutMillis || 30000,
            connectionTimeoutMillis: config?.connectionTimeoutMillis || 10000,
        };
    }
    /**
     * Initialize the connection pool
     */
    async connect() {
        if (this.pool) {
            this.logger.debug('Database pool already initialized');
            return;
        }
        try {
            this.pool = new pg_1.Pool(this.config);
            // Set up event handlers
            this.pool.on('error', (err) => {
                this.logger.error('Unexpected database pool error', { error: err.message });
                this.isConnected = false;
            });
            this.pool.on('connect', () => {
                this.logger.debug('New client connected to pool');
            });
            // Test the connection
            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            this.isConnected = true;
            this.logger.info('Database connection pool initialized', {
                poolSize: this.config.max,
                ssl: !!this.config.ssl,
            });
        }
        catch (error) {
            this.logger.error('Failed to initialize database pool', {
                error: error.message
            });
            throw error;
        }
    }
    /**
     * Close the connection pool
     */
    async disconnect() {
        if (!this.pool) {
            return;
        }
        try {
            await this.pool.end();
            this.pool = null;
            this.isConnected = false;
            this.logger.info('Database connection pool closed');
        }
        catch (error) {
            this.logger.error('Error closing database pool', {
                error: error.message
            });
            throw error;
        }
    }
    /**
     * Execute a query with logging
     */
    async query(text, params, options) {
        if (!this.pool) {
            await this.connect();
        }
        const startTime = Date.now();
        const queryId = Math.random().toString(36).substring(7);
        try {
            this.logger.debug('Executing query', {
                queryId,
                query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                paramCount: params?.length || 0,
            });
            const result = await this.pool.query({
                text,
                values: params,
                name: options?.name,
            });
            const duration = Date.now() - startTime;
            this.logger.debug('Query completed', {
                queryId,
                rowCount: result.rowCount,
                duration_ms: duration,
            });
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error('Query failed', {
                queryId,
                query: text.substring(0, 200),
                error: error.message,
                duration_ms: duration,
            });
            throw error;
        }
    }
    /**
     * Execute a single-row query
     */
    async queryOne(text, params) {
        const result = await this.query(text, params);
        return result.rows[0] || null;
    }
    /**
     * Execute a query and return all rows
     */
    async queryAll(text, params) {
        const result = await this.query(text, params);
        return result.rows;
    }
    /**
     * Get a client from the pool for transactions
     */
    async getClient() {
        if (!this.pool) {
            await this.connect();
        }
        return this.pool.connect();
    }
    /**
     * Execute operations within a transaction
     */
    async transaction(callback) {
        const client = await this.getClient();
        try {
            await client.query('BEGIN');
            this.logger.debug('Transaction started');
            const result = await callback(client);
            await client.query('COMMIT');
            this.logger.debug('Transaction committed');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Transaction rolled back', {
                error: error.message
            });
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Health check - verify database connectivity
     */
    async healthCheck() {
        const startTime = Date.now();
        try {
            if (!this.pool) {
                return {
                    status: 'unhealthy',
                    latency_ms: 0,
                    poolSize: 0,
                    idleCount: 0,
                    waitingCount: 0,
                    error: 'Pool not initialized',
                };
            }
            await this.pool.query('SELECT 1');
            const latency = Date.now() - startTime;
            return {
                status: 'healthy',
                latency_ms: latency,
                poolSize: this.pool.totalCount,
                idleCount: this.pool.idleCount,
                waitingCount: this.pool.waitingCount,
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                latency_ms: Date.now() - startTime,
                poolSize: this.pool?.totalCount || 0,
                idleCount: this.pool?.idleCount || 0,
                waitingCount: this.pool?.waitingCount || 0,
                error: error.message,
            };
        }
    }
    /**
     * Check if connected
     */
    get connected() {
        return this.isConnected && this.pool !== null;
    }
    /**
     * Get pool statistics
     */
    getStats() {
        if (!this.pool) {
            return { total: 0, idle: 0, waiting: 0 };
        }
        return {
            total: this.pool.totalCount,
            idle: this.pool.idleCount,
            waiting: this.pool.waitingCount,
        };
    }
}
exports.Database = Database;
// Singleton instance
let databaseInstance = null;
/**
 * Get the database singleton instance
 */
function getDatabase(config, logger) {
    if (!databaseInstance) {
        databaseInstance = new Database(config, logger);
    }
    return databaseInstance;
}
/**
 * Initialize the database connection
 */
async function initDatabase(config, logger) {
    const db = getDatabase(config, logger);
    await db.connect();
    return db;
}
/**
 * Close the database connection
 */
async function closeDatabase() {
    if (databaseInstance) {
        await databaseInstance.disconnect();
        databaseInstance = null;
    }
}
// Export default instance getter
exports.default = getDatabase;
//# sourceMappingURL=database.js.map