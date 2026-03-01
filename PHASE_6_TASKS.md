# Phase 6 — Dispatcher, Routing & Spines (POST-MVP OPTIMIZATION)

**Parent:** [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) v2.0, Phase 6
**Goal:** Implement cost-optimized knowledge routing with Spines for 80%+ cost reduction. All execution flows through Dispatch -> Assemble -> Execute using Spines instead of raw L3 data.
**Depends on:** Phase 2 (basic Context Assembly), Phase 3 (Worlds), Phase 4 (Agents), Phase 5 (Patterns)
**Exit Criteria:** All execution flows through Dispatch -> Assemble -> Execute using Spines for 80%+ cost reduction.

> **POST-MVP Note:** Basic Context Assembly ships with MVP as part of Phase 2. This phase implements the full Spines optimization system (80%+ cost reduction) which is critical for scale but not required for first users.

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Dispatcher pipeline | SCAFFOLDED | Gate -> Route -> Assemble -> Execute exists; budget/permission checks are placeholder |
| DispatchGate | SCAFFOLDED | Session state + empty query checks only; no budget, no world permissions |
| ContextAssembler | SCAFFOLDED | Assembles L1/L2/L3 into prompt string; hardcoded 1k token spine limit |
| SpineGenerator | SCAFFOLDED | Heuristic keyword extraction + truncation summary; no dedup, no relevance scoring |
| Dispatcher types | IMPLEMENTED | DispatchContext, DispatchResult, DispatchGateResult, Spine interfaces defined |
| Session class determination | MISSING | SessionClass type exists in `llm/types.ts` but no intelligence to classify requests |
| Background Indexing | MISSING | No watcher, no automatic spine regeneration |
| Cost estimation engine | MISSING | LLMProvider has `estimateCost()` but no pre-dispatch estimation pipeline |
| Model tier selection | PARTIAL | ProviderFactory routes by SessionClass but Dispatcher does not drive it |
| Pattern selection assistance | MISSING | No intent analysis or pattern recommendation |
| Agent role assignment | MISSING | AgentProfile has `role` field but no matching logic |

---

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 6-01 | Harden Dispatch Gate with real permission and budget checks | 4h | -- | TODO |
| 6-02 | Implement intelligent Session Class determination | 3h | -- | TODO |
| 6-03 | Enhance SpineGenerator with deduplication and relevance scoring | 4h | -- | TODO |
| 6-04 | Build Background Indexing service | 4h | 6-03 | TODO |
| 6-05 | Implement pre-dispatch Cost Estimation engine | 3h | 6-02 | TODO |
| 6-06 | Implement model tier selection with local-first routing | 3h | 6-02, 6-05 | TODO |
| 6-07 | Implement Pattern Selection assistance | 3h | 6-03 | TODO |
| 6-08 | Implement Agent Role assignment | 3h | 6-07 | TODO |
| 6-09 | Upgrade ContextAssembler to Spine-first assembly with token budgeting | 4h | 6-03, 6-05 | TODO |
| 6-10 | Full Dispatch -> Assemble -> Execute pipeline integration tests | 4h | ALL | TODO |

**Total estimated effort:** ~35 hours

---

## Task Details

### 6-01: Harden Dispatch Gate with Real Permission and Budget Checks

**Priority:** P0
**Assignee:** Any
**Feature ID:** CE-08
**Files:**
- `packages/core/src/dispatcher/DispatchGate.ts` -- enhance existing gate
- `packages/core/src/dispatcher/types.ts` -- add BudgetContext, WorldPermissions interfaces
- `packages/core/src/dispatcher/BudgetTracker.ts` -- new file for token budget tracking
- `packages/core/src/__tests__/dispatcher/dispatch-gate.test.ts` -- new tests

**Scope:**
Currently the DispatchGate only checks session state and empty queries. Harden it with real enforcement:

1. **World permission checks:** Validate that the requesting user/agent has dispatch rights for the target world. Wire into the governance `A0Enforcer` for authorization.
2. **Budget validation:** Implement `BudgetTracker` that maintains per-world and per-session token budgets. Gate rejects requests when budget is exhausted.
3. **Rate limiting:** Prevent rapid-fire dispatch requests (configurable threshold, e.g., max 10 dispatches per minute per session).
4. **Query complexity check:** Reject queries that exceed maximum input length (configurable, default 10k chars).
5. **Structured gate result:** Expand `DispatchGateResult` with `budgetRemaining`, `estimatedCost`, and `gateChecks` details.

**Acceptance Criteria:**
- [ ] Gate rejects dispatch when world token budget is exhausted
- [ ] Gate rejects dispatch when session budget limit is reached
- [ ] Gate rejects dispatch when user lacks world-level dispatch permission
- [ ] Gate rejects queries exceeding configured maximum input length
- [ ] Gate enforces rate limiting (configurable dispatches per minute)
- [ ] `DispatchGateResult` includes structured breakdown of all checks performed
- [ ] All rejections produce human-readable reason strings with specific violation details
- [ ] Gate integrates with `A0Enforcer` for governance-level authorization

**Tests:**
- Unit: Budget exhaustion blocks dispatch
- Unit: Session rate limit triggers after threshold exceeded
- Unit: Query exceeding max length rejected
- Unit: Valid request with remaining budget passes all checks
- Unit: Gate result includes budget remaining and check details
- Unit: World permission denial from A0Enforcer propagates correctly

---

### 6-02: Implement Intelligent Session Class Determination

**Priority:** P0
**Assignee:** Any
**Feature ID:** CE-07
**Files:**
- `packages/core/src/dispatcher/SessionClassifier.ts` -- new file
- `packages/core/src/dispatcher/types.ts` -- add SessionClassificationResult, ComplexitySignals interfaces
- `packages/core/src/__tests__/dispatcher/session-classifier.test.ts` -- new tests

**Scope:**
The `SessionClass` type (`THIN | STANDARD | DEEP`) exists but nothing determines it intelligently. Build a classifier that analyzes request characteristics to determine session class:

1. **THIN:** Simple queries, single-turn, low knowledge requirements. Examples: factual lookups, confirmations, status checks. Routed to local models only.
2. **STANDARD:** Multi-step reasoning, moderate knowledge needs, typical user interactions. Routed to local-first with cloud fallback.
3. **DEEP:** Complex analysis, creative generation, multi-agent coordination, large context. Routed to cloud-preferred (Anthropic > OpenAI).

**Classification signals:**
- Query length and linguistic complexity (sentence count, clause depth)
- Presence of multi-step indicators ("first... then... finally...")
- Knowledge breadth required (number of L3 domains referenced)
- Historical session pattern (escalation from THIN to DEEP)
- Explicit user override (always respected)
- Agent mode requirements (some modes mandate DEEP)

**Acceptance Criteria:**
- [ ] `SessionClassifier.classify(context, sessionHistory)` returns `SessionClassificationResult`
- [ ] Short, simple queries classify as THIN
- [ ] Multi-step queries with moderate knowledge needs classify as STANDARD
- [ ] Complex queries requiring large context or creative reasoning classify as DEEP
- [ ] Explicit user override in `DispatchContext.modelPreference` takes precedence
- [ ] Agent modes that require deep reasoning force DEEP classification
- [ ] Classification result includes confidence score and reasoning
- [ ] Classification is deterministic for the same inputs

**Tests:**
- Unit: "What time is it?" classifies as THIN
- Unit: "Analyze this code and suggest improvements" classifies as STANDARD
- Unit: "Design a distributed system architecture considering..." classifies as DEEP
- Unit: Explicit model preference overrides classification
- Unit: Agent mode "Deep Dive Mode" forces DEEP
- Unit: Confidence score is between 0 and 1

---

### 6-03: Enhance SpineGenerator with Deduplication and Relevance Scoring

**Priority:** P0
**Assignee:** Any
**Feature ID:** CE-10
**Files:**
- `packages/core/src/dispatcher/SpineGenerator.ts` -- enhance existing
- `packages/core/src/dispatcher/SpineIndex.ts` -- new file for spine indexing and deduplication
- `packages/core/src/dispatcher/types.ts` -- add ScoredSpine, SpineMetadata, DeduplicationResult interfaces
- `packages/core/src/__tests__/dispatcher/spine-generator.test.ts` -- new tests
- `packages/core/src/__tests__/dispatcher/spine-index.test.ts` -- new tests

**Scope:**
The current SpineGenerator uses naive keyword extraction (stop-word removal) and truncation for summaries. Upgrade it to produce compact, high-quality, machine-facing representations:

1. **Improved keyword extraction:** Implement TF-IDF-style weighting. Extract n-grams (bigrams) in addition to unigrams. Weight domain-specific terms higher.
2. **Better summarization:** Extract first paragraph + section headers + key entities instead of raw truncation. Preserve structural markers (headings, lists, definitions).
3. **Relevance scoring:** Score each spine against a query using keyword overlap + positional weighting (title terms worth more than body terms). Return `ScoredSpine` with `relevanceScore: number`.
4. **Deduplication:** Detect near-duplicate spines using Jaccard similarity on keyword sets. Merge or discard duplicates, keeping the higher-fidelity version.
5. **Spine metadata:** Track `generatedAt`, `sourceHash` (for change detection), `accessCount` (for LRU eviction), and `averageRelevance` (running score).

**Acceptance Criteria:**
- [ ] Keyword extraction uses TF-IDF weighting and produces bigrams alongside unigrams
- [ ] Summaries preserve section headers and key structural elements
- [ ] `scoreRelevance(spine, query)` returns a normalized 0-1 relevance score
- [ ] Duplicate spines (Jaccard > 0.8) are detected and merged
- [ ] Spine metadata includes `generatedAt`, `sourceHash`, `accessCount`
- [ ] Spines are 80%+ smaller than raw L3 source content
- [ ] Generated spines are deterministic for the same input content

**Tests:**
- Unit: TF-IDF weighting ranks domain-specific terms higher than common terms
- Unit: Bigram extraction captures multi-word concepts (e.g., "session class")
- Unit: Relevance scoring returns higher score for matching query
- Unit: Near-duplicate detection identifies spines with >0.8 Jaccard similarity
- Unit: Merged spine retains keywords from both sources
- Unit: Spine size is less than 20% of original content size

---

### 6-04: Build Background Indexing Service

**Priority:** P1
**Assignee:** Any
**Depends on:** 6-03
**Feature ID:** CE-10
**Files:**
- `packages/core/src/dispatcher/BackgroundIndexer.ts` -- new file
- `packages/core/src/dispatcher/SpineStore.ts` -- new file for spine persistence (in-memory + optional disk cache)
- `packages/core/src/dispatcher/types.ts` -- add IndexingEvent, SpineStoreOptions interfaces
- `packages/core/src/__tests__/dispatcher/background-indexer.test.ts` -- new tests

**Scope:**
Build a background service that watches for L3 knowledge changes and automatically regenerates spines:

1. **Change detection:** Monitor L3 knowledge layer for additions, updates, and deletions. Use source hash comparison (from 6-03) to detect actual content changes vs. metadata-only updates.
2. **Incremental regeneration:** Only regenerate spines for changed content. Do not rebuild the entire spine index on every change.
3. **SpineStore:** In-memory spine cache with optional serialization to disk. Supports `get(id)`, `put(spine)`, `delete(id)`, `getAll()`, `getBySource(sourceId)`.
4. **Dispatch surface maintenance:** After indexing, update a "dispatch surface" — the pre-computed set of spines available for context assembly. Dispatcher reads from this surface, never from raw L3 directly.
5. **Event emission:** Emit `IndexingEvent` on start, progress, completion, and error for UI/logging consumption.
6. **Debouncing:** Batch rapid changes (e.g., multiple file saves) with a configurable debounce window (default 2 seconds).

**Acceptance Criteria:**
- [ ] New L3 content triggers automatic spine generation within debounce window
- [ ] Updated L3 content triggers spine regeneration only for changed content (hash comparison)
- [ ] Deleted L3 content removes corresponding spines from the store
- [ ] SpineStore provides CRUD operations and source-based lookups
- [ ] Dispatch surface is updated atomically after indexing completes
- [ ] Indexing events are emitted for monitoring (start, progress, complete, error)
- [ ] Debouncing batches rapid changes into a single indexing pass
- [ ] Indexer does not block the main dispatch pipeline

**Tests:**
- Unit: New content triggers spine generation
- Unit: Content update with same hash skips regeneration
- Unit: Content update with different hash triggers regeneration
- Unit: Deleted content removes spine from store
- Unit: Debounce batches multiple changes into one indexing pass
- Unit: SpineStore CRUD operations (put, get, delete, getAll)
- Integration: L3 change -> indexer -> updated spine store -> assembler reads new spine

---

### 6-05: Implement Pre-Dispatch Cost Estimation Engine

**Priority:** P1
**Assignee:** Any
**Depends on:** 6-02
**Feature ID:** CE-06
**Files:**
- `packages/core/src/dispatcher/CostEstimator.ts` -- new file
- `packages/core/src/dispatcher/types.ts` -- add DispatchCostEstimate, ModelPricing interfaces
- `packages/core/src/__tests__/dispatcher/cost-estimator.test.ts` -- new tests

**Scope:**
Build a cost estimation engine that predicts the token usage and dollar cost of a dispatch *before* execution, enabling budget-aware routing:

1. **Token estimation:** Estimate input tokens from assembled context size (system prompt + spines + history + query). Estimate output tokens from session class heuristic (THIN: ~200, STANDARD: ~800, DEEP: ~2000).
2. **Model pricing table:** Maintain a configurable pricing table for known models (Ollama: $0, GPT-4o: $5/$15 per 1M tokens, Claude: $15/$75 per 1M tokens, etc.). Load from JSON config.
3. **Cost calculation:** `estimate(assembledContext, sessionClass, targetModel) -> DispatchCostEstimate` returns `{ inputTokens, outputTokens, estimatedCost, model, confidence }`.
4. **Budget check integration:** Cost estimate feeds into DispatchGate (6-01) for budget validation. Gate can reject if estimated cost exceeds remaining budget.
5. **Cost tracking:** After execution completes, record actual vs. estimated cost for calibration. Track running totals per session and per world.

**Acceptance Criteria:**
- [ ] `CostEstimator.estimate()` returns input/output token estimates and dollar cost
- [ ] Ollama models estimate as $0.00 cost
- [ ] Cloud model estimates use configurable pricing table
- [ ] THIN sessions estimate lower output tokens than DEEP sessions
- [ ] Estimation confidence score reflects how reliable the estimate is
- [ ] `recordActual()` stores actual cost and adjusts calibration factor
- [ ] Running cost totals available per session and per world
- [ ] Pricing table is configurable via JSON (not hardcoded)

**Tests:**
- Unit: Ollama cost estimate is $0
- Unit: GPT-4o estimate uses correct per-token pricing
- Unit: THIN session estimates fewer output tokens than DEEP
- Unit: Confidence score decreases for very short or very long inputs
- Unit: Actual cost recording updates running totals
- Unit: Custom pricing table overrides defaults

---

### 6-06: Implement Model Tier Selection with Local-First Routing

**Priority:** P1
**Assignee:** Any
**Depends on:** 6-02, 6-05
**Feature ID:** CE-06
**Files:**
- `packages/core/src/dispatcher/ModelSelector.ts` -- new file
- `packages/core/src/dispatcher/types.ts` -- add ModelSelection, FallbackChain interfaces
- `packages/core/src/__tests__/dispatcher/model-selector.test.ts` -- new tests

**Scope:**
Create a model selection module that sits between SessionClassifier and ProviderFactory, incorporating cost awareness and local-first routing:

1. **Local-first principle:** Always prefer local models (Ollama) when they can handle the request. Only escalate to cloud when local models are insufficient or unavailable.
2. **Fallback chains:** Define ordered fallback chains per session class:
   - THIN: `ollama:phi-3 -> ollama:qwen2.5:7b` (local only, fail if none available)
   - STANDARD: `ollama:qwen2.5:14b -> ollama:llama3 -> openai:gpt-4o-mini`
   - DEEP: `anthropic:claude-3.5-sonnet -> openai:gpt-4o -> ollama:qwen2.5:32b`
3. **Budget-aware selection:** If estimated cost for preferred model exceeds remaining budget, downgrade to cheaper model. Never exceed budget silently.
4. **Availability probing:** Check model availability before selection (integrate with existing `LLMProvider.isAvailable()`).
5. **Selection result:** Return `ModelSelection` with `{ model, provider, fallbacksAttempted, reason, estimatedCost }`.

**Acceptance Criteria:**
- [ ] THIN sessions only select local models; never escalate to cloud
- [ ] STANDARD sessions try local first, fall back to cloud if local unavailable
- [ ] DEEP sessions prefer cloud but fall back to large local models
- [ ] Budget-constrained selection downgrades to cheaper model instead of failing
- [ ] Unavailable providers are skipped with logged reason
- [ ] Selection result includes rationale for the chosen model
- [ ] Fallback chains are configurable (not hardcoded)
- [ ] Agent-specific model preferences (from `AgentModelPreferences`) are respected when set

**Tests:**
- Unit: THIN session selects Ollama model
- Unit: STANDARD session falls back to OpenAI when Ollama offline
- Unit: DEEP session selects Anthropic first
- Unit: Budget exhaustion forces downgrade from GPT-4o to GPT-4o-mini
- Unit: Agent model preference overrides default chain
- Unit: All providers offline throws AllProvidersFailed
- Unit: Selection result includes fallback attempts and reason

---

### 6-07: Implement Pattern Selection Assistance

**Priority:** P2
**Assignee:** Any
**Depends on:** 6-03
**Feature ID:** CE-06
**Files:**
- `packages/core/src/dispatcher/PatternMatcher.ts` -- new file
- `packages/core/src/dispatcher/types.ts` -- add PatternRecommendation, IntentSignal interfaces
- `packages/core/src/__tests__/dispatcher/pattern-matcher.test.ts` -- new tests

**Scope:**
Build a module that analyzes user intent and recommends appropriate patterns from the PatternRegistry:

1. **Intent analysis:** Extract intent signals from the user query: action verbs, domain references, complexity indicators, explicit pattern requests.
2. **Pattern scoring:** Score each registered pattern against the extracted intent signals. Use keyword overlap between pattern description/tags and query intent.
3. **Recommendation ranking:** Return top-N pattern recommendations (default 3) with confidence scores. If no pattern scores above threshold (0.3), return empty (indicating freeform execution).
4. **Primacy awareness:** If the session is in PRIMACY state, always recommend the Primacy Expansion pattern first regardless of query content.
5. **History-aware:** Consider recent pattern usage in the session to avoid redundant recommendations and support multi-step workflows.

**Acceptance Criteria:**
- [ ] `PatternMatcher.recommend(query, registeredPatterns, sessionContext)` returns ranked `PatternRecommendation[]`
- [ ] Recommendations include confidence score (0-1) and match rationale
- [ ] PRIMACY state always returns Primacy Expansion pattern as top recommendation
- [ ] Queries with no pattern match return empty array (freeform mode)
- [ ] Recent pattern history influences recommendations (no redundant suggestions)
- [ ] Explicit pattern name in query (e.g., "use the Review pattern") returns exact match
- [ ] Maximum of N recommendations returned (configurable, default 3)

**Tests:**
- Unit: Query mentioning "review" scores Review pattern highest
- Unit: PRIMACY state returns Primacy Expansion pattern first
- Unit: Unrelated query returns empty recommendations
- Unit: Explicit pattern name request returns exact match with confidence 1.0
- Unit: Recently used pattern deprioritized in recommendations
- Unit: Confidence scores are normalized between 0 and 1

---

### 6-08: Implement Agent Role Assignment

**Priority:** P2
**Assignee:** Any
**Depends on:** 6-07
**Feature ID:** CE-06
**Files:**
- `packages/core/src/dispatcher/AgentAssigner.ts` -- new file
- `packages/core/src/dispatcher/types.ts` -- add AgentAssignment, CapabilityMatch interfaces
- `packages/core/src/__tests__/dispatcher/agent-assigner.test.ts` -- new tests

**Scope:**
Build a module that matches incoming dispatch requests to the most appropriate agent based on capabilities, roles, and current load:

1. **Capability matching:** Compare task requirements (derived from query intent + pattern) against agent profiles (role, description, tools, modes). Score each agent on capability fit.
2. **Role constraints:** Respect agent role bounds — an agent assigned as "Reviewer" should not be dispatched for "Code Generation" tasks unless no better match exists.
3. **Load balancing:** If multiple agents match equally, prefer the one with fewer active dispatches (avoid overloading a single agent).
4. **Default agent:** If no specialized agent matches, fall back to a "General" agent or the world's default agent.
5. **Assignment result:** Return `AgentAssignment` with `{ agentId, confidence, matchedCapabilities, reason }`.

**Acceptance Criteria:**
- [ ] `AgentAssigner.assign(context, availableAgents, pattern?)` returns `AgentAssignment`
- [ ] Agent with matching role scores highest (e.g., "Architect" agent for architecture queries)
- [ ] Agent role constraints prevent mismatched assignments
- [ ] Load balancing distributes work across equally capable agents
- [ ] Default/fallback agent used when no specialized match found
- [ ] Assignment includes confidence score and rationale
- [ ] Pattern-specific agent requirements (if defined) take precedence

**Tests:**
- Unit: Architecture query assigns "Architect" agent over "Reviewer" agent
- Unit: Review query assigns "Reviewer" agent
- Unit: No matching role falls back to default agent
- Unit: Equal-capability agents balanced by current load
- Unit: Pattern with required agent role forces that role
- Unit: Assignment confidence is higher for exact role match than fuzzy match

---

### 6-09: Upgrade ContextAssembler to Spine-First Assembly with Token Budgeting

**Priority:** P0
**Assignee:** Any
**Depends on:** 6-03, 6-05
**Feature ID:** ED-01
**Files:**
- `packages/core/src/dispatcher/ContextAssembler.ts` -- rewrite existing
- `packages/core/src/dispatcher/types.ts` -- add AssemblyPlan, TokenBudget, AssemblyMetrics interfaces
- `packages/core/src/__tests__/dispatcher/context-assembler.test.ts` -- new tests

**Scope:**
The current ContextAssembler has a hardcoded 4k context limit and 1k spine limit. Rewrite it with intelligent, budget-aware assembly that prioritizes Spines over raw L3:

1. **Token budget allocation:** Divide available context window into budgets:
   - System prompt: 15% (reserved, non-negotiable)
   - L1 Active Memory: 20% (high priority, recent state)
   - L2 History: 25% (conversation continuity)
   - L3 Spines: 30% (knowledge, ranked by relevance)
   - User Query: 10% (always included in full)
   Budget percentages configurable per session class.
2. **Spine-first assembly:** Use `ScoredSpine` relevance scores (from 6-03) to select spines. Fill the L3 budget with highest-scoring spines first. Never include raw L3 content when a spine exists.
3. **Overflow handling:** If any section exceeds its budget, truncate from lowest-priority content. L1 > L2 > L3 priority order preserved.
4. **Assembly plan:** Before assembling, generate an `AssemblyPlan` that describes what will be included and what was excluded, with reasons. Useful for debugging and transparency.
5. **Assembly metrics:** Track `{ totalTokens, spineTokens, rawTokens, compressionRatio, excludedItems }` for cost analysis.

**Acceptance Criteria:**
- [ ] Context assembly respects configurable token budget per section
- [ ] Spines are selected by relevance score (highest first)
- [ ] Raw L3 content is never included when a spine exists for that source
- [ ] Overflow truncates lowest-priority content first
- [ ] `AssemblyPlan` generated before assembly with inclusion/exclusion details
- [ ] `AssemblyMetrics` reports compression ratio (target: 80%+ reduction vs. raw)
- [ ] User query is always included in full (never truncated)
- [ ] Budget percentages vary by session class (THIN gets smaller budgets overall)

**Tests:**
- Unit: Assembly respects total token budget (never exceeds)
- Unit: Higher relevance spines included before lower relevance
- Unit: Raw L3 excluded when spine exists for same source
- Unit: User query always present in assembled output
- Unit: Overflow truncation removes lowest-priority content
- Unit: AssemblyPlan lists excluded items with reasons
- Unit: Compression ratio exceeds 80% for typical L3 content
- Unit: THIN session class uses smaller budget allocation than DEEP

---

### 6-10: Full Dispatch -> Assemble -> Execute Pipeline Integration Tests

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL above
**Feature ID:** CE-06, CE-07, CE-08, CE-10, ED-01
**Files:**
- `packages/core/src/__tests__/dispatcher/pipeline-integration.test.ts` -- new integration test suite
- `packages/core/src/__tests__/dispatcher/cost-tracking-integration.test.ts` -- cost tracking tests
- `packages/core/src/dispatcher/index.ts` -- barrel export for all dispatcher modules

**Scope:**
Comprehensive integration tests validating the complete Phase 6 pipeline and exit criteria:

1. **End-to-end dispatch:** Submit a query -> Gate checks -> Session classification -> Cost estimation -> Model selection -> Spine selection -> Context assembly -> Execute (mocked LLM). Verify every stage produces correct output.
2. **Session class routing:** Submit THIN, STANDARD, and DEEP queries and verify correct model routing for each.
3. **Budget enforcement:** Submit dispatches until budget exhaustion and verify gate blocks further requests with clear error.
4. **Spine cost reduction:** Measure assembled context size with spines vs. hypothetical raw L3 assembly and verify 80%+ reduction.
5. **Pattern + Agent coordination:** Submit a query that matches a pattern, verify correct pattern recommendation and agent assignment, then verify assembly includes pattern-specific context.
6. **Fallback chain:** Simulate provider failures and verify graceful fallback through the model selection chain.
7. **Background indexing round-trip:** Add L3 content -> verify indexer generates spine -> dispatch query -> verify spine used in assembly.

**Acceptance Criteria:**
- [ ] End-to-end pipeline test passes (Gate -> Classify -> Estimate -> Select -> Assemble -> Execute)
- [ ] THIN/STANDARD/DEEP routing verified with correct model selection for each
- [ ] Budget exhaustion blocks dispatch with informative error
- [ ] Spine-based assembly achieves 80%+ cost reduction vs. raw L3
- [ ] Pattern recommendation + agent assignment integrated into dispatch pipeline
- [ ] Provider fallback chain handles single and multiple provider failures
- [ ] Background indexing -> dispatch -> spine used in assembly round-trip works
- [ ] All dispatch results include complete metadata (tokens, model, cost, duration)
- [ ] Barrel export (`index.ts`) exports all public dispatcher APIs

**Tests:**
This IS the integration test suite. 20-25 test cases covering:
- Full pipeline happy path (THIN, STANDARD, DEEP)
- Gate rejection scenarios (budget, permissions, rate limit)
- Cost estimation accuracy (estimate vs. mock actual)
- Spine selection and assembly (relevance ordering, dedup)
- Pattern matching and agent assignment
- Model fallback chains (1 failure, all failure)
- Background indexing round-trip
- Concurrent dispatch handling
- Error propagation through pipeline stages

---

## Parallel Execution Guide

```
Track A (Spines & Indexing):      6-03 (SpineGenerator) -> 6-04 (Background Indexing)
Track B (Classification & Cost):  6-02 (SessionClassifier) -> 6-05 (CostEstimator) -> 6-06 (ModelSelector)
Track C (Gate Hardening):         6-01 (DispatchGate)

Convergence A+B:                  6-09 (ContextAssembler rewrite, needs 6-03 + 6-05)
Post-Track A:                     6-07 (PatternMatcher, needs 6-03) -> 6-08 (AgentAssigner, needs 6-07)
Final:                            6-10 (Integration tests, needs ALL)
```

**Maximum parallelism:** 3 agents -- one per track (A, B, C).

**Suggested execution order for a single developer:**
1. Start with 6-01, 6-02, 6-03 (all independent)
2. Then 6-04 and 6-05 (depend on 6-03 and 6-02 respectively)
3. Then 6-06, 6-07 in parallel
4. Then 6-08, 6-09
5. Finish with 6-10
