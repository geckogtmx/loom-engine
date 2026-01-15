import { DispatchContext, DispatchGateResult } from './types';
import { SessionState } from '../session/types';

export class DispatchGate {
    /**
     * "The Bouncer"
     * Checks if a dispatch request is allowed to proceed.
     * Enforces:
     * 1. Session State (Must be Active or Primacy)
     * 2. Governance Rules (Metadata)
     * 3. Cost/Budget (Future)
     */
    async check(context: DispatchContext, sessionState: SessionState): Promise<DispatchGateResult> {
        const violations: string[] = [];

        // 1. State Check
        // Dispatch is generally only allowed in ACTIVE, PRIMACY (for intent), or REFLECTION (for summary)
        const allowedStates = [SessionState.ACTIVE, SessionState.PRIMACY, SessionState.INITIALIZING];
        if (!allowedStates.includes(sessionState)) {
            violations.push(`Dispatch denied: Session is in ${sessionState} state.`);
        }

        // 2. Empty Query Check
        if (!context.query || context.query.trim().length === 0) {
            violations.push("Dispatch denied: Query is empty.");
        }

        // 3. User/World Permissions (Placeholder)
        // In future: Check if user has write access to this World

        // 4. Budget Check (Placeholder)
        // In future: Check if World has token budget remaining

        if (violations.length > 0) {
            return {
                allowed: false,
                reason: "Governance checks failed.",
                violations
            };
        }

        return { allowed: true };
    }
}
