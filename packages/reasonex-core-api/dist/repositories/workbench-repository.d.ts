/**
 * Workbench Repository - Database operations for Phase 3 Rule Development Workbench
 */
import { PoolClient } from 'pg';
import { ResearchSession, SessionDocument, ResearchQuery, DraftRule, RuleTestCase, ExportedRuleSet, SessionStatus, DocumentUploadStatus, ConfidenceLevel, RuleValidationStatus, CreateResearchSessionInput, CreateSessionDocumentInput, CreateResearchQueryInput, CreateDraftRuleInput, UpdateDraftRuleInput, CreateRuleTestCaseInput, ListSessionsParams, ResearchFinding, Citation } from '../types/database';
export declare class WorkbenchRepository {
    private db;
    createSession(input: CreateResearchSessionInput, client?: PoolClient): Promise<ResearchSession>;
    findSessionById(id: string): Promise<ResearchSession | null>;
    listSessions(params?: ListSessionsParams): Promise<{
        sessions: ResearchSession[];
        total: number;
    }>;
    updateSessionStatus(id: string, status: SessionStatus, client?: PoolClient): Promise<ResearchSession | null>;
    createDocument(input: CreateSessionDocumentInput, client?: PoolClient): Promise<SessionDocument>;
    updateDocumentStatus(id: string, status: DocumentUploadStatus, geminiFileUri?: string, geminiFileName?: string, errorMessage?: string, client?: PoolClient): Promise<SessionDocument | null>;
    findDocumentsBySessionId(sessionId: string): Promise<SessionDocument[]>;
    findDocumentById(id: string): Promise<SessionDocument | null>;
    deleteDocument(id: string, client?: PoolClient): Promise<boolean>;
    createQuery(input: CreateResearchQueryInput, client?: PoolClient): Promise<ResearchQuery>;
    updateQueryResponse(id: string, responseText: string, findings: ResearchFinding[], citations: Citation[], confidence: ConfidenceLevel, tokensUsed: number, processingTimeMs: number, errorMessage?: string, client?: PoolClient): Promise<ResearchQuery | null>;
    findQueriesBySessionId(sessionId: string): Promise<ResearchQuery[]>;
    findQueryById(id: string): Promise<ResearchQuery | null>;
    createDraftRule(input: CreateDraftRuleInput, client?: PoolClient): Promise<DraftRule>;
    updateDraftRule(id: string, input: UpdateDraftRuleInput, client?: PoolClient): Promise<DraftRule | null>;
    updateDraftRuleStatus(id: string, status: RuleValidationStatus, client?: PoolClient): Promise<DraftRule | null>;
    updateDraftRuleTestCounts(id: string, passCount: number, failCount: number, client?: PoolClient): Promise<DraftRule | null>;
    findDraftRulesBySessionId(sessionId: string): Promise<DraftRule[]>;
    findDraftRuleById(id: string): Promise<DraftRule | null>;
    deleteDraftRule(id: string, client?: PoolClient): Promise<boolean>;
    createTestCase(input: CreateRuleTestCaseInput, client?: PoolClient): Promise<RuleTestCase>;
    updateTestCaseResult(id: string, actualOutputs: Record<string, unknown>, passed: boolean, executionTimeMs: number, errorMessage?: string, client?: PoolClient): Promise<RuleTestCase | null>;
    findTestCasesBySessionId(sessionId: string): Promise<RuleTestCase[]>;
    findTestCaseById(id: string): Promise<RuleTestCase | null>;
    deleteTestCase(id: string, client?: PoolClient): Promise<boolean>;
    createExportedRuleSet(sessionId: string, ruleSetId: string, name: string, version: string, vertical: string, yamlContent: string, ruleCount: number, testCaseCount: number, passRate: number, filePath?: string, client?: PoolClient): Promise<ExportedRuleSet>;
    updateDeployment(id: string, deployedTo: string, client?: PoolClient): Promise<ExportedRuleSet | null>;
    findExportedRuleSetsBySessionId(sessionId: string): Promise<ExportedRuleSet[]>;
    findExportedRuleSetById(id: string): Promise<ExportedRuleSet | null>;
}
export declare const workbenchRepository: WorkbenchRepository;
//# sourceMappingURL=workbench-repository.d.ts.map