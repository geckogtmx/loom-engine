import { v4 as uuidv4 } from 'uuid';
import {
    World,
    WorldStatus,
    WorldEvent,
    WorldEventPayload,
    CreateWorldInput,
    CreateWorldInputSchema,
    UpdateWorldInput,
    UpdateWorldInputSchema,
    IWorldRepository
} from './types';

/**
 * In-Memory World Repository
 * Used for development/testing. Replace with Drizzle implementation for production.
 */
export class InMemoryWorldRepository implements IWorldRepository {
    private worlds: Map<string, World> = new Map();

    async create(data: Omit<World, 'id' | 'createdAt' | 'updatedAt'>): Promise<World> {
        const now = new Date();
        const world: World = {
            id: uuidv4(),
            ...data,
            createdAt: now,
            updatedAt: now
        };
        this.worlds.set(world.id, world);
        return world;
    }

    async getById(id: string): Promise<World | null> {
        return this.worlds.get(id) || null;
    }

    async getAll(): Promise<World[]> {
        return Array.from(this.worlds.values());
    }

    async getByStatus(status: WorldStatus): Promise<World[]> {
        return Array.from(this.worlds.values()).filter(w => w.status === status);
    }

    async update(id: string, data: Partial<World>): Promise<World> {
        const existing = this.worlds.get(id);
        if (!existing) {
            throw new Error(`World ${id} not found`);
        }
        const updated: World = {
            ...existing,
            ...data,
            updatedAt: new Date()
        };
        this.worlds.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<void> {
        this.worlds.delete(id);
    }
}

/**
 * WorldService
 * Manages World lifecycle including creation, activation, and archival.
 */
export class WorldService {
    private repository: IWorldRepository;
    private activeWorldId: string | null = null;
    private eventLog: WorldEventPayload[] = [];

    constructor(repository?: IWorldRepository) {
        this.repository = repository || new InMemoryWorldRepository();
    }

    // ============================================
    // CRUD Operations
    // ============================================

    async create(input: CreateWorldInput): Promise<World> {
        // Validate input
        const validated = CreateWorldInputSchema.parse(input);

        const world = await this.repository.create({
            name: validated.name,
            purpose: validated.purpose,
            status: WorldStatus.DORMANT,
            operatorId: validated.operatorId
        });

        this.emitEvent(WorldEvent.CREATED, world.id);
        return world;
    }

    async getById(id: string): Promise<World | null> {
        return this.repository.getById(id);
    }

    async getAll(): Promise<World[]> {
        return this.repository.getAll();
    }

    async update(id: string, input: UpdateWorldInput): Promise<World> {
        // Validate input
        const validated = UpdateWorldInputSchema.parse(input);

        const world = await this.repository.update(id, validated);
        this.emitEvent(WorldEvent.UPDATED, id);
        return world;
    }

    async archive(id: string): Promise<void> {
        // Deactivate first if active
        if (this.activeWorldId === id) {
            await this.deactivate(id);
        }

        await this.repository.update(id, { status: WorldStatus.ARCHIVED });
        this.emitEvent(WorldEvent.ARCHIVED, id);
    }

    async delete(id: string): Promise<void> {
        // Soft delete by marking as archived
        // For hard delete, use repository.delete directly
        await this.archive(id);
        this.emitEvent(WorldEvent.DELETED, id);
    }

    // ============================================
    // Activation Logic
    // ============================================

    async activate(id: string): Promise<void> {
        const world = await this.repository.getById(id);
        if (!world) {
            throw new Error(`World ${id} not found`);
        }

        if (world.status === WorldStatus.ARCHIVED) {
            throw new Error('Cannot activate an archived World. Unarchive first.');
        }

        // Deactivate current world if different
        if (this.activeWorldId && this.activeWorldId !== id) {
            await this.deactivate(this.activeWorldId);
        }

        await this.repository.update(id, { status: WorldStatus.ACTIVE });
        this.activeWorldId = id;
        this.emitEvent(WorldEvent.ACTIVATED, id);
    }

    async deactivate(id: string): Promise<void> {
        if (this.activeWorldId !== id) {
            return; // Not active, nothing to do
        }

        await this.repository.update(id, { status: WorldStatus.DORMANT });
        this.activeWorldId = null;
        this.emitEvent(WorldEvent.DEACTIVATED, id);
    }

    async getActiveWorld(): Promise<World | null> {
        if (!this.activeWorldId) {
            return null;
        }
        return this.repository.getById(this.activeWorldId);
    }

    // ============================================
    // Event System
    // ============================================

    private emitEvent(event: WorldEvent, worldId: string, data?: Record<string, any>): void {
        const payload: WorldEventPayload = {
            event,
            worldId,
            timestamp: new Date(),
            data
        };
        this.eventLog.push(payload);
        // In real implementation, emit to event bus
        console.log(`[WorldService] ${event}: ${worldId}`);
    }

    getEventLog(): WorldEventPayload[] {
        return [...this.eventLog];
    }
}
