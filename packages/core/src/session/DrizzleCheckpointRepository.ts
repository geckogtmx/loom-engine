import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { session_checkpoints } from '@loom/db/src/schema/memory';
import { eq, desc, asc } from 'drizzle-orm';
import { ICheckpointRepository, CheckpointRecord } from './repository';

export class DrizzleCheckpointRepository implements ICheckpointRepository {
    constructor(private db: BetterSQLite3Database<any>) { }

    async create(data: CheckpointRecord): Promise<CheckpointRecord> {
        await this.db.insert(session_checkpoints).values({
            id: data.id,
            session_id: data.sessionId,
            trigger: data.trigger,
            l1_snapshot: data.l1Snapshot, // Already stringified
            step_count: data.stepCount,
            created_at: data.createdAt
        });
        return data;
    }

    async getLatestForSession(sessionId: string): Promise<CheckpointRecord | null> {
        const result = await this.db.select().from(session_checkpoints)
            .where(eq(session_checkpoints.session_id, sessionId))
            .orderBy(desc(session_checkpoints.created_at))
            .limit(1)
            .get();

        if (!result) return null;

        return {
            id: result.id,
            sessionId: result.session_id,
            trigger: result.trigger,
            l1Snapshot: result.l1_snapshot,
            stepCount: result.step_count,
            createdAt: result.created_at
        };
    }

    async deleteOld(sessionId: string, keepCount: number): Promise<void> {
        if (keepCount < 0) return;

        // Get all checkpoints sorted by date desc
        const allCheckpoints = await this.db.select({ id: session_checkpoints.id }).from(session_checkpoints)
            .where(eq(session_checkpoints.session_id, sessionId))
            .orderBy(desc(session_checkpoints.created_at));

        if (allCheckpoints.length <= keepCount) return;

        // Identify IDs to delete (slice from keepCount to end)
        const toDelete = allCheckpoints.slice(keepCount).map(c => c.id);

        if (toDelete.length === 0) return;

        // Delete individually or with `inArray` if importable
        // Drizzle `inArray` is cleaner but loop works for now to be safe
        for (const id of toDelete) {
            await this.db.delete(session_checkpoints).where(eq(session_checkpoints.id, id));
        }
    }
}
