import { IWorldConfigRepository } from './repository';
import { WorldConfig } from './types';
import { world_config } from '@loom/db';
import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { randomUUID } from 'crypto';

export class DrizzleWorldConfigRepository implements IWorldConfigRepository {
    constructor(private db: BetterSQLite3Database<any>) { }

    async get(worldId: string): Promise<WorldConfig | null> {
        const result = await this.db.select().from(world_config).where(eq(world_config.world_id, worldId)).get();
        if (!result) return null;

        return {
            id: result.id,
            worldId: result.world_id,
            allowedPatterns: result.allowed_patterns ? JSON.parse(result.allowed_patterns) : undefined,
            allowedAgents: result.allowed_agents ? JSON.parse(result.allowed_agents) : undefined,
            constraints: result.constraints ? JSON.parse(result.constraints) : undefined,
            modelPreferences: result.model_preferences ? JSON.parse(result.model_preferences) : undefined,
            createdAt: result.created_at,
            updatedAt: result.updated_at
        };
    }

    async set(worldId: string, config: Omit<WorldConfig, 'id' | 'worldId' | 'createdAt' | 'updatedAt'>): Promise<WorldConfig> {
        const now = new Date();
        const existing = await this.get(worldId);

        const values = {
            world_id: worldId,
            allowed_patterns: config.allowedPatterns ? JSON.stringify(config.allowedPatterns) : null,
            allowed_agents: config.allowedAgents ? JSON.stringify(config.allowedAgents) : null,
            constraints: config.constraints ? JSON.stringify(config.constraints) : null,
            model_preferences: config.modelPreferences ? JSON.stringify(config.modelPreferences) : null,
            updated_at: now
        };

        if (existing) {
            await this.db.update(world_config).set(values).where(eq(world_config.id, existing.id));
            return {
                ...existing,
                ...config,
                updatedAt: now
            };
        } else {
            const newId = randomUUID();
            await this.db.insert(world_config).values({
                id: newId,
                created_at: now,
                ...values
            });
            return {
                id: newId,
                worldId,
                ...config,
                createdAt: now,
                updatedAt: now
            };
        }
    }

    async delete(worldId: string): Promise<void> {
        await this.db.delete(world_config).where(eq(world_config.world_id, worldId));
    }
}
