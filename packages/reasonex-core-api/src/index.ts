import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { Logger, createRequestLogger, TraceContext } from './lib/logger';
import { Tracer } from './lib/tracer';
import { getDatabase, initDatabase } from './lib/database';

// Load environment variables
dotenv.config();

// Database initialization flag
let databaseInitialized = false;

// Import routes
import lockRouter from './routes/lock';
import scoreRouter from './routes/score';
import validateRouter from './routes/validate';
import treeRouter from './routes/tree';
import detectRouter from './routes/detect';
import routeRouter from './routes/route';
import analysesRouter from './routes/analyses';
import companiesRouter from './routes/companies';
import workbenchRouter from './routes/workbench';

// Create app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize logger and tracer
const logger = new Logger(undefined, { service: 'reasonex-core-api', node: 'main' });
const tracer = new Tracer('reasonex-core-api', logger);

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      logger: Logger;
      traceContext: TraceContext;
    }
  }
}

// Middleware: Request logging and tracing
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestLogger = createRequestLogger(req);
  req.logger = requestLogger;
  req.traceContext = requestLogger.getContext();

  const start = Date.now();

  // Log request
  requestLogger.info(`${req.method} ${req.path}`, {
    operation: 'request_start',
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestLogger.info(`${req.method} ${req.path} ${res.statusCode}`, {
      operation: 'request_end',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration_ms: duration,
    });
  });

  next();
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Root endpoint - API info
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Reasonex Core API',
    version: '1.0.0',
    description: 'Proprietary scoring, validation, and analysis engine',
    endpoints: {
      health: 'GET /health',
      lock: 'POST /api/v1/lock',
      score: 'POST /api/v1/score',
      validate: 'POST /api/v1/validate',
      tree: 'POST /api/v1/tree',
      detect: 'POST /api/v1/detect',
      route: 'POST /api/v1/route',
      analyses: 'GET /api/v1/analyses/:id',
      companies: 'GET /api/v1/companies',
      company: 'GET /api/v1/companies/:ticker',
      companyAnalysis: 'GET /api/v1/companies/:ticker/analysis',
      companyAnalyses: 'GET /api/v1/companies/:ticker/analyses',
      ruleExecutions: 'GET /api/v1/analyses/:id/rule-executions',
      validations: 'GET /api/v1/analyses/:id/validations',
      // Phase 3: Rule Development Workbench
      workbenchSessions: 'POST/GET /api/v1/workbench/sessions',
      workbenchDocuments: 'POST/GET /api/v1/workbench/sessions/:id/documents',
      workbenchQueries: 'POST/GET /api/v1/workbench/sessions/:id/queries',
      workbenchRules: 'POST/GET /api/v1/workbench/sessions/:id/rules',
      workbenchGenerate: 'POST /api/v1/workbench/sessions/:id/rules/generate',
      workbenchTestCases: 'POST/GET /api/v1/workbench/sessions/:id/test-cases',
      workbenchValidate: 'POST /api/v1/workbench/sessions/:id/validate',
      workbenchExport: 'POST /api/v1/workbench/sessions/:id/export',
      workbenchDeploy: 'POST /api/v1/workbench/sessions/:id/deploy',
    },
    documentation: 'See API documentation for request/response formats',
  });
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  let dbStatus: { status: string; latency_ms: number } = {
    status: 'not_configured',
    latency_ms: 0
  };

  // Check database health if configured
  if (process.env.DATABASE_URL) {
    try {
      const db = getDatabase();
      const healthResult = await db.healthCheck();
      dbStatus = {
        status: healthResult.status,
        latency_ms: healthResult.latency_ms,
      };
    } catch (error) {
      dbStatus = { status: 'unhealthy', latency_ms: 0 };
    }
  }

  const overallStatus = dbStatus.status === 'unhealthy' ? 'degraded' : 'healthy';

  res.json({
    status: overallStatus,
    service: 'reasonex-core-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      api: 'healthy',
      database: dbStatus.status,
      database_latency_ms: dbStatus.latency_ms,
    },
  });
});

// API version prefix
const API_PREFIX = '/api/v1';

// Mount routes
app.use(`${API_PREFIX}/lock`, lockRouter);
app.use(`${API_PREFIX}/score`, scoreRouter);
app.use(`${API_PREFIX}/validate`, validateRouter);
app.use(`${API_PREFIX}/tree`, treeRouter);
app.use(`${API_PREFIX}/detect`, detectRouter);
app.use(`${API_PREFIX}/route`, routeRouter);
app.use(`${API_PREFIX}/analyses`, analysesRouter);
app.use(`${API_PREFIX}/companies`, companiesRouter);
app.use(`${API_PREFIX}/workbench`, workbenchRouter);

// Debug endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/debug/spans', (req: Request, res: Response) => {
    res.json({
      active: tracer.getActiveSpans(),
      completed: tracer.getCompletedSpans().slice(-50),
    });
  });
}

// 404 handler
app.use((req: Request, res: Response) => {
  req.logger.warn('Route not found', { path: req.path, method: req.method });
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    traceId: req.traceContext.traceId,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  req.logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
    traceId: req.traceContext?.traceId,
  });
});

// Initialize database if configured
async function initializeDatabase() {
  if (process.env.DATABASE_URL) {
    try {
      await initDatabase();
      databaseInitialized = true;
      logger.info('Database connection initialized');
    } catch (error) {
      logger.warn('Database connection failed, running without persistence', {
        error: (error as Error).message,
      });
    }
  } else {
    logger.info('No DATABASE_URL configured, running without persistence');
  }
}

// Start server
const server = app.listen(PORT, async () => {
  logger.info(`Reasonex Core API started`, {
    operation: 'server_start',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  });

  // Initialize database after server starts
  await initializeDatabase();
});

export default app;
