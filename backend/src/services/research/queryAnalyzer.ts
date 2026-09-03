import { SearchResult } from '../../types';

/**
 * Analyzes research questions to understand intent and context
 */
export class QueryAnalyzer {
  analyzeQuestion(question: string): {
    mainTopic: string;
    subtopics: string[];
    keyTerms: string[];
  } {
    const words = question.toLowerCase().split(/\s+/);
    const keyTerms = words.filter(w => w.length > 4);
    
    return {
      mainTopic: question.split('?')[0].trim(),
      subtopics: this.extractSubtopics(question),
      keyTerms
    };
  }

  private extractSubtopics(question: string): string[] {
    const subtopics: string[] = [];
    const patterns = ['about', 'regarding', 'concerning', 'related to'];
    
    for (const pattern of patterns) {
      const regex = new RegExp(`${pattern}\s+([^,?]+)`, 'gi');
      const matches = question.matchAll(regex);
      for (const match of matches) {
        subtopics.push(match[1].trim());
      }
    }
    
    return subtopics;
  }

  generateQueries(question: string): string[] {
    const analysis = this.analyzeQuestion(question);
    const queries: string[] = [
      question,
      analysis.mainTopic,
      ...analysis.keyTerms.slice(0, 3).map(term => `${term} research`),
    ];
    
    return queries.filter((q, idx, arr) => arr.indexOf(q) === idx).slice(0, 5);
  }
}
