
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DrizzleSessionRepository } from './DrizzleSessionRepository';
import { sessions } from '@loom/db';
import { eq } from 'drizzle-orm';

// Mock DB
const mockDb = {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
};

describe('DrizzleSessionRepository', () => {
    let repository: DrizzleSessionRepository;

    beforeEach(() => {
        repository = new DrizzleSessionRepository(mockDb as any);
        vi.clearAllMocks();
    });

    it('should create a session', async () => {
        const mockValues = { values: vi.fn().mockReturnThis() };
        mockDb.insert.mockReturnValue(mockValues);

        const session = {
            id: 'session-1',
            worldId: 'world-1',
            status: 'active',
            intentEnvelope: {},
            createdAt: new Date(),
        };

        await repository.create(session as any);

        expect(mockDb.insert).toHaveBeenCalledWith(sessions);
        expect(mockValues.values).toHaveBeenCalled();
    });

    it('should get session by id', async () => {
        const mockResult = {
            id: 'session-1',
            world_id: 'world-1',
            status: 'active',
            intent_envelope: '{}',
            created_at: new Date(),
        };

        const mockGet = { get: vi.fn().mockResolvedValue(mockResult) };
        const mockWhere = { where: vi.fn().mockReturnValue(mockGet) };
        const mockSelect = { from: vi.fn().mockReturnValue(mockWhere) };
        mockDb.select.mockReturnValue(mockSelect);

        const result = await repository.getById('session-1');

        expect(result?.id).toBe('session-1');
        expect(result?.intentEnvelope).toEqual({});
    });

    it('should update session status', async () => {
        // Drizzle update chain: update(table).set(values).where(condition)
        const mockWhere = { where: vi.fn().mockResolvedValue({ changes: 1 }) };
        const mockSet = { set: vi.fn().mockReturnValue(mockWhere) };
        mockDb.update.mockReturnValue(mockSet);

        await repository.updateStatus('session-1', 'closed' as any);

        expect(mockDb.update).toHaveBeenCalled();
        expect(mockSet.set).toHaveBeenCalledWith({ status: 'closed' });
        expect(mockWhere.where).toHaveBeenCalled();
    });
});
