import { Logger } from '../lib/logger';
export type CheckType = 'schema' | 'coverage' | 'sources' | 'hallucination' | 'rules';
export type ValidationStatus = 'PASS' | 'FLAG' | 'FAIL';
export type Strictness = 'strict' | 'normal' | 'lenient';
export type HallucinationSensitivity = 'high' | 'medium' | 'low';
export interface CheckResult {
    checkType: CheckType;
    passed: boolean;
    score: number;
    issues: Issue[];
    details: Record<string, unknown>;
    duration_ms: number;
}
export interface Issue {
    severity: 'error' | 'warning' | 'info';
    code: string;
    message: string;
    field?: string;
    suggestion?: string;
}
export interface ValidationProfile {
    id: string;
    name: string;
    checks: CheckType[];
    strictness: Strictness;
    hallucinationSensitivity: HallucinationSensitivity;
    sourceVerificationDepth: 'sample' | 'full';
    schemas: Record<string, object>;
    requiredFields: string[];
    plausibilityRules: PlausibilityRule[];
}
export interface PlausibilityRule {
    field: string;
    type: 'range' | 'format' | 'consistency' | 'custom';
    params: Record<string, unknown>;
    message: string;
}
export interface ValidationOptions {
    profile?: string;
    checks?: CheckType[];
    strictness?: Strictness;
    hallucinationSensitivity?: HallucinationSensitivity;
    sourceVerificationDepth?: 'sample' | 'full';
    customSchema?: object;
    debugMode?: boolean;
}
export interface ValidationResult {
    status: ValidationStatus;
    checks: CheckResult[];
    issues: Issue[];
    confidence: number;
    timestamp: string;
    profile: string;
    summary: string;
    debugInfo?: {
        inputData: Record<string, unknown>;
        executionTime_ms: number;
    };
}
export declare class Validator {
    private logger;
    private tracer;
    private ajv;
    private profiles;
    private compiledSchemas;
    constructor(logger?: Logger);
    /**
     * Load default validation profiles
     */
    private loadDefaultProfiles;
    /**
     * Register a custom validation profile
     */
    registerProfile(profile: ValidationProfile): void;
    /**
     * Get available profiles
     */
    getProfiles(): string[];
    /**
     * Compile and cache a JSON schema
     */
    private getCompiledSchema;
    /**
     * Run schema validation check
     */
    private runSchemaCheck;
    /**
     * Run coverage check (required fields)
     */
    private runCoverageCheck;
    /**
     * Run hallucination/plausibility check
     */
    private runHallucinationCheck;
    /**
     * Run rules validation check (verify scores are within expected ranges)
     */
    private runRulesCheck;
    /**
     * Run source verification check
     */
    private runSourcesCheck;
    /**
     * Get nested value from object
     */
    private getNestedValue;
    /**
     * Convert sensitivity to severity
     */
    private getSeverityFromSensitivity;
    /**
     * Determine overall status from check results
     */
    private determineStatus;
    /**
     * Main validation method
     */
    validate(analysis: Record<string, unknown>, options?: ValidationOptions): ValidationResult;
}
export declare const validator: Validator;
export default validator;
//# sourceMappingURL=validator.d.ts.map