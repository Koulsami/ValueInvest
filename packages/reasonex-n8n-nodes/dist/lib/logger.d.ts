import { IExecuteFunctions } from 'n8n-workflow';
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
export declare class NodeLogger {
    private nodeName;
    private executeFunctions?;
    private debugMode;
    constructor(nodeName: string, executeFunctions?: IExecuteFunctions, debugMode?: boolean);
    private formatMessage;
    private log;
    error(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    debug(message: string, data?: Record<string, unknown>): void;
    trace(message: string, data?: Record<string, unknown>): void;
    time<T>(operation: string, fn: () => Promise<T>): Promise<T>;
}
export declare function createNodeLogger(nodeName: string, executeFunctions?: IExecuteFunctions, debugMode?: boolean): NodeLogger;
//# sourceMappingURL=logger.d.ts.map