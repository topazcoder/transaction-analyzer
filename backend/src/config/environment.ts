import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface Config {
  port: number;
  nodeEnv: string;
  neo4j: {
    uri: string;
    user: string;
    password: string;
  };
  claudeApiKey: string;
  cors: {
    origin: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: string;
  };
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config: Config = {
  port: parseInt(getEnvVar('PORT', '4000'), 10),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  neo4j: {
    uri: getEnvVar('NEO4J_URI'),
    user: getEnvVar('NEO4J_USER'),
    password: getEnvVar('NEO4J_PASSWORD'),
  },
  claudeApiKey: getEnvVar('CLAUDE_API_KEY'),
  cors: {
    origin: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
  },
  rateLimit: {
    windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    maxRequests: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  },
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
  },
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';
