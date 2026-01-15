import { describe, it, expect, vi } from 'vitest';
import { L2EpisodicLayer } from '../memory/layers';

// Mock console.log to spy on operations
const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

describe('World Boundary Isolation', () => {
    it('should strictly isolate L2 writes between worlds', async () => {
        const worldA = new L2EpisodicLayer('world-A');
        const worldB = new L2EpisodicLayer('world-B');

        // Write to World A
        await worldA.write('key1', 'valueA');

        // Verify World A's operation is scoped
        expect(logSpy).toHaveBeenCalledWith('[L2:world-A] Writing key1', 'valueA');

        // Write to World B
        await worldB.write('key1', 'valueB');

        // Verify World B's operation is scoped
        expect(logSpy).toHaveBeenCalledWith('[L2:world-B] Writing key1', 'valueB');

        // Verify no cross-contamination (in log stream)
        const calls = logSpy.mock.calls.map(c => c[0]);
        const worldACalls = calls.filter(c => typeof c === 'string' && c.includes('[L2:world-A]'));
        const worldBCalls = calls.filter(c => typeof c === 'string' && c.includes('[L2:world-B]'));

        expect(worldACalls.length).toBe(1);
        expect(worldBCalls.length).toBe(1);
    });

    it('should strictly isolate L2 reads between worlds', async () => {
        const worldA = new L2EpisodicLayer('world-A');
        const worldB = new L2EpisodicLayer('world-B');

        await worldA.read('secret-key');
        expect(logSpy).toHaveBeenLastCalledWith('[L2:world-A] Reading secret-key');

        await worldB.read('secret-key');
        expect(logSpy).toHaveBeenLastCalledWith('[L2:world-B] Reading secret-key');
    });
});
