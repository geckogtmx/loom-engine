import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeId = 'dracula' | 'nord' | 'catppuccin' | 'tokyo-night' | 'loom-dark' | 'antigravity';

export interface ThemeColors {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
}

interface ThemeState {
    currentTheme: ThemeId;
    setTheme: (theme: ThemeId) => void;
}

export const themes: Record<ThemeId, ThemeColors> = {
    'loom-dark': {
        background: '#0f172a',
        foreground: '#f8fafc',
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#0ea5e9',
        muted: '#1e293b',
        border: '#334155'
    },
    'dracula': {
        background: '#282a36',
        foreground: '#f8f8f2',
        primary: '#bd93f9',
        secondary: '#6272a4',
        accent: '#ff79c6',
        muted: '#44475a',
        border: '#6272a4'
    },
    'nord': {
        background: '#2e3440',
        foreground: '#d8dee9',
        primary: '#88c0d0',
        secondary: '#4c566a',
        accent: '#81a1c1',
        muted: '#3b4252',
        border: '#434c5e'
    },
    'catppuccin': {
        background: '#1e1e2e',
        foreground: '#cdd6f4',
        primary: '#cba6f7',
        secondary: '#585b70',
        accent: '#f5c2e7',
        muted: '#313244',
        border: '#45475a'
    },
    'tokyo-night': {
        background: '#1a1b26',
        foreground: '#a9b1d6',
        primary: '#7aa2f7',
        secondary: '#565f89',
        accent: '#bb9af7',
        muted: '#24283b',
        border: '#414868'
    },
    'antigravity': {
        background: '#002029', // ink-black
        foreground: '#e2e8f0', // slate-200 (readable contrast)
        primary: '#00607a',    // dark-teal-3 (user specified)
        secondary: '#005066',  // dark-teal-2
        accent: '#2dd4bf',     // teal-400 (complementary pop, user didn't specify so inferred)
        muted: '#00303d',      // jet-black
        border: '#004052'      // dark-teal
    }
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            currentTheme: 'loom-dark',
            setTheme: (theme) => set({ currentTheme: theme }),
        }),
        {
            name: 'loom-theme-storage',
        }
    )
);
