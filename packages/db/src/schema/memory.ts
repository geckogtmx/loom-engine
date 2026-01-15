import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { worlds } from './schema';

// L2 - Episodic (History)
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  world_id: text('world_id').references(() => worlds.id).notNull(),
  intent_envelope: text('intent_envelope').notNull(), // JSON string
  status: text('status').notNull(), // pending, active, summarizing, closed
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
  closed_at: integer('closed_at', { mode: 'timestamp' }),
});

export const session_summaries = sqliteTable('session_summaries', {
  id: text('id').primaryKey(),
  session_id: text('session_id').references(() => sessions.id).notNull(),
  content: text('content').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const session_checkpoints = sqliteTable('session_checkpoints', {
  id: text('id').primaryKey(),
  session_id: text('session_id').references(() => sessions.id).notNull(),
  trigger: text('trigger').notNull(), // MANUAL, TIME, STEP
  l1_snapshot: text('l1_snapshot').notNull(), // JSON string
  step_count: integer('step_count').notNull().default(0),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
});
