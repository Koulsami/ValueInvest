import { Logger } from '../lib/logger';
export type RuleOperator = 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'neq' | 'between' | 'in';
export type LegendaryRuleType = 'THRESHOLD' | 'LOOKUP' | 'BOOLEAN' | 'FORMULA' | 'RANGE';
export interface ThresholdLevel {
    min?: number;
    max?: number;
    score: number;
    label: string;
}
export interface RangeLevel {
    min: number;
    max: number;
    score: number;
    label: string;
}
export interface LegendaryRule {
    id: string;
    name: string;
    description?: string;
    ruleType: LegendaryRuleType;
    field?: string;
    fields?: string[];
    inverse?: boolean;
    thresholds?: ThresholdLevel[];
    lookup?: Record<string, number>;
    ranges?: RangeLevel[];
    formula?: string;
    trueScore?: number;
    falseScore?: number;
    defaultScore?: number;
    maxScore: number;
    minScore?: number;
}
export interface LegendaryDimension {
    id: string;
    name: string;
    weight: number;
    maxScore: number;
    aggregation: 'weighted_sum' | 'average' | 'max' | 'min' | 'composite';
    ruleWeights?: Record<string, number>;
    rules: LegendaryRule[];
}
export interface LegendaryRuleSet {
    id: string;
    name: string;
    version: string;
    vertical: string;
    description?: string;
    investor?: string;
    philosophy?: string;
    totalMaxScore: number;
    aggregation: 'weighted_average' | 'sum' | 'max' | 'composite';
    passingThreshold?: number;
    recommendationThresholds?: {
        strong_buy: number;
        buy: number;
        hold: number;
        sell: number;
    };
    isComposite?: boolean;
    compositeWeights?: Record<string, number>;
    dimensions: LegendaryDimension[];
    classifications: Classification[];
}
export interface CompositeScoreResult extends ScoringResult {
    isComposite: true;
    components: Record<string, {
        total: number;
        weight: number;
        weighted: number;
        classification: string;
        recommendation: string;
    }>;
}
export interface Rule {
    id: string;
    field: string;
    operator: RuleOperator;
    value: number | string | [number, number] | (number | string)[];
    scoreFormula: string;
    maxScore: number;
    minScore?: number;
    description?: string;
}
export interface Dimension {
    id: string;
    name: string;
    weight: number;
    maxScore: number;
    rules: Rule[];
    aggregation: 'weighted_sum' | 'average' | 'max' | 'min';
    ruleWeights?: Record<string, number>;
}
export interface RuleSet {
    id: string;
    name: string;
    version: string;
    vertical: string;
    description?: string;
    dimensions: Dimension[];
    aggregation: 'weighted_average' | 'sum' | 'max' | 'custom';
    totalMaxScore: number;
    classifications: Classification[];
}
export interface Classification {
    name: string;
    minScore: number;
    maxScore: number;
    recommendation?: string;
}
export interface RuleExecution {
    ruleId: string;
    field: string;
    inputValue: unknown;
    operator: RuleOperator;
    targetValue: unknown;
    passed: boolean;
    rawScore: number;
    maxScore: number;
    weight: number;
    normalizedScore: number;
    explanation: string;
}
export interface DimensionScore {
    dimensionId: string;
    dimensionName: string;
    weight: number;
    maxScore: number;
    rawScore: number;
    weightedScore: number;
    ruleExecutions: RuleExecution[];
    explanation: string;
}
export interface ScoringResult {
    ruleSetId: string;
    ruleSetName: string;
    vertical: string;
    timestamp: string;
    scores: {
        dimensions: DimensionScore[];
        total: number;
        maxPossible: number;
        percentage: number;
    };
    classification: string;
    recommendation: string;
    explanation: string;
    debugInfo?: {
        inputData: Record<string, unknown>;
        ruleSetVersion: string;
        executionTime_ms: number;
    };
}
export interface InvestmentData {
    peRatio?: number;
    pbRatio?: number;
    evEbitda?: number;
    pFcf?: number;
    roe?: number;
    roic?: number;
    netMargin?: number;
    debtEquity?: number;
    interestCoverage?: number;
    revenueGrowth?: number;
    epsGrowth?: number;
    fcfGrowth?: number;
    dividendYield?: number;
    payoutRatio?: number;
    moatScore?: number;
}
export interface InvestmentScoringResult extends ScoringResult {
    breakdown: {
        valuation: {
            peScore: number;
            pbScore: number;
            evScore: number;
            pfcfScore: number;
            total: number;
            max: number;
        };
        quality: {
            roeScore: number;
            roicScore: number;
            marginScore: number;
            debtScore: number;
            coverageScore: number;
            total: number;
            max: number;
        };
        growth: {
            revGrowthScore: number;
            epsGrowthScore: number;
            fcfGrowthScore: number;
            total: number;
            max: number;
        };
        dividend: {
            yieldScore: number;
            payoutScore: number;
            total: number;
            max: number;
        };
        moat: {
            score: number;
            max: number;
        };
    };
}
export declare class RuleEngine {
    private logger;
    private tracer;
    private ruleSets;
    private configPath;
    constructor(logger?: Logger, configPath?: string);
    /**
     * Load rule sets from config directory
     */
    private loadRuleSets;
    /**
     * Register a rule set programmatically
     */
    registerRuleSet(ruleSet: RuleSet): void;
    /**
     * Get available rule sets
     */
    getRuleSets(): string[];
    /**
     * Get a specific rule set
     */
    getRuleSet(id: string): RuleSet | undefined;
    /**
     * Safely get a numeric value from data, with default
     */
    private getValue;
    /**
     * ============================================================
     * INVESTMENT SCORING - EXACT FORMULAS FROM stage2_scoring.json
     * ============================================================
     *
     * This method implements the exact scoring logic from the proven
     * n8n workflow in /workflows/stage2_scoring.json
     *
     * Scoring Breakdown:
     * - Valuation: 30 points max (PE, PB, EV/EBITDA, P/FCF)
     * - Quality: 25 points max (ROE, ROIC, Net Margin, Debt/Equity, Interest Coverage)
     * - Growth: 20 points max (Revenue Growth, EPS Growth, FCF Growth)
     * - Dividend: 15 points max (Yield, Payout Ratio)
     * - Moat: 10 points max (AI-determined competitive advantage)
     *
     * Total: 100 points
     */
    scoreInvestment(data: InvestmentData | Record<string, unknown>, debugMode?: boolean): InvestmentScoringResult;
    /**
     * Generic score method - routes to appropriate scorer based on vertical
     */
    score(data: Record<string, unknown>, ruleSetId: string, context?: Record<string, unknown>, debugMode?: boolean): ScoringResult | CompositeScoreResult;
    /**
     * Score using legendary investor rule sets (Buffett, Graham, Lynch, Fisher)
     */
    private scoreLegendaryInvestor;
    /**
     * Score a dimension using legendary investor rules
     */
    private scoreLegendaryDimension;
    /**
     * Execute a legendary investor rule
     */
    private executeLegendaryRule;
    /**
     * Evaluate THRESHOLD rule type
     */
    private evaluateThreshold;
    /**
     * Evaluate LOOKUP rule type
     */
    private evaluateLookup;
    /**
     * Evaluate BOOLEAN rule type
     */
    private evaluateBoolean;
    /**
     * Evaluate FORMULA rule type
     */
    private evaluateFormula;
    /**
     * Evaluate RANGE rule type
     */
    private evaluateRange;
    /**
     * Get nested value from data object using dot notation
     */
    private getNestedValue;
    /**
     * Classify score using legendary rule set thresholds
     */
    private classifyLegendary;
    /**
     * Score using composite rule set (weighted blend of multiple rule sets)
     */
    private scoreComposite;
    /**
     * Generic config-based scoring (for non-investment verticals)
     */
    private scoreGeneric;
    /**
     * Evaluate a rule operator
     */
    private evaluateOperator;
    /**
     * Calculate score using formula
     */
    private calculateScore;
    /**
     * Execute a single rule
     */
    private executeRule;
    /**
     * Score a dimension
     */
    private scoreDimension;
    /**
     * Determine classification based on score
     */
    private classify;
    /**
     * Validate data has required fields for a rule set
     */
    validateData(data: Record<string, unknown>, ruleSetId: string): {
        valid: boolean;
        missingFields: string[];
    };
}
export declare const ruleEngine: RuleEngine;
export default ruleEngine;
//# sourceMappingURL=rule-engine.d.ts.map