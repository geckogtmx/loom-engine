import {
    LLMProvider,
    SessionClass,
    ProviderFactoryOptions,
    ProviderOfflineError,
    AllProvidersFailed,
    ProviderConfig
} from './types';
import { OllamaProvider } from './providers/OllamaProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';

/**
 * ProviderFactory — Local-First LLM Provider Selection
 * 
 * Routes sessions to appropriate providers based on:
 * - Session class (THIN/STANDARD/DEEP)
 * - Provider availability (Ollama online/offline)
 * - Explicit overrides
 * 
 * Routing Strategy:
 * - THIN → Ollama only (fail if offline)
 * - STANDARD → Ollama preferred, fallback to OpenAI
 * - DEEP → Cloud preferred (Anthropic > OpenAI)
 * 
 * Phase 7: AI Integration
 */
export class ProviderFactory {
    /**
     * Create and return the best available provider for the given options
     */
    static async create(options: ProviderFactoryOptions): Promise<LLMProvider> {
        const { sessionClass, preferredProvider, apiKeys, configs } = options;

        // 1. Explicit Override
        if (preferredProvider) {
            return this.createByName(preferredProvider, apiKeys, configs);
        }

        // 2. Session Class-Based Routing
        switch (sessionClass) {
            case 'THIN':
                return await this.createForThin(apiKeys, configs);
            case 'STANDARD':
                return await this.createForStandard(apiKeys, configs);
            case 'DEEP':
                return await this.createForDeep(apiKeys, configs);
            default:
                throw new Error(`Unknown session class: ${sessionClass}`);
        }
    }

    /**
     * THIN sessions: Ollama only (local-first, privacy)
     */
    private static async createForThin(
        apiKeys?: Record<string, string>,
        configs?: Record<string, ProviderConfig>
    ): Promise<LLMProvider> {
        const ollama = new OllamaProvider(configs?.ollama);

        if (await ollama.isAvailable()) {
            return ollama;
        }

        throw new ProviderOfflineError('ollama');
    }

    /**
     * STANDARD sessions: Ollama preferred, cloud fallback
     */
    private static async createForStandard(
        apiKeys?: Record<string, string>,
        configs?: Record<string, ProviderConfig>
    ): Promise<LLMProvider> {
        const attempts: Array<{ provider: string; error: Error }> = [];

        // Try Ollama first
        try {
            const ollama = new OllamaProvider(configs?.ollama);
            if (await ollama.isAvailable()) {
                return ollama;
            }
        } catch (error) {
            attempts.push({ provider: 'ollama', error: error as Error });
        }

        // Fallback to OpenAI
        try {
            const openai = new OpenAIProvider({
                apiKey: apiKeys?.openai,
                ...configs?.openai
            });
            if (await openai.isAvailable()) {
                return openai;
            }
        } catch (error) {
            attempts.push({ provider: 'openai', error: error as Error });
        }

        throw new AllProvidersFailed(attempts);
    }

    /**
     * DEEP sessions: Cloud preferred (Anthropic > OpenAI), Ollama last resort
     */
    private static async createForDeep(
        apiKeys?: Record<string, string>,
        configs?: Record<string, ProviderConfig>
    ): Promise<LLMProvider> {
        const attempts: Array<{ provider: string; error: Error }> = [];

        // Try Anthropic first (best for reasoning)
        try {
            const anthropic = new AnthropicProvider({
                apiKey: apiKeys?.anthropic,
                ...configs?.anthropic
            });
            if (await anthropic.isAvailable()) {
                return anthropic;
            }
        } catch (error) {
            attempts.push({ provider: 'anthropic', error: error as Error });
        }

        // Fallback to OpenAI GPT-4o
        try {
            const openai = new OpenAIProvider({
                apiKey: apiKeys?.openai,
                defaultModel: 'gpt-4o',
                ...configs?.openai
            });
            if (await openai.isAvailable()) {
                return openai;
            }
        } catch (error) {
            attempts.push({ provider: 'openai', error: error as Error });
        }

        // Last resort: Ollama (if available)
        try {
            const ollama = new OllamaProvider(configs?.ollama);
            if (await ollama.isAvailable()) {
                return ollama;
            }
        } catch (error) {
            attempts.push({ provider: 'ollama', error: error as Error });
        }

        throw new AllProvidersFailed(attempts);
    }

    /**
     * Create a specific provider by name (for explicit overrides)
     */
    private static createByName(
        name: string,
        apiKeys?: Record<string, string>,
        configs?: Record<string, ProviderConfig>
    ): LLMProvider {
        switch (name.toLowerCase()) {
            case 'ollama':
                return new OllamaProvider(configs?.ollama);
            case 'openai':
                return new OpenAIProvider({
                    apiKey: apiKeys?.openai,
                    ...configs?.openai
                });
            case 'anthropic':
                return new AnthropicProvider({
                    apiKey: apiKeys?.anthropic,
                    ...configs?.anthropic
                });
            default:
                throw new Error(`Unknown provider: ${name}`);
        }
    }

    /**
     * Get default provider for a session class (without availability check)
     */
    static getDefaultProviderName(sessionClass: SessionClass): string {
        switch (sessionClass) {
            case 'THIN':
                return 'ollama';
            case 'STANDARD':
                return 'ollama';
            case 'DEEP':
                return 'anthropic';
        }
    }
}
