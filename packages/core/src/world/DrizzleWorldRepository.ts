import { IWorldRepository } from './repository';
import { World, WorldStatus } from './types';
import { worlds } from '@loom/db';
import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';

export class DrizzleWorldRepository implements IWorldRepository {
    constructor(private db: BetterSQLite3Database<any>) { }

    async create(world: Omit<World, 'createdAt' | 'updatedAt'>): Promise<World> {
        const now = new Date();
        const newWorld: World = {
            ...world,
            createdAt: now,
            updatedAt: now
        };

        await this.db.insert(worlds).values({
            id: newWorld.id,
            name: newWorld.name,
            purpose: newWorld.purpose,
            status: newWorld.status,
            operator_id: newWorld.operatorId || null,
            created_at: newWorld.createdAt,
            updated_at: newWorld.updatedAt
        });

        return newWorld;
    }

    async getById(id: string): Promise<World | null> {
        const result = await this.db.select().from(worlds).where(eq(worlds.id, id)).get();
        if (!result) return null;

        return {
            id: result.id,
            name: result.name,
            purpose: result.purpose,
            status: result.status as WorldStatus,
            operatorId: result.operator_id || undefined,
            createdAt: result.created_at,
            updatedAt: result.updated_at
        };
    }

    async getAll(): Promise<World[]> {
        const results = await this.db.select().from(worlds).all();
        return results.map(r => ({
            id: r.id,
            name: r.name,
            purpose: r.purpose,
            status: r.status as WorldStatus,
            operatorId: r.operator_id || undefined,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        }));
    }

    async getByStatus(status: WorldStatus): Promise<World[]> {
        const results = await this.db.select().from(worlds).where(eq(worlds.status, status)).all();
        return results.map(r => ({
            id: r.id,
            name: r.name,
            purpose: r.purpose,
            status: r.status as WorldStatus,
            operatorId: r.operator_id || undefined,
            createdAt: r.created_at,
            updatedAt: r.updated_at
        }));
    }

    async update(id: string, data: Partial<World>): Promise<World> {
        const now = new Date();
        const updateData: any = {
            updated_at: now
        };

        if (data.name) updateData.name = data.name;
        if (data.purpose) updateData.purpose = data.purpose;
        if (data.status) updateData.status = data.status;
        if (data.operatorId !== undefined) updateData.operator_id = data.operatorId;

        await this.db.update(worlds).set(updateData).where(eq(worlds.id, id));

        const updated = await this.getById(id);
        if (!updated) throw new Error(`World ${id} not found after update`);
        return updated;
    }

    async delete(id: string): Promise<void> {
        await this.db.delete(worlds).where(eq(worlds.id, id));
    }
}
