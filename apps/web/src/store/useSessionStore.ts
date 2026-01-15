import { create } from 'zustand';

// Define minimal Session type for frontend (mirroring Core SessionData)
export interface Session {
    id: string;
    worldId: string;
    state: string;
    createdAt: string | Date;
    closedAt?: string | Date;
    intentEnvelope?: {
        goal: string;
        audience: string;
        constraints: string[];
    };
}

interface SessionState {
    sessions: Session[];
    activeSession: Session | null;
    isLoading: boolean;
    error: string | null;

    fetchSessions: (worldId: string) => Promise<void>;
    createSession: (worldId: string) => Promise<void>;
    selectSession: (session: Session) => void;
    setIntent: (sessionId: string, goal: string, audience: string, constraints: string[]) => Promise<void>;
    startSession: (sessionId: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    sessions: [],
    activeSession: null,
    isLoading: false,
    error: null,

    fetchSessions: async (worldId: string) => {
        set({ isLoading: true, error: null });
        try {
            const sessions = await window.api.session.list(worldId);
            set({ sessions, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    createSession: async (worldId: string) => {
        set({ isLoading: true, error: null });
        try {
            const result = await window.api.session.create(worldId);
            // The result is { sessionId, state } usually, or the full object?
            // Checking sessionHandlers.ts: returns { sessionId, state }
            // We should probably fetch the list again or mock the object to add it immediately.
            // For now, let's fetch list.
            await get().fetchSessions(worldId);
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    selectSession: (session: Session) => {
        set({ activeSession: session });
    },

    setIntent: async (sessionId: string, goal: string, audience: string, constraints: string[]) => {
        set({ isLoading: true, error: null });
        try {
            await window.api.session.setIntent(sessionId, goal, audience, constraints);

            // Optimistic update of active session
            const { activeSession, sessions } = get();
            if (activeSession && activeSession.id === sessionId) {
                const updated = {
                    ...activeSession,
                    intentEnvelope: { goal, audience, constraints }
                };
                set({
                    activeSession: updated,
                    sessions: sessions.map(s => s.id === sessionId ? updated : s),
                    isLoading: false
                });
            }
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    startSession: async (sessionId: string) => {
        set({ isLoading: true, error: null });
        try {
            const { state } = await window.api.session.start(sessionId);

            // Update state
            const { activeSession, sessions } = get();
            if (activeSession && activeSession.id === sessionId) {
                const updated = { ...activeSession, state };
                set({
                    activeSession: updated,
                    sessions: sessions.map(s => s.id === sessionId ? updated : s),
                    isLoading: false
                });
            }
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    }
}));
