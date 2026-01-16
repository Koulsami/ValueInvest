"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validator = exports.Validator = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const logger_1 = require("../lib/logger");
const tracer_1 = require("../lib/tracer");
// Validator class
class Validator {
    logger;
    tracer;
    ajv;
    profiles = new Map();
    compiledSchemas = new Map();
    constructor(logger) {
        this.logger = logger || new logger_1.Logger(undefined, { service: 'reasonex-core-api', node: 'Validator' });
        this.tracer = new tracer_1.Tracer('Validator', this.logger);
        // Initialize AJV with formats
        this.ajv = new ajv_1.default({ allErrors: true, strict: false });
        (0, ajv_formats_1.default)(this.ajv);
        // Load default profiles
        this.loadDefaultProfiles();
    }
    /**
     * Load default validation profiles
     */
    loadDefaultProfiles() {
        // Financial strict profile
        const financialStrict = {
            id: 'financial-strict',
            name: 'Financial Data Strict Validation',
            checks: ['schema', 'coverage', 'hallucination', 'rules'],
            strictness: 'strict',
            hallucinationSensitivity: 'high',
            sourceVerificationDepth: 'sample',
            schemas: {
                'financial-data': {
                    type: 'object',
                    properties: {
                        symbol: { type: 'string', minLength: 1, maxLength: 10 },
                        companyName: { type: 'string', minLength: 1 },
                        peRatio: { type: 'number' },
                        pbRatio: { type: 'number' },
                        roe: { type: 'number' },
                        marketCap: { type: 'number', minimum: 0 },
                        totalScore: { type: 'number', minimum: 0, maximum: 100 },
                    },
                    required: ['symbol'],
                },
            },
            requiredFields: ['symbol', 'companyName', 'peRatio', 'roe', 'totalScore'],
            plausibilityRules: [
                { field: 'peRatio', type: 'range', params: { min: -100, max: 1000 }, message: 'P/E ratio outside plausible range' },
                { field: 'pbRatio', type: 'range', params: { min: 0, max: 100 }, message: 'P/B ratio outside plausible range' },
                { field: 'roe', type: 'range', params: { min: -1, max: 2 }, message: 'ROE outside plausible range (-100% to 200%)' },
                { field: 'totalScore', type: 'range', params: { min: 0, max: 100 }, message: 'Total score must be 0-100' },
                { field: 'marketCap', type: 'range', params: { min: 0, max: 1e15 }, message: 'Market cap outside plausible range' },
            ],
        };
        this.profiles.set(financialStrict.id, financialStrict);
        // General validation profile
        const generalProfile = {
            id: 'general',
            name: 'General Validation',
            checks: ['schema', 'coverage'],
            strictness: 'normal',
            hallucinationSensitivity: 'medium',
            sourceVerificationDepth: 'sample',
            schemas: {},
            requiredFields: [],
            plausibilityRules: [],
        };
        this.profiles.set(generalProfile.id, generalProfile);
        this.logger.info('Loaded default validation profiles', {
            profiles: Array.from(this.profiles.keys()),
        });
    }
    /**
     * Register a custom validation profile
     */
    registerProfile(profile) {
        this.profiles.set(profile.id, profile);
        this.logger.info(`Registered validation profile: ${profile.id}`);
    }
    /**
     * Get available profiles
     */
    getProfiles() {
        return Array.from(this.profiles.keys());
    }
    /**
     * Compile and cache a JSON schema
     */
    getCompiledSchema(schema, schemaId) {
        const cacheKey = `${schemaId}-${JSON.stringify(schema).slice(0, 50)}`;
        if (!this.compiledSchemas.has(cacheKey)) {
            const compiled = this.ajv.compile(schema);
            this.compiledSchemas.set(cacheKey, compiled);
        }
        return this.compiledSchemas.get(cacheKey);
    }
    /**
     * Run schema validation check
     */
    runSchemaCheck(data, profile, customSchema) {
        const startTime = Date.now();
        const issues = [];
        // Use custom schema or first schema from profile
        const schema = customSchema || Object.values(profile.schemas)[0];
        if (!schema) {
            return {
                checkType: 'schema',
                passed: true,
                score: 1,
                issues: [{ severity: 'info', code: 'NO_SCHEMA', message: 'No schema defined for validation' }],
                details: {},
                duration_ms: Date.now() - startTime,
            };
        }
        const validate = this.getCompiledSchema(schema, 'custom');
        const valid = validate(data);
        if (!valid && validate.errors) {
            for (const error of validate.errors) {
                issues.push({
                    severity: 'error',
                    code: 'SCHEMA_VIOLATION',
                    message: error.message || 'Schema validation failed',
                    field: error.instancePath.replace(/^\//, '').replace(/\//g, '.') || undefined,
                    suggestion: `Check the value at ${error.instancePath || 'root'}`,
                });
            }
        }
        const score = valid ? 1 : Math.max(0, 1 - (issues.length * 0.2));
        return {
            checkType: 'schema',
            passed: valid || false,
            score,
            issues,
            details: { schemaErrors: validate.errors || [] },
            duration_ms: Date.now() - startTime,
        };
    }
    /**
     * Run coverage check (required fields)
     */
    runCoverageCheck(data, profile) {
        const startTime = Date.now();
        const issues = [];
        const missingFields = [];
        for (const field of profile.requiredFields) {
            const value = this.getNestedValue(data, field);
            if (value === undefined || value === null || value === '') {
                missingFields.push(field);
                issues.push({
                    severity: profile.strictness === 'strict' ? 'error' : 'warning',
                    code: 'MISSING_FIELD',
                    message: `Required field '${field}' is missing or empty`,
                    field,
                    suggestion: `Provide a value for ${field}`,
                });
            }
        }
        const coverageRatio = profile.requiredFields.length > 0
            ? (profile.requiredFields.length - missingFields.length) / profile.requiredFields.length
            : 1;
        const passed = profile.strictness === 'strict'
            ? missingFields.length === 0
            : coverageRatio >= 0.7;
        return {
            checkType: 'coverage',
            passed,
            score: coverageRatio,
            issues,
            details: {
                requiredFields: profile.requiredFields,
                missingFields,
                coverageRatio,
            },
            duration_ms: Date.now() - startTime,
        };
    }
    /**
     * Run hallucination/plausibility check
     */
    runHallucinationCheck(data, profile) {
        const startTime = Date.now();
        const issues = [];
        let failedChecks = 0;
        for (const rule of profile.plausibilityRules) {
            const value = this.getNestedValue(data, rule.field);
            if (value === undefined || value === null) {
                continue; // Skip missing fields (handled by coverage check)
            }
            let passed = true;
            switch (rule.type) {
                case 'range':
                    if (typeof value === 'number') {
                        const { min, max } = rule.params;
                        passed = value >= min && value <= max;
                    }
                    break;
                case 'format':
                    if (typeof value === 'string') {
                        const { pattern } = rule.params;
                        passed = new RegExp(pattern).test(value);
                    }
                    break;
                case 'consistency':
                    // Check consistency between related fields
                    const { relatedField, relationship } = rule.params;
                    const relatedValue = this.getNestedValue(data, relatedField);
                    if (typeof value === 'number' && typeof relatedValue === 'number') {
                        switch (relationship) {
                            case 'equal':
                                passed = value === relatedValue;
                                break;
                            case 'greater':
                                passed = value > relatedValue;
                                break;
                            case 'less':
                                passed = value < relatedValue;
                                break;
                        }
                    }
                    break;
            }
            if (!passed) {
                failedChecks++;
                const severity = this.getSeverityFromSensitivity(profile.hallucinationSensitivity);
                issues.push({
                    severity,
                    code: 'PLAUSIBILITY_FAILURE',
                    message: rule.message,
                    field: rule.field,
                    suggestion: `Verify the value of ${rule.field}: ${value}`,
                });
            }
        }
        const totalRules = profile.plausibilityRules.length;
        const score = totalRules > 0 ? (totalRules - failedChecks) / totalRules : 1;
        const passThreshold = profile.hallucinationSensitivity === 'high' ? 1
            : profile.hallucinationSensitivity === 'medium' ? 0.8
                : 0.6;
        return {
            checkType: 'hallucination',
            passed: score >= passThreshold,
            score,
            issues,
            details: {
                totalRules,
                failedChecks,
                sensitivity: profile.hallucinationSensitivity,
            },
            duration_ms: Date.now() - startTime,
        };
    }
    /**
     * Run rules validation check (verify scores are within expected ranges)
     */
    runRulesCheck(data, scores) {
        const startTime = Date.now();
        const issues = [];
        if (!scores) {
            return {
                checkType: 'rules',
                passed: true,
                score: 1,
                issues: [{ severity: 'info', code: 'NO_SCORES', message: 'No scores provided for rules check' }],
                details: {},
                duration_ms: Date.now() - startTime,
            };
        }
        // Check dimension scores are within expected ranges
        const dimensions = scores.dimensions;
        if (dimensions && Array.isArray(dimensions)) {
            for (const dim of dimensions) {
                if (dim.rawScore < 0) {
                    issues.push({
                        severity: 'error',
                        code: 'NEGATIVE_SCORE',
                        message: `Dimension '${dim.dimensionName}' has negative score: ${dim.rawScore}`,
                        field: `scores.dimensions.${dim.dimensionName}`,
                    });
                }
                if (dim.rawScore > dim.maxScore) {
                    issues.push({
                        severity: 'error',
                        code: 'SCORE_EXCEEDED',
                        message: `Dimension '${dim.dimensionName}' exceeds max: ${dim.rawScore} > ${dim.maxScore}`,
                        field: `scores.dimensions.${dim.dimensionName}`,
                    });
                }
            }
        }
        // Check total score
        const total = scores.total;
        const maxPossible = scores.maxPossible;
        if (typeof total === 'number' && typeof maxPossible === 'number') {
            if (total < 0 || total > maxPossible) {
                issues.push({
                    severity: 'error',
                    code: 'INVALID_TOTAL',
                    message: `Total score ${total} is outside valid range 0-${maxPossible}`,
                    field: 'scores.total',
                });
            }
        }
        const passed = issues.filter(i => i.severity === 'error').length === 0;
        const score = passed ? 1 : 0.5;
        return {
            checkType: 'rules',
            passed,
            score,
            issues,
            details: { scores },
            duration_ms: Date.now() - startTime,
        };
    }
    /**
     * Run source verification check
     */
    runSourcesCheck(data, sources, depth = 'sample') {
        const startTime = Date.now();
        const issues = [];
        if (!sources || sources.length === 0) {
            return {
                checkType: 'sources',
                passed: true,
                score: 0.5,
                issues: [{ severity: 'info', code: 'NO_SOURCES', message: 'No source documents provided for verification' }],
                details: { sourcesProvided: false },
                duration_ms: Date.now() - startTime,
            };
        }
        // Basic source verification - check that sources are valid objects
        let validSources = 0;
        const totalToCheck = depth === 'sample' ? Math.min(3, sources.length) : sources.length;
        for (let i = 0; i < totalToCheck; i++) {
            const source = sources[i];
            if (source && typeof source === 'object') {
                validSources++;
            }
        }
        const score = validSources / totalToCheck;
        const passed = score >= 0.8;
        return {
            checkType: 'sources',
            passed,
            score,
            issues,
            details: {
                totalSources: sources.length,
                checkedSources: totalToCheck,
                validSources,
                depth,
            },
            duration_ms: Date.now() - startTime,
        };
    }
    /**
     * Get nested value from object
     */
    getNestedValue(obj, path) {
        const parts = path.split('.');
        let value = obj;
        for (const part of parts) {
            if (value === null || value === undefined || typeof value !== 'object') {
                return undefined;
            }
            value = value[part];
        }
        return value;
    }
    /**
     * Convert sensitivity to severity
     */
    getSeverityFromSensitivity(sensitivity) {
        switch (sensitivity) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
        }
    }
    /**
     * Determine overall status from check results
     */
    determineStatus(checks, strictness) {
        const errorChecks = checks.filter(c => !c.passed && c.issues.some(i => i.severity === 'error'));
        const warningChecks = checks.filter(c => !c.passed && c.issues.some(i => i.severity === 'warning'));
        if (strictness === 'strict') {
            if (errorChecks.length > 0)
                return 'FAIL';
            if (warningChecks.length > 0)
                return 'FLAG';
            return 'PASS';
        }
        if (strictness === 'normal') {
            if (errorChecks.length >= 2)
                return 'FAIL';
            if (errorChecks.length > 0 || warningChecks.length > 0)
                return 'FLAG';
            return 'PASS';
        }
        // Lenient
        if (errorChecks.length >= 3)
            return 'FAIL';
        if (errorChecks.length > 0)
            return 'FLAG';
        return 'PASS';
    }
    /**
     * Main validation method
     */
    validate(analysis, options = {}) {
        return this.tracer.withSpanSync('validate', (span) => {
            const startTime = Date.now();
            const { profile: profileId = 'general', checks: checksToRun, strictness, hallucinationSensitivity, sourceVerificationDepth, customSchema, debugMode = false, } = options;
            span.setAttributes({
                profile: profileId,
                debugMode,
            });
            this.logger.info('Starting validation', {
                operation: 'validate',
                profile: profileId,
                dataKeys: Object.keys(analysis).length,
            });
            // Get profile
            const profile = this.profiles.get(profileId);
            if (!profile) {
                span.setStatus(tracer_1.SpanStatus.ERROR, `Profile not found: ${profileId}`);
                throw new Error(`Validation profile not found: ${profileId}`);
            }
            // Apply overrides
            const effectiveProfile = {
                ...profile,
                checks: checksToRun || profile.checks,
                strictness: strictness || profile.strictness,
                hallucinationSensitivity: hallucinationSensitivity || profile.hallucinationSensitivity,
                sourceVerificationDepth: sourceVerificationDepth || profile.sourceVerificationDepth,
            };
            // Extract sources and scores from analysis if present
            const sources = (analysis.source_documents || analysis.sources);
            const scores = (analysis.scores);
            // Run checks
            const checkResults = [];
            for (const checkType of effectiveProfile.checks) {
                let result;
                switch (checkType) {
                    case 'schema':
                        result = this.runSchemaCheck(analysis, effectiveProfile, customSchema);
                        break;
                    case 'coverage':
                        result = this.runCoverageCheck(analysis, effectiveProfile);
                        break;
                    case 'hallucination':
                        result = this.runHallucinationCheck(analysis, effectiveProfile);
                        break;
                    case 'rules':
                        result = this.runRulesCheck(analysis, scores);
                        break;
                    case 'sources':
                        result = this.runSourcesCheck(analysis, sources, effectiveProfile.sourceVerificationDepth);
                        break;
                    default:
                        continue;
                }
                checkResults.push(result);
                this.logger.debug(`Check completed: ${checkType}`, {
                    checkType,
                    passed: result.passed,
                    score: result.score,
                    issueCount: result.issues.length,
                });
            }
            // Aggregate issues
            const allIssues = checkResults.flatMap(c => c.issues);
            // Calculate overall confidence
            const confidence = checkResults.length > 0
                ? checkResults.reduce((sum, c) => sum + c.score, 0) / checkResults.length
                : 1;
            // Determine status
            const status = this.determineStatus(checkResults, effectiveProfile.strictness);
            // Build summary
            const passedChecks = checkResults.filter(c => c.passed).length;
            const summary = `${status}: ${passedChecks}/${checkResults.length} checks passed, ` +
                `confidence: ${(confidence * 100).toFixed(1)}%, ` +
                `issues: ${allIssues.filter(i => i.severity === 'error').length} errors, ` +
                `${allIssues.filter(i => i.severity === 'warning').length} warnings`;
            const executionTime = Date.now() - startTime;
            const result = {
                status,
                checks: checkResults,
                issues: allIssues,
                confidence,
                timestamp: new Date().toISOString(),
                profile: profileId,
                summary,
            };
            if (debugMode) {
                result.debugInfo = {
                    inputData: analysis,
                    executionTime_ms: executionTime,
                };
            }
            span.setAttributes({
                status,
                confidence,
                issueCount: allIssues.length,
                executionTime_ms: executionTime,
            });
            this.logger.info('Validation complete', {
                operation: 'validate',
                status,
                confidence,
                issueCount: allIssues.length,
                executionTime_ms: executionTime,
            });
            return result;
        });
    }
}
exports.Validator = Validator;
// Default instance
exports.validator = new Validator();
exports.default = exports.validator;
//# sourceMappingURL=validator.js.map