# Phase 7 — LLM Integration: Local-First, Model-Agnostic

**Parent:** [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) v2.0, Phase 7
**Goal:** Implement multi-model AI calling with local models as primary, cloud as opt-in fallback, and full offline capability.
**Depends on:** Phase 2 (Session lifecycle), Phase 4 (Agent runtime)
**Exit Criteria:** Can make governed LLM calls with local models as default, cloud as fallback, full offline capability, streaming output via WebSocket, and per-session model selection.

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| `LLMProvider` interface | IMPLEMENTED | `packages/core/src/llm/types.ts` — complete, stream, listModels, estimateCost, isAvailable |
| `OllamaProvider` | IMPLEMENTED | Complete + streaming + retry logic, default model `qwen2.5:7b` |
| `OpenAIProvider` | IMPLEMENTED | Complete + streaming via OpenAI SDK, GPT-4o / GPT-4o-mini |
| `AnthropicProvider` | IMPLEMENTED | Complete + streaming via Anthropic SDK, Claude 3.5 Sonnet |
| `GoogleProvider` (Gemini) | MISSING | Not implemented |
| `DeepSeekProvider` | MISSING | Not implemented |
| `ProviderFactory` | IMPLEMENTED | Session-class routing (THIN/STANDARD/DEEP), local-first fallback chains |
| `SystemPromptBuilder` | IMPLEMENTED | Assembles Telos + SIE + Context + Instructions |
| `OrchestratorPort` interface | MISSING | LangChain abstraction layer not defined |
| WebSocket server | SCAFFOLDED | `apps/electron/src/main.ts` — WS server on port 8080, auth token validation |
| WebSocket streaming bridge | MISSING | No bridge from LLM stream callback to WebSocket messages |
| Token usage tracking | MISSING | No persistent tracking; `LLMResponse.tokensUsed` exists but not stored |
| Rate limiting / backoff | PARTIAL | OllamaProvider has retry with exponential backoff; no global rate limiter |
| Offline degradation | PARTIAL | `ProviderOfflineError` / `AllProvidersFailed` error types exist; no graceful UX flow |
| Per-session model selector | MISSING | `AgentModelPreferences` exists in types; no UI-visible selector wired |
| Unit tests | PARTIAL | OllamaProvider + ProviderFactory have basic tests; others untested |

---

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 7-01 | Define OrchestratorPort interface and context layer types | 3h | — | TODO |
| 7-02 | Harden OllamaProvider and add health monitoring | 3h | — | TODO |
| 7-03 | Implement GoogleProvider (Gemini) | 3h | — | TODO |
| 7-04 | Implement DeepSeekProvider | 3h | — | TODO |
| 7-05 | Extend ProviderFactory with full provider registry and fallback chains | 3h | 7-03, 7-04 | TODO |
| 7-06 | System prompt construction: OrchestratorPort.assemble() integration | 4h | 7-01 | TODO |
| 7-07 | WebSocket streaming bridge (LLM tokens to UI) | 4h | — | TODO |
| 7-08 | Error handling, retry logic, and graceful offline degradation | 3h | 7-05 | TODO |
| 7-09 | Token usage tracking and cost accounting | 3h | — | TODO |
| 7-10 | Rate limiting and backoff service | 3h | 7-09 | TODO |
| 7-11 | Per-session model selector (IPC + UI contract) | 3h | 7-05 | TODO |
| 7-12 | Phase 7 integration tests (multi-provider, streaming, offline) | 4h | ALL | TODO |

**Total estimated effort:** ~39 hours

---

## Task Details

### 7-01: Define OrchestratorPort Interface and Context Layer Types

**Priority:** P0
**Assignee:** Any
**Feature IDs:** ED-07
**Files:**
- `packages/core/src/llm/OrchestratorPort.ts` — new interface definition
- `packages/core/src/llm/types.ts` — add `ContextLayers`, `AssembledContext`, `Pipeline`, `ExecutionPlan`, `ExecutionEvent` types
- `packages/core/src/__tests__/llm/orchestrator-port.test.ts` — type and contract tests

**Scope:**
1. Define the `OrchestratorPort` interface that abstracts LangChain behind LOOM's governance layer:
   ```typescript
   interface OrchestratorPort {
     assemble(layers: ContextLayers): AssembledContext;
     route(context: AssembledContext, pipeline: Pipeline): ExecutionPlan;
     execute(plan: ExecutionPlan): AsyncIterable<ExecutionEvent>;
   }
   ```
2. Define `ContextLayers` — typed container for L1/L2/L3/L4 memory contents
3. Define `AssembledContext` — the flattened, token-budgeted context string plus metadata
4. Define `Pipeline` — ordered list of execution steps (pattern-bound, not autonomous)
5. Define `ExecutionPlan` — resolved plan with provider, model, prompt, and constraints
6. Define `ExecutionEvent` — discriminated union of events emitted during execution (`token`, `tool_call`, `error`, `done`)
7. Ensure no LangChain types leak into the interface — all types are LOOM-native

**Acceptance Criteria:**
- [ ] `OrchestratorPort` interface defined with `assemble()`, `route()`, `execute()` methods
- [ ] `ContextLayers` type includes fields for L1 (active), L2 (episodic), L3 (knowledge), L4 (telos)
- [ ] `AssembledContext` includes `systemPrompt`, `tokenCount`, `truncated` flag, `layers` metadata
- [ ] `ExecutionEvent` is a discriminated union (`type: 'token' | 'tool_call' | 'error' | 'done'`)
- [ ] `Pipeline` enforces pattern-bound execution (no autonomous agent loops)
- [ ] All types are exported from `packages/core/src/llm/types.ts`
- [ ] No `any` types used — all fields strictly typed

**Tests:**
- Type: TypeScript compilation validates all interfaces
- Unit: Mock implementation of `OrchestratorPort` satisfies the interface contract
- Unit: `ExecutionEvent` discriminated union narrows correctly in switch/case

---

### 7-02: Harden OllamaProvider and Add Health Monitoring

**Priority:** P0
**Assignee:** Any
**Feature IDs:** AI-01, CG-06
**Files:**
- `packages/core/src/llm/providers/OllamaProvider.ts` — enhance existing
- `packages/core/src/llm/OllamaHealthMonitor.ts` — new: periodic health check service
- `packages/core/src/__tests__/llm/providers/OllamaProvider.test.ts` — move and expand existing tests

**Scope:**
1. Add model pull detection: if requested model not found, emit a structured error with pull instructions
2. Add connection pooling awareness: track concurrent request count, queue if exceeding local GPU capacity
3. Implement `OllamaHealthMonitor` — periodic ping (every 30s) that tracks:
   - Online/offline status changes
   - Available models (cached, refreshed on status change)
   - GPU memory usage (if available via Ollama API)
   - Latency trend (rolling average of last 10 pings)
4. Emit events on status transitions: `online → offline`, `offline → online`
5. Add model warm-up: pre-load model on first session start to avoid cold-start latency
6. Ensure `isAvailable()` uses cached health status instead of live ping (for performance)

**Acceptance Criteria:**
- [ ] `OllamaHealthMonitor` pings Ollama at configurable interval (default 30s)
- [ ] Status transitions emit events (`'ollama:online'`, `'ollama:offline'`)
- [ ] `isAvailable()` returns cached health status (no network call)
- [ ] Missing model request returns structured error with model name and pull command
- [ ] Concurrent request tracking prevents overloading local GPU (configurable max concurrency)
- [ ] Model warm-up method loads model into Ollama memory before first request

**Tests:**
- Unit: Health monitor detects online → offline transition
- Unit: Health monitor detects offline → online transition
- Unit: `isAvailable()` returns cached value without network call
- Unit: Missing model error includes pull instructions
- Unit: Concurrent request limit enforced (rejects when at capacity)
- Unit: Existing complete/stream/listModels/estimateCost tests still pass

---

### 7-03: Implement GoogleProvider (Gemini)

**Priority:** P1
**Assignee:** Any
**Feature IDs:** AI-05
**Files:**
- `packages/core/src/llm/providers/GoogleProvider.ts` — new provider
- `packages/core/src/__tests__/llm/providers/GoogleProvider.test.ts` — new tests

**Scope:**
1. Implement `LLMProvider` interface for Google Gemini models
2. Use `@google/generative-ai` SDK (or raw REST API if SDK is not available)
3. Support models: `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`
4. Implement `complete()` — synchronous chat completion
5. Implement `stream()` — streaming with `onToken` callback using Gemini's `streamGenerateContent`
6. Implement `listModels()` — return supported Gemini models
7. Implement `estimateCost()` — pricing for Gemini models (per-token rates)
8. Implement `isAvailable()` — verify API key and connectivity
9. Map Gemini finish reasons to LOOM's `finishReason` enum
10. Handle Gemini-specific errors (quota exceeded, safety filters, invalid model)

**Acceptance Criteria:**
- [ ] `GoogleProvider` implements all 5 `LLMProvider` methods
- [ ] Constructor accepts `ProviderConfig` with `apiKey` and optional `defaultModel`
- [ ] `complete()` returns properly structured `LLMResponse` with token counts
- [ ] `stream()` invokes `onToken` callback for each chunk and returns final `LLMResponse`
- [ ] Safety filter blocks mapped to `finishReason: 'error'` with metadata explaining the block
- [ ] `estimateCost()` returns accurate per-token pricing for each Gemini model
- [ ] Connection errors throw `ProviderOfflineError`

**Tests:**
- Unit: `complete()` returns valid response (mocked SDK)
- Unit: `stream()` invokes callback per chunk (mocked SDK)
- Unit: Safety filter handling produces correct error response
- Unit: `estimateCost()` returns non-zero costs with correct model
- Unit: `isAvailable()` returns true/false based on mock connectivity

---

### 7-04: Implement DeepSeekProvider

**Priority:** P2
**Assignee:** Any
**Feature IDs:** AI-06
**Files:**
- `packages/core/src/llm/providers/DeepSeekProvider.ts` — new provider
- `packages/core/src/__tests__/llm/providers/DeepSeekProvider.test.ts` — new tests

**Scope:**
1. Implement `LLMProvider` interface for DeepSeek models
2. DeepSeek API is OpenAI-compatible — use OpenAI SDK with custom `baseURL`
3. Support models: `deepseek-chat`, `deepseek-reasoner`
4. Implement all 5 `LLMProvider` methods
5. Configure `baseURL` to `https://api.deepseek.com` (or env `DEEPSEEK_BASE_URL`)
6. Handle DeepSeek-specific rate limits and error codes
7. Implement cost estimation with DeepSeek's pricing (significantly cheaper than GPT-4o)

**Acceptance Criteria:**
- [ ] `DeepSeekProvider` implements all 5 `LLMProvider` methods
- [ ] Uses OpenAI SDK with `baseURL: 'https://api.deepseek.com'`
- [ ] Constructor reads `DEEPSEEK_API_KEY` from config or environment
- [ ] `complete()` and `stream()` work correctly through OpenAI-compatible API
- [ ] `estimateCost()` uses DeepSeek pricing (not OpenAI pricing)
- [ ] `listModels()` returns DeepSeek-specific model identifiers
- [ ] Connection errors throw `ProviderOfflineError`

**Tests:**
- Unit: `complete()` sends request to correct base URL (mocked)
- Unit: `stream()` invokes callback per chunk (mocked)
- Unit: `estimateCost()` returns DeepSeek-specific pricing
- Unit: `isAvailable()` checks DeepSeek endpoint, not OpenAI
- Unit: Constructor throws if no API key provided

---

### 7-05: Extend ProviderFactory with Full Provider Registry and Fallback Chains

**Priority:** P0
**Assignee:** Any
**Feature IDs:** AI-02, CG-06
**Depends on:** 7-03, 7-04
**Files:**
- `packages/core/src/llm/ProviderFactory.ts` — extend existing
- `packages/core/src/llm/ProviderRegistry.ts` — new: dynamic provider registry
- `packages/core/src/llm/types.ts` — add `ProviderRegistration`, `FallbackChain` types
- `packages/core/src/__tests__/llm/ProviderFactory.test.ts` — expand existing tests
- `packages/core/src/__tests__/llm/ProviderRegistry.test.ts` — new tests

**Scope:**
1. Create `ProviderRegistry` — a dynamic map of registered providers with metadata:
   ```typescript
   interface ProviderRegistration {
     name: string;
     displayName: string;
     isLocal: boolean;
     isDefault: boolean;
     priority: number;
     factory: (config: ProviderConfig) => LLMProvider;
   }
   ```
2. Register all 5 providers: Ollama, OpenAI, Anthropic, Google, DeepSeek
3. Refactor `ProviderFactory` to use `ProviderRegistry` instead of hardcoded switch statements
4. Implement configurable fallback chains per session class:
   - `THIN`: Ollama only (no fallback — fail if offline)
   - `STANDARD`: Ollama → DeepSeek → OpenAI
   - `DEEP`: Anthropic → OpenAI → Google → Ollama
5. Add `listAvailableProviders()` — returns all providers with current availability status
6. Add `getFallbackChain(sessionClass)` — returns ordered provider list for a session class
7. Local-first enforcement: `THIN` sessions MUST use local providers; cloud providers rejected even if explicitly requested

**Acceptance Criteria:**
- [ ] `ProviderRegistry` supports dynamic registration of providers
- [ ] All 5 providers registered with correct `isLocal` and `priority` metadata
- [ ] `ProviderFactory.create()` uses registry instead of hardcoded switch
- [ ] Fallback chains configurable per session class
- [ ] `THIN` session rejects cloud provider override with clear error message
- [ ] `listAvailableProviders()` returns all providers with `isAvailable` status
- [ ] `getFallbackChain()` returns ordered list for each session class
- [ ] Fallback iteration stops at first available provider

**Tests:**
- Unit: Registry accepts new provider registration
- Unit: Duplicate registration throws error
- Unit: `THIN` session rejects cloud provider override
- Unit: `STANDARD` fallback chain tries Ollama → DeepSeek → OpenAI in order
- Unit: `DEEP` fallback chain tries Anthropic → OpenAI → Google → Ollama
- Unit: `listAvailableProviders()` returns correct availability per provider (mocked)
- Unit: `AllProvidersFailed` thrown when entire fallback chain exhausted

---

### 7-06: System Prompt Construction — OrchestratorPort.assemble() Integration

**Priority:** P1
**Assignee:** Any
**Feature IDs:** AI-09
**Depends on:** 7-01
**Files:**
- `packages/core/src/llm/SystemPromptBuilder.ts` — extend existing
- `packages/core/src/llm/ContextBudget.ts` — new: token budget management
- `packages/core/src/llm/LoomOrchestrator.ts` — new: implements `OrchestratorPort`
- `packages/core/src/__tests__/llm/SystemPromptBuilder.test.ts` — new tests
- `packages/core/src/__tests__/llm/ContextBudget.test.ts` — new tests

**Scope:**
1. Implement `ContextBudget` — manages token allocation across context layers:
   - Total budget determined by model's context window (e.g., 8K for small local, 128K for cloud)
   - Reserved slots: system prompt (fixed), user prompt (fixed), response headroom (configurable)
   - Remaining budget distributed across L4 (highest priority) → L3 → L2 → L1 (lowest)
   - Truncation strategy: trim oldest L2 entries first, then L1, never L4
2. Extend `SystemPromptBuilder` to accept `ContextBudget` and respect token limits
3. Add step-mode prompt injection: when session is in step-by-step mode, append step instructions
4. Implement `LoomOrchestrator.assemble()` — the concrete implementation of `OrchestratorPort.assemble()`:
   - Takes `ContextLayers` from memory system
   - Applies `ContextBudget` to fit within model limits
   - Returns `AssembledContext` with final system prompt and metadata
5. Ensure system prompt always includes governance guardrails (Telos immutability reminder, SIE contract)

**Acceptance Criteria:**
- [ ] `ContextBudget` correctly allocates tokens across layers with L4 highest priority
- [ ] Truncation removes L2/L1 content before ever touching L4/L3
- [ ] `SystemPromptBuilder` respects token budget (output fits within model context window)
- [ ] Step-mode instructions appended when session is in step mode
- [ ] `LoomOrchestrator.assemble()` returns `AssembledContext` with `systemPrompt` and `tokenCount`
- [ ] System prompt always includes Telos, SIE contract, and governance guardrails
- [ ] Token counting uses a configurable estimator (default: 4 chars per token)

**Tests:**
- Unit: `ContextBudget` allocates correctly for 8K model
- Unit: `ContextBudget` allocates correctly for 128K model
- Unit: Truncation order: L1 trimmed before L2, L2 before L3, L4 never truncated
- Unit: Step-mode instructions present when step mode enabled
- Unit: `LoomOrchestrator.assemble()` produces valid `AssembledContext`
- Unit: Prompt fits within specified token budget (measured by estimator)

---

### 7-07: WebSocket Streaming Bridge (LLM Tokens to UI)

**Priority:** P0
**Assignee:** Any
**Feature IDs:** AI-08
**Files:**
- `packages/core/src/llm/StreamingBridge.ts` — new: bridges LLM stream to WebSocket
- `apps/electron/src/services/LLMStreamService.ts` — new: Electron-side stream orchestrator
- `apps/electron/src/main.ts` — wire streaming bridge into WebSocket server
- `apps/electron/src/ipc/channels.ts` — add LLM streaming channel constants
- `packages/core/src/__tests__/llm/StreamingBridge.test.ts` — new tests

**Scope:**
1. Define WebSocket message protocol for LLM streaming:
   ```typescript
   type WSStreamMessage =
     | { type: 'stream:start'; sessionId: string; model: string }
     | { type: 'stream:token'; sessionId: string; token: string }
     | { type: 'stream:error'; sessionId: string; error: string }
     | { type: 'stream:done'; sessionId: string; tokensUsed: TokenUsage; model: string }
   ```
2. Implement `StreamingBridge` — core class that:
   - Accepts an `LLMProvider.stream()` call and a WebSocket connection
   - Sends `stream:start` when generation begins
   - Forwards each `onToken` callback as a `stream:token` message
   - Sends `stream:done` with final token usage when complete
   - Sends `stream:error` if provider throws during streaming
   - Supports cancellation: client sends `stream:cancel` → bridge aborts the provider call
3. Implement `LLMStreamService` in Electron:
   - Receives stream requests via IPC from renderer
   - Creates provider via `ProviderFactory`
   - Builds system prompt via `SystemPromptBuilder`
   - Executes streaming via `StreamingBridge`
   - Handles concurrent streams (one per session, reject duplicate session streams)
4. Wire into existing WebSocket server in `apps/electron/src/main.ts`

**Acceptance Criteria:**
- [ ] `stream:start` message sent before first token
- [ ] Each LLM token forwarded as individual `stream:token` WebSocket message
- [ ] `stream:done` message sent with complete `tokensUsed` breakdown
- [ ] `stream:error` message sent if provider throws during streaming
- [ ] Client can send `stream:cancel` to abort an in-progress stream
- [ ] Concurrent stream requests for same session rejected with error
- [ ] WebSocket messages are JSON-serialized and include `sessionId` for routing

**Tests:**
- Unit: `StreamingBridge` sends `stream:start` before first token
- Unit: `StreamingBridge` forwards all tokens from mock provider
- Unit: `StreamingBridge` sends `stream:done` on completion
- Unit: `StreamingBridge` sends `stream:error` on provider failure
- Unit: Cancellation aborts provider and sends `stream:done` with partial results
- Unit: Duplicate session stream rejected

---

### 7-08: Error Handling, Retry Logic, and Graceful Offline Degradation

**Priority:** P1
**Assignee:** Any
**Feature IDs:** AI-07
**Depends on:** 7-05
**Files:**
- `packages/core/src/llm/RetryPolicy.ts` — new: configurable retry strategies
- `packages/core/src/llm/OfflineDegradation.ts` — new: offline UX flow
- `packages/core/src/llm/types.ts` — add `RetryConfig`, `DegradationMode` types
- `packages/core/src/__tests__/llm/RetryPolicy.test.ts` — new tests
- `packages/core/src/__tests__/llm/OfflineDegradation.test.ts` — new tests

**Scope:**
1. Implement `RetryPolicy` — configurable retry strategy per provider:
   - Exponential backoff with jitter (configurable base delay, max delay, max attempts)
   - Retry on: network errors, 429 (rate limit), 500-503 (server errors)
   - No retry on: 401 (auth), 400 (bad request), safety filter blocks
   - Circuit breaker: after N consecutive failures, skip provider for M seconds
2. Implement `OfflineDegradation` — graceful UX when all providers are unavailable:
   - Mode 1 (`QUEUE`): Queue the request and retry when a provider comes back online
   - Mode 2 (`INFORM`): Return a structured message explaining the situation to the user
   - Mode 3 (`CACHED`): Return last cached response for similar prompts (if available)
   - Default mode configurable per world/session
3. Integrate `RetryPolicy` into `ProviderFactory` fallback chain execution
4. Emit events on degradation state changes (for UI to display offline indicators)
5. Refactor existing `OllamaProvider.fetchWithRetry()` to use shared `RetryPolicy`

**Acceptance Criteria:**
- [ ] `RetryPolicy` supports exponential backoff with configurable jitter
- [ ] Retry skips non-retryable errors (401, 400, safety blocks)
- [ ] Circuit breaker opens after configurable failure threshold
- [ ] Circuit breaker auto-resets after configurable cooldown period
- [ ] `OfflineDegradation` QUEUE mode queues requests and retries on provider recovery
- [ ] `OfflineDegradation` INFORM mode returns structured offline message (not a raw error)
- [ ] Degradation state change events emitted for UI consumption
- [ ] OllamaProvider uses shared `RetryPolicy` (no duplicate retry logic)

**Tests:**
- Unit: Exponential backoff delays increase correctly (500ms, 1s, 2s, 4s...)
- Unit: Jitter adds randomness to delay (not identical on each attempt)
- Unit: 401 error skips retry, throws immediately
- Unit: 429 error triggers retry with backoff
- Unit: Circuit breaker opens after 5 consecutive failures
- Unit: Circuit breaker resets after cooldown
- Unit: INFORM mode returns user-friendly offline message
- Unit: QUEUE mode stores request and can replay it

---

### 7-09: Token Usage Tracking and Cost Accounting

**Priority:** P1
**Assignee:** Any
**Files:**
- `packages/core/src/llm/TokenTracker.ts` — new: tracks token usage per session/world/agent
- `packages/core/src/llm/types.ts` — add `TokenUsageRecord`, `UsageSummary` types
- `packages/db/src/schema/llm.ts` — new: `llm_token_usage` table schema (if using Drizzle)
- `packages/core/src/__tests__/llm/TokenTracker.test.ts` — new tests

**Scope:**
1. Implement `TokenTracker` — records every LLM call's token usage:
   ```typescript
   interface TokenUsageRecord {
     id: string;
     sessionId: string;
     worldId: string;
     agentId?: string;
     provider: string;
     model: string;
     inputTokens: number;
     outputTokens: number;
     totalTokens: number;
     estimatedCost: number;
     timestamp: Date;
   }
   ```
2. Provide aggregation methods:
   - `getSessionUsage(sessionId)` — total tokens/cost for a session
   - `getWorldUsage(worldId, dateRange?)` — total tokens/cost for a world
   - `getProviderUsage(provider, dateRange?)` — usage breakdown by provider
3. Integrate into `StreamingBridge` and direct `complete()` calls — auto-track after every response
4. Define DB schema for persistent storage (migration script for `llm_token_usage` table)
5. Support usage alerts: configurable thresholds that emit warnings (e.g., "$5 spent this session")

**Acceptance Criteria:**
- [ ] Every LLM call (stream and complete) automatically records a `TokenUsageRecord`
- [ ] `getSessionUsage()` returns accurate totals for a given session
- [ ] `getWorldUsage()` supports date range filtering
- [ ] `getProviderUsage()` breaks down usage by provider name
- [ ] DB schema defined for `llm_token_usage` table with proper indexes
- [ ] Usage alert emitted when configurable cost threshold exceeded
- [ ] Ollama calls tracked with $0 cost (but token counts still recorded)

**Tests:**
- Unit: `TokenTracker.record()` stores a usage record
- Unit: `getSessionUsage()` sums multiple records for same session
- Unit: `getWorldUsage()` filters by date range correctly
- Unit: `getProviderUsage()` groups by provider
- Unit: Alert emitted when threshold exceeded
- Unit: Alert NOT emitted when below threshold

---

### 7-10: Rate Limiting and Backoff Service

**Priority:** P2
**Assignee:** Any
**Feature IDs:** AI-07
**Depends on:** 7-09
**Files:**
- `packages/core/src/llm/RateLimiter.ts` — new: per-provider rate limiting
- `packages/core/src/llm/types.ts` — add `RateLimitConfig`, `RateLimitState` types
- `packages/core/src/__tests__/llm/RateLimiter.test.ts` — new tests

**Scope:**
1. Implement `RateLimiter` — per-provider request throttling:
   - Token bucket algorithm (configurable tokens per minute, burst capacity)
   - Default limits per provider:
     - Ollama: unlimited (local)
     - OpenAI: 60 RPM, 150K TPM (Tier 1 defaults)
     - Anthropic: 60 RPM, 100K TPM
     - Google: 60 RPM, 1M TPM
     - DeepSeek: 60 RPM, 100K TPM
   - Limits configurable per-provider via `ProviderConfig`
2. Rate limiter returns wait time when limit exceeded (doesn't silently drop)
3. Integrate with `ProviderFactory` — check rate limit before dispatching to provider
4. Parse and respect `Retry-After` and `x-ratelimit-*` headers from provider responses
5. Track remaining quota from response headers and proactively slow down before hitting limits

**Acceptance Criteria:**
- [ ] Token bucket algorithm correctly limits requests per minute
- [ ] Burst capacity allows short bursts above sustained rate
- [ ] Rate limit exceeded returns `{ allowed: false, retryAfter: number }` (not a throw)
- [ ] Ollama rate limiter always returns `allowed: true`
- [ ] Provider-specific defaults applied when no custom config provided
- [ ] `Retry-After` header from provider response respected
- [ ] Remaining quota tracked from response headers

**Tests:**
- Unit: Token bucket allows requests within limit
- Unit: Token bucket rejects requests exceeding limit
- Unit: Burst capacity allows short-term excess
- Unit: Token bucket refills over time
- Unit: Ollama limiter always allows
- Unit: `Retry-After` header parsing works for seconds and date formats
- Unit: Rate limit state serializable (for persistence across restarts)

---

### 7-11: Per-Session Model Selector (IPC + UI Contract)

**Priority:** P2
**Assignee:** Any
**Feature IDs:** AI-09
**Depends on:** 7-05
**Files:**
- `packages/core/src/llm/ModelSelector.ts` — new: model selection logic
- `apps/electron/src/ipc/llmHandlers.ts` — new: IPC handlers for model selection
- `apps/electron/src/ipc/channels.ts` — add LLM channel constants
- `packages/core/src/llm/types.ts` — add `ModelInfo`, `ModelSelectorState` types
- `packages/core/src/__tests__/llm/ModelSelector.test.ts` — new tests

**Scope:**
1. Implement `ModelSelector` — resolves the effective model for a session:
   - Priority: explicit user override > agent model preference > session-class default > world default
   - Returns `ModelInfo` with provider, model name, display name, capabilities
2. Add IPC handlers for model management:
   - `llm:list-models` — returns all available models across all providers
   - `llm:get-active-model` — returns the currently selected model for a session
   - `llm:set-model` — override model for current session
   - `llm:get-provider-status` — returns online/offline status per provider
3. Define `ModelInfo` type for UI consumption:
   ```typescript
   interface ModelInfo {
     provider: string;
     modelId: string;
     displayName: string;
     isLocal: boolean;
     contextWindow: number;
     capabilities: ('chat' | 'reasoning' | 'code' | 'vision')[];
     costTier: 'free' | 'low' | 'medium' | 'high';
   }
   ```
4. Add model metadata registry — static list of known models with capabilities and context windows
5. Validate model selection against session constraints (e.g., THIN sessions cannot select cloud models)

**Acceptance Criteria:**
- [ ] `ModelSelector` resolves effective model following priority chain
- [ ] `llm:list-models` IPC handler returns models from all registered providers
- [ ] `llm:set-model` overrides model for the specified session only
- [ ] `llm:get-provider-status` returns per-provider online/offline status
- [ ] `ModelInfo` includes `isLocal`, `contextWindow`, `capabilities`, and `costTier`
- [ ] THIN session model override to cloud provider rejected with error
- [ ] Model metadata registry contains entries for all supported models

**Tests:**
- Unit: Model resolution follows priority chain (override > agent pref > default)
- Unit: THIN session rejects cloud model selection
- Unit: `listModels()` aggregates models from all providers
- Unit: Unknown model ID returns error (not a crash)
- Unit: Model metadata lookup returns correct context window and capabilities

---

### 7-12: Phase 7 Integration Tests (Multi-Provider, Streaming, Offline)

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL above
**Files:**
- `packages/core/src/__tests__/integration/phase7.test.ts` — new integration test suite
- `packages/core/src/__tests__/integration/phase7-streaming.test.ts` — streaming-specific tests
- `packages/core/src/__tests__/integration/phase7-offline.test.ts` — offline degradation tests

**Scope:**
Comprehensive tests validating Phase 7 exit criteria:

1. **Provider Lifecycle:** Create provider via factory → complete a request → verify response structure
2. **Fallback Chain:** Mock Ollama offline → verify factory falls back to next provider in chain
3. **Full Fallback Exhaustion:** Mock all providers offline → verify `AllProvidersFailed` with all attempts listed
4. **Streaming End-to-End:** Provider streams tokens → StreamingBridge forwards to mock WebSocket → verify all messages received in order
5. **System Prompt Assembly:** Build system prompt from Telos + SIE + Context → verify all sections present and within token budget
6. **Token Tracking:** Execute multiple LLM calls → verify `TokenTracker` records accurate totals
7. **Rate Limiting:** Exceed rate limit → verify request queued/rejected with retry-after
8. **Offline Degradation:** All providers offline → verify INFORM mode returns structured message (not raw error)
9. **Model Selection:** Set per-session model override → verify override used for LLM call
10. **Local-First Enforcement:** THIN session with cloud override → verify rejection
11. **Cancellation:** Start streaming → cancel mid-stream → verify partial response and clean shutdown
12. **Concurrent Sessions:** Two sessions streaming simultaneously → verify tokens routed to correct sessions

**Acceptance Criteria:**
- [ ] All integration tests pass with mocked providers
- [ ] Fallback chain tested with 2+ providers offline
- [ ] Streaming messages arrive in correct order (`start` → `token`* → `done`)
- [ ] Token tracking totals match actual token usage across multiple calls
- [ ] Offline degradation produces user-friendly messages (not stack traces)
- [ ] Local-first enforcement verified for THIN sessions
- [ ] Concurrent session isolation verified (no token cross-contamination)

**Tests:**
- This IS the test suite. 20-25 test cases covering all Phase 7 deliverables.

---

## Parallel Execution Guide

```
Track A (Providers):        7-02, 7-03, 7-04 (all independent) → 7-05 (needs 7-03, 7-04)
Track B (Architecture):     7-01 → 7-06 (needs 7-01)
Track C (Streaming):        7-07 (independent)
Track D (Resilience):       7-08 (needs 7-05) → 7-10 (needs 7-09)
Track E (Tracking):         7-09 (independent)

Convergence:                7-11 (needs 7-05)
Final:                      7-12 (needs ALL)
```

**Optimal parallel schedule (3 agents):**

| Sprint | Agent 1 | Agent 2 | Agent 3 |
|--------|---------|---------|---------|
| 1 (6h) | 7-01 (3h) + 7-06 start (3h) | 7-02 (3h) + 7-03 (3h) | 7-07 (4h) + 7-09 start (2h) |
| 2 (6h) | 7-06 finish (1h) + 7-04 (3h) | 7-05 (3h) + 7-08 (3h) | 7-09 finish (1h) + 7-10 (3h) + 7-11 start (2h) |
| 3 (5h) | 7-12 integration tests (4h) | 7-11 finish (1h) + 7-12 support | Bug fixes and coverage gaps |

**Maximum parallelism:** 3 agents — Tracks A+B can merge after Sprint 1, Track C is fully independent, Track D+E merge for Sprint 2.
