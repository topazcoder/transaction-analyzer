import { logger } from './logger';
import { sanitizeInput, extractAddresses } from '../config/claude.config';

export const parseTimeExpression = (expression: string): number | null => {
  const now = Math.floor(Date.now() / 1000);
  const lowerExpr = expression.toLowerCase();

  const patterns = [
    { regex: /(\d+)\s*hour(?:s)?\s*ago/i, multiplier: 3600 },
    { regex: /(\d+)\s*day(?:s)?\s*ago/i, multiplier: 86400 },
    { regex: /(\d+)\s*week(?:s)?\s*ago/i, multiplier: 604800 },
    { regex: /(\d+)\s*month(?:s)?\s*ago/i, multiplier: 2592000 },
    { regex: /(\d+)\s*year(?:s)?\s*ago/i, multiplier: 31536000 },
  ];

  for (const pattern of patterns) {
    const match = lowerExpr.match(pattern.regex);
    if (match) {
      const value = parseInt(match[1]);
      return now - value * pattern.multiplier;
    }
  }

  if (lowerExpr.includes('yesterday')) return now - 86400;
  if (lowerExpr.includes('last week')) return now - 604800;
  if (lowerExpr.includes('last month')) return now - 2592000;

  try {
    const date = new Date(expression);
    if (!isNaN(date.getTime())) {
      return Math.floor(date.getTime() / 1000);
    }
  } catch (error) {
    logger.debug('Failed to parse date expression', { expression, error });
  }

  return null;
};

export const parseValueExpression = (expression: string): number | null => {
  const lowerExpr = expression.toLowerCase();

  const patterns = [
    { regex: /(\d+\.?\d*)\s*eth/i, multiplier: 1 },
    { regex: /(\d+\.?\d*)\s*ether/i, multiplier: 1 },
    { regex: /(\d+\.?\d*)\s*gwei/i, multiplier: 0.000000001 },
  ];

  for (const pattern of patterns) {
    const match = lowerExpr.match(pattern.regex);
    if (match) {
      const value = parseFloat(match[1]);
      return value * pattern.multiplier;
    }
  }

  const plainNumber = parseFloat(expression);
  if (!isNaN(plainNumber)) {
    return plainNumber;
  }

  return null;
};

export interface ExtractedParams {
  addresses: string[];
  timeStart?: number;
  timeEnd?: number;
  value?: number;
  limit?: number;
  hops?: number;
}

export const extractQueryParameters = (prompt: string): ExtractedParams => {
  const sanitized = sanitizeInput(prompt);
  const params: ExtractedParams = {
    addresses: extractAddresses(sanitized),
  };

  const timePatterns = [
    /in the (?:last|past) (.+?)(?:\s|$|,|\.|;)/i,
    /since (.+?)(?:\s|$|,|\.|;)/i,
    /from (.+?) to (.+?)(?:\s|$|,|\.|;)/i,
  ];

  for (const pattern of timePatterns) {
    const match = sanitized.match(pattern);
    if (match) {
      if (match.length === 2) {
        const timestamp = parseTimeExpression(match[1]);
        if (timestamp) params.timeStart = timestamp;
      } else if (match.length === 3) {
        const start = parseTimeExpression(match[1]);
        const end = parseTimeExpression(match[2]);
        if (start) params.timeStart = start;
        if (end) params.timeEnd = end;
      }
    }
  }

  const valuePatterns = [/(?:greater than|more than|above|over) (.+?)(?:\s|$|,|\.|;)/i];

  for (const pattern of valuePatterns) {
    const match = sanitized.match(pattern);
    if (match) {
      const value = parseValueExpression(match[1]);
      if (value !== null) params.value = value;
    }
  }

  const limitMatch = sanitized.match(/(?:top|first|limit) (\d+)/i);
  if (limitMatch) params.limit = parseInt(limitMatch[1]);

  const hopsMatch = sanitized.match(/(\d+)\s*hop(?:s)?/i);
  if (hopsMatch) params.hops = parseInt(hopsMatch[1]);

  return params;
};

export enum QueryIntent {
  CHECK_CONNECTION = 'CHECK_CONNECTION',
  CHECK_RELATIONSHIP = 'CHECK_RELATIONSHIP',
  FIND_PATH = 'FIND_PATH',
  GET_TRANSACTIONS = 'GET_TRANSACTIONS',
  GET_TRANSACTIONS_BETWEEN = 'GET_TRANSACTIONS_BETWEEN',
  TOP_SENDERS = 'TOP_SENDERS',
  ADDRESSES_AT_DISTANCE = 'ADDRESSES_AT_DISTANCE',
  TRANSACTION_GRAPH = 'TRANSACTION_GRAPH',
  TRANSACTION_COUNT = 'TRANSACTION_COUNT',
  ADDRESS_INFO = 'ADDRESS_INFO',
  UNKNOWN = 'UNKNOWN',
}

export const determineQueryIntent = (prompt: string): QueryIntent => {
  const lower = prompt.toLowerCase();

  if (/(?:are|is).+(?:directly )?connected/i.test(lower)) {
    return QueryIntent.CHECK_CONNECTION;
  }

  if (/(?:are|is).+related/i.test(lower)) {
    return QueryIntent.CHECK_RELATIONSHIP;
  }

  if (/(?:shortest )?path (?:between|from)/i.test(lower)) {
    return QueryIntent.FIND_PATH;
  }

  if (/transactions? (?:sent )?to/i.test(lower)) {
    return QueryIntent.GET_TRANSACTIONS;
  }

  if (/transactions? between/i.test(lower)) {
    return QueryIntent.GET_TRANSACTIONS_BETWEEN;
  }

  if (/top.+sender/i.test(lower)) {
    return QueryIntent.TOP_SENDERS;
  }

  if (/\d+\s*hop(?:s)?\s*(?:away|from)/i.test(lower)) {
    return QueryIntent.ADDRESSES_AT_DISTANCE;
  }

  if (/(?:transaction )?(?:graph|network)/i.test(lower)) {
    return QueryIntent.TRANSACTION_GRAPH;
  }

  if (/(?:how many|count|number of) transactions?/i.test(lower)) {
    return QueryIntent.TRANSACTION_COUNT;
  }

  if (/(?:info|information|details) (?:about|on|for)/i.test(lower)) {
    return QueryIntent.ADDRESS_INFO;
  }

  return QueryIntent.UNKNOWN;
};

export const formatClaudeResponse = (response: string): string => {
  let formatted = response.replace(/```(?:json)?\n?/g, '');
  formatted = formatted.trim();
  return formatted;
};

export const validateGraphQLQuery = (query: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!query.includes('query') && !query.includes('mutation')) {
    errors.push('Query must start with "query" or "mutation"');
  }

  if (!query.includes('{') || !query.includes('}')) {
    errors.push('Query must have opening and closing braces');
  }

  const openBraces = (query.match(/{/g) || []).length;
  const closeBraces = (query.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced braces in query');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
