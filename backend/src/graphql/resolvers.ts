import { Neo4jService } from '../services/neo4j.service';

const neo4jService = new Neo4jService();

export const resolvers = {
  checkDirectConnection: async ({ fromAddress, toAddress }: any) => {
    return neo4jService.checkDirectConnection(fromAddress, toAddress);
  },

  checkRelationship: async ({ address1, address2, maxHops }: any) => {
    return neo4jService.checkRelationship(address1, address2, maxHops || 3);
  },

  shortestPath: async ({ fromAddress, toAddress }: any) => {
    return neo4jService.findShortestPath(fromAddress, toAddress);
  },

  transactionsTo: async ({ address, startTime, endTime, minValue }: any) => {
    return neo4jService.getTransactionsTo(address, startTime, endTime, minValue);
  },

  transactionsBetween: async ({ address1, address2, startTime, endTime }: any) => {
    return neo4jService.getTransactionsBetween(address1, address2, startTime, endTime);
  },

  topSenders: async ({ toAddress, limit }: any) => {
    return neo4jService.getTopSenders(toAddress, limit || 10);
  },

  addressesAtDistance: async ({ fromAddress, hops }: any) => {
    return neo4jService.getAddressesAtDistance(fromAddress, hops);
  },

  transactionGraph: async ({ address, depth }: any) => {
    return neo4jService.getTransactionGraph(address, depth || 2);
  },

  transactionCount: async ({ address, startTime, endTime }: any) => {
    return neo4jService.getTransactionCount(address, startTime, endTime);
  },

  addressInfo: async ({ address }: any) => {
    return neo4jService.getAddressInfo(address);
  },
};
