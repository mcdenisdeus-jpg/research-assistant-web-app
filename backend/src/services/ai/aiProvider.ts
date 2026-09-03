import { AIProvider } from '../../types';

/**
 * Factory for creating AI providers
 */
export class AIProviderFactory {
  static createProvider(type: string, apiKey: string): AIProvider {
    if (type === 'openai') {
      const { OpenAIProvider } = require('./openaiProvider');
      return new OpenAIProvider(apiKey);
    }
    // Future: 'anthropic', 'cohere', etc.
    throw new Error(`Unknown AI provider: ${type}`);
  }
}
