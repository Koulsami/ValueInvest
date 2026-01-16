"use strict";
/**
 * Company Repository - Database operations for companies
 * Phase 2b: Database Integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyRepository = exports.CompanyRepository = void 0;
const database_1 = require("../lib/database");
// Row to entity mapping helper
function rowToCompany(row) {
    return {
        id: row.id,
        ticker: row.ticker,
        name: row.name,
        sector: row.sector,
        industry: row.industry,
        country: row.country,
        exchange: row.exchange,
        status: row.status,
        priority: row.priority,
        trackingSince: new Date(row.tracking_since),
        lastAnalysisAt: row.last_analysis_at ? new Date(row.last_analysis_at) : null,
        metadata: row.metadata || {},
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}
function rowToMarketData(row) {
    return {
        id: row.id,
        companyId: row.company_id,
        date: new Date(row.date),
        closePrice: row.close_price ? Number(row.close_price) : null,
        marketCap: row.market_cap ? Number(row.market_cap) : null,
        peRatio: row.pe_ratio ? Number(row.pe_ratio) : null,
        pbRatio: row.pb_ratio ? Number(row.pb_ratio) : null,
        evEbitda: row.ev_ebitda ? Number(row.ev_ebitda) : null,
        pFcf: row.p_fcf ? Number(row.p_fcf) : null,
        dividendYield: row.dividend_yield ? Number(row.dividend_yield) : null,
        roe: row.roe ? Number(row.roe) : null,
        roic: row.roic ? Number(row.roic) : null,
        netMargin: row.net_margin ? Number(row.net_margin) : null,
        debtEquity: row.debt_equity ? Number(row.debt_equity) : null,
        interestCoverage: row.interest_coverage ? Number(row.interest_coverage) : null,
        revenueGrowth: row.revenue_growth ? Number(row.revenue_growth) : null,
        epsGrowth: row.eps_growth ? Number(row.eps_growth) : null,
        fcfGrowth: row.fcf_growth ? Number(row.fcf_growth) : null,
    };
}
class CompanyRepository {
    db = (0, database_1.getDatabase)();
    /**
     * Find a company by ticker
     */
    async findByTicker(ticker, client) {
        const sql = `
      SELECT * FROM companies
      WHERE ticker = $1
    `;
        const queryFn = client
            ? () => client.query(sql, [ticker.toUpperCase()])
            : () => this.db.query(sql, [ticker.toUpperCase()]);
        const result = await queryFn();
        if (result.rows.length === 0) {
            return null;
        }
        return rowToCompany(result.rows[0]);
    }
    /**
     * Find a company by ID
     */
    async findById(id, client) {
        const sql = `
      SELECT * FROM companies
      WHERE id = $1
    `;
        const queryFn = client
            ? () => client.query(sql, [id])
            : () => this.db.query(sql, [id]);
        const result = await queryFn();
        if (result.rows.length === 0) {
            return null;
        }
        return rowToCompany(result.rows[0]);
    }
    /**
     * Find a company by ticker with latest market data
     */
    async findByTickerWithMarketData(ticker) {
        const sql = `
      SELECT c.*, m.id as market_id, m.date, m.close_price, m.market_cap,
             m.pe_ratio, m.pb_ratio, m.ev_ebitda, m.p_fcf, m.dividend_yield,
             m.roe, m.roic, m.net_margin, m.debt_equity, m.interest_coverage,
             m.revenue_growth, m.eps_growth, m.fcf_growth
      FROM companies c
      LEFT JOIN v_latest_market_data m ON c.id = m.company_id
      WHERE c.ticker = $1
    `;
        const result = await this.db.query(sql, [ticker.toUpperCase()]);
        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        const company = rowToCompany(row);
        let latestMarketData = null;
        if (row.market_id) {
            latestMarketData = rowToMarketData({
                id: row.market_id,
                company_id: company.id,
                date: row.date,
                close_price: row.close_price,
                market_cap: row.market_cap,
                pe_ratio: row.pe_ratio,
                pb_ratio: row.pb_ratio,
                ev_ebitda: row.ev_ebitda,
                p_fcf: row.p_fcf,
                dividend_yield: row.dividend_yield,
                roe: row.roe,
                roic: row.roic,
                net_margin: row.net_margin,
                debt_equity: row.debt_equity,
                interest_coverage: row.interest_coverage,
                revenue_growth: row.revenue_growth,
                eps_growth: row.eps_growth,
                fcf_growth: row.fcf_growth,
            });
        }
        return {
            ...company,
            latestMarketData,
        };
    }
    /**
     * List companies with optional filters
     */
    async list(params = {}) {
        const { status, sector, limit = 50, offset = 0, sort = 'priority' } = params;
        const conditions = [];
        const values = [];
        let paramIndex = 1;
        if (status) {
            conditions.push(`status = $${paramIndex++}`);
            values.push(status);
        }
        if (sector) {
            conditions.push(`sector = $${paramIndex++}`);
            values.push(sector);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        // Get sort column
        const sortColumn = {
            ticker: 'ticker',
            name: 'name',
            priority: 'priority DESC',
            last_analysis_at: 'last_analysis_at DESC NULLS LAST',
        }[sort] || 'priority DESC';
        // Count query
        const countSql = `SELECT COUNT(*) as total FROM companies ${whereClause}`;
        const countResult = await this.db.query(countSql, values);
        const total = parseInt(countResult.rows[0].total, 10);
        // Data query
        const dataSql = `
      SELECT * FROM companies
      ${whereClause}
      ORDER BY ${sortColumn}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
        const dataResult = await this.db.query(dataSql, [...values, limit, offset]);
        return {
            companies: dataResult.rows.map(rowToCompany),
            total,
        };
    }
    /**
     * Update last_analysis_at timestamp for a company
     */
    async updateLastAnalysisAt(companyId, client) {
        const sql = `
      UPDATE companies
      SET last_analysis_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
        const queryFn = client
            ? () => client.query(sql, [companyId])
            : () => this.db.query(sql, [companyId]);
        await queryFn();
    }
}
exports.CompanyRepository = CompanyRepository;
// Export singleton instance
exports.companyRepository = new CompanyRepository();
//# sourceMappingURL=company-repository.js.map