import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { WorldChannels } from './channels';
import {
    WorldService,
    DrizzleWorldRepository,
    DrizzleWorldConfigRepository,
    DrizzleWorldTelosRepository,
    CreateWorldInput,
    UpdateWorldInput
} from '@loom/core';
import { createDb } from '@loom/db';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize DB and Service outside of handler to keep it singleton-ish
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../newsforge.db'); // Fallback or env

// Initialize Drizzle
// createDb expects a path? checking @loom/db usage
// Assuming createDb returns the db instance or we use existing one.
// Actually @loom/db exports `createDb` which might take options. 
// Let's assume standard initialization for now. 
// If @loom/db creates in-memory by default or configurable, we need to correct this.
// Checking how main.ts initializes other things.

// We will initialize lazily in registerWorldHandlers or at module level if valid.
let worldService: WorldService | null = null;

export function registerWorldHandlers(dbPath: string): void {
    console.log(`[WorldHandlers] Initializing with DB at ${dbPath}`);

    const db = createDb(dbPath);
    const worldRepo = new DrizzleWorldRepository(db);
    const configRepo = new DrizzleWorldConfigRepository(db);
    const telosRepo = new DrizzleWorldTelosRepository(db);

    worldService = new WorldService(worldRepo, telosRepo, configRepo);

    // ==========================================
    // World CRUD
    // ==========================================

    ipcMain.handle(WorldChannels.CREATE, async (event: IpcMainInvokeEvent, input: CreateWorldInput) => {
        console.log('[IPC] world:create', input);
        return await worldService!.create(input);
    });

    ipcMain.handle(WorldChannels.GET, async (event: IpcMainInvokeEvent, id: string) => {
        return await worldService!.getById(id);
    });

    ipcMain.handle(WorldChannels.LIST, async (event: IpcMainInvokeEvent) => {
        return await worldService!.getAll();
    });

    ipcMain.handle(WorldChannels.UPDATE, async (event: IpcMainInvokeEvent, id: string, input: UpdateWorldInput) => {
        console.log('[IPC] world:update', id, input);
        return await worldService!.update(id, input);
    });

    ipcMain.handle(WorldChannels.DELETE, async (event: IpcMainInvokeEvent, id: string) => {
        console.log('[IPC] world:delete', id);
        return await worldService!.delete(id);
    });

    console.log('[IPC] World handlers registered.');
}
