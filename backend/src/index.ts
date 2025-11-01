import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment';
import { neo4jConfig } from './config/neo4j.config';
import { validateClaudeConfig } from './config/claude.config';
import apiRoutes from './routes/api.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(
  cors({})
);
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (_, res) => {
  res.json({
    message: 'Ethereum Graph Analyzer API',
    version: '1.0.0',
    endpoints: {
      naturalLanguageQuery: 'POST /api/query/natural',
      graphqlQuery: 'POST /api/query/graphql',
      explainResults: 'POST /api/explain',
      validateQuery: 'POST /api/query/validate',
      checkConnection: 'GET /api/connection/direct',
      checkRelationship: 'GET /api/connection/relationship',
      getTransactions: 'GET /api/transactions/to/:address',
      getAddressInfo: 'GET /api/address/:address',
      health: 'GET /api/health',
    },
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize and start server
const startServer = async () => {
  try {
    // Validate configurations
    if (!validateClaudeConfig()) {
      throw new Error('Invalid Claude configuration');
    }

    // Connect to Neo4j
    await neo4jConfig.connect();
    logger.info('Neo4j connected successfully');

    // Start server
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`CORS origin: ${config.cors.origin}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing connections...');

  try {
    await neo4jConfig.close();
    logger.info('Neo4j connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error });
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
startServer();

export default app;
