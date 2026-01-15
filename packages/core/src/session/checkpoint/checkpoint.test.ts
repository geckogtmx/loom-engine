import { describe, it, expect, beforeEach } from 'vitest';
import { CheckpointService } from './CheckpointService';
import { CheckpointTrigger } from './types';
import { L1ActiveLayer, L2EpisodicLayer } from '../../memory/layers';

import { InMemoryCheckpointRepository } from '../test-utils';

describe('CheckpointService', () => {
    let service: CheckpointService;
    let repo: InMemoryCheckpointRepository;

    beforeEach(() => {
        repo = new InMemoryCheckpointRepository();
        service = new CheckpointService(repo, { timeIntervalMs: 1000, stepInterval: 2 });
    });

    it('should trigger immediately on MANUAL', () => {
        expect(service.shouldCheckpoint(CheckpointTrigger.MANUAL)).toBe(true);
    });

    it('should trigger on step count', () => {
        service.incrementStep();
        expect(service.shouldCheckpoint(CheckpointTrigger.STEP_COUNT)).toBe(false);
        service.incrementStep();
        expect(service.shouldCheckpoint(CheckpointTrigger.STEP_COUNT)).toBe(true);
    });

    it('should reset step count after checkpoint', async () => {
        service.incrementStep();
        service.incrementStep();

        // Mock layers
        const l1 = new L1ActiveLayer() as any;
        const l2 = new L2EpisodicLayer({} as any) as any;

        await service.createCheckpoint('sess-1', CheckpointTrigger.STEP_COUNT, 'ACTIVE', l1, l2);

        // Steps should be reset
        expect(service.shouldCheckpoint(CheckpointTrigger.STEP_COUNT)).toBe(false);
    });
});
