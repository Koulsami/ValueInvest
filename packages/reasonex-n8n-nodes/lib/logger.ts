import { IExecuteFunctions } from 'n8n-workflow';

// Log levels
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

// Node logger class for structured logging
export class NodeLogger {
  private nodeName: string;
  private executeFunctions?: IExecuteFunctions;
  private debugMode: boolean;

  constructor(nodeName: string, executeFunctions?: IExecuteFunctions, debugMode: boolean = false) {
    this.nodeName = nodeName;
    this.executeFunctions = executeFunctions;
    this.debugMode = debugMode;
  }

  private formatMessage(level: LogLevel, message: string, data?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.nodeName}] ${message}${dataStr}`;
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const formattedMessage = this.formatMessage(level, message, data);

    // In n8n context, use the built-in logger
    if (this.executeFunctions) {
      // Use the logger property directly (n8n-workflow 1.x+)
      const logger = this.executeFunctions.logger || console;

      switch (level) {
        case 'error':
          if ('error' in logger) logger.error(formattedMessage);
          else console.error(formattedMessage);
          break;
        case 'warn':
          if ('warn' in logger) logger.warn(formattedMessage);
          else console.warn(formattedMessage);
          break;
        case 'info':
          if ('info' in logger) logger.info(formattedMessage);
          else console.info(formattedMessage);
          break;
        case 'debug':
        case 'trace':
          if (this.debugMode) {
            if ('debug' in logger) logger.debug(formattedMessage);
            else console.debug(formattedMessage);
          }
          break;
      }
    } else {
      // Fallback to console
      switch (level) {
        case 'error': console.error(formattedMessage); break;
        case 'warn': console.warn(formattedMessage); break;
        case 'info': console.info(formattedMessage); break;
        case 'debug':
        case 'trace':
          if (this.debugMode) console.debug(formattedMessage);
          break;
      }
    }
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  trace(message: string, data?: Record<string, unknown>): void {
    this.log('trace', message, data);
  }

  // Time an operation
  async time<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    this.debug(`Starting: ${operation}`);

    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`Completed: ${operation}`, { duration_ms: duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`Failed: ${operation}`, {
        duration_ms: duration,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

// Create logger factory
export function createNodeLogger(
  nodeName: string,
  executeFunctions?: IExecuteFunctions,
  debugMode: boolean = false
): NodeLogger {
  return new NodeLogger(nodeName, executeFunctions, debugMode);
}
