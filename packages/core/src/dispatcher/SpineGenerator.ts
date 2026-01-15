
// packages/core/src/dispatcher/SpineGenerator.ts

import { PatternDef } from '../pattern/types';
import { PatternRegistry } from '../pattern/PatternRegistry';

/**
 * The SpineGenerator is the "Brain" of the Dispatcher.
 * It analyzes the vast context of the L2 (Episodic) and L3 (Knowledge)
 * to determine the "Spine" (The sequence of Patterns) needed to achieve the Goal.
 */
export class SpineGenerator {
    constructor(private registry: PatternRegistry) { }

    /**
     * Generates a recommended Pattern ID based on the user's intent.
     * In a full implementation, this uses an embedding search or LLM reasoning.
     * For Phase 5/6 Research, we use keyword heuristics.
     */
    async determinePattern(userQuery: string): Promise<PatternDef | null> {
        const queryLower = userQuery.toLowerCase();

        // Heuristic mapping (Prototype)
        if (queryLower.includes('compare') || queryLower.includes('contrast')) {
            // return this.registry.getByName('Comparator'); // Not made yet
        }

        if (queryLower.includes('options') || queryLower.includes('ideas') || queryLower.includes('brainstorm')) {
            return this.registry.getByName('Option Burst');
        }

        if (queryLower.includes('fact') || queryLower.includes('true') || queryLower.includes('verify')) {
            return this.registry.getByName('Fact Check');
        }

        if (queryLower.includes('metaphor') || queryLower.includes('analogy')) {
            return this.registry.getByName('Metaphor Bloom');
        }

        if (queryLower.includes('story') || queryLower.includes('narrative')) {
            return this.registry.getByName('Narrative Spine');
        }

        if (queryLower.includes('structure') || queryLower.includes('framework')) {
            return this.registry.getByName('Framework Forge');
        }

        // Default fallback? Or null?
        return null;
    }
}
