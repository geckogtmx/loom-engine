import { describe, it, expect, beforeEach } from 'vitest';
import { WorldService, InMemoryWorldRepository } from './WorldService';
import { WorldStatus, WorldEvent, CreateWorldInputSchema } from './types';

describe('WorldStatus Enum', () => {
    it('should have correct values', () => {
        expect(WorldStatus.ACTIVE).toBe('ACTIVE');
        expect(WorldStatus.ARCHIVED).toBe('ARCHIVED');
        expect(WorldStatus.DORMANT).toBe('DORMANT');
    });
});

describe('CreateWorldInputSchema', () => {
    it('should validate valid input', () => {
        const input = { name: 'Test World', purpose: 'Testing' };
        const result = CreateWorldInputSchema.safeParse(input);
        expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
        const input = { name: '', purpose: 'Testing' };
        const result = CreateWorldInputSchema.safeParse(input);
        expect(result.success).toBe(false);
    });

    it('should reject empty purpose', () => {
        const input = { name: 'Test', purpose: '' };
        const result = CreateWorldInputSchema.safeParse(input);
        expect(result.success).toBe(false);
    });

    it('should reject overly long name', () => {
        const input = { name: 'a'.repeat(101), purpose: 'Testing' };
        const result = CreateWorldInputSchema.safeParse(input);
        expect(result.success).toBe(false);
    });
});

describe('WorldService', () => {
    let service: WorldService;

    beforeEach(() => {
        service = new WorldService();
    });

    describe('create()', () => {
        it('should create a new World', async () => {
            const world = await service.create({ name: 'Test World', purpose: 'Unit Testing' });

            expect(world.id).toBeDefined();
            expect(world.name).toBe('Test World');
            expect(world.purpose).toBe('Unit Testing');
            expect(world.status).toBe(WorldStatus.DORMANT);
        });

        it('should throw on invalid input', async () => {
            await expect(service.create({ name: '', purpose: 'Test' })).rejects.toThrow();
        });

        it('should emit CREATED event', async () => {
            await service.create({ name: 'Test World', purpose: 'Testing' });
            const events = service.getEventLog();
            expect(events.length).toBe(1);
            expect(events[0].event).toBe(WorldEvent.CREATED);
        });
    });

    describe('getById()', () => {
        it('should return World by ID', async () => {
            const created = await service.create({ name: 'Test', purpose: 'Testing' });
            const retrieved = await service.getById(created.id);
            expect(retrieved).toEqual(created);
        });

        it('should return null for unknown ID', async () => {
            const result = await service.getById('unknown-id');
            expect(result).toBeNull();
        });
    });

    describe('getAll()', () => {
        it('should return all Worlds', async () => {
            await service.create({ name: 'World 1', purpose: 'P1' });
            await service.create({ name: 'World 2', purpose: 'P2' });
            const all = await service.getAll();
            expect(all.length).toBe(2);
        });
    });

    describe('update()', () => {
        it('should update World properties', async () => {
            const world = await service.create({ name: 'Original', purpose: 'P' });
            const updated = await service.update(world.id, { name: 'Updated' });
            expect(updated.name).toBe('Updated');
        });
    });

    describe('activate() and deactivate()', () => {
        it('should activate a World', async () => {
            const world = await service.create({ name: 'Test', purpose: 'P' });
            await service.activate(world.id);

            const active = await service.getActiveWorld();
            expect(active?.id).toBe(world.id);
            expect(active?.status).toBe(WorldStatus.ACTIVE);
        });

        it('should deactivate a World', async () => {
            const world = await service.create({ name: 'Test', purpose: 'P' });
            await service.activate(world.id);
            await service.deactivate(world.id);

            const active = await service.getActiveWorld();
            expect(active).toBeNull();
        });

        it('should only allow one active World', async () => {
            const world1 = await service.create({ name: 'World 1', purpose: 'P1' });
            const world2 = await service.create({ name: 'World 2', purpose: 'P2' });

            await service.activate(world1.id);
            await service.activate(world2.id);

            const w1Refreshed = await service.getById(world1.id);
            const w2Refreshed = await service.getById(world2.id);

            expect(w1Refreshed?.status).toBe(WorldStatus.DORMANT);
            expect(w2Refreshed?.status).toBe(WorldStatus.ACTIVE);
        });

        it('should throw when activating archived World', async () => {
            const world = await service.create({ name: 'Test', purpose: 'P' });
            await service.archive(world.id);

            await expect(service.activate(world.id)).rejects.toThrow('Cannot activate an archived World');
        });
    });

    describe('archive()', () => {
        it('should archive a World', async () => {
            const world = await service.create({ name: 'Test', purpose: 'P' });
            await service.archive(world.id);

            const archived = await service.getById(world.id);
            expect(archived?.status).toBe(WorldStatus.ARCHIVED);
        });

        it('should deactivate before archiving if active', async () => {
            const world = await service.create({ name: 'Test', purpose: 'P' });
            await service.activate(world.id);
            await service.archive(world.id);

            const active = await service.getActiveWorld();
            expect(active).toBeNull();
        });
    });

    describe('getActiveWorld()', () => {
        it('should return null when no World is active', async () => {
            const result = await service.getActiveWorld();
            expect(result).toBeNull();
        });
    });
});

describe('InMemoryWorldRepository', () => {
    let repo: InMemoryWorldRepository;

    beforeEach(() => {
        repo = new InMemoryWorldRepository();
    });

    it('should create and retrieve World', async () => {
        const world = await repo.create({
            name: 'Test',
            purpose: 'Testing',
            status: WorldStatus.DORMANT
        });

        const retrieved = await repo.getById(world.id);
        expect(retrieved?.name).toBe('Test');
    });

    it('should throw on update of non-existent World', async () => {
        await expect(repo.update('fake-id', { name: 'New' })).rejects.toThrow('not found');
    });
});
