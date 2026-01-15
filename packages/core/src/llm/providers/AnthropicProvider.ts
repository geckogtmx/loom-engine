import Anthropic from '@anthropic-ai/sdk';
import {
    LLMProvider,
    LLMRequest,
    LLMResponse,
    CostEstimate,
    ProviderConfig,
    ProviderOfflineError
} from '../types';

/**
 * AnthropicProvider — Claude Integration (Claude 3.5 Sonnet, Claude 3 Opus)
 * 
 * Preferred for DEEP sessions requiring high reasoning capacity.
 * Requires ANTHROPIC_API_KEY environment variable.
 */
export class AnthropicProvider implements LLMProvider {
    private client: Anthropic;
    private defaultModel: string;

    constructor(config?: ProviderConfig) {
        const apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('Anthropic API key not provided');
        }

        this.client = new Anthropic({ apiKey });
        this.defaultModel = config?.defaultModel || 'claude-3-5-sonnet-20241022';
    }

    async complete(request: LLMRequest): Promise<LLMResponse> {
        const model = request.model || this.defaultModel;

        try {
            const message = await this.client.messages.create({
                model,
                system: request.systemPrompt,
                messages: this.buildMessages(request),
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens || 4096
            });

            const textContent = message.content
                .filter(block => block.type === 'text')
                .map(block => (block as Anthropic.TextBlock).text)
                .join('');

            return {
                content: textContent,
                tokensUsed: {
                    input: message.usage.input_tokens,
                    output: message.usage.output_tokens,
                    total: message.usage.input_tokens + message.usage.output_tokens
                },
                model: message.model,
                finishReason: message.stop_reason === 'end_turn' ? 'stop' : 'length'
            };
        } catch (error: any) {
            if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
                throw new ProviderOfflineError('anthropic', error);
            }
            throw error;
        }
    }

    async stream(request: LLMRequest, onToken: (token: string) => void): Promise<LLMResponse> {
        const model = request.model || this.defaultModel;

        try {
            const stream = await this.client.messages.create({
                model,
                system: request.systemPrompt,
                messages: this.buildMessages(request),
                temperature: request.temperature ?? 0.7,
                max_tokens: request.maxTokens || 4096,
                stream: true
            });

            let fullContent = '';
            let inputTokens = 0;
            let outputTokens = 0;
            let finalModel = model;
            let finishReason: LLMResponse['finishReason'] = 'stop';

            for await (const event of stream) {
                if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                    const token = event.delta.text;
                    fullContent += token;
                    onToken(token);
                }

                if (event.type === 'message_start') {
                    inputTokens = event.message.usage.input_tokens;
                }

                if (event.type === 'message_delta') {
                    outputTokens = event.usage.output_tokens;
                    finishReason = event.delta.stop_reason === 'end_turn' ? 'stop' : 'length';
                }
            }

            return {
                content: fullContent,
                tokensUsed: {
                    input: inputTokens,
                    output: outputTokens,
                    total: inputTokens + outputTokens
                },
                model: finalModel,
                finishReason
            };
        } catch (error: any) {
            if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
                throw new ProviderOfflineError('anthropic', error);
            }
            throw error;
        }
    }

    async listModels(): Promise<string[]> {
        // Anthropic doesn't have a models endpoint, return known models
        return [
            'claude-3-5-sonnet-20241022',
            'claude-3-opus-20240229',
            'claude-3-sonnet-20240229',
            'claude-3-haiku-20240307'
        ];
    }

    async estimateCost(request: LLMRequest): Promise<CostEstimate> {
        const model = request.model || this.defaultModel;

        const inputTokens = Math.ceil((request.systemPrompt.length + request.userPrompt.length) / 4);
        const outputTokens = request.maxTokens || 500;

        // Pricing (as of Jan 2026)
        const pricing: Record<string, { input: number; output: number }> = {
            'claude-3-5-sonnet-20241022': { input: 0.003 / 1000, output: 0.015 / 1000 },
            'claude-3-opus-20240229': { input: 0.015 / 1000, output: 0.075 / 1000 },
            'claude-3-sonnet-20240229': { input: 0.003 / 1000, output: 0.015 / 1000 },
            'claude-3-haiku-20240307': { input: 0.00025 / 1000, output: 0.00125 / 1000 }
        };

        const rates = pricing[model] || pricing['claude-3-5-sonnet-20241022'];

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
            // Test with a minimal request
            await this.client.messages.create({
                model: this.defaultModel,
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 1
            });
            return true;
        } catch {
            return false;
        }
    }

    private buildMessages(request: LLMRequest): Anthropic.MessageParam[] {
        const messages: Anthropic.MessageParam[] = [];

        if (request.history) {
            messages.push(...request.history.map(msg => ({
                role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
                content: msg.content
            })));
        }

        messages.push({ role: 'user', content: request.userPrompt });

        return messages;
    }
}
