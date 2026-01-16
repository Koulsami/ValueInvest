"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeDetector = exports.ChangeDetector = void 0;
const deepDiff = __importStar(require("deep-diff"));
const logger_1 = require("../lib/logger");
const tracer_1 = require("../lib/tracer");
// Default materiality config
const DEFAULT_MATERIALITY_CONFIG = {
    highImpactFields: [
        'totalScore',
        'classification',
        'recommendation',
        'peRatio',
        'roe',
        'debtEquity',
        'marketCap',
    ],
    mediumImpactFields: [
        'valuationScore',
        'qualityScore',
        'growthScore',
        'dividendScore',
        'moatScore',
        'pbRatio',
        'netMargin',
        'revenueGrowth',
    ],
    numericTolerance: 1, // 1% tolerance
    ignoreFields: [
        'timestamp',
        'lastUpdated',
        'updatedAt',
        'createdAt',
        '_id',
        'id',
    ],
    customRules: [
        {
            field: 'totalScore',
            condition: 'change',
            threshold: 5,
            impact: 0.8,
            message: 'Total score changed by more than 5 points',
        },
        {
            field: 'classification',
            condition: 'change',
            threshold: 0,
            impact: 1.0,
            message: 'Classification changed',
        },
    ],
};
// Change Detector class
class ChangeDetector {
    logger;
    tracer;
    defaultConfig;
    constructor(logger, config) {
        this.logger = logger || new logger_1.Logger(undefined, { service: 'reasonex-core-api', node: 'ChangeDetector' });
        this.tracer = new tracer_1.Tracer('ChangeDetector', this.logger);
        this.defaultConfig = { ...DEFAULT_MATERIALITY_CONFIG, ...config };
    }
    /**
     * Flatten object to dot-notation paths
     */
    flattenObject(obj, prefix = '') {
        const result = new Map();
        for (const [key, value] of Object.entries(obj)) {
            const path = prefix ? `${prefix}.${key}` : key;
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const nested = this.flattenObject(value, path);
                for (const [nestedPath, nestedValue] of nested) {
                    result.set(nestedPath, nestedValue);
                }
            }
            else {
                result.set(path, value);
            }
        }
        return result;
    }
    /**
     * Check if a field should be ignored
     */
    shouldIgnore(path, config) {
        return config.ignoreFields.some(ignore => path === ignore || path.endsWith(`.${ignore}`));
    }
    /**
     * Calculate impact for a field
     */
    calculateFieldImpact(path, config) {
        // Check high impact fields
        if (config.highImpactFields.some(f => path === f || path.endsWith(`.${f}`))) {
            return 1.0;
        }
        // Check medium impact fields
        if (config.mediumImpactFields.some(f => path === f || path.endsWith(`.${f}`))) {
            return 0.5;
        }
        // Default low impact
        return 0.2;
    }
    /**
     * Check if numeric change is within tolerance
     */
    isWithinTolerance(oldValue, newValue, tolerancePercent) {
        if (oldValue === 0) {
            return newValue === 0;
        }
        const changePercent = Math.abs((newValue - oldValue) / oldValue) * 100;
        return changePercent <= tolerancePercent;
    }
    /**
     * Apply custom materiality rules
     */
    applyCustomRules(path, oldValue, newValue, config) {
        for (const rule of config.customRules || []) {
            if (path !== rule.field && !path.endsWith(`.${rule.field}`)) {
                continue;
            }
            switch (rule.condition) {
                case 'change':
                    if (oldValue !== newValue) {
                        if (typeof rule.threshold === 'number' &&
                            typeof oldValue === 'number' &&
                            typeof newValue === 'number') {
                            const diff = Math.abs(newValue - oldValue);
                            if (diff > rule.threshold) {
                                return { impact: rule.impact, message: rule.message };
                            }
                        }
                        else if (rule.threshold === 0) {
                            return { impact: rule.impact, message: rule.message };
                        }
                    }
                    break;
                case 'increase':
                    if (typeof oldValue === 'number' &&
                        typeof newValue === 'number' &&
                        newValue > oldValue) {
                        const diff = newValue - oldValue;
                        if (!rule.threshold || diff > rule.threshold) {
                            return { impact: rule.impact, message: rule.message };
                        }
                    }
                    break;
                case 'decrease':
                    if (typeof oldValue === 'number' &&
                        typeof newValue === 'number' &&
                        newValue < oldValue) {
                        const diff = oldValue - newValue;
                        if (!rule.threshold || diff > rule.threshold) {
                            return { impact: rule.impact, message: rule.message };
                        }
                    }
                    break;
                case 'threshold':
                    if (typeof newValue === 'number' && rule.threshold !== undefined) {
                        if (newValue > rule.threshold) {
                            return { impact: rule.impact, message: rule.message };
                        }
                    }
                    break;
            }
        }
        return null;
    }
    /**
     * Detect changes between two versions
     */
    detectChanges(oldVersion, newVersion, options = {}) {
        return this.tracer.withSpanSync('detectChanges', (span) => {
            const startTime = Date.now();
            const config = {
                ...this.defaultConfig,
                ...options.materialityConfig,
            };
            span.setAttributes({
                comparisonDepth: options.comparisonDepth || 'deep',
                debugMode: options.debugMode || false,
            });
            this.logger.info('Detecting changes', {
                operation: 'detectChanges',
                oldKeys: Object.keys(oldVersion).length,
                newKeys: Object.keys(newVersion).length,
            });
            const changes = [];
            const affectedPaths = [];
            let totalImpact = 0;
            // Get all differences using deep-diff
            const differences = deepDiff.diff(oldVersion, newVersion) || [];
            // Flatten objects for comparison
            const oldFlat = this.flattenObject(oldVersion);
            const newFlat = this.flattenObject(newVersion);
            const allPaths = new Set([...oldFlat.keys(), ...newFlat.keys()]);
            for (const diff of differences) {
                if (!diff.path)
                    continue;
                const path = diff.path.join('.');
                // Skip ignored fields
                if (this.shouldIgnore(path, config)) {
                    continue;
                }
                let changeType;
                let oldValue;
                let newValue;
                switch (diff.kind) {
                    case 'N': // New property
                        changeType = 'added';
                        oldValue = undefined;
                        newValue = diff.rhs;
                        break;
                    case 'D': // Deleted property
                        changeType = 'removed';
                        oldValue = diff.lhs;
                        newValue = undefined;
                        break;
                    case 'E': // Edited property
                        changeType = 'modified';
                        oldValue = diff.lhs;
                        newValue = diff.rhs;
                        // Check numeric tolerance
                        if (typeof oldValue === 'number' &&
                            typeof newValue === 'number' &&
                            this.isWithinTolerance(oldValue, newValue, config.numericTolerance)) {
                            continue; // Skip within tolerance
                        }
                        break;
                    case 'A': // Array change
                        changeType = 'array_change';
                        const arrayDiff = diff;
                        const item = arrayDiff.item;
                        if (item) {
                            oldValue = 'lhs' in item ? item.lhs : undefined;
                            newValue = 'rhs' in item ? item.rhs : undefined;
                        }
                        break;
                    default:
                        continue;
                }
                // Calculate impact
                let impact = this.calculateFieldImpact(path, config);
                // Apply custom rules
                const customRule = this.applyCustomRules(path, oldValue, newValue, config);
                if (customRule) {
                    impact = Math.max(impact, customRule.impact);
                }
                // Build description
                let description = `${path}: ${changeType}`;
                if (changeType === 'modified') {
                    description = `${path}: changed from ${JSON.stringify(oldValue)} to ${JSON.stringify(newValue)}`;
                }
                else if (changeType === 'added') {
                    description = `${path}: added with value ${JSON.stringify(newValue)}`;
                }
                else if (changeType === 'removed') {
                    description = `${path}: removed (was ${JSON.stringify(oldValue)})`;
                }
                if (customRule) {
                    description += ` - ${customRule.message}`;
                }
                changes.push({
                    path,
                    changeType,
                    oldValue,
                    newValue,
                    impact,
                    description,
                });
                affectedPaths.push(path);
                totalImpact += impact;
            }
            // Calculate overall impact score (0-100)
            const maxPossibleImpact = changes.length * 1.0;
            const impactScore = maxPossibleImpact > 0
                ? Math.min(100, (totalImpact / maxPossibleImpact) * 100)
                : 0;
            // Determine materiality
            let materiality;
            if (impactScore >= 70 || changes.some(c => c.impact >= 0.8)) {
                materiality = 'HIGH';
            }
            else if (impactScore >= 30 || changes.some(c => c.impact >= 0.5)) {
                materiality = 'MEDIUM';
            }
            else {
                materiality = 'LOW';
            }
            // Build summary
            const summary = changes.length === 0
                ? 'No significant changes detected'
                : `${changes.length} changes detected (${materiality} materiality): ` +
                    changes.slice(0, 3).map(c => c.path).join(', ') +
                    (changes.length > 3 ? ` and ${changes.length - 3} more` : '');
            const executionTime = Date.now() - startTime;
            const result = {
                changes,
                impactScore: Math.round(impactScore * 100) / 100,
                materiality,
                affectedPaths,
                summary,
                timestamp: new Date().toISOString(),
            };
            if (options.debugMode) {
                result.debugInfo = {
                    totalFieldsCompared: allPaths.size,
                    changesDetected: changes.length,
                    executionTime_ms: executionTime,
                };
            }
            span.setAttributes({
                changesDetected: changes.length,
                impactScore: result.impactScore,
                materiality,
                executionTime_ms: executionTime,
            });
            this.logger.info('Change detection complete', {
                operation: 'detectChanges',
                changesDetected: changes.length,
                impactScore: result.impactScore,
                materiality,
                executionTime_ms: executionTime,
            });
            return result;
        });
    }
}
exports.ChangeDetector = ChangeDetector;
// Default instance
exports.changeDetector = new ChangeDetector();
exports.default = exports.changeDetector;
//# sourceMappingURL=change-detector.js.map