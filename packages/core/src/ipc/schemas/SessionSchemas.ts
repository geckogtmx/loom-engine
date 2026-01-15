import { z } from 'zod';

/**
 * IPC Input Validation Schemas for Session Operations
 * 
 * All Session-related IPC handlers MUST validate input using these schemas
 * to prevent malicious renderer processes from exploiting the main process.
 * 
 * Security: SECURITY.md Section 2 - IPC Channel Validation
 */

/**
 * Schema for creating a new Session
 */
export const CreateSessionSchema = z.object({
    worldId: z.string()
        .uuid('Invalid World ID format'),
});

export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;

/**
 * Schema for setting Session Intent
 */
export const SetIntentSchema = z.object({
    sessionId: z.string()
        .uuid('Invalid Session ID format'),
    goal: z.string()
        .min(1, 'Goal is required')
        .max(500, 'Goal too long'),
    audience: z.string()
        .max(100, 'Audience description too long')
        .optional(),
    constraints: z.array(z.string().max(200))
        .max(10, 'Too many constraints')
        .optional()
        .default([]),
});

export type SetIntentInput = z.infer<typeof SetIntentSchema>;

/**
 * Schema for Session ID (used in GET, START, END, etc.)
 */
export const SessionIdSchema = z.string()
    .uuid('Invalid Session ID format');

export type SessionId = z.infer<typeof SessionIdSchema>;

/**
 * Schema for listing sessions by World
 */
export const ListSessionsSchema = z.object({
    worldId: z.string()
        .uuid('Invalid World ID format'),
});

export type ListSessionsInput = z.infer<typeof ListSessionsSchema>;
