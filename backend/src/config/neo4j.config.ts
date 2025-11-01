import neo4j, { Driver, Session } from 'neo4j-driver';
import { config } from './environment';
import { logger } from '../utils/logger';

export class Neo4jConfig {
  private static instance: Neo4jConfig;
  private driver: Driver | null = null;

  private constructor() {}

  public static getInstance(): Neo4jConfig {
    if (!Neo4jConfig.instance) {
      Neo4jConfig.instance = new Neo4jConfig();
    }
    return Neo4jConfig.instance;
  }

  public async connect(): Promise<Driver> {
    if (this.driver) {
      return this.driver;
    }

    try {
      this.driver = neo4j.driver(
        config.neo4j.uri,
        neo4j.auth.basic(config.neo4j.user, config.neo4j.password),
        {
          maxConnectionPoolSize: 50,
          connectionAcquisitionTimeout: 30000,
          maxTransactionRetryTime: 30000,
        }
      );

      // Verify connectivity
      await this.driver.verifyConnectivity();
      logger.info('Neo4j connection established successfully');

      return this.driver;
    } catch (error) {
      logger.error('Failed to connect to Neo4j', { error });
      throw new Error(`Neo4j connection failed: ${error}`);
    }
  }

  public getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }
    return this.driver.session();
  }

  public async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      logger.info('Neo4j connection closed');
    }
  }

  public getDriver(): Driver {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }
    return this.driver;
  }
}

export const neo4jConfig = Neo4jConfig.getInstance();
