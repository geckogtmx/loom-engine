import React, { useEffect, useState, useRef } from 'react';
import { useSessionStore, Session } from '../store/useSessionStore';
import { ArrowLeft, Send, Mic, RefreshCw, Cpu, Database, Save, Activity, Play } from 'lucide-react';

interface SessionRunnerProps {
    onBack: () => void;
}

export function SessionRunner({ onBack }: SessionRunnerProps) {
    const { activeSession } = useSessionStore();
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mock messages for now until we hook up L2/WebSocket
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant' | 'system', content: string }[]>([
        { role: 'system', content: 'Session Initialized. Environment: Local (Ollama). Core: Active.' },
        { role: 'assistant', content: 'I am ready. What is our objective?' }
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        // Add User Message
        setMessages(prev => [...prev, { role: 'user', content: input }]);
        const userMsg = input;
        setInput('');
        setIsStreaming(true);

        // Simulate AI Response (Placeholder for Phase 7)
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: `Acknowledged: "${userMsg}". (Simulated Response)` }]);
            setIsStreaming(false);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!activeSession) return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Activity className="animate-pulse mb-4" size={32} />
            <p>Initializing Session...</p>
        </div>
    );

    // PRIMACY Phase: Intent Setting
    if (activeSession.state === 'PRIMACY' || activeSession.state === 'INITIALIZING' || activeSession.state === 'PENDING') {
        return (
            <div className="flex h-full gap-6 animate-in fade-in duration-500">
                <PrimacyView onBack={onBack} activeSession={activeSession} />
            </div>
        );
    }

    // ACTIVE Phase: Chat Interface
    return (
        <div className="flex h-full gap-6 animate-in fade-in duration-500">
            {/* Left: Context / Status */}
            <div className="w-80 flex flex-col gap-6">
                <div className="space-y-1">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-2"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Session</span>
                        </div>
                        <h2 className="text-lg font-bold text-white leading-tight mb-1">
                            {activeSession.intentEnvelope?.goal || "Untitled Session"}
                        </h2>
                        <p className="text-xs text-slate-500 font-mono">{activeSession.id}</p>
                    </div>
                </div>

                {/* Context Inspector Placeholder */}
                <div className="flex-1 bg-slate-900/30 rounded-xl border border-slate-800/50 p-4 flex flex-col">
                    <div className="flex items-center gap-2 text-slate-400 mb-4 text-sm font-medium">
                        <Database size={16} /> Data Context
                    </div>
                    <div className="flex-1 text-xs text-slate-600 font-mono overflow-y-auto">
                        <div className="p-2 border border-slate-800 rounded mb-2 bg-slate-950">
                            Loaded: World Config
                        </div>
                        <div className="p-2 border border-slate-800 rounded mb-2 bg-slate-950">
                            Env: {activeSession.worldId}
                        </div>
                    </div>
                </div>
            </div>

            {/* Center: Chat Interface */}
            <div className="flex-1 flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed
                                ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : msg.role === 'system'
                                        ? 'bg-slate-800/50 text-slate-400 text-xs font-mono border border-slate-700/50 w-full text-center'
                                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                }
                            `}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                    <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
                        <div className="flex-1 bg-slate-800/50 rounded-xl border border-slate-700 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all flex flex-col">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter instruction..."
                                className="w-full bg-transparent border-none text-slate-200 placeholder-slate-500 text-sm p-4 min-h-[60px] max-h-[200px] resize-none focus:ring-0 scrollbar-hide"
                                rows={1}
                            />
                            <div className="flex items-center justify-between px-2 pb-2">
                                <span className="text-[10px] text-slate-600 font-medium px-2">L1 ACTIVE MEMORY</span>
                                <div className="flex items-center gap-1">
                                    <button className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50">
                                        <Mic size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isStreaming}
                            className={`
                                p-4 rounded-xl flex items-center justify-center transition-all
                                ${input.trim() && !isStreaming
                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }
                            `}
                        >
                            {isStreaming ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Agent / Tool Status */}
            <div className="w-72 flex flex-col gap-4">
                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 text-slate-400 mb-3 text-sm font-medium">
                        <Cpu size={16} /> Agent State
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs p-2 bg-slate-950 rounded border border-slate-800/50">
                            <span className="text-slate-500">Status</span>
                            <span className={`font-bold ${isStreaming ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {isStreaming ? 'THINKING' : 'IDLE'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs p-2 bg-slate-950 rounded border border-slate-800/50">
                            <span className="text-slate-500">Model</span>
                            <span className="text-indigo-400 font-mono">Ollama:llama3</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-slate-900/30 rounded-xl border border-slate-800/50 p-4">
                    <div className="flex items-center gap-2 text-slate-400 mb-4 text-sm font-medium">
                        <Save size={16} /> Artifacts
                    </div>
                    <div className="text-center text-xs text-slate-600 py-8 italic">
                        No artifacts generated yet.
                    </div>
                </div>
            </div>
        </div>
    );
}

function PrimacyView({ onBack, activeSession }: { onBack: () => void, activeSession: Session }) {
    const { setIntent, startSession, isLoading } = useSessionStore();
    const [goal, setGoal] = useState(activeSession.intentEnvelope?.goal || '');
    const [audience, setAudience] = useState(activeSession.intentEnvelope?.audience || 'General');
    const [constraints, setConstraints] = useState(activeSession.intentEnvelope?.constraints?.join('\n') || '');

    const handleStart = async () => {
        if (!goal.trim()) return;
        const constraintList = constraints.split('\n').filter(c => c.trim());

        await setIntent(activeSession.id, goal, audience, constraintList);
        await startSession(activeSession.id);
    };

    return (
        <div className="max-w-2xl mx-auto w-full pt-12">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-6"
            >
                <ArrowLeft size={16} /> Cancel Session
            </button>

            <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Primacy Phase</h2>
                        <p className="text-slate-400 text-sm">Define the intent envelope before execution begins.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Goal (Telos)</label>
                        <textarea
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="What is the objective of this session?"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/50 transition-all min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Audience</label>
                            <input
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Constraints (One per line)</label>
                            <textarea
                                value={constraints}
                                onChange={(e) => setConstraints(e.target.value)}
                                placeholder="- No external tools\n- Use formal tone"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/50 min-h-[80px]"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-end">
                        <button
                            onClick={handleStart}
                            disabled={!goal.trim() || isLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                        >
                            {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                            Seal Envelope & Start
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
