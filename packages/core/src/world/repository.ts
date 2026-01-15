import { World, WorldConfig, WorldStatus, WorldTelos, WorldTemplate } from './types';

export interface IWorldRepository {
    create(world: Omit<World, 'createdAt' | 'updatedAt'>): Promise<World>;
    getById(id: string): Promise<World | null>;
    getAll(): Promise<World[]>;
    getByStatus(status: WorldStatus): Promise<World[]>;
    update(id: string, data: Partial<World>): Promise<World>;
    delete(id: string): Promise<void>;
}

export interface IWorldTelosRepository {
    get(worldId: string): Promise<WorldTelos | null>;
    set(worldId: string, content: string): Promise<WorldTelos>;
    delete(worldId: string): Promise<void>;
}

export interface IWorldConfigRepository {
    get(worldId: string): Promise<WorldConfig | null>;
    set(worldId: string, config: Omit<WorldConfig, 'id' | 'worldId' | 'createdAt' | 'updatedAt'>): Promise<WorldConfig>;
    delete(worldId: string): Promise<void>;
}

export interface ITemplateRepository {
    create(template: Omit<WorldTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorldTemplate>;
    getById(id: string): Promise<WorldTemplate | null>;
    getAll(): Promise<WorldTemplate[]>;
}
