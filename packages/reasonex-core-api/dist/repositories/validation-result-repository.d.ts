/**
 * Validation Result Repository - Database operations for validation results
 * Phase 2b: Database Integration
 */
import { PoolClient } from 'pg';
import { ValidationResult, CreateValidationResultInput } from '../types/database';
export declare class ValidationResultRepository {
    private db;
    /**
     * Create multiple validation results in a single batch insert
     */
    createMany(results: CreateValidationResultInput[], client?: PoolClient): Promise<ValidationResult[]>;
    /**
     * Find all validation results for an analysis
     */
    findByAnalysisId(analysisId: string): Promise<ValidationResult[]>;
    /**
     * Find latest validation results for an analysis (one per check_name)
     */
    findLatestByAnalysisId(analysisId: string): Promise<ValidationResult[]>;
    /**
     * Count validation results for an analysis
     */
    countByAnalysisId(analysisId: string): Promise<number>;
}
export declare const validationResultRepository: ValidationResultRepository;
//# sourceMappingURL=validation-result-repository.d.ts.map