import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { worlds } from './world';

// ============================================
// AGENT_PROFILES - L3 Definition
// ============================================
export const agent_profiles = sqliteTable('agent_profiles', {
    id: text('id').primaryKey(), // UUID
    world_id: text('world_id').notNull().references(() => worlds.id),
    name: text('name').notNull(),
    description: text('description').notNull(),
    role: text('role').notNull(), // High-level role description

    // JSON configuration for model preferences
    // { "preferred": "provider:model", "fallback": "provider:model" }
    model_preferences: text('model_preferences'),

    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ============================================
// AGENT_TELOS - L4 Identity Kernel
// ============================================
export const agent_telos = sqliteTable('agent_telos', {
    id: text('id').primaryKey(),
    agent_id: text('agent_id').notNull().references(() => agent_profiles.id),
    content: text('content').notNull(), // Markdown identity/system prompt core
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ============================================
// AGENT_MODES - Operational Modes
// ============================================
export const agent_modes = sqliteTable('agent_modes', {
    id: text('id').primaryKey(),
    agent_id: text('agent_id').notNull().references(() => agent_profiles.id),
    name: text('name').notNull(), // e.g., "Deep Dive Mode"
    description: text('description').notNull(),
    trigger: text('trigger').notNull(), // e.g., "Atlas, go deep"
    behavior: text('behavior').notNull(), // JSON or Text detailing specific behavior
    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ============================================
// AGENT_TOOLS - Enabled Capabilities
// ============================================
export const agent_tools = sqliteTable('agent_tools', {
    id: text('id').primaryKey(),
    agent_id: text('agent_id').notNull().references(() => agent_profiles.id),
    tool_name: text('tool_name').notNull(),

    // JSON object for policy/constraints specific to this tool for this agent
    usage_policy: text('usage_policy'),

    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ============================================
// AGENT_BEHAVIOR_SIGNALS - Non-Content Metadata
// ============================================
export const agent_behavior_signals = sqliteTable('agent_behavior_signals', {
    id: text('id').primaryKey(),
    agent_id: text('agent_id').notNull().references(() => agent_profiles.id),
    session_id: text('session_id'), // Optional link to session

    signal_type: text('signal_type').notNull(), // 'DRIFT', 'PERFORMANCE', 'FEEDBACK'
    value: text('value').notNull(), // JSON or scalar value
    weight: integer('weight').notNull().default(1),

    timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});
