import { Neo4jService } from './neo4j.service';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export class GraphQLService {
  private neo4jService: Neo4jService;

  constructor() {
    this.neo4jService = new Neo4jService();
  }

  async executeGraphQLQuery(query: string, variables?: Record<string, any>): Promise<any> {
    try {
      logger.info('Executing GraphQL query', { query, variables });

      // Parse the GraphQL query to determine which Neo4j method to call
      const result = await this.routeQuery(query, variables);

      logger.info('GraphQL query executed successfully');
      return result;
    } catch (error) {
      logger.error('GraphQL query execution failed', { error, query });
      return null;
    }
  }

  private async routeQuery(query: string, variables?: Record<string, any>): Promise<any> {
    const queryLower = query.toLowerCase();

    // Check direct connection
    if (queryLower.includes('checkdirectconnection')) {
      const { fromAddress, toAddress } = this.extractVariables(variables, [
        'fromAddress',
        'toAddress',
      ]);
      return {
        checkDirectConnection: await this.neo4jService.checkDirectConnection(
          fromAddress,
          toAddress
        ),
      };
    }

    // Check relationship
    if (queryLower.includes('checkrelationship')) {
      const { address1, address2, maxHops } = this.extractVariables(variables, [
        'address1',
        'address2',
        'maxHops',
      ]);
      return {
        checkRelationship: await this.neo4jService.checkRelationship(
          address1,
          address2,
          maxHops || 3
        ),
      };
    }

    // Shortest path
    if (queryLower.includes('shortestpath')) {
      const { fromAddress, toAddress } = this.extractVariables(variables, [
        'fromAddress',
        'toAddress',
      ]);
      return {
        shortestPath: await this.neo4jService.findShortestPath(fromAddress, toAddress),
      };
    }

    // Transactions to address
    if (queryLower.includes('transactionsto')) {
      const { address, startTime, endTime, minValue } = this.extractVariables(variables, [
        'address',
        'startTime',
        'endTime',
        'minValue',
      ]);
      return {
        transactionsTo: await this.neo4jService.getTransactionsTo(
          address,
          startTime,
          endTime,
          minValue
        ),
      };
    }

    // Transactions between
    if (queryLower.includes('transactionsbetween')) {
      const { address1, address2, startTime, endTime } = this.extractVariables(variables, [
        'address1',
        'address2',
        'startTime',
        'endTime',
      ]);
      return {
        transactionsBetween: await this.neo4jService.getTransactionsBetween(
          address1,
          address2,
          startTime,
          endTime
        ),
      };
    }

    // Top senders
    if (queryLower.includes('topsenders')) {
      const { toAddress, limit } = this.extractVariables(variables, ['toAddress', 'limit']);
      return {
        topSenders: await this.neo4jService.getTopSenders(toAddress, limit || 10),
      };
    }

    // Addresses at distance
    if (queryLower.includes('addressesatdistance')) {
      const { fromAddress, hops } = this.extractVariables(variables, ['fromAddress', 'hops']);
      return {
        addressesAtDistance: await this.neo4jService.getAddressesAtDistance(fromAddress, hops),
      };
    }

    // Transaction graph
    if (queryLower.includes('transactiongraph')) {
      const { address, depth } = this.extractVariables(variables, ['address', 'depth']);
      return {
        transactionGraph: await this.neo4jService.getTransactionGraph(address, depth || 2),
      };
    }

    // Transaction count
    if (queryLower.includes('transactioncount')) {
      const { address, startTime, endTime } = this.extractVariables(variables, [
        'address',
        'startTime',
        'endTime',
      ]);
      return {
        transactionCount: await this.neo4jService.getTransactionCount(address, startTime, endTime),
      };
    }

    // Address info
    if (queryLower.includes('addressinfo')) {
      const { address } = this.extractVariables(variables, ['address']);
      return {
        addressInfo: await this.neo4jService.getAddressInfo(address),
      };
    }

    throw new AppError('Unknown query type', 400);
  }

  private extractVariables(
    variables: Record<string, any> | undefined,
    requiredKeys: string[]
  ): Record<string, any> {
    const extracted: Record<string, any> = {};

    if (!variables) {
      throw new AppError('Missing required variables', 400);
    }

    for (const key of requiredKeys) {
      if (variables[key] !== undefined) {
        extracted[key] = variables[key];
      }
    }

    return extracted;
  }
}
