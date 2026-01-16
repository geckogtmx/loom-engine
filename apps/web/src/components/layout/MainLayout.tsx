import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { StatusFooter } from './StatusFooter';
import { useWorldStore } from '../../store/useWorldStore';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { fetchWorlds, error } = useWorldStore();

    useEffect(() => {
        fetchWorlds();
    }, [fetchWorlds]);

    // Define keyboard shortcuts
    useKeyboardShortcuts([
        { key: 'K', meta: true, action: () => console.log('Search'), description: 'Search' },
        { key: 'D', meta: true, action: () => console.log('Dashboard'), description: 'Go to Dashboard' },
    ]);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
                <main className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                    {/* Error Banner */}
                    {error && (
                        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 text-red-200 sticky top-0 z-50 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <span className="font-bold">System Error:</span>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Page Content */}
                    {children}
                </main>

                {/* Status Footer */}
                <StatusFooter />
            </div>
        </div>
    );
};
