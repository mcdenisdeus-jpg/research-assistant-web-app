import { RankedSource, SearchResult } from '../../types';

/**
 * Ranks search results by quality and relevance
 */
export class SourceRanker {
  // Domain patterns for source quality assessment
  private academicDomains = [
    '.edu',
    'scholar.google',
    'arxiv.org',
    'pubmed.ncbi',
    'jstor.org',
    'researchgate',
  ];

  private governmentDomains = ['.gov', '.org.uk', 'nasa.gov', 'noaa.gov'];

  private newsDomains = [
    'bbc.com',
    'reuters.com',
    'apnews.com',
    'bbc.co.uk',
    'theguardian.com',
    'nytimes.com',
    'wsj.com',
    'economist.com',
  ];

  private lowQualityPatterns = [
    'clickbait',
    'content farm',
    'listicle',
    'sponsored',
    'advertisement',
  ];

  rank(results: SearchResult[]): RankedSource[] {
    // Remove duplicates by URL
    const seen = new Set<string>();
    const unique = results.filter((r) => {
      const key = r.url.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Score each result
    const ranked = unique.map((result) => this.scoreResult(result));

    // Sort by score descending
    ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Take top 8-12 sources
    return ranked.slice(0, 12);
  }

  private scoreResult(result: SearchResult): RankedSource {
    let score = result.relevanceScore || 0.5;
    let sourceType: 'academic' | 'government' | 'news' | 'general' = 'general';
    let sourceQuality: 'high' | 'medium' | 'low' = 'medium';

    const domain = (result.domain || '').toLowerCase();
    const title = (result.title || '').toLowerCase();
    const snippet = (result.snippet || '').toLowerCase();

    // Detect source type
    if (this.academicDomains.some((d) => domain.includes(d))) {
      sourceType = 'academic';
      sourceQuality = 'high';
      score += 0.3;
    } else if (this.governmentDomains.some((d) => domain.includes(d))) {
      sourceType = 'government';
      sourceQuality = 'high';
      score += 0.25;
    } else if (this.newsDomains.some((d) => domain.includes(d))) {
      sourceType = 'news';
      sourceQuality = 'high';
      score += 0.2;
    }

    // Boost recent publications
    if (result.publishedDate) {
      const pubDate = new Date(result.publishedDate);
      const now = new Date();
      const daysSince = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince < 7) score += 0.15;
      else if (daysSince < 30) score += 0.1;
      else if (daysSince < 365) score += 0.05;
    }

    // Penalize low quality indicators
    if (this.lowQualityPatterns.some((p) => title.includes(p) || snippet.includes(p))) {
      sourceQuality = 'low';
      score -= 0.3;
    }

    // Ensure score stays in 0-1 range
    score = Math.max(0, Math.min(1, score));

    return {
      id: result.id,
      title: result.title,
      url: result.url,
      domain: result.domain,
      snippet: result.snippet,
      publishedDate: result.publishedDate,
      relevanceScore: score,
      sourceType,
      sourceQuality,
      contentRetrieved: false,
    };
  }
}
