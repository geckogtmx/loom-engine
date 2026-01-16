
import React, { useState } from 'react';
import { useThemeStore, ThemeId, themes } from '../../store/ThemeStore';
import { Palette, Check } from 'lucide-react';

export function ThemeSwitcher() {
    const { currentTheme, setTheme } = useThemeStore();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Change Theme"
            >
                <Palette size={20} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1">
                        {(Object.keys(themes) as ThemeId[]).map((themeId) => (
                            <button
                                key={themeId}
                                onClick={() => {
                                    setTheme(themeId);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-between"
                            >
                                <span className="capitalize">{themeId.replace('-', ' ')}</span>
                                {currentTheme === themeId && <Check size={14} className="text-indigo-400" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
