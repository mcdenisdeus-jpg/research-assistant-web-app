import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { startResearch } from '../services/api';

interface ResearchFormProps {
  onSubmit: (sessionId: string) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

export function ResearchForm({ onSubmit, onError, isLoading = false }: ResearchFormProps) {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!question.trim()) {
      setError('Please enter a research question');
      return;
    }

    if (question.length > 500) {
      setError('Question is too long (max 500 characters)');
      return;
    }

    try {
      const result = await startResearch(question);
      setQuestion('');
      onSubmit(result.sessionId);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to start research';
      setError(errorMsg);
      onError(errorMsg);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="question" className="block text-sm font-medium text-gray-700">
            Research Question
          </label>
          <div className="relative">
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything you want to research... e.g., 'What are the latest developments in AI safety?'"
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={4}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {question.length}/500
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Search className="w-5 h-5" />
          {isLoading ? 'Researching...' : 'Start Research'}
        </button>
      </form>
    </div>
  );
}
