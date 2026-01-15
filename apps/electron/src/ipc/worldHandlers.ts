import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { WorldChannels } from './channels';
import {
    WorldService,
    DrizzleWorldRepository,
    CreateWorldSchema,
    UpdateWorldSchema,
    WorldIdSchema,
} from '@loom/core';
import { createDb } from '@loom/db';
import path from 'path';
import { fileURLToPath } from 'url';
import { ZodError } from 'zod';

// Initialize DB and Service outside of handler to keep it singleton-ish
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../newsforge.db'); // Fallback or env

let worldService: WorldService | null = null;

export function registerWorldHandlers(dbPath: string): void {
    console.log(`[WorldHandlers] Initializing with DB at ${dbPath}`);

    const db = createDb(dbPath);

    // WorldService initialization - repositories are internal to WorldService
    // For now, we'll defer full initialization until WorldService constructor is updated
    // This is a TODO for Phase 3 cleanup
    worldService = null as any; // Placeholder - Phase 3 work needed

    // ==========================================
    // World CRUD with Zod Validation
    // ==========================================

    ipcMain.handle(WorldChannels.CREATE, async (event: IpcMainInvokeEvent, input: unknown) => {
        try {
            const validated = CreateWorldSchema.parse(input);
            console.log('[IPC] world:create', validated);
            return await worldService!.create(validated);
        } catch (error) {
            if (error instanceof ZodError) {
                throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`);
            }
            throw error;
        }
    });

    ipcMain.handle(WorldChannels.GET, async (event: IpcMainInvokeEvent, id: unknown) => {
        try {
            const validated = WorldIdSchema.parse(id);
            return await worldService!.getById(validated);
        } catch (error) {
            if (error instanceof ZodError) {
                throw new Error(`Invalid World ID: ${error.errors[0].message}`);
            }
            throw error;
        }
    });

    ipcMain.handle(WorldChannels.LIST, async (event: IpcMainInvokeEvent) => {
        return await worldService!.getAll();
    });

    ipcMain.handle(WorldChannels.UPDATE, async (event: IpcMainInvokeEvent, id: unknown, input: unknown) => {
        try {
            const validatedId = WorldIdSchema.parse(id);
            const validatedInput = UpdateWorldSchema.parse(input);
            console.log('[IPC] world:update', validatedId, validatedInput);
            return await worldService!.update(validatedId, validatedInput);
        } catch (error) {
            if (error instanceof ZodError) {
                throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(', ')}`);
            }
            throw error;
        }
    });

    ipcMain.handle(WorldChannels.DELETE, async (event: IpcMainInvokeEvent, id: unknown) => {
        try {
            const validated = WorldIdSchema.parse(id);
            console.log('[IPC] world:delete', validated);
            return await worldService!.delete(validated);
        } catch (error) {
            if (error instanceof ZodError) {
                throw new Error(`Invalid World ID: ${error.errors[0].message}`);
            }
            throw error;
        }
    });

    console.log('[IPC] World handlers registered with Zod validation.');
}
