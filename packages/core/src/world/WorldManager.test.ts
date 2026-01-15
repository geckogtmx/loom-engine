import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorldManager } from './WorldManager';
import { WorldService } from './WorldService';

// Mock WorldService
const mockGetById = vi.fn();
const MockWorldService = {
    getById: mockGetById
} as unknown as WorldService;

describe('WorldManager', () => {
    let manager: WorldManager;

    beforeEach(() => {
        vi.resetAllMocks();
        manager = new WorldManager('test-world', MockWorldService);
    });

    it('should retrieve purpose from WorldService', async () => {
        mockGetById.mockResolvedValue({ purpose: 'To Test' });
        const purpose = await manager.getPurpose();
        expect(purpose).toBe('To Test');
        expect(mockGetById).toHaveBeenCalledWith('test-world');
    });

    it('should throw if world not found', async () => {
        mockGetById.mockResolvedValue(null);
        await expect(manager.getPurpose()).rejects.toThrow('World test-world not found');
    });

    it('should return placeholder identity', async () => {
        const identity = await manager.getIdentity();
        expect(identity).toContain('Identity for world test-world');
    });

    it('should return placeholder agents', async () => {
        const agents = await manager.getAgents();
        expect(agents).toContain('Atlas');
    });

    it('should return placeholder threads', async () => {
        const threads = await manager.getThreads();
        expect(threads).toEqual([]);
    });

    it('should return placeholder recent state', async () => {
        const state = await manager.getRecentState();
        expect(state).toContain('Recent state summary');
    });
});
