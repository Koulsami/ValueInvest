import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

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

winston.addColors(colors);

// Trace context interface
export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  workflowId?: string;
  executionId?: string;
  nodeId?: string;
}

// Log metadata interface
export interface LogMetadata {
  service?: string;
  node?: string;
  operation?: string;
  duration_ms?: number;
  input_size?: number;
  output_size?: number;
  [key: string]: unknown;
}

// Create trace context
export function createTraceContext(parentContext?: Partial<TraceContext>): TraceContext {
  return {
    traceId: parentContext?.traceId || uuidv4(),
    spanId: uuidv4(),
    parentSpanId: parentContext?.spanId,
    workflowId: parentContext?.workflowId,
    executionId: parentContext?.executionId,
    nodeId: parentContext?.nodeId,
  };
}

// Custom format for structured logging
const structuredFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const logEntry = {
    level,
    timestamp,
    message,
    ...metadata,
  };
  return JSON.stringify(logEntry);
});

// Pretty format for development
const prettyFormat = winston.format.printf(({ level, message, timestamp, traceId, spanId, node, operation, duration_ms, ...rest }) => {
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
  ? winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
      structuredFormat
    )
  : winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.colorize(),
      prettyFormat
    );

// Create base logger
const baseLogger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ],
  defaultMeta: {
    service: 'reasonex-core-api',
  },
});

// Logger class with context support
export class Logger {
  private context: TraceContext;
  private metadata: LogMetadata;

  constructor(context?: Partial<TraceContext>, metadata?: LogMetadata) {
    this.context = createTraceContext(context);
    this.metadata = {
      service: 'reasonex-core-api',
      ...metadata,
    };
  }

  private log(level: string, message: string, data?: Record<string, unknown>) {
    baseLogger.log(level, message, {
      ...this.context,
      ...this.metadata,
      ...data,
    });
  }

  error(message: string, data?: Record<string, unknown>) {
    this.log('error', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  debug(message: string, data?: Record<string, unknown>) {
    this.log('debug', message, data);
  }

  trace(message: string, data?: Record<string, unknown>) {
    this.log('trace', message, data);
  }

  // Create child logger with additional context
  child(metadata: LogMetadata): Logger {
    const child = new Logger(this.context, { ...this.metadata, ...metadata });
    return child;
  }

  // Get current trace context
  getContext(): TraceContext {
    return { ...this.context };
  }

  // Time an operation
  async time<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    this.debug(`Starting operation: ${operation}`);

    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`Completed operation: ${operation}`, { duration_ms: duration });
      return result;
    } catch (error) {
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
  timeSync<T>(operation: string, fn: () => T): T {
    const start = Date.now();
    this.debug(`Starting operation: ${operation}`);

    try {
      const result = fn();
      const duration = Date.now() - start;
      this.info(`Completed operation: ${operation}`, { duration_ms: duration });
      return result;
    } catch (error) {
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

// Default logger instance
export const logger = new Logger();

// Create logger from request context
export function createRequestLogger(req: {
  headers?: Record<string, string | string[] | undefined>;
  body?: { traceId?: string; workflowId?: string; executionId?: string; nodeId?: string };
}): Logger {
  const traceId = (req.headers?.['x-trace-id'] as string) || req.body?.traceId;
  const workflowId = (req.headers?.['x-workflow-id'] as string) || req.body?.workflowId;
  const executionId = (req.headers?.['x-execution-id'] as string) || req.body?.executionId;
  const nodeId = (req.headers?.['x-node-id'] as string) || req.body?.nodeId;

  return new Logger({
    traceId,
    workflowId,
    executionId,
    nodeId,
  });
}

export default logger;
