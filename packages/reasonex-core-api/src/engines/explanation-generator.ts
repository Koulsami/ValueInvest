import { Logger } from '../lib/logger';
import { Tracer } from '../lib/tracer';
import { ScoringResult, DimensionScore, RuleExecution } from './rule-engine';

// Audience types
export type Audience = 'expert' | 'professional' | 'consumer';

// Verbosity levels
export type Verbosity = 'brief' | 'standard' | 'detailed';

// Explanation options
export interface ExplanationOptions {
  audience?: Audience;
  verbosity?: Verbosity;
  includeCitations?: boolean;
  language?: string;
  maxLength?: number;
}

// Key factor
export interface KeyFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  score: number;
  explanation: string;
}

// Citation
export interface Citation {
  field: string;
  value: unknown;
  source?: string;
}

// Explanation result
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

// Explanation templates by audience
const TEMPLATES = {
  expert: {
    summary: {
      prefix: '',
      scoreFormat: (score: number, max: number) => `Score: ${score.toFixed(2)}/${max}`,
      classificationFormat: (c: string) => `Classification: ${c}`,
    },
    dimension: {
      format: (name: string, score: number, max: number, pct: number) =>
        `${name}: ${score.toFixed(2)}/${max} (${pct.toFixed(1)}%)`,
    },
    rule: {
      format: (rule: RuleExecution) =>
        `${rule.field}=${rule.inputValue} [${rule.operator} ${JSON.stringify(rule.targetValue)}] -> ${rule.rawScore.toFixed(2)}`,
    },
  },
  professional: {
    summary: {
      prefix: 'Based on our analysis, ',
      scoreFormat: (score: number, max: number) => `overall score of ${Math.round(score)} out of ${max}`,
      classificationFormat: (c: string) => `rated as "${c}"`,
    },
    dimension: {
      format: (name: string, score: number, max: number, pct: number) =>
        `${name}: ${Math.round(score)}/${max} points (${Math.round(pct)}%)`,
    },
    rule: {
      format: (rule: RuleExecution) =>
        `${formatFieldName(rule.field)}: ${formatValue(rule.inputValue)} (${rule.passed ? 'meets' : 'below'} threshold)`,
    },
  },
  consumer: {
    summary: {
      prefix: 'We analyzed this investment opportunity and found ',
      scoreFormat: (score: number, max: number) => `a score of ${Math.round(score)} out of ${max}`,
      classificationFormat: (c: string) => `Our recommendation: ${formatClassification(c)}`,
    },
    dimension: {
      format: (name: string, score: number, max: number, pct: number) =>
        `${formatDimensionName(name)}: ${getScoreEmoji(pct)} ${Math.round(pct)}%`,
    },
    rule: {
      format: (rule: RuleExecution) =>
        `${formatFieldNameConsumer(rule.field)}: ${formatValueConsumer(rule.inputValue, rule.field)}`,
    },
  },
};

// Helper functions
function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

function formatFieldNameConsumer(field: string): string {
  const mappings: Record<string, string> = {
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

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    if (Math.abs(value) < 1) {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toFixed(2);
  }
  return String(value);
}

function formatValueConsumer(value: unknown, field: string): string {
  if (typeof value !== 'number') return String(value);

  const percentFields = ['roe', 'roic', 'netMargin', 'dividendYield', 'revenueGrowth', 'epsGrowth'];
  if (percentFields.includes(field)) {
    return `${(value * 100).toFixed(1)}%`;
  }

  if (field === 'marketCap') {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)} trillion`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)} billion`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)} million`;
    return `$${value.toLocaleString()}`;
  }

  return value.toFixed(1);
}

function formatClassification(classification: string): string {
  const mappings: Record<string, string> = {
    'Strong Buy': 'Strong opportunity - consider adding to portfolio',
    'Buy': 'Good opportunity - worth considering',
    'Hold': 'Fair value - wait for better entry point',
    'Watch': 'Below average - monitor for improvement',
    'Avoid': 'Not recommended at current valuation',
  };
  return mappings[classification] || classification;
}

function formatDimensionName(name: string): string {
  const mappings: Record<string, string> = {
    'Valuation': 'Value for Money',
    'Quality': 'Business Quality',
    'Growth': 'Growth Potential',
    'Dividend': 'Income Potential',
    'Competitive Moat': 'Competitive Strength',
  };
  return mappings[name] || name;
}

function getScoreEmoji(percentage: number): string {
  if (percentage >= 80) return '';
  if (percentage >= 60) return '';
  if (percentage >= 40) return '';
  return '';
}

// Explanation Generator class
export class ExplanationGenerator {
  private logger: Logger;
  private tracer: Tracer;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger(undefined, { service: 'reasonex-core-api', node: 'ExplanationGenerator' });
    this.tracer = new Tracer('ExplanationGenerator', this.logger);
  }

  /**
   * Generate summary paragraph
   */
  private generateSummary(
    scoringResult: ScoringResult,
    audience: Audience,
    verbosity: Verbosity
  ): string {
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
  private extractKeyFactors(
    scoringResult: ScoringResult,
    audience: Audience,
    count: number = 5
  ): KeyFactor[] {
    const factors: KeyFactor[] = [];

    // Get top and bottom performing dimensions
    const sortedDimensions = [...scoringResult.scores.dimensions]
      .sort((a, b) => (b.rawScore / b.maxScore) - (a.rawScore / a.maxScore));

    for (const dim of sortedDimensions) {
      const percentage = (dim.rawScore / dim.maxScore) * 100;
      const impact: 'positive' | 'negative' | 'neutral' =
        percentage >= 70 ? 'positive' :
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
  private getConsumerExplanation(dim: DimensionScore, rules: RuleExecution[]): string {
    const percentage = (dim.rawScore / dim.maxScore) * 100;
    const quality = percentage >= 70 ? 'strong' : percentage >= 50 ? 'moderate' : 'weak';

    const bestRule = rules[0];
    const worstRule = rules[rules.length - 1];

    if (percentage >= 70) {
      return `Shows ${quality} ${formatDimensionName(dim.dimensionName).toLowerCase()}. ` +
        `${formatFieldNameConsumer(bestRule?.field || '')} is particularly good.`;
    } else if (percentage <= 30) {
      return `${formatDimensionName(dim.dimensionName)} is a concern. ` +
        `${formatFieldNameConsumer(worstRule?.field || '')} needs improvement.`;
    }

    return `${formatDimensionName(dim.dimensionName)} is ${quality}.`;
  }

  /**
   * Get professional explanation for a dimension
   */
  private getProfessionalExplanation(dim: DimensionScore, rules: RuleExecution[]): string {
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
  private generateDetailedExplanation(
    scoringResult: ScoringResult,
    audience: Audience,
    verbosity: Verbosity
  ): string {
    const template = TEMPLATES[audience];
    const sections: string[] = [];

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
        } else {
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
  private extractCitations(scoringResult: ScoringResult): Citation[] {
    const citations: Citation[] = [];

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
  generate(
    scoringResult: ScoringResult,
    options: ExplanationOptions = {}
  ): ExplanationResult {
    return this.tracer.withSpanSync('generate', (span) => {
      const {
        audience = 'professional',
        verbosity = 'standard',
        includeCitations = true,
        language = 'en',
      } = options;

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

      const result: ExplanationResult = {
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
  generateFromRuleExecutions(
    ruleExecutions: RuleExecution[],
    recommendation: string,
    options: ExplanationOptions = {}
  ): Partial<ExplanationResult> {
    const { audience = 'professional', verbosity = 'standard' } = options;
    const template = TEMPLATES[audience];

    const summary = `${template.summary.prefix}Analysis complete. ${recommendation}`;

    const keyFactors: KeyFactor[] = ruleExecutions
      .sort((a, b) => b.rawScore - a.rawScore)
      .slice(0, 5)
      .map(rule => ({
        factor: formatFieldName(rule.field),
        impact: rule.passed ? 'positive' : 'negative' as const,
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

// Default instance
export const explanationGenerator = new ExplanationGenerator();

export default explanationGenerator;
