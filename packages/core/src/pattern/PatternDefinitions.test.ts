
// packages/core/src/pattern/PatternDefinitions.test.ts

import { describe, it, expect } from 'vitest';
import { PatternRegistry } from './PatternRegistry';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Core Pattern Definitions', () => {
    const registry = new PatternRegistry();
    const knowledgePath = path.resolve(__dirname, '../../../../knowledge/03_Entities/Patterns');

    const patternsToVerify = [
        'Option Burst.md',
        'Fact Check.md',
        'Metaphor Bloom.md',
        'Narrative Spine.md',
        'Framework Forge.md',
        'Decision Diamond.md',
        'Possibility Engine.md'
    ];

    it('should parse all core patterns successfully', async () => {
        const parser = (registry as any).parser;

        for (const filename of patternsToVerify) {
            const filePath = path.join(knowledgePath, filename);
            const content = await fs.readFile(filePath, 'utf-8');

            expect(content).toBeDefined();

            const pattern = parser.parse(content, filename);

            expect(pattern).toBeDefined();
            expect(pattern.name).toBeTruthy();
            expect(pattern.steps.length).toBeGreaterThan(0);

            // Validation rules
            pattern.steps.forEach((step: any) => {
                expect(step.agentRole).toBeTruthy();
                expect(step.systemPrompt).toBeTruthy();
            });

            // Check Inputs
            if (pattern.name === 'Metaphor Bloom') {
                expect(pattern.inputs.length).toBe(2);
                expect(pattern.inputs[0].name).toBe('Concept');
            }
        }
    });
});
