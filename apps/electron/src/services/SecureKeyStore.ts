import { safeStorage } from 'electron';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { encryptedKeys, type NewEncryptedKey } from '@loom/db';

/**
 * SecureKeyStore - Encrypted API Key Management
 * 
 * Uses Electron's safeStorage API to encrypt API keys before storing in SQLite.
 * - macOS: Uses Keychain
 * - Windows: Uses DPAPI
 * - Linux: Uses libsecret
 * 
 * Security Properties:
 * - Keys are encrypted at rest
 * - Decryption only possible on the same machine
 * - No plain-text keys in database or logs
 */
export class SecureKeyStore {
    private db: any; // Drizzle DB instance

    constructor(db: any) {
        this.db = db;
    }

    /**
     * Store an API key securely (encrypted)
     * @param providerName Provider identifier (e.g., 'openai', 'anthropic')
     * @param apiKey Plain-text API key
     */
    async store(providerName: string, apiKey: string): Promise<void> {
        if (!safeStorage.isEncryptionAvailable()) {
            throw new Error('Encryption not available on this system');
        }

        // Encrypt the API key
        const encryptedBuffer = safeStorage.encryptString(apiKey);
        const encodedValue = encryptedBuffer.toString('base64');

        const now = new Date();

        // Upsert to allow key updates
        await this.db
            .insert(encryptedKeys)
            .values({
                id: uuidv4(),
                providerName,
                encryptedValue: encodedValue,
                createdAt: now,
                updatedAt: now,
            })
            .onConflictDoUpdate({
                target: encryptedKeys.providerName,
                set: {
                    encryptedValue: encodedValue,
                    updatedAt: now,
                },
            });

        console.log(`[SecureKeyStore] Stored encrypted key for ${providerName}`);
    }

    /**
     * Retrieve a decrypted API key
     * @param providerName Provider identifier
     * @returns Decrypted API key or null if not found
     */
    async retrieve(providerName: string): Promise<string | null> {
        const rows = await this.db
            .select()
            .from(encryptedKeys)
            .where(eq(encryptedKeys.providerName, providerName))
            .limit(1);

        if (rows.length === 0) {
            return null;
        }

        // Decrypt the key
        const encryptedBuffer = Buffer.from(rows[0].encryptedValue, 'base64');
        const decryptedKey = safeStorage.decryptString(encryptedBuffer);

        return decryptedKey;
    }

    /**
     * Delete a stored API key
     * @param providerName Provider identifier
     */
    async delete(providerName: string): Promise<boolean> {
        const result = await this.db
            .delete(encryptedKeys)
            .where(eq(encryptedKeys.providerName, providerName));

        console.log(`[SecureKeyStore] Deleted key for ${providerName}`);
        return result.changes > 0;
    }

    /**
     * List all providers with stored keys
     * @returns Array of provider names
     */
    async listProviders(): Promise<string[]> {
        const rows = await this.db
            .select({ providerName: encryptedKeys.providerName })
            .from(encryptedKeys);

        return rows.map((r: any) => r.providerName);
    }

    /**
     * One-time migration from .env to encrypted storage
     * Reads API keys from environment variables and stores them securely
     */
    async migrateFromEnv(): Promise<void> {
        const envKeys = {
            openai: process.env.OPENAI_API_KEY,
            anthropic: process.env.ANTHROPIC_API_KEY,
            google: process.env.GOOGLE_API_KEY,
            deepseek: process.env.DEEPSEEK_API_KEY,
        };

        let migrationCount = 0;

        for (const [provider, key] of Object.entries(envKeys)) {
            if (key && key.trim().length > 0) {
                try {
                    await this.store(provider, key);
                    migrationCount++;
                    console.log(`[SecureKeyStore] Migrated ${provider} key from .env`);
                } catch (error) {
                    console.error(`[SecureKeyStore] Failed to migrate ${provider} key:`, error);
                }
            }
        }

        if (migrationCount > 0) {
            console.log(`[SecureKeyStore] Migration complete: ${migrationCount} keys migrated`);
            console.log('[SecureKeyStore] You can now remove API keys from .env file');
        } else {
            console.log('[SecureKeyStore] No keys found in .env to migrate');
        }
    }

    /**
     * Check if encryption is available on this system
     */
    static isAvailable(): boolean {
        return safeStorage.isEncryptionAvailable();
    }
}
