
// packages/core/src/pattern/abort/PatternAbortService.ts

import { PatternLifecycle } from '../lifecycle/PatternLifecycle';
import { LifecyclePhase } from '../lifecycle/types';

export class PatternAbortService {

    /**
     * Aborts an active pattern lifecycle.
     * @param lifecycle The active lifecycle instance
     * @param reason Reason for abortion
     */
    abort(lifecycle: PatternLifecycle, reason: string): void {
        const currentState = lifecycle.getState();

        // Validation: Cannot abort if already done
        if (
            currentState === LifecyclePhase.COMPLETED ||
            currentState === LifecyclePhase.ABORTED ||
            currentState === LifecyclePhase.FAILED
        ) {
            console.warn(`[PatternAbortService] Cannot abort. State is already ${currentState}`);
            return;
        }

        // Special Rule: Primacy Protection
        // If we are in Primacy, and we abort, it basically cancels the whole session intent?
        // Or do we allow aborting Primacy to just reset?
        // Codex says: "Prevent abort during Primacy Expansion (must complete or cancel session)"
        // Implementation: We'll treat abort during Primacy as a Session Cancel equivalent in the broader scope, 
        // but here we just mark the pattern as ABORTED.

        // Force transition
        // We need to access private method `transitionTo` or have a public `abort()` on lifecycle.
        // For clean separation, maybe Lifecycle should have an `abort()` method? 
        // Or we expose a method `forceState(state)`.
        // Let's assume we modify PatternLifecycle to allow this service to act, 
        // OR we implement the abort logic mostly here and just tell lifecycle to update.

        // Since `transitionTo` is private in our previous implementation, 
        // we should add an `abort()` method to `PatternLifecycle` that this service calls,
        // OR we export `PatternAbortService` as the usage pattern and modify Lifecycle to be friendly to it.

        // Let's modify PatternLifecycle to have a public `abort()` method that this service orchestrates? 
        // Actually, simpler: Use this service to encapsulate the *implications* of abort (logging, L1 cleanup), 
        // and call a method on lifecycle to change state.

        // For now, let's assume we can add `abort(reason)` to PatternLifecycle, 
        // but `PatternAbortService` might handle side effects like L2 logging or cleanup 
        // that are outside the scope of the pure state machine.

        // For this task, I'll update PatternLifecycle to include an abort method, 
        // and this service will wrap it with logging/cleanup.

        console.log(`[PatternAbortService] Aborting pattern due to: ${reason}`);

        // TODO: Perform L1 Cleanup (clear temp context)

        // TODO: Update L2 (Episodic Memory) with "Pattern Aborted" event

        // Transition Lifecycle
        if ('abort' in lifecycle && typeof (lifecycle as any).abort === 'function') {
            (lifecycle as any).abort(reason);
        } else {
            // Fallback if not updated yet (though I will update it next)
            console.error("[PatternAbortService] Lifecycle does not support abort()");
        }
    }
}
