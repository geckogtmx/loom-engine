
// packages/core/src/pattern/lifecycle/PatternLifecycle.ts

import { LifecyclePhase, PatternContext } from './types';
import { PatternDef } from '../types';
import { SessionIntentEnvelope } from '../../session/types';
import { PrimacyService } from '../primacy/PrimacyService';

export class PatternLifecycle {
    private state: LifecyclePhase = LifecyclePhase.PRIMACY;
    private context: PatternContext;
    private primacyService: PrimacyService;
    private sie: SessionIntentEnvelope;

    // Events
    public onPhaseChange?: (phase: LifecyclePhase) => void;

    constructor(
        sessionId: string,
        worldId: string,
        pattern: PatternDef,
        sie: SessionIntentEnvelope
    ) {
        this.context = {
            sessionId,
            worldId,
            pattern,
            currentStepIndex: 0,
            stepOutputs: {},
            capturedInputs: {},
            history: []
        };
        this.sie = sie;
        this.primacyService = new PrimacyService();
    }

    getState(): LifecyclePhase {
        return this.state;
    }

    private transitionTo(newState: LifecyclePhase) {
        // console.log(`[Lifecycle] Transition: ${this.state} -> ${newState}`);
        this.state = newState;
        if (this.onPhaseChange) {
            this.onPhaseChange(this.state);
        }
    }

    // ============================================
    // Phase 0: Primacy Expansion (The most critical phase)
    // ============================================

    /**
     * Attempts to complete the Primacy phase.
     * This requires the Session Intent Envelope to be sealed.
     */
    completePrimacy(): void {
        if (this.state !== LifecyclePhase.PRIMACY) {
            return; // Already past it
        }

        if (!this.sie.isSealed()) {
            throw new Error('Cannot exit Primacy Phase: Session Intent Envelope is not sealed. Operator must clarify intent.');
        }

        // Move to Validation
        this.transitionTo(LifecyclePhase.META_VALIDATION);
        // Auto-advance validation for now (assuming authorized)
        this.transitionTo(LifecyclePhase.ACTIVATION);
    }

    // ============================================
    // Execution Flow
    // ============================================

    start(): void {
        // Ensure we are at start
        if (this.state === LifecyclePhase.PRIMACY && this.sie.isSealed()) {
            // If already sealed before start (rare), auto advance
            this.completePrimacy();
        }
    }

    advanceStep(): void {
        if (this.state === LifecyclePhase.ACTIVATION) {
            this.transitionTo(LifecyclePhase.INPUT_PREP);
            this.transitionTo(LifecyclePhase.STEP_EXECUTION);
            return;
        }

        // Logic to move to next step
        if (this.state === LifecyclePhase.STEP_EXECUTION) {
            if (this.context.currentStepIndex < this.context.pattern.steps.length - 1) {
                this.context.currentStepIndex++;
            } else {
                // Done with steps
                this.transitionTo(LifecyclePhase.COMPLETION_CHECK);
                this.transitionTo(LifecyclePhase.OUTPUT_DELIVERY);
                this.transitionTo(LifecyclePhase.COMPLETED);
            }
        }
    }

    get info() {
        return {
            state: this.state,
            stepIndex: this.context.currentStepIndex,
            totalSteps: this.context.pattern.steps.length
        };
    }

    abort(reason: string): void {
        this.context.stepOutputs['ABORT_REASON'] = reason;
        this.transitionTo(LifecyclePhase.ABORTED);
    }
}
