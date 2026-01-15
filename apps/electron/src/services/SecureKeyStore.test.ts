import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SecureKeyStore } from '../SecureKeyStore';
import { safeStorage } from 'electron';

// Mock Electron's safeStorage
vi.mock('electron', () => ({
    safeStorage: {
        encryptString: vi.fn(),
        decryptString: vi.fn(),
        isEncryptionAvailable: vi.fn()
    }
}));

// Mock database
const createMockDb = () => {
    const storage = new Map();

    return {
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                onConflictDoUpdate: vi.fn().mockImplementation(async (opts) => {
                    const key = opts.target.providerName;
                    return {};
                })
            })
        }),
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockImplementation(async () => {
                        return storage.get('query-result') || [];
                    })
                })
            })
        }),
        delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue({ changes: 1 })
        }),
        _storage: storage // For test manipulation
    };
};

describe('SecureKeyStore', () => {
    let keyStore: SecureKeyStore;
    let mockDb: ReturnType<typeof createMockDb>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockDb = createMockDb();
        keyStore = new SecureKeyStore(mockDb as any);

        // Default: encryption available
        (safeStorage.isEncryptionAvailable as any).mockReturnValue(true);
    });

    describe('isAvailable()', () => {
        it('should return true when encryption is available', () => {
            (safeStorage.isEncryptionAvailable as any).mockReturnValue(true);
            expect(SecureKeyStore.isAvailable()).toBe(true);
        });

        it('should return false when encryption is not available', () => {
            (safeStorage.isEncryptionAvailable as any).mockReturnValue(false);
            expect(SecureKeyStore.isAvailable()).toBe(false);
        });
    });

    describe('store()', () => {
        it('should encrypt and store an API key', async () => {
            const mockEncrypted = Buffer.from('encrypted-data');
            (safeStorage.encryptString as any).mockReturnValue(mockEncrypted);

            await keyStore.store('openai', 'sk-test123');

            expect(safeStorage.encryptString).toHaveBeenCalledWith('sk-test123');
            expect(mockDb.insert).toHaveBeenCalled();
        });

        it('should throw error if encryption is not available', async () => {
            (safeStorage.isEncryptionAvailable as any).mockReturnValue(false);

            await expect(keyStore.store('openai', 'sk-test123'))
                .rejects
                .toThrow('Encryption not available');
        });

        it('should update existing key (upsert)', async () => {
            const mockEncrypted = Buffer.from('new-encrypted-data');
            (safeStorage.encryptString as any).mockReturnValue(mockEncrypted);

            await keyStore.store('openai', 'sk-newkey456');

            // Verify onConflictDoUpdate was called
            const insertChain = (mockDb.insert as any).mock.results[0].value;
            const valuesChain = insertChain.values.mock.results[0].value;
            expect(valuesChain.onConflictDoUpdate).toHaveBeenCalled();
        });
    });

    describe('retrieve()', () => {
        it('should decrypt and return stored API key', async () => {
            const mockEncrypted = Buffer.from('encrypted-sk-test123').toString('base64');
            mockDb._storage.set('query-result', [{
                providerName: 'openai',
                encryptedValue: mockEncrypted
            }]);

            (safeStorage.decryptString as any).mockReturnValue('sk-test123');

            const result = await keyStore.retrieve('openai');

            expect(result).toBe('sk-test123');
            expect(safeStorage.decryptString).toHaveBeenCalledWith(
                Buffer.from(mockEncrypted, 'base64')
            );
        });

        it('should return null if key not found', async () => {
            mockDb._storage.set('query-result', []);

            const result = await keyStore.retrieve('nonexistent');

            expect(result).toBe(null);
            expect(safeStorage.decryptString).not.toHaveBeenCalled();
        });
    });

    describe('delete()', () => {
        it('should delete a stored key', async () => {
            const result = await keyStore.delete('openai');

            expect(result).toBe(true);
            expect(mockDb.delete).toHaveBeenCalled();
        });
    });

    describe('listProviders()', () => {
        it('should return list of provider names', async () => {
            mockDb.select = vi.fn().mockReturnValue({
                from: vi.fn().mockResolvedValue([
                    { providerName: 'openai' },
                    { providerName: 'anthropic' }
                ])
            });

            const providers = await keyStore.listProviders();

            expect(providers).toEqual(['openai', 'anthropic']);
        });

        it('should return empty array if no keys stored', async () => {
            mockDb.select = vi.fn().mockReturnValue({
                from: vi.fn().mockResolvedValue([])
            });

            const providers = await keyStore.listProviders();

            expect(providers).toEqual([]);
        });
    });

    describe('migrateFromEnv()', () => {
        beforeEach(() => {
            // Mock process.env
            process.env.OPENAI_API_KEY = 'sk-openai-test';
            process.env.ANTHROPIC_API_KEY = 'sk-ant-test';
            process.env.GOOGLE_API_KEY = '';  // Empty should be skipped
        });

        it('should migrate non-empty keys from environment', async () => {
            const mockEncrypted = Buffer.from('encrypted');
            (safeStorage.encryptString as any).mockReturnValue(mockEncrypted);

            await keyStore.migrateFromEnv();

            // Should store openai and anthropic, skip google (empty)
            expect(mockDb.insert).toHaveBeenCalledTimes(2);
        });

        it('should handle migration errors gracefully', async () => {
            (safeStorage.encryptString as any).mockImplementation(() => {
                throw new Error('Encryption failed');
            });

            // Should not throw, just log error
            await expect(keyStore.migrateFromEnv()).resolves.not.toThrow();
        });
    });

    describe('integration: store -> retrieve cycle', () => {
        it('should successfully encrypt, store, and decrypt a key', async () => {
            const originalKey = 'sk-real-api-key-12345';
            const mockEncrypted = Buffer.from('mock-encrypted-bytes');

            // Setup mocks
            (safeStorage.encryptString as any).mockReturnValue(mockEncrypted);
            (safeStorage.decryptString as any).mockReturnValue(originalKey);

            // Store
            await keyStore.store('openai', originalKey);

            // Simulate DB returning the encrypted value
            mockDb._storage.set('query-result', [{
                providerName: 'openai',
                encryptedValue: mockEncrypted.toString('base64')
            }]);

            // Retrieve
            const retrieved = await keyStore.retrieve('openai');

            expect(retrieved).toBe(originalKey);
        });
    });
});
