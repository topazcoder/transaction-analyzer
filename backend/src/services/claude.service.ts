import Anthropic from '@anthropic-ai/sdk';
import {
  createClaudeClient,
  SYSTEM_PROMPTS,
  REQUEST_TEMPLATES,
  CLAUDE_ERRORS,
  calculateTokenCost
} from '../config/claude.config';
import {
  extractQueryParameters,
  determineQueryIntent,
  formatClaudeResponse,
  validateGraphQLQuery,
  QueryIntent,
} from '../utils/claude.helpers';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface ParsedQuery {
  graphqlQuery?: string;
  explanation: string;
  parameters?: Record<string, any>;
  intent?: QueryIntent;
  confidence?: number;
}

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = createClaudeClient();
  }

  async parseNaturalLanguageToGraphQL(prompt: string): Promise<ParsedQuery> {
    const startTime = Date.now();

    try {
      logger.info('Parsing natural language query', { prompt });

      const extractedParams = extractQueryParameters(prompt);
      const intent = determineQueryIntent(prompt);

      logger.info('Query analysis', { extractedParams, intent });
      
      const contextualPrompt = this.buildContextualPrompt(prompt, extractedParams, intent);

      const response = await this.client.messages.create({
        ...REQUEST_TEMPLATES.PRECISE,
        system: intent === QueryIntent.UNKNOWN ? '' : SYSTEM_PROMPTS.QUERY_PARSER,
        messages: [
          {
            role: 'user',
            content: contextualPrompt,
          },
        ],
      });

      const tokenUsage = calculateTokenCost({
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      });

      const parsedResult = this.parseClaudeResponse(response, extractedParams, intent);

      if (intent !== QueryIntent.UNKNOWN) {
        const validation = validateGraphQLQuery(parsedResult.graphqlQuery || '');
        if (!validation.valid) {
          logger.warn('Generated query has validation issues', {
            errors: validation.errors,
            query: parsedResult.graphqlQuery,
          });
        }

        const duration = Date.now() - startTime;
        logger.info('Successfully parsed query', {
          intent: parsedResult.intent,
          tokenUsage,
          durationMs: duration,
        });
      }

      return parsedResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to parse natural language query', {
        error,
        prompt,
        durationMs: duration,
      });
      throw new AppError(this.getErrorMessage(error), 500);
    }
  }

  async explainResults(query: string, results: any): Promise<string> {
    try {
      logger.info('Explaining query results');

      const prompt = results == null ? `
Original Question: ${query}

Please answer the question briefly. If there's available data for this question, answer based on that data.
` : `
Original Query: ${query}

Results:
${JSON.stringify(results, null, 2)}

Please explain these results in clear, simple language that anyone can understand.
`;

      const response = await this.client.messages.create({
        ...REQUEST_TEMPLATES.STANDARD,
        system: SYSTEM_PROMPTS.RESULT_EXPLAINER,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const explanation = this.extractTextContent(response);
      return explanation;
    } catch (error) {
      logger.error('Failed to explain results', { error });
      return 'Results retrieved successfully. See the data below for details.';
    }
  }

  async validateAndOptimizeQuery(query: string): Promise<{
    valid: boolean;
    issues: string[];
    optimizedQuery?: string;
    suggestions: string[];
  }> {
    try {
      logger.info('Validating and optimizing query');

      const prompt = `
Please validate and optimize this GraphQL query:

${query}

Check for:
1. Syntax errors
2. Field existence
3. Parameter formatting
4. Performance issues
5. Best practices

Provide validation results and an optimized version if improvements are possible.
Return as JSON with structure: {valid: boolean, issues: string[], optimizedQuery?: string, suggestions: string[]}
`;

      const response = await this.client.messages.create({
        ...REQUEST_TEMPLATES.PRECISE,
        system: SYSTEM_PROMPTS.QUERY_VALIDATOR,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = this.extractTextContent(response);

      try {
        const result = JSON.parse(formatClaudeResponse(content));
        return result;
      } catch {
        return {
          valid: true,
          issues: [],
          suggestions: [content],
        };
      }
    } catch (error) {
      logger.error('Failed to validate query', { error });
      return {
        valid: true,
        issues: [],
        suggestions: [],
      };
    }
  }

  private buildContextualPrompt(
    originalPrompt: string,
    extractedParams: any,
    intent: QueryIntent
  ): string {
    let context = `User Query: "${originalPrompt}"\n\n`;

    if (extractedParams.addresses.length > 0) {
      context += `Detected Addresses: ${extractedParams.addresses.join(', ')}\n`;
    }

    if (extractedParams.timeStart) {
      context += `Time Start: ${extractedParams.timeStart} (Unix timestamp)\n`;
    }

    if (extractedParams.timeEnd) {
      context += `Time End: ${extractedParams.timeEnd} (Unix timestamp)\n`;
    }

    if (extractedParams.value) {
      context += `Value Filter: ${extractedParams.value} ETH\n`;
    }

    if (extractedParams.limit) {
      context += `Limit: ${extractedParams.limit}\n`;
    }

    if (extractedParams.hops) {
      context += `Hops: ${extractedParams.hops}\n`;
    }

    if (intent != QueryIntent.UNKNOWN) {
      context += `\nDetected Intent: ${intent}\n\n`;
      context += `Please generate the appropriate GraphQL query based on this information.`;
    }

    return context;
  }

  private parseClaudeResponse(
    response: Anthropic.Message,
    extractedParams: any,
    intent: QueryIntent
  ): ParsedQuery {
    const content = this.extractTextContent(response);
    const formatted = formatClaudeResponse(content);

    if (intent === QueryIntent.UNKNOWN) {
      return {
        explanation: formatted
      }
    }

    try {
      const parsed = JSON.parse(formatted);

      return {
        graphqlQuery: parsed.graphqlQuery || parsed.query,
        explanation: parsed.explanation || 'Query generated successfully',
        parameters: parsed.parameters || extractedParams,
        intent,
        confidence: parsed.confidence || 0.9,
      };
    } catch (error) {
      logger.warn('Response is not JSON, attempting to extract query', { content: formatted });

      const queryMatch = formatted.match(/query\s*{[\s\S]*}/i);
      if (queryMatch) {
        return {
          graphqlQuery: queryMatch[0],
          explanation: 'Query extracted from response',
          parameters: extractedParams,
          intent,
        };
      }

      throw new AppError(CLAUDE_ERRORS.PARSING_ERROR, 500);
    }
  }

  private extractTextContent(response: Anthropic.Message): string {
    const textContent = response.content.find((block) => block.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      throw new AppError(CLAUDE_ERRORS.INVALID_RESPONSE, 500);
    }

    return textContent.text;
  }

  private getErrorMessage(error: any): string {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) return CLAUDE_ERRORS.RATE_LIMIT;
      if (error.status === 401) return CLAUDE_ERRORS.API_KEY_INVALID;
      return error.message || CLAUDE_ERRORS.UNKNOWN_ERROR;
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return CLAUDE_ERRORS.TIMEOUT;
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return CLAUDE_ERRORS.NETWORK_ERROR;
    }

    return CLAUDE_ERRORS.UNKNOWN_ERROR;
  }
}
