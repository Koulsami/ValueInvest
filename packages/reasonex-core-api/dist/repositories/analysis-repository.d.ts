/**
 * Analysis Repository - Database operations for analyses
 * Phase 2b: Database Integration
 */
import { PoolClient } from 'pg';
import { Analysis, AnalysisWithCompany, CreateAnalysisInput, UpdateAnalysisScoresInput, ValidationStatus, ListAnalysesParams } from '../types/database';
export declare class AnalysisRepository {
    private db;
    /**
     * Find analysis by ID
     */
    findById(id: string, client?: PoolClient): Promise<Analysis | null>;
    /**
     * Find analysis by ID with company info
     */
    findByIdWithCompany(id: string): Promise<AnalysisWithCompany | null>;
    /**
     * Find current analysis for a company
     */
    findCurrentByCompanyId(companyId: string, client?: PoolClient): Promise<Analysis | null>;
    /**
     * Find all analyses for a company
     */
    findByCompanyId(companyId: string, params?: ListAnalysesParams): Promise<Analysis[]>;
    /**
     * Get the next version number for a company
     */
    getNextVersion(companyId: string, client?: PoolClient): Promise<number>;
    /**
     * Create a new analysis
     */
    create(input: CreateAnalysisInput, client?: PoolClient): Promise<Analysis>;
    /**
     * Update analysis with scores
     */
    updateScores(id: string, scores: UpdateAnalysisScoresInput, client?: PoolClient): Promise<Analysis>;
    /**
     * Update analysis with lock data
     */
    updateLock(id: string, dataHash: string, lockId: string, client?: PoolClient): Promise<Analysis>;
    /**
     * Update analysis validation status
     */
    updateValidation(id: string, validationStatus: ValidationStatus, client?: PoolClient): Promise<Analysis>;
    /**
     * Update tree data
     */
    updateTreeData(id: string, treeData: Record<string, unknown>, client?: PoolClient): Promise<Analysis>;
    /**
     * Check if analysis is locked
     */
    isLocked(id: string, client?: PoolClient): Promise<boolean>;
}
export declare const analysisRepository: AnalysisRepository;
//# sourceMappingURL=analysis-repository.d.ts.map