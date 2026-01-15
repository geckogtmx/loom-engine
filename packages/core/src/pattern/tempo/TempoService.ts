
// packages/core/src/pattern/tempo/TempoService.ts

import { TempoMode, TEMPO_CONFIGS, TempoConfig } from './types';

export class TempoService {

    getConfig(mode: TempoMode): TempoConfig {
        return TEMPO_CONFIGS[mode];
    }

    /**
     * Determines the appropriate Tempo based on constraints.
     * e.g., "Review within 5 mins" -> Allegro
     */
    determineTempoFromConstraints(constraints: string[]): TempoConfig {
        // Heuristic analysis of constraints
        const lowerConstraints = constraints.map(c => c.toLowerCase());

        let score = 0; // - for allegro, + for adagio

        for (const c of lowerConstraints) {
            // Speed indicators
            if (c.includes('fast') || c.includes('quick') || c.includes('brief') || c.includes('summary')) score -= 2;
            if (c.includes('urgent') || c.includes('asap')) score -= 3;

            // Depth indicators
            if (c.includes('deep') || c.includes('comprehensive') || c.includes('detailed')) score += 2;
            if (c.includes('analyze') || c.includes('study') || c.includes('careful')) score += 1;
        }

        if (score <= -2) return this.getConfig(TempoMode.ALLEGRO);
        if (score >= 2) return this.getConfig(TempoMode.ADAGIO);

        return this.getConfig(TempoMode.ANDANTE);
    }
}
