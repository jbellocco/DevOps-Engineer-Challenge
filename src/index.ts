import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { config } from './config';
import { createHealthHandler } from './handlers/health';
import { createVersionHandler } from './handlers/version';
import { createEchoHandler } from './handlers/echo';
import { createMetricsHandler } from './handlers/metrics';

// Initialize metrics
collectDefaultMetrics();
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route']
});

// Initialize logger
const logger = pino({
  level: config.logLevel,
  ...(config.nodeEnv === 'production' && {
    formatters: {
      level: (label) => ({ level: label })
    }
  })
});

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// Request logging
app.use(pinoHttp({ logger }));

// JSON parsing with size limit
app.use(express.json({ limit: '64kb' }));

// Request ID middleware
app.use((req, res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('x-request-id', req.headers['x-request-id']);
  next();
});

// Metrics middleware
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

// Routes
app.get('/health', createHealthHandler());
app.get('/version', createVersionHandler());
app.post('/echo', createEchoHandler());
app.get('/metrics', createMetricsHandler());

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err, req: req.headers['x-request-id'] }, 'Unhandled error');
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
});

// Start server
const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`App: ${config.appName} v${config.appVersion}`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 5 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
