import React from 'react';
import { ProgressStage } from '../types';

interface ProgressIndicatorProps {
  currentStage: ProgressStage;
}

const stageLabels: Record<ProgressStage, string> = {
  understanding_question: 'Understanding question',
  generating_queries: 'Generating search queries',
  searching_sources: 'Searching sources',
  filtering_results: 'Filtering and ranking results',
  reading_sources: 'Reading relevant sources',
  comparing_evidence: 'Comparing evidence',
  writing_report: 'Writing research report',
  complete: 'Complete',
};

const stages: ProgressStage[] = [
  'understanding_question',
  'generating_queries',
  'searching_sources',
  'filtering_results',
  'reading_sources',
  'comparing_evidence',
  'writing_report',
];

export function ProgressIndicator({ currentStage }: ProgressIndicatorProps) {
  const currentIndex = stages.indexOf(currentStage);
  const progress = ((currentIndex + 1) / stages.length) * 100;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">{stageLabels[currentStage]}</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        {stages.map((stage, idx) => (
          <div
            key={stage}
            className={`text-center py-1 rounded ${
              idx <= currentIndex
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {idx + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
