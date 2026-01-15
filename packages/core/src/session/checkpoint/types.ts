
export enum CheckpointTrigger {
    TIME = 'TIME',
    STEP_COUNT = 'STEP_COUNT',
    MANUAL = 'MANUAL',
    ON_FAILURE = 'ON_FAILURE'
}

export interface CheckpointData {
    sessionId: string;
    timestamp: number;
    trigger: CheckpointTrigger;

    // Snapshot of session state
    state: string; // SessionState

    // Core memory pointers
    l1Snapshot: Record<string, any>; // Serialization of L1
    l2Count: number; // Number of L2 items

    // Recoverable instructions
    pendingStep?: number;
    pendingPattern?: string;
}

export interface CheckpointConfig {
    timeIntervalMs?: number; // e.g. 600000 for 10 min
    stepInterval?: number;   // e.g. every 5 steps
}
