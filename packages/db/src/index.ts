import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema/schema';
import * as memory from './schema/memory';
import * as encryptedKeys from './schema/encryptedKeys';
import * as world from './schema/world';
import * as agent from './schema/agent';
import * as pattern from './schema/pattern';

export const createDb = (path: string) => {
  const sqlite = new Database(path);
  // Phase 7.9: Database Hardening
  sqlite.pragma('journal_mode = WAL'); // Better concurrency
  sqlite.pragma('foreign_keys = ON'); // Enforce integrity
  return drizzle(sqlite, {
    schema: {
      ...schema,
      ...memory,
      ...encryptedKeys,
      ...world,
      ...agent,
      ...pattern
    }
  });
};

export * from './schema/schema';
export * from './schema/memory';
export * from './schema/encryptedKeys';
export * from './schema/world';
export * from './schema/agent';
export * from './schema/pattern';
