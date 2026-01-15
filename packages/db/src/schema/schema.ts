import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Re-export world schema
export * from './world';

// ============================================
// L4 - Telos (Identity)
// ============================================
export const operator_telos = sqliteTable('operator_telos', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ============================================
// L3 - Agents
// ============================================
export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  world_id: text('world_id').notNull(),
  name: text('name').notNull(),
  profile: text('profile').notNull(), // Markdown path or raw content
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

