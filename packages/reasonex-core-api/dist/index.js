"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./lib/logger");
const tracer_1 = require("./lib/tracer");
const database_1 = require("./lib/database");
// Load environment variables
dotenv_1.default.config();
// Database initialization flag
let databaseInitialized = false;
// Import routes
const lock_1 = __importDefault(require("./routes/lock"));
const score_1 = __importDefault(require("./routes/score"));
const validate_1 = __importDefault(require("./routes/validate"));
const tree_1 = __importDefault(require("./routes/tree"));
const detect_1 = __importDefault(require("./routes/detect"));
const route_1 = __importDefault(require("./routes/route"));
const analyses_1 = __importDefault(require("./routes/analyses"));
const companies_1 = __importDefault(require("./routes/companies"));
const workbench_1 = __importDefault(require("./routes/workbench"));
// Create app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Initialize logger and tracer
const logger = new logger_1.Logger(undefined, { service: 'reasonex-core-api', node: 'main' });
const tracer = new tracer_1.Tracer('reasonex-core-api', logger);
// Middleware: Request logging and tracing
app.use((req, res, next) => {
    const requestLogger = (0, logger_1.createRequestLogger)(req);
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
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Compression
app.use((0, compression_1.default)());
// Root endpoint - API info
app.get('/', (req, res) => {
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
app.get('/health', async (req, res) => {
    let dbStatus = {
        status: 'not_configured',
        latency_ms: 0
    };
    // Check database health if configured
    if (process.env.DATABASE_URL) {
        try {
            const db = (0, database_1.getDatabase)();
            const healthResult = await db.healthCheck();
            dbStatus = {
                status: healthResult.status,
                latency_ms: healthResult.latency_ms,
            };
        }
        catch (error) {
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
app.use(`${API_PREFIX}/lock`, lock_1.default);
app.use(`${API_PREFIX}/score`, score_1.default);
app.use(`${API_PREFIX}/validate`, validate_1.default);
app.use(`${API_PREFIX}/tree`, tree_1.default);
app.use(`${API_PREFIX}/detect`, detect_1.default);
app.use(`${API_PREFIX}/route`, route_1.default);
app.use(`${API_PREFIX}/analyses`, analyses_1.default);
app.use(`${API_PREFIX}/companies`, companies_1.default);
app.use(`${API_PREFIX}/workbench`, workbench_1.default);
// Debug endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
    app.get('/debug/spans', (req, res) => {
        res.json({
            active: tracer.getActiveSpans(),
            completed: tracer.getCompletedSpans().slice(-50),
        });
    });
}
// 404 handler
app.use((req, res) => {
    req.logger.warn('Route not found', { path: req.path, method: req.method });
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        traceId: req.traceContext.traceId,
    });
});
// Error handler
app.use((err, req, res, _next) => {
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
            await (0, database_1.initDatabase)();
            databaseInitialized = true;
            logger.info('Database connection initialized');
        }
        catch (error) {
            logger.warn('Database connection failed, running without persistence', {
                error: error.message,
            });
        }
    }
    else {
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
exports.default = app;
//# sourceMappingURL=index.js.map