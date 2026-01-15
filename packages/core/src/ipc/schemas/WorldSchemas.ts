import { z } from 'zod';

/**
 * IPC Input Validation Schemas for World Operations
 * 
 * All World-related IPC handlers MUST validate input using these schemas
 * to prevent malicious renderer processes from exploiting the main process.
 * 
 * Security: SECURITY.md Section 2 - IPC Channel Validation
 */

/**
 * Schema for creating a new World
 */
export const CreateWorldSchema = z.object({
    name: z.string()
        .min(1, 'World name is required')
        .max(100, 'World name too long'),
    purpose: z.string()
        .min(1, 'Purpose is required')
        .max(500, 'Purpose too long'),
    operatorId: z.string().optional(),
});

export type CreateWorldIPCInput = z.infer<typeof CreateWorldSchema>;

/**
 * Schema for updating an existing World
 */
export const UpdateWorldSchema = z.object({
    name: z.string()
        .min(1, 'World name is required')
        .max(100, 'World name too long')
        .optional(),
    purpose: z.string()
        .max(500, 'Purpose too long')
        .optional(),
    isActive: z.boolean().optional(),
});

export type UpdateWorldIPCInput = z.infer<typeof UpdateWorldSchema>;

/**
 * Schema for World ID (used in GET, DELETE operations)
 */
export const WorldIdSchema = z.string()
    .uuid('Invalid World ID format');

export type WorldIPCId = z.infer<typeof WorldIdSchema>;
