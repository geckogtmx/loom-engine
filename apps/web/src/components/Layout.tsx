import React, { useEffect } from 'react';
import { WorldSelector } from './WorldSelector';
import { useWorldStore } from '../store/useWorldStore';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { fetchWorlds, error } = useWorldStore();

    useEffect(() => {
        fetchWorlds();
    }, [fetchWorlds]);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col">
                <div className="p-4 border-b border-slate-800">
                    <h1 className="font-bold text-lg tracking-wide text-indigo-400">LOOM Engine</h1>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    <WorldSelector />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {error && (
                    <div className="bg-red-500/10 border-l-4 border-red-500 p-4 text-red-200">
                        Error: {error}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
};
