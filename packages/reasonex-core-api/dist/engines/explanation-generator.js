"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explanationGenerator = exports.ExplanationGenerator = void 0;
const logger_1 = require("../lib/logger");
const tracer_1 = require("../lib/tracer");
// Explanation templates by audience
const TEMPLATES = {
    expert: {
        summary: {
            prefix: '',
            scoreFormat: (score, max) => `Score: ${score.toFixed(2)}/${max}`,
            classificationFormat: (c) => `Classification: ${c}`,
        },
        dimension: {
            format: (name, score, max, pct) => `${name}: ${score.toFixed(2)}/${max} (${pct.toFixed(1)}%)`,
        },
        rule: {
            format: (rule) => `${rule.field}=${rule.inputValue} [${rule.operator} ${JSON.stringify(rule.targetValue)}] -> ${rule.rawScore.toFixed(2)}`,
        },
    },
    professional: {
        summary: {
            prefix: 'Based on our analysis, ',
            scoreFormat: (score, max) => `overall score of ${Math.round(score)} out of ${max}`,
            classificationFormat: (c) => `rated as "${c}"`,
        },
        dimension: {
            format: (name, score, max, pct) => `${name}: ${Math.round(score)}/${max} points (${Math.round(pct)}%)`,
        },
        rule: {
            format: (rule) => `${formatFieldName(rule.field)}: ${formatValue(rule.inputValue)} (${rule.passed ? 'meets' : 'below'} threshold)`,
        },
    },
    consumer: {
        summary: {
            prefix: 'We analyzed this investment opportunity and found ',
            scoreFormat: (score, max) => `a score of ${Math.round(score)} out of ${max}`,
            classificationFormat: (c) => `Our recommendation: ${formatClassification(c)}`,
        },
        dimension: {
            format: (name, score, max, pct) => `${formatDimensionName(name)}: ${getScoreEmoji(pct)} ${Math.round(pct)}%`,
        },
        rule: {
            format: (rule) => `${formatFieldNameConsumer(rule.field)}: ${formatValueConsumer(rule.inputValue, rule.field)}`,
        },
    },
};
// Helper functions
function formatFieldName(field) {
    return field
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, s => s.toUpperCase())
        .trim();
}
function formatFieldNameConsumer(field) {
    const mappings = {
        peRatio: 'Price-to-Earnings',
        pbRatio: 'Price-to-Book Value',
        roe: 'Return on Investment',
        roic: 'Capital Efficiency',
        netMargin: 'Profit Margin',
        debtEquity: 'Debt Level',
        dividendYield: 'Dividend Payment',
        revenueGrowth: 'Sales Growth',
        epsGrowth: 'Earnings Growth',
    };
    return mappings[field] || formatFieldName(field);
}
function formatValue(value) {
    if (typeof value === 'number') {
        if (Math.abs(value) < 1) {
            return `${(value * 100).toFixed(1)}%`;
        }
        return value.toFixed(2);
    }
    return String(value);
}
function formatValueConsumer(value, field) {
    if (typeof value !== 'number')
        return String(value);
    const percentFields = ['roe', 'roic', 'netMargin', 'dividendYield', 'revenueGrowth', 'epsGrowth'];
    if (percentFields.includes(field)) {
        return `${(value * 100).toFixed(1)}%`;
    }
    if (field === 'marketCap') {
        if (value >= 1e12)
            return `$${(value / 1e12).toFixed(1)} trillion`;
        if (value >= 1e9)
            return `$${(value / 1e9).toFixed(1)} billion`;
        if (value >= 1e6)
            return `$${(value / 1e6).toFixed(1)} million`;
        return `$${value.toLocaleString()}`;
    }
    return value.toFixed(1);
}
function formatClassification(classification) {
    const mappings = {
        'Strong Buy': 'Strong opportunity - consider adding to portfolio',
        'Buy': 'Good opportunity - worth considering',
        'Hold': 'Fair value - wait for better entry point',
        'Watch': 'Below average - monitor for improvement',
        'Avoid': 'Not recommended at current valuation',
    };
    return mappings[classification] || classification;
}
function formatDimensionName(name) {
    const mappings = {
        'Valuation': 'Value for Money',
        'Quality': 'Business Quality',
        'Growth': 'Growth Potential',
        'Dividend': 'Income Potential',
        'Competitive Moat': 'Competitive Strength',
    };
    return mappings[name] || name;
}
function getScoreEmoji(percentage) {
    if (percentage >= 80)
        return '';
    if (percentage >= 60)
        return '';
    if (percentage >= 40)
        return '';
    return '';
}
// Explanation Generator class
class ExplanationGenerator {
    logger;
    tracer;
    constructor(logger) {
        this.logger = logger || new logger_1.Logger(undefined, { service: 'reasonex-core-api', node: 'ExplanationGenerator' });
        this.tracer = new tracer_1.Tracer('ExplanationGenerator', this.logger);
    }
    /**
     * Generate summary paragraph
     */
    generateSummary(scoringResult, audience, verbosity) {
        const template = TEMPLATES[audience].summary;
        const scoreStr = template.scoreFormat(scoringResult.scores.total, scoringResult.scores.maxPossible);
        const classStr = template.classificationFormat(scoringResult.classification);
        if (verbosity === 'brief') {
            return `${template.prefix}${scoreStr}. ${classStr}.`;
        }
        // Standard or detailed
        const dimensionSummaries = scoringResult.scores.dimensions
            .sort((a, b) => b.weightedScore - a.weightedScore)
            .slice(0, 3)
            .map(d => `${d.dimensionName.toLowerCase()} (${Math.round(d.rawScore / d.maxScore * 100)}%)`);
        const strengthsStr = dimensionSummaries.length > 0
            ? ` Key strengths: ${dimensionSummaries.join(', ')}.`
            : '';
        return `${template.prefix}${scoreStr}, ${classStr.toLowerCase()}.${strengthsStr}`;
    }
    /**
     * Extract key factors from scoring result
     */
    extractKeyFactors(scoringResult, audience, count = 5) {
        const factors = [];
        // Get top and bottom performing dimensions
        const sortedDimensions = [...scoringResult.scores.dimensions]
            .sort((a, b) => (b.rawScore / b.maxScore) - (a.rawScore / a.maxScore));
        for (const dim of sortedDimensions) {
            const percentage = (dim.rawScore / dim.maxScore) * 100;
            const impact = percentage >= 70 ? 'positive' :
                percentage <= 30 ? 'negative' : 'neutral';
            // Get best/worst rule in dimension
            const sortedRules = [...dim.ruleExecutions]
                .sort((a, b) => b.normalizedScore - a.normalizedScore);
            const explanation = audience === 'consumer'
                ? this.getConsumerExplanation(dim, sortedRules)
                : this.getProfessionalExplanation(dim, sortedRules);
            factors.push({
                factor: dim.dimensionName,
                impact,
                score: percentage,
                explanation,
            });
        }
        return factors.slice(0, count);
    }
    /**
     * Get consumer-friendly explanation for a dimension
     */
    getConsumerExplanation(dim, rules) {
        const percentage = (dim.rawScore / dim.maxScore) * 100;
        const quality = percentage >= 70 ? 'strong' : percentage >= 50 ? 'moderate' : 'weak';
        const bestRule = rules[0];
        const worstRule = rules[rules.length - 1];
        if (percentage >= 70) {
            return `Shows ${quality} ${formatDimensionName(dim.dimensionName).toLowerCase()}. ` +
                `${formatFieldNameConsumer(bestRule?.field || '')} is particularly good.`;
        }
        else if (percentage <= 30) {
            return `${formatDimensionName(dim.dimensionName)} is a concern. ` +
                `${formatFieldNameConsumer(worstRule?.field || '')} needs improvement.`;
        }
        return `${formatDimensionName(dim.dimensionName)} is ${quality}.`;
    }
    /**
     * Get professional explanation for a dimension
     */
    getProfessionalExplanation(dim, rules) {
        const percentage = (dim.rawScore / dim.maxScore) * 100;
        const passingRules = rules.filter(r => r.passed).length;
        const totalRules = rules.length;
        return `${dim.dimensionName}: ${dim.rawScore.toFixed(1)}/${dim.maxScore} points ` +
            `(${passingRules}/${totalRules} metrics passed). ` +
            rules.slice(0, 2).map(r => `${formatFieldName(r.field)}: ${formatValue(r.inputValue)}`).join(', ') + '.';
    }
    /**
     * Generate detailed explanation
     */
    generateDetailedExplanation(scoringResult, audience, verbosity) {
        const template = TEMPLATES[audience];
        const sections = [];
        // Overall section
        sections.push(`## Overall Assessment\n${this.generateSummary(scoringResult, audience, 'standard')}`);
        // Dimension sections
        if (verbosity !== 'brief') {
            sections.push('\n## Breakdown by Category');
            for (const dim of scoringResult.scores.dimensions) {
                const pct = (dim.rawScore / dim.maxScore) * 100;
                const dimHeader = template.dimension.format(dim.dimensionName, dim.rawScore, dim.maxScore, pct);
                if (verbosity === 'detailed') {
                    const ruleDetails = dim.ruleExecutions
                        .map(r => `  - ${template.rule.format(r)}`)
                        .join('\n');
                    sections.push(`\n### ${dimHeader}\n${ruleDetails}`);
                }
                else {
                    sections.push(`\n### ${dimHeader}`);
                }
            }
        }
        // Recommendation section
        sections.push(`\n## Recommendation\n${scoringResult.recommendation}`);
        return sections.join('\n');
    }
    /**
     * Extract citations from scoring result
     */
    extractCitations(scoringResult) {
        const citations = [];
        for (const dim of scoringResult.scores.dimensions) {
            for (const rule of dim.ruleExecutions) {
                if (rule.inputValue !== null && rule.inputValue !== undefined) {
                    citations.push({
                        field: rule.field,
                        value: rule.inputValue,
                        source: 'financial_data',
                    });
                }
            }
        }
        return citations;
    }
    /**
     * Generate explanation for a scoring result
     */
    generate(scoringResult, options = {}) {
        return this.tracer.withSpanSync('generate', (span) => {
            const { audience = 'professional', verbosity = 'standard', includeCitations = true, language = 'en', } = options;
            span.setAttributes({
                audience,
                verbosity,
                includeCitations,
                language,
            });
            this.logger.info('Generating explanation', {
                operation: 'generate',
                audience,
                verbosity,
                ruleSetId: scoringResult.ruleSetId,
            });
            const summary = this.generateSummary(scoringResult, audience, verbosity);
            const keyFactors = this.extractKeyFactors(scoringResult, audience);
            const detailedExplanation = this.generateDetailedExplanation(scoringResult, audience, verbosity);
            const citations = includeCitations ? this.extractCitations(scoringResult) : [];
            const result = {
                summary,
                keyFactors,
                detailedExplanation,
                citations,
                metadata: {
                    audience,
                    verbosity,
                    language,
                    generatedAt: new Date().toISOString(),
                },
            };
            span.setAttributes({
                summaryLength: summary.length,
                keyFactorCount: keyFactors.length,
                citationCount: citations.length,
            });
            this.logger.info('Explanation generated', {
                operation: 'generate',
                summaryLength: summary.length,
                keyFactorCount: keyFactors.length,
            });
            return result;
        });
    }
    /**
     * Generate explanation from rule executions only
     */
    generateFromRuleExecutions(ruleExecutions, recommendation, options = {}) {
        const { audience = 'professional', verbosity = 'standard' } = options;
        const template = TEMPLATES[audience];
        const summary = `${template.summary.prefix}Analysis complete. ${recommendation}`;
        const keyFactors = ruleExecutions
            .sort((a, b) => b.rawScore - a.rawScore)
            .slice(0, 5)
            .map(rule => ({
            factor: formatFieldName(rule.field),
            impact: rule.passed ? 'positive' : 'negative',
            score: rule.normalizedScore * 100,
            explanation: template.rule.format(rule),
        }));
        return {
            summary,
            keyFactors,
            metadata: {
                audience,
                verbosity,
                language: 'en',
                generatedAt: new Date().toISOString(),
            },
        };
    }
}
exports.ExplanationGenerator = ExplanationGenerator;
// Default instance
exports.explanationGenerator = new ExplanationGenerator();
exports.default = exports.explanationGenerator;
//# sourceMappingURL=explanation-generator.js.map