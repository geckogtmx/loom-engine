import OpenAI from 'openai';
import {
    LLMProvider,
    LLMRequest,
    LLMResponse,
    CostEstimate,
    ProviderConfig,
    ProviderOfflineError
} from '../types';

/**
 * OpenAIProvider — Cloud LLM Provider (GPT-4o, GPT-4o-mini)
 * 
 * Fallback provider for STANDARD/DEEP sessions when Ollama is unavailable.
 * Requires OPENAI_API_KEY environment variable.
 */
export class OpenAIProvider implements LLMProvider {
    private client: OpenAI;
    private defaultModel: string;

    constructor(config?: ProviderConfig) {
        const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OpenAI API key not provided');
        }

        this.client = new OpenAI({ apiKey });
        this.defaultModel = config?.defaultModel || 'gpt-4o-mini';
    }

    async complete(request: LLMRequest): Promise<LLMResponse> {
        const model = request.model || this.defaultModel;

        try {
            const completion = await this.client.chat.completions.create({
                model,
                messages: this.buildMessages(request),
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens
            });

            const choice = completion.choices[0];
            return {
                content: choice.message.content || '',
                tokensUsed: {
                    input: completion.usage?.prompt_tokens || 0,
                    output: completion.usage?.completion_tokens || 0,
                    total: completion.usage?.total_tokens || 0
                },
                model: completion.model,
                finishReason: choice.finish_reason === 'stop' ? 'stop' : 'length'
            };
        } catch (error: any) {
            if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
                throw new ProviderOfflineError('openai', error);
            }
            throw error;
        }
    }

    async stream(request: LLMRequest, onToken: (token: string) => void): Promise<LLMResponse> {
        const model = request.model || this.defaultModel;

        try {
            const stream = await this.client.chat.completions.create({
                model,
                messages: this.buildMessages(request),
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens,
                stream: true
            });

            let fullContent = '';
            let finalModel = model;
            let finishReason: LLMResponse['finishReason'] = 'stop';

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content;
                if (delta) {
                    fullContent += delta;
                    onToken(delta);
                }

                if (chunk.choices[0]?.finish_reason) {
                    finishReason = chunk.choices[0].finish_reason === 'stop' ? 'stop' : 'length';
                }
                if (chunk.model) {
                    finalModel = chunk.model;
                }
            }

            // Note: Token usage not available in streaming mode
            const estimatedTokens = Math.ceil(fullContent.length / 4);

            return {
                content: fullContent,
                tokensUsed: {
                    input: 0, // Not available in streaming
                    output: estimatedTokens,
                    total: estimatedTokens
                },
                model: finalModel,
                finishReason
            };
        } catch (error: any) {
            if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
                throw new ProviderOfflineError('openai', error);
            }
            throw error;
        }
    }

    async listModels(): Promise<string[]> {
        try {
            const models = await this.client.models.list();
            return models.data
                .filter(m => m.id.startsWith('gpt-'))
                .map(m => m.id);
        } catch (error: any) {
            if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
                throw new ProviderOfflineError('openai', error);
            }
            throw error;
        }
    }

    async estimateCost(request: LLMRequest): Promise<CostEstimate> {
        const model = request.model || this.defaultModel;

        // Estimate tokens
        const inputTokens = Math.ceil((request.systemPrompt.length + request.userPrompt.length) / 4);
        const outputTokens = request.maxTokens || 500;

        // Pricing (as of Jan 2026, adjust as needed)
        const pricing: Record<string, { input: number; output: number }> = {
            'gpt-4o': { input: 0.0025 / 1000, output: 0.010 / 1000 }, // $2.50/$10 per 1M tokens
            'gpt-4o-mini': { input: 0.00015 / 1000, output: 0.0006 / 1000 } // $0.15/$0.60 per 1M tokens
        };

        const rates = pricing[model] || pricing['gpt-4o-mini'];

        return {
            inputCost: inputTokens * rates.input,
            outputCost: outputTokens * rates.output,
            totalCost: (inputTokens * rates.input) + (outputTokens * rates.output),
            model,
            tokens: { input: inputTokens, output: outputTokens }
        };
    }

    async isAvailable(): Promise<boolean> {
        try {
            await this.client.models.list();
            return true;
        } catch {
            return false;
        }
    }

    private buildMessages(request: LLMRequest): OpenAI.Chat.ChatCompletionMessageParam[] {
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

        if (request.systemPrompt) {
            messages.push({ role: 'system', content: request.systemPrompt });
        }

        if (request.history) {
            messages.push(...request.history as OpenAI.Chat.ChatCompletionMessageParam[]);
        }

        messages.push({ role: 'user', content: request.userPrompt });

        return messages;
    }
}
