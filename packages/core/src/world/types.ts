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

export interface IWorldRepository {
    create(world: Omit<World, 'id' | 'createdAt' | 'updatedAt'>): Promise<World>;
    getById(id: string): Promise<World | null>;
    getAll(): Promise<World[]>;
    getByStatus(status: WorldStatus): Promise<World[]>;
    update(id: string, data: Partial<World>): Promise<World>;
    delete(id: string): Promise<void>;
}

// ============================================
// TEMPLATE INTERFACES
// ============================================

export interface WorldTemplate {
    id: string;
    name: string;
    description: string;
    telos: string;
    config: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export const CreateFromTemplateInputSchema = z.object({
    templateId: z.string().uuid(),
    nameOverride: z.string().min(1).max(100).optional(),
    purposeOverride: z.string().min(1).max(500).optional(),
    operatorId: z.string().optional()
});

export type CreateFromTemplateInput = z.infer<typeof CreateFromTemplateInputSchema>;

export interface ITemplateRepository {
    create(template: Omit<WorldTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorldTemplate>;
    getById(id: string): Promise<WorldTemplate | null>;
    getAll(): Promise<WorldTemplate[]>;
}

// ============================================
// CLONING TYPES
// ============================================

export const CloneWorldInputSchema = z.object({
    sourceWorldId: z.string().uuid(),
    nameOverride: z.string().min(1).max(100).optional(),
    purposeOverride: z.string().min(1).max(500).optional(),
    operatorId: z.string().optional()
});

export type CloneWorldInput = z.infer<typeof CloneWorldInputSchema>;

// ============================================
// TELOS & CONFIG REPOSITORIES
// ============================================

export interface IWorldTelosRepository {
    get(worldId: string): Promise<WorldTelos | null>;
    set(worldId: string, content: string): Promise<WorldTelos>;
}

export interface IWorldConfigRepository {
    get(worldId: string): Promise<WorldConfig | null>;
    set(worldId: string, config: Omit<WorldConfig, 'id' | 'worldId' | 'createdAt' | 'updatedAt'>): Promise<WorldConfig>;
}
