/**
 * Database entity types for Reasonex Core API
 * Phase 2b: Database Integration
 */
export declare enum AnalysisStatus {
    DRAFT = "DRAFT",
    SCORED = "SCORED",
    LOCKED = "LOCKED",
    VALIDATED = "VALIDATED",
    APPROVED = "APPROVED",
    SUPERSEDED = "SUPERSEDED",
    REJECTED = "REJECTED"
}
export declare enum ValidationStatus {
    PENDING = "PENDING",
    PASSED = "PASSED",
    FLAGGED = "FLAGGED",
    FAILED = "FAILED"
}
export declare enum CheckStatus {
    PASS = "PASS",
    FLAG = "FLAG",
    FAIL = "FAIL"
}
export declare enum CompanyStatus {
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    ARCHIVED = "ARCHIVED"
}
export interface Company {
    id: string;
    ticker: string;
    name: string;
    sector: string | null;
    industry: string | null;
    country: string;
    exchange: string | null;
    status: CompanyStatus;
    priority: number;
    trackingSince: Date;
    lastAnalysisAt: Date | null;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export interface Analysis {
    id: string;
    companyId: string | null;
    version: number;
    isCurrent: boolean;
    status: AnalysisStatus;
    treeData: Record<string, unknown>;
    moatScore: number | null;
    valuationScore: number | null;
    qualityScore: number | null;
    growthScore: number | null;
    dividendScore: number | null;
    overallScore: number | null;
    classification: string | null;
    recommendation: string | null;
    validationStatus: ValidationStatus | null;
    confidenceScore: number | null;
    dataHash: string | null;
    lockId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface RuleExecution {
    id: string;
    analysisId: string;
    ruleId: string;
    ruleName: string;
    category: string;
    inputValue: number | string | null;
    thresholdUsed: string | null;
    resultClassification: string;
    scoreAwarded: number;
    executionTimeMs: number;
    createdAt: Date;
}
export interface ValidationResult {
    id: string;
    analysisId: string;
    checkName: string;
    status: CheckStatus;
    details: Record<string, unknown>;
    executedAt: Date;
}
export interface AuditLogEntry {
    id: string;
    tableName: string;
    recordId: string;
    action: string;
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
    userId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}
export interface MarketData {
    id: string;
    companyId: string;
    date: Date;
    closePrice: number | null;
    marketCap: number | null;
    peRatio: number | null;
    pbRatio: number | null;
    evEbitda: number | null;
    pFcf: number | null;
    dividendYield: number | null;
    roe: number | null;
    roic: number | null;
    netMargin: number | null;
    debtEquity: number | null;
    interestCoverage: number | null;
    revenueGrowth: number | null;
    epsGrowth: number | null;
    fcfGrowth: number | null;
}
export interface CreateAnalysisInput {
    companyId?: string;
    treeData?: Record<string, unknown>;
    status?: AnalysisStatus;
}
export interface UpdateAnalysisScoresInput {
    moatScore: number | null;
    valuationScore: number | null;
    qualityScore: number | null;
    growthScore: number | null;
    dividendScore: number | null;
    overallScore: number | null;
    classification: string | null;
    recommendation: string | null;
}
export interface CreateRuleExecutionInput {
    analysisId: string;
    ruleId: string;
    ruleName: string;
    category: string;
    inputValue: number | string | null;
    thresholdUsed: string | null;
    resultClassification: string;
    scoreAwarded: number;
    executionTimeMs: number;
}
export interface CreateValidationResultInput {
    analysisId: string;
    checkName: string;
    status: CheckStatus;
    details: Record<string, unknown>;
}
export interface CompanyWithMarketData extends Company {
    latestMarketData?: MarketData | null;
}
export interface AnalysisWithCompany extends Analysis {
    companyTicker?: string;
    companyName?: string;
}
export interface ListCompaniesParams {
    status?: CompanyStatus;
    sector?: string;
    limit?: number;
    offset?: number;
    sort?: 'ticker' | 'name' | 'priority' | 'last_analysis_at';
}
export interface ListAnalysesParams {
    status?: AnalysisStatus;
    limit?: number;
    offset?: number;
}
//# sourceMappingURL=database.d.ts.map