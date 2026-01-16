/**
 * Company Repository - Database operations for companies
 * Phase 2b: Database Integration
 */
import { PoolClient } from 'pg';
import { Company, CompanyWithMarketData, ListCompaniesParams } from '../types/database';
export declare class CompanyRepository {
    private db;
    /**
     * Find a company by ticker
     */
    findByTicker(ticker: string, client?: PoolClient): Promise<Company | null>;
    /**
     * Find a company by ID
     */
    findById(id: string, client?: PoolClient): Promise<Company | null>;
    /**
     * Find a company by ticker with latest market data
     */
    findByTickerWithMarketData(ticker: string): Promise<CompanyWithMarketData | null>;
    /**
     * List companies with optional filters
     */
    list(params?: ListCompaniesParams): Promise<{
        companies: Company[];
        total: number;
    }>;
    /**
     * Update last_analysis_at timestamp for a company
     */
    updateLastAnalysisAt(companyId: string, client?: PoolClient): Promise<void>;
}
export declare const companyRepository: CompanyRepository;
//# sourceMappingURL=company-repository.d.ts.map