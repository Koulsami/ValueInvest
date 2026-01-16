import { Logger } from '../lib/logger';
import { Materiality } from './change-detector';
export type ReviewTier = 1 | 2 | 3 | 4;
export type Urgency = 'critical' | 'high' | 'normal' | 'low';
export type ClientTier = 'enterprise' | 'premium' | 'standard' | 'basic';
export interface Reviewer {
    role: string;
    level: 'junior' | 'senior' | 'manager' | 'executive';
    skills?: string[];
}
export interface TierConfig {
    tier: ReviewTier;
    name: string;
    description: string;
    slaHours: number;
    autoApproveEligible: boolean;
    requiredReviewers: Reviewer[];
    notificationChannel: string;
}
interface AutoApproveRule {
    condition: 'impact_below' | 'confidence_above' | 'materiality_is' | 'client_tier_is';
    value: number | string | string[];
}
export interface RoutingContext {
    urgency?: Urgency;
    clientTier?: ClientTier;
    vertical?: string;
    customRules?: AutoApproveRule[];
    confidence?: number;
}
export interface ChangeInput {
    impactScore: number;
    materiality: Materiality;
    changesCount: number;
    affectedPaths: string[];
}
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
export declare class TierRouter {
    private logger;
    private tracer;
    private tierConfigs;
    constructor(logger?: Logger);
    /**
     * Register custom tier configuration for a vertical
     */
    registerTierConfig(vertical: string, configs: TierConfig[]): void;
    /**
     * Get tier configurations for a vertical
     */
    getTierConfigs(vertical: string): TierConfig[];
    /**
     * Check auto-approve eligibility
     */
    private checkAutoApprove;
    /**
     * Determine review tier based on change and context
     */
    private determineTier;
    /**
     * Route a change to appropriate review tier
     */
    route(change: ChangeInput, context?: RoutingContext): RoutingResult;
}
export declare const tierRouter: TierRouter;
export default tierRouter;
//# sourceMappingURL=tier-router.d.ts.map