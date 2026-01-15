import { IWorldTelosRepository } from './repository';
import { WorldTelos } from './types';
import { world_telos } from '@loom/db';
import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { randomUUID } from 'crypto';

export class DrizzleWorldTelosRepository implements IWorldTelosRepository {
    constructor(private db: BetterSQLite3Database<any>) { }

    async get(worldId: string): Promise<WorldTelos | null> {
        const result = await this.db.select().from(world_telos).where(eq(world_telos.world_id, worldId)).get();
        if (!result) return null;

        return {
            id: result.id,
            worldId: result.world_id,
            content: result.content,
            updatedAt: result.updated_at
        };
    }

    async set(worldId: string, content: string): Promise<WorldTelos> {
        const now = new Date();
        const existing = await this.get(worldId);

        if (existing) {
            await this.db.update(world_telos)
                .set({
                    content,
                    updated_at: now
                })
                .where(eq(world_telos.id, existing.id));

            return {
                ...existing,
                content,
                updatedAt: now
            };
        } else {
            const newId = randomUUID();
            await this.db.insert(world_telos).values({
                id: newId,
                world_id: worldId,
                content,
                updated_at: now
            });

            return {
                id: newId,
                worldId,
                content,
                updatedAt: now
            };
        }
    }

    async delete(worldId: string): Promise<void> {
        await this.db.delete(world_telos).where(eq(world_telos.world_id, worldId));
    }
}
