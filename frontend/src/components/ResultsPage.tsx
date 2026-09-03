import React from 'react';
import { Clock, FileText, Link2, AlertCircle } from 'lucide-react';
import { ResearchResult } from '../types';
import { SourceCard } from './SourceCard';

interface ResultsPageProps {
  result: ResearchResult;
  onBack: () => void;
}

export function ResultsPage({ result, onBack }: ResultsPageProps) {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
          >
            ← Back to Research
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{result.question}</h1>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(result.metadata.researchDurationMs)}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {result.metadata.sourcesRetrieved} sources
            </div>
            <div className="flex items-center gap-1">
              <Link2 className="w-4 h-4" />
              {result.citations.length} citations
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Research Answer</h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {result.answer}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Search Queries</p>
            <p className="text-2xl font-bold text-blue-600">{result.metadata.searchQueriesGenerated.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Total Results</p>
            <p className="text-2xl font-bold text-green-600">{result.metadata.totalSearchResults}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Top Sources</p>
            <p className="text-2xl font-bold text-purple-600">{result.metadata.sourcesFound}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Retrieved</p>
            <p className="text-2xl font-bold text-orange-600">{result.metadata.sourcesRetrieved}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sources</h2>
          <div className="space-y-3">
            {result.sources.length === 0 ? (
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">No sources were retrieved for this research.</p>
              </div>
            ) : (
              result.sources.map((source, idx) => (
                <SourceCard
                  key={source.id}
                  source={source}
                  citationNumber={idx + 1}
                />
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Search Queries Used</h3>
          <div className="flex flex-wrap gap-2">
            {result.metadata.searchQueriesGenerated.map((query, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {query}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
