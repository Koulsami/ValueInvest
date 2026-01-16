import { Logger } from '../lib/logger';
export type ChangeType = 'added' | 'removed' | 'modified' | 'array_change';
export type Materiality = 'HIGH' | 'MEDIUM' | 'LOW';
export interface Change {
    path: string;
    changeType: ChangeType;
    oldValue: unknown;
    newValue: unknown;
    impact: number;
    description: string;
}
export interface MaterialityConfig {
    highImpactFields: string[];
    mediumImpactFields: string[];
    numericTolerance: number;
    ignoreFields: string[];
    customRules?: MaterialityRule[];
}
export interface MaterialityRule {
    field: string;
    condition: 'increase' | 'decrease' | 'change' | 'threshold';
    threshold?: number;
    impact: number;
    message: string;
}
export interface DetectionOptions {
    materialityConfig?: Partial<MaterialityConfig>;
    comparisonDepth?: 'shallow' | 'deep';
    debugMode?: boolean;
}
export interface DetectionResult {
    changes: Change[];
    impactScore: number;
    materiality: Materiality;
    affectedPaths: string[];
    summary: string;
    timestamp: string;
    debugInfo?: {
        totalFieldsCompared: number;
        changesDetected: number;
        executionTime_ms: number;
    };
}
export declare class ChangeDetector {
    private logger;
    private tracer;
    private defaultConfig;
    constructor(logger?: Logger, config?: Partial<MaterialityConfig>);
    /**
     * Flatten object to dot-notation paths
     */
    private flattenObject;
    /**
     * Check if a field should be ignored
     */
    private shouldIgnore;
    /**
     * Calculate impact for a field
     */
    private calculateFieldImpact;
    /**
     * Check if numeric change is within tolerance
     */
    private isWithinTolerance;
    /**
     * Apply custom materiality rules
     */
    private applyCustomRules;
    /**
     * Detect changes between two versions
     */
    detectChanges(oldVersion: Record<string, unknown>, newVersion: Record<string, unknown>, options?: DetectionOptions): DetectionResult;
}
export declare const changeDetector: ChangeDetector;
export default changeDetector;
//# sourceMappingURL=change-detector.d.ts.map