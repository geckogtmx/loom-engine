import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Re-export world and agent schemas
export * from './world';
export * from './agent';
export * from './pattern';

// ============================================
// L4 - Telos (Identity)
// ============================================
export const operator_telos = sqliteTable('operator_telos', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

