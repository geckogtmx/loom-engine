import { create } from 'zustand';
import { World, CreateWorldInput } from '@loom/core';

interface WorldState {
    worlds: World[];
    activeWorld: World | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchWorlds: () => Promise<void>;
    createWorld: (input: CreateWorldInput) => Promise<void>;
    selectWorld: (worldId: string) => Promise<void>;
    deleteWorld: (worldId: string) => Promise<void>;
}

export const useWorldStore = create<WorldState>((set, get) => ({
    worlds: [],
    activeWorld: null,
    isLoading: false,
    error: null,

    fetchWorlds: async () => {
        set({ isLoading: true, error: null });
        try {
            const worlds = await window.api.world.list();
            set({ worlds, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    createWorld: async (input: CreateWorldInput) => {
        set({ isLoading: true, error: null });
        try {
            const newWorld = await window.api.world.create(input);
            set((state) => ({
                worlds: [...state.worlds, newWorld],
                activeWorld: newWorld,
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    selectWorld: async (worldId: string) => {
        const world = get().worlds.find(w => w.id === worldId);
        if (world) {
            set({ activeWorld: world });
        } else {
            // Fallback fetch if not in list
            try {
                const fetched = await window.api.world.get(worldId);
                if (fetched) {
                    set({ activeWorld: fetched });
                }
            } catch (err) {
                console.error('Failed to select world', err);
            }
        }
    },

    deleteWorld: async (worldId: string) => {
        set({ isLoading: true });
        try {
            await window.api.world.delete(worldId);
            set((state) => ({
                worlds: state.worlds.filter(w => w.id !== worldId),
                activeWorld: state.activeWorld?.id === worldId ? null : state.activeWorld,
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    }
}));
