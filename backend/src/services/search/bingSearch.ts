import { SearchProvider, SearchResult } from '../../types';
import axios from 'axios';

interface BingSearchResponse {
  webPages: {
    value: Array<{
      id: string;
      name: string;
      url: string;
      displayUrl: string;
      snippet: string;
      datePublished?: string;
    }>;
  };
}

export class BingSearchProvider implements SearchProvider {
  private apiKey: string;
  private endpoint = 'https://api.bing.microsoft.com/v7.0/search';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Bing Search API key is required');
    }
    this.apiKey = apiKey;
  }

  async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    try {
      const response = await axios.get<BingSearchResponse>(this.endpoint, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
        },
        params: {
          q: query,
          count: 10,
          mkt: 'en-US',
        },
        timeout: 10000,
      });

      if (!response.data.webPages || !response.data.webPages.value) {
        return [];
      }

      return response.data.webPages.value.map((item, index) => ({
        id: item.id,
        title: item.name,
        url: item.url,
        domain: new URL(item.url).hostname || '',
        snippet: item.snippet,
        publishedDate: item.datePublished,
        relevanceScore: 1 - index * 0.05, // Decay by position
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid Bing Search API key');
        } else if (error.response?.status === 429) {
          throw new Error('Bing Search API rate limit exceeded');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Bing Search API request timeout');
        }
      }
      throw new Error(`Bing Search API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
