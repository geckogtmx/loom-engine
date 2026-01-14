import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema/schema';
import * as memory from './schema/memory';

export const createDb = (path: string) => {
  const sqlite = new Database(path);
  return drizzle(sqlite, { schema: { ...schema, ...memory } });
};

export * from './schema/schema';
export * from './schema/memory';
