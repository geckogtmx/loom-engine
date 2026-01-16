
import React from 'react';
import { useWorldStore } from '../../store/useWorldStore';
import { Globe, Plus } from 'lucide-react';

export const WorldsDashboard: React.FC = () => {
    const { worlds, setActiveWorld } = useWorldStore();

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Worlds</h1>
                    <p className="mt-2 text-lg text-slate-400">Manage isolated cognitive environments.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-900/20">
                    <Plus size={18} />
                    <span>Create World</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {worlds.map(world => (
                    <div
                        key={world.id}
                        onClick={() => setActiveWorld(world.id)}
                        className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 hover:border-indigo-500/50 transition-all cursor-pointer group flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
                                <Globe size={20} />
                            </div>
                            <span className="text-xs font-mono text-slate-600 border border-slate-800 bg-slate-950 px-2 py-1 rounded">
                                {world.id}
                            </span>
                        </div>

                        <h3 className="font-semibold text-lg text-slate-200 mb-2 group-hover:text-white">{world.name}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4 flex-1">
                            {world.purpose}
                        </p>

                        <div className="flex items-center gap-2 mt-auto">
                            <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 uppercase tracking-wide font-bold">
                                {world.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
