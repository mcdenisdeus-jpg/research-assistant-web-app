/**
 * Analyzes research questions and generates search queries
 */
export class QueryAnalyzer {
  /**
   * Analyzes a research question and determines key aspects
   */
  analyzeQuestion(question: string): {
    keywords: string[];
    isCurrentEvents: boolean;
    isComplex: boolean;
    mainTopic: string;
  } {
    const cleaned = question.toLowerCase().trim();

    // Detect if question requires current information
    const currentEventKeywords = ['latest', 'recent', 'today', 'today', 'now', 'current', '2024', '2025'];
    const isCurrentEvents = currentEventKeywords.some((kw) => cleaned.includes(kw));

    // Extract keywords (simple approach)
    const keywords = cleaned
      .split(/\s+/)
      .filter((w) => w.length > 3 && !this.isStopWord(w))
      .slice(0, 5);

    // Detect complexity
    const isComplex = question.length > 50 || question.includes('how') || question.includes('why');

    return {
      keywords: keywords.length > 0 ? keywords : [question.substring(0, 30)],
      isCurrentEvents,
      isComplex,
      mainTopic: keywords[0] || question.substring(0, 20),
    };
  }

  /**
   * Generates multiple search queries from a single question
   */
  generateQueries(question: string): string[] {
    const analysis = this.analyzeQuestion(question);
    const queries: string[] = [];

    // Original question as first query
    queries.push(question);

    // Keyword-focused query
    if (analysis.keywords.length > 0) {
      queries.push(analysis.keywords.join(' '));
    }

    // Add contextual variants
    if (analysis.isCurrentEvents) {
      queries.push(`${analysis.mainTopic} latest 2024`);
      queries.push(`${analysis.mainTopic} recent developments`);
    }

    if (analysis.isComplex) {
      // Add "how" or "why" variants
      if (question.toLowerCase().startsWith('what')) {
        queries.push(`explain ${analysis.mainTopic}`);
        queries.push(`${analysis.mainTopic} definition`);
      }
    }

    // Add academic search variant
    queries.push(`${analysis.mainTopic} research study`);

    // Remove duplicates and limit to 5 queries
    return [...new Set(queries)].slice(0, 5);
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'is',
      'was',
      'are',
      'be',
      'do',
      'does',
      'what',
      'which',
      'who',
      'when',
      'where',
      'why',
      'how',
    ];
    return stopWords.includes(word);
  }
}
