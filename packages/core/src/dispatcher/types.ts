export interface DispatchContext {
    sessionId: string;
    worldId: string;
    query: string;
    l1Active?: any;
    l2History?: any[];
    l3Relevant?: any[];
    modelPreference?: string; // Optional model override (e.g., 'qwen2.5:14b', 'gpt-4o')
    agentMode?: string; // Optional Agent mode to activate (e.g., 'Deep Dive Mode')
}

export interface DispatchResult {
    success: boolean;
    output?: string;
    error?: string;
    metadata?: {
        tokensUsed: number;
        model: string;
        cost: number;
        durationMs: number;
    };
}

export interface DispatchGateResult {
    allowed: boolean;
    reason?: string;
    violations?: string[];
}

export interface Spine {
    id: string;
    sourceId: string; // ID of the L3/L2 artifact
    type: 'L3_DOC' | 'L2_EPISODE' | 'PATTERN' | 'AGENT';
    content: string; // The compressed representation
    keywords: string[];
    tokens: number;
}
