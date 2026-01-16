import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { useWorldStore } from './store/useWorldStore';
import { useSessionStore } from './store/useSessionStore';
import { SessionsView } from './components/SessionsView';
import { SessionRunner } from './components/SessionRunner';
import { Globe, Activity, FileText } from 'lucide-react';

import { useUIStore } from './store/useUIStore';
import { EngineManager } from './components/views/EngineManager';
import { WorldsDashboard } from './components/views/WorldsDashboard';

function App() {
    const { activeWorld } = useWorldStore();
    const { activeSession } = useSessionStore();
    const { activeView, setView } = useUIStore();

    // Reset view when world changes
    useEffect(() => {
        setView('DASHBOARD');
    }, [activeWorld?.id]);

    // Navigate to Runner when session is selected
    useEffect(() => {
        if (activeSession) {
            setView('RUNNER');
        }
    }, [activeSession]);

    return (
        <ThemeProvider>
            <MainLayout>
                {activeView === 'ENGINE_MANAGER' && <EngineManager />}

                {activeView === 'DASHBOARD' && (
                    <div className="h-full flex flex-col p-8">
                        <WorldsDashboard />
                    </div>
                )}

                {activeView === 'SESSIONS' && activeWorld && (
                    <div className="h-full flex flex-col p-8">
                        <SessionsView onBack={() => setView('DASHBOARD')} />
                    </div>
                )}

                {activeView === 'RUNNER' && activeSession && (
                    <div className="h-full flex flex-col p-8">
                        <SessionRunner onBack={() => setView('SESSIONS')} />
                    </div>
                )}

                {/* Fallback state when no world is selected but trying to view session/runner */}
                {((activeView === 'SESSIONS' || activeView === 'RUNNER') && !activeWorld) && (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 ring-1 ring-slate-700">
                            <Globe className="text-slate-500" size={24} />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-200">No World Selected</h2>
                        <p className="text-slate-500 mt-1 max-w-sm">Select a world from the sidebar to continue.</p>
                        <button
                            onClick={() => setView('DASHBOARD')}
                            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </MainLayout>
        </ThemeProvider>
    );
}

export default App;
