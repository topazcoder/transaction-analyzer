export const typeDefs = `
  type Query {
    checkDirectConnection(fromAddress: String!, toAddress: String!): Boolean!
    checkRelationship(address1: String!, address2: String!, maxHops: Int): RelationshipResult!
    shortestPath(fromAddress: String!, toAddress: String!): Path
    transactionsTo(address: String!, startTime: Int, endTime: Int, minValue: Float): [Transaction!]!
    transactionsBetween(address1: String!, address2: String!, startTime: Int, endTime: Int): [Transaction!]!
    topSenders(toAddress: String!, limit: Int): [Sender!]!
    addressesAtDistance(fromAddress: String!, hops: Int!): [AddressDistance!]!
    transactionGraph(address: String!, depth: Int): TransactionGraph
    transactionCount(address: String!, startTime: Int, endTime: Int): Int!
    addressInfo(address: String!): AddressInfo
  }

  type RelationshipResult {
    related: Boolean!
    distance: Int
  }

  type Path {
    start: Address!
    end: Address!
    segments: [PathSegment!]!
    length: Int!
  }

  type PathSegment {
    start: Address!
    relationship: Relationship!
    end: Address!
  }

  type Address {
    address: String!
    labels: [String!]
  }

  type Relationship {
    type: String!
  }

  type Transaction {
    hash: String!
    blockNumber: Int!
    timestamp: Int!
    value: Float!
    fromAddress: String
  }

  type Sender {
    address: String!
    transactionCount: Int!
    totalValue: Float!
  }

  type AddressDistance {
    address: String!
    distance: Int!
  }

  type TransactionGraph {
    centerAddress: String!
    connectedAddresses: [String!]!
    relationships: [[RelationshipInfo!]!]!
  }

  type RelationshipInfo {
    type: String!
    properties: String
  }

  type AddressInfo {
    address: String!
    sentCount: Int!
    totalSent: Float!
    receivedCount: Int!
    totalReceived: Float!
  }
`;
