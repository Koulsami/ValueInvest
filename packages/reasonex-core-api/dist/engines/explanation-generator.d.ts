import { Logger } from '../lib/logger';
import { ScoringResult, RuleExecution } from './rule-engine';
export type Audience = 'expert' | 'professional' | 'consumer';
export type Verbosity = 'brief' | 'standard' | 'detailed';
export interface ExplanationOptions {
    audience?: Audience;
    verbosity?: Verbosity;
    includeCitations?: boolean;
    language?: string;
    maxLength?: number;
}
export interface KeyFactor {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    score: number;
    explanation: string;
}
export interface Citation {
    field: string;
    value: unknown;
    source?: string;
}
export interface ExplanationResult {
    summary: string;
    keyFactors: KeyFactor[];
    detailedExplanation: string;
    citations: Citation[];
    metadata: {
        audience: Audience;
        verbosity: Verbosity;
        language: string;
        generatedAt: string;
    };
}
export declare class ExplanationGenerator {
    private logger;
    private tracer;
    constructor(logger?: Logger);
    /**
     * Generate summary paragraph
     */
    private generateSummary;
    /**
     * Extract key factors from scoring result
     */
    private extractKeyFactors;
    /**
     * Get consumer-friendly explanation for a dimension
     */
    private getConsumerExplanation;
    /**
     * Get professional explanation for a dimension
     */
    private getProfessionalExplanation;
    /**
     * Generate detailed explanation
     */
    private generateDetailedExplanation;
    /**
     * Extract citations from scoring result
     */
    private extractCitations;
    /**
     * Generate explanation for a scoring result
     */
    generate(scoringResult: ScoringResult, options?: ExplanationOptions): ExplanationResult;
    /**
     * Generate explanation from rule executions only
     */
    generateFromRuleExecutions(ruleExecutions: RuleExecution[], recommendation: string, options?: ExplanationOptions): Partial<ExplanationResult>;
}
export declare const explanationGenerator: ExplanationGenerator;
export default explanationGenerator;
//# sourceMappingURL=explanation-generator.d.ts.map