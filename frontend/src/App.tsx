import './index.css';
import React, { useState } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import { ResearchForm } from './components/ResearchForm';
import { ResearchingPage } from './components/ResearchingPage';
import { ResultsPage } from './components/ResultsPage';
import { pollResearchResult } from './services/api';
import { ResearchResult } from './types';

type PageState = 'home' | 'researching' | 'results';

function App() {
  const [page, setPage] = useState<PageState>('home');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartResearch = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setPage('researching');
    setError('');
    setIsLoading(true);

    try {
      const researchResult = await pollResearchResult(sessionId);
      setResult(researchResult);
      setPage('results');
    } catch (err: any) {
      setError(err.message || 'Research failed');
      setPage('home');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (sessionId: string) => {
    handleStartResearch(sessionId);
  };

  const handleBack = () => {
    setPage('home');
    setResult(null);
    setCurrentSessionId('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Research Assistant</h1>
              <p className="text-sm text-gray-600">Powered by AI and web search</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Research Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {page === 'home' && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Ask Anything</h2>
              <p className="text-lg text-gray-600">
                Get comprehensive research answers powered by AI analysis and web search
              </p>
            </div>
            <ResearchForm
              onSubmit={handleSubmit}
              onError={setError}
              isLoading={isLoading}
            />
          </div>
        )}

        {page === 'researching' && (
          <ResearchingPage
            question={currentQuestion}
            onCancel={handleBack}
          />
        )}

        {page === 'results' && result && (
          <ResultsPage result={result} onBack={handleBack} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>Research Assistant © 2024. Built with React, TypeScript, and AI.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
