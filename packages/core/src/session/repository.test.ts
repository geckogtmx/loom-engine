import { describe, it, expect, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { DrizzleSessionRepository } from './DrizzleSessionRepository';
import { SessionState } from './types';
import * as schema from '@loom/db';

const SETUP_SQL = `
CREATE TABLE IF NOT EXISTS worlds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DORMANT',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    world_id TEXT NOT NULL REFERENCES worlds(id),
    intent_envelope TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    closed_at INTEGER
);
`;

describe('DrizzleSessionRepository', () => {
    let sqlite: Database.Database;
    let db: ReturnType<typeof drizzle>;
    let repo: DrizzleSessionRepository;

    beforeEach(() => {
        sqlite = new Database(':memory:');
        sqlite.exec(SETUP_SQL);
        db = drizzle(sqlite, { schema });
        repo = new DrizzleSessionRepository(db);

        // Seed a world
        sqlite.exec(`INSERT INTO worlds (id, name, purpose, created_at, updated_at) VALUES ('w1', 'Test World', 'Purpose', DATE('now'), DATE('now'))`);
        sqlite.exec(`INSERT INTO worlds (id, name, purpose, created_at, updated_at) VALUES ('w2', 'Other World', 'Purpose', DATE('now'), DATE('now'))`);
    });

    it('should create and retrieve a session', async () => {
        const now = new Date();
        await repo.create({
            id: 's1',
            worldId: 'w1',
            state: SessionState.PENDING,
            intentEnvelope: { goal: 'Goal' },
            createdAt: now
        });

        const retrieved = await repo.getById('s1');
        expect(retrieved).not.toBeNull();
        expect(retrieved?.worldId).toBe('w1');
        expect(retrieved?.state).toBe(SessionState.PENDING);
        // SQLite/Drizzle interaction might lose ms precision in this test setup
        expect(Math.floor(retrieved!.createdAt.getTime() / 1000)).toBe(Math.floor(now.getTime() / 1000));
    });

    it('should list sessions for a specific world', async () => {
        const now = new Date();
        // w1 sessions
        await repo.create({ id: 's1', worldId: 'w1', state: SessionState.PENDING, intentEnvelope: {}, createdAt: now });
        await repo.create({ id: 's2', worldId: 'w1', state: SessionState.CLOSED, intentEnvelope: {}, createdAt: now });

        // w2 sessions
        await repo.create({ id: 's3', worldId: 'w2', state: SessionState.PENDING, intentEnvelope: {}, createdAt: now });

        const w1Sessions = await repo.list('w1');
        expect(w1Sessions).toHaveLength(2);
        expect(w1Sessions.map(s => s.id)).toContain('s1');
        expect(w1Sessions.map(s => s.id)).toContain('s2');
        expect(w1Sessions.map(s => s.id)).not.toContain('s3');

        const w2Sessions = await repo.list('w2');
        expect(w2Sessions).toHaveLength(1);
        expect(w2Sessions[0].id).toBe('s3');
    });

    it('should update session status', async () => {
        const now = new Date();
        await repo.create({ id: 's1', worldId: 'w1', state: SessionState.PENDING, intentEnvelope: {}, createdAt: now });

        await repo.updateStatus('s1', SessionState.ACTIVE);
        const s1 = await repo.getById('s1');
        expect(s1?.state).toBe(SessionState.ACTIVE);
    });
});
