
// packages/core/src/pattern/PatternRegistry.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { PatternRegistry } from './PatternRegistry';
import { PatternParser } from './PatternParser';

describe('PatternParser', () => {
    const parser = new PatternParser();
    const sampleMarkdown = `
# Option Burst

> **Family:** Ideation
> **Purpose:** Generate multiple distinct options for a decision.

## Inputs
- Problem Statement: string
- Constraints: string (optional)

## Steps

### 1. Diverge
**Agent:** Ideator
**Tempo:** Allegro

Generate 5 distinct options for the problem.
Constraint: No judgment.

### 2. Refine
**Agent:** Critic

Review the options and merge duplicates.
`;

    it('should parse metadata correctly', () => {
        const pattern = parser.parse(sampleMarkdown, 'Option Burst.md');
        expect(pattern.name).toBe('Option Burst');
        expect(pattern.family).toBe('Ideation');
        expect(pattern.description).toBe('Generate multiple distinct options for a decision.');
    });

    it('should parse steps correctly', () => {
        const pattern = parser.parse(sampleMarkdown, 'Option Burst.md');
        expect(pattern.steps).toHaveLength(2);

        const step1 = pattern.steps[0];
        expect(step1.name).toBe('Diverge');
        expect(step1.order).toBe(1);
        expect(step1.agentRole).toBe('Ideator');
        expect(step1.tempoMode).toBe('allegro');
        expect(step1.systemPrompt).toContain('Generate 5 distinct options');
        expect(step1.systemPrompt).toContain('Constraint: No judgment.');

        const step2 = pattern.steps[1];
        expect(step2.name).toBe('Refine');
        expect(step2.agentRole).toBe('Critic');
    });

    it('should parse inputs correctly', () => {
        const pattern = parser.parse(sampleMarkdown, 'Option Burst.md');
        expect(pattern.inputs).toHaveLength(2);
        expect(pattern.inputs[0].name).toBe('Problem Statement');
        expect(pattern.inputs[0].type).toBe('string');
        expect(pattern.inputs[0].required).toBe(true);

        expect(pattern.inputs[1].name).toBe('Constraints');
        expect(pattern.inputs[1].required).toBe(false);
    });
});

describe('PatternRegistry', () => {
    let registry: PatternRegistry;

    beforeEach(() => {
        registry = new PatternRegistry();
    });

    it('should save and retrieve patterns', async () => {
        const pattern = {
            id: '123',
            name: 'Test Pattern',
            description: 'Test',
            family: 'TestFamily',
            steps: [],
            inputs: [],
            outputs: [],
            tags: [],
            version: '1.0'
        };

        // @ts-ignore - access private repo or use load/save if public
        // casting to any to access internal repository for the test or assumes InMemory default
        await registry['repository'].save(pattern);

        const retrieved = await registry.getPattern('123');
        expect(retrieved).not.toBeNull();
        expect(retrieved?.name).toBe('Test Pattern');
    });

    it('should search patterns', async () => {
        const p1 = { id: '1', name: 'Ideation 1', family: 'Ideation', description: 'desc', steps: [], inputs: [], outputs: [], tags: [], version: '1' };
        const p2 = { id: '2', name: 'Review 1', family: 'Review', description: 'desc', steps: [], inputs: [], outputs: [], tags: [], version: '1' };

        // Use any cast to access repo
        await registry['repository'].save(p1);
        await registry['repository'].save(p2);

        const results = await registry.search('Ideation');
        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Ideation 1');

        const resultsFamily = await registry.search('', 'Review');
        expect(resultsFamily).toHaveLength(1);
        expect(resultsFamily[0].name).toBe('Review 1');
    });
});
