import { v4 as uuidv4 } from 'uuid';
import { Logger, TraceContext, createTraceContext } from './logger';

// Span status
export enum SpanStatus {
  OK = 'OK',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED',
}

// Span data interface
export interface SpanData {
  name: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  startTime: number;
  endTime?: number;
  duration_ms?: number;
  status: SpanStatus;
  attributes: Record<string, unknown>;
  events: SpanEvent[];
}

// Span event interface
export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, unknown>;
}

// Span class for tracing operations
export class Span {
  private data: SpanData;
  private logger: Logger;
  private ended: boolean = false;

  constructor(
    name: string,
    context: Partial<TraceContext>,
    logger: Logger,
    attributes?: Record<string, unknown>
  ) {
    this.logger = logger;
    this.data = {
      name,
      traceId: context.traceId || uuidv4(),
      spanId: uuidv4(),
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
  setAttribute(key: string, value: unknown): this {
    this.data.attributes[key] = value;
    return this;
  }

  // Add multiple attributes
  setAttributes(attributes: Record<string, unknown>): this {
    Object.assign(this.data.attributes, attributes);
    return this;
  }

  // Add event to span
  addEvent(name: string, attributes?: Record<string, unknown>): this {
    this.data.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });
    this.logger.trace(`Span event: ${name}`, { spanId: this.data.spanId, ...attributes });
    return this;
  }

  // Set span status
  setStatus(status: SpanStatus, message?: string): this {
    this.data.status = status;
    if (message) {
      this.data.attributes['status.message'] = message;
    }
    return this;
  }

  // Record exception
  recordException(error: Error): this {
    this.setStatus(SpanStatus.ERROR, error.message);
    this.addEvent('exception', {
      'exception.type': error.name,
      'exception.message': error.message,
      'exception.stacktrace': error.stack,
    });
    return this;
  }

  // End span
  end(): SpanData {
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
  getContext(): TraceContext {
    return {
      traceId: this.data.traceId,
      spanId: this.data.spanId,
      parentSpanId: this.data.parentSpanId,
    };
  }

  // Get span data
  getData(): SpanData {
    return { ...this.data };
  }
}

// Tracer class for creating spans
export class Tracer {
  private serviceName: string;
  private logger: Logger;
  private activeSpans: Map<string, Span> = new Map();
  private completedSpans: SpanData[] = [];

  constructor(serviceName: string, logger?: Logger) {
    this.serviceName = serviceName;
    this.logger = logger || new Logger(undefined, { service: serviceName });
  }

  // Start a new span
  startSpan(
    name: string,
    context?: Partial<TraceContext>,
    attributes?: Record<string, unknown>
  ): Span {
    const span = new Span(
      name,
      context || {},
      this.logger.child({ node: name }),
      {
        'service.name': this.serviceName,
        ...attributes,
      }
    );

    this.activeSpans.set(span.getData().spanId, span);
    return span;
  }

  // End and record a span
  endSpan(span: Span): SpanData {
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
  async withSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    context?: Partial<TraceContext>,
    attributes?: Record<string, unknown>
  ): Promise<T> {
    const span = this.startSpan(name, context, attributes);

    try {
      const result = await fn(span);
      span.setStatus(SpanStatus.OK);
      return result;
    } catch (error) {
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      this.endSpan(span);
    }
  }

  // Synchronous version
  withSpanSync<T>(
    name: string,
    fn: (span: Span) => T,
    context?: Partial<TraceContext>,
    attributes?: Record<string, unknown>
  ): T {
    const span = this.startSpan(name, context, attributes);

    try {
      const result = fn(span);
      span.setStatus(SpanStatus.OK);
      return result;
    } catch (error) {
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      this.endSpan(span);
    }
  }

  // Get completed spans for debugging
  getCompletedSpans(): SpanData[] {
    return [...this.completedSpans];
  }

  // Get active spans for debugging
  getActiveSpans(): SpanData[] {
    return Array.from(this.activeSpans.values()).map(s => s.getData());
  }

  // Clear completed spans
  clearCompletedSpans(): void {
    this.completedSpans = [];
  }
}

// Default tracer instance
export const tracer = new Tracer('reasonex-core-api');

export default tracer;
