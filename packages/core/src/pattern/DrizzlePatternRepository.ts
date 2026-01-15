
// packages/core/src/pattern/DrizzlePatternRepository.ts

import { IPatternRepository } from './repository';
import { PatternDef } from './types';
import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { patterns as patternsTable, patternSteps as patternStepsTable } from '@loom/db';

export class DrizzlePatternRepository implements IPatternRepository {
    constructor(private db: BetterSQLite3Database<any>) { }

    async get(id: string): Promise<PatternDef | null> {
        const result = await this.db.select().from(patternsTable).where(eq(patternsTable.id, id)).get();
        if (!result) return null;

        const steps = await this.db.select().from(patternStepsTable)
            .where(eq(patternStepsTable.patternId, id))
            .orderBy(patternStepsTable.order);

        return this.mapToDef(result, steps);
    }

    async getByName(name: string): Promise<PatternDef | null> {
        const result = await this.db.select().from(patternsTable).where(eq(patternsTable.name, name)).get();
        if (!result) return null;

        const steps = await this.db.select().from(patternStepsTable)
            .where(eq(patternStepsTable.patternId, result.id))
            .orderBy(patternStepsTable.order);

        return this.mapToDef(result, steps);
    }

    async search(query: string, family?: string): Promise<PatternDef[]> {
        const all = await this.getAll();
        const q = query.toLowerCase();

        return all.filter(p => {
            const matchesQuery = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
            const matchesFamily = family ? p.family === family : true;
            return matchesQuery && matchesFamily;
        });
    }

    async getAll(): Promise<PatternDef[]> {
        const allPatterns = await this.db.select().from(patternsTable).all();
        const defs: PatternDef[] = [];

        for (const p of allPatterns) {
            const steps = await this.db.select().from(patternStepsTable)
                .where(eq(patternStepsTable.patternId, p.id))
                .orderBy(patternStepsTable.order);
            defs.push(this.mapToDef(p, steps));
        }
        return defs;
    }

    async save(pattern: PatternDef): Promise<void> {
        const existing = await this.db.select().from(patternsTable).where(eq(patternsTable.name, pattern.name)).get();
        const patternId = existing ? existing.id : pattern.id;

        const values = {
            id: patternId,
            name: pattern.name,
            description: pattern.description,
            family: pattern.family,
            inputsSchema: JSON.stringify(pattern.inputs) as any,
            outputsSchema: JSON.stringify(pattern.outputs) as any,
            isSystem: true
        };

        if (existing) {
            await this.db.update(patternsTable).set(values).where(eq(patternsTable.id, patternId));
            await this.db.delete(patternStepsTable).where(eq(patternStepsTable.patternId, patternId));
            // console.log(`[DrizzleRepo] Updated: ${pattern.name}`);
        } else {
            await this.db.insert(patternsTable).values(values);
            // console.log(`[DrizzleRepo] Inserted: ${pattern.name}`);
        }

        for (const step of pattern.steps) {
            await this.db.insert(patternStepsTable).values({
                patternId: patternId,
                order: step.order,
                name: step.name,
                description: step.description,
                agentRole: step.agentRole,
                systemPrompt: step.systemPrompt || '',
                tempoMode: step.tempoMode,
            });
        }
    }

    async delete(id: string): Promise<void> {
        await this.db.delete(patternsTable).where(eq(patternsTable.id, id));
    }

    private mapToDef(p: any, steps: any[]): PatternDef {
        return {
            id: p.id,
            name: p.name,
            description: p.description,
            family: p.family,
            inputs: typeof p.inputsSchema === 'string' ? JSON.parse(p.inputsSchema) : p.inputsSchema || [],
            outputs: typeof p.outputsSchema === 'string' ? JSON.parse(p.outputsSchema) : p.outputsSchema || [],
            steps: steps.map(s => ({
                id: s.id,
                order: s.order,
                name: s.name,
                description: s.description,
                agentRole: s.agentRole,
                systemPrompt: s.systemPrompt,
                tempoMode: s.tempoMode as any,
                inputLayers: [],
                outputLayers: []
            })),
            tags: [],
            version: '1.0.0'
        };
    }
}
