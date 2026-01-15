
// packages/core/src/pattern/lifecycle/PatternLifecycle.test.ts

import { describe, it, expect } from 'vitest';
import { PatternLifecycle } from './PatternLifecycle';
import { LifecyclePhase } from './types';
import { SessionIntentEnvelopeImpl } from '../../session/SessionIntentEnvelope';
import { PatternDef } from '../types';

describe('PatternLifecycle', () => {
    const mockPattern: PatternDef = {
        id: 'p1',
        name: 'Test Pattern',
        description: 'Testing',
        family: 'Test',
        steps: [],
        inputs: [],
        outputs: [],
        tags: [],
        version: '1.0'
    };

    it('should start in PRIMACY phase', () => {
        const sie = new SessionIntentEnvelopeImpl('w1', 'Goal');
        const lifecycle = new PatternLifecycle('s1', 'w1', mockPattern, sie);

        expect(lifecycle.getState()).toBe(LifecyclePhase.PRIMACY);
    });

    it('should block exit from PRIMACY if SIE not sealed', () => {
        const sie = new SessionIntentEnvelopeImpl('w1', 'Goal');
        const lifecycle = new PatternLifecycle('s1', 'w1', mockPattern, sie);

        expect(() => lifecycle.completePrimacy()).toThrow('Session Intent Envelope is not sealed');
    });

    it('should advance from PRIMACY if SIE is sealed', () => {
        const sie = new SessionIntentEnvelopeImpl('w1', 'Goal');
        sie.seal(); // Seal it

        const lifecycle = new PatternLifecycle('s1', 'w1', mockPattern, sie);
        lifecycle.completePrimacy();

        // Should have cascaded through validation to activation
        expect(lifecycle.getState()).toBe(LifecyclePhase.ACTIVATION);
    });
});
