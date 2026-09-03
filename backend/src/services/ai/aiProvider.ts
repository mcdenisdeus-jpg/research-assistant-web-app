import { AIProvider } from '../../types';
import { OpenAIProvider } from './openaiProvider';

/**
 * Factory for creating AI providers
 */
export class AIProviderFactory {
  static createProvider(type: string, apiKey: string): AIProvider {
    if (type === 'openai') {
      return new OpenAIProvider(apiKey);
    }
    throw new Error(`Unknown AI provider: ${type}`);
  }
}
