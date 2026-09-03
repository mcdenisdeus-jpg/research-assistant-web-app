import { v4 as uuidv4 } from 'uuid';
import { QueryAnalyzer } from './queryAnalyzer';
import { SourceRanker } from './sourceRanker';
import { CitationManager } from './citationManager';
import { SourceRetriever } from '../search/sourceRetriever';
import { SearchProviderFactory } from '../search/searchProvider';
import { AIProviderFactory } from '../ai/aiProvider';
import {
  ResearchResult,
  ResearchSession,
  ProgressStage,
  RankedSource,
  ProgressCallback,
  ResearchContext,
} from '../../types';
import * as db from '../database/db';

export class ResearchOrchestrator {
  private queryAnalyzer = new QueryAnalyzer();
  private sourceRanker = new SourceRanker();
  private citationManager = new CitationManager();
  private sourceRetriever = new SourceRetriever();
  private searchProvider: any;
  private aiProvider: any;

  constructor(searchApiKey: string, aiApiKey: string) {
    this.searchProvider = SearchProviderFactory.createProvider('bing', searchApiKey);
    this.aiProvider = AIProviderFactory.createProvider('openai', aiApiKey);
  }

  async conductResearch(
    question: string,
    onProgress?: ProgressCallback
  ): Promise<ResearchResult> {
    const startTime = Date.now();
    const sessionId = uuidv4();
    const resultId = uuidv4();

    // Create session in database
    await db.runAsync(
      `INSERT INTO research_sessions (id, question, status, progress_stage, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, question, 'searching', 'understanding_question', new Date().toISOString()]
    );

    try {
      // Stage 1: Understand question
      this.emitProgress('understanding_question', onProgress);
      const analysis = this.queryAnalyzer.analyzeQuestion(question);

      // Stage 2: Generate search queries
      this.emitProgress('generating_queries', onProgress);
      let searchQueries: string[] = [];
      try {
        searchQueries = await this.aiProvider.generateResearchQueries(question);
      } catch (error) {
        // Fallback to simple query analysis
        searchQueries = this.queryAnalyzer.generateQueries(question);
      }

      // Save search queries
      for (const query of searchQueries) {
        await db.runAsync(
          `INSERT INTO search_queries (id, session_id, query) VALUES (?, ?, ?)`,
          [uuidv4(), sessionId, query]
        );
      }

      // Stage 3: Search sources
      this.emitProgress('searching_sources', onProgress);
      let allResults = [];
      for (const query of searchQueries) {
        try {
          const results = await this.searchProvider.search(query);
          allResults = allResults.concat(results);
        } catch (error) {
          console.error(`Search failed for query "${query}":`, error);
          // Continue with other queries
        }
      }

      if (allResults.length === 0) {
        throw new Error('No search results found. Please try a different question.');
      }

      // Stage 4: Filter and rank
      this.emitProgress('filtering_results', onProgress);
      const rankedSources = this.sourceRanker.rank(allResults);

      // Save sources to database
      for (const source of rankedSources) {
        await db.runAsync(
          `INSERT INTO sources (id, session_id, title, url, domain, snippet, published_date, source_type, source_quality, relevance_score)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            source.id,
            sessionId,
            source.title,
            source.url,
            source.domain,
            source.snippet,
            source.publishedDate || null,
            source.sourceType,
            source.sourceQuality,
            source.relevanceScore,
          ]
        );
      }

      // Stage 5: Retrieve source content
      this.emitProgress('reading_sources', onProgress);
      const sourcesWithContent = await this.sourceRetriever.retrieveMultipleSources(
        rankedSources.slice(0, 8) // Limit to top 8 sources
      );

      // Update sources with content
      for (const source of sourcesWithContent) {
        if (source.contentRetrieved) {
          await db.runAsync(
            `UPDATE sources SET content = ?, content_retrieved = 1 WHERE id = ?`,
            [source.content, source.id]
          );
        } else if (source.retrievalError) {
          await db.runAsync(`UPDATE sources SET retrieval_error = ? WHERE id = ?`, [
            source.retrievalError,
            source.id,
          ]);
        }
      }

      // Stage 6: Compare evidence
      this.emitProgress('comparing_evidence', onProgress);
      const researchContext = this.buildResearchContext(question, sourcesWithContent);

      // Stage 7: Write report
      this.emitProgress('writing_report', onProgress);
      let answer: string;
      try {
        answer = await this.aiProvider.generateFinalReport(researchContext);
      } catch (error) {
        // Fallback: create basic summary from sources
        answer = this.createFallbackAnswer(question, sourcesWithContent);
      }

      // Extract and validate citations
      const citations = this.citationManager.createCitations(answer, sourcesWithContent);
      const citationValidation = this.citationManager.validateCitations(answer, sourcesWithContent);

      if (!citationValidation.valid) {
        console.warn('Citation validation errors:', citationValidation.errors);
      }

      // Save result to database
      const duration = Date.now() - startTime;
      await db.runAsync(
        `INSERT INTO research_results (id, session_id, answer, search_queries_count, total_search_results, sources_found, sources_retrieved, research_duration_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resultId,
          sessionId,
          answer,
          searchQueries.length,
          allResults.length,
          rankedSources.length,
          sourcesWithContent.filter((s) => s.contentRetrieved).length,
          duration,
        ]
      );

      // Save citations
      for (const citation of citations) {
        await db.runAsync(
          `INSERT INTO citations (result_id, source_id, claim, source_url) VALUES (?, ?, ?, ?)`,
          [resultId, citation.sourceId, citation.claim, citation.sourceUrl]
        );
      }

      // Update session as complete
      await db.runAsync(
        `UPDATE research_sessions SET status = ?, result_id = ?, completed_at = ? WHERE id = ?`,
        ['complete', resultId, new Date().toISOString(), sessionId]
      );

      this.emitProgress('complete', onProgress);

      return {
        id: resultId,
        question,
        answer,
        citations,
        sources: sourcesWithContent,
        metadata: {
          searchQueriesGenerated: searchQueries,
          totalSearchResults: allResults.length,
          sourcesFound: rankedSources.length,
          sourcesRetrieved: sourcesWithContent.filter((s) => s.contentRetrieved).length,
          researchDurationMs: duration,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Save error to database
      await db.runAsync(
        `UPDATE research_sessions SET status = ?, error = ? WHERE id = ?`,
        ['error', errorMessage, sessionId]
      );

      throw error;
    }
  }

  private buildResearchContext(
    question: string,
    sources: RankedSource[]
  ): ResearchContext {
    const sourceContent = new Map<string, string>();

    for (const source of sources) {
      if (source.contentRetrieved && source.content) {
        sourceContent.set(source.id, source.content.substring(0, 3000));
      } else {
        sourceContent.set(source.id, source.snippet);
      }
    }

    return {
      originalQuestion: question,
      sources,
      sourceContent,
    };
  }

  private createFallbackAnswer(question: string, sources: RankedSource[]): string {
    let answer = `Based on available sources about "${question}":\n\n`;

    sources.slice(0, 5).forEach((source, idx) => {
      answer += `${idx + 1}. ${source.title} [${idx + 1}]\n${source.snippet}\n\n`;
    });

    return answer;
  }

  private emitProgress(stage: ProgressStage, callback?: ProgressCallback) {
    if (callback) {
      callback(stage);
    }
  }

  async getResearchHistory(limit: number = 20): Promise<ResearchSession[]> {
    const sessions = await db.allAsync(
      `SELECT id, question, status, created_at, completed_at FROM research_sessions
       ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );

    return sessions.map((s: any) => ({
      id: s.id,
      question: s.question,
      status: s.status,
      progressStage: 'complete' as ProgressStage,
      createdAt: s.created_at,
      completedAt: s.completed_at,
    }));
  }

  async getResearchById(id: string): Promise<ResearchResult | null> {
    const result = await db.getAsync(
      `SELECT * FROM research_results WHERE id = ?`,
      [id]
    );

    if (!result) return null;

    const citations = await db.allAsync(
      `SELECT * FROM citations WHERE result_id = ?`,
      [id]
    );

    const sources = await db.allAsync(
      `SELECT * FROM sources WHERE session_id = (SELECT session_id FROM research_results WHERE id = ?)`,
      [id]
    );

    return {
      id: result.id,
      question: result.question,
      answer: result.answer,
      citations,
      sources: sources as RankedSource[],
      metadata: {
        searchQueriesGenerated: [],
        totalSearchResults: result.total_search_results,
        sourcesFound: result.sources_found,
        sourcesRetrieved: result.sources_retrieved,
        researchDurationMs: result.research_duration_ms,
        timestamp: result.created_at,
      },
    };
  }
}
