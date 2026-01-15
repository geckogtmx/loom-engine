import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export enum WorldStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    DORMANT = 'DORMANT'
}

export enum WorldEvent {
    CREATED = 'CREATED',
    ACTIVATED = 'ACTIVATED',
    DEACTIVATED = 'DEACTIVATED',
    ARCHIVED = 'ARCHIVED',
    UPDATED = 'UPDATED',
    DELETED = 'DELETED'
}

// ============================================
// CORE INTERFACES
// ============================================

export interface World {
    id: string;
    name: string;
    purpose: string;
    status: WorldStatus;
    operatorId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorldConfig {
    id: string;
    worldId: string;
    allowedPatterns?: string[];
    allowedAgents?: string[];
    constraints?: Record<string, any>;
    modelPreferences?: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorldState {
    id: string;
    worldId: string;
    currentSessionId?: string;
    lastActive?: Date;
    activeThreads?: string[];
    updatedAt: Date;
}

export interface WorldTelos {
    id: string;
    worldId: string;
    content: string;
    updatedAt: Date;
}

export interface WorldTemplate {
    id: string;
    name: string;
    description: string;
    telos: string;
    config: Record<string, any>; // Simplified Config
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// EVENT PAYLOADS
// ============================================

export interface WorldEventPayload {
    event: WorldEvent;
    worldId: string;
    timestamp: Date;
    data?: Record<string, any>;
}

// ============================================
// INPUT TYPES (Zod Validated)
// ============================================

export const CreateWorldInputSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    purpose: z.string().min(1, 'Purpose is required').max(500),
    operatorId: z.string().optional()
});

export type CreateWorldInput = z.infer<typeof CreateWorldInputSchema>;

export const UpdateWorldInputSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    purpose: z.string().min(1).max(500).optional(),
    status: z.nativeEnum(WorldStatus).optional()
});

export type UpdateWorldInput = z.infer<typeof UpdateWorldInputSchema>;

// ============================================
// REPOSITORY INTERFACE
// ============================================


// ============================================
// TEMPLATE & CLONE INPUTS
// ============================================

export const CreateFromTemplateInputSchema = z.object({
    templateId: z.string().uuid(),
    nameOverride: z.string().min(1).max(100).optional(),
    purposeOverride: z.string().min(1).max(500).optional(),
    operatorId: z.string().optional()
});

export type CreateFromTemplateInput = z.infer<typeof CreateFromTemplateInputSchema>;

export const CloneWorldInputSchema = z.object({
    sourceWorldId: z.string().uuid(),
    nameOverride: z.string().min(1).max(100).optional(),
    purposeOverride: z.string().min(1).max(500).optional(),
    operatorId: z.string().optional()
});

export type CloneWorldInput = z.infer<typeof CloneWorldInputSchema>;
