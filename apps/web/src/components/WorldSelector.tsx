import React, { useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { Plus, Globe, Trash2, ArrowRight } from 'lucide-react';
import { CreateWorldModal } from './CreateWorldModal';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export const WorldSelector: React.FC = () => {
    const { worlds, activeWorld, selectWorld, deleteWorld } = useWorldStore();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this World? This cannot be undone.')) {
            await deleteWorld(id);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Worlds</span>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                    title="Create World"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="space-y-1">
                {worlds.map((world) => (
                    <div
                        key={world.id}
                        onClick={() => selectWorld(world.id)}
                        className={cn(
                            "group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors",
                            activeWorld?.id === world.id
                                ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        )}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <Globe size={16} className={activeWorld?.id === world.id ? 'text-indigo-400' : 'text-slate-600'} />
                            <span className="truncate text-sm font-medium">{world.name}</span>
                        </div>

                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => handleDelete(e, world.id)}
                                className="p-1 hover:text-red-400 text-slate-500"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}

                {worlds.length === 0 && (
                    <div className="text-sm text-slate-600 px-3 py-4 text-center border border-dashed border-slate-800 rounded-lg">
                        No worlds yet.
                    </div>
                )}
            </div>

            <CreateWorldModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />
        </div>
    );
};
