
// packages/core/src/pattern/lifecycle/types.ts

import { PatternDef } from '../types';

export enum LifecyclePhase {
    PRIMACY = 'PRIMACY',             // Phase 0: Question-only mode
    META_VALIDATION = 'META_VALIDATION', // Phase 2: Check permissions
    ACTIVATION = 'ACTIVATION',       // Phase 3: Setup context
    INPUT_PREP = 'INPUT_PREP',       // Phase 4: Gather inputs
    STEP_EXECUTION = 'STEP_EXECUTION', // Phase 5: Looping through steps
    OPERATOR_STEERING = 'OPERATOR_STEERING', // Phase 6: Human in the loop? (Maybe parallel)
    COMPLETION_CHECK = 'COMPLETION_CHECK', // Phase 7: Done?
    OUTPUT_DELIVERY = 'OUTPUT_DELIVERY', // Phase 8: Format result
    L2_UPDATE = 'L2_UPDATE',         // Phase 9: Write to history
    REINTEGRATION = 'REINTEGRATION', // Phase 10: Clean up

    // Terminal states
    COMPLETED = 'COMPLETED',
    ABORTED = 'ABORTED',
    FAILED = 'FAILED'
}

export interface PatternContext {
    sessionId: string;
    worldId: string;
    pattern: PatternDef;
    currentStepIndex: number;
    stepOutputs: Record<string, string>; // stepId -> output
    capturedInputs: Record<string, any>;
    history: string[]; // Conversation history for this run
}
