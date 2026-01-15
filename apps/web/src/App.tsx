import React from 'react';
import { Layout } from './components/Layout';
import { useWorldStore } from './store/useWorldStore';
import { Globe, Activity, FileText } from 'lucide-react';

function App() {
    const { activeWorld } = useWorldStore();

    return (
        <Layout>
            <div className="h-full flex flex-col p-8">
                {activeWorld ? (
                    <div className="max-w-4xl mx-auto w-full space-y-8">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded border border-indigo-500/20 uppercase font-bold tracking-wider">
                                    {activeWorld.status}
                                </span>
                                <span className="text-slate-500 text-sm font-mono">{activeWorld.id}</span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">{activeWorld.name}</h1>
                            <p className="mt-2 text-lg text-slate-400 leading-relaxed max-w-2xl">
                                {activeWorld.purpose}
                            </p>
                        </div>

                        {/* Dashboard Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-500/20">
                                    <Activity size={20} />
                                </div>
                                <h3 className="font-semibold text-slate-200 mb-1">Sessions</h3>
                                <p className="text-sm text-slate-500">Manage and run active sessions in this world.</p>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500/20">
                                    <FileText size={20} />
                                </div>
                                <h3 className="font-semibold text-slate-200 mb-1">Telos & Config</h3>
                                <p className="text-sm text-slate-500">Edit the foundational definition and rules.</p>
                            </div>

                            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer group">
                                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 mb-4 group-hover:bg-purple-500/20">
                                    <Globe size={20} />
                                </div>
                                <h3 className="font-semibold text-slate-200 mb-1">Knowledge Graph</h3>
                                <p className="text-sm text-slate-500">Explore the L3 persistent memory structures.</p>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-700">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-4 ring-1 ring-slate-700">
                            <Globe className="text-slate-500" size={24} />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-200">No World Selected</h2>
                        <p className="text-slate-500 mt-1 max-w-sm">Select a world from the sidebar or create a new one to get started.</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default App;
