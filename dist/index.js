"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
const prom_client_1 = require("prom-client");
const config_1 = require("./config");
const health_1 = require("./handlers/health");
const version_1 = require("./handlers/version");
const echo_1 = require("./handlers/echo");
const metrics_1 = require("./handlers/metrics");
(0, prom_client_1.collectDefaultMetrics)();
const httpRequestsTotal = new prom_client_1.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});
const httpRequestDuration = new prom_client_1.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route']
});
const logger = (0, pino_1.default)({
    level: config_1.config.logLevel,
    ...(config_1.config.nodeEnv === 'production' && {
        formatters: {
            level: (label) => ({ level: label })
        }
    })
});
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, pino_http_1.default)({ logger }));
app.use(express_1.default.json({ limit: '64kb' }));
app.use((req, res, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    res.setHeader('x-request-id', req.headers['x-request-id']);
    next();
});
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route?.path || req.path;
        httpRequestsTotal.inc({
            method: req.method,
            route,
            status_code: res.statusCode
        });
        httpRequestDuration.observe({
            method: req.method,
            route
        }, duration);
    });
    next();
});
app.get('/health', (0, health_1.createHealthHandler)());
app.get('/version', (0, version_1.createVersionHandler)());
app.post('/echo', (0, echo_1.createEchoHandler)());
app.get('/metrics', (0, metrics_1.createMetricsHandler)());
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});
app.use((err, req, res, _next) => {
    logger.error({ err, req: req.headers['x-request-id'] }, 'Unhandled error');
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong'
    });
});
const server = app.listen(config_1.config.port, () => {
    logger.info(`Server running on port ${config_1.config.port}`);
    logger.info(`Environment: ${config_1.config.nodeEnv}`);
    logger.info(`App: ${config_1.config.appName} v${config_1.config.appVersion}`);
});
const gracefulShutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 5000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
exports.default = app;
//# sourceMappingURL=index.js.map