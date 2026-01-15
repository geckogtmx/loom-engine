
// packages/db/src/schema/pattern.ts

import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const patterns = sqliteTable('patterns', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),

    name: text('name').notNull(),
    description: text('description').notNull(),
    family: text('family').notNull(), // e.g. "Ideation", "Decision"

    // Serialized JSON of constraints/inputs/outputs for quick indexing
    // The authoritative definition lives in L3 Markdown, but we index here for queries
    inputsSchema: text('inputs_schema', { mode: 'json' }),
    outputsSchema: text('outputs_schema', { mode: 'json' }),

    // Usage stats
    usageCount: integer('usage_count').default(0),
    lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),

    // Governance
    isSystem: integer('is_system', { mode: 'boolean' }).default(false), // Built-in patterns
    worldId: text('world_id'), // If null, global. If set, private to world.
}, (table) => ({
    nameIdx: uniqueIndex('pattern_name_idx').on(table.name),
    familyIdx: uniqueIndex('pattern_family_idx').on(table.family, table.name),
}));

export const patternSteps = sqliteTable('pattern_steps', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    patternId: text('pattern_id').notNull().references(() => patterns.id, { onDelete: 'cascade' }),

    order: integer('order').notNull(),
    name: text('name').notNull(),
    description: text('description').notNull(),

    agentRole: text('agent_role'), // Recommended role

    // JSON configs
    tempoMode: text('tempo_mode'), // 'allegro', 'andante', 'adagio'
    layerPermissions: text('layer_permissions', { mode: 'json' }), // { input: [], output: [] }

}, (table) => ({
    orderIdx: uniqueIndex('step_order_idx').on(table.patternId, table.order),
}));
