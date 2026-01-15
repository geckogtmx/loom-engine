
// packages/core/src/pattern/primacy/PrimacyService.test.ts

import { describe, it, expect } from 'vitest';
import { PrimacyService } from './PrimacyService';
import { SessionIntentEnvelopeImpl } from '../../session/SessionIntentEnvelope';

describe('PrimacyService', () => {
    const service = new PrimacyService();

    describe('validateAgentOutput', () => {
        it('should allow questions', () => {
            const result = service.validateAgentOutput('What is your primary goal for this session?');
            expect(result.allowed).toBe(true);
        });

        it('should block statements without questions', () => {
            const result = service.validateAgentOutput('I am ready to help.');
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('Agent must ask clarifying questions');
        });

        it('should block proposals', () => {
            const result = service.validateAgentOutput('Here is the solution to your problem?');
            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('content detected as proposal');
        });
    });

    describe('sealEnvelope', () => {
        it('should seal a valid envelope', () => {
            const env = new SessionIntentEnvelopeImpl('world-1', 'Write code');
            service.sealEnvelope(env);
            expect(env.isSealed()).toBe(true);
        });

        it('should throw if goal is empty', () => {
            const env = new SessionIntentEnvelopeImpl('world-1', '');
            expect(() => service.sealEnvelope(env)).toThrow('Goal is too vague');
        });
    });
});
