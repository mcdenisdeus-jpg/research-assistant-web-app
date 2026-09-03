import axios from 'axios';
import { RankedSource } from '../../types';

/**
 * Retrieves full content from web sources
 * Handles timeouts, errors, and inaccessible pages gracefully
 */
export class SourceRetriever {
  private readonly timeout = 8000; // milliseconds
  private readonly maxContentLength = 50000; // characters

  async retrieveSource(source: RankedSource): Promise<RankedSource> {
    try {
      const response = await axios.get(source.url, {
        timeout: this.timeout,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        maxRedirects: 3,
      });

      if (response.status !== 200) {
        source.retrievalError = `HTTP ${response.status}`;
        return source;
      }

      let content = response.data;

      // Extract text from HTML if needed
      if (typeof content === 'string' && content.includes('<html')) {
        content = this.extractTextFromHTML(content);
      }

      // Limit content size
      if (content.length > this.maxContentLength) {
        content = content.substring(0, this.maxContentLength) + '...';
      }

      source.content = content;
      source.contentRetrieved = true;
      return source;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          source.retrievalError = 'Request timeout';
        } else if (error.code === 'ENOTFOUND') {
          source.retrievalError = 'Domain not found';
        } else if (error.response?.status === 404) {
          source.retrievalError = 'Page not found';
        } else if (error.response?.status === 403) {
          source.retrievalError = 'Access forbidden';
        } else {
          source.retrievalError = `Network error: ${error.code}`;
        }
      } else {
        source.retrievalError = 'Content retrieval failed';
      }
      source.contentRetrieved = false;
      return source;
    }
  }

  async retrieveMultipleSources(sources: RankedSource[]): Promise<RankedSource[]> {
    // Retrieve sources sequentially to avoid overwhelming the server
    const retrieved: RankedSource[] = [];
    for (const source of sources) {
      const result = await this.retrieveSource(source);
      retrieved.push(result);
      // Add small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    return retrieved;
  }

  private extractTextFromHTML(html: string): string {
    // Simple HTML to text extraction
    // Remove script and style tags
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, '');

    // Decode HTML entities
    text = text
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');

    // Clean up whitespace
    text = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');

    return text;
  }
}
