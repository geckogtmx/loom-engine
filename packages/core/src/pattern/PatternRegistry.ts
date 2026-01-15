
// packages/core/src/pattern/PatternRegistry.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import { IPatternRepository, InMemoryPatternRepository } from './repository';
import { PatternParser } from './PatternParser';
import { PatternDef } from './types';

export class PatternRegistry {
    private repository: IPatternRepository;
    private parser: PatternParser;

    constructor(repository?: IPatternRepository) {
        this.repository = repository || new InMemoryPatternRepository();
        this.parser = new PatternParser();
    }

    /**
     * Scans a directory for Pattern markdown files and loads them into the repository.
     */
    async loadFromL3(directoryPath: string): Promise<void> {
        try {
            const files = await fs.readdir(directoryPath);

            for (const file of files) {
                if (file.endsWith('.md') && !file.startsWith('_')) {
                    const fullPath = path.join(directoryPath, file);
                    const content = await fs.readFile(fullPath, 'utf-8');

                    try {
                        const pattern = this.parser.parse(content, file);
                        await this.repository.save(pattern);
                        // console.log(`[PatternRegistry] Loaded: ${pattern.name} (${pattern.family})`);
                    } catch (err) {
                        console.error(`[PatternRegistry] Failed to parse ${file}:`, err);
                    }
                }
            }
        } catch (err) {
            console.error(`[PatternRegistry] Error loading patterns from ${directoryPath}:`, err);
            throw err;
        }
    }

    async getPattern(id: string): Promise<PatternDef | null> {
        return this.repository.get(id);
    }

    async getByName(name: string): Promise<PatternDef | null> {
        return this.repository.getByName(name);
    }

    async search(query: string, family?: string): Promise<PatternDef[]> {
        return this.repository.search(query, family);
    }

    async getAll(): Promise<PatternDef[]> {
        return this.repository.getAll();
    }
}
