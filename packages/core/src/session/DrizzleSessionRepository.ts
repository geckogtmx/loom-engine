import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { sessions } from '@loom/db';
import { eq, and } from 'drizzle-orm';
import { ISessionRepository, SessionData } from './repository';
import { SessionState } from './types';

export class DrizzleSessionRepository implements ISessionRepository {
    constructor(private db: BetterSQLite3Database<any>) { }

    async create(data: Omit<SessionData, 'closedAt'>): Promise<SessionData> {
        await this.db.insert(sessions).values({
            id: data.id,
            world_id: data.worldId,
            intent_envelope: JSON.stringify(data.intentEnvelope),
            status: data.state,
            created_at: data.createdAt,
            closed_at: null
        });
        return data;
    }

    async getById(id: string): Promise<SessionData | null> {
        const result = await this.db.select().from(sessions).where(eq(sessions.id, id)).get();
        if (!result) return null;

        return {
            id: result.id,
            worldId: result.world_id,
            intentEnvelope: JSON.parse(result.intent_envelope),
            state: result.status as SessionState,
            createdAt: result.created_at,
            closedAt: result.closed_at || undefined
        };
    }

    async updateStatus(id: string, status: SessionState): Promise<void> {
        await this.db.update(sessions)
            .set({ status })
            .where(eq(sessions.id, id));
    }

    async updateEnvelope(id: string, envelope: any): Promise<void> {
        await this.db.update(sessions)
            .set({ intent_envelope: JSON.stringify(envelope) })
            .where(eq(sessions.id, id));
    }

    async close(id: string, closedAt: Date): Promise<void> {
        await this.db.update(sessions)
            .set({
                status: SessionState.CLOSED,
                closed_at: closedAt
            })
            .where(eq(sessions.id, id));
    }

    async list(worldId: string): Promise<SessionData[]> {
        const results = await this.db.select().from(sessions)
            .where(eq(sessions.world_id, worldId));

        return results.map(this.mapToSessionData);
    }

    async listActive(worldId: string): Promise<SessionData[]> {
        // Not closed
        // In SQL: status != 'CLOSED' or closed_at IS NULL
        // For simplicity, filtering on status != CLOSED
        // Drizzle `ne` (not equal)
        // Actually better to just filter where world_id = ?

        // Let's filter by worldId only first, then InMemory filter or refine SQL
        // Better: where(and(eq(worldId), ne(status, CLOSED)))

        const results = await this.db.select().from(sessions)
            .where(eq(sessions.world_id, worldId));

        return results
            .filter(r => r.status !== SessionState.CLOSED)
            .map(this.mapToSessionData);
    }

    async listIncomplete(): Promise<SessionData[]> {
        const results = await this.db.select().from(sessions);

        return results
            .filter(r => r.status !== SessionState.CLOSED)
            .map(this.mapToSessionData);
    }

    private mapToSessionData(result: any): SessionData {
        return {
            id: result.id,
            worldId: result.world_id,
            intentEnvelope: JSON.parse(result.intent_envelope),
            state: result.status as SessionState,
            createdAt: result.created_at,
            closedAt: result.closed_at || undefined
        };
    }
}
