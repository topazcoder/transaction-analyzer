import { Router } from 'express';
import { ClaudeService } from '../services/claude.service';
import { GraphQLService } from '../services/graphql.service';
import { Neo4jService } from '../services/neo4j.service';
import { validateRequest, schemas } from '../middleware/validator';
import { strictLimiter } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const claudeService = new ClaudeService();
const graphqlService = new GraphQLService();
const neo4jService = new Neo4jService();

// Natural language query endpoint
router.post(
  '/query/natural',
  strictLimiter,
  validateRequest(schemas.naturalLanguageQuery),
  async (req, res, next) => {
    try {
      const { prompt } = req.body;

      // Parse natural language to GraphQL
      const parsedQuery = await claudeService.parseNaturalLanguageToGraphQL(prompt);

      // Execute the GraphQL query
      const results = await graphqlService.executeGraphQLQuery(
        parsedQuery.graphqlQuery || '',
        parsedQuery.parameters
      );

      // Explain the results
      const explanation = await claudeService.explainResults(prompt, results);

      res.json({
        success: true,
        data: {
          query: parsedQuery.graphqlQuery,
          explanation: parsedQuery.explanation,
          results,
          naturalLanguageExplanation: explanation,
          intent: parsedQuery.intent,
          confidence: parsedQuery.confidence,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Direct GraphQL query endpoint
router.post('/query/graphql', validateRequest(schemas.graphqlQuery), async (req, res, next) => {
  try {
    const { query, variables } = req.body;

    const results = await graphqlService.executeGraphQLQuery(query, variables);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

// Explain results endpoint
router.post('/explain', validateRequest(schemas.explainResults), async (req, res, next) => {
  try {
    const { query, results } = req.body;

    const explanation = await claudeService.explainResults(query, results);

    res.json({
      success: true,
      data: { explanation },
    });
  } catch (error) {
    next(error);
  }
});

// Validate and optimize query endpoint
router.post('/query/validate', async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      throw new AppError('Query is required', 400);
    }

    const validation = await claudeService.validateAndOptimizeQuery(query);

    res.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    next(error);
  }
});

// Check direct connection
router.get('/connection/direct', async (req, res, next) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      throw new AppError('Both "from" and "to" addresses are required', 400);
    }

    const connected = await neo4jService.checkDirectConnection(from as string, to as string);

    res.json({
      success: true,
      data: { connected, from, to },
    });
  } catch (error) {
    next(error);
  }
});

// Check relationship
router.get('/connection/relationship', async (req, res, next) => {
  try {
    const { address1, address2, maxHops } = req.query;

    if (!address1 || !address2) {
      throw new AppError('Both addresses are required', 400);
    }

    const result = await neo4jService.checkRelationship(
      address1 as string,
      address2 as string,
      maxHops ? parseInt(maxHops as string) : 3
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Get transactions to address
router.get('/transactions/to/:address', async (req, res, next) => {
  try {
    const { address } = req.params;
    const { startTime, endTime, minValue } = req.query;

    const transactions = await neo4jService.getTransactionsTo(
      address,
      startTime ? parseInt(startTime as string) : undefined,
      endTime ? parseInt(endTime as string) : undefined,
      minValue ? parseFloat(minValue as string) : undefined
    );

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

// Get address info
router.get('/address/:address', async (req, res, next) => {
  try {
    const { address } = req.params;

    const info = await neo4jService.getAddressInfo(address);

    if (!info) {
      throw new AppError('Address not found', 404);
    }

    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    next(error);
  }
});

// Health check
router.get('/health', async (_, res, next) => {
  try {
    const neo4jHealthy = await neo4jService.healthCheck();

    res.json({
      success: true,
      data: {
        status: neo4jHealthy ? 'healthy' : 'unhealthy',
        neo4j: neo4jHealthy,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
