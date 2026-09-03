import { AIProvider, ResearchContext, Citation, RankedSource } from '../../types';
import axios from 'axios';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * OpenAI provider for AI research synthesis
 */
export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private endpoint = 'https://api.openai.com/v1/chat/completions';
  private model = 'gpt-3.5-turbo';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.apiKey = apiKey;
  }

  async generateResearchQueries(question: string): Promise<string[]> {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content:
          'You are a research query generator. Generate 3-5 specific, focused search queries that would find the most relevant information to answer the user\'s question. Return only the queries, one per line, without numbering or bullets.',
      },
      {
        role: 'user',
        content: `Generate search queries for: ${question}`,
      },
    ];

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 300,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const content = response.data.choices[0].message.content;
      return content
        .split('\n')
        .map((q: string) => q.trim())
        .filter((q: string) => q.length > 0);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid OpenAI API key');
        } else if (error.response?.status === 429) {
          throw new Error('OpenAI API rate limit exceeded');
        } else if (error.response?.status === 503) {
          throw new Error('OpenAI API temporarily unavailable');
        }
      }
      throw new Error(
        `Failed to generate research queries: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async generateFinalReport(context: ResearchContext): Promise<string> {
    // Build source context
    const sourceContext = context.sources
      .map((source, idx) => {
        const content = context.sourceContent.get(source.id) || source.snippet;
        return `[SOURCE ${idx + 1}]: ${source.title}\nURL: ${source.url}\nContent: ${content}\n---`;
      })
      .join('\n\n');

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `You are a research synthesis expert. Your task is to:
1. Answer the user's research question comprehensively
2. Use information from the provided sources
3. Include citations in the format [1], [2], etc., referring to the source numbers
4. Be factual and avoid speculation
5. If sources disagree, mention the disagreement
6. Only cite sources you actually used
7. Structure your answer clearly with paragraphs

IMPORTANT: After your answer, include a line "---CITATIONS---" followed by a JSON array showing which sources you cited, like: {"citations": [1, 2, 3]}`,
      },
      {
        role: 'user',
        content: `Research Question: ${context.originalQuestion}\n\n${sourceContext}`,
      },
    ];

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages,
          temperature: 0.5,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid OpenAI API key');
        } else if (error.response?.status === 429) {
          throw new Error('OpenAI API rate limit exceeded - try again in a moment');
        } else if (error.response?.status === 503) {
          throw new Error('OpenAI API temporarily unavailable');
        }
      }
      throw new Error(
        `Failed to generate research report: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async validateCitations(answer: string, sources: RankedSource[]): Promise<Citation[]> {
    // Extract citations from answer (format: [1], [2], etc.)
    const citationRegex = /\[(\d+)\]/g;
    const citedIndices = new Set<number>();
    let match;

    while ((match = citationRegex.exec(answer)) !== null) {
      citedIndices.add(parseInt(match[1], 10));
    }

    const citations: Citation[] = [];
    citedIndices.forEach((idx) => {
      if (idx > 0 && idx <= sources.length) {
        const source = sources[idx - 1];
        citations.push({
          id: idx,
          sourceId: source.id,
          claim: `Source ${idx}`,
          sourceUrl: source.url,
        });
      }
    });

    return citations;
  }
}
