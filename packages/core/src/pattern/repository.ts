
// packages/core/src/pattern/repository.ts

import { PatternDef } from './types';

export interface IPatternRepository {
    get(id: string): Promise<PatternDef | null>;
    getByName(name: string): Promise<PatternDef | null>;
    search(query: string, family?: string): Promise<PatternDef[]>;
    getAll(): Promise<PatternDef[]>;

    save(pattern: PatternDef): Promise<void>;
    delete(id: string): Promise<void>;
}

export class InMemoryPatternRepository implements IPatternRepository {
    private patterns: Map<string, PatternDef> = new Map();

    async get(id: string): Promise<PatternDef | null> {
        return this.patterns.get(id) || null;
    }

    async getByName(name: string): Promise<PatternDef | null> {
        for (const p of this.patterns.values()) {
            if (p.name === name) return p;
        }
        return null;
    }

    async search(query: string, family?: string): Promise<PatternDef[]> {
        const results: PatternDef[] = [];
        const q = query.toLowerCase();

        for (const p of this.patterns.values()) {
            const matchesQuery = p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q);
            const matchesFamily = family ? p.family === family : true;

            if (matchesQuery && matchesFamily) {
                results.push(p);
            }
        }
        return results;
    }

    async getAll(): Promise<PatternDef[]> {
        return Array.from(this.patterns.values());
    }

    async save(pattern: PatternDef): Promise<void> {
        this.patterns.set(pattern.id, pattern);
    }

    async delete(id: string): Promise<void> {
        this.patterns.delete(id);
    }
}
