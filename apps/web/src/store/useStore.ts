import { create } from 'zustand';
import { World, SessionStatus } from '@loom/core';

interface AppState {
  currentWorld: World | null;
  sessionStatus: SessionStatus;
  setCurrentWorld: (world: World | null) => void;
  setSessionStatus: (status: SessionStatus) => void;
}

export const useStore = create<AppState>((set) => ({
  currentWorld: null,
  sessionStatus: 'closed',
  setCurrentWorld: (world) => set({ currentWorld: world }),
  setSessionStatus: (status) => set({ sessionStatus: status }),
}));
