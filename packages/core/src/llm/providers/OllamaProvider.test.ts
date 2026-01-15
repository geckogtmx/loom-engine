import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaProvider } from './OllamaProvider';
import { LLMRequest } from '../types';

// Mock fetch globally
global.fetch = vi.fn();

describe('OllamaProvider', () => {
    let provider: OllamaProvider;

    beforeEach(() => {
        vi.clearAllMocks();
        provider = new OllamaProvider({
            baseUrl: 'http://localhost:11434',
            defaultModel: 'qwen2.5:7b'
        });
    });

    describe('complete()', () => {
        it('should complete a request successfully', async () => {
            const mockResponse = {
                message: { content: 'Hello from LOOM!' },
                model: 'qwen2.5:7b',
                done: true,
                prompt_eval_count: 50,
                eval_count: 10
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const request: LLMRequest = {
                systemPrompt: 'You are a helpful assistant.',
                userPrompt: 'Say hello'
            };

            const response = await provider.complete(request);

            expect(response.content).toBe('Hello from LOOM!');
            expect(response.model).toBe('qwen2.5:7b');
            expect(response.tokensUsed.input).toBe(50);
            expect(response.tokensUsed.output).toBe(10);
            expect(response.finishReason).toBe('stop');
        });

        it('should throw ProviderOfflineError on connection failure', async () => {
            (global.fetch as any).mockRejectedValueOnce(new Error('fetch failed'));

            const request: LLMRequest = {
                systemPrompt: 'Test',
                userPrompt: 'Test'
            };

            try {
                await provider.complete(request);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).toContain('offline or unreachable');
            }
        });

        it('should retry on failure', async () => {
            // First attempt fails, second succeeds
            (global.fetch as any)
                .mockRejectedValueOnce(new Error('timeout'))
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        message: { content: 'Success after retry' },
                        model: 'qwen2.5:7b',
                        done: true,
                        prompt_eval_count: 10,
                        eval_count: 5
                    })
                });

            const request: LLMRequest = {
                systemPrompt: 'Test',
                userPrompt: 'Test'
            };

            const response = await provider.complete(request);
            expect(response.content).toBe('Success after retry');
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('stream()', () => {
        it('should stream tokens via callback', async () => {
            const mockStreamData = [
                JSON.stringify({ message: { content: 'Hello ' }, done: false }),
                JSON.stringify({ message: { content: 'world!' }, done: false }),
                JSON.stringify({ done: true, prompt_eval_count: 10, eval_count: 5, model: 'qwen2.5:7b' })
            ];

            const mockReader = {
                read: vi.fn()
                    .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(mockStreamData[0] + '\n') })
                    .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(mockStreamData[1] + '\n') })
                    .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode(mockStreamData[2] + '\n') })
                    .mockResolvedValueOnce({ done: true })
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                body: { getReader: () => mockReader }
            });

            const tokens: string[] = [];
            const request: LLMRequest = {
                systemPrompt: 'Test',
                userPrompt: 'Say hello'
            };

            const response = await provider.stream(request, (token) => tokens.push(token));

            expect(tokens).toEqual(['Hello ', 'world!']);
            expect(response.content).toBe('Hello world!');
            expect(response.tokensUsed.input).toBe(10);
            expect(response.tokensUsed.output).toBe(5);
        });
    });

    describe('listModels()', () => {
        it('should return available models', async () => {
            const mockModels = {
                models: [
                    { name: 'qwen2.5:7b' },
                    { name: 'llama2:latest' },
                    { name: 'mistral:latest' }
                ]
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockModels
            });

            const models = await provider.listModels();

            expect(models).toEqual(['qwen2.5:7b', 'llama2:latest', 'mistral:latest']);
        });
    });

    describe('estimateCost()', () => {
        it('should return $0 cost for local Ollama', async () => {
            const request: LLMRequest = {
                systemPrompt: 'Short prompt',
                userPrompt: 'Another prompt',
                maxTokens: 100
            };

            const estimate = await provider.estimateCost(request);

            expect(estimate.totalCost).toBe(0);
            expect(estimate.inputCost).toBe(0);
            expect(estimate.outputCost).toBe(0);
            expect(estimate.tokens.input).toBeGreaterThan(0);
            expect(estimate.tokens.output).toBe(100);
        });
    });

    describe('isAvailable()', () => {
        it('should return true if Ollama is reachable', async () => {
            (global.fetch as any).mockResolvedValueOnce({ ok: true });

            const available = await provider.isAvailable();
            expect(available).toBe(true);
        });

        it('should return false if Ollama is unreachable', async () => {
            (global.fetch as any).mockRejectedValueOnce(new Error('ECONNREFUSED'));

            const available = await provider.isAvailable();
            expect(available).toBe(false);
        });
    });
});
