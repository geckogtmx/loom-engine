
export enum SessionState {
    PENDING = 'PENDING',
    INITIALIZING = 'INITIALIZING',
    PRIMACY = 'PRIMACY',
    ACTIVE = 'ACTIVE',
    SUMMARIZING = 'SUMMARIZING',
    CLOSED = 'CLOSED',
    FAILED = 'FAILED'
}

export interface SessionIntentEnvelope {
    readonly id: string;
    readonly worldId: string;
    readonly goal: string;
    readonly constraints: string[];
    readonly audience: string;
    readonly sealedAt?: Date;

    // Once sealed, these cannot vary
    isSealed(): boolean;
}

export interface SessionContext {
    sessionId: string;
    worldId: string;
    state: SessionState;
    startTime: Date;
    modelPreferences?: Record<string, string>; // agentId -> modelId
}
