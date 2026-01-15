import { describe, it, expect, beforeEach } from 'vitest';
import { SessionService } from './SessionService';
import { SessionState } from './types';
import { InMemorySessionRepository, InMemoryCheckpointRepository } from './test-utils';

describe('SessionService Integration', () => {
    let service: SessionService;
    let sessionRepo: InMemorySessionRepository;
    let checkpointRepo: InMemoryCheckpointRepository;

    beforeEach(() => {
        sessionRepo = new InMemorySessionRepository();
        checkpointRepo = new InMemoryCheckpointRepository();
        service = new SessionService('world-test', sessionRepo, checkpointRepo);
    });

    it('should complete full lifecycle: PENDING → ACTIVE → CLOSED', async () => {
        // Initial state
        expect(service.state).toBe(SessionState.PENDING);

        // Initialize
        await service.initialize();
        expect(service.state).toBe(SessionState.PRIMACY);

        // Set intent
        await service.setIntent('Test Goal', 'Test Audience', ['Constraint 1']);
        expect(service.intentEnvelope.goal).toBe('Test Goal');

        // Start
        await service.start();
        expect(service.state).toBe(SessionState.ACTIVE);
        expect(service.intentEnvelope.isSealed()).toBe(true);

        // End
        await service.end();
        expect(service.state).toBe(SessionState.CLOSED);
    });

    it('should throw if starting without being in PRIMACY state', async () => {
        // Skip initialize, try to start directly
        await expect(service.start()).rejects.toThrow('Session must be in PRIMACY state');
    });

    it('should throw if setting intent after session is ACTIVE', async () => {
        await service.initialize();
        await service.setIntent('Goal 1', 'Audience', []);
        await service.start();

        await expect(service.setIntent('Goal 2', 'Audience', [])).rejects.toThrow('Can only set intent during initialization');
    });

    it('should handle fail() gracefully', async () => {
        await service.initialize();
        await service.setIntent('Goal', 'Audience', []);
        await service.start();

        await service.fail('Test failure reason');
        expect(service.state).toBe(SessionState.CLOSED);
    });

    it('should have a unique session ID', () => {
        const service2 = new SessionService('world-test', sessionRepo, checkpointRepo);
        expect(service.id).not.toBe(service2.id);
    });
});
