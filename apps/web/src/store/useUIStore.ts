import { create } from 'zustand';

export type ViewType = 'DASHBOARD' | 'SESSIONS' | 'RUNNER' | 'ENGINE_MANAGER';

interface UIState {
    activeView: ViewType;
    setView: (view: ViewType) => void;
}

export const useUIStore = create<UIState>((set) => ({
    activeView: 'DASHBOARD',
    setView: (view) => set({ activeView: view }),
}));
