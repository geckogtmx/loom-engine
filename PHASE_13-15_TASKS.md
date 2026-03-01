# Phases 13-15 — V2 Features, External Integration & Multi-Operator

**Parent:** [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) v2.0, Phases 13-15
**Goal:** Deliver V2 advanced capabilities, external ecosystem interoperability, and multi-Operator collaboration.
**Depends on:** All MVP phases (0-8), Phases 9-12 (Security, Cost Governance, Tool Registry, Backup & Audit)
**Exit Criteria:** V2 features operational without breaking V1 stability; LOOM can interface with external protocols under governance; multiple Operators can collaborate within LOOM governance.

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| 4-Layer Memory Model | COMPLETE (MVP) | L1-L4 operational with persistence |
| Governance (META + A0) | COMPLETE (MVP) | Rules engine, enforcement, audit trail |
| Session Lifecycle | COMPLETE (MVP) | SIE, checkpointing, recovery |
| Pattern System | COMPLETE (MVP) | Lifecycle, Primacy, Tempo, 3 core Patterns |
| Agent System | COMPLETE (MVP) | Profiles, runtime, behavior signals, basic tools |
| LLM Integration | COMPLETE (MVP) | Local-first (Ollama), multi-provider |
| Dispatcher & Spines | COMPLETE (Post-MVP) | Context assembly, cost optimization |
| Tool Registry | COMPLETE (Phase 11) | META-managed, sandboxed |
| Backup & Audit | COMPLETE (Phase 12) | Export, trace viewer |
| Progressive Context Narrowing | NOT STARTED | Phase 13 scope |
| Multi-Model Cognition | NOT STARTED | Phase 13 scope |
| MCP Adapter | NOT STARTED | Phase 14 scope |
| Multi-Operator | NOT STARTED | Phase 15 scope |

---

# Phase 13: V2 Features (Post-MVP)

**Goal:** Implement advanced V2 capabilities that transform LOOM from "ChatGPT that remembers" into "An AI team that works for you."
**Depends on:** All MVP phases (0-8), Phase 11 (Tool Registry), Phase 12 (Audit Trail)
**Exit Criteria:** V2 features operational without breaking V1 stability. All existing tests continue to pass.

**Feature IDs:** PT-11, PT-12, PT-13, AG-09, WD-09, ED-04

## Phase 13 Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 13-01 | Implement Progressive Context Narrowing (PCN) | 4h | — | TODO |
| 13-02 | Implement Time Constraint Modifiers | 3h | — | TODO |
| 13-03 | Implement Multi-Model Cognition | 4h | — | TODO |
| 13-04 | Implement The Continuum (Spatial Cognitive Scaffold) | 4h | — | TODO |
| 13-05 | Implement World Types | 3h | — | TODO |
| 13-06 | Implement Monitoring Layer (Real-Time World Metrics) | 3h | 13-04 | TODO |
| 13-07 | Implement Evaluation Patterns & RLHF Preference Signals | 4h | 13-03 | TODO |
| 13-08 | Implement Pattern Trails (History Awareness) | 3h | — | TODO |
| 13-09 | Implement Insights Chat | 4h | 13-01, 13-04 | TODO |
| 13-10 | Implement Machine-Parseable Specs (ED-04) | 3h | — | TODO |
| 13-11 | Phase 13 Integration Tests | 3h | ALL | TODO |

**Total estimated effort:** ~38 hours

---

## Phase 13 Task Details

### 13-01: Implement Progressive Context Narrowing (PCN)

**Priority:** P0
**Assignee:** Any
**Files:**
- `packages/core/src/dispatcher/PCNService.ts` — new: Progressive Context Narrowing engine
- `packages/core/src/dispatcher/PCNService.test.ts` — new tests
- `packages/core/src/dispatcher/ContextAssembler.ts` — extend with PCN integration
- `packages/core/src/dispatcher/types.ts` — add PCN types
- `packages/core/src/session/SessionService.ts` — wire PCN into session flow

**Scope:**
The ContextAssembler (Phase 6) already assembles L1-L4 content into a context window. PCN adds *dynamic narrowing* — as a session progresses and the Operator's intent becomes clearer, PCN progressively reduces context to only the most relevant artifacts. This reduces token waste and improves output quality.

1. Create `PCNService` that scores L3 artifacts by relevance to the current SIE + conversation history
2. Implement a relevance decay function: artifacts not referenced in N turns get deprioritized
3. Integrate with `ContextAssembler` — PCN provides a ranked artifact list, ContextAssembler respects the ranking when assembling
4. PCN operates per-session and resets on session close
5. Operator can override: `/pin <artifact>` to force inclusion, `/unpin` to release

**Acceptance Criteria:**
- [ ] `PCNService.score(artifacts, sessionContext)` returns artifacts ranked by relevance
- [ ] Context window size decreases as session narrows (measurable in token count)
- [ ] Pinned artifacts always included regardless of relevance score
- [ ] PCN does not remove L4 Telos content (always included)
- [ ] PCN state is L1-scoped (flushed on session close, not persisted)
- [ ] Existing ContextAssembler tests continue to pass

**Tests:**
- Unit: Scoring returns highest-relevance artifacts first
- Unit: Relevance decays after N turns without reference
- Unit: Pinned artifacts bypass scoring
- Unit: L4 Telos is never narrowed out
- Integration: Session with PCN uses fewer tokens than without (benchmark)

---

### 13-02: Implement Time Constraint Modifiers

**Priority:** P1
**Assignee:** Any
**Feature ID:** PT-11
**Files:**
- `packages/core/src/pattern/tempo/TimeConstraintModifier.ts` — new: time-aware modifiers
- `packages/core/src/pattern/tempo/TimeConstraintModifier.test.ts` — new tests
- `packages/core/src/pattern/tempo/TempoService.ts` — extend with time constraint integration
- `packages/core/src/pattern/tempo/types.ts` — add time constraint types
- `packages/core/src/pattern/lifecycle/PatternLifecycle.ts` — wire time constraints into step execution

**Scope:**
The Tempo system (Phase 5) already provides pace regulation (allegro/andante/adagio). Time Constraint Modifiers add *explicit time budgets* that automatically adjust Tempo and step granularity.

1. Operator sets a time budget: "I have 20 minutes" or "I have 2 hours"
2. `TimeConstraintModifier` maps time budgets to Tempo modes and step counts
3. Short budgets: auto-allegro, skip optional steps, reduce output verbosity
4. Long budgets: allow adagio, enable deep exploration steps, increase detail
5. Mid-pattern rebudgeting: Operator can say "I need to wrap up in 5 minutes"
6. Time remaining displayed in UI status bar

**Acceptance Criteria:**
- [ ] `TimeConstraintModifier.apply(budget, pattern)` returns a modified Pattern execution plan
- [ ] Budget < 15 min forces allegro Tempo with reduced steps
- [ ] Budget > 60 min allows adagio Tempo with full exploration
- [ ] Mid-session rebudgeting adjusts remaining steps without losing progress
- [ ] Time budget is captured in SIE metadata (not a constraint, just metadata)
- [ ] Existing Tempo tests continue to pass

**Tests:**
- Unit: Short budget maps to allegro with reduced step count
- Unit: Long budget maps to adagio with full step count
- Unit: Rebudgeting adjusts remaining steps proportionally
- Unit: Zero/negative budget throws `InvalidTimeBudgetError`

---

### 13-03: Implement Multi-Model Cognition

**Priority:** P0
**Assignee:** Any
**Feature ID:** AG-09
**Files:**
- `packages/core/src/agent/MultiModelCognition.ts` — new: per-Agent substrate selection
- `packages/core/src/agent/MultiModelCognition.test.ts` — new tests
- `packages/core/src/agent/types.ts` — extend Agent profile with substrate preferences
- `packages/core/src/llm/ProviderFactory.ts` — extend with agent-aware routing
- `packages/core/src/pattern/PatternStepRunner.ts` — wire agent substrate into step execution

**Scope:**
The Agent system (Phase 4) already supports per-Agent model preferences. Multi-Model Cognition elevates this to *substrate selection* — different Agents can use different model providers within the same Pattern execution, and the system can route steps to the optimal model for the task type.

1. Extend Agent profile with `cognition_substrate`: preferred provider + model, fallback chain, task-type affinities
2. Implement `SubstrateRouter` that selects the optimal model per Pattern step based on Agent affinity + step type (creative, analytical, coding, etc.)
3. Within a single Pattern execution, different steps may use different models (e.g., Gemini for research, Claude for analysis, Ollama for formatting)
4. All routing decisions governed by A0 — no model switch without governance check
5. Cost implications surfaced before execution (estimated cost per step with model selection)

**Acceptance Criteria:**
- [ ] Agent profile supports `cognition_substrate` with provider/model/fallback chain
- [ ] `SubstrateRouter.route(agent, stepType)` returns the optimal provider+model
- [ ] Different steps in one Pattern can use different providers
- [ ] All model routing passes through A0 governance
- [ ] Cost estimation reflects per-step model selection
- [ ] Fallback to existing ProviderFactory logic when no substrate defined

**Tests:**
- Unit: SubstrateRouter selects agent-preferred model for matching step type
- Unit: Fallback chain activates when preferred model unavailable
- Unit: A0 blocks model switch when governance rules prohibit it
- Unit: Cost estimation accounts for multi-model routing
- Integration: Pattern execution with 2+ different models completes successfully

---

### 13-04: Implement The Continuum (Spatial Cognitive Scaffold)

**Priority:** P1
**Assignee:** Any
**Files:**
- `packages/core/src/world/continuum/ContinuumService.ts` — new: spatial state machine
- `packages/core/src/world/continuum/types.ts` — new: Continuum types (rooms, transitions)
- `packages/core/src/world/continuum/ContinuumService.test.ts` — new tests
- `packages/db/src/schema/continuum.ts` — new: continuum_rooms, continuum_transitions tables
- `packages/core/src/world/WorldService.ts` — extend with Continuum awareness
- `apps/web/src/components/continuum/ContinuumMap.tsx` — new: visual room navigator

**Scope:**
The Continuum is a spatial metaphor for World state. Instead of a flat list of sessions, a World has "rooms" — discrete cognitive spaces that represent phases of work (e.g., "Research Room," "Drafting Room," "Review Room"). Sessions happen *within* rooms, and movement between rooms is governed.

1. Define `ContinuumRoom` schema: name, purpose, allowed Patterns, entry conditions, exit conditions
2. Create `ContinuumService` that manages room transitions within a World
3. Rooms are L3 knowledge — defined in World configuration, not per-session
4. Room transitions create L2 entries: "Moved from Research to Drafting"
5. Each room constrains which Patterns are available (e.g., "Review Room" only allows Clarity Pass + Coherence Sweep)
6. Visual map in UI shows rooms as a spatial layout with current position

**Acceptance Criteria:**
- [ ] `ContinuumService.createRoom(worldId, roomDef)` creates a new room in the World
- [ ] `ContinuumService.transition(worldId, fromRoom, toRoom)` validates and executes room change
- [ ] Rooms constrain available Patterns — Pattern activation blocked if not allowed in current room
- [ ] Room transitions logged in L2
- [ ] Room definitions stored in L3 (World-scoped)
- [ ] Default Worlds work without Continuum (backward compatible — single implicit room)

**Tests:**
- Unit: Room creation stores in L3
- Unit: Transition validates entry conditions
- Unit: Pattern activation blocked in wrong room
- Unit: L2 records room transitions
- Unit: Worlds without Continuum rooms function normally (implicit single room)

---

### 13-05: Implement World Types

**Priority:** P1
**Assignee:** Any
**Feature ID:** WD-09
**Files:**
- `packages/core/src/world/WorldTypes.ts` — new: World type definitions and constraints
- `packages/core/src/world/WorldTypes.test.ts` — new tests
- `packages/core/src/world/types.ts` — extend World type with `world_type` field
- `packages/core/src/world/WorldService.ts` — wire World type constraints into creation/configuration
- `packages/db/src/schema/world.ts` — add `world_type` column

**Scope:**
Worlds currently have a purpose (Telos) but no *type classification*. World Types add preset constraint profiles that automatically configure Patterns, Agents, Tempo defaults, and governance rules based on the work type.

1. Define World Types: `Creative`, `Production`, `Strategy`, `Research`, `Learning`, `Operations`
2. Each type provides default configuration: recommended Patterns, default Tempo, agent roles, governance strictness
3. World type is set at creation, changeable by Operator
4. Types are *suggestions* — Operator can override any default. They reduce setup friction, not enforce rigidity
5. Custom types supported: Operator can define new types with their own defaults

**Acceptance Criteria:**
- [ ] At least 6 built-in World Types defined with default configurations
- [ ] `WorldService.create()` accepts optional `world_type` parameter
- [ ] World type applies default Tempo, recommended Patterns, and governance profile
- [ ] Operator can override any type-supplied default
- [ ] Custom World Types can be defined and saved in L3
- [ ] Existing Worlds without a type continue to function (backward compatible)

**Tests:**
- Unit: Each built-in type provides correct default configuration
- Unit: Operator overrides take precedence over type defaults
- Unit: Custom type creation and retrieval
- Unit: Null/undefined type does not break World creation

---

### 13-06: Implement Monitoring Layer (Real-Time World Metrics)

**Priority:** P2
**Assignee:** Any
**Depends on:** 13-04
**Files:**
- `packages/core/src/world/monitoring/MonitoringService.ts` — new: real-time metrics collection
- `packages/core/src/world/monitoring/types.ts` — new: metric types and thresholds
- `packages/core/src/world/monitoring/MonitoringService.test.ts` — new tests
- `apps/web/src/components/monitoring/WorldHealthDashboard.tsx` — new: health visualization
- `packages/core/src/world/WorldService.ts` — emit monitoring events

**Scope:**
The Observability Dashboard (Phase 8) tracks session-level metrics. The Monitoring Layer adds *World-level health metrics* — ongoing indicators of World state that persist across sessions.

1. Define World health metrics: session frequency, pattern completion rate, L2 growth rate, knowledge staleness, agent utilization
2. Create `MonitoringService` that aggregates metrics from L2 entries and session metadata
3. Health thresholds: "stale" (no sessions in 7+ days), "active" (daily sessions), "overloaded" (too many concurrent threads)
4. If Continuum is active (13-04), track room utilization — which rooms are used most/least
5. Metrics are non-content (never log raw prompts or outputs)
6. Surface in World Cockpit as a health badge

**Acceptance Criteria:**
- [ ] `MonitoringService.getWorldHealth(worldId)` returns structured health metrics
- [ ] Staleness detection flags Worlds with no activity beyond threshold
- [ ] Pattern completion rate calculated from L2 session summaries
- [ ] Continuum room utilization tracked when Continuum is active
- [ ] All metrics are non-content — no raw prompts, outputs, or transcripts
- [ ] Health badge visible in World Cockpit and Worlds Dashboard

**Tests:**
- Unit: Health metrics calculated correctly from mock L2 data
- Unit: Staleness threshold triggers correctly
- Unit: Pattern completion rate handles edge cases (zero sessions, all aborts)
- Unit: Metrics do not contain content data

---

### 13-07: Implement Evaluation Patterns & RLHF Preference Signals

**Priority:** P1
**Assignee:** Any
**Depends on:** 13-03
**Feature IDs:** PT-12
**Files:**
- `packages/core/src/pattern/evaluation/EvaluationPattern.ts` — new: evaluation Pattern type
- `packages/core/src/pattern/evaluation/types.ts` — new: evaluation criteria, scoring types
- `packages/core/src/pattern/evaluation/EvaluationPattern.test.ts` — new tests
- `packages/core/src/agent/BehaviorSignalCollector.ts` — extend with RLHF preference signals
- `packages/core/src/agent/PreferenceSignals.ts` — new: preference signal types and collectors
- `packages/core/src/agent/PreferenceSignals.test.ts` — new tests

**Scope:**
The Agent Behavior Signals system (Phase 4) collects basic performance metadata. This task adds two capabilities:

**Evaluation Patterns:** A new Pattern family designed to *assess* output quality rather than *produce* output. One Agent generates, another evaluates against criteria.

**RLHF Preference Signals:** Extend behavior signals with structured preference data — when the Operator chooses between alternatives, edits an output, or provides thumbs-up/down, capture that as preference metadata that informs future routing.

1. Create `EvaluationPattern` type — a Pattern where one step generates and another step evaluates
2. Evaluation criteria defined per-Pattern: accuracy, creativity, adherence-to-constraints, etc.
3. Implement preference signal collection: A/B choice, edit distance, explicit feedback
4. Preference signals stored as behavioral metadata (not L2 content) in the existing `agent_behavior_signals` table
5. Multi-Model Cognition (13-03) uses preference data to inform substrate routing over time

**Acceptance Criteria:**
- [ ] `EvaluationPattern` type registers in PatternRegistry alongside standard Patterns
- [ ] Evaluation step produces structured scoring (not just prose)
- [ ] Preference signals captured on: A/B selection, output edit, explicit thumbs-up/down
- [ ] Preference data stored in `agent_behavior_signals` (not L2)
- [ ] SubstrateRouter can query preference history to bias model selection
- [ ] No raw content stored in preference signals — only metadata (scores, choices, edit distance)

**Tests:**
- Unit: EvaluationPattern lifecycle completes with evaluation step
- Unit: Preference signal captured on A/B selection
- Unit: Preference signal captured on explicit feedback
- Unit: Preference data does not contain raw content
- Integration: SubstrateRouter adjusts routing based on accumulated preference data

---

### 13-08: Implement Pattern Trails (History Awareness)

**Priority:** P2
**Assignee:** Any
**Feature ID:** PT-13
**Files:**
- `packages/core/src/pattern/trails/PatternTrailService.ts` — new: trail tracking and querying
- `packages/core/src/pattern/trails/types.ts` — new: trail types
- `packages/core/src/pattern/trails/PatternTrailService.test.ts` — new tests
- `packages/core/src/pattern/lifecycle/PatternLifecycle.ts` — emit trail events on completion/abort
- `packages/db/src/schema/pattern.ts` — add `pattern_trails` table

**Scope:**
Currently, Pattern execution creates L2 entries but there is no structured history of *which Patterns were run in what order* within a World. Pattern Trails add a queryable execution history that enables recommendations.

1. On Pattern completion/abort, record a trail entry: Pattern ID, World ID, room (if Continuum), duration, outcome, agent(s) used
2. Create `PatternTrailService` that queries trail history for a World
3. Trail-based recommendations: "Last time in the Drafting Room, you used Draft-Edit-Polish — use again?"
4. Trail data is L2-adjacent (append-only, World-scoped) but stored in its own table for efficient querying
5. Export trails as part of World export (Phase 12)

**Acceptance Criteria:**
- [ ] Trail entry created on every Pattern completion and abort
- [ ] `PatternTrailService.getTrails(worldId)` returns ordered execution history
- [ ] `PatternTrailService.recommend(worldId, roomId?)` suggests Patterns based on history
- [ ] Trail entries include: pattern, world, room, duration, outcome, agents
- [ ] Trail data is World-scoped (no cross-World trail queries)
- [ ] Trails included in World export bundle

**Tests:**
- Unit: Trail entry created on Pattern completion
- Unit: Trail entry created on Pattern abort (with abort reason)
- Unit: Recommendation based on frequency in current room
- Unit: World scoping prevents cross-World trail access

---

### 13-09: Implement Insights Chat

**Priority:** P1
**Assignee:** Any
**Depends on:** 13-01, 13-04
**Files:**
- `packages/core/src/insights/InsightsChatService.ts` — new: codebase/project exploration engine
- `packages/core/src/insights/InsightsChatService.test.ts` — new tests
- `packages/core/src/insights/types.ts` — new: query types, response types
- `apps/web/src/components/insights/InsightsPanel.tsx` — new: chat interface for exploration
- `apps/web/src/components/insights/InsightsPanel.test.tsx` — new: component tests

**Scope:**
Insights Chat is a read-only exploration interface that lets the Operator ask questions about their project/World state without starting a full governed session. It queries L2 (episodic history), L3 (knowledge), and Pattern Trails to answer questions like "What decisions did we make last week?" or "How many times have we used the Research pattern?"

1. Create `InsightsChatService` — a lightweight query engine over L2, L3, and trail data
2. Insights Chat uses local models (Ollama) by default — it is a THIN interaction, not a STANDARD session
3. No L2 writes — Insights Chat is purely read-only. No session created, no SIE, no governance overhead
4. PCN (13-01) informs which artifacts are most relevant to the query
5. Continuum awareness (13-04): "What happened in the Research Room?" queries scoped to room
6. Presented as a sidebar panel, always accessible without starting a session

**Acceptance Criteria:**
- [ ] `InsightsChatService.query(worldId, question)` returns a structured answer
- [ ] Queries span L2 (history), L3 (knowledge), and Pattern Trails
- [ ] No L2 writes occur during Insights Chat (read-only)
- [ ] Uses local models by default (THIN session class)
- [ ] Room-scoped queries work when Continuum is active
- [ ] Insights panel accessible without starting a session

**Tests:**
- Unit: Query over L2 returns relevant session summaries
- Unit: Query over L3 returns relevant knowledge artifacts
- Unit: No write operations triggered during Insights queries
- Unit: Room-scoped query filters correctly
- Integration: End-to-end query with mock LLM returns coherent answer

---

### 13-10: Implement Machine-Parseable Specs (ED-04)

**Priority:** P2
**Assignee:** Any
**Feature ID:** ED-04
**Files:**
- `packages/core/src/specs/SpecParser.ts` — new: markdown spec parser
- `packages/core/src/specs/TestGenerator.ts` — new: test skeleton generator
- `packages/core/src/specs/types.ts` — new: parsed spec types, constraint types
- `packages/core/src/specs/SpecParser.test.ts` — new tests
- `packages/core/src/specs/TestGenerator.test.ts` — new tests

**Scope:**
This implements the Specification Engineering vision from Section 1.5.3 of the dev plan. Markdown specs in L3 (Pattern definitions, Agent profiles, constraint documents) are parsed into machine-readable structures that can auto-generate test skeletons and conformance checklists.

1. Create `SpecParser` that extracts structured data from markdown specs: acceptance criteria (checkbox lists), constraints (must/must-not), inputs/outputs, dependencies
2. Create `TestGenerator` that produces Vitest test skeletons from parsed specs
3. Parse Agent profile markdown to extract constraint lists for runtime validation
4. Parse Pattern definitions to extract completion conditions for automated checking
5. Output is always *skeletons* — human review required before tests are authoritative

**Acceptance Criteria:**
- [ ] `SpecParser.parse(markdown)` extracts acceptance criteria, constraints, and dependencies
- [ ] `TestGenerator.generate(parsedSpec)` produces a valid Vitest test skeleton
- [ ] Agent profile markdown parsed into runtime-checkable constraint list
- [ ] Pattern definition markdown parsed into completion condition checklist
- [ ] Generated test skeletons compile without errors (even if tests are empty)
- [ ] Parser handles malformed markdown gracefully (warns, does not crash)

**Tests:**
- Unit: Parser extracts checkbox items from markdown
- Unit: Parser extracts must/must-not constraints
- Unit: TestGenerator produces compilable Vitest file
- Unit: Malformed markdown produces warnings, not exceptions
- Integration: Parse a real Pattern definition and generate a test skeleton

---

### 13-11: Phase 13 Integration Tests

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL Phase 13 tasks
**Files:**
- `packages/core/src/__tests__/integration/phase13.test.ts` — new integration test suite

**Scope:**
Comprehensive tests validating Phase 13 exit criteria: V2 features operate without breaking V1 stability.

1. **V1 Regression:** Run all existing Phase 1-8 test suites — zero regressions
2. **PCN Integration:** Session with PCN enabled narrows context over turns
3. **Multi-Model:** Pattern execution using 2+ providers completes under governance
4. **Continuum:** Room transitions constrain Pattern availability
5. **World Types:** Typed World applies defaults that Operator can override
6. **Insights Chat:** Read-only query returns results without creating sessions
7. **Cross-Feature:** PCN + Continuum + Insights work together (scoped query in narrowed context within a room)

**Acceptance Criteria:**
- [ ] All V1 tests continue to pass (zero regressions)
- [ ] PCN measurably reduces token usage over session duration
- [ ] Multi-model Pattern execution completes with governance audit entries
- [ ] Continuum room constraints enforced
- [ ] Insights Chat produces results without side effects
- [ ] No new security vulnerabilities introduced

**Tests:**
- This IS the test suite. 15-20 test cases covering all Phase 13 deliverables and V1 regression checks.

---

# Phase 14: External Integration (V2+)

**Goal:** Implement interoperability with external ecosystems while maintaining governance integrity.
**Depends on:** Phase 13 (V2 stability)
**Exit Criteria:** LOOM can interface with external protocols (MCP, GitHub, Linear) without losing governance.

**Feature IDs:** TI-05, TI-06, GV-06

## Phase 14 Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 14-01 | Implement MCP Adapter Shell | 4h | — | TODO |
| 14-02 | Implement Capability Imports | 3h | 14-01 | TODO |
| 14-03 | Implement Pattern Export (Goose-Style DSL) | 3h | — | TODO |
| 14-04 | Implement Replication Layer (Cross-Model Validation) | 4h | — | TODO |
| 14-05 | Implement GitHub/GitLab Integration | 3h | — | TODO |
| 14-06 | Implement Linear Integration (Task Sync) | 3h | 14-05 | TODO |
| 14-07 | Phase 14 Integration Tests | 3h | ALL | TODO |

**Total estimated effort:** ~23 hours

---

## Phase 14 Task Details

### 14-01: Implement MCP Adapter Shell

**Priority:** P0
**Assignee:** Any
**Feature ID:** TI-05
**Files:**
- `packages/core/src/integration/mcp/MCPAdapter.ts` — new: MCP protocol adapter
- `packages/core/src/integration/mcp/types.ts` — new: MCP mapping types
- `packages/core/src/integration/mcp/MCPAdapter.test.ts` — new tests
- `packages/core/src/integration/mcp/WorldContextMapper.ts` — new: World-to-MCP-context mapper
- `packages/core/src/integration/mcp/PatternSchemaMapper.ts` — new: Pattern-to-MCP-schema mapper

**Scope:**
MCP (Model Context Protocol) is becoming the standard for AI tool/context interoperability. This task maps LOOM's internal concepts to MCP primitives so external MCP clients can interact with LOOM Worlds.

1. Map Worlds to MCP contexts — a World's L3 knowledge + L4 Telos becomes an MCP context that external tools can read
2. Map Patterns to MCP schemas — Pattern definitions become MCP tool schemas that external agents can invoke
3. All MCP access passes through A0 governance — external clients cannot bypass META rules
4. MCP adapter is read-heavy, write-restricted — external clients can query but writes require Operator approval
5. Implement MCP server that exposes LOOM capabilities over the standard MCP transport

**Acceptance Criteria:**
- [ ] `MCPAdapter.expose(worldId)` makes a World available as an MCP context
- [ ] `WorldContextMapper.toMCPContext(world)` produces valid MCP context from World state
- [ ] `PatternSchemaMapper.toMCPSchema(pattern)` produces valid MCP tool schema from Pattern
- [ ] All MCP reads pass through A0 governance check
- [ ] MCP writes require explicit Operator approval (not auto-approved)
- [ ] MCP server starts/stops cleanly without affecting core LOOM operation

**Tests:**
- Unit: World maps to valid MCP context structure
- Unit: Pattern maps to valid MCP tool schema
- Unit: A0 blocks unauthorized MCP read attempts
- Unit: Write requests queued for Operator approval
- Integration: External MCP client can list available contexts and tools

---

### 14-02: Implement Capability Imports

**Priority:** P1
**Assignee:** Any
**Depends on:** 14-01
**Files:**
- `packages/core/src/integration/imports/CapabilityImporter.ts` — new: import engine
- `packages/core/src/integration/imports/types.ts` — new: import types (agents.md format)
- `packages/core/src/integration/imports/CapabilityImporter.test.ts` — new tests
- `packages/core/src/integration/imports/AgentMDParser.ts` — new: agents.md format parser
- `packages/core/src/agent/AgentProfileLoader.ts` — extend to accept imported profiles

**Scope:**
Allow importing Agent capabilities from external definition formats (primarily `agents.md` style used by Cursor, Windsurf, and similar tools). Imported capabilities become LOOM Agents governed by META.

1. Parse `agents.md` format: extract agent name, instructions, capabilities, constraints
2. Map imported agent definition to LOOM Agent profile schema (PROFILE, TELOS, MODES, TOOLS)
3. Imported Agents are *governed* — META rules apply, A0 supervises, behavior signals collected
4. Import is a one-time operation: creates an Agent definition in L3, does not maintain a live sync
5. Operator reviews and approves the import before it takes effect

**Acceptance Criteria:**
- [ ] `CapabilityImporter.import(source, format)` parses external agent definition
- [ ] `AgentMDParser.parse(content)` extracts structured agent data from agents.md format
- [ ] Imported agent mapped to LOOM Agent profile with PROFILE, TELOS, MODES, TOOLS sections
- [ ] Imported Agent governed by META (not a bypass of governance)
- [ ] Operator approval required before import finalized
- [ ] Import logged in audit trail (Phase 12)

**Tests:**
- Unit: Parse valid agents.md content
- Unit: Map parsed agent to LOOM profile schema
- Unit: Import blocked without Operator approval
- Unit: Malformed agents.md handled gracefully (error, not crash)
- Unit: Imported agent passes A0 governance checks

---

### 14-03: Implement Pattern Export (Goose-Style DSL)

**Priority:** P2
**Assignee:** Any
**Files:**
- `packages/core/src/integration/exports/PatternExporter.ts` — new: export engine
- `packages/core/src/integration/exports/GooseDSLMapper.ts` — new: LOOM Pattern to Goose DSL
- `packages/core/src/integration/exports/types.ts` — new: export types
- `packages/core/src/integration/exports/PatternExporter.test.ts` — new tests

**Scope:**
Allow exporting LOOM Patterns to external DSL formats so they can be used outside LOOM. The primary target is Goose-style DSL (plan/task/step format), with a generic export interface for future formats.

1. Create `PatternExporter` with a pluggable format system
2. Implement `GooseDSLMapper` that converts a LOOM Pattern definition (steps, agents, constraints, completion conditions) into Goose-compatible DSL
3. Exported Patterns are *snapshots* — no live sync back to LOOM
4. Governance metadata (META rules, A0 constraints) exported as comments/annotations, not enforced outside LOOM
5. Export includes all Pattern metadata: name, family, purpose, steps, inputs, outputs

**Acceptance Criteria:**
- [ ] `PatternExporter.export(patternId, format)` produces a formatted string
- [ ] `GooseDSLMapper.map(pattern)` produces valid Goose-style DSL
- [ ] Exported DSL includes all Pattern steps, inputs, outputs
- [ ] Governance constraints exported as annotations/comments
- [ ] Export logged in audit trail
- [ ] Generic export interface supports adding new formats without modifying core

**Tests:**
- Unit: Pattern with 3 steps maps to 3 Goose tasks
- Unit: Pattern inputs/outputs included in export
- Unit: Governance constraints appear as annotations
- Unit: Export of non-existent Pattern returns error

---

### 14-04: Implement Replication Layer (Cross-Model Validation)

**Priority:** P1
**Assignee:** Any
**Feature ID:** GV-06
**Files:**
- `packages/core/src/governance/replication/ReplicationService.ts` — new: cross-model validation engine
- `packages/core/src/governance/replication/types.ts` — new: replication types
- `packages/core/src/governance/replication/ReplicationService.test.ts` — new tests
- `packages/core/src/llm/ProviderFactory.ts` — extend with replication routing

**Scope:**
The Replication Layer enables cross-model validation: run the same task on 2+ different models, compare outputs, flag divergence. This is a governance mechanism — if two models disagree significantly, escalate to Operator.

1. `ReplicationService.replicate(task, models[])` runs a task across multiple providers
2. Implement divergence detection: compare outputs using semantic similarity + structural matching
3. Low divergence: accept the primary model's output, log the replication
4. High divergence: escalate to Operator with both outputs for review
5. Replication is expensive — only triggered for DEEP session class or explicit `/replicate` command
6. Replication results stored as behavioral metadata (not L2 content)

**Acceptance Criteria:**
- [ ] `ReplicationService.replicate(task, [modelA, modelB])` returns comparison result
- [ ] Low divergence: primary output accepted, replication logged
- [ ] High divergence: escalation triggered with both outputs presented
- [ ] Replication only available in DEEP sessions or via `/replicate` command
- [ ] Replication cost estimated and surfaced before execution
- [ ] Results stored as behavioral metadata, not L2 content

**Tests:**
- Unit: Identical outputs produce low divergence score
- Unit: Significantly different outputs produce high divergence score
- Unit: High divergence triggers escalation
- Unit: Replication blocked in THIN sessions
- Integration: Replicate across 2 mock providers and compare results

---

### 14-05: Implement GitHub/GitLab Integration

**Priority:** P1
**Assignee:** Any
**Feature ID:** TI-06
**Files:**
- `packages/core/src/integration/vcs/GitHubAdapter.ts` — new: GitHub API adapter
- `packages/core/src/integration/vcs/GitLabAdapter.ts` — new: GitLab API adapter
- `packages/core/src/integration/vcs/types.ts` — new: VCS integration types (issues, PRs)
- `packages/core/src/integration/vcs/IssueImporter.ts` — new: issue-to-thread mapper
- `packages/core/src/integration/vcs/GitHubAdapter.test.ts` — new tests

**Scope:**
Allow importing GitHub/GitLab issues into LOOM as structured context. Issues become L3 knowledge artifacts or session starting points within a World.

1. `GitHubAdapter` connects via GitHub API (token-based auth, stored in SecureKeyStore from Phase 9)
2. `IssueImporter` fetches issues by repo/label/milestone and maps them to LOOM artifacts
3. Imported issues become L3 knowledge entries scoped to a World — not sessions, not Patterns
4. Two-way sync is *not* in scope — import only. LOOM does not write back to GitHub
5. GitLab adapter follows the same interface for portability
6. All API credentials governed by Phase 9 secret handling

**Acceptance Criteria:**
- [ ] `GitHubAdapter.connect(token)` authenticates with GitHub API
- [ ] `IssueImporter.import(repo, filters)` fetches and maps issues to LOOM artifacts
- [ ] Imported issues stored as L3 knowledge, World-scoped
- [ ] API tokens stored in SecureKeyStore (Phase 9)
- [ ] GitLab adapter implements same interface as GitHub adapter
- [ ] Import is one-way (no write-back to GitHub/GitLab)

**Tests:**
- Unit: GitHub adapter authenticates with valid token
- Unit: Issue import maps title, body, labels to LOOM artifact
- Unit: Import respects World scoping
- Unit: Invalid token returns clear error
- Unit: GitLab adapter interface matches GitHub adapter

---

### 14-06: Implement Linear Integration (Task Sync)

**Priority:** P2
**Assignee:** Any
**Depends on:** 14-05
**Files:**
- `packages/core/src/integration/linear/LinearAdapter.ts` — new: Linear API adapter
- `packages/core/src/integration/linear/LinearAdapter.test.ts` — new tests
- `packages/core/src/integration/linear/TaskSyncService.ts` — new: bi-directional task sync
- `packages/core/src/integration/linear/types.ts` — new: Linear integration types

**Scope:**
Linear integration goes one step beyond GitHub: it supports *bidirectional task sync*. LOOM World state can push task status to Linear, and Linear task updates can pull into LOOM. This is the first step toward the OKR integration vision (V4).

1. `LinearAdapter` connects via Linear API (OAuth or API key)
2. `TaskSyncService` maps LOOM concepts to Linear concepts: World = Project, Pattern Instance = Issue, Session = Activity
3. Sync is *governed* — outbound writes require A0 approval, inbound updates require Operator review
4. Sync frequency configurable: manual, hourly, daily
5. Conflict resolution: LOOM state is canonical (Mandate #4 extended — if LOOM and Linear disagree, LOOM wins with Operator confirmation)

**Acceptance Criteria:**
- [ ] `LinearAdapter.connect(credentials)` authenticates with Linear API
- [ ] `TaskSyncService.push(worldId)` exports World task state to Linear
- [ ] `TaskSyncService.pull(worldId)` imports Linear updates into LOOM
- [ ] Outbound sync requires A0 governance approval
- [ ] Inbound sync requires Operator review before applying
- [ ] Sync conflicts resolved in favor of LOOM state (with Operator confirmation)

**Tests:**
- Unit: Push maps World state to Linear project/issue structure
- Unit: Pull maps Linear issues to LOOM artifacts
- Unit: Outbound sync blocked without A0 approval
- Unit: Conflict resolution favors LOOM state
- Integration: Round-trip sync (push, modify in Linear, pull) preserves data integrity

---

### 14-07: Phase 14 Integration Tests

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL Phase 14 tasks
**Files:**
- `packages/core/src/__tests__/integration/phase14.test.ts` — new integration test suite

**Scope:**
Comprehensive tests validating Phase 14 exit criteria: LOOM interfaces with external protocols without losing governance.

1. **Governance Preservation:** All external interactions pass through A0 — no governance bypass via MCP/GitHub/Linear
2. **MCP End-to-End:** External MCP client can discover Worlds, query context, invoke Patterns (with approval)
3. **Import/Export Cycle:** Import agents.md, export Pattern as Goose DSL — round-trip produces valid artifacts
4. **Replication:** Cross-model validation detects divergence and escalates
5. **V1 Regression:** All existing tests continue to pass
6. **Security:** No credentials leaked in logs or L2 entries

**Acceptance Criteria:**
- [ ] All V1 + Phase 13 tests continue to pass (zero regressions)
- [ ] External MCP interactions governed by A0
- [ ] Import/export produces valid artifacts in target formats
- [ ] Replication escalation works under governance
- [ ] No credentials appear in logs, L2 entries, or audit trail content fields

**Tests:**
- This IS the test suite. 12-15 test cases covering all Phase 14 deliverables and governance preservation.

---

# Phase 15: Multi-Operator & Org LOOM (Future)

**Goal:** Enable team/organizational use of LOOM with trust, permissions, and collaboration.
**Depends on:** Phase 14 (external integration stability)
**Exit Criteria:** Multiple Operators can collaborate within LOOM governance. Parallel sessions supported. Shared resources governed.

**Feature IDs:** WD-10, AG-10, ED-05, ED-06

## Phase 15 Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 15-01 | Implement Operator ID Tracking | 3h | — | TODO |
| 15-02 | Implement Org Telos (Shared Identity Layer) | 4h | 15-01 | TODO |
| 15-03 | Implement Joint Worlds (Multi-Operator) | 4h | 15-01, 15-02 | TODO |
| 15-04 | Implement Cross-Operator Trust Levels | 3h | 15-01 | TODO |
| 15-05 | Implement Shared Pattern Libraries | 3h | 15-03, 15-04 | TODO |
| 15-06 | Implement Permission Roles | 4h | 15-04 | TODO |
| 15-07 | Implement Parallel Session Views | 4h | 15-03 | TODO |
| 15-08 | Phase 15 Integration Tests | 3h | ALL | TODO |

**Total estimated effort:** ~28 hours

---

## Phase 15 Task Details

### 15-01: Implement Operator ID Tracking

**Priority:** P0
**Assignee:** Any
**Feature ID:** ED-05
**Files:**
- `packages/core/src/operator/OperatorIdentity.ts` — new: Operator identity management
- `packages/core/src/operator/OperatorIdentity.test.ts` — new tests
- `packages/core/src/operator/types.ts` — new: Operator types
- `packages/db/src/schema/operator.ts` — new: operators table, operator_sessions table
- `packages/core/src/governance/a0.ts` — extend A0 to include operator_id in all authorization checks
- `packages/core/src/memory/layers.ts` — tag all writes with operator_id

**Scope:**
Every write operation in LOOM must be attributable to an Operator. The V1 system assumes a single Operator. This task adds explicit Operator identity tracking — the foundation for all multi-Operator features.

1. Create `operators` table: id, display_name, created_at, last_active
2. Create `OperatorIdentity` service: authenticate, identify, track
3. Tag all L2, L3, L4 write operations with `operator_id`
4. Tag all A0 authorization events with `operator_id`
5. Audit trail (Phase 12) entries now include `operator_id`
6. Single-Operator mode still works — auto-assigns the default Operator ID. No UX change for single users

**Acceptance Criteria:**
- [ ] `operators` table created with id, display_name, timestamps
- [ ] All L2 write operations tagged with `operator_id`
- [ ] All L3 write operations tagged with `operator_id`
- [ ] All L4 write operations tagged with `operator_id`
- [ ] All A0 audit entries include `operator_id`
- [ ] Single-Operator mode functions identically to pre-Phase 15 behavior
- [ ] `OperatorIdentity.current()` returns the active Operator

**Tests:**
- Unit: Write operation without operator_id throws error
- Unit: Default Operator auto-assigned in single-Operator mode
- Unit: A0 audit entries include operator_id
- Unit: Multiple Operators can be created and distinguished

---

### 15-02: Implement Org Telos (Shared Identity Layer)

**Priority:** P0
**Assignee:** Any
**Depends on:** 15-01
**Files:**
- `packages/core/src/memory/L4TelosLayer.ts` — extend with Org Telos type
- `packages/core/src/operator/OrgTelos.ts` — new: Org Telos management
- `packages/core/src/operator/OrgTelos.test.ts` — new tests
- `packages/db/src/schema/operator.ts` — extend with `org_telos` table
- `packages/core/src/governance/meta.ts` — add Org Telos governance rules

**Scope:**
Org Telos is a new L4 record type — the shared identity/purpose of an organization. It sits *above* World Telos in the hierarchy: Org Telos constrains what Worlds can be created and what their Telos can say.

1. Create `org_telos` table: id, content, version, created_by (operator_id), created_at
2. Org Telos is L4 — same immutability rules as World/Agent Telos
3. Org Telos can only be written by designated Org Admins (new permission level)
4. Hierarchy: Org Telos > World Telos > Agent Telos > Session Intent
5. World creation validates that World Telos does not contradict Org Telos
6. Org Telos sets `max_autonomy_level` for the organization (ED-06 foundation)

**Acceptance Criteria:**
- [ ] `org_telos` table created with versioning (append-only like all L4)
- [ ] Org Telos readable by all Operators in the Org
- [ ] Org Telos writable only by Org Admin Operators
- [ ] World Telos validated against Org Telos on creation/modification
- [ ] Org Telos includes `max_autonomy_level` field
- [ ] L4 hierarchy enforced: Org > World > Agent > Session

**Tests:**
- Unit: Org Telos write by Org Admin succeeds
- Unit: Org Telos write by non-Admin throws `OrgTelosPermissionError`
- Unit: World Telos contradicting Org Telos blocked at creation
- Unit: `max_autonomy_level` from Org Telos caps World autonomy settings
- Unit: Org Telos versioning preserves history

---

### 15-03: Implement Joint Worlds (Multi-Operator)

**Priority:** P0
**Assignee:** Any
**Depends on:** 15-01, 15-02
**Feature ID:** WD-10
**Files:**
- `packages/core/src/world/JointWorldService.ts` — new: multi-Operator World management
- `packages/core/src/world/JointWorldService.test.ts` — new tests
- `packages/core/src/world/types.ts` — extend World type with `operator_ids[]` and sharing mode
- `packages/db/src/schema/world.ts` — add `world_operators` junction table
- `packages/core/src/memory/layers.ts` — extend L2 to handle multi-Operator episodic data

**Scope:**
Joint Worlds are Worlds shared between multiple Operators. This is the core collaboration primitive — multiple people contributing to the same World, with all writes attributed and governed.

1. Create `world_operators` junction table: world_id, operator_id, role (owner, contributor, viewer), joined_at
2. `JointWorldService` manages Operator membership in Worlds
3. L2 entries in Joint Worlds tagged with operator_id — "who said what" is always clear
4. World Telos changes in Joint Worlds require agreement from the owner (or all contributors, configurable)
5. Three sharing modes: `private` (default, single Operator), `shared` (invited Operators), `org-wide` (all Org members)
6. World isolation still applies — Joint Worlds are still isolated from other Worlds

**Acceptance Criteria:**
- [ ] `JointWorldService.invite(worldId, operatorId, role)` adds an Operator to a World
- [ ] `JointWorldService.revoke(worldId, operatorId)` removes an Operator from a World
- [ ] L2 entries in Joint Worlds include the writing Operator's ID
- [ ] World Telos changes require owner approval in shared mode
- [ ] Three sharing modes function correctly (private, shared, org-wide)
- [ ] World isolation maintained — Joint Worlds cannot access other Worlds' data

**Tests:**
- Unit: Invite adds Operator with correct role
- Unit: Revoke removes Operator and blocks future access
- Unit: L2 writes attributed to the correct Operator
- Unit: Telos change blocked without owner approval
- Unit: Private World invisible to uninvited Operators
- Integration: Two Operators writing to same World produces correctly attributed L2 entries

---

### 15-04: Implement Cross-Operator Trust Levels

**Priority:** P1
**Assignee:** Any
**Depends on:** 15-01
**Files:**
- `packages/core/src/operator/TrustService.ts` — new: trust level management
- `packages/core/src/operator/TrustService.test.ts` — new tests
- `packages/core/src/operator/types.ts` — extend with trust types
- `packages/db/src/schema/operator.ts` — add `operator_trust` table
- `packages/core/src/governance/a0.ts` — extend A0 with trust-based authorization

**Scope:**
Not all Operators in an Org have the same trust level. Cross-Operator trust defines what an Operator can do within shared resources.

1. Define trust levels: `owner` (full control), `contributor` (read/write within bounds), `viewer` (read-only), `restricted` (limited read, no write)
2. Trust is per-relationship: Operator A trusts Operator B at `contributor` level in World X, but `viewer` in World Y
3. A0 incorporates trust level into authorization decisions — a `viewer` attempting an L2 write is blocked
4. Trust assignments require the World owner's approval
5. Org Admin can set default trust levels for new Org members

**Acceptance Criteria:**
- [ ] Trust levels defined: owner, contributor, viewer, restricted
- [ ] `TrustService.setTrust(worldId, operatorId, level)` sets trust for an Operator in a World
- [ ] A0 incorporates trust level into authorization — viewer cannot write
- [ ] Trust assignment requires World owner approval
- [ ] Org Admin can set default trust level for new members
- [ ] Trust levels queryable: "What can Operator X do in World Y?"

**Tests:**
- Unit: Owner has full permissions
- Unit: Viewer blocked on write attempts
- Unit: Contributor can write L2 but not L4
- Unit: Trust assignment without owner approval blocked
- Unit: Default trust applied to new Org members

---

### 15-05: Implement Shared Pattern Libraries

**Priority:** P2
**Assignee:** Any
**Depends on:** 15-03, 15-04
**Files:**
- `packages/core/src/pattern/SharedPatternLibrary.ts` — new: shared Pattern management
- `packages/core/src/pattern/SharedPatternLibrary.test.ts` — new tests
- `packages/core/src/pattern/PatternRegistry.ts` — extend with shared library awareness
- `packages/db/src/schema/pattern.ts` — add `shared_patterns` table with visibility scope

**Scope:**
Patterns are currently World-scoped (L3). Shared Pattern Libraries allow Patterns to be published at the Org level so multiple Worlds (and multiple Operators) can use them.

1. Create `shared_patterns` table: pattern_id, org_id, visibility (org-wide, selected-worlds), published_by, version
2. `SharedPatternLibrary` manages publishing, versioning, and discovery of shared Patterns
3. Shared Patterns are *copies* — publishing creates a snapshot. The source World's Pattern can evolve independently
4. Shared Patterns are read-only for consumers — customization requires "fork to World" (creates a World-scoped copy)
5. Versioning: when a shared Pattern is updated, consumers see "update available" but are not auto-migrated
6. Trust levels apply: `restricted` Operators cannot access shared Patterns

**Acceptance Criteria:**
- [ ] `SharedPatternLibrary.publish(patternId, visibility)` publishes a Pattern to the Org
- [ ] Published Patterns discoverable by Operators with sufficient trust level
- [ ] Shared Patterns are read-only copies — source and shared diverge independently
- [ ] "Fork to World" creates a World-scoped editable copy
- [ ] Version updates notify consumers without auto-migrating
- [ ] `restricted` trust level blocks access to shared Patterns

**Tests:**
- Unit: Publish creates a snapshot in shared_patterns
- Unit: Source Pattern modification does not change shared version
- Unit: Fork creates an independent World-scoped copy
- Unit: Restricted Operator cannot access shared Patterns
- Unit: Version update increments version and preserves previous

---

### 15-06: Implement Permission Roles

**Priority:** P1
**Assignee:** Any
**Depends on:** 15-04
**Feature ID:** ED-06
**Files:**
- `packages/core/src/operator/PermissionRoles.ts` — new: role-based permission system
- `packages/core/src/operator/PermissionRoles.test.ts` — new tests
- `packages/core/src/operator/types.ts` — extend with role types
- `packages/db/src/schema/operator.ts` — add `roles` and `role_permissions` tables
- `packages/core/src/governance/a0.ts` — extend A0 with role-based authorization

**Scope:**
Trust levels (15-04) provide per-World permissions. Permission Roles provide *Org-wide* role definitions that standardize what classes of Operators can do. This is not a full RBAC system — it is a minimal, opinionated role structure.

1. Define built-in roles: `OrgAdmin` (manages Org Telos, all Worlds), `WorldOwner` (manages owned Worlds), `Contributor` (read/write in assigned Worlds), `Observer` (read-only everywhere)
2. Roles are additive — an Operator can have multiple roles
3. A0 checks role permissions before trust-level permissions (role is the ceiling, trust is the floor within that ceiling)
4. Custom roles supported but discouraged until real usage demands them (keep it simple)
5. Role assignment requires OrgAdmin approval

**Acceptance Criteria:**
- [ ] 4 built-in roles defined with clear permission boundaries
- [ ] `PermissionRoles.assign(operatorId, role)` assigns a role
- [ ] A0 checks role before trust level (role ceiling, trust floor)
- [ ] Roles are additive — multiple roles combine permissions
- [ ] Role assignment requires OrgAdmin approval
- [ ] Custom role creation supported via configuration

**Tests:**
- Unit: OrgAdmin can manage Org Telos, other roles cannot
- Unit: WorldOwner can manage owned Worlds, Observer cannot
- Unit: Multiple roles combine correctly (union of permissions)
- Unit: Role assignment without OrgAdmin approval blocked
- Unit: A0 enforces role ceiling even when trust is higher

---

### 15-07: Implement Parallel Session Views

**Priority:** P2
**Assignee:** Any
**Depends on:** 15-03
**Files:**
- `apps/web/src/components/parallel/ParallelSessionManager.tsx` — new: multi-session layout
- `apps/web/src/components/parallel/SessionPane.tsx` — new: individual session pane
- `apps/web/src/components/parallel/ParallelSessionManager.test.tsx` — new: component tests
- `packages/core/src/session/ParallelSessionService.ts` — new: multi-session coordination
- `packages/core/src/session/ParallelSessionService.test.ts` — new tests

**Scope:**
Allow an Operator to view and interact with up to 12 sessions simultaneously. This is primarily a UI/coordination challenge — the session engine already supports multiple concurrent sessions.

1. Create `ParallelSessionManager` component with configurable pane layout (2x1, 2x2, 3x2, 4x3)
2. Each pane is an independent `SessionPane` running a full Session Runner
3. `ParallelSessionService` coordinates: prevent accidental cross-session actions, manage focus, aggregate notifications
4. Sessions can be in different Worlds — each pane is fully isolated
5. WebSocket connections multiplexed — one connection per session, all through a single WebSocket manager
6. Performance guard: warn when >6 active streaming sessions (model/memory pressure)

**Acceptance Criteria:**
- [ ] Up to 12 session panes displayable simultaneously
- [ ] Configurable layouts: 2x1, 2x2, 3x2, 4x3
- [ ] Each pane runs an independent session with full functionality
- [ ] Cross-session actions prevented (typing in one pane does not affect another)
- [ ] Sessions in different Worlds maintain isolation
- [ ] Performance warning when >6 sessions actively streaming

**Tests:**
- Unit: Layout configurations produce correct pane counts
- Unit: Cross-session isolation maintained (actions in pane A don't affect pane B)
- Unit: Performance warning triggered at threshold
- Component: Render 4 panes simultaneously without errors
- Integration: Two sessions in different Worlds stream independently

---

### 15-08: Phase 15 Integration Tests

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL Phase 15 tasks
**Files:**
- `packages/core/src/__tests__/integration/phase15.test.ts` — new integration test suite

**Scope:**
Comprehensive tests validating Phase 15 exit criteria: multiple Operators can collaborate within LOOM governance.

1. **Multi-Operator Lifecycle:** Create Org, add Operators, create Joint World, both Operators write, verify attribution
2. **Trust Enforcement:** Viewer cannot write; Contributor can write L2 but not L4; Owner can do everything
3. **Org Telos Hierarchy:** Org Telos constrains World Telos — World that violates Org Telos blocked
4. **Shared Patterns:** Publish, discover, fork — the full lifecycle
5. **Permission Roles:** Role ceiling enforced even when trust is higher
6. **Parallel Sessions:** Multiple sessions in the same Joint World produce correctly attributed L2 entries
7. **V1 + V2 Regression:** All existing tests continue to pass

**Acceptance Criteria:**
- [ ] All V1 + Phase 13 + Phase 14 tests continue to pass (zero regressions)
- [ ] Multi-Operator write attribution correct in Joint Worlds
- [ ] Trust levels enforced by A0
- [ ] Org Telos hierarchy prevents contradictory World Telos
- [ ] Shared Pattern lifecycle works end-to-end
- [ ] No security vulnerabilities in multi-Operator flows

**Tests:**
- This IS the test suite. 15-20 test cases covering all Phase 15 deliverables, governance preservation, and full regression.

---

# Parallel Execution Guide

```
=== Phase 13 (V2 Features) ===

Track A (Context & Exploration):   13-01 (PCN) ──────────────────────────────┐
                                                                              ├─→ 13-09 (Insights Chat)
Track B (Spatial & Monitoring):    13-04 (Continuum) → 13-06 (Monitoring) ───┘

Track C (Multi-Model):             13-03 (Multi-Model) → 13-07 (Evaluation + RLHF)

Track D (Patterns & Types):       13-02 (Time Constraints) ─┐
                                  13-05 (World Types) ───────┤ (all independent)
                                  13-08 (Pattern Trails) ────┤
                                  13-10 (Machine Specs) ─────┘

Convergence:                       13-11 (Integration Tests — needs ALL)

Maximum parallelism: 4 agents — one per track.


=== Phase 14 (External Integration) ===

Track E (Protocols):               14-01 (MCP Adapter) → 14-02 (Capability Imports)

Track F (Export & Validation):     14-03 (Pattern Export) ─┐ (independent)
                                   14-04 (Replication) ────┘

Track G (VCS & PM):               14-05 (GitHub/GitLab) → 14-06 (Linear)

Convergence:                       14-07 (Integration Tests — needs ALL)

Maximum parallelism: 3 agents — one per track.


=== Phase 15 (Multi-Operator) ===

Track H (Identity Foundation):     15-01 (Operator ID) → 15-02 (Org Telos) → 15-03 (Joint Worlds)
                                                       → 15-04 (Trust Levels) → 15-06 (Permission Roles)

Track I (Shared Resources):        (after 15-03 + 15-04) → 15-05 (Shared Patterns)

Track J (UI):                      (after 15-03) → 15-07 (Parallel Sessions)

Convergence:                        15-08 (Integration Tests — needs ALL)

Maximum parallelism: Phase 15 is highly sequential due to foundational dependencies.
  - Start: 15-01 (required by everything)
  - Then parallel: 15-02 + 15-04 (both need only 15-01)
  - Then parallel: 15-03 (needs 15-01 + 15-02) alongside 15-06 (needs 15-04)
  - Then parallel: 15-05 (needs 15-03 + 15-04) alongside 15-07 (needs 15-03)
  - Final: 15-08

Maximum parallelism: 2 agents (after 15-01 completes).


=== Cross-Phase Dependencies ===

Phase 13 must complete before Phase 14 starts (V2 stability required).
Phase 14 must complete before Phase 15 starts (integration layer required).
Phases are strictly sequential at the phase level, parallel within each phase.


=== Total Effort Summary ===

Phase 13: ~38 hours (11 tasks)
Phase 14: ~23 hours (7 tasks)
Phase 15: ~28 hours (8 tasks)
─────────────────────────────
Total:    ~89 hours (26 tasks)
```
