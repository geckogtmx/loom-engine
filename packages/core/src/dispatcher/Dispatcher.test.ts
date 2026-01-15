import { describe, it, expect } from 'vitest';
import { Dispatcher } from './Dispatcher';
import { DispatchGate } from './DispatchGate';
import { SpineGenerator } from './SpineGenerator';
import { ContextAssembler } from './ContextAssembler';
import { SessionState } from '../session/types';
import { DispatchContext } from './types';

describe('Dispatcher System', () => {
    // Setup
    const gate = new DispatchGate();
    const generator = new SpineGenerator();
    const assembler = new ContextAssembler();
    const dispatcher = new Dispatcher(gate, generator, assembler);

    // Mock Data
    const context: DispatchContext = {
        sessionId: 'test-session',
        worldId: 'test-world',
        query: 'tell me a story about loops',
        l1Active: { scratchpad: 'nothing' },
        l2History: [{ role: 'user', content: 'hello' }]
    };

    const spines = [
        generator.generate('s1', 'doc1', 'L3_DOC', 'Loops are fundamental constructs in programming.'),
        generator.generate('s2', 'doc2', 'PATTERN', 'The Narrative Spine pattern structures stories.'),
        generator.generate('s3', 'doc3', 'AGENT', 'The Coder agent writes loops.')
    ];

    it('should BLOCK dispatch if session is PENDING', async () => {
        const result = await dispatcher.dispatch(context, SessionState.PENDING, spines);
        expect(result.success).toBe(false);
        expect(result.error).toContain('Governance Denied');
    });

    it('should ALLOW dispatch if session is ACTIVE', async () => {
        const result = await dispatcher.dispatch(context, SessionState.ACTIVE, spines);
        expect(result.success).toBe(true);
        expect(result.output).toContain('[DRY-RUN MODE]');
    });

    it('should SELECT relevant spines based on keywords', async () => {
        // Query has 'story' and 'loops'
        // s1 has 'Loops'
        // s2 has 'Narrative' (related? heuristics might miss if simple keyword)
        // Let's rely on exact match for this simple test

        const result = await dispatcher.dispatch(context, SessionState.ACTIVE, spines);
        const output = result.output || '';

        // Assertions
        expect(output).toContain('[USER QUERY]');
        expect(output).toContain('tell me a story about loops');

        // Should find s1 (Loops)
        expect(output).toContain('Loops are fundamental constructs');
    });

    it('should ASSEMBLE the prompt correctly', async () => {
        const result = await dispatcher.dispatch(context, SessionState.ACTIVE, spines);
        const output = result.output || '';

        expect(output).toContain('[ACTIVE CONTEXT]');
        expect(output).toContain('[HISTORY]');
        expect(output).toContain('[KNOWLEDGE]');
    });
});
