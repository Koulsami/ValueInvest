import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { Logger } from './logger';
interface DatabaseConfig {
    connectionString?: string;
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    ssl?: boolean | {
        rejectUnauthorized: boolean;
    };
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
}
interface QueryOptions {
    name?: string;
    timeout?: number;
}
interface HealthCheckResult {
    status: 'healthy' | 'unhealthy';
    latency_ms: number;
    poolSize: number;
    idleCount: number;
    waitingCount: number;
    error?: string;
}
export declare class Database {
    private pool;
    private logger;
    private config;
    private isConnected;
    constructor(config?: DatabaseConfig, logger?: Logger);
    /**
     * Build database configuration from environment or provided config
     */
    private buildConfig;
    /**
     * Initialize the connection pool
     */
    connect(): Promise<void>;
    /**
     * Close the connection pool
     */
    disconnect(): Promise<void>;
    /**
     * Execute a query with logging
     */
    query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[], options?: QueryOptions): Promise<QueryResult<T>>;
    /**
     * Execute a single-row query
     */
    queryOne<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<T | null>;
    /**
     * Execute a query and return all rows
     */
    queryAll<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<T[]>;
    /**
     * Get a client from the pool for transactions
     */
    getClient(): Promise<PoolClient>;
    /**
     * Execute operations within a transaction
     */
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    /**
     * Health check - verify database connectivity
     */
    healthCheck(): Promise<HealthCheckResult>;
    /**
     * Check if connected
     */
    get connected(): boolean;
    /**
     * Get pool statistics
     */
    getStats(): {
        total: number;
        idle: number;
        waiting: number;
    };
}
/**
 * Get the database singleton instance
 */
export declare function getDatabase(config?: DatabaseConfig, logger?: Logger): Database;
/**
 * Initialize the database connection
 */
export declare function initDatabase(config?: DatabaseConfig, logger?: Logger): Promise<Database>;
/**
 * Close the database connection
 */
export declare function closeDatabase(): Promise<void>;
export default getDatabase;
//# sourceMappingURL=database.d.ts.map