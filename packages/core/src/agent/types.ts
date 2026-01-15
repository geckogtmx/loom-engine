import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export enum AgentSignalType {
    DRIFT = 'DRIFT',
    PERFORMANCE = 'PERFORMANCE',
    FEEDBACK = 'FEEDBACK',
    ALIGNMENT = 'ALIGNMENT'
}

// ============================================
// CORE INTERFACES
// ============================================

export interface AgentProfile {
    id: string;
    worldId: string;
    name: string;
    description: string;
    role: string;
    modelPreferences?: AgentModelPreferences;
    createdAt: Date;
    updatedAt: Date;
}

export interface AgentModelPreferences {
    preferred?: string; // e.g., "openai:gpt-4o"
    secondary?: string; // e.g., "anthropic:claude-3-opus"
    fallback?: string;  // e.g., "ollama:llama3"
}

export interface AgentTelos {
    id: string;
    agentId: string;
    content: string;
    updatedAt: Date;
}

export interface AgentTool {
    id: string;
    agentId: string;
    toolName: string;
    usagePolicy?: Record<string, any>;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AgentSignal {
    id: string;
    agentId: string;
    sessionId?: string;
    signalType: AgentSignalType;
    value: any;
    weight: number;
    timestamp: Date;
}

export interface AgentMode {
    id: string;
    agentId: string;
    name: string;
    description: string;
    trigger: string;
    behavior: string;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const AgentModelPreferencesSchema = z.object({
    preferred: z.string().optional(),
    secondary: z.string().optional(),
    fallback: z.string().optional()
});

export const AgentProfileSchema = z.object({
    id: z.string().uuid(),
    worldId: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    role: z.string().min(1),
    modelPreferences: AgentModelPreferencesSchema.optional(),
    createdAt: z.date(),
    updatedAt: z.date()
});

export const AgentModeSchema = z.object({
    id: z.string().uuid(),
    agentId: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().min(1),
    trigger: z.string().min(1),
    behavior: z.string().min(1),
    createdAt: z.date(),
    updatedAt: z.date()
});

export const CreateAgentInputSchema = z.object({
    worldId: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    role: z.string().min(1),
    telos: z.string().min(1),
    modelPreferences: AgentModelPreferencesSchema.optional()
});

export type CreateAgentInput = z.infer<typeof CreateAgentInputSchema>;
