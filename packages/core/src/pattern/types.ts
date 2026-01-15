
// packages/core/src/pattern/types.ts

import { z } from 'zod';

// Zod schemas for runtime validation (e.g. loading from Markdown)

export const PatternParamSchema = z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'json', 'file']),
    description: z.string(),
    required: z.boolean().default(true),
    defaultValue: z.any().optional(),
});

export const PatternStepSchema = z.object({
    id: z.string(),
    order: z.number().int(),
    name: z.string(),
    description: z.string(),
    agentRole: z.string().optional(), // If specific role required, e.g., "Reviewer"
    systemPrompt: z.string().optional(), // Template for the step's prompt
    userPromptTemplate: z.string().optional(),

    // Constraints specific to this step
    constraints: z.array(z.string()).optional(),

    // Tempo overrides
    tempoMode: z.enum(['allegro', 'andante', 'adagio']).optional(),

    // Memory layer permissions for this step
    inputLayers: z.array(z.enum(['L1', 'L2', 'L3', 'L4'])).default(['L1', 'L2']),
    outputLayers: z.array(z.enum(['L1', 'L2'])).default(['L1']),
});

export const PatternSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    family: z.string(), // e.g., "Ideation", "Structuring", "Decision"

    // Scoping
    worldModel: z.string().optional(), // If pattern is specific to a World Type

    // Lifecycle
    inputs: z.array(PatternParamSchema).default([]),
    outputs: z.array(PatternParamSchema).default([]),

    steps: z.array(PatternStepSchema),

    // Metadata
    version: z.string().default("1.0.0"),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
});

// TypeScript Types matching the Zod schemas
export type PatternParam = z.infer<typeof PatternParamSchema>;
export type PatternStep = z.infer<typeof PatternStepSchema>;
export type PatternDef = z.infer<typeof PatternSchema>;

// DB-facing types (for the registry index, not necessarily the full definition if stored in L3)
export interface PatternIndex {
    id: string;
    name: string;
    family: string;
    description: string;
    lastUsed?: Date;
    usageCount: number;
}
