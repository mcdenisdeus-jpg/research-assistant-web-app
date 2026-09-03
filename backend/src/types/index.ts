// Types for the entire application

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedDate?: string;
  relevanceScore?: number;
}

export interface RankedSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedDate?: string;
  relevanceScore: number;
  sourceQuality: 'high' | 'medium' | 'low';
  sourceType: 'academic' | 'government' | 'news' | 'general';
  content?: string;
  contentRetrieved: boolean;
  retrievalError?: string;
}

export interface Citation {
  id: number;
  sourceId: string;
  claim: string;
  sourceUrl: string;
}

export interface ResearchResult {
  id: string;
  question: string;
  answer: string;
  citations: Citation[];
  sources: RankedSource[];
  metadata: {
    searchQueriesGenerated: string[];
    totalSearchResults: number;
    sourcesFound: number;
    sourcesRetrieved: number;
    researchDurationMs: number;
    timestamp: string;
  };
}

export interface ResearchSession {
  id: string;
  question: string;
  result?: ResearchResult;
  status: 'pending' | 'searching' | 'analyzing' | 'synthesizing' | 'complete' | 'error';
  progressStage: ProgressStage;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export type ProgressStage =
  | 'understanding_question'
  | 'generating_queries'
  | 'searching_sources'
  | 'filtering_results'
  | 'reading_sources'
  | 'comparing_evidence'
  | 'writing_report'
  | 'complete';

export interface SearchProvider {
  search(query: string): Promise<SearchResult[]>;
}

export interface AIProvider {
  generateResearchQueries(question: string): Promise<string[]>;
  generateFinalReport(context: ResearchContext): Promise<string>;
  validateCitations(answer: string, sources: RankedSource[]): Promise<Citation[]>;
}

export interface ResearchContext {
  originalQuestion: string;
  sources: RankedSource[];
  sourceContent: Map<string, string>;
}

export interface ProgressCallback {
  (stage: ProgressStage, details?: string): void;
}
