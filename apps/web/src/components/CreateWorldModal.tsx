import React, { useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { X, Loader2 } from 'lucide-react';

interface CreateWorldModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateWorldModal: React.FC<CreateWorldModalProps> = ({ isOpen, onClose }) => {
    const { createWorld, isLoading } = useWorldStore();
    const [name, setName] = useState('');
    const [purpose, setPurpose] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createWorld({ name, purpose });
        setName('');
        setPurpose('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Create New World</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                            placeholder="e.g. Neo-Tokyo Simulation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Purpose</label>
                        <textarea
                            required
                            rows={3}
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                            placeholder="Define the primary goal or theme of this world..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Create World'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
