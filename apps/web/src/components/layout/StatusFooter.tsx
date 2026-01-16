import React from 'react';
import { Wifi, Activity, DollarSign, Cpu } from 'lucide-react';
import { AuthStatus } from '../AuthStatus';

export const StatusFooter: React.FC = () => {
    // TODO: Connect to actual stores
    const isConnected = true;
    const tempo = 'andante';
    const cost = 0.00;
    const model = 'gemini-1.5-pro';

    return (
        <footer className="h-8 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-4 text-xs select-none">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2" title="Connection Status">
                    <Wifi size={12} className={isConnected ? "text-emerald-500" : "text-red-500"} />
                    <span className={isConnected ? "text-slate-400" : "text-red-400"}>
                        {isConnected ? "Connected" : "Offline"}
                    </span>
                </div>

                <div className="h-3 w-px bg-slate-800" />

                <div className="flex items-center gap-2" title="Security Status">
                    <AuthStatus status="authenticated" />
                </div>

                <div className="h-3 w-px bg-slate-800" />

                <div className="flex items-center gap-2" title="Current Tempo">
                    <Activity size={12} className="text-indigo-400" />
                    <span className="text-slate-400 capitalize">{tempo}</span>
                </div>

                <div className="h-3 w-px bg-slate-800" />

                <div className="flex items-center gap-2" title="Active Model">
                    <Cpu size={12} className="text-slate-500" />
                    <span className="text-slate-400">{model}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1" title="Session Cost">
                    <DollarSign size={12} className="text-slate-500" />
                    <span className="text-slate-400 font-mono">${cost.toFixed(4)}</span>
                </div>
            </div>
        </footer>
    );
};
