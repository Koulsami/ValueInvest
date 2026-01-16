import { Logger } from '../lib/logger';
import { Tracer } from '../lib/tracer';
import { Materiality } from './change-detector';

// Review tiers
export type ReviewTier = 1 | 2 | 3 | 4;

// Urgency levels
export type Urgency = 'critical' | 'high' | 'normal' | 'low';

// Client tiers
export type ClientTier = 'enterprise' | 'premium' | 'standard' | 'basic';

// Reviewer role
export interface Reviewer {
  role: string;
  level: 'junior' | 'senior' | 'manager' | 'executive';
  skills?: string[];
}

// Tier configuration
export interface TierConfig {
  tier: ReviewTier;
  name: string;
  description: string;
  slaHours: number;
  autoApproveEligible: boolean;
  requiredReviewers: Reviewer[];
  notificationChannel: string;
}

// Default tier configurations by vertical
const DEFAULT_TIER_CONFIGS: Record<string, TierConfig[]> = {
  investment: [
    {
      tier: 1,
      name: 'Auto-Approve',
      description: 'Low impact changes with high confidence',
      slaHours: 0,
      autoApproveEligible: true,
      requiredReviewers: [],
      notificationChannel: 'automated',
    },
    {
      tier: 2,
      name: 'Standard Review',
      description: 'Routine changes requiring analyst review',
      slaHours: 24,
      autoApproveEligible: false,
      requiredReviewers: [{ role: 'analyst', level: 'junior' }],
      notificationChannel: 'slack-analysis',
    },
    {
      tier: 3,
      name: 'Senior Review',
      description: 'High impact changes requiring senior oversight',
      slaHours: 48,
      autoApproveEligible: false,
      requiredReviewers: [
        { role: 'analyst', level: 'senior' },
        { role: 'analyst', level: 'junior' },
      ],
      notificationChannel: 'slack-senior',
    },
    {
      tier: 4,
      name: 'Exception Handling',
      description: 'Critical changes requiring executive approval',
      slaHours: 72,
      autoApproveEligible: false,
      requiredReviewers: [
        { role: 'manager', level: 'manager' },
        { role: 'analyst', level: 'senior' },
      ],
      notificationChannel: 'slack-escalation',
    },
  ],
  legal: [
    {
      tier: 1,
      name: 'Auto-Approve',
      description: 'Minor cost adjustments within tolerance',
      slaHours: 0,
      autoApproveEligible: true,
      requiredReviewers: [],
      notificationChannel: 'automated',
    },
    {
      tier: 2,
      name: 'Paralegal Review',
      description: 'Standard cost changes',
      slaHours: 8,
      autoApproveEligible: false,
      requiredReviewers: [{ role: 'paralegal', level: 'junior' }],
      notificationChannel: 'email-legal-team',
    },
    {
      tier: 3,
      name: 'Associate Review',
      description: 'Significant cost changes',
      slaHours: 24,
      autoApproveEligible: false,
      requiredReviewers: [{ role: 'associate', level: 'senior' }],
      notificationChannel: 'email-associates',
    },
    {
      tier: 4,
      name: 'Partner Review',
      description: 'Major cost disputes or exceptions',
      slaHours: 48,
      autoApproveEligible: false,
      requiredReviewers: [{ role: 'partner', level: 'executive' }],
      notificationChannel: 'email-partners',
    },
  ],
};

// Auto-approve rules
interface AutoApproveRule {
  condition: 'impact_below' | 'confidence_above' | 'materiality_is' | 'client_tier_is';
  value: number | string | string[];
}

// Routing context
export interface RoutingContext {
  urgency?: Urgency;
  clientTier?: ClientTier;
  vertical?: string;
  customRules?: AutoApproveRule[];
  confidence?: number;
}

// Change input for routing
export interface ChangeInput {
  impactScore: number;
  materiality: Materiality;
  changesCount: number;
  affectedPaths: string[];
}

// Routing result
export interface RoutingResult {
  tier: ReviewTier;
  tierConfig: TierConfig;
  reviewers: Reviewer[];
  channel: string;
  slaHours: number;
  autoApprove: boolean;
  reasoning: string[];
  timestamp: string;
}

// Tier Router class
export class TierRouter {
  private logger: Logger;
  private tracer: Tracer;
  private tierConfigs: Record<string, TierConfig[]>;

  constructor(logger?: Logger) {
    this.logger = logger || new Logger(undefined, { service: 'reasonex-core-api', node: 'TierRouter' });
    this.tracer = new Tracer('TierRouter', this.logger);
    this.tierConfigs = { ...DEFAULT_TIER_CONFIGS };
  }

  /**
   * Register custom tier configuration for a vertical
   */
  registerTierConfig(vertical: string, configs: TierConfig[]): void {
    this.tierConfigs[vertical] = configs;
    this.logger.info(`Registered tier config for vertical: ${vertical}`);
  }

  /**
   * Get tier configurations for a vertical
   */
  getTierConfigs(vertical: string): TierConfig[] {
    return this.tierConfigs[vertical] || this.tierConfigs['investment'];
  }

  /**
   * Check auto-approve eligibility
   */
  private checkAutoApprove(
    change: ChangeInput,
    context: RoutingContext
  ): { eligible: boolean; reasons: string[] } {
    const reasons: string[] = [];
    let eligible = true;

    // Default rules
    const rules: AutoApproveRule[] = context.customRules || [
      { condition: 'impact_below', value: 20 },
      { condition: 'materiality_is', value: ['LOW'] },
      { condition: 'confidence_above', value: 0.9 },
    ];

    for (const rule of rules) {
      switch (rule.condition) {
        case 'impact_below':
          if (change.impactScore >= (rule.value as number)) {
            eligible = false;
            reasons.push(`Impact score ${change.impactScore} >= threshold ${rule.value}`);
          } else {
            reasons.push(`Impact score ${change.impactScore} < threshold ${rule.value}`);
          }
          break;

        case 'confidence_above':
          const confidence = context.confidence || 0;
          if (confidence < (rule.value as number)) {
            eligible = false;
            reasons.push(`Confidence ${confidence} < threshold ${rule.value}`);
          } else {
            reasons.push(`Confidence ${confidence} >= threshold ${rule.value}`);
          }
          break;

        case 'materiality_is':
          const allowedMateriality = rule.value as string[];
          if (!allowedMateriality.includes(change.materiality)) {
            eligible = false;
            reasons.push(`Materiality ${change.materiality} not in allowed list`);
          } else {
            reasons.push(`Materiality ${change.materiality} is acceptable`);
          }
          break;

        case 'client_tier_is':
          const allowedClientTiers = rule.value as string[];
          if (context.clientTier && !allowedClientTiers.includes(context.clientTier)) {
            eligible = false;
            reasons.push(`Client tier ${context.clientTier} requires manual review`);
          }
          break;
      }
    }

    return { eligible, reasons };
  }

  /**
   * Determine review tier based on change and context
   */
  private determineTier(
    change: ChangeInput,
    context: RoutingContext
  ): { tier: ReviewTier; reasons: string[] } {
    const reasons: string[] = [];

    // Check for critical urgency
    if (context.urgency === 'critical') {
      reasons.push('Critical urgency escalates to Tier 4');
      return { tier: 4, reasons };
    }

    // Check for enterprise client
    if (context.clientTier === 'enterprise') {
      reasons.push('Enterprise client requires at least Tier 3 review');
      const tier = change.materiality === 'HIGH' ? 4 : 3;
      return { tier: tier as ReviewTier, reasons };
    }

    // Determine tier based on materiality and impact
    if (change.materiality === 'HIGH' || change.impactScore >= 70) {
      reasons.push(`High materiality (${change.materiality}) or impact (${change.impactScore})`);
      return { tier: 4, reasons };
    }

    if (change.materiality === 'MEDIUM' || change.impactScore >= 30) {
      reasons.push(`Medium materiality (${change.materiality}) or impact (${change.impactScore})`);

      // Check urgency for potential escalation
      if (context.urgency === 'high') {
        reasons.push('High urgency escalates to Tier 3');
        return { tier: 3, reasons };
      }

      return { tier: 2, reasons };
    }

    // Low materiality - check for auto-approve
    reasons.push(`Low materiality (${change.materiality}) and impact (${change.impactScore})`);

    const autoApproveCheck = this.checkAutoApprove(change, context);
    if (autoApproveCheck.eligible) {
      reasons.push('Eligible for auto-approve (Tier 1)');
      reasons.push(...autoApproveCheck.reasons);
      return { tier: 1, reasons };
    }

    reasons.push('Not eligible for auto-approve');
    reasons.push(...autoApproveCheck.reasons);
    return { tier: 2, reasons };
  }

  /**
   * Route a change to appropriate review tier
   */
  route(
    change: ChangeInput,
    context: RoutingContext = {}
  ): RoutingResult {
    return this.tracer.withSpanSync('route', (span) => {
      const vertical = context.vertical || 'investment';

      span.setAttributes({
        vertical,
        impactScore: change.impactScore,
        materiality: change.materiality,
        urgency: context.urgency || 'normal',
        clientTier: context.clientTier || 'standard',
      });

      this.logger.info('Routing change for review', {
        operation: 'route',
        vertical,
        impactScore: change.impactScore,
        materiality: change.materiality,
      });

      // Determine tier
      const { tier, reasons } = this.determineTier(change, context);

      // Get tier configuration
      const configs = this.getTierConfigs(vertical);
      const tierConfig = configs.find(c => c.tier === tier) || configs[tier - 1];

      // Check auto-approve for tier 1
      const autoApprove = tier === 1 && tierConfig.autoApproveEligible;

      // Adjust SLA based on urgency
      let slaHours = tierConfig.slaHours;
      if (context.urgency === 'critical') {
        slaHours = Math.max(1, Math.floor(slaHours / 4));
        reasons.push(`SLA reduced due to critical urgency: ${slaHours}h`);
      } else if (context.urgency === 'high') {
        slaHours = Math.max(2, Math.floor(slaHours / 2));
        reasons.push(`SLA reduced due to high urgency: ${slaHours}h`);
      }

      const result: RoutingResult = {
        tier,
        tierConfig,
        reviewers: tierConfig.requiredReviewers,
        channel: tierConfig.notificationChannel,
        slaHours,
        autoApprove,
        reasoning: reasons,
        timestamp: new Date().toISOString(),
      };

      span.setAttributes({
        tier,
        autoApprove,
        slaHours,
        reviewerCount: result.reviewers.length,
      });

      this.logger.info('Routing complete', {
        operation: 'route',
        tier,
        autoApprove,
        slaHours,
        channel: result.channel,
      });

      return result;
    });
  }
}

// Default instance
export const tierRouter = new TierRouter();

export default tierRouter;
