import React from 'react';
import { WorldSelector } from '../WorldSelector';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { Home, LayoutDashboard, Settings, Layers, Power } from 'lucide-react';

import { useUIStore } from '../../store/useUIStore';

export const Sidebar: React.FC = () => {
    const { activeView, setView } = useUIStore();
    return (
        <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col backdrop-blur-sm">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-bold">
                        L
                    </div>
                    <div>
                        <h1 className="font-bold text-sm tracking-wide text-indigo-100">LOOM Engine</h1>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Operator Active</div>
                    </div>
                </div>
                <button
                    onClick={() => window.api.window.close()}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200 group"
                    title="Quit Application"
                >
                    <Power size={16} />
                </button>
            </div>

            {/* World Context */}
            <div className="p-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Active World</div>
                <WorldSelector />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1 text-slate-500/50 pt-2">System</div>

                <button
                    onClick={() => setView('DASHBOARD')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left group ${activeView === 'DASHBOARD' ? 'bg-indigo-500/10 text-indigo-100' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                        }`}
                >
                    <LayoutDashboard size={16} className={`${activeView === 'DASHBOARD' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'} transition-colors`} />
                    Dashboard
                </button>

                <button
                    onClick={() => setView('ENGINE_MANAGER')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left group ${activeView === 'ENGINE_MANAGER' ? 'bg-indigo-500/10 text-indigo-100' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                        }`}
                >
                    <Layers size={16} className={`${activeView === 'ENGINE_MANAGER' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'} transition-colors`} />
                    Engine Manager
                </button>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 font-medium">System v1.2</span>
                        <span className="text-[10px] text-slate-600">Phase 8.0</span>
                    </div>
                    <ThemeSwitcher />
                </div>
            </div>
        </aside>
    );
};
