# Phase 5 — Pattern System: Lifecycle, Governance, and Execution

**Parent:** [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) v2.0, Phase 5
**Goal:** Wire existing Pattern infrastructure to governance, dispatcher, and real agent execution. Complete abort/rollback, pattern switching, and ship 3 MVP core patterns.
**Depends on:** Phase 1 (Governance — META rules, A0 enforcement), Phase 4 (Agent runtime — AgentRuntime, AgentProfileLoader)
**Exit Criteria:** Can run full Pattern lifecycle with META validation on activation, Primacy Protection, Tempo control, real agent step execution, pattern switching, and safe abort with rollback.

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Pattern Schema (types.ts, Zod) | COMPLETE | `PatternDef`, `PatternStep`, `PatternParam` with Zod validation |
| Pattern Parser (PatternParser.ts) | COMPLETE | Parses markdown pattern definitions into `PatternDef` |
| Pattern Registry (PatternRegistry.ts) | COMPLETE | CRUD, L3 directory scan, in-memory + Drizzle repositories |
| Pattern Lifecycle (PatternLifecycle.ts) | COMPLETE | 10-phase state machine, SIE gating on Primacy exit |
| Step Runner (PatternStepRunner.ts) | PARTIAL | Structure complete, LLM integration is **mocked** (`mockLLMCall`) |
| Primacy Service (PrimacyService.ts) | COMPLETE | Question-only enforcement, SIE sealing |
| Tempo Service (TempoService.ts) | COMPLETE | Allegro/Andante/Adagio with constraint-based auto-detection |
| Pattern Abort Service (PatternAbortService.ts) | PARTIAL | Abort triggers state change; rollback logic is **TODO** (L1 cleanup, L2 logging) |
| META Validation on Activation | MISSING | Lifecycle auto-advances past `META_VALIDATION` — no A0 check |
| Pattern Switching Protocol | MISSING | No mechanism to switch patterns mid-session |
| Dispatcher Integration | MISSING | Patterns exist independently — not wired to dispatch pipeline |
| MVP Core Patterns (3) | MISSING | 10 pattern defs in knowledge base, but none are the 3 MVP patterns |
| Pattern Customization per World | MISSING | Registry has no world-scoping on activation |
| Integration Tests (end-to-end) | MISSING | Unit tests exist per component; no lifecycle integration suite |

---

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 5-01 | Wire Pattern activation to META governance | 3h | — | TODO |
| 5-02 | Complete Pattern Abort & Rollback | 3h | — | TODO |
| 5-03 | Implement Pattern Switching Protocol | 4h | 5-01 | TODO |
| 5-04 | Wire StepRunner to real Agent runtime | 4h | — | TODO |
| 5-05 | Implement 3 MVP Core Patterns | 3h | 5-04 | TODO |
| 5-06 | Wire Patterns to Dispatcher pipeline | 4h | 5-01, 5-04 | TODO |
| 5-07 | Pattern customization per World | 3h | 5-06 | TODO |
| 5-08 | Integration tests for Pattern lifecycle end-to-end | 4h | ALL | TODO |

**Total estimated effort:** ~28 hours

---

## Task Details

### 5-01: Wire Pattern Activation to META Governance

**Priority:** P0
**Assignee:** Any
**Files:**
- `packages/core/src/pattern/lifecycle/PatternLifecycle.ts` — inject A0Enforcer, gate `META_VALIDATION` phase
- `packages/core/src/governance/meta.ts` — add `PATTERN_ACTIVATION` rule
- `packages/core/src/governance/a0.ts` — add `authorizePatternActivation()` convenience method
- `packages/core/src/pattern/lifecycle/types.ts` — add `MetaValidationResult` interface
- `packages/core/src/pattern/lifecycle/PatternLifecycle.test.ts` — expand tests

**Scope:**
Currently `PatternLifecycle.completePrimacy()` transitions through `META_VALIDATION` to `ACTIVATION` without any governance check. The lifecycle auto-advances past validation unconditionally (line 69: `this.transitionTo(LifecyclePhase.ACTIVATION)`). This must be gated.

1. Add a `PATTERN_ACTIVATION` rule to `MetaGovernanceService` that validates:
   - The requesting session has a sealed SIE
   - The pattern is registered in the world's L3 knowledge
   - The operator has not blocked the pattern family
2. Inject `A0Enforcer` into `PatternLifecycle` constructor (or accept as dependency)
3. Replace the auto-advance in `completePrimacy()` with an actual `A0Enforcer.enforce('pattern_activation', context)` call
4. If META denies activation, transition to `FAILED` state with structured denial reason
5. Add `MetaValidationResult` type to `lifecycle/types.ts` to carry denial details

**Acceptance Criteria:**
- [ ] `PatternLifecycle` constructor accepts an `A0Enforcer` instance (dependency injection)
- [ ] Transitioning from `PRIMACY` to `ACTIVATION` requires A0 authorization
- [ ] A0 denial transitions lifecycle to `FAILED` with a `MetaValidationResult` containing the violation
- [ ] `MetaGovernanceService` has a `pattern_activation` rule that can be evaluated
- [ ] Permissive mode (A0) logs the violation but allows activation (development workflow)
- [ ] Strict mode (A0) blocks activation and the lifecycle cannot proceed

**Tests:**
- Unit: Lifecycle with mock A0 that denies — state transitions to `FAILED`
- Unit: Lifecycle with mock A0 that allows — state transitions to `ACTIVATION`
- Unit: Lifecycle in permissive mode logs violation but reaches `ACTIVATION`
- Unit: META rule `pattern_activation` rejects when SIE is not sealed
- Unit: META rule `pattern_activation` rejects when pattern is not registered

---

### 5-02: Complete Pattern Abort & Rollback

**Priority:** P0
**Assignee:** Any
**Files:**
- `packages/core/src/pattern/abort/PatternAbortService.ts` — implement rollback logic
- `packages/core/src/pattern/abort/types.ts` — new: abort result types
- `packages/core/src/pattern/lifecycle/PatternLifecycle.ts` — expose `getContext()` for rollback
- `packages/core/src/pattern/abort/PatternAbortService.test.ts` — expand tests

**Scope:**
The `PatternAbortService` currently calls `lifecycle.abort(reason)` but has three `TODO` blocks for unfinished work: L1 cleanup, L2 episodic logging, and partial-state rollback. The rollback logic must handle:

1. **L1 Cleanup:** Clear all temporary pattern context from L1 (Active Memory) — step outputs, captured inputs, conversation history for the aborted run
2. **L2 Episodic Record:** Write an "Aborted" event to L2 (Episodic Memory) with: abort reason, phase at time of abort, steps completed, partial outputs
3. **Partial Step Rollback:** If a step was in-progress when abort was triggered, mark its output as `PARTIAL` and preserve it (do not discard — the operator may want to inspect)
4. **Abort Result:** Return a structured `AbortResult` containing cleanup status, preserved artifacts, and any errors during rollback
5. **Primacy-phase abort:** If abort happens during `PRIMACY`, treat as session cancellation — no L2 record needed (nothing executed yet)

**Acceptance Criteria:**
- [ ] `PatternAbortService.abort()` returns a structured `AbortResult` (not void)
- [ ] L1 temporary context is cleared on abort (step outputs, captured inputs)
- [ ] L2 receives an append-only abort record with reason, phase, and completed step count
- [ ] In-progress step output is preserved as `PARTIAL` (not discarded)
- [ ] Abort during `PRIMACY` phase skips L2 logging (nothing to record)
- [ ] Abort during terminal states (`COMPLETED`, `ABORTED`, `FAILED`) is a no-op returning a status message
- [ ] All rollback errors are caught and included in `AbortResult` (never throws)

**Tests:**
- Unit: Abort during `STEP_EXECUTION` clears L1 and writes L2
- Unit: Abort during `PRIMACY` does not write L2
- Unit: Abort during `COMPLETED` returns no-op result
- Unit: In-progress step output preserved with `PARTIAL` status
- Unit: Rollback error during L1 cleanup is caught and included in result

---

### 5-03: Implement Pattern Switching Protocol

**Priority:** P1
**Assignee:** Any
**Depends on:** 5-01
**Files:**
- `packages/core/src/pattern/switching/PatternSwitchService.ts` — new file
- `packages/core/src/pattern/switching/types.ts` — new: switch request/result types
- `packages/core/src/pattern/lifecycle/PatternLifecycle.ts` — add `suspend()` method
- `packages/core/src/pattern/switching/PatternSwitchService.test.ts` — new tests

**Scope:**
Pattern switching allows an operator to change the active pattern mid-session without losing context. This is distinct from abort — the session continues, the pattern changes.

1. **Switch Request Validation:**
   - Can only switch from `STEP_EXECUTION` or `OPERATOR_STEERING` phases (not during `PRIMACY` or terminal states)
   - Target pattern must pass META validation (reuse 5-01 governance check)
   - Operator must explicitly confirm the switch (Operator Supremacy mandate)
2. **Suspend Current Pattern:**
   - Add `suspend()` method to `PatternLifecycle` that captures a snapshot: current phase, step index, step outputs, captured inputs
   - Store snapshot in L1 for potential resume
3. **Activate Target Pattern:**
   - Create new `PatternLifecycle` for the target pattern within the same session
   - Carry forward the SIE (already sealed) — do not re-enter Primacy
   - Inject relevant context from suspended pattern (step outputs) as input to new pattern
4. **Resume Protocol:**
   - Allow resuming a suspended pattern from its snapshot
   - On resume, re-enter at the suspended step (not from the beginning)

**Acceptance Criteria:**
- [ ] `PatternSwitchService.requestSwitch(currentLifecycle, targetPatternId)` validates and executes the switch
- [ ] Switch from `PRIMACY` phase throws `InvalidSwitchError` (must complete or abort Primacy first)
- [ ] Switch from terminal state throws `InvalidSwitchError`
- [ ] Current pattern is suspended with full snapshot (phase, step index, outputs)
- [ ] Target pattern starts at `ACTIVATION` (skips Primacy — SIE already sealed)
- [ ] Target pattern passes META validation before activation
- [ ] Suspended pattern can be resumed via `PatternSwitchService.resume(suspendedLifecycle)`
- [ ] Resume re-enters at the exact step where suspension occurred

**Tests:**
- Unit: Switch from `STEP_EXECUTION` succeeds and suspends current pattern
- Unit: Switch from `PRIMACY` throws `InvalidSwitchError`
- Unit: Switch from `COMPLETED` throws `InvalidSwitchError`
- Unit: Target pattern that fails META validation prevents the switch
- Unit: Resume restores pattern to correct step index and phase
- Unit: Context from suspended pattern is available to target pattern

---

### 5-04: Wire StepRunner to Real Agent Runtime

**Priority:** P0
**Assignee:** Any
**Files:**
- `packages/core/src/pattern/PatternStepRunner.ts` — replace `mockLLMCall` with real `AgentRuntime` execution
- `packages/core/src/pattern/PatternStepRunner.test.ts` — new test file
- `packages/core/src/agent/AgentRuntime.ts` — verify `getSystemPrompt()` and `getEffectiveModel()` compatibility
- `packages/core/src/pattern/types.ts` — add `StepExecutionContext` interface if needed

**Scope:**
The `PatternStepRunner.executeStep()` method currently calls `this.mockLLMCall()` instead of using the provided `AgentRuntime`. The method already receives an `AgentRuntime` instance and constructs the system prompt — but the final LLM call is mocked. This task replaces the mock with a real invocation path.

1. **LLM Service Abstraction:** Define an `ILLMService` interface with `chat(model, systemPrompt, userPrompt): Promise<string>` that the StepRunner depends on
   - This keeps the runner testable (inject mock LLM in tests, real LLM in production)
   - Do NOT directly couple to LangChain — the interface is neutral
2. **Inject LLM Service:** Add `ILLMService` to `PatternStepRunner` constructor
3. **Replace mock:** `executeStep()` calls `this.llmService.chat(model, fullSystemPrompt, context)` instead of `mockLLMCall`
4. **Agent Selection:** Use `step.agentRole` to select the correct `AgentRuntime` from a pool — the caller must resolve the agent before calling `executeStep()`, or the runner accepts an `AgentRuntimeResolver` that maps role to runtime
5. **Tempo Enforcement:** Pass `TempoConfig` constraints to the LLM call (max tokens for allegro, extended for adagio)
6. **Error Handling:** LLM failures (timeout, rate limit, model unavailable) produce a `StepExecutionResult` with `status: 'failed'` and structured error — never throw

**Acceptance Criteria:**
- [ ] `ILLMService` interface defined in `packages/core/src/llm/types.ts` (or similar)
- [ ] `PatternStepRunner` constructor accepts `ILLMService` (dependency injection)
- [ ] `mockLLMCall` is removed from production code (may remain as a `MockLLMService` for tests)
- [ ] `executeStep()` calls `ILLMService.chat()` with the composed system prompt and user context
- [ ] Agent name in `StepExecutionResult` comes from the actual `AgentRuntime` profile
- [ ] Tempo config influences LLM parameters (e.g., max tokens scaled by mode)
- [ ] LLM failure returns `{ status: 'failed', error: '...' }` — does not throw

**Tests:**
- Unit: StepRunner with mock `ILLMService` returns expected output
- Unit: StepRunner with failing `ILLMService` returns `status: 'failed'`
- Unit: System prompt composition includes agent telos + step instructions + tempo
- Unit: Tempo allegro produces lower max_token parameter than adagio
- Unit: Agent name in result matches runtime profile name

---

### 5-05: Implement 3 MVP Core Patterns

**Priority:** P1
**Assignee:** Any
**Depends on:** 5-04
**Files:**
- `knowledge/03_Entities/Patterns/Structured Discussion.md` — new pattern definition
- `knowledge/03_Entities/Patterns/Research & Synthesis.md` — new pattern definition
- `knowledge/03_Entities/Patterns/Production Pipeline.md` — new pattern definition
- `packages/core/src/pattern/PatternParser.ts` — verify/fix parsing for all 3 patterns
- `packages/core/src/pattern/PatternDefinitions.test.ts` — expand to validate all 3 MVP patterns

**Scope:**
Ship the 3 MVP patterns specified in the dev plan. Each must be a parseable markdown file in `knowledge/03_Entities/Patterns/` that the `PatternParser` can load and the `PatternRegistry` can index. The remaining 11 patterns are V1.5 scope.

1. **Structured Discussion Pattern:**
   - Family: Decision
   - Steps: (1) Frame the Question (Facilitator, adagio), (2) Gather Perspectives (Researcher, andante), (3) Identify Tensions (Analyst, andante), (4) Synthesize Position (Facilitator, adagio), (5) Operator Confirmation (System, allegro)
   - Inputs: topic (string, required), constraints (string, optional)
   - Outputs: position_statement (string), key_tensions (json)

2. **Research & Synthesis Pattern:**
   - Family: Ideation
   - Steps: (1) Define Research Scope (Researcher, adagio), (2) Source Gathering (Researcher, andante), (3) Analysis & Cross-Reference (Analyst, adagio), (4) Synthesis Report (Writer, andante), (5) Operator Review (System, allegro)
   - Inputs: research_question (string, required), depth (string, optional)
   - Outputs: synthesis_report (string), source_index (json)

3. **Production Pipeline Pattern:**
   - Family: Structuring
   - Steps: (1) Requirements Capture (Facilitator, adagio), (2) Draft Generation (Writer, andante), (3) Quality Review (Reviewer, andante), (4) Revision Pass (Writer, allegro), (5) Final Delivery (System, allegro)
   - Inputs: deliverable_type (string, required), specifications (json, optional)
   - Outputs: final_artifact (string), review_log (json)

**Acceptance Criteria:**
- [ ] 3 markdown files exist in `knowledge/03_Entities/Patterns/` following the established format
- [ ] `PatternParser.parse()` successfully parses each file into a valid `PatternDef`
- [ ] Each parsed pattern has correct family, 5 steps, inputs, and outputs
- [ ] Each step has `agentRole`, `tempoMode`, and `systemPrompt` populated
- [ ] `PatternRegistry.loadFromL3()` indexes all 3 patterns without errors
- [ ] `PatternRegistry.search()` can find each by name and family

**Tests:**
- Unit: Parse "Structured Discussion.md" — 5 steps, family = "Decision"
- Unit: Parse "Research & Synthesis.md" — 5 steps, family = "Ideation"
- Unit: Parse "Production Pipeline.md" — 5 steps, family = "Structuring"
- Unit: Registry loads all 3 patterns from directory
- Unit: Registry search by family "Decision" returns Structured Discussion

---

### 5-06: Wire Patterns to Dispatcher Pipeline

**Priority:** P1
**Assignee:** Any
**Depends on:** 5-01, 5-04
**Files:**
- `packages/core/src/pattern/PatternDispatcher.ts` — new: orchestrator that bridges dispatch to pattern lifecycle
- `packages/core/src/pattern/PatternDispatcher.test.ts` — new tests
- `packages/core/src/session/SessionService.ts` — add pattern activation hooks
- `packages/core/src/pattern/lifecycle/PatternLifecycle.ts` — expose event hooks for dispatcher

**Scope:**
Patterns currently exist as standalone objects. They need to be wired into the session dispatch flow so that when a session activates a pattern, the lifecycle runs as part of the session pipeline.

1. **PatternDispatcher:** New orchestrator class that:
   - Accepts a session context + pattern ID
   - Resolves pattern from `PatternRegistry`
   - Creates a `PatternLifecycle` with the session's SIE
   - Manages the lifecycle phases: Primacy -> META validation -> step execution loop
   - Delegates each step to `PatternStepRunner` with the correct `AgentRuntime`
   - Emits events at each phase transition (for UI/logging consumption)
2. **Session Integration:**
   - `SessionService` gains a `activatePattern(sessionId, patternId)` method
   - This validates the session is in `ACTIVE` state, then delegates to `PatternDispatcher`
   - Session state reflects pattern execution (e.g., `SessionState.PATTERN_ACTIVE` or similar)
3. **Agent Resolution:**
   - `PatternDispatcher` maps each step's `agentRole` to an available `AgentRuntime`
   - Uses `AgentProfileLoader` to resolve roles to profiles within the world
   - Falls back to a default agent if role is not matched
4. **Event Emission:**
   - Lifecycle phase changes, step completions, and errors are emitted as events
   - Consumers (UI, logging) can subscribe without coupling to lifecycle internals

**Acceptance Criteria:**
- [ ] `PatternDispatcher.execute(sessionContext, patternId)` runs a complete lifecycle
- [ ] Dispatcher resolves pattern from registry, creates lifecycle, runs all steps
- [ ] Each step is executed with the correct agent runtime for the step's `agentRole`
- [ ] Phase transition events are emitted and can be subscribed to
- [ ] `SessionService.activatePattern()` integrates with the dispatcher
- [ ] Dispatcher handles lifecycle failures gracefully (META denial, step failure, abort)
- [ ] Agent role fallback works when no agent matches the requested role

**Tests:**
- Unit: Dispatcher with mock registry and mock step runner executes all steps
- Unit: Dispatcher emits phase transition events in correct order
- Unit: Dispatcher handles META denial — does not execute steps
- Unit: Dispatcher handles step failure — transitions to `FAILED`
- Unit: Agent role resolution falls back to default agent
- Integration: SessionService -> PatternDispatcher -> lifecycle -> step runner chain

---

### 5-07: Pattern Customization per World

**Priority:** P2
**Assignee:** Any
**Depends on:** 5-06
**Files:**
- `packages/core/src/pattern/PatternRegistry.ts` — add world-scoped query methods
- `packages/core/src/pattern/types.ts` — add `WorldPatternOverride` type
- `packages/core/src/pattern/WorldPatternConfig.ts` — new: world-level pattern configuration
- `packages/core/src/pattern/WorldPatternConfig.test.ts` — new tests

**Scope:**
Different Worlds may need to customize patterns — disabling certain steps, overriding tempo defaults, restricting available patterns, or adding world-specific constraints to step prompts.

1. **World Pattern Overrides:**
   - Define `WorldPatternOverride` type: `{ worldId, patternId, disabledSteps?, tempoOverride?, additionalConstraints?, enabled: boolean }`
   - Overrides are stored in L3 (world configuration)
2. **World-Scoped Registry Queries:**
   - `PatternRegistry.getForWorld(worldId)` returns only patterns enabled for that world
   - Applies world overrides to pattern definitions before returning
   - System patterns (flagged `isSystem`) are available to all worlds unless explicitly disabled
3. **Override Application:**
   - `WorldPatternConfig.applyOverrides(pattern, overrides)` returns a modified `PatternDef` with:
     - Disabled steps removed from the steps array
     - Tempo modes replaced with override values
     - Additional constraints appended to step system prompts
4. **World Isolation:** Overrides for one world never affect another world's pattern definitions (Mandate #3)

**Acceptance Criteria:**
- [ ] `WorldPatternOverride` type defined with worldId, patternId, and override fields
- [ ] `PatternRegistry.getForWorld(worldId)` returns world-filtered patterns
- [ ] System patterns appear for all worlds unless explicitly disabled
- [ ] `WorldPatternConfig.applyOverrides()` correctly modifies pattern steps, tempo, and constraints
- [ ] World A's overrides do not affect World B's pattern definitions
- [ ] Disabling a step removes it from the returned `PatternDef.steps` array
- [ ] Tempo overrides replace per-step tempo modes

**Tests:**
- Unit: `getForWorld()` returns only enabled patterns for the world
- Unit: System pattern appears for world with no overrides
- Unit: Disabled pattern excluded from `getForWorld()` results
- Unit: Step removal override reduces step count
- Unit: Tempo override replaces original step tempo
- Unit: World isolation — override in World A does not leak to World B

---

### 5-08: Integration Tests for Pattern Lifecycle End-to-End

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL above (5-01 through 5-07)
**Files:**
- `packages/core/src/__tests__/integration/phase5.test.ts` — new integration test suite
- `packages/core/src/__tests__/integration/helpers/patternTestHelpers.ts` — new: shared test fixtures

**Scope:**
Comprehensive integration tests validating Phase 5 exit criteria. These tests exercise the full chain from pattern activation through completion, using mock LLM but real governance, lifecycle, and session components.

1. **Full Lifecycle (Happy Path):**
   - Create session with SIE -> seal SIE -> activate pattern -> META validates -> steps execute in order -> completion -> L2 record written
2. **Governance Rejection:**
   - Attempt to activate pattern without sealed SIE -> META denies -> lifecycle transitions to `FAILED`
   - Attempt to activate pattern blocked by world config -> META denies
3. **Primacy Protection:**
   - Verify agent output during Primacy is question-only (PrimacyService validates)
   - Verify lifecycle cannot advance past Primacy without sealed SIE
4. **Tempo Regulation:**
   - Activate pattern with explicit tempo -> verify step runner receives correct tempo config
   - Activate pattern with constraint-based tempo -> verify auto-detection produces correct mode
5. **Abort & Rollback:**
   - Abort during step execution -> L1 cleared, L2 abort record written, partial output preserved
   - Abort during Primacy -> no L2 record, clean cancellation
6. **Pattern Switching:**
   - Switch from Pattern A step 3 to Pattern B -> Pattern A suspended, Pattern B activates
   - Resume Pattern A -> resumes at step 3
7. **Error Recovery:**
   - Step runner LLM failure -> lifecycle transitions to `FAILED`
   - Step runner timeout -> abort triggered, rollback executed
8. **World Customization:**
   - Pattern with world override (disabled step) -> verify step is skipped
   - Pattern with tempo override -> verify override applied during execution

**Acceptance Criteria:**
- [ ] All integration tests pass
- [ ] Full lifecycle executes from Primacy through Completion without errors
- [ ] Governance blocks unauthorized pattern activations
- [ ] Primacy enforcement prevents premature execution
- [ ] Abort produces clean rollback with structured result
- [ ] Pattern switching suspends and resumes correctly
- [ ] World-specific overrides apply during execution
- [ ] At least 20 test cases covering all Phase 5 deliverables

**Tests:**
- This IS the test suite. 20-25 test cases covering all Phase 5 exit criteria.

---

## Parallel Execution Guide

```
Track A (Governance + Abort):    5-01 (META wiring), 5-02 (Abort/Rollback)     [independent, parallel]
Track B (Agent Integration):     5-04 (StepRunner real agents)                  [independent]

Convergence 1:                   5-03 (Pattern Switching)                       [needs 5-01]
Convergence 2:                   5-05 (MVP Core Patterns)                       [needs 5-04]
Convergence 3:                   5-06 (Dispatcher Wiring)                       [needs 5-01 + 5-04]

Sequential:                      5-07 (World Customization)                     [needs 5-06]
Final:                           5-08 (Integration Tests)                       [needs ALL]
```

**Maximum parallelism:** 3 agents — Track A (two tasks), Track B (one task).

```
Week 1 (parallel):
  Agent 1: 5-01 (3h) -> 5-03 (4h)
  Agent 2: 5-02 (3h) -> 5-05 (3h, after 5-04 completes)
  Agent 3: 5-04 (4h) -> 5-06 (4h, after 5-01 completes)

Week 2 (sequential):
  Any:     5-07 (3h) -> 5-08 (4h)
```

**Critical path:** 5-04 -> 5-06 -> 5-07 -> 5-08 (15 hours)
