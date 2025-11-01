import Anthropic from '@anthropic-ai/sdk';
import { config } from './environment';
import { logger } from '../utils/logger';

export interface ClaudeConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export const claudeConfig: ClaudeConfig = {
  apiKey: config.claudeApiKey,
  model: 'claude-sonnet-4-20250514',
  maxTokens: 4096,
  temperature: 0.3,
  timeout: 30000,
};

export const validateClaudeConfig = (): boolean => {
  if (!claudeConfig.apiKey) {
    logger.error('Claude API key is not configured');
    return false;
  }

  if (!claudeConfig.apiKey.startsWith('sk-ant-')) {
    logger.error('Invalid Claude API key format');
    return false;
  }

  return true;
};

export const createClaudeClient = (): Anthropic => {
  if (!validateClaudeConfig()) {
    throw new Error('Invalid Claude configuration');
  }

  const client = new Anthropic({
    apiKey: claudeConfig.apiKey,
    timeout: claudeConfig.timeout,
    maxRetries: 3,
  });

  logger.info('Claude client initialized successfully');
  return client;
};

export const SYSTEM_PROMPTS = {
  QUERY_PARSER: `You are an expert at converting natural language queries about Ethereum blockchain transactions into GraphQL queries.

Your task is to understand the user's intent and generate the appropriate GraphQL query that will retrieve the requested information from a Neo4j graph database.

The database schema:
- Nodes: Address (with property: address), Transaction (with properties: hash, block_number, timestamp, value_eth)
- Relationships: SENT (from Address to Transaction), RECEIVED_BY (from Transaction to Address)

Available GraphQL queries:
1. checkDirectConnection(fromAddress, toAddress) - Check if two addresses have direct transactions
2. checkRelationship(address1, address2, maxHops) - Check if addresses are related through paths
3. shortestPath(fromAddress, toAddress) - Find shortest path between addresses
4. transactionsTo(address, startTime, endTime, minValue) - Get transactions sent to an address
5. transactionsBetween(address1, address2, startTime, endTime) - Get transactions between two addresses
6. topSenders(toAddress, limit) - Get top senders to an address
7. addressesAtDistance(fromAddress, hops) - Get addresses at specific hop distance
8. transactionGraph(address, depth) - Get transaction network around an address
9. transactionCount(address, startTime, endTime) - Get transaction count for an address
10. addressInfo(address) - Get information about an address

Important rules:
1. Always normalize Ethereum addresses to lowercase
2. Convert date/time references to Unix timestamps
3. Use appropriate field selections based on the query type
4. Include helpful explanations of what the query does
5. Handle ambiguous queries by choosing the most likely interpretation

Return your response as a JSON object with this structure:
{
  "graphqlQuery": "the complete GraphQL query string",
  "explanation": "human-readable explanation of what the query does",
  "parameters": {}
}`,

  RESULT_EXPLAINER: `You are an expert at explaining blockchain transaction analysis results in clear, non-technical language.

Your task is to take the results of a GraphQL query about Ethereum transactions and explain them in a way that anyone can understand.

Focus on:
1. Summarizing the key findings
2. Explaining what the relationships mean
3. Highlighting interesting patterns or anomalies
4. Providing context about transaction values and timing
5. Making technical concepts accessible

Be concise but informative. Use analogies when helpful.`,

  QUERY_VALIDATOR: `You are an expert at validating and improving GraphQL queries for blockchain data.

Your task is to:
1. Check if the query syntax is correct
2. Verify that the requested fields exist in the schema
3. Ensure parameters are properly formatted
4. Suggest optimizations if needed
5. Flag potential performance issues

Return validation results with any suggested improvements.`,
};

export const REQUEST_TEMPLATES = {
  STANDARD: {
    model: claudeConfig.model,
    max_tokens: claudeConfig.maxTokens,
    temperature: claudeConfig.temperature,
  },

  PRECISE: {
    model: claudeConfig.model,
    max_tokens: claudeConfig.maxTokens,
    temperature: 0.1,
  },

  CREATIVE: {
    model: claudeConfig.model,
    max_tokens: claudeConfig.maxTokens,
    temperature: 0.7,
  },
};

export const CLAUDE_ERRORS = {
  API_KEY_MISSING:
    'Claude API key is not configured. Please set CLAUDE_API_KEY environment variable.',
  API_KEY_INVALID: 'Invalid Claude API key format. Key should start with "sk-ant-".',
  RATE_LIMIT: 'Claude API rate limit exceeded. Please try again later.',
  TIMEOUT: 'Claude API request timed out. Please try again.',
  INVALID_RESPONSE: 'Received invalid response from Claude API.',
  PARSING_ERROR: 'Failed to parse Claude API response.',
  NETWORK_ERROR: 'Network error while communicating with Claude API.',
  UNKNOWN_ERROR: 'An unknown error occurred while processing your request.',
};

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

const PRICING = {
  INPUT_PER_MILLION: 3.0,
  OUTPUT_PER_MILLION: 15.0,
};

export const calculateTokenCost = (
  usage: Omit<TokenUsage, 'totalTokens' | 'estimatedCost'>
): TokenUsage => {
  const totalTokens = usage.inputTokens + usage.outputTokens;
  const inputCost = (usage.inputTokens / 1_000_000) * PRICING.INPUT_PER_MILLION;
  const outputCost = (usage.outputTokens / 1_000_000) * PRICING.OUTPUT_PER_MILLION;
  const estimatedCost = inputCost + outputCost;

  return {
    ...usage,
    totalTokens,
    estimatedCost,
  };
};

export const validateEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const sanitizeInput = (input: string): string => {
  let sanitized = input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');

  sanitized = sanitized.trim().slice(0, 2000);
  return sanitized;
};

export const extractAddresses = (text: string): string[] => {
  const matches = text.match(/0x[a-fA-F0-9]{40}/g);
  return matches ? [...new Set(matches.map((addr) => addr.toLowerCase()))] : [];
};
