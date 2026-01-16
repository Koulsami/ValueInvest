import { Router, Request, Response } from 'express';
import { companyRepository } from '../repositories/company-repository';
import { analysisRepository } from '../repositories/analysis-repository';
import { CompanyStatus, AnalysisStatus } from '../types/database';

const router = Router();

/**
 * GET /api/v1/companies
 * List all tracked companies
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, sector, limit, offset, sort } = req.query as {
      status?: string;
      sector?: string;
      limit?: string;
      offset?: string;
      sort?: 'ticker' | 'name' | 'priority' | 'last_analysis_at';
    };

    req.logger.info('List companies request', {
      operation: 'listCompanies',
      status,
      sector,
      limit,
      offset,
      sort,
    });

    const result = await companyRepository.list({
      status: status as CompanyStatus | undefined,
      sector,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      sort: sort || 'priority',
    });

    res.json({
      success: true,
      result: {
        companies: result.companies.map(company => ({
          id: company.id,
          ticker: company.ticker,
          name: company.name,
          sector: company.sector,
          industry: company.industry,
          country: company.country,
          exchange: company.exchange,
          status: company.status,
          priority: company.priority,
          tracking_since: company.trackingSince,
          last_analysis_at: company.lastAnalysisAt,
          metadata: company.metadata,
        })),
        total: result.total,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to list companies', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * GET /api/v1/companies/:ticker
 * Get company details
 */
router.get('/:ticker', async (req: Request, res: Response) => {
  try {
    const { ticker } = req.params;

    req.logger.info('Get company request', {
      operation: 'getCompany',
      ticker,
    });

    const company = await companyRepository.findByTickerWithMarketData(ticker);

    if (!company) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Company not found: ${ticker}`,
        traceId: req.traceContext.traceId,
      });
    }

    res.json({
      success: true,
      result: {
        id: company.id,
        ticker: company.ticker,
        name: company.name,
        sector: company.sector,
        industry: company.industry,
        country: company.country,
        exchange: company.exchange,
        status: company.status,
        priority: company.priority,
        tracking_since: company.trackingSince,
        last_analysis_at: company.lastAnalysisAt,
        metadata: company.metadata,
        latest_market_data: company.latestMarketData ? {
          date: company.latestMarketData.date,
          close_price: company.latestMarketData.closePrice,
          market_cap: company.latestMarketData.marketCap,
          pe_ratio: company.latestMarketData.peRatio,
          pb_ratio: company.latestMarketData.pbRatio,
          ev_ebitda: company.latestMarketData.evEbitda,
          p_fcf: company.latestMarketData.pFcf,
          dividend_yield: company.latestMarketData.dividendYield,
          roe: company.latestMarketData.roe,
          roic: company.latestMarketData.roic,
          net_margin: company.latestMarketData.netMargin,
          debt_equity: company.latestMarketData.debtEquity,
          interest_coverage: company.latestMarketData.interestCoverage,
          revenue_growth: company.latestMarketData.revenueGrowth,
          eps_growth: company.latestMarketData.epsGrowth,
          fcf_growth: company.latestMarketData.fcfGrowth,
        } : null,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get company', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * GET /api/v1/companies/:ticker/analysis
 * Retrieve the current analysis for a company
 */
router.get('/:ticker/analysis', async (req: Request, res: Response) => {
  try {
    const { ticker } = req.params;

    req.logger.info('Get current analysis request', {
      operation: 'getCurrentAnalysis',
      ticker,
    });

    // Find company
    const company = await companyRepository.findByTicker(ticker);
    if (!company) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Company not found: ${ticker}`,
        traceId: req.traceContext.traceId,
      });
    }

    // Find current analysis
    const analysis = await analysisRepository.findCurrentByCompanyId(company.id);
    if (!analysis) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No current analysis for company: ${ticker}`,
        traceId: req.traceContext.traceId,
      });
    }

    res.json({
      success: true,
      result: {
        id: analysis.id,
        company_id: analysis.companyId,
        company_ticker: ticker,
        company_name: company.name,
        version: analysis.version,
        is_current: analysis.isCurrent,
        status: analysis.status,
        tree_data: analysis.treeData,
        scores: {
          moat: analysis.moatScore,
          valuation: analysis.valuationScore,
          quality: analysis.qualityScore,
          growth: analysis.growthScore,
          dividend: analysis.dividendScore,
          overall: analysis.overallScore,
        },
        classification: analysis.classification,
        recommendation: analysis.recommendation,
        validation_status: analysis.validationStatus,
        confidence_score: analysis.confidenceScore,
        data_hash: analysis.dataHash,
        lock_id: analysis.lockId,
        created_at: analysis.createdAt,
        updated_at: analysis.updatedAt,
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to get current analysis', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

/**
 * GET /api/v1/companies/:ticker/analyses
 * List all analysis versions for a company
 */
router.get('/:ticker/analyses', async (req: Request, res: Response) => {
  try {
    const { ticker } = req.params;
    const { status, limit, offset } = req.query as {
      status?: string;
      limit?: string;
      offset?: string;
    };

    req.logger.info('List company analyses request', {
      operation: 'listCompanyAnalyses',
      ticker,
      status,
      limit,
      offset,
    });

    // Find company
    const company = await companyRepository.findByTicker(ticker);
    if (!company) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Company not found: ${ticker}`,
        traceId: req.traceContext.traceId,
      });
    }

    // Find analyses
    const analyses = await analysisRepository.findByCompanyId(company.id, {
      status: status as AnalysisStatus | undefined,
      limit: limit ? parseInt(limit, 10) : 10,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    res.json({
      success: true,
      result: {
        company_id: company.id,
        company_ticker: ticker,
        company_name: company.name,
        count: analyses.length,
        analyses: analyses.map(analysis => ({
          id: analysis.id,
          version: analysis.version,
          is_current: analysis.isCurrent,
          status: analysis.status,
          scores: {
            moat: analysis.moatScore,
            valuation: analysis.valuationScore,
            quality: analysis.qualityScore,
            growth: analysis.growthScore,
            dividend: analysis.dividendScore,
            overall: analysis.overallScore,
          },
          classification: analysis.classification,
          validation_status: analysis.validationStatus,
          data_hash: analysis.dataHash,
          created_at: analysis.createdAt,
          updated_at: analysis.updatedAt,
        })),
      },
      traceId: req.traceContext.traceId,
    });
  } catch (error) {
    req.logger.error('Failed to list company analyses', {
      error: (error as Error).message,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message,
      traceId: req.traceContext.traceId,
    });
  }
});

export default router;
