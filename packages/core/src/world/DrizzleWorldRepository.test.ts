import { describe, it, expect, beforeEach } from 'vitest';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { DrizzleWorldRepository } from './DrizzleWorldRepository';
import { DrizzleWorldConfigRepository } from './DrizzleWorldConfigRepository';
import { DrizzleWorldTelosRepository } from './DrizzleWorldTelosRepository';
import { WorldStatus } from './types';
import * as schema from '@loom/db';

// Mock migration to creating tables manually or using a Drizzle helper if available for testing
// Since standard migrate requires a specific folder, we might rely on the schema being applied.
// Drizzle doesn't have a simple "create all tables" helper without migrations usually.
// However, for testing, we can use `better-sqlite3` and just run the CREATE TABLE statements or use `push` style if we had it.
// Simpler approach: define the tables in the test DB context or assume we can map to in-memory.

// Actually, `drizzle-kit push` is for dev. For tests, we typically need to apply the schema.
// A common pattern is to use `drizzle-orm/better-sqlite3` and just rely on the fact that we are mocking the DB or that we have a setup helper.
// Since I don't see a test setup helper in the file list, I'll try to use the schema objects to create tables if Drizzle supports it easily, OR I will just assume valid DB state if I can't easily migrate.
// BUT, `better-sqlite3` in-memory is empty. I need to create tables.
// I will check if there is a helper in `@loom/db` index.ts (I saw `createDb` but that just returns the client).
// I will assume for now I can write a small helper or just run raw SQL for the tables I need.

// Let's copy the SQL definitions from `packages/db/src/schema/world.ts` effectively, or just trust I can run a migration.
// Given constraints, I will write the SQL manually in `beforeEach` for the tables I use: `worlds`, `world_config`, `world_telos`.

const SETUP_SQL = `
CREATE TABLE IF NOT EXISTS worlds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DORMANT',
    operator_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS world_config (
    id TEXT PRIMARY KEY,
    world_id TEXT NOT NULL REFERENCES worlds(id),
    allowed_patterns TEXT,
    allowed_agents TEXT,
    constraints TEXT,
    model_preferences TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS world_telos (
    id TEXT PRIMARY KEY,
    world_id TEXT NOT NULL REFERENCES worlds(id),
    content TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);
`;

describe('Drizzle Repositories', () => {
    let sqlite: Database.Database;
    let db: ReturnType<typeof drizzle>;

    // Repositories
    let worldRepo: DrizzleWorldRepository;
    let configRepo: DrizzleWorldConfigRepository;
    let telosRepo: DrizzleWorldTelosRepository;

    beforeEach(() => {
        // Create in-memory DB
        sqlite = new Database(':memory:');
        sqlite.exec(SETUP_SQL);
        db = drizzle(sqlite, { schema });

        worldRepo = new DrizzleWorldRepository(db);
        configRepo = new DrizzleWorldConfigRepository(db);
        telosRepo = new DrizzleWorldTelosRepository(db);
    });

    describe('DrizzleWorldRepository', () => {
        it('should create and retrieve a world', async () => {
            const world = await worldRepo.create({
                id: 'test-id',
                name: 'Test World',
                purpose: 'Testing',
                status: WorldStatus.ACTIVE
            });

            const retrieved = await worldRepo.getById('test-id');
            expect(retrieved).not.toBeNull();
            expect(retrieved?.name).toBe('Test World');
            expect(retrieved?.status).toBe(WorldStatus.ACTIVE);
            expect(retrieved?.createdAt).toBeInstanceOf(Date);
        });

        it('should update a world', async () => {
            await worldRepo.create({
                id: 'test-id',
                name: 'Old Name',
                purpose: 'Purpose',
                status: WorldStatus.DORMANT
            });

            await worldRepo.update('test-id', { name: 'New Name' });

            const retrieved = await worldRepo.getById('test-id');
            expect(retrieved?.name).toBe('New Name');
            expect(retrieved?.updatedAt.getTime()).toBeGreaterThan(0);
        });

        it('should delete a world', async () => {
            await worldRepo.create({
                id: 'test-id',
                name: 'To Delete',
                purpose: 'Purpose',
                status: WorldStatus.DORMANT
            });

            await worldRepo.delete('test-id');
            const result = await worldRepo.getById('test-id');
            expect(result).toBeNull();
        });
    });

    describe('DrizzleWorldConfigRepository', () => {
        it('should create and retrieve config', async () => {
            // Need a world first due to FK
            await worldRepo.create({
                id: 'w-1',
                name: 'W1',
                purpose: 'P',
                status: WorldStatus.DORMANT
            });

            await configRepo.set('w-1', {
                allowedPatterns: ['p1', 'p2'],
                modelPreferences: { default: 'gpt-4' }
            });

            const config = await configRepo.get('w-1');
            expect(config).not.toBeNull();
            expect(config?.allowedPatterns).toEqual(['p1', 'p2']);
            expect(config?.modelPreferences).toEqual({ default: 'gpt-4' });
        });

        it('should update existing config', async () => {
            await worldRepo.create({ id: 'w-1', name: 'W1', purpose: 'P', status: WorldStatus.DORMANT });

            await configRepo.set('w-1', { allowedPatterns: ['p1'] });
            await configRepo.set('w-1', { allowedPatterns: ['p2'] });

            const config = await configRepo.get('w-1');
            expect(config?.allowedPatterns).toEqual(['p2']);
        });
    });

    describe('DrizzleWorldTelosRepository', () => {
        it('should perform upsert on telos', async () => {
            await worldRepo.create({ id: 'w-1', name: 'W1', purpose: 'P', status: WorldStatus.DORMANT });

            await telosRepo.set('w-1', 'Initial Content');
            let telos = await telosRepo.get('w-1');
            expect(telos?.content).toBe('Initial Content');

            await telosRepo.set('w-1', 'Updated Content');
            telos = await telosRepo.get('w-1');
            expect(telos?.content).toBe('Updated Content');
        });
    });
});
