import { Citation, RankedSource } from '../../types';

/**
 * Manages citations and validates them against sources
 */
export class CitationManager {
  /**
   * Extracts citation numbers from answer text
   * Format: [1], [2], [3], etc.
   */
  extractCitationNumbers(answer: string): number[] {
    const citationRegex = /\[(\d+)\]/g;
    const citations = new Set<number>();
    let match;

    while ((match = citationRegex.exec(answer)) !== null) {
      citations.add(parseInt(match[1], 10));
    }

    return Array.from(citations).sort((a, b) => a - b);
  }

  /**
   * Maps citation numbers to actual sources
   */
  createCitations(answer: string, sources: RankedSource[]): Citation[] {
    const citedNumbers = this.extractCitationNumbers(answer);
    const citations: Citation[] = [];

    for (const num of citedNumbers) {
      if (num > 0 && num <= sources.length) {
        const source = sources[num - 1];
        citations.push({
          id: num,
          sourceId: source.id,
          claim: this.extractClaimForCitation(answer, num),
          sourceUrl: source.url,
        });
      }
    }

    return citations;
  }

  /**
   * Extracts the text around a citation to show the claim
   */
  private extractClaimForCitation(text: string, citationNumber: number): string {
    const regex = new RegExp(`[^.!?]*\\[${citationNumber}\\][^.!?]*[.!?]`, 'g');
    const match = regex.exec(text);

    if (match) {
      return match[0].substring(0, 150); // First 150 chars
    }

    return `Citation [${citationNumber}]`;
  }

  /**
   * Validates that all citations refer to actual sources
   */
  validateCitations(answer: string, sources: RankedSource[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const citedNumbers = this.extractCitationNumbers(answer);

    for (const num of citedNumbers) {
      if (num <= 0) {
        errors.push(`Invalid citation number: [${num}]`);
      } else if (num > sources.length) {
        errors.push(`Citation [${num}] refers to non-existent source`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Formats citations for display
   */
  formatCitationsForDisplay(
    citations: Citation[],
    sources: RankedSource[]
  ): Array<{ id: number; source: RankedSource; url: string }> {
    return citations.map((citation) => ({
      id: citation.id,
      source: sources.find((s) => s.id === citation.sourceId)!,
      url: citation.sourceUrl,
    }));
  }
}
