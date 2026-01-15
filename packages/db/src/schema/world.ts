import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * World Status Enum Values
 * ACTIVE: Currently in use
 * ARCHIVED: Preserved but not active
 * DORMANT: Inactive but can be reactivated
 */
export const WORLD_STATUS = {
    ACTIVE: 'ACTIVE',
    ARCHIVED: 'ARCHIVED',
    DORMANT: 'DORMANT'
} as const;

// ============================================
// WORLDS - Core World Definition (L3)
// ============================================
export const worlds = sqliteTable('worlds', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    purpose: text('purpose').notNull(),
    status: text('status').notNull().default(WORLD_STATUS.DORMANT),
    operator_id: text('operator_id'), // Owner/creator
    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ============================================
// WORLD_CONFIG - Configuration per World
// ============================================
export const world_config = sqliteTable('world_config', {
    id: text('id').primaryKey(),
    world_id: text('world_id').notNull().references(() => worlds.id),

    // Comma-separated pattern IDs or JSON array
    allowed_patterns: text('allowed_patterns'),

    // Comma-separated agent IDs or JSON array
    allowed_agents: text('allowed_agents'),

    // JSON object for META constraints
    constraints: text('constraints'), // JSON string

    // JSON object for model preferences
    model_preferences: text('model_preferences'), // JSON string

    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ============================================
// WORLD_STATE - Runtime State per World
// ============================================
export const world_state = sqliteTable('world_state', {
    id: text('id').primaryKey(),
    world_id: text('world_id').notNull().references(() => worlds.id),

    // Current active session (if any)
    current_session_id: text('current_session_id'),

    // Last activity timestamp
    last_active: integer('last_active', { mode: 'timestamp' }),

    // JSON array of active thread IDs
    active_threads: text('active_threads'), // JSON string

    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ============================================
// WORLD_TELOS - Identity Kernel (L4)
// ============================================
export const world_telos = sqliteTable('world_telos', {
    id: text('id').primaryKey(),
    world_id: text('world_id').notNull().references(() => worlds.id),
    content: text('content').notNull(), // Markdown or structured identity
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
