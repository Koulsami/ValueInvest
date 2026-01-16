import { Logger, TraceContext } from './logger';
export declare enum SpanStatus {
    OK = "OK",
    ERROR = "ERROR",
    CANCELLED = "CANCELLED"
}
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
export interface SpanEvent {
    name: string;
    timestamp: number;
    attributes?: Record<string, unknown>;
}
export declare class Span {
    private data;
    private logger;
    private ended;
    constructor(name: string, context: Partial<TraceContext>, logger: Logger, attributes?: Record<string, unknown>);
    setAttribute(key: string, value: unknown): this;
    setAttributes(attributes: Record<string, unknown>): this;
    addEvent(name: string, attributes?: Record<string, unknown>): this;
    setStatus(status: SpanStatus, message?: string): this;
    recordException(error: Error): this;
    end(): SpanData;
    getContext(): TraceContext;
    getData(): SpanData;
}
export declare class Tracer {
    private serviceName;
    private logger;
    private activeSpans;
    private completedSpans;
    constructor(serviceName: string, logger?: Logger);
    startSpan(name: string, context?: Partial<TraceContext>, attributes?: Record<string, unknown>): Span;
    endSpan(span: Span): SpanData;
    withSpan<T>(name: string, fn: (span: Span) => Promise<T>, context?: Partial<TraceContext>, attributes?: Record<string, unknown>): Promise<T>;
    withSpanSync<T>(name: string, fn: (span: Span) => T, context?: Partial<TraceContext>, attributes?: Record<string, unknown>): T;
    getCompletedSpans(): SpanData[];
    getActiveSpans(): SpanData[];
    clearCompletedSpans(): void;
}
export declare const tracer: Tracer;
export default tracer;
//# sourceMappingURL=tracer.d.ts.map