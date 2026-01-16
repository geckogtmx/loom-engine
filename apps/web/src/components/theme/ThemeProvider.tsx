import React, { useEffect } from 'react';
import { useThemeStore, themes } from '../../store/ThemeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { currentTheme } = useThemeStore();

    useEffect(() => {
        const theme = themes[currentTheme];
        const root = document.documentElement;

        // Apply theme colors as CSS variables
        root.style.setProperty('--color-background', theme.background);
        root.style.setProperty('--color-foreground', theme.foreground);
        root.style.setProperty('--color-primary', theme.primary);
        root.style.setProperty('--color-secondary', theme.secondary);
        root.style.setProperty('--color-accent', theme.accent);
        root.style.setProperty('--color-muted', theme.muted);
        root.style.setProperty('--color-border', theme.border);

        // Also update standard Tailwind colors if needed, but CSS vars approach assumes 
        // Tailwind config maps these. Since we are in Tailwind 4, we might need to 
        // just rely on these vars being used in index.css or via arbitrary values.

        // For debugging/transparency
        document.body.dataset.theme = currentTheme;

    }, [currentTheme]);

    return <>{children}</>;
}
