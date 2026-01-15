import React, { useEffect } from 'react';
import { useSessionStore } from '../store/useSessionStore';
import { useWorldStore } from '../store/useWorldStore';
import { ArrowLeft, Plus, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface SessionsViewProps {
    onBack: () => void;
}

export function SessionsView({ onBack }: SessionsViewProps) {
    const { activeWorld } = useWorldStore();
    const { sessions, isLoading, fetchSessions, createSession, selectSession } = useSessionStore();

    useEffect(() => {
        if (activeWorld) {
            fetchSessions(activeWorld.id);
        }
    }, [activeWorld]);

    const handleCreate = async () => {
        if (activeWorld) {
            await createSession(activeWorld.id);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'PENDING': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'CLOSED': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
            case 'FAILED': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-1"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Sessions</h2>
                    <p className="text-slate-400">
                        History for <span className="text-indigo-400 font-medium">{activeWorld?.name}</span>
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={18} />
                    New Session
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {isLoading && sessions.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 italic">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="text-slate-600" size={24} />
                        </div>
                        <h3 className="text-slate-400 font-medium">No sessions found</h3>
                        <p className="text-slate-600 text-sm mt-1">Start a new session to begin working.</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl hover:bg-slate-900 hover:border-slate-700 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 text-xs rounded border uppercase font-bold tracking-wider ${getStatusColor(session.state)}`}>
                                            {session.state}
                                        </span>
                                        <span className="text-slate-500 text-xs font-mono">{session.id}</span>
                                        <span className="text-slate-600 text-xs">
                                            {new Date(session.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-slate-200 text-lg group-hover:text-indigo-300 transition-colors">
                                        {session.intentEnvelope?.goal || "Untitled Session"}
                                    </h3>
                                    {session.intentEnvelope?.audience && (
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span className="text-slate-600">Audience:</span>
                                            <span>{session.intentEnvelope.audience}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectSession(session);
                                        }}
                                        className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105"
                                    >
                                        <Play size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
