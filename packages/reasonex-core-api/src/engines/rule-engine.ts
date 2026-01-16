import { Logger } from '../lib/logger';
import { Tracer, SpanStatus } from '../lib/tracer';
import * as fs from 'fs';
import * as path from 'path';

// Rule operators
export type RuleOperator = 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'neq' | 'between' | 'in';

// Rule definition
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

// Dimension definition
export interface Dimension {
  id: string;
  name: string;
  weight: number;
  maxScore: number;
  rules: Rule[];
  aggregation: 'weighted_sum' | 'average' | 'max' | 'min';
  ruleWeights?: Record<string, number>;
}

// Rule set definition
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

// Classification thresholds
export interface Classification {
  name: string;
  minScore: number;
  maxScore: number;
  recommendation?: string;
}

// Rule execution result
export interface RuleExecution {
  ruleId: string;
  field: string;
  inputValue: unknown;
  operator: RuleOperator;
  targetValue: unknown;
  passed: boolean;
  rawScore: number;
  normalizedScore: number;
  explanation: string;
}

// Dimension score result
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

// Scoring result
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

// Investment-specific input data interface (matches stage2_scoring.json)
export interface InvestmentData {
  // Valuation metrics
  peRatio?: number;
  pbRatio?: number;
  evEbitda?: number;
  pFcf?: number;

  // Quality metrics
  roe?: number;
  roic?: number;
  netMargin?: number;
  debtEquity?: number;
  interestCoverage?: number;

  // Growth metrics
  revenueGrowth?: number;
  epsGrowth?: number;
  fcfGrowth?: number;

  // Dividend metrics
  dividendYield?: number;
  payoutRatio?: number;

  // Moat
  moatScore?: number;
}

// Investment scoring result with detailed breakdown
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

// Rule Engine class
export class RuleEngine {
  private logger: Logger;
  private tracer: Tracer;
  private ruleSets: Map<string, RuleSet> = new Map();
  private configPath: string;

  constructor(logger?: Logger, configPath?: string) {
    this.logger = logger || new Logger(undefined, { service: 'reasonex-core-api', node: 'RuleEngine' });
    this.tracer = new Tracer('RuleEngine', this.logger);
    this.configPath = configPath || path.join(__dirname, '../config/rule-sets');
    this.loadRuleSets();
  }

  /**
   * Load rule sets from config directory
   */
  private loadRuleSets(): void {
    try {
      if (!fs.existsSync(this.configPath)) {
        this.logger.warn('Rule sets config path not found, using defaults', { path: this.configPath });
        return;
      }

      const files = fs.readdirSync(this.configPath).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const filePath = path.join(this.configPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const ruleSet = JSON.parse(content) as RuleSet;
        this.ruleSets.set(ruleSet.id, ruleSet);
        this.logger.info(`Loaded rule set: ${ruleSet.id}`, { version: ruleSet.version });
      }
    } catch (error) {
      this.logger.error('Failed to load rule sets', { error: (error as Error).message });
    }
  }

  /**
   * Register a rule set programmatically
   */
  registerRuleSet(ruleSet: RuleSet): void {
    this.ruleSets.set(ruleSet.id, ruleSet);
    this.logger.info(`Registered rule set: ${ruleSet.id}`, { version: ruleSet.version });
  }

  /**
   * Get available rule sets
   */
  getRuleSets(): string[] {
    return Array.from(this.ruleSets.keys());
  }

  /**
   * Get a specific rule set
   */
  getRuleSet(id: string): RuleSet | undefined {
    return this.ruleSets.get(id);
  }

  /**
   * Safely get a numeric value from data, with default
   */
  private getValue(data: Record<string, unknown>, field: string, defaultValue: number = 0): number {
    const parts = field.split('.');
    let value: unknown = data;

    for (const part of parts) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return defaultValue;
      }
      value = (value as Record<string, unknown>)[part];
    }

    if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed) && isFinite(parsed)) {
        return parsed;
      }
    }

    return defaultValue;
  }

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
  scoreInvestment(
    data: InvestmentData | Record<string, unknown>,
    debugMode: boolean = false
  ): InvestmentScoringResult {
    return this.tracer.withSpanSync('scoreInvestment', (span) => {
      const startTime = Date.now();

      span.setAttributes({
        ruleSetId: 'investment-v1',
        debugMode,
        dataKeys: Object.keys(data).length,
      });

      this.logger.info('Starting investment scoring (stage2 formula)', {
        operation: 'scoreInvestment',
        dataKeys: Object.keys(data).length,
      });

      // Cast to Record for getValue compatibility
      const inputData = data as Record<string, unknown>;

      // ===================
      // EXTRACT INPUT VALUES
      // ===================

      // Valuation metrics
      const pe = this.getValue(inputData, 'peRatio', 0);
      const pb = this.getValue(inputData, 'pbRatio', 0);
      const evEbitda = this.getValue(inputData, 'evEbitda', 0);
      const pFcf = this.getValue(inputData, 'pFcf', 0);

      // Quality metrics
      const roe = this.getValue(inputData, 'roe', 0);
      const roic = this.getValue(inputData, 'roic', 0);
      const netMargin = this.getValue(inputData, 'netMargin', 0);
      const debtEquity = this.getValue(inputData, 'debtEquity', 0);
      const interestCoverage = this.getValue(inputData, 'interestCoverage', 0);

      // Growth metrics (as decimals, e.g., 0.15 for 15%)
      const revGrowth = this.getValue(inputData, 'revenueGrowth', 0);
      const epsGrowth = this.getValue(inputData, 'epsGrowth', 0);
      const fcfGrowth = this.getValue(inputData, 'fcfGrowth', 0);

      // Dividend metrics
      const divYield = this.getValue(inputData, 'dividendYield', 0);
      const payoutRatio = this.getValue(inputData, 'payoutRatio', 0);

      // Moat (AI-determined, 0-10 scale)
      const moatScore = this.getValue(inputData, 'moatScore', 0);

      this.logger.debug('Input values extracted', {
        valuation: { pe, pb, evEbitda, pFcf },
        quality: { roe, roic, netMargin, debtEquity, interestCoverage },
        growth: { revGrowth, epsGrowth, fcfGrowth },
        dividend: { divYield, payoutRatio },
        moat: moatScore,
      });

      // ================================
      // VALUATION SCORE (30 points max)
      // ================================
      // Formula: Lower is better for all ratios

      // P/E Score: 12 - (PE - 5) * 0.8, clamped 0-12
      // Baseline PE of 5 gives full score, each point above reduces by 0.8
      const peScore = Math.max(0, Math.min(12, 12 - (pe - 5) * 0.8));

      // P/B Score: 12 - PB * 4, clamped 0-12
      // PB of 0 gives full score, each point reduces by 4
      const pbScore = Math.max(0, Math.min(12, 12 - pb * 4));

      // EV/EBITDA Score: 12 - (EV/EBITDA - 4) * 0.8, clamped 0-12
      // Baseline EV/EBITDA of 4 gives full score
      const evScore = Math.max(0, Math.min(12, 12 - (evEbitda - 4) * 0.8));

      // P/FCF Score: 12 - (P/FCF - 5) * 0.6, clamped 0-12
      // Baseline P/FCF of 5 gives full score
      const pfcfScore = Math.max(0, Math.min(12, 12 - (pFcf - 5) * 0.6));

      // Weighted average * 2.5 to scale to 30 points max
      // Weights: PE 40%, PB 25%, EV/EBITDA 20%, P/FCF 15%
      const valuationScore = (peScore * 0.40 + pbScore * 0.25 + evScore * 0.20 + pfcfScore * 0.15) * 2.5;

      this.logger.debug('Valuation scores calculated', {
        peScore: peScore.toFixed(2),
        pbScore: pbScore.toFixed(2),
        evScore: evScore.toFixed(2),
        pfcfScore: pfcfScore.toFixed(2),
        valuationScore: valuationScore.toFixed(2),
      });

      // =============================
      // QUALITY SCORE (25 points max)
      // =============================
      // Formula: Higher is better for profitability, lower for debt

      // ROE Score: ROE * 40, clamped 0-12
      // 20% ROE = 8 points, 30% ROE = 12 points (max)
      const roeScore = Math.min(12, Math.abs(roe) * 40);

      // ROIC Score: ROIC * 60, clamped 0-12
      // 15% ROIC = 9 points, 20% ROIC = 12 points (max)
      const roicScore = Math.min(12, Math.abs(roic) * 60);

      // Net Margin Score: Margin * 60, clamped 0-12
      // 10% margin = 6 points, 20% margin = 12 points (max)
      const marginScore = Math.min(12, Math.abs(netMargin) * 60);

      // Debt/Equity Score: 12 - D/E * 4, clamped 0-12
      // Lower is better, penalty of 4 points per ratio point
      const debtScore = Math.max(0, 12 - Math.abs(debtEquity) * 4);

      // Interest Coverage Score: Coverage * 1.2, clamped 0-12
      // 10x coverage = 12 points (max)
      const coverageScore = Math.min(12, Math.max(0, interestCoverage) * 1.2);

      // Weighted average * 2.08 to scale to 25 points max
      // Weights: ROE 30%, ROIC 25%, Margin 20%, Debt 15%, Coverage 10%
      const qualityScore = (roeScore * 0.30 + roicScore * 0.25 + marginScore * 0.20 + debtScore * 0.15 + coverageScore * 0.10) * 2.08;

      this.logger.debug('Quality scores calculated', {
        roeScore: roeScore.toFixed(2),
        roicScore: roicScore.toFixed(2),
        marginScore: marginScore.toFixed(2),
        debtScore: debtScore.toFixed(2),
        coverageScore: coverageScore.toFixed(2),
        qualityScore: qualityScore.toFixed(2),
      });

      // ============================
      // GROWTH SCORE (20 points max)
      // ============================
      // Formula: Higher growth is better

      // Revenue Growth Score: Growth * 60, clamped 0-12
      // 15% growth = 9 points, 20% growth = 12 points (max)
      const revGrowthScore = Math.min(12, Math.max(0, revGrowth * 60));

      // EPS Growth Score: Growth * 40, clamped 0-12
      // 20% growth = 8 points, 30% growth = 12 points (max)
      const epsGrowthScore = Math.min(12, Math.max(0, epsGrowth * 40));

      // FCF Growth Score: Growth * 40, clamped 0-12
      // 20% growth = 8 points, 30% growth = 12 points (max)
      const fcfGrowthScore = Math.min(12, Math.max(0, fcfGrowth * 40));

      // Weighted average * 1.67 to scale to 20 points max
      // Weights: Revenue 40%, EPS 35%, FCF 25%
      const growthScore = (revGrowthScore * 0.40 + epsGrowthScore * 0.35 + fcfGrowthScore * 0.25) * 1.67;

      this.logger.debug('Growth scores calculated', {
        revGrowthScore: revGrowthScore.toFixed(2),
        epsGrowthScore: epsGrowthScore.toFixed(2),
        fcfGrowthScore: fcfGrowthScore.toFixed(2),
        growthScore: growthScore.toFixed(2),
      });

      // ==============================
      // DIVIDEND SCORE (15 points max)
      // ==============================
      // Formula: Reward yield, penalize extreme payout ratios

      let dividendScore = 0;
      let yieldScore = 0;
      let payoutScore = 0;

      if (divYield > 0) {
        // Yield Score: Yield * 300, clamped 0-12
        // 3% yield = 9 points, 4% yield = 12 points (max)
        yieldScore = Math.min(12, divYield * 300);

        // Payout Score: 12 - |Payout - 0.40| * 20, clamped 0-12
        // 40% payout is ideal, penalty for deviation
        payoutScore = Math.max(0, 12 - Math.abs(payoutRatio - 0.40) * 20);

        // Weighted average * 1.25 to scale to 15 points max
        // Weights: Yield 60%, Payout 40%
        dividendScore = (yieldScore * 0.60 + payoutScore * 0.40) * 1.25;
      }

      this.logger.debug('Dividend scores calculated', {
        yieldScore: yieldScore.toFixed(2),
        payoutScore: payoutScore.toFixed(2),
        dividendScore: dividendScore.toFixed(2),
      });

      // ========================
      // MOAT SCORE (10 points max)
      // ========================
      // Directly from AI analysis, clamped 0-10
      const moatFinalScore = Math.min(10, Math.max(0, moatScore));

      this.logger.debug('Moat score', {
        moatScore: moatFinalScore.toFixed(2),
      });

      // =================
      // TOTAL SCORE
      // =================
      const totalScore = Math.round((valuationScore + qualityScore + growthScore + dividendScore + moatFinalScore) * 100) / 100;
      const percentage = (totalScore / 100) * 100;

      // =================
      // CLASSIFICATION
      // =================
      // Matches stage2_scoring.json thresholds
      let classification: string;
      let recommendation: string;

      if (totalScore >= 80) {
        classification = 'Excellent';
        recommendation = 'Strong Buy - Excellent value investment candidate with strong fundamentals';
      } else if (totalScore >= 70) {
        classification = 'Good';
        recommendation = 'Buy - Good value investment with solid metrics';
      } else if (totalScore >= 60) {
        classification = 'Fair';
        recommendation = 'Hold - Fair value, monitor for improvement';
      } else if (totalScore >= 50) {
        classification = 'Below Average';
        recommendation = 'Watch - Below average value metrics, wait for better entry';
      } else {
        classification = 'Poor';
        recommendation = 'Avoid - Poor value metrics, not recommended';
      }

      const executionTime = Date.now() - startTime;

      // Build dimension scores for compatibility with generic interface
      const dimensionScores: DimensionScore[] = [
        {
          dimensionId: 'valuation',
          dimensionName: 'Valuation',
          weight: 0.30,
          maxScore: 30,
          rawScore: Math.round(valuationScore * 100) / 100,
          weightedScore: Math.round(valuationScore * 100) / 100,
          ruleExecutions: [
            { ruleId: 'pe-ratio', field: 'peRatio', inputValue: pe, operator: 'lt', targetValue: 25, passed: pe < 25, rawScore: peScore, normalizedScore: peScore / 12, explanation: `P/E=${pe} → score=${peScore.toFixed(2)}/12` },
            { ruleId: 'pb-ratio', field: 'pbRatio', inputValue: pb, operator: 'lt', targetValue: 5, passed: pb < 5, rawScore: pbScore, normalizedScore: pbScore / 12, explanation: `P/B=${pb} → score=${pbScore.toFixed(2)}/12` },
            { ruleId: 'ev-ebitda', field: 'evEbitda', inputValue: evEbitda, operator: 'lt', targetValue: 20, passed: evEbitda < 20, rawScore: evScore, normalizedScore: evScore / 12, explanation: `EV/EBITDA=${evEbitda} → score=${evScore.toFixed(2)}/12` },
            { ruleId: 'p-fcf', field: 'pFcf', inputValue: pFcf, operator: 'lt', targetValue: 25, passed: pFcf < 25, rawScore: pfcfScore, normalizedScore: pfcfScore / 12, explanation: `P/FCF=${pFcf} → score=${pfcfScore.toFixed(2)}/12` },
          ],
          explanation: `Valuation: ${valuationScore.toFixed(1)}/30 (PE:${peScore.toFixed(1)}, PB:${pbScore.toFixed(1)}, EV:${evScore.toFixed(1)}, FCF:${pfcfScore.toFixed(1)})`,
        },
        {
          dimensionId: 'quality',
          dimensionName: 'Quality',
          weight: 0.25,
          maxScore: 25,
          rawScore: Math.round(qualityScore * 100) / 100,
          weightedScore: Math.round(qualityScore * 100) / 100,
          ruleExecutions: [
            { ruleId: 'roe', field: 'roe', inputValue: roe, operator: 'gt', targetValue: 0, passed: roe > 0, rawScore: roeScore, normalizedScore: roeScore / 12, explanation: `ROE=${(roe * 100).toFixed(1)}% → score=${roeScore.toFixed(2)}/12` },
            { ruleId: 'roic', field: 'roic', inputValue: roic, operator: 'gt', targetValue: 0, passed: roic > 0, rawScore: roicScore, normalizedScore: roicScore / 12, explanation: `ROIC=${(roic * 100).toFixed(1)}% → score=${roicScore.toFixed(2)}/12` },
            { ruleId: 'net-margin', field: 'netMargin', inputValue: netMargin, operator: 'gt', targetValue: 0, passed: netMargin > 0, rawScore: marginScore, normalizedScore: marginScore / 12, explanation: `Margin=${(netMargin * 100).toFixed(1)}% → score=${marginScore.toFixed(2)}/12` },
            { ruleId: 'debt-equity', field: 'debtEquity', inputValue: debtEquity, operator: 'lt', targetValue: 2, passed: debtEquity < 2, rawScore: debtScore, normalizedScore: debtScore / 12, explanation: `D/E=${debtEquity.toFixed(2)} → score=${debtScore.toFixed(2)}/12` },
            { ruleId: 'interest-coverage', field: 'interestCoverage', inputValue: interestCoverage, operator: 'gt', targetValue: 2, passed: interestCoverage > 2, rawScore: coverageScore, normalizedScore: coverageScore / 12, explanation: `Coverage=${interestCoverage.toFixed(1)}x → score=${coverageScore.toFixed(2)}/12` },
          ],
          explanation: `Quality: ${qualityScore.toFixed(1)}/25 (ROE:${roeScore.toFixed(1)}, ROIC:${roicScore.toFixed(1)}, Margin:${marginScore.toFixed(1)}, Debt:${debtScore.toFixed(1)}, Coverage:${coverageScore.toFixed(1)})`,
        },
        {
          dimensionId: 'growth',
          dimensionName: 'Growth',
          weight: 0.20,
          maxScore: 20,
          rawScore: Math.round(growthScore * 100) / 100,
          weightedScore: Math.round(growthScore * 100) / 100,
          ruleExecutions: [
            { ruleId: 'revenue-growth', field: 'revenueGrowth', inputValue: revGrowth, operator: 'gt', targetValue: 0, passed: revGrowth > 0, rawScore: revGrowthScore, normalizedScore: revGrowthScore / 12, explanation: `RevGrowth=${(revGrowth * 100).toFixed(1)}% → score=${revGrowthScore.toFixed(2)}/12` },
            { ruleId: 'eps-growth', field: 'epsGrowth', inputValue: epsGrowth, operator: 'gt', targetValue: 0, passed: epsGrowth > 0, rawScore: epsGrowthScore, normalizedScore: epsGrowthScore / 12, explanation: `EPSGrowth=${(epsGrowth * 100).toFixed(1)}% → score=${epsGrowthScore.toFixed(2)}/12` },
            { ruleId: 'fcf-growth', field: 'fcfGrowth', inputValue: fcfGrowth, operator: 'gt', targetValue: 0, passed: fcfGrowth > 0, rawScore: fcfGrowthScore, normalizedScore: fcfGrowthScore / 12, explanation: `FCFGrowth=${(fcfGrowth * 100).toFixed(1)}% → score=${fcfGrowthScore.toFixed(2)}/12` },
          ],
          explanation: `Growth: ${growthScore.toFixed(1)}/20 (Rev:${revGrowthScore.toFixed(1)}, EPS:${epsGrowthScore.toFixed(1)}, FCF:${fcfGrowthScore.toFixed(1)})`,
        },
        {
          dimensionId: 'dividend',
          dimensionName: 'Dividend',
          weight: 0.15,
          maxScore: 15,
          rawScore: Math.round(dividendScore * 100) / 100,
          weightedScore: Math.round(dividendScore * 100) / 100,
          ruleExecutions: [
            { ruleId: 'dividend-yield', field: 'dividendYield', inputValue: divYield, operator: 'gt', targetValue: 0, passed: divYield > 0, rawScore: yieldScore, normalizedScore: yieldScore / 12, explanation: `Yield=${(divYield * 100).toFixed(2)}% → score=${yieldScore.toFixed(2)}/12` },
            { ruleId: 'payout-ratio', field: 'payoutRatio', inputValue: payoutRatio, operator: 'between', targetValue: [0.2, 0.6], passed: payoutRatio >= 0.2 && payoutRatio <= 0.6, rawScore: payoutScore, normalizedScore: payoutScore / 12, explanation: `Payout=${(payoutRatio * 100).toFixed(1)}% → score=${payoutScore.toFixed(2)}/12` },
          ],
          explanation: `Dividend: ${dividendScore.toFixed(1)}/15 (Yield:${yieldScore.toFixed(1)}, Payout:${payoutScore.toFixed(1)})`,
        },
        {
          dimensionId: 'moat',
          dimensionName: 'Competitive Moat',
          weight: 0.10,
          maxScore: 10,
          rawScore: Math.round(moatFinalScore * 100) / 100,
          weightedScore: Math.round(moatFinalScore * 100) / 100,
          ruleExecutions: [
            { ruleId: 'moat-score', field: 'moatScore', inputValue: moatScore, operator: 'gte', targetValue: 0, passed: true, rawScore: moatFinalScore, normalizedScore: moatFinalScore / 10, explanation: `Moat=${moatFinalScore.toFixed(1)}/10` },
          ],
          explanation: `Moat: ${moatFinalScore.toFixed(1)}/10 (AI-determined competitive advantage)`,
        },
      ];

      // Build explanation
      const explanation = [
        `Total Score: ${totalScore}/100 (${percentage.toFixed(1)}%)`,
        `Classification: ${classification}`,
        ``,
        `Breakdown:`,
        `  Valuation: ${valuationScore.toFixed(1)}/30 (PE:${peScore.toFixed(1)}, PB:${pbScore.toFixed(1)}, EV:${evScore.toFixed(1)}, FCF:${pfcfScore.toFixed(1)})`,
        `  Quality: ${qualityScore.toFixed(1)}/25 (ROE:${roeScore.toFixed(1)}, ROIC:${roicScore.toFixed(1)}, Margin:${marginScore.toFixed(1)}, Debt:${debtScore.toFixed(1)}, Coverage:${coverageScore.toFixed(1)})`,
        `  Growth: ${growthScore.toFixed(1)}/20 (Rev:${revGrowthScore.toFixed(1)}, EPS:${epsGrowthScore.toFixed(1)}, FCF:${fcfGrowthScore.toFixed(1)})`,
        `  Dividend: ${dividendScore.toFixed(1)}/15 (Yield:${yieldScore.toFixed(1)}, Payout:${payoutScore.toFixed(1)})`,
        `  Moat: ${moatFinalScore.toFixed(1)}/10`,
      ].join('\n');

      const result: InvestmentScoringResult = {
        ruleSetId: 'investment-v1',
        ruleSetName: 'Value Investment Scoring (Stage 2 Formula)',
        vertical: 'investment',
        timestamp: new Date().toISOString(),
        scores: {
          dimensions: dimensionScores,
          total: totalScore,
          maxPossible: 100,
          percentage,
        },
        classification,
        recommendation,
        explanation,
        breakdown: {
          valuation: {
            peScore: Math.round(peScore * 100) / 100,
            pbScore: Math.round(pbScore * 100) / 100,
            evScore: Math.round(evScore * 100) / 100,
            pfcfScore: Math.round(pfcfScore * 100) / 100,
            total: Math.round(valuationScore * 100) / 100,
            max: 30,
          },
          quality: {
            roeScore: Math.round(roeScore * 100) / 100,
            roicScore: Math.round(roicScore * 100) / 100,
            marginScore: Math.round(marginScore * 100) / 100,
            debtScore: Math.round(debtScore * 100) / 100,
            coverageScore: Math.round(coverageScore * 100) / 100,
            total: Math.round(qualityScore * 100) / 100,
            max: 25,
          },
          growth: {
            revGrowthScore: Math.round(revGrowthScore * 100) / 100,
            epsGrowthScore: Math.round(epsGrowthScore * 100) / 100,
            fcfGrowthScore: Math.round(fcfGrowthScore * 100) / 100,
            total: Math.round(growthScore * 100) / 100,
            max: 20,
          },
          dividend: {
            yieldScore: Math.round(yieldScore * 100) / 100,
            payoutScore: Math.round(payoutScore * 100) / 100,
            total: Math.round(dividendScore * 100) / 100,
            max: 15,
          },
          moat: {
            score: Math.round(moatFinalScore * 100) / 100,
            max: 10,
          },
        },
      };

      // Add debug info if requested
      if (debugMode) {
        result.debugInfo = {
          inputData,
          ruleSetVersion: '2.0.0-stage2-aligned',
          executionTime_ms: executionTime,
        };
      }

      span.setAttributes({
        totalScore,
        classification,
        executionTime_ms: executionTime,
      });

      this.logger.info('Investment scoring complete', {
        operation: 'scoreInvestment',
        totalScore,
        classification,
        executionTime_ms: executionTime,
      });

      return result;
    });
  }

  /**
   * Generic score method - routes to appropriate scorer based on vertical
   */
  score(
    data: Record<string, unknown>,
    ruleSetId: string,
    context?: Record<string, unknown>,
    debugMode: boolean = false
  ): ScoringResult {
    // For investment-v1, use the specialized scorer
    if (ruleSetId === 'investment-v1') {
      return this.scoreInvestment(data, debugMode);
    }

    // Otherwise, use generic config-based scoring
    return this.scoreGeneric(data, ruleSetId, context, debugMode);
  }

  /**
   * Generic config-based scoring (for non-investment verticals)
   */
  private scoreGeneric(
    data: Record<string, unknown>,
    ruleSetId: string,
    context?: Record<string, unknown>,
    debugMode: boolean = false
  ): ScoringResult {
    return this.tracer.withSpanSync('scoreGeneric', (span) => {
      const startTime = Date.now();

      span.setAttributes({
        ruleSetId,
        debugMode,
        dataKeys: Object.keys(data).length,
      });

      this.logger.info('Starting generic scoring', {
        operation: 'scoreGeneric',
        ruleSetId,
        dataKeys: Object.keys(data).length,
      });

      // Get rule set
      const ruleSet = this.ruleSets.get(ruleSetId);
      if (!ruleSet) {
        span.setStatus(SpanStatus.ERROR, `Rule set not found: ${ruleSetId}`);
        throw new Error(`Rule set not found: ${ruleSetId}`);
      }

      // Score each dimension
      const dimensionScores: DimensionScore[] = [];
      let totalScore = 0;

      for (const dimension of ruleSet.dimensions) {
        const dimensionScore = this.scoreDimension(dimension, data);
        dimensionScores.push(dimensionScore);

        this.logger.debug(`Dimension scored: ${dimension.name}`, {
          dimensionId: dimension.id,
          rawScore: dimensionScore.rawScore,
          weightedScore: dimensionScore.weightedScore,
        });

        // Aggregate dimension scores
        switch (ruleSet.aggregation) {
          case 'weighted_average':
            totalScore += dimensionScore.weightedScore;
            break;
          case 'sum':
            totalScore += dimensionScore.rawScore;
            break;
          case 'max':
            totalScore = Math.max(totalScore, dimensionScore.rawScore);
            break;
        }
      }

      // Round total score
      totalScore = Math.round(totalScore * 100) / 100;

      // Get classification
      const { name: classification, recommendation } = this.classify(totalScore, ruleSet.classifications);

      // Build explanation
      const dimensionSummaries = dimensionScores.map(d => `${d.dimensionName}: ${d.rawScore.toFixed(1)}/${d.maxScore}`);
      const explanation = `Total Score: ${totalScore}/${ruleSet.totalMaxScore} (${(totalScore / ruleSet.totalMaxScore * 100).toFixed(1)}%)\n` +
        `Classification: ${classification}\n` +
        `Dimensions: ${dimensionSummaries.join(', ')}`;

      const executionTime = Date.now() - startTime;

      const result: ScoringResult = {
        ruleSetId: ruleSet.id,
        ruleSetName: ruleSet.name,
        vertical: ruleSet.vertical,
        timestamp: new Date().toISOString(),
        scores: {
          dimensions: dimensionScores,
          total: totalScore,
          maxPossible: ruleSet.totalMaxScore,
          percentage: (totalScore / ruleSet.totalMaxScore) * 100,
        },
        classification,
        recommendation,
        explanation,
      };

      if (debugMode) {
        result.debugInfo = {
          inputData: data,
          ruleSetVersion: ruleSet.version,
          executionTime_ms: executionTime,
        };
      }

      span.setAttributes({
        totalScore,
        classification,
        executionTime_ms: executionTime,
      });

      this.logger.info('Generic scoring complete', {
        operation: 'scoreGeneric',
        ruleSetId,
        totalScore,
        classification,
        executionTime_ms: executionTime,
      });

      return result;
    });
  }

  /**
   * Evaluate a rule operator
   */
  private evaluateOperator(value: number, operator: RuleOperator, target: Rule['value']): boolean {
    switch (operator) {
      case 'lt':
        return value < (target as number);
      case 'lte':
        return value <= (target as number);
      case 'gt':
        return value > (target as number);
      case 'gte':
        return value >= (target as number);
      case 'eq':
        return value === (target as number);
      case 'neq':
        return value !== (target as number);
      case 'between':
        const [min, max] = target as [number, number];
        return value >= min && value <= max;
      case 'in':
        return (target as number[]).includes(value);
      default:
        return false;
    }
  }

  /**
   * Calculate score using formula
   */
  private calculateScore(value: number, formula: string, maxScore: number, minScore: number = 0): number {
    try {
      const expression = formula.replace(/\bvalue\b/g, value.toString());
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${expression}`)() as number;
      return Math.max(minScore, Math.min(maxScore, result));
    } catch (error) {
      this.logger.warn('Score formula evaluation failed', { formula, value, error: (error as Error).message });
      return 0;
    }
  }

  /**
   * Execute a single rule
   */
  private executeRule(rule: Rule, data: Record<string, unknown>): RuleExecution {
    const inputValue = this.getValue(data, rule.field, 0);

    if (inputValue === null || inputValue === undefined) {
      return {
        ruleId: rule.id,
        field: rule.field,
        inputValue: null,
        operator: rule.operator,
        targetValue: rule.value,
        passed: false,
        rawScore: 0,
        normalizedScore: 0,
        explanation: `Missing or invalid value for field '${rule.field}'`,
      };
    }

    const passed = this.evaluateOperator(inputValue, rule.operator, rule.value);
    const rawScore = this.calculateScore(inputValue, rule.scoreFormula, rule.maxScore, rule.minScore || 0);
    const normalizedScore = rawScore / rule.maxScore;

    return {
      ruleId: rule.id,
      field: rule.field,
      inputValue,
      operator: rule.operator,
      targetValue: rule.value,
      passed,
      rawScore,
      normalizedScore,
      explanation: `${rule.field}=${inputValue} ${rule.operator} ${JSON.stringify(rule.value)} -> score: ${rawScore.toFixed(2)}/${rule.maxScore}`,
    };
  }

  /**
   * Score a dimension
   */
  private scoreDimension(dimension: Dimension, data: Record<string, unknown>): DimensionScore {
    const ruleExecutions: RuleExecution[] = [];
    let totalRawScore = 0;
    const baseRuleMaxScore = 12; // Standard rule max score

    for (const rule of dimension.rules) {
      const execution = this.executeRule(rule, data);
      ruleExecutions.push(execution);

      const ruleWeight = dimension.ruleWeights?.[rule.id] || 1 / dimension.rules.length;

      switch (dimension.aggregation) {
        case 'weighted_sum':
          totalRawScore += execution.rawScore * ruleWeight;
          break;
        case 'average':
          totalRawScore += execution.rawScore / dimension.rules.length;
          break;
        case 'max':
          totalRawScore = Math.max(totalRawScore, execution.rawScore);
          break;
        case 'min':
          if (totalRawScore === 0) {
            totalRawScore = execution.rawScore;
          } else {
            totalRawScore = Math.min(totalRawScore, execution.rawScore);
          }
          break;
      }
    }

    // Scale to dimension max score (weighted average gives 0-12, scale to maxScore)
    const multiplier = dimension.maxScore / baseRuleMaxScore;
    const rawScore = Math.min(dimension.maxScore, totalRawScore * multiplier);
    const weightedScore = rawScore * dimension.weight;

    const passedRules = ruleExecutions.filter(r => r.passed).length;
    const explanation = `${dimension.name}: ${rawScore.toFixed(2)}/${dimension.maxScore} (${passedRules}/${dimension.rules.length} rules passed)`;

    return {
      dimensionId: dimension.id,
      dimensionName: dimension.name,
      weight: dimension.weight,
      maxScore: dimension.maxScore,
      rawScore: Math.round(rawScore * 100) / 100,
      weightedScore: Math.round(weightedScore * 100) / 100,
      ruleExecutions,
      explanation,
    };
  }

  /**
   * Determine classification based on score
   */
  private classify(score: number, classifications: Classification[]): { name: string; recommendation: string } {
    for (const classification of classifications) {
      if (score >= classification.minScore && score <= classification.maxScore) {
        return {
          name: classification.name,
          recommendation: classification.recommendation || classification.name,
        };
      }
    }

    return { name: 'Unclassified', recommendation: 'Review manually' };
  }

  /**
   * Validate data has required fields for a rule set
   */
  validateData(data: Record<string, unknown>, ruleSetId: string): { valid: boolean; missingFields: string[] } {
    const ruleSet = this.ruleSets.get(ruleSetId);
    if (!ruleSet) {
      throw new Error(`Rule set not found: ${ruleSetId}`);
    }

    const missingFields: string[] = [];

    for (const dimension of ruleSet.dimensions) {
      for (const rule of dimension.rules) {
        const value = this.getValue(data, rule.field, NaN);
        if (isNaN(value)) {
          missingFields.push(rule.field);
        }
      }
    }

    return {
      valid: missingFields.length === 0,
      missingFields: [...new Set(missingFields)],
    };
  }
}

// Default instance
export const ruleEngine = new RuleEngine();

export default ruleEngine;
