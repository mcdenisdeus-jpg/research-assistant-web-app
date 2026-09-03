import { SearchResult, RankedSource } from '../../types';

/**
 * Ranks and filters search results based on quality signals
 */
export class SourceRanker {
  private highQualityDomains = [
    'edu',
    'gov',
    'wikipedia.org',
    'arxiv.org',
    'researchgate.net',
    'scholar.google.com'
  ];

  private academicKeywords = ['research', 'study', 'analysis', 'findings', 'paper'];
  private newsKeywords = ['news', 'today', 'breaking', 'latest', 'announced'];

  rank(results: SearchResult[]): RankedSource[] {
    const ranked = results
      .map(result => this.enrichResult(result))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20); // Keep top 20

    return ranked;
  }

  private enrichResult(result: SearchResult): RankedSource {
    let score = result.relevanceScore || 0.5;
    let quality: 'high' | 'medium' | 'low' = 'medium';
    let type: 'academic' | 'government' | 'news' | 'general' = 'general';

    // Check domain quality
    const domain = new URL(result.url).hostname || '';
    if (this.isHighQualityDomain(domain)) {
      score += 0.3;
      quality = 'high';
    }

    // Determine source type
    if (this.isAcademic(result.title + ' ' + result.snippet)) {
      type = 'academic';
      score += 0.2;
    } else if (domain.includes('gov')) {
      type = 'government';
      score += 0.15;
    } else if (this.isNews(result.title + ' ' + result.snippet)) {
      type = 'news';
    }

    // Cap score at 1.0
    score = Math.min(score, 1.0);

    return {
      ...result,
      relevanceScore: score,
      sourceQuality: quality,
      sourceType: type,
      contentRetrieved: false
    };
  }

  private isHighQualityDomain(domain: string): boolean {
    return this.highQualityDomains.some(hq => domain.includes(hq));
  }

  private isAcademic(text: string): boolean {
    return this.academicKeywords.some(kw => text.toLowerCase().includes(kw));
  }

  private isNews(text: string): boolean {
    return this.newsKeywords.some(kw => text.toLowerCase().includes(kw));
  }
}
