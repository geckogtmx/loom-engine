
// packages/core/src/pattern/tempo/types.ts

export enum TempoMode {
    ALLEGRO = 'allegro',   // Fast, brief, high initiative
    ANDANTE = 'andante',   // Moderate, balanced
    ADAGIO = 'adagio'      // Slow, deep, deliberate
}

export interface TempoConfig {
    mode: TempoMode;
    verbosity: 'low' | 'medium' | 'high';
    stepGranularity: 'coarse' | 'normal' | 'fine';
    reasoningDepth: 'shallow' | 'standard' | 'deep';
}

export const TEMPO_CONFIGS: Record<TempoMode, TempoConfig> = {
    [TempoMode.ALLEGRO]: {
        mode: TempoMode.ALLEGRO,
        verbosity: 'low',
        stepGranularity: 'coarse',
        reasoningDepth: 'shallow'
    },
    [TempoMode.ANDANTE]: {
        mode: TempoMode.ANDANTE,
        verbosity: 'medium',
        stepGranularity: 'normal',
        reasoningDepth: 'standard'
    },
    [TempoMode.ADAGIO]: {
        mode: TempoMode.ADAGIO,
        verbosity: 'high',
        stepGranularity: 'fine',
        reasoningDepth: 'deep'
    }
};
