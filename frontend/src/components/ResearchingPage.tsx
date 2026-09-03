import React from 'react';
import { ProgressIndicator } from './ProgressIndicator';
import { AlertCircle, Loader } from 'lucide-react';

interface ResearchingPageProps {
  question: string;
  onCancel: () => void;
}

export function ResearchingPage({ question, onCancel }: ResearchingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Researching Your Question</h2>
          <p className="text-gray-600 italic">"{question}"</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <ProgressIndicator currentStage="searching_sources" />
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 text-center">
            This typically takes 30-120 seconds depending on the complexity of your question.
          </p>
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel Research
          </button>
        </div>
      </div>
    </div>
  );
}
