import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { SessionChannels } from './channels';
import {
    SessionService,
    DrizzleSessionRepository,
    DrizzleCheckpointRepository,
    CreateSessionSchema,
    SetIntentSchema,
    SessionIdSchema,
    ListSessionsSchema,
} from '@loom/core';
import { createDb } from '@loom/db';
import path from 'path';
import { fileURLToPath } from 'url';
import { ZodError } from 'zod';

// Initialize DB and Service outside of handler to keep it singleton-ish
// In a real app we might want a ServiceContainer or similar
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// We need to know the DB path. It should be passed in or configured globally.
// For now, we'll create a factory function similar to worldHandlers
let sessionService: SessionService | null = null;
let sessions: Map<string, SessionService> = new Map(); // Keep track of active session services if multiton

// However, SessionService in Core seems designed as a per-session instance?
// Looking at SessionService constructor: constructor(worldId: string, ...)
// Yes, it represents a SINGLE session.
// So we need a SessionManager or we need to manage a map of SessionServices here in IPC layer.

export function registerSessionHandlers(dbPath: string): void {
    const db = createDb(dbPath);
    const sessionRepo = new DrizzleSessionRepository(db);
    const checkpointRepo = new DrizzleCheckpointRepository(db);

    // Create a new session
    ipcMain.handle(SessionChannels.CREATE, async (event: IpcMainInvokeEvent, input: unknown) => {
        try {
            const { worldId } = CreateSessionSchema.parse(input);
            console.log(`[IPC] Creating session for world ${worldId}`);
            const service = new SessionService(worldId, sessionRepo, checkpointRepo);

            // Initialize (persists PENDING/PRIMACY state)
            await service.initialize();

            // Store the service instance in memory
            sessions.set(service.id, service);

            return {
                sessionId: service.id,
                state: service.state
            };
        } catch (error) {
            if (error instanceof ZodError) {
        throw new Error(`Invalid input: ${(error as any).errors.map((e: any) => e.message).join(', ')}`);
    }
    throw error;
}
    });

// List sessions for a world
ipcMain.handle(SessionChannels.LIST, async (event: IpcMainInvokeEvent, input: unknown) => {
    try {
        const { worldId } = ListSessionsSchema.parse(input);
        return await sessionRepo.list(worldId);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(`Invalid World ID: ${(error as any).errors[0].message}`);
        }
        throw error;
    }
});

// Initialize/Load existing session (Resume)
// We need a way to load a specific session ID into memory if it's not there
ipcMain.handle(SessionChannels.INITIALIZE, async (event: IpcMainInvokeEvent, sessionId: string) => {
    // If already in memory, return it
    if (sessions.has(sessionId)) {
        return { state: sessions.get(sessionId)!.state };
    }

    // Otherwise verify it exists in DB (re-hydrate)
    const sessionData = await sessionRepo.getById(sessionId);
    if (!sessionData) {
        throw new Error(`Session ${sessionId} not found`);
    }

    // Re-create service (hydration logic needed in Service?)
    // For now, we create a new Service. 
    // WARNING: SessionService currently initializes as new. We might need a .load() or static .from() method.
    // But for Remediation Phase, let's assuming we are just creating fresh for now or add TODO.
    // Actually, we should fix this properly. 
    // If we just `new SessionService`, it creates new ID.
    // We need to re-make SessionService capable of loading existing ID.

    // For this step, let's just handle active sessions in memory.
    // Full hydration is a larger task (Phase 2.4 Recovery).
    throw new Error('Session hydration not fully implemented yet');
});

// Set session intent
ipcMain.handle(SessionChannels.SET_INTENT, async (event: IpcMainInvokeEvent, input: unknown) => {
    try {
        const { sessionId, goal, audience, constraints } = SetIntentSchema.parse(input);
        const service = sessions.get(sessionId);
        if (!service) throw new Error('Session not found active');

        await service.setIntent(goal, audience, constraints || []);
        return { success: true };
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(`Invalid input: ${(error as any).errors.map((e: any) => e.message).join(', ')}`);
        }
        throw error;
    }
});

// Start session
ipcMain.handle(SessionChannels.START, async (event: IpcMainInvokeEvent, sessionId: unknown) => {
    try {
        const validated = SessionIdSchema.parse(sessionId);
        const service = sessions.get(validated);
        if (!service) throw new Error('Session not found active');

        await service.start();
        return { state: service.state };
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(`Invalid Session ID: ${(error as any).errors[0].message}`);
        }
        throw error;
    }
});

// End session
ipcMain.handle(SessionChannels.END, async (event: IpcMainInvokeEvent, sessionId: unknown) => {
    try {
        const validated = SessionIdSchema.parse(sessionId);
        const service = sessions.get(validated);
        if (!service) throw new Error('Session not found active');

        await service.end();
        sessions.delete(validated);
        return { state: service.state };
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(`Invalid Session ID: ${(error as any).errors[0].message}`);
        }
        throw error;
    }
});

// Get session state
ipcMain.handle(SessionChannels.GET_STATE, async (event: IpcMainInvokeEvent, sessionId: unknown) => {
    try {
        const validated = SessionIdSchema.parse(sessionId);
        const service = sessions.get(validated);
        if (!service) {
            // Check DB?
            const data = await sessionRepo.getById(validated);
            return data ? { state: data.state } : null;
        }
        return { state: service.state };
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(`Invalid Session ID: ${(error as any).errors[0].message}`);
        }
        throw error;
    }
});

console.log('[IPC] Session handlers registered with Zod validation.');
}
