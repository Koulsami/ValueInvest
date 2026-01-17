/**
 * Test Suite for Legendary Investor Rule Sets
 * Phase 1: Buffett, Graham, Lynch, Fisher, and Composite
 */

import { CONFIG, apiRequest, TestResult, formatTestLine, printHeader, printSummary } from './test-utils';

// Test data representing a high-quality growth company
const testTree = {
  WHAT: {
    FINANCIAL: {
      roic: 0.22,
      roe: 0.25,
      gross_margin: 0.65,
      operating_margin: 0.28,
      net_margin: 0.18,
      debt_to_equity: 0.45,
      current_ratio: 2.2,
      fcf_yield: 0.065,
      revenue_growth_5y: 0.12,
      earnings_growth_5y: 0.18,
      earnings_stability: 'STABLE',
      earnings_quality: 'HIGH',
      profitable_years_10: 10,
      eps_growth_10y: 0.45,
      financial_strength: 'A',
      margin_trend: 'STABLE',
      rd_to_revenue: 0.12,
    },
    VALUATION: {
      pe_ratio: 22,
      pb_ratio: 4.5,
      peg_ratio: 1.2,
      earnings_yield: 0.045,
      ev_ebit: 18,
      margin_of_safety_pct: 0.15,
      price_to_ncav: 2.0,
      price_vs_earnings_line: 'AT',
    },
    MOAT: {
      switching_costs: 'HIGH',
      intangible_assets: 'MODERATE',
      network_effects: 'LOW',
      cost_advantages: 'MODERATE',
      sustainability: 'DURABLE',
    },
    MANAGEMENT: {
      quality: 'GOOD',
      capital_allocation: 'GOOD',
      insider_ownership_pct: 0.08,
      integrity: 'GOOD',
      depth: 'ADEQUATE',
      employee_relations: 'GOOD',
      executive_cohesion: 'GOOD',
      cost_control: 'GOOD',
    },
    DIVIDEND: {
      consecutive_years: 15,
      yield: 0.025,
      payout_ratio: 0.45,
      pays_dividend: true,
    },
    BUSINESS: {
      complexity: 'MODERATE',
      market_position: 'STRONG',
      sales_organization: 'GOOD',
      industry_position: 'TOP_3',
      customer_relations: 'GOOD',
    },
    GROWTH: {
      runway: 'MEDIUM',
      long_term_potential: 'STRONG',
    },
    INNOVATION: {
      rd_effectiveness: 'GOOD',
      pipeline_strength: 'GOOD',
    },
    OWNERSHIP: {
      institutional_pct: 0.65,
    },
  },
  WHICH: {
    moat_classification: 'NARROW',
    industry_growth_rate: 0.08,
    lynch_category: 'STALWART',
  },
};

// ==================== TEST DEFINITIONS ====================

async function testListRuleSets(): Promise<TestResult> {
  const start = Date.now();
  try {
    const { status, data } = await apiRequest<{
      success: boolean;
      result: { ruleSets: string[] };
    }>('GET', '/api/v1/score/rule-sets');

    const duration = Date.now() - start;

    if (status !== 200 || !data.success) {
      return {
        name: 'List Rule Sets',
        status: 'FAIL',
        duration,
        error: `Status ${status}, success: ${data.success}`,
      };
    }

    // Check all 6 rule sets are present
    const expectedRuleSets = ['investment-v1', 'buffett-v1', 'graham-v1', 'lynch-v1', 'fisher-v1', 'composite-v1'];
    const missingRuleSets = expectedRuleSets.filter(rs => !data.result.ruleSets.includes(rs));

    if (missingRuleSets.length > 0) {
      return {
        name: 'List Rule Sets',
        status: 'FAIL',
        duration,
        error: `Missing rule sets: ${missingRuleSets.join(', ')}`,
        expected: expectedRuleSets.join(', '),
        actual: data.result.ruleSets.join(', '),
      };
    }

    return {
      name: 'List Rule Sets',
      status: 'PASS',
      duration,
      response: data.result.ruleSets,
    };
  } catch (error) {
    return {
      name: 'List Rule Sets',
      status: 'FAIL',
      duration: Date.now() - start,
      error: (error as Error).message,
    };
  }
}

async function testGetBuffettRuleSet(): Promise<TestResult> {
  const start = Date.now();
  try {
    const { status, data } = await apiRequest<{
      success: boolean;
      result: {
        id: string;
        name: string;
        investor: string;
        dimensions: Array<{ id: string; rules: unknown[] }>;
      };
    }>('GET', '/api/v1/score/rule-sets/buffett-v1');

    const duration = Date.now() - start;

    if (status !== 200 || !data.success) {
      return {
        name: 'Get Buffett Rule Set',
        status: 'FAIL',
        duration,
        error: `Status ${status}, success: ${data.success}`,
      };
    }

    const ruleSet = data.result;

    // Validate structure
    if (ruleSet.id !== 'buffett-v1') {
      return { name: 'Get Buffett Rule Set', status: 'FAIL', duration, error: `Wrong id: ${ruleSet.id}` };
    }
    if (ruleSet.investor !== 'Warren Buffett') {
      return { name: 'Get Buffett Rule Set', status: 'FAIL', duration, error: `Wrong investor: ${ruleSet.investor}` };
    }
    if (ruleSet.dimensions.length !== 5) {
      return { name: 'Get Buffett Rule Set', status: 'FAIL', duration, error: `Expected 5 dimensions, got ${ruleSet.dimensions.length}` };
    }

    // Count total rules
    const totalRules = ruleSet.dimensions.reduce((sum, dim) => sum + dim.rules.length, 0);
    if (totalRules !== 20) {
      return { name: 'Get Buffett Rule Set', status: 'FAIL', duration, error: `Expected 20 rules, got ${totalRules}` };
    }

    return {
      name: 'Get Buffett Rule Set',
      status: 'PASS',
      duration,
      response: { dimensions: ruleSet.dimensions.length, rules: totalRules },
    };
  } catch (error) {
    return {
      name: 'Get Buffett Rule Set',
      status: 'FAIL',
      duration: Date.now() - start,
      error: (error as Error).message,
    };
  }
}

async function testGetGrahamRuleSet(): Promise<TestResult> {
  const start = Date.now();
  try {
    const { status, data } = await apiRequest<{
      success: boolean;
      result: {
        id: string;
        investor: string;
        dimensions: Array<{ rules: unknown[] }>;
      };
    }>('GET', '/api/v1/score/rule-sets/graham-v1');

    const duration = Date.now() - start;

    if (status !== 200 || !data.success) {
      return { name: 'Get Graham Rule Set', status: 'FAIL', duration, error: `Status ${status}` };
    }

    const totalRules = data.result.dimensions.reduce((sum, dim) => sum + dim.rules.length, 0);
    if (totalRules !== 14) {
      return { name: 'Get Graham Rule Set', status: 'FAIL', duration, error: `Expected 14 rules, got ${totalRules}` };
    }

    return { name: 'Get Graham Rule Set', status: 'PASS', duration };
  } catch (error) {
    return { name: 'Get Graham Rule Set', status: 'FAIL', duration: Date.now() - start, error: (error as Error).message };
  }
}

async function testGetLynchRuleSet(): Promise<TestResult> {
  const start = Date.now();
  try {
    const { status, data } = await apiRequest<{
      success: boolean;
      result: {
        id: string;
        investor: string;
        dimensions: Array<{ rules: unknown[] }>;
      };
    }>('GET', '/api/v1/score/rule-sets/lynch-v1');

    const duration = Date.now() - start;

    if (status !== 200 || !data.success) {
      return { name: 'Get Lynch Rule Set', status: 'FAIL', duration, error: `Status ${status}` };
    }

    const totalRules = data.result.dimensions.reduce((sum, dim) => sum + dim.rules.length, 0);
    if (totalRules !== 12) {
      return { name: 'Get Lynch Rule Set', status: 'FAIL', duration, error: `Expected 12 rules, got ${totalRules}` };
    }

    return { name: 'Get Lynch Rule Set', status: 'PASS', duration };
  } catch (error) {
    return { name: 'Get Lynch Rule Set', status: 'FAIL', duration: Date.now() - start, error: (error as Error).message };
  }
}

async function testGetFisherRuleSet(): Promise<TestResult> {
  const start = Date.now();
  try {
    const { status, data } = await apiRequest<{
      success: boolean;
      result: {
        id: string;
        investor: string;
        dimensions: Array<{ rules: unknown[] }>;
      };
    }>('GET', '/api/v1/score/rule-sets/fisher-v1');

    const duration = Date.now() - start;

    if (status !== 200 || !data.success) {
      return { name: 'Get Fisher Rule Set', status: 'FAIL', duration, error: `Status ${status}` };
    }

    const totalRules = data.result.dimensions.reduce((sum, dim) => sum + dim.rules.length, 0);
    if (totalRules !== 15) {
      return { name: 'Get Fisher Rule Set', status: 'FAIL', duration, error: `Expected 15 rules, got ${totalRules}` };
    }

    return { name: 'Get Fisher Rule Set', status: 'PASS', duration };
  } catch (error) {
    return { name: 'Get Fisher Rule Set', status: 'FAIL', duration: Date.now() - start, error: (error as Error).message };
  }
}

async function testGetCompositeRuleSet(): Promise<TestResult> {
  const start = Date.now();
  try {
    const { status, data } = await apiRequest<{
      success: boolean;
      result: {
        id: string;
        isComposite: boolean;
        compositeWeights: Record<string, number>;
      };
    }>('GET', '/api/v1/score/rule-sets/composite-v1');

    const duration = Date.now() - start;

    if (status !== 200 || !data.success) {
      return { name: 'Get Composite Rule Set', status: 'FAIL', duration, error: `Status ${status}` };
    }

    if (!data.result.isComposite) {
      return { name: 'Get Composite Rule Set', status: 'FAIL', duration, error: 'isComposite should be true' };
    }

    const weights = data.result.compositeWeights;
    if (!weights || Object.keys(weights).length !== 4) {
      return { name: 'Get Composite Rule Set', status: 'FAIL', duration, error: 'Expected 4 component weights' };
    }

    // Verify weights sum to 1.0
    const weightSum = Object.values(weights).reduce((sum, w) => sum + w, 0);
    if (Math.abs(weightSum - 1.0) > 0.01) {
      return { name: 'Get Composite Rule Set', status: 'FAIL', duration, error: `Weights sum to ${weightSum}, expected 1.0` };
    }

    return { name: 'Get Composite Rule Set', status: 'PASS', duration, response: weights };
  } catch (error) {
    return { name: 'Get Composite Rule Set', status: 'FAIL', duration: Date.now() - start, error: (error as Error).message };
  }
}

async function testScoreBuffett(): Promise<TestResult> {
  const start = Date.now();
  try {
    const { status, data } = await apiRequest<{
      success: boolean;
      result: {
        scores: { total: number; dimensions: Array<{ dimensionId: string; rawScore: number }> };
        classification: string;
        recommendation: string;
      };
    }>('POST', '/api/v1/score', {
      data: testTree,
      ruleSetId: 'buffett-v1',
      verticalId: 'investment',
    });

    const duration = Date.now() - start;

    if (status !== 200 || !data.success) {
      return { name: 'Score with Buffett', status: 'FAIL', duration, error: `Status ${status}` };
    }

    const total = data.result.scores.total;
    if (total < 0 || total > 100) {
      return { name: 'Score with Buffett', status: 'FAIL', duration, error: `Score ${total} out of range` };
    }

    if (!data.result.classification) {
      return { name: 'Score with Buffett', status: 'FAIL', duration, error: 'Missing classification' };
    }

    return {
      name: 'Score with Buffett',
      status: 'PASS',
      duration,
      response: { total, classification: data.result.classification },
    };
  } catch (error) {
    return { name: 'Score with Buffett', status: 'FAIL', duration: Date.now() - start, error: (error as Error).message };
  }
}

async function testScoreGraham(): Promise<TestResult> {
  const start = Date.now();
  try {
    const { status, data } = await apiRequest<{
      success: boolean;
      result: {
        scores: { total: number };
        classification: string;
      };
    }>('POST', '/api/v1/score', {
      data: testTree,
      ruleSetId: 'graham-v1',
      verticalId: 'investment',
    });

    const duration = Date.now() - start;

    if (status !== 200 || !data.success) {
      return { name: 'Score with Graham', status: 'FAIL', duration, error: `Status ${status}` };
    }

    return {
      name: 'Score with Graham',
      status: 'PASS',
      duration,
      response: { total: data.result.scores.total, classification: data.result.classification },
    };
  } catch (error) {
    return { name: 'Score with Graham', status: 'FAIL', duration: Date.now() - start, error: (error as Error).message };
  }
}

async function testScoreLynch(): Promise<TestResult> {
  const start = Date.now();
  try {
    const { status, data } = await apiRequest<{
      success: boolean;
      result: {
        scores: { total: number };
        classification: string;
      };
    }>('POST', '/api/v1/score', {
      data: testTree,
      ruleSetId: 'lynch-v1',
      verticalId: 'investment',
    });

    const duration = Date.now() - start;

    if (status !== 200 || !data.success) {
      return { name: 'Score with Lynch', status: 'FAIL', duration, error: `Status ${status}` };
    }

    return {
      name: 'Score with Lynch',
      status: 'PASS',
      duration,
      response: { total: data.result.scores.total, classification: data.result.classification },
    };
  } catch (error) {
    return { name: 'Score with Lynch', status: 'FAIL', duration: Date.now() - start, error: (error as Error).message };
  }
}

async function testScoreFisher(): Promise<TestResult> {
  const start = Date.now();
  try {
    const { status, data } = await apiRequest<{
      success: boolean;
      result: {
        scores: { total: number };
        classification: string;
      };
    }>('POST', '/api/v1/score', {
      data: testTree,
      ruleSetId: 'fisher-v1',
      verticalId: 'investment',
    });

    const duration = Date.now() - start;

    if (status !== 200 || !data.success) {
      return { name: 'Score with Fisher', status: 'FAIL', duration, error: `Status ${status}` };
    }

    return {
      name: 'Score with Fisher',
      status: 'PASS',
      duration,
      response: { total: data.result.scores.total, classification: data.result.classification },
    };
  } catch (error) {
    return { name: 'Score with Fisher', status: 'FAIL', duration: Date.now() - start, error: (error as Error).message };
  }
}

async function testScoreComposite(): Promise<TestResult> {
  const start = Date.now();
  try {
    const { status, data } = await apiRequest<{
      success: boolean;
      result: {
        scores: { total: number };
        classification: string;
        isComposite: boolean;
        components: Record<string, { total: number; weight: number; weighted: number }>;
      };
    }>('POST', '/api/v1/score', {
      data: testTree,
      ruleSetId: 'composite-v1',
      verticalId: 'investment',
    });

    const duration = Date.now() - start;

    if (status !== 200 || !data.success) {
      return { name: 'Score with Composite', status: 'FAIL', duration, error: `Status ${status}` };
    }

    if (!data.result.isComposite) {
      return { name: 'Score with Composite', status: 'FAIL', duration, error: 'isComposite should be true' };
    }

    const components = data.result.components;
    if (!components || Object.keys(components).length !== 4) {
      return { name: 'Score with Composite', status: 'FAIL', duration, error: 'Expected 4 component scores' };
    }

    // Verify composite calculation
    const expectedComposite = Object.values(components).reduce((sum, c) => sum + c.weighted, 0);
    if (Math.abs(data.result.scores.total - expectedComposite) > 0.5) {
      return {
        name: 'Score with Composite',
        status: 'FAIL',
        duration,
        error: `Composite mismatch: ${data.result.scores.total} vs calculated ${expectedComposite.toFixed(2)}`,
      };
    }

    return {
      name: 'Score with Composite',
      status: 'PASS',
      duration,
      response: {
        total: data.result.scores.total,
        classification: data.result.classification,
        components: Object.entries(components).map(([k, v]) => `${k}: ${v.total.toFixed(1)}`).join(', '),
      },
    };
  } catch (error) {
    return { name: 'Score with Composite', status: 'FAIL', duration: Date.now() - start, error: (error as Error).message };
  }
}

async function testCompositeWeightedAverage(): Promise<TestResult> {
  const start = Date.now();
  try {
    // Get individual scores
    const buffettResult = await apiRequest<{ success: boolean; result: { scores: { total: number } } }>(
      'POST', '/api/v1/score', { data: testTree, ruleSetId: 'buffett-v1' }
    );
    const grahamResult = await apiRequest<{ success: boolean; result: { scores: { total: number } } }>(
      'POST', '/api/v1/score', { data: testTree, ruleSetId: 'graham-v1' }
    );
    const lynchResult = await apiRequest<{ success: boolean; result: { scores: { total: number } } }>(
      'POST', '/api/v1/score', { data: testTree, ruleSetId: 'lynch-v1' }
    );
    const fisherResult = await apiRequest<{ success: boolean; result: { scores: { total: number } } }>(
      'POST', '/api/v1/score', { data: testTree, ruleSetId: 'fisher-v1' }
    );
    const compositeResult = await apiRequest<{ success: boolean; result: { scores: { total: number } } }>(
      'POST', '/api/v1/score', { data: testTree, ruleSetId: 'composite-v1' }
    );

    const duration = Date.now() - start;

    // Calculate expected composite
    const expectedComposite =
      buffettResult.data.result.scores.total * 0.30 +
      grahamResult.data.result.scores.total * 0.25 +
      lynchResult.data.result.scores.total * 0.25 +
      fisherResult.data.result.scores.total * 0.20;

    const actualComposite = compositeResult.data.result.scores.total;

    if (Math.abs(actualComposite - expectedComposite) > 0.5) {
      return {
        name: 'Composite Weighted Average',
        status: 'FAIL',
        duration,
        error: `Expected ${expectedComposite.toFixed(2)}, got ${actualComposite}`,
        expected: expectedComposite.toFixed(2),
        actual: actualComposite.toString(),
      };
    }

    return {
      name: 'Composite Weighted Average',
      status: 'PASS',
      duration,
      response: {
        buffett: buffettResult.data.result.scores.total,
        graham: grahamResult.data.result.scores.total,
        lynch: lynchResult.data.result.scores.total,
        fisher: fisherResult.data.result.scores.total,
        composite: actualComposite,
        expected: expectedComposite.toFixed(2),
      },
    };
  } catch (error) {
    return { name: 'Composite Weighted Average', status: 'FAIL', duration: Date.now() - start, error: (error as Error).message };
  }
}

// ==================== MAIN TEST RUNNER ====================

async function runTests(): Promise<void> {
  printHeader();
  console.log('Running Legendary Investor Rule Sets Tests...\n');

  const tests: Array<{ name: string; fn: () => Promise<TestResult> }> = [
    { name: 'List Rule Sets', fn: testListRuleSets },
    { name: 'Get Buffett Rule Set', fn: testGetBuffettRuleSet },
    { name: 'Get Graham Rule Set', fn: testGetGrahamRuleSet },
    { name: 'Get Lynch Rule Set', fn: testGetLynchRuleSet },
    { name: 'Get Fisher Rule Set', fn: testGetFisherRuleSet },
    { name: 'Get Composite Rule Set', fn: testGetCompositeRuleSet },
    { name: 'Score with Buffett', fn: testScoreBuffett },
    { name: 'Score with Graham', fn: testScoreGraham },
    { name: 'Score with Lynch', fn: testScoreLynch },
    { name: 'Score with Fisher', fn: testScoreFisher },
    { name: 'Score with Composite', fn: testScoreComposite },
    { name: 'Composite Weighted Average', fn: testCompositeWeightedAverage },
  ];

  const results: TestResult[] = [];
  const totalStart = Date.now();

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const result = await test.fn();
    results.push(result);

    const line = formatTestLine(i + 1, tests.length, result.name, result.status, result.duration, result.error);
    console.log(line);

    // Show response for passing tests in verbose mode
    if (result.status === 'PASS' && result.response) {
      console.log(`         Response: ${JSON.stringify(result.response)}`);
    }
  }

  const totalDuration = Date.now() - totalStart;
  printSummary(results, totalDuration);

  // Exit with appropriate code
  const failed = results.filter(r => r.status === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);
