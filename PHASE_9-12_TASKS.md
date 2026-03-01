# Phases 9-12 — Post-MVP Operational Hardening

**Parent:** [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) v2.0, Phases 9-12
**Goal:** Harden the system for real-world operation: security/privacy, cost governance, tool sandboxing, and data portability.
**Depends on:** Phase 7 (LLM Integration), Phase 8 (UI Shell), Phase 4 (Basic Tool Primitives), Phase 1 (Governance)
**Exit Criteria:** Sensitive data cannot leak, budgets are enforced, tools are sandboxed, and all system behavior is exportable and explainable.

> **Note:** Some Phase 9 security work was completed early in Phase 7.5 (security hardening).
> Existing infrastructure: `SecureKeyStore` (Electron safeStorage), WebSocket auth, `A0Enforcer`, `MetaGovernanceService`.

---

## Current State (Pre-Phase 9)

| Component | Status | Notes |
|-----------|--------|-------|
| SecureKeyStore | COMPLETE | `apps/electron/src/services/SecureKeyStore.ts` — encrypts API keys via OS keychain |
| A0Enforcer | SCAFFOLDED | `packages/core/src/governance/a0.ts` — basic gateway, permissive mode, no audit log |
| MetaGovernanceService | SCAFFOLDED | `packages/core/src/governance/meta.ts` — 1 hardcoded rule only |
| WritePermissionMatrix | SCAFFOLDED | `packages/core/src/governance/permissions.ts` — basic type, no runtime enforcement |
| Data Classification | MISSING | No classification system for artifacts or memory |
| Cost Tracking | MISSING | `CostEstimate` type exists in `packages/core/src/llm/types.ts` but no aggregation |
| Tool Registry | MISSING | `AgentTool` type exists in `packages/core/src/agent/types.ts` but no registry |
| Export/Backup | MISSING | No export, backup, or audit trail infrastructure |
| Network Policy | MISSING | No local-only mode or external call gating |

---

# Phase 9 — Security & Privacy

**Goal:** Implement data classification and access controls so sensitive data cannot leak to external models without authorization.
**Depends on:** Phase 7 (LLM integration — need to intercept external calls)
**Feature IDs:** SP-01 through SP-07

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 9-01 | Data Classification System | 4h | — | TODO |
| 9-02 | Classification Tagging for Artifacts & Memory | 3h | 9-01 | TODO |
| 9-03 | Network Policy Enforcement | 4h | 9-01 | TODO |
| 9-04 | Secret Handling & Prompt Scrubbing | 3h | — | TODO |
| 9-05 | A0 Classification Checking on External Calls | 4h | 9-01, 9-03 | TODO |
| 9-06 | Per-World Filesystem Sandboxing | 3h | — | TODO |
| 9-07 | Workspace Passphrase & Command Allowlisting | 3h | 9-06 | TODO |

**Phase 9 estimated effort:** ~24 hours

---

## Task Details

### 9-01: Data Classification System

**Priority:** P0
**Feature:** SP-01
**Assignee:** Any
**Files:**
- `packages/core/src/security/classification.ts` — new: `DataClassification` enum, `ClassificationPolicy`, `ClassificationEngine`
- `packages/core/src/security/types.ts` — new: all security-related types
- `packages/core/src/security/index.ts` — new: barrel export
- `packages/core/src/__tests__/security/classification.test.ts` — new tests

**Scope:**
1. Define the four classification levels as an ordered enum:
   - `PRIVATE_LOCAL` — never leaves the machine under any circumstances
   - `SHARED_LOCAL` — shareable between local Worlds, never external
   - `EXTERNAL_OK` — may be sent to external LLM providers
   - `ANONYMIZED` — stripped of PII, safe for any destination
2. Create `ClassificationPolicy` interface: rules mapping data types/patterns to classification levels
3. Create `ClassificationEngine` that evaluates data against policies:
   - `classify(data: string, context: ClassificationContext): DataClassification`
   - `isAllowedForDestination(classification: DataClassification, destination: Destination): boolean`
4. Default policy: all data is `PRIVATE_LOCAL` unless explicitly reclassified (Silence by Default mandate)
5. Support regex-based pattern detection for secrets (API keys, tokens, passwords)

**Acceptance Criteria:**
- [ ] `DataClassification` enum with all 4 levels defined and ordered
- [ ] `ClassificationEngine.classify()` returns `PRIVATE_LOCAL` by default
- [ ] Pattern-based detection flags API key patterns as `PRIVATE_LOCAL`
- [ ] `isAllowedForDestination()` correctly gates `PRIVATE_LOCAL` data from external destinations
- [ ] Classification policies are loadable from JSON configuration
- [ ] All types are strictly typed (no `any`)

**Tests:**
- Unit: Default classification is `PRIVATE_LOCAL`
- Unit: Known secret patterns (API keys, tokens) classified as `PRIVATE_LOCAL`
- Unit: Explicitly tagged `EXTERNAL_OK` data passes external destination check
- Unit: `PRIVATE_LOCAL` data blocked from external destinations
- Unit: Policy loading from JSON produces correct engine behavior

---

### 9-02: Classification Tagging for Artifacts & Memory

**Priority:** P1
**Feature:** SP-02
**Assignee:** Any
**Depends on:** 9-01
**Files:**
- `packages/db/src/schema/memory.ts` — add `classification` column to relevant tables
- `packages/db/src/schema/world.ts` — add `default_classification` to world config
- `packages/core/src/memory/layers.ts` — wire classification into layer read/write
- `packages/core/src/security/ClassificationTagger.ts` — new: auto-tagging service
- `packages/core/src/__tests__/security/tagger.test.ts` — new tests

**Scope:**
1. Add `classification TEXT DEFAULT 'PRIVATE_LOCAL'` column to `session_summaries`, `decisions`, `world_config`, and `agent_profiles` tables via migration
2. Create `ClassificationTagger` service that auto-tags new data on write:
   - Uses `ClassificationEngine` to scan content
   - Applies the most restrictive classification found
   - Operator can override (upgrade only — never downgrade without explicit action)
3. Wire tagging into memory layer write paths (L2 append, L3 write)
4. Add `default_classification` to World config — all data in that World inherits this unless overridden
5. Provide `reclassify(entityId, newClassification, operatorAuth)` for manual adjustment

**Acceptance Criteria:**
- [ ] New memory writes automatically receive a classification tag
- [ ] World-level default classification is respected
- [ ] Auto-tagger detects secrets in content and forces `PRIVATE_LOCAL`
- [ ] `reclassify()` requires operator authorization for downgrades (less restrictive)
- [ ] `reclassify()` allows upgrades (more restrictive) without authorization
- [ ] DB migration applies cleanly without data loss

**Tests:**
- Unit: New L2 append receives default classification
- Unit: Content containing API key pattern forces `PRIVATE_LOCAL` regardless of World default
- Unit: Reclassify to less restrictive without auth throws `PermissionDeniedError`
- Unit: Reclassify to more restrictive succeeds without auth
- Integration: Write through memory layer, read back with classification intact

---

### 9-03: Network Policy Enforcement

**Priority:** P0
**Feature:** SP-03
**Assignee:** Any
**Depends on:** 9-01
**Files:**
- `packages/core/src/security/NetworkPolicy.ts` — new: policy engine
- `packages/core/src/security/types.ts` — extend with network policy types
- `packages/core/src/llm/ProviderFactory.ts` — wire policy check before provider creation
- `packages/core/src/__tests__/security/network-policy.test.ts` — new tests

**Scope:**
1. Define `NetworkPolicy` with three modes:
   - `LOCAL_ONLY` — all external network calls blocked; only Ollama/local providers allowed
   - `GATED` — external calls allowed but must pass classification check (default)
   - `UNRESTRICTED` — no network restrictions (development/testing only)
2. Policy is configurable per-World and globally
3. In `GATED` mode, every outbound LLM request is intercepted:
   - The assembled prompt is scanned by `ClassificationEngine`
   - If any `PRIVATE_LOCAL` or `SHARED_LOCAL` data is present, the request is blocked
   - Blocked requests return a structured error with the violation details
4. Wire into `ProviderFactory` — before creating a provider connection, check network policy
5. World-level rules override global only if more restrictive

**Acceptance Criteria:**
- [ ] `LOCAL_ONLY` mode blocks all external provider connections
- [ ] `GATED` mode scans outbound prompts and blocks on classification violation
- [ ] `UNRESTRICTED` mode allows all connections (with a logged warning)
- [ ] World-level policy cannot be less restrictive than global policy
- [ ] Blocked requests include: the classification that triggered blocking, the data pattern matched
- [ ] Policy mode switch requires operator authorization

**Tests:**
- Unit: `LOCAL_ONLY` rejects OpenAI/Anthropic provider creation
- Unit: `LOCAL_ONLY` allows Ollama provider creation
- Unit: `GATED` blocks prompt containing API key pattern
- Unit: `GATED` allows prompt with only `EXTERNAL_OK` data
- Unit: World policy more restrictive than global is honored
- Unit: World policy less restrictive than global is rejected

---

### 9-04: Secret Handling & Prompt Scrubbing

**Priority:** P0
**Feature:** SP-04
**Assignee:** Any
**Files:**
- `packages/core/src/security/PromptScrubber.ts` — new: secret detection and redaction
- `packages/core/src/security/SecretPatterns.ts` — new: regex pattern library
- `packages/core/src/llm/SystemPromptBuilder.ts` — wire scrubber into prompt assembly
- `apps/electron/src/services/SecureKeyStore.ts` — extend with `noEcho` guarantee
- `packages/core/src/__tests__/security/scrubber.test.ts` — new tests

**Scope:**
1. Build `SecretPatterns` — a library of regex patterns for common secrets:
   - API keys (OpenAI `sk-...`, Anthropic `sk-ant-...`, generic `key-...`)
   - Tokens (JWT, bearer tokens)
   - Passwords (common patterns in config files)
   - Connection strings (database URLs with credentials)
   - Private keys (PEM headers)
2. Build `PromptScrubber` that scans any string and:
   - Detects secrets using `SecretPatterns`
   - Replaces them with `[REDACTED:type]` placeholders
   - Returns a `ScrubResult` with: scrubbed text, count of redactions, types found
3. Wire into `SystemPromptBuilder` — all prompts are scrubbed before LLM dispatch
4. Extend `SecureKeyStore` with a `noEcho` flag: retrieved keys are wrapped in a non-serializable container that prevents accidental inclusion in prompts or logs
5. Add scrubber to all logging paths — no secret should appear in console output

**Acceptance Criteria:**
- [ ] `PromptScrubber` detects and redacts OpenAI, Anthropic, and generic API key patterns
- [ ] JWT tokens are detected and redacted
- [ ] Database connection strings with embedded passwords are redacted
- [ ] PEM private key content is detected and redacted
- [ ] `SystemPromptBuilder` output never contains raw secrets
- [ ] `SecureKeyStore.retrieve()` returns wrapped non-serializable value
- [ ] `JSON.stringify()` on a retrieved key produces `[REDACTED]`, not the key value

**Tests:**
- Unit: Each secret pattern type is detected (API keys, JWT, passwords, PEM)
- Unit: Mixed content with secrets is scrubbed, non-secret content preserved
- Unit: Prompt assembly with injected secret produces scrubbed output
- Unit: SecureKeyStore wrapped value resists `JSON.stringify`
- Unit: Multiple secrets in one string all redacted

---

### 9-05: A0 Classification Checking on External Calls

**Priority:** P1
**Feature:** SP-05
**Assignee:** Any
**Depends on:** 9-01, 9-03
**Files:**
- `packages/core/src/governance/a0.ts` — extend with classification enforcement
- `packages/core/src/governance/meta.ts` — add classification-related governance rules
- `packages/core/src/llm/ProviderFactory.ts` — wire A0 check into external call path
- `packages/core/src/security/ExternalCallGate.ts` — new: orchestrates classification + A0 for external calls
- `packages/core/src/__tests__/security/external-call-gate.test.ts` — new tests

**Scope:**
1. Create `ExternalCallGate` — a middleware layer that sits between the dispatcher and LLM providers:
   - Receives the assembled prompt + context metadata
   - Runs `ClassificationEngine` on prompt content
   - Runs `NetworkPolicy` check against destination
   - Calls `A0Enforcer.enforce('external_call', context)` with classification results
   - Only proceeds if all checks pass
2. Add new META governance rules:
   - `CLASSIFICATION_EXTERNAL_BLOCK` — block external calls with `PRIVATE_LOCAL` data
   - `CLASSIFICATION_SHARED_BLOCK` — block external calls with `SHARED_LOCAL` data
   - `EXTERNAL_CALL_AUDIT` — log all external calls regardless of classification
3. A0 audit log now records: destination provider, classification result, allow/deny decision, timestamp
4. Failed checks return a structured `ClassificationViolationError` with remediation hints

**Acceptance Criteria:**
- [ ] Every external LLM call passes through `ExternalCallGate`
- [ ] `PRIVATE_LOCAL` data in prompt triggers A0 block
- [ ] `SHARED_LOCAL` data in prompt triggers A0 block for external providers
- [ ] `EXTERNAL_OK` data passes through cleanly
- [ ] All external calls are logged in A0 audit trail (both allowed and denied)
- [ ] `ClassificationViolationError` includes: offending data type, classification level, destination

**Tests:**
- Unit: Gate blocks prompt with `PRIVATE_LOCAL` content for external provider
- Unit: Gate allows prompt with `EXTERNAL_OK` content for external provider
- Unit: Gate allows any content for local Ollama provider
- Unit: A0 audit trail records the decision
- Integration: Full prompt assembly -> gate -> provider chain with classification check

---

### 9-06: Per-World Filesystem Sandboxing

**Priority:** P1
**Feature:** SP-06
**Assignee:** Any
**Files:**
- `packages/core/src/security/WorldSandbox.ts` — new: filesystem boundary enforcement
- `packages/core/src/world/WorldManager.ts` — wire sandbox into world creation
- `packages/core/src/world/WorldService.ts` — enforce sandbox on all file operations
- `packages/core/src/__tests__/security/sandbox.test.ts` — new tests

**Scope:**
1. Each World gets a sandboxed root directory: `<workspace>/.loom/worlds/<worldId>/`
2. `WorldSandbox` enforces that all file operations for a World are constrained to its root:
   - `resolvePath(worldId, relativePath): string` — resolves and validates path is within sandbox
   - `assertWithinSandbox(worldId, absolutePath): void` — throws if path escapes sandbox
   - Path traversal attacks blocked (e.g., `../../etc/passwd` normalized and rejected)
3. Wire into `WorldManager` — sandbox directory created on `worldCreate`, removed on `worldDelete`
4. All file read/write operations through `WorldService` must pass through `WorldSandbox`
5. Symbolic link following is disabled within sandbox (prevent escape via symlinks)

**Acceptance Criteria:**
- [ ] World creation automatically creates sandboxed directory
- [ ] `resolvePath` normalizes paths and constrains to World root
- [ ] Path traversal attempts (`../`) throw `SandboxViolationError`
- [ ] Symlinks pointing outside sandbox are rejected
- [ ] World deletion cleans up sandbox directory
- [ ] Different Worlds cannot access each other's sandbox directories

**Tests:**
- Unit: `resolvePath` produces correct absolute path within sandbox
- Unit: Path traversal (`../../secret`) throws `SandboxViolationError`
- Unit: Symlink outside sandbox detected and rejected
- Unit: Cross-world access attempt blocked
- Integration: World create -> write file -> read file -> world delete cycle

---

### 9-07: Workspace Passphrase & Dynamic Command Allowlisting

**Priority:** P2
**Feature:** SP-07
**Assignee:** Any
**Depends on:** 9-06
**Files:**
- `packages/core/src/security/WorkspacePassphrase.ts` — new: passphrase handling
- `packages/core/src/security/CommandAllowlist.ts` — new: dynamic allowlisting
- `apps/electron/src/services/SecureKeyStore.ts` — extend for passphrase storage
- `packages/core/src/__tests__/security/passphrase.test.ts` — new tests
- `packages/core/src/__tests__/security/allowlist.test.ts` — new tests

**Scope:**
1. **Workspace Passphrase (optional):**
   - Operator can set a passphrase that encrypts the workspace's `.loom/` directory content
   - Passphrase is never stored — derived key is held in memory only during session
   - On app launch, if passphrase is set, prompt for it before loading workspace
   - Passphrase verification via stored hash (bcrypt/argon2 via pure JS implementation)
2. **Dynamic Command Allowlisting:**
   - Per-project configuration of allowed shell commands (for tool execution in Phase 11)
   - Default allowlist: `['git', 'npm', 'node', 'npx', 'pnpm', 'yarn', 'tsc']`
   - Operator can extend/restrict via World config
   - Commands not on allowlist are blocked with explanation
   - Wildcard support for command patterns (e.g., `npm:*` allows all npm subcommands)

**Acceptance Criteria:**
- [ ] Passphrase set/verify/clear lifecycle works end-to-end
- [ ] Passphrase is never stored in plain text (only hash)
- [ ] Incorrect passphrase denies workspace access
- [ ] Default command allowlist is loaded on World creation
- [ ] Allowlist is configurable per World
- [ ] Commands not on allowlist are blocked with a structured error
- [ ] Wildcard patterns work correctly (e.g., `git:*` matches `git status`)

**Tests:**
- Unit: Set passphrase, verify correct passphrase returns true
- Unit: Verify incorrect passphrase returns false
- Unit: Command on allowlist passes check
- Unit: Command not on allowlist is blocked
- Unit: Wildcard matching works for subcommands
- Unit: Empty allowlist blocks all commands

---

# Phase 10 — Cost Governance

**Goal:** Implement cost tracking and budget enforcement so operators can set budgets and the system respects them with intelligent fallbacks.
**Depends on:** Phase 7 (token tracking), Phase 8 (UI for cost dashboard)
**Feature IDs:** CG-01 through CG-07

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 10-01 | Per-Session Cost Tracking | 3h | — | TODO |
| 10-02 | Cost Aggregation Service | 3h | 10-01 | TODO |
| 10-03 | Budget Configuration & Storage | 3h | — | TODO |
| 10-04 | A0 Budget Enforcement | 4h | 10-01, 10-03 | TODO |
| 10-05 | Cost-Aware Pattern Postures | 3h | 10-01, 10-04 | TODO |
| 10-06 | Model Fallback on Budget Constraints | 3h | 10-04, 10-05 | TODO |
| 10-07 | Cost Dashboard UI | 4h | 10-02, 10-03 | TODO |

**Phase 10 estimated effort:** ~23 hours

---

## Task Details

### 10-01: Per-Session Cost Tracking

**Priority:** P0
**Feature:** CG-01
**Assignee:** Any
**Files:**
- `packages/core/src/cost/CostTracker.ts` — new: session-level cost accumulator
- `packages/core/src/cost/types.ts` — new: cost-related types
- `packages/core/src/cost/index.ts` — new: barrel export
- `packages/db/src/schema/memory.ts` — add cost columns to session tables
- `packages/core/src/llm/types.ts` — extend `LLMResponse` with cost breakdown
- `packages/core/src/__tests__/cost/tracker.test.ts` — new tests

**Scope:**
1. Create `CostTracker` that accumulates costs per session:
   - `record(sessionId: string, entry: CostEntry): void` — record a single LLM call cost
   - `getSessionCost(sessionId: string): SessionCost` — total cost for a session
   - `getCurrentBurn(sessionId: string): number` — real-time running total (USD)
2. `CostEntry` captures: provider, model, input tokens, output tokens, estimated cost (USD), timestamp
3. Cost estimation uses provider-specific pricing tables (configurable, stored in JSON)
4. Wire into LLM response handling — every `LLMResponse` triggers a `CostTracker.record()` call
5. Persist session cost summaries to DB on session close
6. Pricing table format: `{ "openai:gpt-4o": { input: 0.0025, output: 0.01 }, ... }` (per 1K tokens)

**Acceptance Criteria:**
- [ ] Every LLM call is recorded with token count and estimated cost
- [ ] `getSessionCost()` returns accurate totals for a session
- [ ] `getCurrentBurn()` returns real-time running total
- [ ] Provider pricing tables are configurable via JSON
- [ ] Session cost is persisted to DB on session close
- [ ] Local model (Ollama) costs are tracked as $0.00 but token counts are still recorded

**Tests:**
- Unit: Record single entry, get session cost returns correct total
- Unit: Multiple entries accumulate correctly
- Unit: Pricing table lookup produces correct estimates
- Unit: Unknown model falls back to conservative estimate
- Unit: Ollama calls tracked with $0.00 cost

---

### 10-02: Cost Aggregation Service

**Priority:** P1
**Feature:** CG-02
**Assignee:** Any
**Depends on:** 10-01
**Files:**
- `packages/core/src/cost/CostAggregator.ts` — new: multi-dimensional aggregation
- `packages/db/src/schema/memory.ts` — add cost aggregation views/tables
- `packages/core/src/__tests__/cost/aggregator.test.ts` — new tests

**Scope:**
1. Create `CostAggregator` that provides cost rollups across multiple dimensions:
   - `byWorld(worldId: string, timeRange?: TimeRange): WorldCost`
   - `byPattern(patternId: string, timeRange?: TimeRange): PatternCost`
   - `byProvider(providerName: string, timeRange?: TimeRange): ProviderCost`
   - `byTimePeriod(period: 'hour' | 'day' | 'week' | 'month'): TimePeriodCost[]`
   - `getGlobalTotal(timeRange?: TimeRange): GlobalCost`
2. Aggregation reads from persisted `CostEntry` records in DB
3. Support time-range filtering (last hour, last day, last week, custom range)
4. Pre-compute daily rollups on session close for dashboard performance
5. Return structured results with: total cost, token breakdown, call count, average cost per call

**Acceptance Criteria:**
- [ ] `byWorld()` returns total cost for all sessions in a World
- [ ] `byPattern()` returns cost grouped by Pattern usage
- [ ] `byProvider()` returns cost breakdown by LLM provider
- [ ] `byTimePeriod()` returns time-series cost data
- [ ] Time-range filtering works correctly
- [ ] Pre-computed daily rollups improve query performance

**Tests:**
- Unit: Aggregate across 3 sessions in same World produces correct total
- Unit: Time range filter excludes out-of-range entries
- Unit: Provider breakdown separates OpenAI from Ollama costs
- Unit: Empty time range returns zero costs (not errors)
- Unit: Daily rollup matches sum of individual entries

---

### 10-03: Budget Configuration & Storage

**Priority:** P0
**Feature:** CG-03
**Assignee:** Any
**Files:**
- `packages/core/src/cost/BudgetConfig.ts` — new: budget configuration and persistence
- `packages/core/src/cost/types.ts` — extend with budget types
- `packages/db/src/schema/world.ts` — add budget config columns
- `packages/core/src/__tests__/cost/budget-config.test.ts` — new tests

**Scope:**
1. Define budget scopes:
   - **Global budget:** total spend across all Worlds (e.g., $50/month)
   - **Per-World budget:** spend limit per World (e.g., $10/month)
   - **Per-Session budget:** spend limit per individual session (e.g., $2/session)
2. Budget configuration stored in World config (per-World) and global config
3. Budget thresholds with graduated responses:
   - `warn_at`: percentage threshold to trigger warning (default: 80%)
   - `soft_limit`: percentage to trigger model downgrade (default: 95%)
   - `hard_limit`: absolute stop (default: 100%)
4. Budget reset periods: `daily`, `weekly`, `monthly`, `never` (lifetime)
5. `BudgetConfig` provides: `getBudget(scope, id): Budget`, `setBudget(scope, id, budget, operatorAuth): void`

**Acceptance Criteria:**
- [ ] Global, per-World, and per-Session budgets can be configured
- [ ] Budget thresholds (warn, soft, hard) are configurable with sensible defaults
- [ ] Budget reset periods are supported (daily/weekly/monthly/never)
- [ ] Budget configuration changes require operator authorization
- [ ] Budget state is persisted across app restarts
- [ ] `getBudget()` returns remaining budget, usage percentage, and threshold status

**Tests:**
- Unit: Set global budget, retrieve returns correct values
- Unit: Per-World budget is independent from global
- Unit: Budget thresholds calculated correctly at various usage levels
- Unit: Budget reset zeroes accumulated cost at period boundary
- Unit: Budget change without operator auth throws

---

### 10-04: A0 Budget Enforcement

**Priority:** P0
**Feature:** CG-04
**Assignee:** Any
**Depends on:** 10-01, 10-03
**Files:**
- `packages/core/src/governance/a0.ts` — extend with budget enforcement
- `packages/core/src/governance/meta.ts` — add budget-related governance rules
- `packages/core/src/cost/BudgetEnforcer.ts` — new: enforcement logic
- `packages/core/src/__tests__/cost/enforcer.test.ts` — new tests

**Scope:**
1. Create `BudgetEnforcer` that checks budget status before every LLM call:
   - `checkBudget(sessionId, worldId, estimatedCost): BudgetCheckResult`
   - Returns: `ALLOW`, `WARN`, `DOWNGRADE`, or `DENY`
2. Enforcement logic checks all three scopes (session, world, global):
   - If any scope at `hard_limit` -> `DENY`
   - If any scope at `soft_limit` -> `DOWNGRADE` (trigger model fallback)
   - If any scope at `warn_at` -> `WARN` (allow but notify operator)
   - Otherwise -> `ALLOW`
3. Add META governance rules:
   - `BUDGET_HARD_LIMIT` — block LLM calls when hard limit reached
   - `BUDGET_SOFT_LIMIT` — trigger model downgrade
   - `BUDGET_WARNING` — log warning to operator
4. Wire into A0: `A0Enforcer.enforce('llm_call', { ...context, budgetCheck })` now includes budget status
5. `DENY` responses include: which budget was exceeded, current usage, limit

**Acceptance Criteria:**
- [ ] LLM calls are blocked when any budget hard limit is reached
- [ ] Model downgrade is triggered at soft limit (returns `DOWNGRADE` with suggested model)
- [ ] Warnings are surfaced at warning threshold
- [ ] Most restrictive scope wins (if session allows but World denies, deny)
- [ ] Budget check includes estimated cost of the pending request
- [ ] A0 audit log records budget-related decisions

**Tests:**
- Unit: Under budget returns `ALLOW`
- Unit: At 80% returns `WARN`
- Unit: At 95% returns `DOWNGRADE`
- Unit: At 100% returns `DENY`
- Unit: Session under budget but World over -> `DENY`
- Unit: Estimated cost that would exceed limit triggers `DENY`

---

### 10-05: Cost-Aware Pattern Postures

**Priority:** P1
**Feature:** CG-05
**Assignee:** Any
**Depends on:** 10-01, 10-04
**Files:**
- `packages/core/src/cost/PatternPosture.ts` — new: cost-aware posture definitions
- `packages/core/src/pattern/types.ts` — extend with posture field
- `packages/core/src/pattern/PatternStepRunner.ts` — wire posture into step execution
- `packages/core/src/__tests__/cost/posture.test.ts` — new tests

**Scope:**
1. Define three cost postures for Pattern execution:
   - `ULTRA_CHEAP` — use smallest/cheapest model, minimal tokens, aggressive caching
   - `BALANCED` — use mid-tier model, standard token limits (default)
   - `HIGH_ACCURACY` — use best available model, generous token limits
2. Each posture defines: preferred model tier, max tokens, temperature, caching strategy
3. Patterns can declare a default posture in their definition
4. Budget pressure can force posture downgrade (from `HIGH_ACCURACY` -> `BALANCED` -> `ULTRA_CHEAP`)
5. Wire into `PatternStepRunner` — posture determines model selection and request parameters
6. Posture changes are logged for cost attribution

**Acceptance Criteria:**
- [ ] Three postures defined with distinct model/token/temperature configurations
- [ ] Pattern definitions can specify a default posture
- [ ] Budget pressure (`DOWNGRADE` from enforcer) triggers posture reduction
- [ ] Posture reduction follows the chain: `HIGH_ACCURACY` -> `BALANCED` -> `ULTRA_CHEAP`
- [ ] `PatternStepRunner` respects posture when building LLM requests
- [ ] Posture changes are logged with reason (operator choice vs. budget pressure)

**Tests:**
- Unit: `ULTRA_CHEAP` produces requests with smallest model and lowest token limit
- Unit: Budget `DOWNGRADE` signal reduces posture one level
- Unit: Already at `ULTRA_CHEAP` with `DOWNGRADE` signal stays at `ULTRA_CHEAP`
- Unit: Pattern with explicit posture override respects it
- Unit: Posture selection logged correctly

---

### 10-06: Model Fallback on Budget Constraints

**Priority:** P1
**Feature:** CG-06
**Assignee:** Any
**Depends on:** 10-04, 10-05
**Files:**
- `packages/core/src/cost/BudgetAwareFallback.ts` — new: budget-driven model selection
- `packages/core/src/llm/ProviderFactory.ts` — extend with budget-aware routing
- `packages/core/src/__tests__/cost/fallback.test.ts` — new tests

**Scope:**
1. Create `BudgetAwareFallback` that selects the optimal model given budget constraints:
   - Input: requested model, budget status, available providers
   - Output: actual model to use, with reasoning
2. Fallback chain (most expensive to least):
   - Cloud premium (GPT-4o, Claude Opus) -> Cloud standard (GPT-4o-mini, Claude Haiku) -> Local (Ollama)
3. When budget is pressured, automatically route to cheaper alternatives
4. Local model (Ollama) preference: when budget is under pressure, always prefer local if available
5. Wire into `ProviderFactory` — budget-aware routing replaces static provider selection
6. Log model substitutions so operator knows when fallback occurred

**Acceptance Criteria:**
- [ ] Under no budget pressure, requested model is used as-is
- [ ] At soft limit, cheaper cloud alternative is selected
- [ ] At near-hard limit, local Ollama is preferred if available
- [ ] Fallback chain is traversed in order until an available provider is found
- [ ] Model substitutions are logged with: original request, actual model, reason
- [ ] If no affordable model is available, request is denied (not silently downgraded)

**Tests:**
- Unit: No pressure -> use requested model
- Unit: Soft limit -> fallback to cheaper cloud model
- Unit: Hard limit approaching -> fallback to Ollama
- Unit: Ollama unavailable -> fallback to cheapest cloud model
- Unit: All options exceed budget -> deny with explanation
- Unit: Substitution logged correctly

---

### 10-07: Cost Dashboard UI

**Priority:** P2
**Feature:** CG-07
**Assignee:** Any
**Depends on:** 10-02, 10-03
**Files:**
- `apps/web/src/components/views/CostDashboard.tsx` — new: main cost dashboard component
- `apps/web/src/components/views/BudgetConfig.tsx` — new: budget configuration panel
- `apps/web/src/store/useCostStore.ts` — new: Zustand store for cost data
- `apps/web/src/hooks/useCostData.ts` — new: data fetching hook
- `apps/web/src/components/views/CostDashboard.test.tsx` — new tests

**Scope:**
1. Create `CostDashboard` view with:
   - Real-time session cost display (current burn rate)
   - Historical cost chart (by day/week/month)
   - Cost breakdown by World, Pattern, and Provider
   - Budget usage bars with color coding (green/yellow/red)
2. Create `BudgetConfig` panel:
   - Set global, per-World, and per-Session budgets
   - Configure warning/soft/hard thresholds
   - View current budget utilization
3. Create `useCostStore` (Zustand) for cost state management
4. Wire into UI navigation — add "Cost" view to the `useUIStore` view options
5. Responsive layout using Tailwind; follows existing theme system

**Acceptance Criteria:**
- [ ] Dashboard shows real-time cost for active session
- [ ] Historical cost chart renders with correct data
- [ ] Cost breakdown by World/Pattern/Provider is accurate
- [ ] Budget bars show color-coded utilization (green < 80%, yellow 80-95%, red > 95%)
- [ ] Budget configuration panel allows setting budgets with validation
- [ ] Dashboard accessible from main navigation sidebar
- [ ] Theme-aware: respects current Antigravity/other theme

**Tests:**
- Component: Dashboard renders with mock cost data
- Component: Budget bars show correct colors at different utilization levels
- Component: Budget config form validates input (no negative values, etc.)
- Component: Empty state renders cleanly (no cost data yet)

---

# Phase 11 — Tool Registry & Sandboxing

**Goal:** Implement a governed tool access system so Agents can only use whitelisted tools within their scope.
**Depends on:** Phase 4 (basic tool primitives), Phase 9 (classification system)
**Feature IDs:** TI-01 through TI-04

> **Note:** Basic tool primitives (filesystem, shell, HTTP) were delivered in Phase 4.
> Phase 11 adds the governed registry, permission checking, and scoping on top.

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 11-01 | Tool Schema & Registry | 4h | — | TODO |
| 11-02 | A0 Tool Permission Checking | 3h | 11-01 | TODO |
| 11-03 | Scoped Filesystem & Network Tools | 4h | 11-01, 9-06, 9-03 | TODO |
| 11-04 | Tool Execution Logging & Audit | 3h | 11-01, 11-02 | TODO |
| 11-05 | Per-World Tool Whitelists | 3h | 11-01, 11-02 | TODO |

**Phase 11 estimated effort:** ~17 hours

---

## Task Details

### 11-01: Tool Schema & Registry

**Priority:** P0
**Feature:** TI-01
**Assignee:** Any
**Files:**
- `packages/core/src/tools/ToolRegistry.ts` — new: META-managed tool registry
- `packages/core/src/tools/types.ts` — new: tool schema types
- `packages/core/src/tools/index.ts` — new: barrel export
- `packages/db/src/schema/agent.ts` — extend with tool registry table
- `packages/core/src/__tests__/tools/registry.test.ts` — new tests

**Scope:**
1. Define `ToolSchema`:
   ```typescript
   interface ToolSchema {
     id: string;
     name: string;
     description: string;
     capabilities: string[];          // e.g., ['file:read', 'file:write', 'shell:execute']
     riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
     allowedScopes: string[];         // World IDs or '*' for global
     inputSchema: Record<string, any>; // JSON Schema for tool inputs
     requiresApproval: boolean;       // Whether each invocation needs operator approval
   }
   ```
2. Create `ToolRegistry` (META-managed):
   - `register(tool: ToolSchema, operatorAuth): void` — add tool to registry
   - `unregister(toolId: string, operatorAuth): void` — remove tool
   - `get(toolId: string): ToolSchema | null` — look up tool
   - `listForWorld(worldId: string): ToolSchema[]` — list tools available to a World
   - `listByRisk(riskLevel: string): ToolSchema[]` — list tools by risk level
3. Registry is persisted to DB and backed by markdown (Mandate #4)
4. Tool registration requires operator authorization (META governance check)
5. Pre-register built-in tools from Phase 4 (fs, shell, HTTP) with appropriate risk levels

**Acceptance Criteria:**
- [ ] `ToolSchema` interface defined with all fields
- [ ] Registry supports register/unregister/get/list operations
- [ ] Tool registration requires operator authorization
- [ ] Built-in Phase 4 tools are pre-registered with correct risk levels
- [ ] Registry is persisted to DB
- [ ] `listForWorld()` returns only tools allowed in that World's scope

**Tests:**
- Unit: Register tool, retrieve returns correct schema
- Unit: Register without auth throws
- Unit: Unregister removes tool from registry
- Unit: `listForWorld` filters by scope correctly
- Unit: Built-in tools are present after initialization
- Unit: `listByRisk` returns only tools at specified risk level

---

### 11-02: A0 Tool Permission Checking

**Priority:** P0
**Feature:** TI-02
**Assignee:** Any
**Depends on:** 11-01
**Files:**
- `packages/core/src/governance/a0.ts` — extend with tool permission enforcement
- `packages/core/src/governance/meta.ts` — add tool-related governance rules
- `packages/core/src/tools/ToolPermissionChecker.ts` — new: permission evaluation logic
- `packages/core/src/__tests__/tools/permissions.test.ts` — new tests

**Scope:**
1. Create `ToolPermissionChecker`:
   - `canExecute(agentId, toolId, worldId, input): ToolPermissionResult`
   - Checks: tool exists in registry, tool allowed in World, agent has tool assigned, input passes schema validation
2. Add META governance rules:
   - `TOOL_REGISTRY_CHECK` — block execution of unregistered tools
   - `TOOL_SCOPE_CHECK` — block tool usage outside its allowed Worlds
   - `TOOL_RISK_APPROVAL` — require operator approval for `CRITICAL` risk tools
   - `TOOL_AGENT_ASSIGNMENT` — block agents from using tools not assigned to them
3. Wire into A0: `A0Enforcer.enforce('tool_execute', { agentId, toolId, worldId, input })`
4. Denied executions return `ToolPermissionDeniedError` with: reason, required permissions, remediation

**Acceptance Criteria:**
- [ ] Unregistered tool execution is blocked
- [ ] Tool execution outside allowed World scope is blocked
- [ ] Agent without tool assignment cannot execute the tool
- [ ] `CRITICAL` risk tools require operator approval
- [ ] Input validation against tool schema rejects malformed inputs
- [ ] All permission checks are logged in A0 audit trail

**Tests:**
- Unit: Registered tool in correct World with assigned agent -> allow
- Unit: Unregistered tool -> deny with `TOOL_REGISTRY_CHECK` violation
- Unit: Tool used in wrong World -> deny with `TOOL_SCOPE_CHECK` violation
- Unit: `CRITICAL` tool without approval -> deny with `TOOL_RISK_APPROVAL` violation
- Unit: Invalid input -> deny with schema validation error
- Unit: All denials logged in audit trail

---

### 11-03: Scoped Filesystem & Network Tools

**Priority:** P1
**Feature:** TI-03
**Assignee:** Any
**Depends on:** 11-01, 9-06, 9-03
**Files:**
- `packages/core/src/tools/builtins/ScopedFileSystem.ts` — new: World-scoped fs tool
- `packages/core/src/tools/builtins/ScopedNetwork.ts` — new: classification-aware network tool
- `packages/core/src/tools/builtins/index.ts` — new: built-in tool registry
- `packages/core/src/__tests__/tools/scoped-fs.test.ts` — new tests
- `packages/core/src/__tests__/tools/scoped-network.test.ts` — new tests

**Scope:**
1. **ScopedFileSystem:**
   - Wraps Phase 4 filesystem tool with `WorldSandbox` enforcement (Phase 9-06)
   - Operations: `read`, `write`, `list`, `delete` — all constrained to World sandbox root
   - Passes all paths through `WorldSandbox.resolvePath()` before execution
   - Risk level: `MEDIUM` (can modify files within sandbox)
2. **ScopedNetwork:**
   - Wraps Phase 4 HTTP tool with `NetworkPolicy` and `ClassificationEngine` checks (Phase 9-03)
   - Outbound requests scanned for classified data before transmission
   - Destination URL checked against allowlist
   - Risk level: `HIGH` (external network access)
3. Register both as built-in tools in `ToolRegistry`
4. Both tools produce structured output (not raw strings) for audit logging

**Acceptance Criteria:**
- [ ] `ScopedFileSystem` cannot access files outside World sandbox
- [ ] `ScopedFileSystem` operations are constrained to World root
- [ ] `ScopedNetwork` outbound requests are scanned for classified data
- [ ] `ScopedNetwork` blocks requests to non-allowlisted URLs
- [ ] Both tools produce structured, auditable output
- [ ] Both tools registered with correct risk levels in `ToolRegistry`

**Tests:**
- Unit: ScopedFS `read` within sandbox succeeds
- Unit: ScopedFS `write` outside sandbox throws `SandboxViolationError`
- Unit: ScopedNetwork blocks request containing `PRIVATE_LOCAL` data
- Unit: ScopedNetwork allows request with `EXTERNAL_OK` data to allowlisted URL
- Unit: ScopedNetwork blocks request to non-allowlisted URL
- Integration: Agent uses ScopedFS through ToolPermissionChecker chain

---

### 11-04: Tool Execution Logging & Audit

**Priority:** P1
**Feature:** TI-04
**Assignee:** Any
**Depends on:** 11-01, 11-02
**Files:**
- `packages/core/src/tools/ToolExecutionLogger.ts` — new: structured execution logging
- `packages/db/src/schema/agent.ts` — add `tool_executions` table
- `packages/core/src/__tests__/tools/logging.test.ts` — new tests

**Scope:**
1. Create `ToolExecutionLogger` that records every tool invocation:
   - `log(entry: ToolExecutionEntry): void`
   - Entry captures: tool ID, agent ID, World ID, session ID, input (sanitized), output (sanitized), duration, result (success/failure/denied), timestamp
2. Add `tool_executions` DB table for persistence
3. Sanitize inputs/outputs before logging (strip secrets via `PromptScrubber` from Phase 9-04)
4. Query interface:
   - `getBySession(sessionId): ToolExecutionEntry[]`
   - `getByAgent(agentId): ToolExecutionEntry[]`
   - `getByTool(toolId): ToolExecutionEntry[]`
   - `getDenied(timeRange): ToolExecutionEntry[]` — all denied executions
5. Wire logger into tool execution pipeline — every invocation (allowed or denied) is logged

**Acceptance Criteria:**
- [ ] Every tool invocation is logged with full context
- [ ] Inputs and outputs are sanitized (no secrets in logs)
- [ ] Denied executions are logged with denial reason
- [ ] Query by session/agent/tool returns correct results
- [ ] `getDenied()` returns all blocked tool invocations
- [ ] Log entries include execution duration

**Tests:**
- Unit: Successful execution logged with input/output/duration
- Unit: Denied execution logged with reason
- Unit: Sensitive data in input is sanitized before logging
- Unit: Query by session returns only that session's entries
- Unit: Query denied returns only denied entries

---

### 11-05: Per-World Tool Whitelists

**Priority:** P1
**Feature:** TI-03 (continued)
**Assignee:** Any
**Depends on:** 11-01, 11-02
**Files:**
- `packages/core/src/tools/WorldToolWhitelist.ts` — new: per-World tool configuration
- `packages/core/src/world/WorldManager.ts` — wire whitelist into World lifecycle
- `packages/db/src/schema/world.ts` — add `tool_whitelist` config
- `packages/core/src/__tests__/tools/whitelist.test.ts` — new tests

**Scope:**
1. Create `WorldToolWhitelist`:
   - `setWhitelist(worldId, toolIds, operatorAuth): void` — set allowed tools for a World
   - `addTool(worldId, toolId, operatorAuth): void` — add single tool
   - `removeTool(worldId, toolId, operatorAuth): void` — remove single tool
   - `isAllowed(worldId, toolId): boolean` — check if tool is allowed
   - `getWhitelist(worldId): ToolSchema[]` — list allowed tools with full schemas
2. New Worlds start with a default whitelist (basic fs + shell tools)
3. Whitelist changes require operator authorization
4. Agents can only use tools on their World's whitelist AND assigned to them (intersection)
5. Wire into `WorldManager` — whitelist created on World creation, respected on tool execution

**Acceptance Criteria:**
- [ ] New Worlds receive a default tool whitelist
- [ ] Whitelist management requires operator authorization
- [ ] Tool execution checks whitelist before permission check
- [ ] Agents can only use tools in the intersection of (World whitelist AND agent assignments)
- [ ] Whitelist changes are persisted and survive app restart
- [ ] Removing a tool from whitelist immediately blocks its usage

**Tests:**
- Unit: New World has default whitelist
- Unit: Add tool to whitelist, `isAllowed` returns true
- Unit: Remove tool from whitelist, `isAllowed` returns false
- Unit: Tool in World whitelist but not in agent assignment -> denied
- Unit: Tool in agent assignment but not in World whitelist -> denied
- Unit: Whitelist change without auth throws

---

# Phase 12 — Backup, Export & Audit

**Goal:** Implement data portability and explainability so operators can export, backup, and explain any system behavior.
**Depends on:** Phase 1 (governance audit logs), Phase 3 (Worlds)
**Feature IDs:** OP-01 through OP-07, UI-22

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 12-01 | World Export Bundler | 4h | — | TODO |
| 12-02 | Full Store Backup & Restore | 3h | — | TODO |
| 12-03 | Human-Readable Export Format | 3h | 12-01 | TODO |
| 12-04 | Audit Trail System | 4h | — | TODO |
| 12-05 | Trace Viewer ("Why did this happen?") | 3h | 12-04 | TODO |
| 12-06 | Import & Restore Functionality | 3h | 12-01, 12-02 | TODO |
| 12-07 | Changelog Generation from Sessions | 3h | 12-04 | TODO |

**Phase 12 estimated effort:** ~23 hours

---

## Task Details

### 12-01: World Export Bundler

**Priority:** P0
**Feature:** OP-01
**Assignee:** Any
**Files:**
- `packages/core/src/export/WorldExporter.ts` — new: World export logic
- `packages/core/src/export/types.ts` — new: export-related types
- `packages/core/src/export/index.ts` — new: barrel export
- `packages/core/src/__tests__/export/world-exporter.test.ts` — new tests

**Scope:**
1. Create `WorldExporter` that bundles a complete World into a portable archive:
   - Telos (L4): World telos document + version history
   - Definition (L3): World config, pattern definitions, agent profiles
   - History (L2): Session summaries, decisions
   - Artifacts: All files from the World's sandbox directory
2. Export format: ZIP archive containing structured directories:
   ```
   world-export-<worldId>/
     telos/
       world-telos.md
       versions/
     config/
       world-config.json
       patterns/
       agents/
     history/
       sessions/
       decisions/
     artifacts/
       <sandbox contents>
     manifest.json    # metadata: export date, LOOM version, World info
   ```
3. `manifest.json` includes: export timestamp, LOOM version, World ID, World name, checksum of contents
4. Classification-aware: `PRIVATE_LOCAL` data can be excluded from export via option
5. Export is non-destructive (read-only operation on source data)

**Acceptance Criteria:**
- [ ] Export produces a valid ZIP archive with correct directory structure
- [ ] All World data (telos, config, patterns, agents, sessions, artifacts) is included
- [ ] `manifest.json` contains correct metadata and content checksum
- [ ] `PRIVATE_LOCAL` data can be optionally excluded
- [ ] Export is read-only — source data is not modified
- [ ] Large Worlds export without memory issues (stream-based ZIP creation)

**Tests:**
- Unit: Export produces ZIP with correct directory structure
- Unit: Manifest contains correct World metadata
- Unit: Privacy option excludes `PRIVATE_LOCAL` data
- Unit: Export of empty World produces valid (minimal) archive
- Unit: Content checksum in manifest is verifiable

---

### 12-02: Full Store Backup & Restore

**Priority:** P0
**Feature:** OP-02
**Assignee:** Any
**Files:**
- `packages/core/src/export/StoreBackup.ts` — new: full database + markdown backup
- `apps/electron/src/services/BackupService.ts` — new: Electron-level backup orchestration
- `packages/core/src/__tests__/export/store-backup.test.ts` — new tests

**Scope:**
1. Create `StoreBackup` that creates a complete system backup:
   - SQLite database file (safe copy — not while transactions are in progress)
   - All `.loom/` markdown files
   - Configuration files (budgets, policies, tool registry)
   - Encrypted keys export (encrypted blob, requires same machine to restore)
2. Backup format: timestamped ZIP archive:
   ```
   loom-backup-<timestamp>/
     db/
       loom.sqlite
     markdown/
       <full .loom/ directory tree>
     config/
       budgets.json
       policies.json
       tool-registry.json
     meta.json   # backup metadata
   ```
3. `BackupService` (Electron main process):
   - Coordinates DB lock during backup
   - Writes backup to user-specified location
   - Validates backup integrity after creation
4. Automatic backup scheduling (configurable: daily, weekly, on-demand)
5. Backup rotation: keep N most recent backups, delete older ones

**Acceptance Criteria:**
- [ ] Full backup creates a valid archive with all system data
- [ ] SQLite backup is consistent (no mid-transaction corruption)
- [ ] Markdown files are included with correct directory structure
- [ ] Backup integrity is validated after creation (checksum verification)
- [ ] Automatic scheduling works (daily/weekly)
- [ ] Backup rotation deletes old backups beyond retention limit

**Tests:**
- Unit: Backup creates archive with correct structure
- Unit: `meta.json` contains correct backup metadata
- Unit: Integrity check detects corrupted backup
- Unit: Rotation keeps only N backups
- Integration: Create backup, verify all contents are readable

---

### 12-03: Human-Readable Export Format

**Priority:** P1
**Feature:** OP-03
**Assignee:** Any
**Depends on:** 12-01
**Files:**
- `packages/core/src/export/ReadableExporter.ts` — new: human-readable export
- `packages/core/src/export/MarkdownRenderer.ts` — new: data-to-markdown renderer
- `packages/core/src/__tests__/export/readable-exporter.test.ts` — new tests

**Scope:**
1. Create `ReadableExporter` that produces a human-readable export (no import required):
   - JSON files for structured data (configs, schemas)
   - Markdown files for narrative data (telos, session summaries, decisions)
   - Combined index document (`INDEX.md`) with links to all exported files
2. `MarkdownRenderer` converts DB records to readable markdown:
   - Session summaries -> chronological narrative
   - Decisions -> decision log with context and reasoning
   - Agent profiles -> human-readable agent cards
   - Governance audit -> formatted audit trail
3. Export can target a single World or the entire system
4. Output is designed to be opened in any markdown editor (Obsidian, VS Code, etc.)
5. No LOOM-specific tooling required to read the export

**Acceptance Criteria:**
- [ ] Export produces markdown files readable in any text editor
- [ ] `INDEX.md` provides navigable links to all exported content
- [ ] Session summaries are rendered as chronological narrative
- [ ] Governance audit entries are formatted with context
- [ ] JSON files are pretty-printed with comments explaining each field
- [ ] Export works for single World and full system

**Tests:**
- Unit: `MarkdownRenderer` produces valid markdown from session summary
- Unit: `MarkdownRenderer` produces readable decision log
- Unit: `INDEX.md` contains links to all exported files
- Unit: JSON export is pretty-printed and valid

---

### 12-04: Audit Trail System

**Priority:** P0
**Feature:** OP-04
**Assignee:** Any
**Files:**
- `packages/core/src/audit/AuditTrail.ts` — new: centralized audit logging
- `packages/core/src/audit/types.ts` — new: audit entry types
- `packages/core/src/audit/index.ts` — new: barrel export
- `packages/db/src/schema/memory.ts` — add `audit_trail` table
- `packages/core/src/governance/a0.ts` — wire audit trail into A0
- `packages/core/src/__tests__/audit/trail.test.ts` — new tests

**Scope:**
1. Create centralized `AuditTrail` service:
   - `record(entry: AuditEntry): void` — write audit entry
   - `query(filter: AuditFilter): AuditEntry[]` — search audit entries
   - `getSessionTrail(sessionId): AuditEntry[]` — all entries for a session
   - `getDecisionTrail(decisionId): AuditEntry[]` — chain of entries leading to a decision
2. `AuditEntry` captures:
   - `id`, `timestamp`, `sessionId`, `worldId`, `agentId` (optional)
   - `actionType` — what happened (e.g., `llm_call`, `tool_execute`, `governance_decision`)
   - `actor` — who initiated (operator, agent, system)
   - `input` — what was requested (sanitized)
   - `output` — what happened (sanitized)
   - `decision` — allow/deny/warn
   - `reason` — why (governance rule, budget, classification)
   - `parentId` — links to parent entry for decision chains
3. Add `audit_trail` table to DB schema
4. Wire into A0 — all `enforce()` calls automatically create audit entries
5. Wire into tool execution, LLM calls, and session lifecycle events
6. Audit data sanitized via `PromptScrubber` (no secrets in audit log)

**Acceptance Criteria:**
- [ ] Every A0 enforcement decision creates an audit entry
- [ ] Audit entries include actor, action, decision, and reason
- [ ] Query by session returns chronological entries
- [ ] Decision chain traversal (`parentId` links) works correctly
- [ ] Audit entries are sanitized (no secrets)
- [ ] Audit table handles high write volume without performance degradation

**Tests:**
- Unit: Record entry, query returns it
- Unit: Session trail returns all entries for that session in chronological order
- Unit: Decision chain links parent -> child entries correctly
- Unit: Sensitive data in entries is sanitized
- Unit: Query filters work (by action type, by date range, by actor)
- Integration: A0 enforce -> audit entry automatically created

---

### 12-05: Trace Viewer ("Why did this happen?")

**Priority:** P1
**Feature:** OP-05
**Assignee:** Any
**Depends on:** 12-04
**Files:**
- `packages/core/src/audit/TraceBuilder.ts` — new: decision trace assembly
- `apps/web/src/components/views/TraceViewer.tsx` — new: UI component
- `apps/web/src/store/useAuditStore.ts` — new: Zustand store for audit data
- `apps/web/src/components/views/TraceViewer.test.tsx` — new tests

**Scope:**
1. Create `TraceBuilder` that assembles a human-readable explanation for any system decision:
   - Input: an audit entry ID or decision ID
   - Output: a `DecisionTrace` with:
     - The final decision (what happened)
     - The chain of events leading to it (parent entries)
     - The governance rules that applied
     - The data/context that triggered each rule
     - A human-readable summary sentence
2. Create `TraceViewer` UI component:
   - Tree visualization of the decision chain
   - Expandable nodes showing details of each step
   - Highlight governance rules that triggered
   - "Explain in plain English" summary at the top
3. Accessible from session history — click any decision to see "Why?"
4. Wire into `useAuditStore` for data fetching and state management

**Acceptance Criteria:**
- [ ] `TraceBuilder` produces a complete decision chain from audit entries
- [ ] Human-readable summary explains the decision in plain English
- [ ] `TraceViewer` renders the decision tree visually
- [ ] Nodes are expandable to show full details
- [ ] Governance rules that triggered are highlighted
- [ ] Trace is accessible from session history UI

**Tests:**
- Unit: TraceBuilder produces correct chain from 3-step decision
- Unit: Summary sentence is grammatically correct and explains the outcome
- Component: TraceViewer renders tree with expandable nodes
- Component: Empty trace (no parent chain) renders cleanly

---

### 12-06: Import & Restore Functionality

**Priority:** P1
**Feature:** OP-06
**Assignee:** Any
**Depends on:** 12-01, 12-02
**Files:**
- `packages/core/src/export/WorldImporter.ts` — new: World import from export bundle
- `packages/core/src/export/StoreRestore.ts` — new: full store restoration
- `apps/electron/src/services/RestoreService.ts` — new: Electron-level restore orchestration
- `packages/core/src/__tests__/export/importer.test.ts` — new tests

**Scope:**
1. **World Import** (`WorldImporter`):
   - Import a World from a ZIP export bundle (produced by 12-01)
   - Validate manifest and checksum before importing
   - Handle ID conflicts (imported World ID already exists): rename or overwrite (operator choice)
   - Restore: telos, config, patterns, agents, sessions, artifacts
   - Apply current security policies to imported data (re-classify)
2. **Full Store Restore** (`StoreRestore`):
   - Restore entire system from a backup archive (produced by 12-02)
   - Replace current DB with backup DB
   - Restore markdown files
   - Validate integrity before committing restore
   - Point-of-no-return confirmation from operator before overwriting
3. Both operations create a backup of current state before overwriting (safety net)

**Acceptance Criteria:**
- [ ] World import restores all data from export bundle
- [ ] Import validates manifest checksum before proceeding
- [ ] ID conflicts are handled with operator choice (rename/overwrite)
- [ ] Full restore replaces entire system state from backup
- [ ] Restore creates a safety backup of current state first
- [ ] Integrity validation prevents restoration from corrupted backups
- [ ] Imported data is re-classified per current security policies

**Tests:**
- Unit: Import from valid export bundle restores all World data
- Unit: Import with checksum mismatch throws `IntegrityError`
- Unit: ID conflict detection works correctly
- Unit: Full restore replaces DB and markdown files
- Unit: Safety backup is created before restore
- Unit: Corrupted backup is rejected

---

### 12-07: Changelog Generation from Sessions

**Priority:** P2
**Feature:** OP-07
**Assignee:** Any
**Depends on:** 12-04
**Files:**
- `packages/core/src/audit/ChangelogGenerator.ts` — new: session-to-changelog converter
- `apps/web/src/components/views/Changelog.tsx` — new: changelog UI component
- `packages/core/src/__tests__/audit/changelog.test.ts` — new tests

**Scope:**
1. Create `ChangelogGenerator` that produces a structured changelog from session history:
   - Input: World ID, time range (optional)
   - Output: `Changelog` with entries grouped by session/date
   - Each entry: timestamp, session summary, key decisions, artifacts changed
2. Changelog formats:
   - Markdown (for export and Obsidian vault)
   - Structured JSON (for programmatic consumption)
   - UI-rendered (for `Changelog` component)
3. Changelog generation is non-destructive (read-only)
4. Support filtering by: date range, agent, pattern, change type
5. Wire into UI — accessible from World detail view

**Acceptance Criteria:**
- [ ] Changelog generated from session summaries and audit entries
- [ ] Entries grouped by date/session with correct chronological order
- [ ] Markdown output is valid and readable in any markdown editor
- [ ] JSON output is structured and parseable
- [ ] Filtering by date range, agent, and pattern works correctly
- [ ] Changelog UI component renders entries with expandable details

**Tests:**
- Unit: Generator produces entries from 3 sessions in correct order
- Unit: Markdown output is valid markdown
- Unit: JSON output parses correctly
- Unit: Date range filter excludes out-of-range sessions
- Component: Changelog UI renders with mock data

---

# Parallel Execution Guide

```
PHASE 9 (Security & Privacy) — ~24 hours
├── Track A (Classification):     9-01 → 9-02 → 9-05
├── Track B (Network/Secrets):    9-03 (after 9-01) + 9-04 (independent)
└── Track C (Sandboxing):         9-06 → 9-07

PHASE 10 (Cost Governance) — ~23 hours
├── Track D (Tracking):           10-01 → 10-02
├── Track E (Budgets):            10-03 → 10-04 → 10-05 → 10-06
└── Track F (UI):                 10-07 (after 10-02 + 10-03)

PHASE 11 (Tool Registry) — ~17 hours
├── Track G (Registry):           11-01 → 11-02 → 11-05
├── Track H (Scoped Tools):       11-03 (after 11-01 + Phase 9)
└── Track I (Logging):            11-04 (after 11-01 + 11-02)

PHASE 12 (Backup & Audit) — ~23 hours
├── Track J (Export):             12-01 → 12-03 → 12-06
├── Track K (Backup):             12-02 → 12-06
└── Track L (Audit):              12-04 → 12-05 + 12-07
```

## Cross-Phase Dependencies

```
Phase 9 ──→ Phase 11 (classification system required for scoped tools)
Phase 9 ──→ Phase 10 (network policy informs cost tracking of local vs. external)
Phase 10 ─→ Phase 11 (budget enforcement applies to tool execution costs)
Phase 12 ←── All Phases (audit trail captures events from all systems)
```

## Recommended Execution Order

1. **Phase 9 first** — security is foundational; Phases 10/11 depend on classification
2. **Phase 10 + Phase 12 (Track L)** in parallel — cost governance and audit trail are independent
3. **Phase 11** after Phase 9 completes — tool sandboxing depends on security infrastructure
4. **Phase 12 (Tracks J/K)** last — export/backup benefits from all other systems being complete

## Maximum Parallelism

- **3 agents** during Phase 9 (Tracks A, B, C)
- **3 agents** during Phase 10 (Tracks D, E, F)
- **2 agents** across Phase 10 + Phase 12 (Track L) simultaneously
- **2 agents** during Phase 11 (Track G+I, Track H)
- **2 agents** during Phase 12 (Track J+K, Track L)

**Total estimated effort:** ~87 hours across all 4 phases
