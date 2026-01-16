"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
exports.createTraceContext = createTraceContext;
exports.createRequestLogger = createRequestLogger;
const winston_1 = __importDefault(require("winston"));
const uuid_1 = require("uuid");
// Log levels with priorities
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
};
// Colors for console output
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'magenta',
};
winston_1.default.addColors(colors);
// Create trace context
function createTraceContext(parentContext) {
    return {
        traceId: parentContext?.traceId || (0, uuid_1.v4)(),
        spanId: (0, uuid_1.v4)(),
        parentSpanId: parentContext?.spanId,
        workflowId: parentContext?.workflowId,
        executionId: parentContext?.executionId,
        nodeId: parentContext?.nodeId,
    };
}
// Custom format for structured logging
const structuredFormat = winston_1.default.format.printf(({ level, message, timestamp, ...metadata }) => {
    const logEntry = {
        level,
        timestamp,
        message,
        ...metadata,
    };
    return JSON.stringify(logEntry);
});
// Pretty format for development
const prettyFormat = winston_1.default.format.printf(({ level, message, timestamp, traceId, spanId, node, operation, duration_ms, ...rest }) => {
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const traceIdStr = typeof traceId === 'string' ? traceId : '';
    const spanIdStr = typeof spanId === 'string' ? spanId : '';
    const context = [
        traceIdStr ? `trace:${traceIdStr.slice(0, 8)}` : null,
        spanIdStr ? `span:${spanIdStr.slice(0, 8)}` : null,
        node ? `node:${node}` : null,
        operation ? `op:${operation}` : null,
        duration_ms !== undefined ? `${duration_ms}ms` : null,
    ].filter(Boolean).join(' | ');
    const contextStr = context ? ` (${context})` : '';
    const extra = Object.keys(rest).length > 0 ? `\n  ${JSON.stringify(rest, null, 2)}` : '';
    return `${prefix}${contextStr} ${message}${extra}`;
});
// Determine format based on environment
const isProduction = process.env.NODE_ENV === 'production';
const logFormat = isProduction
    ? winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), structuredFormat)
    : winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.colorize(), prettyFormat);
// Create base logger
const baseLogger = winston_1.default.createLogger({
    levels,
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        new winston_1.default.transports.Console(),
    ],
    defaultMeta: {
        service: 'reasonex-core-api',
    },
});
// Logger class with context support
class Logger {
    context;
    metadata;
    constructor(context, metadata) {
        this.context = createTraceContext(context);
        this.metadata = {
            service: 'reasonex-core-api',
            ...metadata,
        };
    }
    log(level, message, data) {
        baseLogger.log(level, message, {
            ...this.context,
            ...this.metadata,
            ...data,
        });
    }
    error(message, data) {
        this.log('error', message, data);
    }
    warn(message, data) {
        this.log('warn', message, data);
    }
    info(message, data) {
        this.log('info', message, data);
    }
    debug(message, data) {
        this.log('debug', message, data);
    }
    trace(message, data) {
        this.log('trace', message, data);
    }
    // Create child logger with additional context
    child(metadata) {
        const child = new Logger(this.context, { ...this.metadata, ...metadata });
        return child;
    }
    // Get current trace context
    getContext() {
        return { ...this.context };
    }
    // Time an operation
    async time(operation, fn) {
        const start = Date.now();
        this.debug(`Starting operation: ${operation}`);
        try {
            const result = await fn();
            const duration = Date.now() - start;
            this.info(`Completed operation: ${operation}`, { duration_ms: duration });
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.error(`Failed operation: ${operation}`, {
                duration_ms: duration,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    // Synchronous timing
    timeSync(operation, fn) {
        const start = Date.now();
        this.debug(`Starting operation: ${operation}`);
        try {
            const result = fn();
            const duration = Date.now() - start;
            this.info(`Completed operation: ${operation}`, { duration_ms: duration });
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.error(`Failed operation: ${operation}`, {
                duration_ms: duration,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
}
exports.Logger = Logger;
// Default logger instance
exports.logger = new Logger();
// Create logger from request context
function createRequestLogger(req) {
    const traceId = req.headers?.['x-trace-id'] || req.body?.traceId;
    const workflowId = req.headers?.['x-workflow-id'] || req.body?.workflowId;
    const executionId = req.headers?.['x-execution-id'] || req.body?.executionId;
    const nodeId = req.headers?.['x-node-id'] || req.body?.nodeId;
    return new Logger({
        traceId,
        workflowId,
        executionId,
        nodeId,
    });
}
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map