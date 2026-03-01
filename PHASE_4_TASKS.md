# Phase 4 — Agent System: Definitions, Runtime, Tools & Governance

**Parent:** [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) v2.0, Phase 4
**Goal:** Implement Agent definitions, Telos, runtime behavior, evolution signals, basic tool primitives, and wire all agent actions through governance.
**Depends on:** Phase 1 (Governance — A0Enforcer, MetaGovernance, Write Permission Matrix), Phase 3 (Worlds — agents are world-scoped)
**Exit Criteria:** Agents can be defined, loaded from markdown, persisted to DB (L3/L4), constrained by role, supervised by A0, their behavior tracked at runtime, and have basic tool access (fs, shell, HTTP) within governance boundaries.

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Agent type definitions | COMPLETE | `AgentProfile`, `AgentTelos`, `AgentMode`, `AgentTool`, `AgentSignal` in `types.ts` |
| Zod schemas | COMPLETE | `AgentProfileSchema`, `AgentModeSchema`, `CreateAgentInputSchema` |
| DB schema (all agent tables) | COMPLETE | `agent_profiles`, `agent_telos`, `agent_modes`, `agent_tools`, `agent_behavior_signals` |
| AgentProfileLoader | IMPLEMENTED | Loads from markdown directories, parses PROFILE/TELOS/MODES files |
| AgentRuntime | SCAFFOLDED | System prompt composition, model resolution, basic escalation heuristics |
| BehaviorSignalCollector | MISSING | File referenced in plan but does not exist on disk |
| Agent profile DB persistence (L3) | MISSING | Profiles loaded from markdown only — no DB read/write |
| Agent Telos DB persistence (L4) | MISSING | Telos loaded from markdown only — not wired to L4TelosLayer |
| Agent role constraints enforcement | MISSING | No runtime constraint checking |
| Agent escalation protocol | SCAFFOLDED | Basic keyword matching in `AgentRuntime.checkEscalation()` — no A0 integration |
| A0 Agent supervision | MISSING | A0Enforcer exists but not wired into agent lifecycle |
| Per-agent model preferences | SCAFFOLDED | `AgentModelPreferences` type exists, `getEffectiveModel()` in runtime |
| Tool management system | MISSING | `agent_tools` DB table exists, no runtime tool execution |
| Tool governance integration | MISSING | No A0 checks on tool usage |
| Knowledge base agent definitions | COMPLETE | 9 agents defined in markdown (Architect, Catalyst, Critic, Guide, Oracle, Scribe, Sentinel, Synthesist, Weaver) |

---

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 4-01 | Agent Profile DB Persistence (L3 sync) | 4h | — | TODO |
| 4-02 | Agent Telos Storage in L4 | 3h | 4-01 | TODO |
| 4-03 | Agent Role Constraints Enforcement | 4h | 4-01 | TODO |
| 4-04 | Agent Escalation Protocol | 3h | 4-03, 4-06 | TODO |
| 4-05 | Behavior Signal Collection & Analysis | 4h | 4-01 | TODO |
| 4-06 | A0 Agent Supervision Integration | 4h | 4-01 | TODO |
| 4-07 | Per-Agent Model Preferences Configuration | 3h | 4-01 | TODO |
| 4-08 | Basic Tool Primitives (fs, shell, HTTP) | 4h | — | TODO |
| 4-09 | Tool Governance Integration (A0 + constraints) | 4h | 4-06, 4-08 | TODO |
| 4-10 | Agent Runtime Instantiation Overhaul | 3h | 4-01, 4-02, 4-07 | TODO |
| 4-11 | Phase 4 Integration Tests | 4h | ALL | TODO |

**Total estimated effort:** ~40 hours

---

## Task Details

### 4-01: Agent Profile DB Persistence (L3 Sync)

**Priority:** P0
**Assignee:** Any
**Feature:** AG-01
**Files:**
- `packages/core/src/agent/AgentProfileRepository.ts` — new: CRUD operations for agent profiles in DB
- `packages/core/src/agent/AgentProfileSync.ts` — new: syncs markdown agent definitions to DB (L3)
- `packages/core/src/agent/AgentProfileLoader.ts` — modify: add DB write after markdown parse
- `packages/core/src/agent/types.ts` — modify: add repository interface, sync result types
- `packages/db/src/schema/agent.ts` — verify existing schema is sufficient
- `packages/core/src/__tests__/agent/profileRepository.test.ts` — new tests
- `packages/core/src/__tests__/agent/profileSync.test.ts` — new tests

**Scope:**
1. Create `AgentProfileRepository` with full CRUD: `create`, `getById`, `getByWorldId`, `update`, `delete`
2. All queries world-scoped — repository methods require `worldId` parameter
3. Create `AgentProfileSync` service that:
   - Reads all 9 knowledge base agent markdown directories
   - Parses via existing `AgentProfileLoader`
   - Upserts into `agent_profiles`, `agent_modes` DB tables
   - Returns a `SyncResult` with counts (created, updated, skipped, errors)
4. Sync is idempotent — running twice produces same DB state
5. Agent name + worldId is the natural key for deduplication (not the generated UUID)

**Acceptance Criteria:**
- [ ] `AgentProfileRepository.create()` inserts a validated agent profile into `agent_profiles` table
- [ ] `AgentProfileRepository.getByWorldId(worldId)` returns all agent profiles for a world
- [ ] `AgentProfileRepository.getById(id)` returns a single agent profile or null
- [ ] `AgentProfileRepository.update()` modifies an existing profile and bumps `updated_at`
- [ ] `AgentProfileSync.syncAll(worldId, markdownRoot)` syncs all markdown agents to DB
- [ ] Sync is idempotent — second run produces zero new inserts
- [ ] Sync detects changes in markdown and updates DB records accordingly
- [ ] World isolation enforced — cannot query profiles from another world

**Tests:**
- Unit: Repository CRUD operations with mock DB
- Unit: Sync creates records for new agents
- Unit: Sync updates records when markdown content changes
- Unit: Sync is idempotent on unchanged content
- Unit: World isolation — getByWorldId filters correctly

---

### 4-02: Agent Telos Storage in L4

**Priority:** P0
**Assignee:** Any
**Feature:** AG-02
**Depends on:** 4-01
**Files:**
- `packages/core/src/agent/AgentTelosRepository.ts` — new: L4 persistence for agent telos
- `packages/core/src/memory/layers.ts` — modify: wire `L4TelosLayer.read()` to support agent telos
- `packages/core/src/agent/AgentProfileSync.ts` — modify: include telos in sync flow
- `packages/db/src/schema/agent.ts` — verify `agent_telos` schema
- `packages/core/src/__tests__/agent/agentTelos.test.ts` — new tests

**Scope:**
1. Create `AgentTelosRepository` for `agent_telos` table: `getByAgentId`, `create`, `createVersion`
2. Telos is append-only — `createVersion` adds a new row, preserving history
3. `getByAgentId` returns the latest version (most recent `updated_at`)
4. `getHistory(agentId)` returns all telos versions for an agent, ordered chronologically
5. Wire `L4TelosLayer.read('agent', agentId)` to delegate to `AgentTelosRepository`
6. Telos writes require A0 authorization (Operator Supremacy) — enforce via governance check before insert
7. Integrate into `AgentProfileSync` — on first sync, populate `agent_telos` from markdown TELOS files

**Acceptance Criteria:**
- [ ] `AgentTelosRepository.getByAgentId(agentId)` returns latest telos content
- [ ] `AgentTelosRepository.createVersion(agentId, content, operatorId)` appends new version
- [ ] Previous telos versions are preserved — `getHistory()` returns all versions
- [ ] `L4TelosLayer.read('agent', agentId)` returns telos from DB via repository
- [ ] Unauthorized telos write (no operator) throws `TelosImmutabilityError`
- [ ] `AgentProfileSync` populates `agent_telos` on initial sync from markdown
- [ ] Subsequent syncs do not create duplicate telos entries if content unchanged

**Tests:**
- Unit: Read returns latest version from repository
- Unit: createVersion appends — old versions still retrievable
- Unit: Unauthorized write throws TelosImmutabilityError
- Unit: L4TelosLayer delegates agent reads to repository
- Unit: Sync populates telos on first run

---

### 4-03: Agent Role Constraints Enforcement

**Priority:** P0
**Assignee:** Any
**Feature:** AG-04
**Depends on:** 4-01
**Files:**
- `packages/core/src/agent/AgentConstraintEngine.ts` — new: evaluates constraints against attempted actions
- `packages/core/src/agent/types.ts` — modify: add `AgentConstraint`, `ConstraintViolation` types
- `packages/core/src/governance/rules.ts` — modify: add `AGENT_ROLE_BOUNDS` rule (if not already present)
- `packages/core/src/__tests__/agent/constraintEngine.test.ts` — new tests

**Scope:**
1. Define `AgentConstraint` interface: `{ constraintType: 'ALLOWED_ACTIONS' | 'BLOCKED_ACTIONS' | 'SCOPE_LIMIT' | 'TOOL_RESTRICTION', value: string[], description: string }`
2. Each agent profile can carry an array of constraints (derived from markdown PROFILE or explicitly configured)
3. Create `AgentConstraintEngine`:
   - `evaluate(agentProfile, attemptedAction) -> ConstraintResult`
   - `ConstraintResult`: `{ allowed: boolean, violations: ConstraintViolation[] }`
4. Default constraints by role:
   - **Scribe**: allowed `['write_content', 'summarize', 'document']`, blocked `['execute_shell', 'delete_world']`
   - **Sentinel**: allowed `['review', 'audit', 'flag']`, blocked `['write_content', 'modify_telos']`
   - **Architect**: allowed `['design', 'refactor', 'plan']`, blocked `['modify_telos', 'delete_world']`
   - Other roles: permissive defaults with explicit telos/world-delete blocks
5. Constraint definitions loaded from a JSON config file (`config/agent-constraints.json`), not hardcoded
6. Wire into MetaGovernance as the `AGENT_ROLE_BOUNDS` rule

**Acceptance Criteria:**
- [ ] `AgentConstraintEngine.evaluate()` returns `{ allowed: true }` for permitted actions
- [ ] `AgentConstraintEngine.evaluate()` returns `{ allowed: false, violations: [...] }` for blocked actions
- [ ] Scribe agent attempting `execute_shell` is denied with clear violation message
- [ ] Sentinel agent attempting `write_content` is denied
- [ ] Constraints are loaded from config, not hardcoded in the engine
- [ ] `AGENT_ROLE_BOUNDS` rule registered in MetaGovernance and triggers on agent action attempts
- [ ] Unknown/new roles fall back to restrictive defaults (deny rather than allow)

**Tests:**
- Unit: Allowed action returns `{ allowed: true }`
- Unit: Blocked action returns violations with role and action details
- Unit: Default constraints applied for each known role
- Unit: Unknown role gets restrictive defaults
- Unit: Config-driven constraints override defaults
- Unit: MetaGovernance integration — `AGENT_ROLE_BOUNDS` rule fires correctly

---

### 4-04: Agent Escalation Protocol

**Priority:** P1
**Assignee:** Any
**Feature:** AG-05
**Depends on:** 4-03, 4-06
**Files:**
- `packages/core/src/agent/EscalationProtocol.ts` — new: formal escalation logic
- `packages/core/src/agent/AgentRuntime.ts` — modify: replace ad-hoc `checkEscalation()` with protocol
- `packages/core/src/agent/types.ts` — modify: expand `EscalationLevel`, add `EscalationEvent`
- `packages/core/src/__tests__/agent/escalation.test.ts` — new tests

**Scope:**
1. Formalize the escalation protocol as a state machine with levels: `NONE` -> `LOW` -> `MEDIUM` -> `CRITICAL`
2. Escalation triggers (each with configurable thresholds):
   - **LOW**: repeated user confusion (3+ "I don't understand"), agent uncertainty signals, task stalling
   - **MEDIUM**: explicit user request ("talk to operator"), tool execution failure, constraint violation attempt
   - **CRITICAL**: safety/jailbreak detection, telos violation attempt, A0 enforcement failure
3. Escalation actions per level:
   - **LOW**: log to L2 episodic, continue with caution flag
   - **MEDIUM**: pause agent, notify operator via event bus, await operator decision
   - **CRITICAL**: halt agent immediately, lock session, emit critical alert, log to audit trail
4. `EscalationProtocol.evaluate(context: EscalationContext) -> EscalationResult`
   - Context includes: user input, agent signals, constraint results, A0 history
5. Wire into `AgentRuntime` — replace the current keyword-matching `checkEscalation()` method
6. All escalation events logged to L2 (episodic) via governance-approved write

**Acceptance Criteria:**
- [ ] `EscalationProtocol.evaluate()` returns correct level based on context signals
- [ ] LOW escalation logs but does not halt
- [ ] MEDIUM escalation pauses agent and emits operator notification event
- [ ] CRITICAL escalation halts agent and locks session
- [ ] Repeated low-level signals compound to trigger MEDIUM escalation (3+ LOW -> MEDIUM)
- [ ] Escalation events written to L2 episodic layer
- [ ] Existing `AgentRuntime.checkEscalation()` replaced with protocol delegation
- [ ] Jailbreak attempts ("ignore all instructions") trigger CRITICAL immediately

**Tests:**
- Unit: Single confusion signal returns LOW
- Unit: Repeated confusion (3+) compounds to MEDIUM
- Unit: Explicit operator request returns MEDIUM
- Unit: Jailbreak attempt returns CRITICAL
- Unit: CRITICAL escalation emits halt signal
- Unit: Escalation event is written to L2
- Integration: Full escalation flow from LOW through compounding to MEDIUM

---

### 4-05: Behavior Signal Collection & Analysis

**Priority:** P1
**Assignee:** Any
**Feature:** AG-08
**Depends on:** 4-01
**Files:**
- `packages/core/src/agent/BehaviorSignalCollector.ts` — new: full implementation
- `packages/core/src/agent/BehaviorSignalAnalyzer.ts` — new: analyzes collected signals for drift/performance
- `packages/core/src/agent/types.ts` — verify `AgentSignal`, `AgentSignalType` types
- `packages/db/src/schema/agent.ts` — verify `agent_behavior_signals` table
- `packages/core/src/__tests__/agent/behaviorSignals.test.ts` — new tests

**Scope:**
1. Implement `BehaviorSignalCollector`:
   - `collect(agentId, sessionId, signalType, value, weight)` — writes signal to `agent_behavior_signals` table
   - `getSignals(agentId, options?: { sessionId?, signalType?, since? })` — query with filters
   - `getLatest(agentId, count)` — returns N most recent signals
2. Signal types (from `AgentSignalType` enum):
   - `DRIFT` — deviation from telos alignment (e.g., agent producing off-topic output)
   - `PERFORMANCE` — response latency, token usage, error rate
   - `FEEDBACK` — user satisfaction signals (explicit thumbs up/down or implicit)
   - `ALIGNMENT` — how well output matches declared role constraints
3. Implement `BehaviorSignalAnalyzer`:
   - `analyzeDrift(agentId, windowSize)` — computes drift score from recent DRIFT signals
   - `analyzePerformance(agentId, windowSize)` — computes performance summary
   - `getHealthScore(agentId)` — composite 0-100 score from all signal types
   - `detectAnomalies(agentId)` — flags if any signal type is trending abnormally
4. Signals are non-content metadata only — never store user message content in signals
5. Analysis results can feed into escalation (Task 4-04) and future evolution (Phase 7)

**Acceptance Criteria:**
- [ ] `BehaviorSignalCollector.collect()` writes signal to DB with correct schema
- [ ] `BehaviorSignalCollector.getSignals()` filters by agentId, sessionId, signalType, and date range
- [ ] `BehaviorSignalAnalyzer.analyzeDrift()` returns a numeric drift score from recent signals
- [ ] `BehaviorSignalAnalyzer.getHealthScore()` returns a 0-100 composite score
- [ ] `BehaviorSignalAnalyzer.detectAnomalies()` returns flags when signal trends are abnormal
- [ ] Signals are append-only — no update or delete operations
- [ ] Signal values contain no user content — only numeric/categorical metadata

**Tests:**
- Unit: Collector writes signal to DB
- Unit: Collector filters by signalType correctly
- Unit: Analyzer computes drift score from sample DRIFT signals
- Unit: Health score returns 0-100 range
- Unit: Anomaly detection flags extreme drift values
- Unit: No update/delete methods exist on collector interface

---

### 4-06: A0 Agent Supervision Integration

**Priority:** P1
**Assignee:** Any
**Feature:** AG-06
**Depends on:** 4-01
**Files:**
- `packages/core/src/governance/a0.ts` — modify: add agent-specific enforcement methods
- `packages/core/src/governance/types.ts` — new/modify: `AgentAction`, `AgentAuthorizationContext` types
- `packages/core/src/agent/AgentRuntime.ts` — modify: wire A0 into agent lifecycle
- `packages/core/src/governance/AuditLog.ts` — new: structured audit trail for agent actions
- `packages/core/src/__tests__/governance/a0Agent.test.ts` — new tests

**Scope:**
1. Extend `A0Enforcer` with agent-specific methods:
   - `authorizeAgentAction(agentId, actionType, context) -> AuthorizationResult`
   - `authorizeAgentInstantiation(agentId, worldId) -> AuthorizationResult`
   - `authorizeToolExecution(agentId, toolName, params) -> AuthorizationResult`
2. `AuthorizationResult`: `{ allowed: boolean, reason?: string, auditId: string }`
3. Create `AuditLog` service:
   - `record(entry: AuditEntry)` — writes to audit log (append-only)
   - `query(filters: AuditFilters)` — retrieve audit entries by agent, action, time range, result
   - `AuditEntry`: `{ id, timestamp, agentId, worldId, actionType, result: 'ALLOWED'|'DENIED', reason, context }`
4. Wire A0 into `AgentRuntime`:
   - Before system prompt construction: `authorizeAgentInstantiation`
   - Before every step execution: `authorizeAgentAction`
   - Before tool calls: `authorizeToolExecution`
5. All decisions (allowed and denied) logged to audit trail
6. Permissive mode: logs violations but allows (for development); Strict mode: blocks on DENY

**Acceptance Criteria:**
- [ ] `A0Enforcer.authorizeAgentAction()` checks MetaGovernance rules and returns structured result
- [ ] `A0Enforcer.authorizeAgentInstantiation()` validates agent belongs to the target world
- [ ] `A0Enforcer.authorizeToolExecution()` validates agent has permission for the tool
- [ ] Every agent action produces an `AuditEntry` (both allowed and denied)
- [ ] `AuditLog.query({ agentId, result: 'DENIED' })` returns all denied actions for an agent
- [ ] Permissive mode logs but does not block
- [ ] Strict mode blocks on any DENY result
- [ ] AgentRuntime calls A0 before instantiation, actions, and tool calls

**Tests:**
- Unit: authorizeAgentAction allows permitted action
- Unit: authorizeAgentAction denies out-of-role action
- Unit: authorizeAgentInstantiation denies cross-world instantiation
- Unit: AuditLog records entries and supports filtered queries
- Unit: Permissive mode logs but returns allowed
- Integration: AgentRuntime -> A0 -> MetaGovernance chain validates end-to-end

---

### 4-07: Per-Agent Model Preferences Configuration

**Priority:** P1
**Assignee:** Any
**Feature:** AG-07
**Depends on:** 4-01
**Files:**
- `packages/core/src/agent/ModelPreferenceResolver.ts` — new: resolution chain logic
- `packages/core/src/agent/AgentRuntime.ts` — modify: replace `getEffectiveModel()` with resolver
- `packages/core/src/agent/AgentProfileRepository.ts` — modify: persist model preferences in DB
- `packages/core/src/agent/types.ts` — modify: expand `AgentModelPreferences` with validation tiers
- `packages/core/src/__tests__/agent/modelPreferences.test.ts` — new tests

**Scope:**
1. Create `ModelPreferenceResolver` with a 5-tier resolution chain:
   - Tier 1: Explicit runtime override (per-call parameter)
   - Tier 2: Agent profile `preferred` model
   - Tier 3: World-level `modelPreferences` from `WorldConfig`
   - Tier 4: Agent profile `secondary` model
   - Tier 5: System default (`fallback` from config or hardcoded last resort)
2. Resolver validates that the resolved model is available (provider connectivity check — can be a simple registry lookup for now)
3. If preferred model unavailable, fall through to next tier with a logged warning
4. Model preferences persisted in `agent_profiles.model_preferences` JSON column
5. Sync reads model preferences from markdown PROFILE files (if specified in `## Model Preferences` section)
6. Replace `AgentRuntime.getEffectiveModel()` with `ModelPreferenceResolver.resolve(agent, world, override?)`

**Acceptance Criteria:**
- [ ] `ModelPreferenceResolver.resolve()` returns the highest-priority available model
- [ ] Tier 1 override always wins when provided
- [ ] Tier 2 agent preference used when no override
- [ ] Tier 3 world preference used when agent has no preference
- [ ] Unavailable model triggers fallthrough with warning log
- [ ] System default used as last resort (never returns undefined)
- [ ] Model preferences round-trip through DB (save → read → same values)
- [ ] `AgentRuntime.getEffectiveModel()` delegates to resolver

**Tests:**
- Unit: Override wins over all tiers
- Unit: Agent preferred used when no override
- Unit: World-level preference used as Tier 3
- Unit: Fallthrough when preferred unavailable
- Unit: System default returned as last resort
- Unit: DB round-trip for model preferences JSON

---

### 4-08: Basic Tool Primitives (Filesystem, Shell, HTTP)

**Priority:** P1
**Assignee:** Any
**Feature:** ED-10
**Files:**
- `packages/core/src/tools/ToolPrimitive.ts` — new: base interface for all tool primitives
- `packages/core/src/tools/FileSystemTool.ts` — new: world-scoped fs read/write
- `packages/core/src/tools/ShellExecutionTool.ts` — new: shell execution with operator approval gate
- `packages/core/src/tools/HttpRequestTool.ts` — new: governed HTTP request tool
- `packages/core/src/tools/ToolRegistry.ts` — new: registry of available tool primitives
- `packages/core/src/tools/types.ts` — new: tool interfaces, execution result types
- `packages/core/src/__tests__/tools/fileSystemTool.test.ts` — new tests
- `packages/core/src/__tests__/tools/shellTool.test.ts` — new tests
- `packages/core/src/__tests__/tools/httpTool.test.ts` — new tests

**Scope:**
1. Define `ToolPrimitive` interface:
   ```typescript
   interface ToolPrimitive {
     name: string;
     description: string;
     requiresApproval: boolean;
     execute(params: ToolParams, context: ToolExecutionContext): Promise<ToolResult>;
     validate(params: ToolParams): ValidationResult;
   }
   ```
2. **FileSystemTool** — world-scoped:
   - `read(filePath)` — only within the world's `.loom/` directory tree
   - `write(filePath, content)` — only within the world's `.loom/` directory tree
   - `list(dirPath)` — directory listing within world scope
   - Path traversal prevention: reject any path containing `..` or resolving outside world root
   - `requiresApproval: false` (scoped to world sandbox)
3. **ShellExecutionTool** — operator-gated:
   - `execute(command, args, cwd)` — runs a shell command
   - `requiresApproval: true` — ALWAYS requires explicit operator approval before execution
   - Approval flow: emit `TOOL_APPROVAL_REQUEST` event, await `TOOL_APPROVAL_RESPONSE`
   - Timeout: if no approval within 60s, deny and log
   - Command allowlist/blocklist configurable via world config
4. **HttpRequestTool** — governed:
   - `request(method, url, headers?, body?)` — makes HTTP request
   - `requiresApproval: false` for GET to allowlisted domains
   - `requiresApproval: true` for POST/PUT/DELETE or non-allowlisted domains
   - Domain allowlist configurable per-world
   - Response size limit (1MB default) to prevent memory issues
5. **ToolRegistry**:
   - `register(tool: ToolPrimitive)` — registers a tool
   - `get(name: string)` — retrieves tool by name
   - `listAvailable(agentId)` — lists tools available to an agent (filtered by agent_tools table)

**Acceptance Criteria:**
- [ ] `FileSystemTool.read()` reads files within world scope
- [ ] `FileSystemTool.write()` writes files within world scope
- [ ] `FileSystemTool` rejects path traversal attempts (`../../etc/passwd` style)
- [ ] `ShellExecutionTool.execute()` emits approval request and awaits response
- [ ] Shell execution without operator approval is denied
- [ ] Shell execution timeout (60s) results in denial
- [ ] `HttpRequestTool.request()` succeeds for GET to allowlisted domain
- [ ] `HttpRequestTool.request()` requires approval for POST to any domain
- [ ] Response size limit enforced (>1MB truncated or rejected)
- [ ] `ToolRegistry.listAvailable(agentId)` returns only tools enabled for that agent
- [ ] All tool executions return structured `ToolResult` with success/error/output

**Tests:**
- Unit: FileSystemTool reads/writes within world scope
- Unit: FileSystemTool rejects path traversal (multiple vectors)
- Unit: ShellExecutionTool requires approval event flow
- Unit: ShellExecutionTool timeout denial
- Unit: HttpRequestTool GET to allowlisted domain succeeds
- Unit: HttpRequestTool POST requires approval
- Unit: ToolRegistry filters tools by agent enablement
- Unit: ToolResult structure validated for all three tools

---

### 4-09: Tool Governance Integration (A0 + Constraints)

**Priority:** P1
**Assignee:** Any
**Feature:** AG-06, ED-10
**Depends on:** 4-06, 4-08
**Files:**
- `packages/core/src/tools/GovernedToolExecutor.ts` — new: wraps tool execution with A0 checks
- `packages/core/src/agent/AgentConstraintEngine.ts` — modify: add tool-specific constraint checks
- `packages/core/src/governance/a0.ts` — modify: integrate tool authorization
- `packages/core/src/agent/AgentRuntime.ts` — modify: use GovernedToolExecutor for all tool calls
- `packages/core/src/__tests__/tools/governedExecution.test.ts` — new tests

**Scope:**
1. Create `GovernedToolExecutor` that wraps every tool call:
   ```
   Agent requests tool → GovernedToolExecutor →
     1. Check AgentConstraintEngine (is this agent allowed this tool?)
     2. Check A0Enforcer.authorizeToolExecution()
     3. If tool.requiresApproval → emit approval request, await
     4. Execute tool
     5. Log result to AuditLog
     6. Collect behavior signal (PERFORMANCE type)
     → Return ToolResult
   ```
2. Constraint engine checks:
   - Agent's `TOOL_RESTRICTION` constraints (from 4-03) applied
   - Agent's `agent_tools` DB entries checked (tool must be enabled)
3. A0 checks:
   - `authorizeToolExecution(agentId, toolName, params)` — fires MetaGovernance rules
   - Tool-specific governance rules: `SHELL_REQUIRES_APPROVAL`, `HTTP_DOMAIN_ALLOWLIST`, `FS_WORLD_SCOPE`
4. Failure modes:
   - Constraint violation: return `ToolResult` with `error: 'CONSTRAINT_VIOLATION'`, do not execute
   - A0 denial: return `ToolResult` with `error: 'GOVERNANCE_DENIED'`, do not execute
   - Approval timeout: return `ToolResult` with `error: 'APPROVAL_TIMEOUT'`, do not execute
   - Execution failure: return `ToolResult` with `error: 'EXECUTION_ERROR'`, include error details
5. Wire into `AgentRuntime` — all `handleToolCall()` invocations go through `GovernedToolExecutor`

**Acceptance Criteria:**
- [ ] `GovernedToolExecutor.execute()` checks constraints before executing
- [ ] Agent with `TOOL_RESTRICTION` blocking `shell` cannot execute shell tool
- [ ] Agent without the tool enabled in `agent_tools` is denied
- [ ] A0 denial prevents tool execution and returns structured error
- [ ] Approval-required tools emit event and await response before executing
- [ ] Every tool execution (success or failure) logged to AuditLog
- [ ] Every tool execution emits a PERFORMANCE behavior signal
- [ ] `AgentRuntime.handleToolCall()` delegates to `GovernedToolExecutor`
- [ ] All four failure modes return appropriate error types in `ToolResult`

**Tests:**
- Unit: Constraint violation prevents execution
- Unit: Disabled tool in agent_tools prevents execution
- Unit: A0 denial prevents execution
- Unit: Approved tool executes and returns result
- Unit: Audit entry created for both success and failure
- Unit: Behavior signal emitted after execution
- Integration: Full chain — Agent → GovernedToolExecutor → A0 → Tool → AuditLog

---

### 4-10: Agent Runtime Instantiation Overhaul

**Priority:** P0
**Assignee:** Any
**Feature:** AG-03
**Depends on:** 4-01, 4-02, 4-07
**Files:**
- `packages/core/src/agent/AgentRuntime.ts` — modify: overhaul constructor and lifecycle
- `packages/core/src/agent/AgentFactory.ts` — new: creates fully wired AgentRuntime instances
- `packages/core/src/agent/types.ts` — modify: add `AgentRuntimeConfig`, `AgentLifecycleEvent`
- `packages/core/src/__tests__/agent/agentFactory.test.ts` — new tests
- `packages/core/src/__tests__/agent/agentRuntime.test.ts` — modify: update for new lifecycle

**Scope:**
1. Create `AgentFactory` — the single entry point for creating agent runtime instances:
   ```typescript
   AgentFactory.create(agentId, worldId, sessionId) -> AgentRuntime
   ```
   Internally:
   - Load profile from DB (L3 via `AgentProfileRepository`)
   - Load telos from DB (L4 via `AgentTelosRepository`)
   - Load modes from DB
   - Load enabled tools from DB (`agent_tools`)
   - Resolve model via `ModelPreferenceResolver`
   - Authorize instantiation via `A0Enforcer.authorizeAgentInstantiation()`
   - Construct and return a fully wired `AgentRuntime`
2. Overhaul `AgentRuntime`:
   - Accept all dependencies via constructor (profile, telos, modes, tools, config, a0, constraintEngine)
   - `initialize()` — async setup, validate all components loaded
   - `executeStep(input, context)` — process a single step with full governance
   - `shutdown()` — clean up, emit final signals, flush pending writes
   - `getStatus()` — returns runtime health (loaded components, signal summary, escalation state)
3. Lifecycle events: `INSTANTIATED`, `INITIALIZED`, `STEP_STARTED`, `STEP_COMPLETED`, `ESCALATED`, `SHUTDOWN`
4. All lifecycle events emitted on an event bus for observability

**Acceptance Criteria:**
- [ ] `AgentFactory.create()` loads all agent data from DB and returns a wired `AgentRuntime`
- [ ] Factory fails with clear error if agent not found in DB
- [ ] Factory fails with clear error if A0 denies instantiation
- [ ] `AgentRuntime.initialize()` validates all required components are present
- [ ] `AgentRuntime.executeStep()` passes through A0 before processing
- [ ] `AgentRuntime.shutdown()` emits `SHUTDOWN` event and flushes signals
- [ ] `AgentRuntime.getStatus()` returns structured health information
- [ ] All lifecycle events emitted to event bus
- [ ] System prompt constructed from DB-loaded telos and profile (not markdown directly)

**Tests:**
- Unit: Factory loads all components and creates runtime
- Unit: Factory throws on missing agent
- Unit: Factory throws on A0 denial
- Unit: Runtime initialize validates components
- Unit: Runtime executeStep calls A0 before processing
- Unit: Runtime shutdown emits event and cleans up
- Unit: Lifecycle events emitted in correct order
- Integration: Full create → initialize → executeStep → shutdown cycle

---

### 4-11: Phase 4 Integration Tests

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL above
**Files:**
- `packages/core/src/__tests__/integration/phase4.test.ts` — new integration test suite
- `packages/core/src/__tests__/integration/phase4-tools.test.ts` — new tool integration tests

**Scope:**
Comprehensive tests validating Phase 4 exit criteria:

1. **Agent Lifecycle:** Define agent in markdown → sync to DB → instantiate via Factory → execute steps → shutdown
2. **Telos Integrity:** Agent telos loaded from L4, immutable at runtime, versioned on Operator write
3. **Role Constraints:** Agent attempts out-of-role action → denied by ConstraintEngine → logged by AuditLog
4. **A0 Supervision:** Every agent action passes through A0 → audit trail complete for entire session
5. **Escalation Chain:** Simulate escalation from LOW → MEDIUM → CRITICAL with appropriate responses at each level
6. **Tool Execution:** Agent requests fs read (allowed) → agent requests shell (awaits approval) → agent requests HTTP POST (governed)
7. **Tool Governance:** Agent without shell tool enabled attempts shell → denied; Agent with shell tool but no approval → timeout
8. **Behavior Signals:** Execute 10 steps → verify behavior signals collected → analyzer produces health score
9. **Model Resolution:** Agent with preferred model → resolves correctly; Agent with unavailable model → falls through
10. **World Isolation:** Agent in World A cannot access World B agent profiles, tools, or telos

**Acceptance Criteria:**
- [ ] All integration tests pass
- [ ] Agent can be defined in markdown, synced to DB, and instantiated at runtime
- [ ] Agent telos is immutable without Operator authorization
- [ ] Role constraints prevent out-of-bounds actions
- [ ] A0 audit trail captures all agent decisions
- [ ] Escalation protocol fires at correct thresholds
- [ ] All three tool primitives (fs, shell, HTTP) execute within governance
- [ ] Behavior signals collected and analyzable
- [ ] Model preferences resolve through the 5-tier chain
- [ ] World isolation is airtight — no cross-world data leakage

**Tests:**
- This IS the test suite. 20-25 test cases covering all Phase 4 deliverables.

---

## Parallel Execution Guide

```
Track A (Agent Data):       4-01 (Profile DB) → 4-02 (Telos L4) ──────────────────┐
                                              → 4-03 (Constraints) ──→ 4-04 (Escalation)──┐
                                              → 4-05 (Signals)                             │
                                              → 4-07 (Model Prefs)                         │
                                                                                           │
Track B (Governance):       4-06 (A0 Supervision) ─────────────────→ 4-09 (Tool Gov) ─────┤
                                                                        ↑                  │
Track C (Tools):            4-08 (Tool Primitives) ─────────────────────┘                  │
                                                                                           │
Convergence:                4-10 (Runtime Overhaul) — needs 4-01, 4-02, 4-07 ─────────────┤
                                                                                           │
Final:                      4-11 (Integration Tests) — needs ALL ──────────────────────────┘
```

**Recommended execution order for a single developer:**
1. Start with 4-01 (Profile DB) — everything depends on it
2. Then 4-08 (Tool Primitives) in parallel with 4-02 (Telos L4)
3. Then 4-03 (Constraints) + 4-06 (A0 Supervision) + 4-05 (Signals)
4. Then 4-07 (Model Prefs)
5. Then 4-09 (Tool Governance) + 4-04 (Escalation)
6. Then 4-10 (Runtime Overhaul)
7. Finally 4-11 (Integration Tests)

**Maximum parallelism:** 3 agents — one per track (A, B, C). Track A handles 4-01 first, then fans out. Tracks B and C can start 4-06 and 4-08 immediately after 4-01 is complete. Track C's 4-08 has no dependency on 4-01 and can start in parallel from the beginning.
