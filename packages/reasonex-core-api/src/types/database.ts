/**
 * Database entity types for Reasonex Core API
 * Phase 2b: Database Integration
 */

// Enums
export enum AnalysisStatus {
  DRAFT = 'DRAFT',
  SCORED = 'SCORED',
  LOCKED = 'LOCKED',
  VALIDATED = 'VALIDATED',
  APPROVED = 'APPROVED',
  SUPERSEDED = 'SUPERSEDED',
  REJECTED = 'REJECTED',
}

export enum ValidationStatus {
  PASS = 'PASS',
  FLAG = 'FLAG',
  FAIL = 'FAIL',
}

export enum CheckStatus {
  PASS = 'PASS',
  FLAG = 'FLAG',
  FAIL = 'FAIL',
}

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED',
}

// Database entity interfaces
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
  ruleSetId: string;
  ruleSetVersion: string;
  dimension: string;
  ruleId: string;
  fieldName: string;
  inputValue: number | null;
  outputScore: number;
  maxScore: number;
  weight: number;
  passed: boolean;
  explanation: string | null;
  executedAt: Date;
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
  eventType: string;
  eventCategory: string;
  entityType: string | null;
  entityId: string | null;
  actorType: string;
  actorId: string | null;
  action: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  correlationId: string | null;
  traceId: string | null;
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

// Create/Update DTOs
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
  ruleSetId: string;
  ruleSetVersion: string;
  dimension: string;
  ruleId: string;
  fieldName: string;
  inputValue: number | null;
  outputScore: number;
  maxScore: number;
  weight: number;
  passed: boolean;
  explanation: string | null;
}

export interface CreateValidationResultInput {
  analysisId: string;
  checkName: string;
  status: CheckStatus;
  details: Record<string, unknown>;
}

// API Response types
export interface CompanyWithMarketData extends Company {
  latestMarketData?: MarketData | null;
}

export interface AnalysisWithCompany extends Analysis {
  companyTicker?: string;
  companyName?: string;
}

// Query params
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

// ============================================
// Phase 3: Rule Development Workbench Types
// ============================================

// Phase 3 Enums
export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum DocumentUploadStatus {
  UPLOADING = 'UPLOADING',
  INDEXED = 'INDEXED',
  FAILED = 'FAILED',
}

export enum WorkbenchDocumentType {
  REGULATION = 'REGULATION',
  GUIDELINE = 'GUIDELINE',
  PRECEDENT = 'PRECEDENT',
  REFERENCE = 'REFERENCE',
}

export enum ConfidenceLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum RuleValidationStatus {
  DRAFT = 'DRAFT',
  VALIDATED = 'VALIDATED',
  DEPLOYED = 'DEPLOYED',
}

// Phase 3 Entity Interfaces
export interface ResearchSession {
  id: string;
  vertical: string;
  expertName: string | null;
  description: string | null;
  status: SessionStatus;
  documentCount: number;
  queryCount: number;
  ruleCount: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDocument {
  id: string;
  sessionId: string;
  geminiFileUri: string | null;
  geminiFileName: string | null;
  displayName: string;
  originalFilename: string | null;
  documentType: WorkbenchDocumentType;
  mimeType: string | null;
  fileSizeBytes: number | null;
  pageCount: number | null;
  uploadStatus: DocumentUploadStatus;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  uploadedAt: Date;
}

export interface ResearchQuery {
  id: string;
  sessionId: string;
  queryText: string;
  responseText: string | null;
  findings: ResearchFinding[];
  citations: Citation[];
  confidence: ConfidenceLevel | null;
  tokensUsed: number | null;
  processingTimeMs: number | null;
  errorMessage: string | null;
  queriedAt: Date;
}

export interface ResearchFinding {
  finding: string;
  quote: string;
  source: string;
  confidence: ConfidenceLevel;
  exceptions: string;
}

export interface Citation {
  documentId: string;
  documentName: string;
  page?: number;
  section?: string;
  text: string;
}

export interface DraftRule {
  id: string;
  sessionId: string;
  ruleId: string;
  name: string;
  category: string | null;
  ruleType: string | null;
  ruleDefinition: Record<string, unknown>;
  ruleYaml: string | null;
  sourceQueryIds: string[];
  validationStatus: RuleValidationStatus;
  testPassCount: number;
  testFailCount: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleTestCase {
  id: string;
  sessionId: string;
  name: string;
  description: string | null;
  inputs: Record<string, unknown>;
  expectedOutputs: Record<string, unknown>;
  actualOutputs: Record<string, unknown> | null;
  passed: boolean | null;
  errorMessage: string | null;
  executionTimeMs: number | null;
  testedAt: Date | null;
  createdAt: Date;
}

export interface ExportedRuleSet {
  id: string;
  sessionId: string;
  ruleSetId: string;
  name: string;
  version: string;
  vertical: string;
  yamlContent: string;
  filePath: string | null;
  ruleCount: number | null;
  testCaseCount: number | null;
  passRate: number | null;
  deployedAt: Date | null;
  deployedTo: string | null;
  createdAt: Date;
}

// Phase 3 Create/Update DTOs
export interface CreateResearchSessionInput {
  vertical: string;
  expertName?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateSessionDocumentInput {
  sessionId: string;
  geminiFileUri?: string;
  geminiFileName?: string;
  displayName: string;
  originalFilename?: string;
  documentType?: WorkbenchDocumentType;
  mimeType?: string;
  fileSizeBytes?: number;
  pageCount?: number;
}

export interface CreateResearchQueryInput {
  sessionId: string;
  queryText: string;
}

export interface CreateDraftRuleInput {
  sessionId: string;
  ruleId: string;
  name: string;
  category?: string;
  ruleType?: string;
  ruleDefinition: Record<string, unknown>;
  ruleYaml?: string;
  sourceQueryIds?: string[];
}

export interface UpdateDraftRuleInput {
  name?: string;
  category?: string;
  ruleType?: string;
  ruleDefinition?: Record<string, unknown>;
  ruleYaml?: string;
  notes?: string;
}

export interface CreateRuleTestCaseInput {
  sessionId: string;
  name: string;
  description?: string;
  inputs: Record<string, unknown>;
  expectedOutputs: Record<string, unknown>;
}

export interface ListSessionsParams {
  vertical?: string;
  status?: SessionStatus;
  limit?: number;
  offset?: number;
}
