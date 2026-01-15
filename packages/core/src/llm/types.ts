/**
 * Core LLM Provider System Types
 * Phase 7: AI Integration
 */

/**
 * Standard interface that all LLM providers must implement.
 * Supports both completion and streaming modes.
 */
export interface LLMProvider {
    /**
     * Synchronous completion (blocks until full response received)
     */
    complete(request: LLMRequest): Promise<LLMResponse>;

    /**
     * Streaming completion (yields tokens incrementally via callback)
     * @param onToken Callback invoked for each token received
     */
    stream(request: LLMRequest, onToken: (token: string) => void): Promise<LLMResponse>;

    /**
     * List available models from this provider
     */
    listModels(): Promise<string[]>;

    /**
     * Estimate the cost of a request (based on token count)
     */
    estimateCost(request: LLMRequest): Promise<CostEstimate>;

    /**
     * Check if the provider is currently available (online/reachable)
     */
    isAvailable(): Promise<boolean>;
}

/**
 * Request payload sent to an LLM provider
 */
export interface LLMRequest {
    /** System-level instruction (Telos + Agent constraints + World rules) */
    systemPrompt: string;

    /** User's query or instruction */
    userPrompt: string;

    /** Optional model override (provider-specific identifier) */
    model?: string;

    /** Sampling temperature (0.0 = deterministic, 1.0 = creative) */
    temperature?: number;

    /** Maximum tokens to generate */
    maxTokens?: number;

    /** Optional conversation history (for context) */
    history?: ChatMessage[];
}

/**
 * Response from an LLM provider
 */
export interface LLMResponse {
    /** Generated text content */
    content: string;

    /** Token usage breakdown */
    tokensUsed: {
        input: number;
        output: number;
        total: number;
    };

    /** Actual model used (may differ from requested if fallback occurred) */
    model: string;

    /** Why generation stopped */
    finishReason: 'stop' | 'length' | 'error' | 'abort';

    /** Optional metadata from provider */
    metadata?: Record<string, any>;
}

/**
 * Cost estimation for a request
 */
export interface CostEstimate {
    /** Estimated input cost (USD) */
    inputCost: number;

    /** Estimated output cost (USD) */
    outputCost: number;

    /** Total estimated cost (USD) */
    totalCost: number;

    /** Model used for estimation */
    model: string;

    /** Estimated token counts */
    tokens: {
        input: number;
        output: number;
    };
}

/**
 * Chat message structure (for conversation history)
 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
    /** API key (if required) */
    apiKey?: string;

    /** Base URL (for self-hosted or local providers) */
    baseUrl?: string;

    /** Default model for this provider */
    defaultModel?: string;

    /** Request timeout (ms) */
    timeout?: number;

    /** Max retry attempts on failure */
    maxRetries?: number;
}

/**
 * Session class determines provider routing strategy
 */
export type SessionClass = 'THIN' | 'STANDARD' | 'DEEP';

/**
 * Provider factory options
 */
export interface ProviderFactoryOptions {
    /** Session classification (determines routing) */
    sessionClass: SessionClass;

    /** Explicit provider override (e.g., 'ollama', 'openai', 'anthropic') */
    preferredProvider?: string;

    /** API keys by provider name */
    apiKeys?: Record<string, string>;

    /** Custom provider configurations */
    configs?: Record<string, ProviderConfig>;
}

/**
 * Error thrown when a provider is offline/unavailable
 */
export class ProviderOfflineError extends Error {
    constructor(providerName: string, cause?: Error) {
        super(`Provider '${providerName}' is offline or unreachable`);
        this.name = 'ProviderOfflineError';
        this.cause = cause;
    }
}

/**
 * Error thrown when all providers in the fallback chain fail
 */
export class AllProvidersFailed extends Error {
    constructor(public attempts: Array<{ provider: string; error: Error }>) {
        const summary = attempts.map(a => `${a.provider}: ${a.error.message}`).join('; ');
        super(`All LLM providers failed: ${summary}`);
        this.name = 'AllProvidersFailed';
    }
}
