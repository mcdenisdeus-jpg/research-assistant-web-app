import { SearchProvider } from '../../types';

/**
 * SearchProvider interface
 * Implement this to add a new search provider
 */
export interface ISearchProvider {
  search(query: string): Promise<any[]>;
}

/**
 * Factory for creating search providers
 */
export class SearchProviderFactory {
  static createProvider(type: string, apiKey: string): ISearchProvider {
    if (type === 'bing') {
      const { BingSearchProvider } = require('./bingSearch');
      return new BingSearchProvider(apiKey);
    }
    // Future: 'google', 'duckduckgo', etc.
    throw new Error(`Unknown search provider: ${type}`);
  }
}
