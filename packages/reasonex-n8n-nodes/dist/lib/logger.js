"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeLogger = void 0;
exports.createNodeLogger = createNodeLogger;
// Node logger class for structured logging
class NodeLogger {
    nodeName;
    executeFunctions;
    debugMode;
    constructor(nodeName, executeFunctions, debugMode = false) {
        this.nodeName = nodeName;
        this.executeFunctions = executeFunctions;
        this.debugMode = debugMode;
    }
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] [${this.nodeName}] ${message}${dataStr}`;
    }
    log(level, message, data) {
        const formattedMessage = this.formatMessage(level, message, data);
        // In n8n context, use the built-in logger
        if (this.executeFunctions) {
            // Use the logger property directly (n8n-workflow 1.x+)
            const logger = this.executeFunctions.logger || console;
            switch (level) {
                case 'error':
                    if ('error' in logger)
                        logger.error(formattedMessage);
                    else
                        console.error(formattedMessage);
                    break;
                case 'warn':
                    if ('warn' in logger)
                        logger.warn(formattedMessage);
                    else
                        console.warn(formattedMessage);
                    break;
                case 'info':
                    if ('info' in logger)
                        logger.info(formattedMessage);
                    else
                        console.info(formattedMessage);
                    break;
                case 'debug':
                case 'trace':
                    if (this.debugMode) {
                        if ('debug' in logger)
                            logger.debug(formattedMessage);
                        else
                            console.debug(formattedMessage);
                    }
                    break;
            }
        }
        else {
            // Fallback to console
            switch (level) {
                case 'error':
                    console.error(formattedMessage);
                    break;
                case 'warn':
                    console.warn(formattedMessage);
                    break;
                case 'info':
                    console.info(formattedMessage);
                    break;
                case 'debug':
                case 'trace':
                    if (this.debugMode)
                        console.debug(formattedMessage);
                    break;
            }
        }
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
    // Time an operation
    async time(operation, fn) {
        const start = Date.now();
        this.debug(`Starting: ${operation}`);
        try {
            const result = await fn();
            const duration = Date.now() - start;
            this.info(`Completed: ${operation}`, { duration_ms: duration });
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            this.error(`Failed: ${operation}`, {
                duration_ms: duration,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
}
exports.NodeLogger = NodeLogger;
// Create logger factory
function createNodeLogger(nodeName, executeFunctions, debugMode = false) {
    return new NodeLogger(nodeName, executeFunctions, debugMode);
}
//# sourceMappingURL=logger.js.map