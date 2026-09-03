export interface SearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  publishedDate?: string;
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
  status: 'pending' | 'searching' | 'analyzing' | 'synthesizing' | 'complete' | 'error';
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
