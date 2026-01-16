/**
 * Rule Execution Repository - Database operations for rule executions
 * Phase 2b: Database Integration
 */
import { PoolClient } from 'pg';
import { RuleExecution, CreateRuleExecutionInput } from '../types/database';
export declare class RuleExecutionRepository {
    private db;
    /**
     * Create multiple rule executions in a single batch insert
     */
    createMany(executions: CreateRuleExecutionInput[], client?: PoolClient): Promise<RuleExecution[]>;
    /**
     * Find all rule executions for an analysis
     */
    findByAnalysisId(analysisId: string): Promise<RuleExecution[]>;
    /**
     * Count rule executions for an analysis
     */
    countByAnalysisId(analysisId: string, client?: PoolClient): Promise<number>;
    /**
     * Delete all rule executions for an analysis (for re-scoring)
     */
    deleteByAnalysisId(analysisId: string, client?: PoolClient): Promise<number>;
}
export declare const ruleExecutionRepository: RuleExecutionRepository;
//# sourceMappingURL=rule-execution-repository.d.ts.map