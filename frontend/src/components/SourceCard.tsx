import React from 'react';
import { ExternalLink, FileText, Globe, Award } from 'lucide-react';
import { RankedSource } from '../types';

interface SourceCardProps {
  source: RankedSource;
  citationNumber?: number;
}

export function SourceCard({ source, citationNumber }: SourceCardProps) {
  const getQualityBadgeColor = () => {
    switch (source.sourceQuality) {
      case 'high':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = () => {
    switch (source.sourceType) {
      case 'academic':
        return <Award className="w-4 h-4" />;
      case 'government':
        return <Globe className="w-4 h-4" />;
      case 'news':
        return <FileText className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {citationNumber && (
            <span className="inline-block bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-2">
              [{citationNumber}]
            </span>
          )}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-semibold block truncate"
          >
            {source.title}
          </a>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{source.snippet}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <Globe className="w-3 h-3" />
            <span>{source.domain}</span>
            {source.publishedDate && (
              <>
                <span className="text-gray-300">•</span>
                <span>{new Date(source.publishedDate).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 space-y-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getQualityBadgeColor()}`}>
            {getTypeIcon()}
            <span className="capitalize">{source.sourceType}</span>
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open
          </a>
        </div>
      </div>
    </div>
  );
}
