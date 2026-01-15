import { Spine } from './types';

export class SpineGenerator {
    /**
     * Generates a "Spine" from raw content.
     * A Spine is a compressed representation (keywords, summary) used for
     * low-cost relevance matching before full context loading.
     */
    generate(
        id: string,
        sourceId: string,
        type: 'L3_DOC' | 'L2_EPISODE' | 'PATTERN' | 'AGENT',
        content: string
    ): Spine {
        const cleanContent = content.trim();

        // 1. Keyword Extraction (Heuristic for now, could be TF-IDF or weak LLM later)
        const keywords = this.extractKeywords(cleanContent);

        // 2. Summary (First 200 chars or first paragraph)
        // In full implementation, this might use a small model (Phi-3) to summarize
        const summary = cleanContent.length > 200
            ? cleanContent.substring(0, 197) + '...'
            : cleanContent;

        // 3. Token Estimate (Roughly 4 chars per token)
        const tokens = Math.ceil(summary.length / 4);

        return {
            id,
            sourceId,
            type,
            content: summary,
            keywords,
            tokens
        };
    }

    private extractKeywords(text: string): string[] {
        // Simple stop-word removal and frequency (Mock implementation)
        const stopWords = new Set(['the', 'and', 'is', 'in', 'to', 'of', 'sys', 'a']);
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3 && !stopWords.has(w));

        // Return unique top words (just unique for now)
        return Array.from(new Set(words)).slice(0, 10);
    }
}
