import { IWorldTelosRepository, IWorldConfigRepository } from './repository';
import { WorldTelos, WorldConfig } from './types';
import { IWorldRepository } from './repository';
import { World, WorldStatus } from './types';

export class InMemoryWorldRepository implements IWorldRepository {
    private worlds: Map<string, World> = new Map();

    async create(data: World): Promise<World> {
        this.worlds.set(data.id, data);
        return data;
    }

    async getById(id: string): Promise<World | null> {
        return this.worlds.get(id) || null;
    }

    async getAll(): Promise<World[]> {
        return Array.from(this.worlds.values());
    }

    async getByStatus(status: WorldStatus): Promise<World[]> {
        return Array.from(this.worlds.values()).filter(world => world.status === status);
    }

    async update(id: string, data: Partial<World>): Promise<World> {
        const existing = this.worlds.get(id);
        if (!existing) throw new Error(`World ${id} not found`);
        const updated = { ...existing, ...data };
        this.worlds.set(id, updated);
        return updated;
    }

    async delete(id: string): Promise<void> {
        this.worlds.delete(id);
    }
}

export class InMemoryWorldTelosRepository implements IWorldTelosRepository {
    private store: Map<string, WorldTelos> = new Map();

    async create(data: WorldTelos): Promise<WorldTelos> {
        this.store.set(data.worldId, data);
        return data;
    }

    async get(worldId: string): Promise<WorldTelos | null> {
        return this.store.get(worldId) || null;
    }

    async set(worldId: string, content: string): Promise<WorldTelos> {
        const telos: WorldTelos = {
            id: 'telos-' + worldId,
            worldId,
            content,
            updatedAt: new Date()
        };
        this.store.set(worldId, telos);
        return telos;
    }

    async update(worldId: string, content: string): Promise<void> {
        await this.set(worldId, content);
    }

    async delete(worldId: string): Promise<void> {
        this.store.delete(worldId);
    }
}

export class InMemoryWorldConfigRepository implements IWorldConfigRepository {
    private store: Map<string, WorldConfig> = new Map();

    async create(data: WorldConfig): Promise<WorldConfig> {
        this.store.set(data.worldId, data);
        return data;
    }

    async get(worldId: string): Promise<WorldConfig | null> {
        return this.store.get(worldId) || null;
    }

    async set(worldId: string, configData: Omit<WorldConfig, 'id' | 'worldId' | 'createdAt' | 'updatedAt'>): Promise<WorldConfig> {
        const config: WorldConfig = {
            id: 'config-' + worldId,
            worldId,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...configData
        };
        this.store.set(worldId, config);
        return config;
    }

    async delete(worldId: string): Promise<void> {
        this.store.delete(worldId);
    }
}
