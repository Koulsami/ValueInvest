export interface TraceContext {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    workflowId?: string;
    executionId?: string;
    nodeId?: string;
}
export interface LogMetadata {
    service?: string;
    node?: string;
    operation?: string;
    duration_ms?: number;
    input_size?: number;
    output_size?: number;
    [key: string]: unknown;
}
export declare function createTraceContext(parentContext?: Partial<TraceContext>): TraceContext;
export declare class Logger {
    private context;
    private metadata;
    constructor(context?: Partial<TraceContext>, metadata?: LogMetadata);
    private log;
    error(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    debug(message: string, data?: Record<string, unknown>): void;
    trace(message: string, data?: Record<string, unknown>): void;
    child(metadata: LogMetadata): Logger;
    getContext(): TraceContext;
    time<T>(operation: string, fn: () => Promise<T>): Promise<T>;
    timeSync<T>(operation: string, fn: () => T): T;
}
export declare const logger: Logger;
export declare function createRequestLogger(req: {
    headers?: Record<string, string | string[] | undefined>;
    body?: {
        traceId?: string;
        workflowId?: string;
        executionId?: string;
        nodeId?: string;
    };
}): Logger;
export default logger;
//# sourceMappingURL=logger.d.ts.map