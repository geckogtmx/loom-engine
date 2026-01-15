
// packages/core/src/pattern/tempo/TempoService.test.ts

import { describe, it, expect } from 'vitest';
import { TempoService } from './TempoService';
import { TempoMode } from './types';

describe('TempoService', () => {
    const service = new TempoService();

    it('should return config for modes', () => {
        expect(service.getConfig(TempoMode.ALLEGRO).verbosity).toBe('low');
        expect(service.getConfig(TempoMode.ADAGIO).verbosity).toBe('high');
    });

    it('should determine ALLEGRO from urgent constraints', () => {
        const config = service.determineTempoFromConstraints(['Need this ASAP', 'Keep it brief']);
        expect(config.mode).toBe(TempoMode.ALLEGRO);
    });

    it('should determine ADAGIO from deep constraints', () => {
        const config = service.determineTempoFromConstraints(['Do a deep dive', 'Comprehensive analysis required']);
        expect(config.mode).toBe(TempoMode.ADAGIO);
    });

    it('should default to ANDANTE', () => {
        const config = service.determineTempoFromConstraints(['Please write a poem']);
        expect(config.mode).toBe(TempoMode.ANDANTE);
    });
});
