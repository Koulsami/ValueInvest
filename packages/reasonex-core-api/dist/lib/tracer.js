"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracer = exports.Tracer = exports.Span = exports.SpanStatus = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("./logger");
// Span status
var SpanStatus;
(function (SpanStatus) {
    SpanStatus["OK"] = "OK";
    SpanStatus["ERROR"] = "ERROR";
    SpanStatus["CANCELLED"] = "CANCELLED";
})(SpanStatus || (exports.SpanStatus = SpanStatus = {}));
// Span class for tracing operations
class Span {
    data;
    logger;
    ended = false;
    constructor(name, context, logger, attributes) {
        this.logger = logger;
        this.data = {
            name,
            traceId: context.traceId || (0, uuid_1.v4)(),
            spanId: (0, uuid_1.v4)(),
            parentSpanId: context.spanId,
            startTime: Date.now(),
            status: SpanStatus.OK,
            attributes: attributes || {},
            events: [],
        };
        this.logger.debug(`Span started: ${name}`, {
            spanId: this.data.spanId,
            parentSpanId: this.data.parentSpanId,
        });
    }
    // Add attribute to span
    setAttribute(key, value) {
        this.data.attributes[key] = value;
        return this;
    }
    // Add multiple attributes
    setAttributes(attributes) {
        Object.assign(this.data.attributes, attributes);
        return this;
    }
    // Add event to span
    addEvent(name, attributes) {
        this.data.events.push({
            name,
            timestamp: Date.now(),
            attributes,
        });
        this.logger.trace(`Span event: ${name}`, { spanId: this.data.spanId, ...attributes });
        return this;
    }
    // Set span status
    setStatus(status, message) {
        this.data.status = status;
        if (message) {
            this.data.attributes['status.message'] = message;
        }
        return this;
    }
    // Record exception
    recordException(error) {
        this.setStatus(SpanStatus.ERROR, error.message);
        this.addEvent('exception', {
            'exception.type': error.name,
            'exception.message': error.message,
            'exception.stacktrace': error.stack,
        });
        return this;
    }
    // End span
    end() {
        if (this.ended) {
            this.logger.warn('Span already ended', { spanId: this.data.spanId });
            return this.data;
        }
        this.ended = true;
        this.data.endTime = Date.now();
        this.data.duration_ms = this.data.endTime - this.data.startTime;
        this.logger.debug(`Span ended: ${this.data.name}`, {
            spanId: this.data.spanId,
            duration_ms: this.data.duration_ms,
            status: this.data.status,
        });
        return this.data;
    }
    // Get span context for child spans
    getContext() {
        return {
            traceId: this.data.traceId,
            spanId: this.data.spanId,
            parentSpanId: this.data.parentSpanId,
        };
    }
    // Get span data
    getData() {
        return { ...this.data };
    }
}
exports.Span = Span;
// Tracer class for creating spans
class Tracer {
    serviceName;
    logger;
    activeSpans = new Map();
    completedSpans = [];
    constructor(serviceName, logger) {
        this.serviceName = serviceName;
        this.logger = logger || new logger_1.Logger(undefined, { service: serviceName });
    }
    // Start a new span
    startSpan(name, context, attributes) {
        const span = new Span(name, context || {}, this.logger.child({ node: name }), {
            'service.name': this.serviceName,
            ...attributes,
        });
        this.activeSpans.set(span.getData().spanId, span);
        return span;
    }
    // End and record a span
    endSpan(span) {
        const data = span.end();
        this.activeSpans.delete(data.spanId);
        this.completedSpans.push(data);
        // Keep only last 1000 completed spans in memory
        if (this.completedSpans.length > 1000) {
            this.completedSpans = this.completedSpans.slice(-1000);
        }
        return data;
    }
    // Execute function within a span
    async withSpan(name, fn, context, attributes) {
        const span = this.startSpan(name, context, attributes);
        try {
            const result = await fn(span);
            span.setStatus(SpanStatus.OK);
            return result;
        }
        catch (error) {
            span.recordException(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
        finally {
            this.endSpan(span);
        }
    }
    // Synchronous version
    withSpanSync(name, fn, context, attributes) {
        const span = this.startSpan(name, context, attributes);
        try {
            const result = fn(span);
            span.setStatus(SpanStatus.OK);
            return result;
        }
        catch (error) {
            span.recordException(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
        finally {
            this.endSpan(span);
        }
    }
    // Get completed spans for debugging
    getCompletedSpans() {
        return [...this.completedSpans];
    }
    // Get active spans for debugging
    getActiveSpans() {
        return Array.from(this.activeSpans.values()).map(s => s.getData());
    }
    // Clear completed spans
    clearCompletedSpans() {
        this.completedSpans = [];
    }
}
exports.Tracer = Tracer;
// Default tracer instance
exports.tracer = new Tracer('reasonex-core-api');
exports.default = exports.tracer;
//# sourceMappingURL=tracer.js.map