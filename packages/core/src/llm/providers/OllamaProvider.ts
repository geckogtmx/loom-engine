import {
    LLMProvider,
    LLMRequest,
    LLMResponse,
    CostEstimate,
    ProviderConfig,
    ProviderOfflineError
} from '../types';

/**
 * OllamaProvider — Local-First LLM Provider
 * 
 * Connects to local Ollama server for privacy and cost reduction.
 * Default provider for THIN sessions.
 * 
 * API Docs: https://github.com/ollama/ollama/blob/main/docs/api.md
 */
export class OllamaProvider implements LLMProvider {
    private baseUrl: string;
    private defaultModel: string;
    private timeout: number;
    private maxRetries: number;

    constructor(config?: ProviderConfig) {
        this.baseUrl = config?.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        this.defaultModel = config?.defaultModel || process.env.OLLAMA_DEFAULT_MODEL || 'qwen2.5:7b';
        this.timeout = config?.timeout || 30000; // 30s default
        this.maxRetries = config?.maxRetries || 3;
    }

    /**
     * Synchronous completion (blocks until full response)
     */
    async complete(request: LLMRequest): Promise<LLMResponse> {
        const model = request.model || this.defaultModel;

        // Build messages from system + user prompts
        const messages = this.buildMessages(request);

        const payload = {
            model,
            messages,
            stream: false,
            options: {
                temperature: request.temperature ?? 0.7,
                num_predict: request.maxTokens ?? -1 // -1 = unlimited
            }
        };

        try {
            const response = await this.fetchWithRetry('/api/chat', payload);

            return {
                content: response.message?.content || '',
                tokensUsed: {
                    input: response.prompt_eval_count || 0,
                    output: response.eval_count || 0,
                    total: (response.prompt_eval_count || 0) + (response.eval_count || 0)
                },
                model: response.model || model,
                finishReason: response.done ? 'stop' : 'error',
                metadata: {
                    totalDuration: response.total_duration,
                    loadDuration: response.load_duration,
                    evalDuration: response.eval_duration
                }
            };
        } catch (error) {
            if (this.isConnectionError(error)) {
                throw new ProviderOfflineError('ollama', error as Error);
            }
            throw error;
        }
    }

    /**
     * Streaming completion (yields tokens via callback)
     */
    async stream(request: LLMRequest, onToken: (token: string) => void): Promise<LLMResponse> {
        const model = request.model || this.defaultModel;
        const messages = this.buildMessages(request);

        const payload = {
            model,
            messages,
            stream: true,
            options: {
                temperature: request.temperature ?? 0.7,
                num_predict: request.maxTokens ?? -1
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let fullContent = '';
            let totalInputTokens = 0;
            let totalOutputTokens = 0;
            let finalModel = model;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);

                        if (json.message?.content) {
                            const token = json.message.content;
                            fullContent += token;
                            onToken(token);
                        }

                        if (json.done) {
                            totalInputTokens = json.prompt_eval_count || 0;
                            totalOutputTokens = json.eval_count || 0;
                            finalModel = json.model || model;
                        }
                    } catch (parseError) {
                        console.warn('[OllamaProvider] Failed to parse SSE line:', line);
                    }
                }
            }

            return {
                content: fullContent,
                tokensUsed: {
                    input: totalInputTokens,
                    output: totalOutputTokens,
                    total: totalInputTokens + totalOutputTokens
                },
                model: finalModel,
                finishReason: 'stop'
            };
        } catch (error) {
            if (this.isConnectionError(error)) {
                throw new ProviderOfflineError('ollama', error as Error);
            }
            throw error;
        }
    }

    /**
     * List available models from Ollama
     */
    async listModels(): Promise<string[]> {
        try {
            const response = await this.fetchWithRetry('/api/tags', null, 'GET');
            return (response.models || []).map((m: any) => m.name);
        } catch (error) {
            if (this.isConnectionError(error)) {
                throw new ProviderOfflineError('ollama', error as Error);
            }
            throw error;
        }
    }

    /**
     * Estimate cost (Ollama is free/local, so cost is $0)
     */
    async estimateCost(request: LLMRequest): Promise<CostEstimate> {
        // Rough token estimation (4 chars per token)
        const inputTokens = Math.ceil((request.systemPrompt.length + request.userPrompt.length) / 4);
        const outputTokens = request.maxTokens || 500; // Assume 500 if not specified

        return {
            inputCost: 0,
            outputCost: 0,
            totalCost: 0,
            model: request.model || this.defaultModel,
            tokens: {
                input: inputTokens,
                output: outputTokens
            }
        };
    }

    /**
     * Check if Ollama is reachable
     */
    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5s timeout
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Helper: Build messages array from request
     */
    private buildMessages(request: LLMRequest): Array<{ role: string; content: string }> {
        const messages: Array<{ role: string; content: string }> = [];

        // System prompt
        if (request.systemPrompt) {
            messages.push({ role: 'system', content: request.systemPrompt });
        }

        // History (if provided)
        if (request.history) {
            messages.push(...request.history);
        }

        // User prompt
        messages.push({ role: 'user', content: request.userPrompt });

        return messages;
    }

    /**
     * Helper: Fetch with retry logic (exponential backoff)
     */
    private async fetchWithRetry(
        endpoint: string,
        payload: any,
        method: 'POST' | 'GET' = 'POST'
    ): Promise<any> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method,
                    headers: method === 'POST' ? { 'Content-Type': 'application/json' } : {},
                    body: method === 'POST' ? JSON.stringify(payload) : undefined,
                    signal: AbortSignal.timeout(this.timeout)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                lastError = error as Error;

                // Don't retry on connection errors in final attempt
                if (attempt === this.maxRetries - 1) break;

                // Exponential backoff: 500ms, 1s, 2s
                const delay = 500 * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError || new Error('Fetch failed after retries');
    }

    /**
     * Helper: Detect connection errors (ECONNREFUSED, timeout, etc.)
     */
    private isConnectionError(error: unknown): boolean {
        if (!(error instanceof Error)) return false;

        const message = error.message.toLowerCase();
        return (
            message.includes('econnrefused') ||
            message.includes('timeout') ||
            message.includes('network') ||
            message.includes('fetch failed')
        );
    }
}
