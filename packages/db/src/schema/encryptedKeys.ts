import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

/**
 * Encrypted API Keys Storage
 * 
 * Stores API keys encrypted using Electron's safeStorage API.
 * Keys are encrypted on the main process and stored as base64-encoded strings.
 * 
 * Security:
 * - Keys are encrypted using OS-level keychain (macOS/Windows) or libsecret (Linux)
 * - Decryption only possible on same machine where encryption occurred
 * - Keys never stored in plain text
 */
export const encryptedKeys = sqliteTable('encrypted_keys', {
    id: text('id').primaryKey(),

    /** Provider identifier (e.g., 'openai', 'anthropic', 'google') */
    providerName: text('provider_name').notNull().unique(),

    /** Base64-encoded encrypted API key */
    encryptedValue: text('encrypted_value').notNull(),

    /** Timestamp when key was first stored */
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),

    /** Timestamp when key was last updated */
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type EncryptedKey = typeof encryptedKeys.$inferSelect;
export type NewEncryptedKey = typeof encryptedKeys.$inferInsert;
