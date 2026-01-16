
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CheckpointService } from './CheckpointService';
import { CheckpointTrigger, CheckpointConfig } from './types';
import { ICheckpointRepository } from '../repository';

describe('CheckpointService', () => {
    let service: CheckpointService;
    let mockRepository: ICheckpointRepository;
    let defaultConfig: CheckpointConfig;

    beforeEach(() => {
        mockRepository = {
            create: vi.fn(),
            getLatestForSession: vi.fn(),
            deleteOld: vi.fn(),
        };

        defaultConfig = {
            timeIntervalMs: 1000,
            stepInterval: 5
        };

        // Mock Date.now to have control over time
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

        service = new CheckpointService(mockRepository, defaultConfig);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('shouldCheckpoint', () => {
        it('should always return true for MANUAL trigger', () => {
            expect(service.shouldCheckpoint(CheckpointTrigger.MANUAL)).toBe(true);
        });

        it('should always return true for ON_FAILURE trigger', () => {
            expect(service.shouldCheckpoint(CheckpointTrigger.ON_FAILURE)).toBe(true);
        });

        it('should return false for TIME trigger if interval not met', () => {
            expect(service.shouldCheckpoint(CheckpointTrigger.TIME)).toBe(false);
        });

        it('should return true for TIME trigger if interval met', () => {
            // Advance time by 1001ms
            vi.advanceTimersByTime(1001);
            expect(service.shouldCheckpoint(CheckpointTrigger.TIME)).toBe(true);
        });

        it('should return false for STEP_COUNT trigger if count not met', () => {
            service.incrementStep();
            service.incrementStep(); // 2
            expect(service.shouldCheckpoint(CheckpointTrigger.STEP_COUNT)).toBe(false);
        });

        it('should return true for STEP_COUNT trigger if count met', () => {
            for (let i = 0; i < 5; i++) {
                service.incrementStep();
            }
            expect(service.shouldCheckpoint(CheckpointTrigger.STEP_COUNT)).toBe(true);
        });
    });

    describe('createCheckpoint', () => {
        it('should create and persist a checkpoint', async () => {
            const mockL1 = {} as any;
            const mockL2 = {} as any;

            await service.createCheckpoint(
                'session-123',
                CheckpointTrigger.MANUAL,
                'active',
                mockL1,
                mockL2
            );

            expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                sessionId: 'session-123',
                trigger: CheckpointTrigger.MANUAL,
                stepCount: 0 // Should be 0 initially
            }));
        });

        it('should reset lastCheckpointTime after creation', async () => {
            // Move time forward
            vi.advanceTimersByTime(5000);
            const now = Date.now();

            await service.createCheckpoint(
                'session-123',
                CheckpointTrigger.TIME,
                'active',
                {} as any,
                {} as any
            );

            // Since we mocked Date.now, we can check if the internal logic updated the timestamp
            // Effectively, if we advance time again by small amount, it should NOT trigger time
            vi.advanceTimersByTime(100);
            expect(service.shouldCheckpoint(CheckpointTrigger.TIME)).toBe(false);
        });

        it('should reset stepCount after STEP_COUNT creation', async () => {
            for (let i = 0; i < 5; i++) {
                service.incrementStep();
            }

            await service.createCheckpoint(
                'session-123',
                CheckpointTrigger.STEP_COUNT,
                'active',
                {} as any,
                {} as any
            );

            expect(service.shouldCheckpoint(CheckpointTrigger.STEP_COUNT)).toBe(false);
        });
    });

    describe('incrementStep', () => {
        it('should increase step count', () => {
            service.incrementStep();
            // We can verify this via shouldCheckpoint logic or by peeking if implementation allowed access (it's private)
            // But checking via public behavior is better:

            // Set config to 1 for easy testing
            service = new CheckpointService(mockRepository, { stepInterval: 1 });
            expect(service.shouldCheckpoint(CheckpointTrigger.STEP_COUNT)).toBe(false);
            service.incrementStep();
            expect(service.shouldCheckpoint(CheckpointTrigger.STEP_COUNT)).toBe(true);
        });
    });

    describe('restore', () => {
        it('should log restoration', async () => {
            const consoleSpy = vi.spyOn(console, 'log');
            const data = {
                sessionId: '123',
                timestamp: 123456,
                trigger: CheckpointTrigger.MANUAL,
                state: 'active',
                l1Snapshot: {},
                l2Count: 0
            };

            await service.restore(data, {} as any);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Checkpoint] Restoring'));
        });
    });
});
