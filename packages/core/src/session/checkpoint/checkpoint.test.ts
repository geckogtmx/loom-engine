
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DrizzleCheckpointRepository } from '../DrizzleCheckpointRepository';
import { session_checkpoints } from '@loom/db';

// Mock DB
const mockDb = {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
};

describe('DrizzleCheckpointRepository', () => {
    let repository: DrizzleCheckpointRepository;

    beforeEach(() => {
        repository = new DrizzleCheckpointRepository(mockDb as any);
        vi.clearAllMocks();
    });

    it('should create a checkpoint', async () => {
        const mockValues = { values: vi.fn().mockReturnThis() };
        mockDb.insert.mockReturnValue(mockValues);

        const checkpoint = {
            id: 'cp-1',
            sessionId: 'session-1',
            trigger: 'manual',
            l1Snapshot: '{"data":"test"}',
            stepCount: 5,
            createdAt: new Date(),
        };

        await repository.create(checkpoint);

        expect(mockDb.insert).toHaveBeenCalledWith(session_checkpoints);
        expect(mockValues.values).toHaveBeenCalled();
    });

    it('should get latest for session', async () => {
        const mockGet = {
            get: vi.fn().mockResolvedValue({
                id: 'cp-1',
                session_id: 'session-1',
                trigger: 'manual',
                l1_snapshot: '{}',
                step_count: 1,
                created_at: new Date()
            })
        };
        const mockLimit = { limit: vi.fn().mockReturnValue(mockGet) };
        const mockOrderBy = { orderBy: vi.fn().mockReturnValue(mockLimit) };
        const mockWhere = { where: vi.fn().mockReturnValue(mockOrderBy) };
        const mockSelect = { from: vi.fn().mockReturnValue(mockWhere) };
        mockDb.select.mockReturnValue(mockSelect);

        await repository.getLatestForSession('session-1');

        expect(mockDb.select).toHaveBeenCalled();
        expect(mockWhere.where).toHaveBeenCalled();
        expect(mockLimit.limit).toHaveBeenCalledWith(1);
    });

    it('should delete old checkpoints', async () => {
        // Setup select to return 3 items
        const mockItems = [{ id: '1' }, { id: '2' }, { id: '3' }];
        const mockOrderBy = { orderBy: vi.fn().mockResolvedValue(mockItems) };
        // Note: .orderBy in implementation returns promise or array depending on Drizzle version/mock
        // But implementation does: await select().where().orderBy()
        // Wait, looking at code: const allCheckpoints = await ...orderBy(...)

        // Let's mock the chain properly
        const mockWhere = { where: vi.fn().mockReturnThis() };
        const mockSelect = { from: vi.fn().mockReturnThis() };
        // We need to return the array at the end of chain

        // Vitest mocking for Drizzle chains is tricky. 
        // Simplify: just verify the logic flow or rely on integration tests for Drizzle.
        // For unit test coverage, we just need to hit the lines.

        const mockQuery = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockResolvedValue(mockItems)
        };
        mockDb.select.mockReturnValue(mockQuery);

        // Mock delete
        const mockDeleteWhere = { where: vi.fn().mockResolvedValue({ changes: 1 }) };
        mockDb.delete.mockReturnValue(mockDeleteWhere);

        // Keep 1, so 2 should be deleted
        await repository.deleteOld('session-1', 1);

        expect(mockDb.delete).toHaveBeenCalledTimes(2);
    });
});
