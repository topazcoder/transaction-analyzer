import { Session } from 'neo4j-driver';
import { neo4jConfig } from '../config/neo4j.config';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export class Neo4jService {
  private async executeQuery<T>(query: string, params: Record<string, any> = {}): Promise<T[]> {
    const session: Session = neo4jConfig.getSession();

    try {
      logger.debug('Executing Neo4j query', { query, params });
      const result = await session.run(query, params);

      const records = result.records.map((record) => {
        const obj: any = {};
        record.keys.forEach((key) => {
          const value = record.get(key);
          obj[key] = this.convertNeo4jValue(value);
        });
        return obj as T;
      });

      logger.debug('Query executed successfully', { recordCount: records.length });
      return records;
    } catch (error) {
      logger.error('Neo4j query failed', { error, query, params });
      throw new AppError('Database query failed', 500);
    } finally {
      await session.close();
    }
  }

  private convertNeo4jValue(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }

    if (value.constructor.name === 'Integer') {
      return value.toNumber();
    }

    if (value.constructor.name === 'Node') {
      return {
        ...value.properties,
        labels: value.labels,
      };
    }

    if (value.constructor.name === 'Relationship') {
      return {
        type: value.type,
        ...value.properties,
      };
    }

    if (value.constructor.name === 'Path') {
      return {
        start: this.convertNeo4jValue(value.start),
        end: this.convertNeo4jValue(value.end),
        segments: value.segments.map((seg: any) => ({
          start: this.convertNeo4jValue(seg.start),
          relationship: this.convertNeo4jValue(seg.relationship),
          end: this.convertNeo4jValue(seg.end),
        })),
        length: value.length,
      };
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.convertNeo4jValue(item));
    }

    if (typeof value === 'object') {
      const converted: any = {};
      for (const key in value) {
        converted[key] = this.convertNeo4jValue(value[key]);
      }
      return converted;
    }

    return value;
  }

  // Query methods
  async checkDirectConnection(fromAddress: string, toAddress: string): Promise<boolean> {
    const query = `
      MATCH (a1:Address {address: $fromAddress})-[:SENT]->(t:Transaction)-[:RECEIVED_BY]->(a2:Address {address: $toAddress})
      RETURN count(t) > 0 as connected
    `;

    const result = await this.executeQuery<{ connected: boolean }>(query, {
      fromAddress: fromAddress.toLowerCase(),
      toAddress: toAddress.toLowerCase(),
    });

    return result[0]?.connected || false;
  }

  async checkRelationship(
    address1: string,
    address2: string,
    maxHops: number = 3
  ): Promise<{
    related: boolean;
    distance?: number;
  }> {
    const query = `
      MATCH path = shortestPath(
        (a1:Address {address: $address1})-[*..${maxHops}]-(a2:Address {address: $address2})
      )
      RETURN length(path) as distance
    `;

    const result = await this.executeQuery<{ distance: number }>(query, {
      address1: address1.toLowerCase(),
      address2: address2.toLowerCase(),
    });

    if (result.length === 0) {
      return { related: false };
    }

    return {
      related: true,
      distance: result[0].distance,
    };
  }

  async findShortestPath(fromAddress: string, toAddress: string): Promise<any> {
    const query = `
      MATCH path = shortestPath(
        (a1:Address {address: $fromAddress})-[*]-(a2:Address {address: $toAddress})
      )
      RETURN path
    `;

    const result = await this.executeQuery<{ path: any }>(query, {
      fromAddress: fromAddress.toLowerCase(),
      toAddress: toAddress.toLowerCase(),
    });

    return result[0]?.path || null;
  }

  async getTransactionsTo(
    address: string,
    startTime?: number,
    endTime?: number,
    minValue?: number
  ): Promise<any[]> {
    let query = `
      MATCH (a:Address)-[:SENT]->(t:Transaction)-[:RECEIVED_BY]->(target:Address {address: $address})
    `;

    const params: Record<string, any> = {
      address: address.toLowerCase(),
    };

    const conditions: string[] = [];

    if (startTime) {
      conditions.push('t.timestamp >= $startTime');
      params.startTime = startTime;
    }

    if (endTime) {
      conditions.push('t.timestamp <= $endTime');
      params.endTime = endTime;
    }

    if (minValue) {
      conditions.push('t.value_eth >= $minValue');
      params.minValue = minValue;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      RETURN t.hash as hash, t.block_number as blockNumber, t.timestamp as timestamp, 
             t.value_eth as value, a.address as fromAddress
      ORDER BY t.timestamp DESC
      LIMIT 100
    `;

    return this.executeQuery(query, params);
  }

  async getTransactionsBetween(
    address1: string,
    address2: string,
    startTime?: number,
    endTime?: number
  ): Promise<any[]> {
    let query = `
      MATCH (a1:Address {address: $address1})-[:SENT]->(t:Transaction)-[:RECEIVED_BY]->(a2:Address {address: $address2})
    `;

    const params: Record<string, any> = {
      address1: address1.toLowerCase(),
      address2: address2.toLowerCase(),
    };

    const conditions: string[] = [];

    if (startTime) {
      conditions.push('t.timestamp >= $startTime');
      params.startTime = startTime;
    }

    if (endTime) {
      conditions.push('t.timestamp <= $endTime');
      params.endTime = endTime;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      RETURN t.hash as hash, t.block_number as blockNumber, t.timestamp as timestamp, t.value_eth as value
      ORDER BY t.timestamp DESC
    `;

    return this.executeQuery(query, params);
  }

  async getTopSenders(toAddress: string, limit: number = 10): Promise<any[]> {
    const query = `
      MATCH (a:Address)-[:SENT]->(t:Transaction)-[:RECEIVED_BY]->(target:Address {address: $toAddress})
      RETURN a.address as address, count(t) as transactionCount, sum(t.value_eth) as totalValue
      ORDER BY transactionCount DESC
      LIMIT $limit
    `;

    return this.executeQuery(query, {
      toAddress: toAddress.toLowerCase(),
      limit,
    });
  }

  async getAddressesAtDistance(fromAddress: string, hops: number): Promise<any[]> {
    const query = `
      MATCH path = (start:Address {address: $fromAddress})-[*${hops}]-(end:Address)
      WHERE length(path) = $hops AND start <> end
      RETURN DISTINCT end.address as address, length(path) as distance
      LIMIT 100
    `;

    return this.executeQuery(query, {
      fromAddress: fromAddress.toLowerCase(),
      hops,
    });
  }

  async getTransactionGraph(address: string, depth: number = 2): Promise<any> {
    const query = `
      MATCH path = (center:Address {address: $address})-[*..${depth}]-(other:Address)
      WITH center, other, relationships(path) as rels
      RETURN center.address as centerAddress,
             collect(DISTINCT other.address) as connectedAddresses,
             collect(DISTINCT [r in rels | {type: type(r), properties: properties(r)}]) as relationships
      LIMIT 1
    `;

    const result = await this.executeQuery(query, {
      address: address.toLowerCase(),
    });

    return result[0] || null;
  }

  async getTransactionCount(
    address: string,
    startTime?: number,
    endTime?: number
  ): Promise<number> {
    let query = `
      MATCH (a:Address {address: $address})-[:SENT]->(t:Transaction)
    `;

    const params: Record<string, any> = {
      address: address.toLowerCase(),
    };

    const conditions: string[] = [];

    if (startTime) {
      conditions.push('t.timestamp >= $startTime');
      params.startTime = startTime;
    }

    if (endTime) {
      conditions.push('t.timestamp <= $endTime');
      params.endTime = endTime;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` RETURN count(t) as count`;

    const result = await this.executeQuery<{ count: number }>(query, params);
    return result[0]?.count || 0;
  }

  async getAddressInfo(address: string): Promise<any> {
    const query = `
      MATCH (a:Address {address: $address})
      OPTIONAL MATCH (a)-[:SENT]->(t:Transaction)
      WITH a, count(t) as sentCount, sum(t.value_eth) as totalSent
      OPTIONAL MATCH (a)<-[:RECEIVED_BY]-(t2:Transaction)
      RETURN a.address as address,
             sentCount,
             totalSent,
             count(t2) as receivedCount,
             sum(t2.value_eth) as totalReceived
    `;

    const result = await this.executeQuery(query, {
      address: address.toLowerCase(),
    });

    return result[0] || null;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const query = 'RETURN 1 as result';
      const result = await this.executeQuery<{ result: number }>(query);
      return result[0]?.result === 1;
    } catch (error) {
      logger.error('Neo4j health check failed', { error });
      return false;
    }
  }
}
