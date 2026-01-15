---
name: llm-provider
description: Guides LLM provider adapter implementation for LOOM Engine (Ollama, OpenAI, Anthropic, Google, DeepSeek). Use this skill when creating provider interfaces, implementing local-first model selection, streaming responses via WebSocket, handling graceful offline degradation, or working on Phase 7 LLM Integration.
---

# LLM Provider

This skill guides model-agnostic LLM integration with local-first priority.

## Core Principles

1. **Local-First**: Ollama is the default for 80%+ of interactions
2. **Model-Agnostic**: Works with any provider
3. **Graceful Degradation**: Full functionality offline
4. **Cloud is Opt-In**: External APIs require explicit choice

## Provider Interface

```typescript
interface LLMProvider {
  readonly name: string;
  readonly isLocal: boolean;

  // Core operations
  chat(request: ChatRequest): Promise<ChatResponse>;
  stream(request: ChatRequest): AsyncGenerator<StreamChunk>;

  // Discovery
  listModels(): Promise<Model[]>;
  isAvailable(): Promise<boolean>;

  // Cost estimation
  estimateCost(request: ChatRequest): CostEstimate;
}

interface ChatRequest {
  messages: Message[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

interface ChatResponse {
  content: string;
  model: string;
  usage: TokenUsage;
  finishReason: 'stop' | 'length' | 'error';
}

interface StreamChunk {
  content: string;
  done: boolean;
  usage?: TokenUsage;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}
```

## Ollama Provider (Primary)

```typescript
class OllamaProvider implements LLMProvider {
  readonly name = 'ollama';
  readonly isLocal = true;

  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<Model[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    const data = await response.json();
    return data.models.map((m: any) => ({
      id: m.name,
      name: m.name,
      provider: 'ollama',
      contextLength: m.details?.parameter_size ?? 4096,
    }));
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        messages: this.formatMessages(request.messages, request.systemPrompt),
        stream: false,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens ?? 2048,
        },
      }),
    });

    const data = await response.json();
    return {
      content: data.message.content,
      model: request.model,
      usage: {
        promptTokens: data.prompt_eval_count ?? 0,
        completionTokens: data.eval_count ?? 0,
        totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
      },
      finishReason: 'stop',
    };
  }

  async *stream(request: ChatRequest): AsyncGenerator<StreamChunk> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: request.model,
        messages: this.formatMessages(request.messages, request.systemPrompt),
        stream: true,
      }),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        const data = JSON.parse(line);
        yield {
          content: data.message?.content ?? '',
          done: data.done ?? false,
          usage: data.done ? {
            promptTokens: data.prompt_eval_count ?? 0,
            completionTokens: data.eval_count ?? 0,
            totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
          } : undefined,
        };
      }
    }
  }

  estimateCost(): CostEstimate {
    return { estimated: 0, currency: 'USD', note: 'Local model - no cost' };
  }

  private formatMessages(messages: Message[], systemPrompt?: string): OllamaMessage[] {
    const formatted: OllamaMessage[] = [];
    if (systemPrompt) {
      formatted.push({ role: 'system', content: systemPrompt });
    }
    return [...formatted, ...messages];
  }
}
```

## Cloud Providers

### OpenAI Provider

```typescript
class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  readonly isLocal = false;

  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: this.formatMessages(request.messages, request.systemPrompt),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
      }),
    });

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: request.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      finishReason: data.choices[0].finish_reason,
    };
  }

  estimateCost(request: ChatRequest): CostEstimate {
    // GPT-4 pricing example
    const rates: Record<string, { input: number; output: number }> = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    };

    const rate = rates[request.model] ?? rates['gpt-3.5-turbo'];
    const estimatedTokens = this.estimateTokens(request.messages);

    return {
      estimated: (estimatedTokens.input * rate.input + estimatedTokens.output * rate.output) / 1000,
      currency: 'USD',
    };
  }
}
```

### Anthropic Provider

```typescript
class AnthropicProvider implements LLMProvider {
  readonly name = 'anthropic';
  readonly isLocal = false;

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: request.model,
        max_tokens: request.maxTokens ?? 2048,
        system: request.systemPrompt,
        messages: request.messages,
      }),
    });

    const data = await response.json();
    return {
      content: data.content[0].text,
      model: request.model,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
      finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'length',
    };
  }
}
```

## Provider Factory (Local-First Selection)

```typescript
class ProviderFactory {
  private providers: Map<string, LLMProvider> = new Map();
  private ollamaProvider: OllamaProvider;

  constructor() {
    this.ollamaProvider = new OllamaProvider();
  }

  registerProvider(provider: LLMProvider): void {
    this.providers.set(provider.name, provider);
  }

  async selectProvider(context: SelectionContext): Promise<LLMProvider> {
    // Rule 1: THIN sessions always use local
    if (context.sessionClass === 'THIN') {
      if (await this.ollamaProvider.isAvailable()) {
        return this.ollamaProvider;
      }
      throw new NoLocalModelError('THIN sessions require local model');
    }

    // Rule 2: Check if offline
    if (!navigator.onLine) {
      if (await this.ollamaProvider.isAvailable()) {
        return this.ollamaProvider;
      }
      throw new OfflineError('No network and no local model available');
    }

    // Rule 3: Budget pressure → prefer local
    if (context.budgetRemaining !== undefined && context.budgetRemaining < 0.10) {
      if (await this.ollamaProvider.isAvailable()) {
        return this.ollamaProvider;
      }
    }

    // Rule 4: Agent preference
    if (context.agentModelPreference) {
      const preferred = this.providers.get(context.agentModelPreference);
      if (preferred && await preferred.isAvailable()) {
        return preferred;
      }
    }

    // Rule 5: Session override
    if (context.sessionProviderOverride) {
      const override = this.providers.get(context.sessionProviderOverride);
      if (override) return override;
    }

    // Default: local if available, else first cloud
    if (await this.ollamaProvider.isAvailable()) {
      return this.ollamaProvider;
    }

    for (const provider of this.providers.values()) {
      if (await provider.isAvailable()) {
        return provider;
      }
    }

    throw new NoProviderError('No LLM provider available');
  }
}

interface SelectionContext {
  sessionClass: 'THIN' | 'STANDARD' | 'DEEP';
  budgetRemaining?: number;
  agentModelPreference?: string;
  sessionProviderOverride?: string;
}
```

## Streaming to WebSocket

```typescript
class LLMStreamingService {
  constructor(
    private providerFactory: ProviderFactory,
    private websocket: WebSocketServer
  ) {}

  async streamToClient(
    clientId: string,
    request: ChatRequest,
    context: SelectionContext
  ): Promise<ChatResponse> {
    const provider = await this.providerFactory.selectProvider(context);

    // Notify client which model is being used
    this.websocket.send(clientId, {
      type: 'model-selected',
      model: request.model,
      provider: provider.name,
      isLocal: provider.isLocal,
    });

    let fullContent = '';
    let usage: TokenUsage | undefined;

    for await (const chunk of provider.stream(request)) {
      fullContent += chunk.content;

      this.websocket.send(clientId, {
        type: 'stream-chunk',
        content: chunk.content,
        done: chunk.done,
      });

      if (chunk.done && chunk.usage) {
        usage = chunk.usage;
      }
    }

    return {
      content: fullContent,
      model: request.model,
      usage: usage ?? { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      finishReason: 'stop',
    };
  }
}
```

## Graceful Offline Degradation

```typescript
class OfflineModeHandler {
  private isOffline = false;

  constructor(private providerFactory: ProviderFactory) {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private handleOffline(): void {
    this.isOffline = true;
    this.notifyUser('Offline Mode - Using Local Models');
  }

  private handleOnline(): void {
    this.isOffline = false;
    this.notifyUser('Back Online - All models available');
  }

  async ensureProvider(context: SelectionContext): Promise<LLMProvider> {
    try {
      return await this.providerFactory.selectProvider(context);
    } catch (error) {
      if (this.isOffline) {
        throw new OfflineError(
          'No local model available. Please install Ollama for offline use.'
        );
      }
      throw error;
    }
  }
}
```

## Testing Providers

```typescript
describe('ProviderFactory', () => {
  it('should prefer local for THIN sessions', async () => {
    const factory = new ProviderFactory();
    vi.spyOn(factory['ollamaProvider'], 'isAvailable').mockResolvedValue(true);

    const provider = await factory.selectProvider({
      sessionClass: 'THIN',
    });

    expect(provider.name).toBe('ollama');
    expect(provider.isLocal).toBe(true);
  });

  it('should fallback to local when offline', async () => {
    const factory = new ProviderFactory();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    vi.spyOn(factory['ollamaProvider'], 'isAvailable').mockResolvedValue(true);

    const provider = await factory.selectProvider({
      sessionClass: 'STANDARD',
    });

    expect(provider.isLocal).toBe(true);
  });

  it('should throw when THIN session has no local model', async () => {
    const factory = new ProviderFactory();
    vi.spyOn(factory['ollamaProvider'], 'isAvailable').mockResolvedValue(false);

    await expect(
      factory.selectProvider({ sessionClass: 'THIN' })
    ).rejects.toThrow(NoLocalModelError);
  });
});
```
