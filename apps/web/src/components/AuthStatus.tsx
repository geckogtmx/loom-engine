import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface AuthStatusProps {
    status: 'pending' | 'authenticated' | 'failed';
}

export const AuthStatus: React.FC<AuthStatusProps> = ({ status }) => {
    if (status === 'authenticated') {
        return (
            <div className="flex items-center gap-1 text-emerald-400" title="Secure Connection Authenticated">
                <ShieldCheck size={12} />
                <span className="text-[10px] font-mono">SECURE</span>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="flex items-center gap-1 text-red-400 animate-pulse" title="Authentication Failed">
                <ShieldAlert size={12} />
                <span className="text-[10px] font-mono">AUTH FAIL</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 text-yellow-400" title="Authenticating...">
            <Shield size={12} className="animate-pulse" />
            <span className="text-[10px] font-mono">AUTH...</span>
        </div>
    );
};
