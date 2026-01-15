import { z } from 'zod';

/**
 * L2 Continuity Artifact Schema
 * This defines the structured format for session summaries stored in L2.
 * It is the "contract" for what gets persisted after a session ends.
 */

export const DecisionSchema = z.object({
    id: z.string(),
    description: z.string(),
    rationale: z.string().optional(),
    timestamp: z.number()
});

export const StateChangeSchema = z.object({
    layer: z.enum(['L1', 'L2', 'L3']),
    key: z.string(),
    action: z.enum(['CREATE', 'UPDATE', 'DELETE']),
    summary: z.string().optional()
});

export const ContinuityArtifactSchema = z.object({
    // Metadata
    version: z.literal('1.0'),
    sessionId: z.string(),
    worldId: z.string(),
    createdAt: z.number(),

    // Session Intent (reference to sealed SIE)
    intent: z.object({
        goal: z.string(),
        audience: z.string(),
        constraints: z.array(z.string())
    }),

    // Core Content
    decisions: z.array(DecisionSchema),
    stateChanges: z.array(StateChangeSchema),

    // Forward Pointers
    openQuestions: z.array(z.string()),
    nextSteps: z.array(z.string()),

    // Recovery
    checkpointRefs: z.array(z.string()).optional(), // IDs of checkpoints
    status: z.enum(['DRAFT', 'FINAL'])
});

export type Decision = z.infer<typeof DecisionSchema>;
export type StateChange = z.infer<typeof StateChangeSchema>;
export type ContinuityArtifact = z.infer<typeof ContinuityArtifactSchema>;
