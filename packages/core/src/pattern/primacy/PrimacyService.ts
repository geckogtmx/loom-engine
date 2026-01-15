
// packages/core/src/pattern/primacy/PrimacyService.ts

import { SessionIntentEnvelope } from '../../session/types';

export interface PrimacyValidationResult {
    allowed: boolean;
    reason?: string;
}

export class PrimacyService {

    /**
     * Validates Agent output during Primacy Phase.
     * Usage: Call this before sending Agent response to User or appending to L2.
     */
    validateAgentOutput(content: string): PrimacyValidationResult {
        // 1. Must contain a question mark (Clarifying Question)
        if (!content.includes('?')) {
            return {
                allowed: false,
                reason: 'Primacy Phase Violation: Agent must ask clarifying questions. No solutions allowed.'
            };
        }

        // 2. Check for premature solution offering phrases (Heuristic)
        const forbiddenPhrases = [
            'here is the solution',
            'i recommend',
            'i suggest',
            'proposal:',
            'generated output:',
            'plan of action:'
        ];

        const lowercaseContent = content.toLowerCase();
        for (const phrase of forbiddenPhrases) {
            if (lowercaseContent.includes(phrase)) {
                return {
                    allowed: false,
                    reason: `Primacy Phase Violation: content detected as proposal ('${phrase}'). Only questions allowed.`
                };
            }
        }

        return { allowed: true };
    }

    /**
     * Seals the SIE if conditions are met.
     */
    sealEnvelope(envelope: SessionIntentEnvelope): void {
        if (!envelope.goal || envelope.goal.length < 5) {
            throw new Error('Cannot seal SIE: Goal is too vague or empty.');
        }

        // In a real implementation we might cast if we know the class or use a setter if interface allows
        // The interface defines 'isSealed()'.
        // If we are passing the concrete class implementation that has 'seal()', we use it.
        // But here we rely on the object having a seal method (Implementation dependent)

        if ('seal' in envelope && typeof (envelope as any).seal === 'function') {
            (envelope as any).seal();
        } else {
            throw new Error('Provided envelope does not support sealing.');
        }
    }
}
