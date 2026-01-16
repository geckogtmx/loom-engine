
import React from 'react';
import { Layers, Server, Activity, Database } from 'lucide-react';

export const EngineManager: React.FC = () => {
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Engine Manager</h1>
                <p className="mt-2 text-lg text-slate-400">System-wide configuration, governance, and updates.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={<Activity />} label="System Load" value="12%" color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
                <MetricCard icon={<Server />} label="Active Sessions" value="3" color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
                <MetricCard icon={<Database />} label="DB Size" value="1.2 MB" color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
                <MetricCard icon={<Layers />} label="Total Worlds" value="8" color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20" />
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-300 mb-2">Governance Console</h2>
                <p className="text-slate-500">Global A0 Policies and META rules configuration coming soon.</p>
            </div>
        </div>
    );
};

const MetricCard = ({ icon, label, value, color, bg, border }: any) => (
    <div className={`p-4 rounded-lg border ${border} ${bg} backdrop-blur-sm flex items-center justify-between`}>
        <div className="flex items-center gap-3">
            <div className={`${color}`}>{icon}</div>
            <span className="text-slate-400 text-sm font-medium">{label}</span>
        </div>
        <span className="text-xl font-bold text-slate-200">{value}</span>
    </div>
);
