import { describe, it, expect, beforeEach } from 'vitest';
import { ArtifactGenerator } from './ArtifactGenerator';
import { ArtifactParser } from './ArtifactParser';
import { SessionIntentEnvelopeImpl } from '../SessionIntentEnvelope';
import { ContinuityArtifactSchema } from './schema';

describe('ArtifactGenerator', () => {
    let generator: ArtifactGenerator;
    let envelope: SessionIntentEnvelopeImpl;

    beforeEach(() => {
        envelope = new SessionIntentEnvelopeImpl('world-1');
        envelope.goal = 'Test Goal';
        envelope.audience = 'Test Audience';
        envelope.constraints = ['Constraint 1'];
        envelope.seal();

        generator = new ArtifactGenerator('session-1', 'world-1', envelope);
    });

    it('should generate a valid artifact', () => {
        generator.addDecision('Decided to use TypeScript', 'Type safety');
        generator.addNextStep('Implement Phase 3');

        const artifact = generator.generate();

        expect(artifact.version).toBe('1.0');
        expect(artifact.sessionId).toBe('session-1');
        expect(artifact.intent.goal).toBe('Test Goal');
        expect(artifact.decisions).toHaveLength(1);
        expect(artifact.nextSteps).toHaveLength(1);
    });

    it('should produce valid JSON', () => {
        generator.addDecision('Test decision');
        const json = generator.toJSON();

        // Should be parseable
        const parsed = JSON.parse(json);
        expect(parsed.sessionId).toBe('session-1');
    });
});

describe('ArtifactParser', () => {
    it('should parse valid JSON', () => {
        const validArtifact = {
            version: '1.0',
            sessionId: 'sess-1',
            worldId: 'world-1',
            createdAt: Date.now(),
            intent: { goal: 'Goal', audience: 'Me', constraints: [] },
            decisions: [],
            stateChanges: [],
            openQuestions: [],
            nextSteps: [],
            status: 'FINAL'
        };

        const result = ArtifactParser.parse(JSON.stringify(validArtifact));
        expect(result.sessionId).toBe('sess-1');
    });

    it('should return null for invalid JSON via safeParse', () => {
        const result = ArtifactParser.safeParse('{ invalid json }');
        expect(result).toBeNull();
    });

    it('should extract resumption context', () => {
        const artifact = {
            version: '1.0' as const,
            sessionId: 'sess-1',
            worldId: 'world-1',
            createdAt: Date.now(),
            intent: { goal: 'Original Goal', audience: 'Me', constraints: [] },
            decisions: [{ id: 'd1', description: 'Dec 1', timestamp: Date.now() }],
            stateChanges: [],
            openQuestions: ['What next?'],
            nextSteps: ['Do Phase 3'],
            status: 'FINAL' as const
        };

        const context = ArtifactParser.extractResumptionContext(artifact);

        expect(context.originalGoal).toBe('Original Goal');
        expect(context.openQuestions).toContain('What next?');
        expect(context.nextSteps).toContain('Do Phase 3');
    });
});
