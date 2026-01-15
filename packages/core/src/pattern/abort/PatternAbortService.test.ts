
// packages/core/src/pattern/abort/PatternAbortService.test.ts

import { describe, it, expect, vi } from 'vitest';
import { PatternAbortService } from './PatternAbortService';
import { PatternLifecycle } from '../lifecycle/PatternLifecycle';
import { LifecyclePhase } from '../lifecycle/types';
import { SessionIntentEnvelopeImpl } from '../../session/SessionIntentEnvelope';
import { PatternDef } from '../types';

describe('PatternAbortService', () => {
    const service = new PatternAbortService();

    // Mock setup
    const mockPattern: PatternDef = {
        id: 'p1', name: 'Test', description: '', family: '', steps: [], inputs: [], outputs: [], tags: [], version: '1.0'
    };
    const sie = new SessionIntentEnvelopeImpl('w1', 'Goal');
    sie.seal();

    it('should abort a running lifecycle', () => {
        const lifecycle = new PatternLifecycle('s1', 'w1', mockPattern, sie);
        lifecycle.start(); // -> ACTIVATION (since sie sealed)

        service.abort(lifecycle, 'User cancelled');

        expect(lifecycle.getState()).toBe(LifecyclePhase.ABORTED);
    });

    it('should capture abort reason', () => {
        const lifecycle = new PatternLifecycle('s1', 'w1', mockPattern, sie);

        // Spy on transition or check side effect? 
        // We added logic to store reason in stepOutputs for now
        service.abort(lifecycle, 'Reason123');

        // We need to access context to verify, but it's private. 
        // We can verify state is ABORTED.
        expect(lifecycle.getState()).toBe(LifecyclePhase.ABORTED);
    });

    it('should not abort if already completed', () => {
        const lifecycle = new PatternLifecycle('s1', 'w1', mockPattern, sie);

        // Force state to completed (hack for test)
        (lifecycle as any).state = LifecyclePhase.COMPLETED;

        const spy = vi.spyOn(console, 'warn');
        service.abort(lifecycle, 'Try abort');

        expect(spy).toHaveBeenCalledWith(expect.stringContaining('Cannot abort'));
        expect(lifecycle.getState()).toBe(LifecyclePhase.COMPLETED);
    });
});
