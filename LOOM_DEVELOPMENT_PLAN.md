# LOOM Engine — Development Plan

**Version:** 2.0
**Status:** Active
**Last Updated:** 2026-03-01

> This document translates the LOOM Engine conceptual specification into an actionable development plan. It consolidates all canonical and V2 materials into phases, features, stack decisions, and a detailed TODO.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
   - 1.5 [Engineering Disciplines Framework](#15-engineering-disciplines-framework) *(v2.0)*
   - 1.6 [DeepMind Autonomy Levels](#16-deepmind-autonomy-levels--unifying-control-framework) *(v2.0)*
2. [Technical Stack](#2-technical-stack)
3. [Development Phases](#3-development-phases) — includes Phase 0.5 MVP Sprint *(v2.0)*
4. [Complete Feature List](#4-complete-feature-list) — includes 4.12 Engineering Discipline Features *(v2.0)*
5. [Detailed TODO](#5-detailed-todo)
6. [Dependencies & Critical Path](#6-dependencies--critical-path)
7. [Validation Strategy](#7-validation-strategy)
8. [OPUS Review — Discrepancy Resolutions](#8-opus-review--discrepancy-resolutions-v20) *(v2.0)*

---

## 1. Executive Summary

### What We're Building

The **LOOM Engine** is an **Operator-first cognitive architecture** implemented as a desktop application. It enables structured, governed AI collaboration across long time horizons without losing context, identity, or control.

### Core Philosophy (Non-Negotiables)

1. **Operator Supremacy** — All systems serve Operator intent
2. **META Governance** — No component bypasses governance
3. **World Isolation** — Projects never bleed implicitly
4. **Explicit Pathways** — No silent state changes
5. **Identity Protection** — Telos is immutable without explicit authorization
6. **Structured Execution** — `Dispatch → Assemble → Execute` (never direct prompting)
7. **Silence is Default** — Nothing auto-loads, nothing persists without consent
8. **Local-First** — Prefer local/cheap models; external APIs are opt-in
9. **Primacy Protection** — AI cannot overwrite fragile Operator intent at session start
10. **Model-Agnostic** — Works with any LLM (local or cloud) without lock-in

### Implementation Approach

The system is built as a **desktop harness** (Electron) that:
- Manages isolated Worlds
- Runs governed Sessions with Intent Envelopes
- Executes Patterns through LLM-backed Agents
- Writes only explicit, structured continuity to memory
- Enforces META/A0 constraints at every operation
- Defaults to local models for 80%+ of interactions
- Provides keyboard-first, themeable UI with real-time streaming

---

## 1.5 Engineering Disciplines Framework

LOOM independently implements three emerging engineering disciplines recognized by the industry in 2025-2026. This section makes that mapping explicit — both for strategic positioning and to validate that the architecture is on the right track.

### 1.5.1 Context Engineering

**Definition:** The systematic design of everything an LLM sees at runtime — system prompts, retrieved documents, memory, tool definitions, and prior outputs. The goal is to provide the "right tokens" so the agent doesn't have to guess or fetch information mid-task. Recognized as the successor to "prompt engineering" (Gartner, 2025).

**LOOM implements this as the 4-Layer Memory Model:**

| Context Engineering Principle | LOOM Implementation | Layer |
|-------------------------------|---------------------|-------|
| Static instructions (immutable identity/constraints) | L4 — Telos | Identity |
| Semi-static knowledge (domain refs, definitions) | L3 — Knowledge (World/Pattern/Agent definitions) | Knowledge |
| Dynamic conversation (session history, decisions) | L2 — Episodic (append-only session logs) | Continuity |
| Ephemeral scratchpad (working memory) | L1 — Active (in-memory, flushed on close) | Runtime |
| Context budget management | ContextAssembler + SpineGenerator | Phase 2, 6 |

**Gaps to close:**
- Context quality scoring (relevance ranking when L3 exceeds token budget)
- Tool-augmented retrieval (agents fetch context on demand via governed tools)
- Token budget optimization with dynamic assembly per task type

### 1.5.2 Intent Engineering

**Definition:** Encoding goals, values, and decision hierarchies into the system. The "strategy" layer ensuring agents optimize for the right outcomes — not just any output, but the *intended* output.

**LOOM implements this as:**

| Intent Engineering Principle | LOOM Implementation | Status |
|------------------------------|---------------------|--------|
| Intent source ("never infer, always ask") | Operator Supremacy (AI_CODEX Mandate #1) | Core mandate |
| Intent capture (question-only phase) | Primacy Protection (Phase 0 of all Patterns) | Implemented |
| Intent contract (immutable session expectations) | Session Intent Envelope (SIE) | Implemented |
| Intent store (highest-level purpose) | L4 Telos (Operator, World, Agent) | Implemented |
| Intent boundary enforcement | Silence by Default (AI_CODEX Mandate #2) | Core mandate |

**Gaps to close:**
- Intent decomposition pipeline: Goal → Plan → Task → Action
- Intent drift detection: alerting when execution diverges from SIE during a session
- Intent verification: checking outcomes against original intent at session end
- Intent persistence: tracking the original intent through all subsequent actions

### 1.5.3 Specification Engineering (Spec-Based Development)

**Definition:** Driving agent behavior through formal or semi-formal specifications rather than imperative code or ad-hoc prompts. Splits work into *thinking* (humans write specifications) and *doing* (agents execute against specs). Recognized by Thoughtworks and ICSE 2026 as an emerging methodology.

**LOOM implements five core Spec Engineering sub-concepts:**

| Spec Engineering Concept | Definition | LOOM Equivalent | Status |
|--------------------------|-----------|-----------------|--------|
| **Self-Contained Problem Statements** | Stating a problem with enough context that it is solvable without further information | Session Intent Envelope — captures goal, constraints, audience, scope boundaries | Implemented (Phase 2) |
| **Acceptance Criteria** | Clearly defining what "done" looks like so the agent knows when to stop | Pattern Completion Conditions — define exit criteria per Pattern step | Implemented (Phase 5) |
| **Constraint Architecture** | Explicitly defining must-do, must-not-do, and escalation points | META Rules + A0 Enforcement + Agent Role Constraints + Bounded Initiative | Implemented (Phases 1, 4) |
| **Decomposition** | Breaking projects into modular sub-tasks that can be executed and verified independently | Pattern 10-Phase Lifecycle — each phase is a governed, verifiable unit of work | Implemented (Phase 5) |
| **Evaluation** | Building measurable test cases to prove output quality | Replication Layer (Phase 14) + Agent Behavior Signals (Phase 4) | Partial — Behavior Signals implemented, Replication Layer deferred |

**Gaps to close:**
- Machine-parseable specs: auto-generate test skeletons, conformance checks, and task checklists from markdown definitions in L3
- Spec validation: programmatic verification that agent output conforms to spec constraints

### 1.5.4 How the Three Disciplines Intersect in LOOM

```
Specification Engineering (what to build)
    │  L3 Knowledge specs define patterns, agents, constraints
    ↓
Intent Engineering (why to build it, for whom)
    │  SIE + Primacy + L4 Telos encode purpose and boundaries
    ↓
Context Engineering (what the agent sees when building it)
    │  4-Layer assembly delivers the right tokens to the model
    ↓
Governed Execution (Pattern → Agent → Output)
    │  META authorizes, A0 enforces, ENGINE executes
    ↓
Structured Continuity (L2 summary → next session)
```

> **Strategic positioning:** LOOM is — architecturally — a Context Engineering + Intent Engineering + Specification Engineering platform. These disciplines describe what LOOM already does. This framework is not new functionality to build; it is the vocabulary for explaining what exists.

---

## 1.6 DeepMind Autonomy Levels — Unifying Control Framework

Google DeepMind proposed a 5-level taxonomy of human-agent interaction (2024-2025) that defines how much control the human retains versus how much the agent acts independently. LOOM already has the primitives for every level, but they are scattered across separate systems (Tempo, Session Classes, Bounded Initiative, Dispatch Gate, Anti-Agency Constraint) with no unified control surface.

### The 5 Levels

| Level | Name | Description | LOOM Equivalent |
|-------|------|-------------|-----------------|
| **L1** | **Operator** | Human in charge at all times. Agent performs simple tasks with strict approval. | Operator Supremacy + Anti-Agency Constraint (current default) |
| **L2** | **Collaborator** | Human and agent plan/execute together. Easy transfer of control. | Primacy Protection + SIE negotiation + Pattern handoffs |
| **L3** | **Consultant** | Agent takes initiative in planning, offers suggestions. Human provides guidance. | Tempo Andante/Adagio + Pattern suggestion + Dispatcher recommendations |
| **L4** | **Approver** | Agent acts independently, pauses for human approval on high-risk actions. | DEEP Session Class + Dispatch Gate + A0 budget enforcement |
| **L5** | **Observer** | Agent is fully autonomous. End-to-end execution without supervision. | Not currently supported (by design — requires mature governance) |

### The Autonomy Dial

LOOM needs a single, explicit **Autonomy Level** setting that acts as a master control, cascading across all subsystems:

```
┌─────────────────────────────────────────────────────────┐
│              AUTONOMY LEVEL (Operator-Set)               │
│                                                          │
│   L1 ──── L2 ──── L3 ──── L4 ──── L5                   │
│   Full         Collaborative       Autonomous            │
│   Control      Partnership         (Governed)            │
│                                                          │
│   Current default: L1-L2 (Operator Supremacy)           │
│   Maximum allowed: Configurable per World               │
└─────────────────┬───────────────────────────────────────┘
                  │ Cascades to:
                  ▼
  Session Class  │  Tempo        │  Agent Initiative  │  Tool Access
  ─────────────  │  ─────────── │  ───────────────── │  ───────────
  L1: THIN only  │  L1: Allegro │  L1: Execute only  │  L1: None/Read
  L2: THIN/STD   │  L2: Andante │  L2: Propose+wait  │  L2: Read+safe
  L3: STD default│  L3: Andante │  L3: Suggest+act   │  L3: Most tools
  L4: Any        │  L4: Any     │  L4: Act, pause    │  L4: All governed
  L5: Any        │  L5: Any     │      on high-risk  │  L5: All (audit)
```

### Implementation

- `autonomy_level`: L1 variable (session-scoped, like Tempo), values 1-5, default 1
- `max_autonomy_level`: World config (governance ceiling per World)
- `max_autonomy_level`: Org Telos (future — organizational ceiling)
- All existing gate checks reference autonomy level (DispatchGate, A0Enforcer, Agent initiative bounds, Tool access permissions)

### Anti-Agency Constraint Reframed

The Anti-Agency Constraint ("No emergent, implicit, or self-directed agency") is reframed as **"No ungoverned agency."** Governed autonomy — where the Operator explicitly chooses the level, META enforces the ceiling, A0 monitors continuously, and the Operator can revoke at any moment — is consistent with Operator Supremacy. The Operator who chooses L4 is *exercising* supremacy by choosing to delegate.

### Rollout

| When | What |
|------|------|
| **MVP** | Default to L1-L2. Don't build the dial yet. All existing behavior is correct. |
| **V1.5** | Add `autonomy_level` to Session state, `max_autonomy_level` to World config. Expose L1-L3 in UI. |
| **V2** | Enable L4 (Approver). Requires robust tool governance (Phase 11) and audit trail (Phase 12). |
| **V3+** | Enable L5 (Observer) with full safeguards. Requires mature governance, proven A0, user trust. |
| **Org-LOOM** | Org Telos sets max autonomy for the organization. Different teams/Worlds operate at different levels. |

---

## 2. Technical Stack

### 2.1 Frontend (Operator UI)

| Component | Technology | Justification |
|-----------|------------|---------------|
| Framework | React 18 + TypeScript | Type safety, ecosystem maturity, component model |
| Styling | Tailwind CSS 4 | Utility-first, rapid iteration, theme support |
| Components | shadcn/ui + Radix UI | Accessible, customizable, keyboard support |
| State | Zustand 5 | Lightweight, TypeScript-native, persistence |
| Icons | Lucide Icons | Consistent, comprehensive icon set |
| Graphs | @xyflow/react | Dependency visualization, interactive nodes |
| DnD | dnd-kit | Drag-and-drop for Kanban-style views |
| Terminal | xterm.js | Integrated terminal for advanced users |
| Themes | 25+ built-in | Dracula, Nord, Catppuccin, Tokyo Night, etc. |

### 2.2 Desktop Shell

| Component | Technology | Justification |
|-----------|------------|---------------|
| Runtime | Electron 33+ | Cross-platform, mature, Node.js access |
| Bundler | Vite | Fast HMR, ESM-native, Electron compatibility |
| Packaging | electron-builder | Multi-platform builds, auto-update support |
| IPC | **electron-trpc** *(replaces contextBridge)* | Type-safe RPC eliminates manual handler registration bugs; end-to-end TypeScript safety between renderer and main process |
| Streaming | WebSocket | Real-time agent output to UI |

### 2.3 Persistence Layer

| Component | Technology | Justification |
|-----------|------------|---------------|
| Database | SQLite | Embedded, no server, portable, reliable |
| ORM | Drizzle ORM | Type-safe, SQL-first, migrations, lightweight |
| File Storage | Local filesystem | Markdown canonical, DB derived |
| Project Dir | `.loom/` | Visible, git-friendly, portable |

**Key Constraint:** The database is an **accelerator**, not the source of truth. All authoritative data must be rebuildable from markdown.

### 2.4 AI Integration (Model-Agnostic)

| Component | Technology | Justification |
|-----------|------------|---------------|
| Local Models | **Ollama (PRIMARY)** | Privacy, offline, cost elimination for THIN sessions |
| Orchestration | **OrchestratorPort interface** (LangChain as default impl) | Abstract orchestration behind a port; LangChain implements today, swappable tomorrow |
| Cloud Backends | OpenAI, Anthropic, Google, DeepSeek | Multi-model support for STANDARD/DEEP sessions |
| Streaming UI | AI SDK (Vercel) | Well-maintained streaming UX primitives, model-agnostic |

**Key Constraints:**
- LangChain is **plumbing behind an abstraction**, not an agent runtime
- No autonomous LangChain agents — only Pattern-bound chains
- Local models are the **default**; cloud is opt-in
- Per-session model selection visible in UI
- Per-Agent model preferences supported
- LangChain is wrapped behind `OrchestratorPort` interface for future swappability

### 2.5 Testing

| Component | Technology | Justification |
|-----------|------------|---------------|
| Unit/Integration | Vitest | Fast, ESM-native, TypeScript support |
| E2E | Playwright | Cross-browser, Electron support |
| API Mocking | MSW | Network-level mocking for AI calls |

### 2.6 Development Tools

| Component | Technology |
|-----------|------------|
| Package Manager | pnpm |
| Monorepo | pnpm workspaces |
| Linting | ESLint + Prettier |
| Type Checking | TypeScript strict mode |
| Git Hooks | Husky + lint-staged |
| Documentation | TypeDoc |

### 2.7 Tech Stack Amendments (v2.0 — from OPUS Review)

**Replaced:**

| Old | New | Rationale |
|-----|-----|-----------|
| Manual IPC handlers (contextBridge) | **electron-trpc** | Eliminates entire class of handler registration bugs; end-to-end type safety |
| LangChain as direct dependency | **OrchestratorPort** (LangChain as default impl) | Reduces coupling; enables future swap to ADK, native, or other orchestrators |

**Added:**

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Markdown processing | Marked or MDX | Required for "Markdown is Canonical" — parse, render, validate markdown specs |
| Data fetching/caching | @tanstack/query | Handles loading states, caching, refetching for the web UI layer |
| Agent shell access | node-pty (future) | Run commands, capture output, stream to xterm.js for agent tool access |
| Streaming UI primitives | AI SDK (Vercel) | Well-maintained, model-agnostic streaming response handling |

**OrchestratorPort Interface:**
```typescript
interface OrchestratorPort {
  assemble(layers: ContextLayers): AssembledContext;
  route(context: AssembledContext, pipeline: Pipeline): ExecutionPlan;
  execute(plan: ExecutionPlan): AsyncIterable<ExecutionEvent>;
}
// LangChain implements this today. ADK or a native implementation could replace it tomorrow.
```

**Deferred for MVP (keep in plan, don't build yet):**
- @xyflow/react — graph visualization (not needed until agent/pattern visualization is built)
- dnd-kit — drag and drop (not needed until complex UI interactions are built)

---

## 3. Development Phases

### Phase 0: Foundation (Infrastructure)

**Goal:** Establish project structure, tooling, and basic Electron shell.

**Deliverables:**
- [ ] Project scaffolding (monorepo structure)
- [ ] Electron + Vite + React setup
- [ ] SQLite + Drizzle integration
- [ ] Basic IPC communication layer
- [ ] WebSocket server for streaming
- [ ] File Watcher Setup (chokidar) for MD/DB sync
- [ ] CI/CD pipeline setup
- [ ] Development environment documentation

**Exit Criteria:** Empty Electron app runs, DB connects, WebSocket streams, tests pass.

---

### Phase 0.5: MVP Sprint — Hello World Journey

**Goal:** Define and deliver the smallest version of LOOM that demonstrates persistent, governed AI collaboration to real users. This is the first shippable artifact — it proves the core thesis before the full Phase 0-8 buildout completes.

**The Hello World User Journey:**
1. User opens LOOM → sees "Create your first project" prompt
2. Types project purpose (e.g., "Marketing strategy for my coffee shop")
3. LOOM creates a World with name, purpose, default agent, default pattern
4. User starts chatting — AI remembers everything within the session
5. User closes LOOM, returns next day — everything persists, recap provided automatically
6. User starts a new session — AI provides a structured summary of where they left off
7. After 3 sessions, user has structured output exportable as markdown

**If this journey works, LOOM has demonstrated its core value.** Everything else is enhancement.

**MVP Feature Set (Include):**
1. World CRUD (create, list, open, archive)
2. Session lifecycle (start, chat, close, resume)
3. Multi-model chat (Ollama/OpenAI/Anthropic auto-routing)
4. Session memory (L2 — previous sessions visible and resumable)
5. World memory (L3 — knowledge persists across sessions)
6. Basic governance (World rules enforced, no cross-World data bleed)
7. 1-3 Patterns (Structured Discussion, Research & Synthesis, Production Pipeline)
8. Markdown export (all content exportable as markdown files)
9. Theme system (already built — ship it)

**MVP Feature Set (Exclude — defer to V2+):**
- Agent Evolution Protocol
- Threading system
- OGK (Operator Growth Kernel)
- Feedback loops (micro/macro)
- Opening/Closing rituals
- Multi-World bridging
- Pattern customization / Agent creation UI
- Complex governance rules / Tempo system / Dosage control

**Critical Path to MVP:**
```
Fix IPC handlers (or adopt electron-trpc)
    ↓
Wire UI to real data (World CRUD, Session lifecycle)
    ↓
Implement Context Assembly (L1-L3 content → LLM context window)
    ↓
Implement basic session memory (L2 summaries across sessions)
    ↓
Implement 1-3 core Patterns (Structured Discussion first)
    ↓
Markdown export
    ↓
MVP SHIPS
```

**Exit Criteria:** The Hello World journey works end-to-end. A real user can create a project, have a multi-session conversation with persistent memory, and export results as markdown.

---

### Phase 1: Core Engine (Memory + Governance)

**Goal:** Implement the 4-layer memory model and governance enforcement.

**Deliverables:**
- [ ] L4 Telos storage and immutability enforcement
- [ ] L3 Knowledge storage (Worlds, Patterns, Agents, Rules)
- [ ] L2 Episodic storage (session summaries, decisions, deltas)
- [ ] L1 Active memory (in-process, ephemeral)
- [ ] Write permissions matrix enforcement
- [ ] META governance rules engine
- [ ] A0 enforcement module
- [ ] Cross-layer flow validation
- [ ] **File Watcher & Reconciliation Service** (Solve "Dual-Truth" problem between MD and DB)
- [ ] **DualTruthService interface** — define a reconciliation pattern in `packages/core` that all persistence operations must use. Phase 1 builds the first implementation; the interface ensures all future phases handle MD↔DB reconciliation consistently rather than reinventing it. *(v2.0 — addresses OPUS Discrepancy #10)*

**Exit Criteria:** Can store/retrieve all memory layers, governance blocks unauthorized writes, external file edits sync to DB.

---

### Phase 2: Session Lifecycle

**Goal:** Implement the complete session lifecycle with crash resilience.

**Deliverables:**
- [ ] Session initialization (L4 → L3 → L1 load sequence)
- [ ] Session state machine (pending, active, summarizing, closed)
- [ ] **Session Intent Envelope (SIE)** — immutable contract for drift prevention
- [ ] **Incremental L2 Checkpointing** — crash resilience for long sessions
- [ ] **Continuity Artifact format** — structured L2 summary schema
- [ ] L2 summary generation and storage
- [ ] L1 flush on session end
- [ ] Session metadata logging (non-content)
- [ ] Session recovery (crash handling)
- [ ] **Failure mode handling** — retry, abort, partial-save protocols
- [ ] **Basic Spine Generator** (Prototype for efficient context loading)
- [ ] **Context Assembly Heuristics** (Tuning for latency/cost)
- [ ] **Intent Tracking Pipeline** (prototype) — decompose SIE into sub-intents, track original intent through execution, detect intent drift, verify outcomes against intent at session end. This is the runtime implementation of Intent Engineering (Section 1.5.2). *(v2.0)*
- [ ] **Basic Context Assembly** — naive load-what's-relevant, stuff-the-prompt approach for MVP. Read L4 telos, L3 knowledge, L2 episodic history; assemble into context that fits model window. Full optimization (Spines) deferred to Phase 6. *(v2.0)*

**Exit Criteria:** Can start, run, checkpoint, recover, and properly close sessions with continuity preserved. Intent tracking captures and monitors operator intent throughout session.

---

### Phase 3: Worlds System

**Goal:** Implement World isolation, management, and templates.

**Deliverables:**
- [ ] World creation and configuration
- [ ] World Telos (identity kernel) storage
- [ ] World Manager (local control panel)
- [ ] World-scoped L2 isolation
- [ ] World activation/deactivation
- [ ] Cross-World navigation (safe context switch)
- [ ] World state snapshots
- [ ] **World Templates** — pre-configured templates for common use cases
- [ ] Clone World with fresh L2

**Exit Criteria:** Can create multiple isolated Worlds (including from templates), switch between them safely.

---

### Phase 4: Agent System

**Goal:** Implement Agent definitions, Telos, runtime behavior, and evolution signals.

**Deliverables:**
- [ ] Agent profile schema (PROFILE, TELOS, MODES, TOOLS)
- [ ] Agent Telos storage in L4
- [ ] Agent specification storage in L3
- [ ] Agent runtime instantiation
- [ ] Agent role constraints enforcement
- [ ] Agent escalation protocol
- [ ] A0 Agent supervision
- [ ] **Agent Behavior Signals** — non-content performance/drift indicators for evolution
- [ ] Per-Agent model preferences
- [ ] **Basic Tool Primitives** — filesystem read/write (World-scoped), shell execution (with Operator approval gate), HTTP requests (governed). Agents without tools are chatbots. The full Tool Registry (Phase 11) adds whitelists, risk levels, and sandboxing; this provides day-one capabilities. *(v2.0 — addresses OPUS Discrepancy #6)*

**Exit Criteria:** Agents can be defined, loaded, constrained, their behavior tracked at runtime, and have basic tool access (fs, shell, HTTP) within governance boundaries.

---

### Phase 5: Pattern System

**Goal:** Implement Pattern definitions, execution lifecycle, Primacy Protection, and Tempo.

**Deliverables:**
- [x] Pattern schema (name, purpose, steps, inputs, outputs, constraints)
- [x] Pattern registry in L3
- [ ] Pattern activation validation (META check)
- [x] **Primacy Protection** — question-only phase before execution (Primacy Expansion)
- [x] **Session Intent Envelope sealing** — lock intent before Pattern execution
- [x] **Tempo System** — pace regulation (allegro/andante/adagio)
- [x] 10-phase Pattern lifecycle implementation
- [x] Pattern step execution with Agent handoffs
- [x] Pattern completion conditions
- [ ] Pattern switching protocol
- [x] **Pattern Abort & Rollback** — clean cancellation mid-Pattern
- [ ] **Core Patterns — MVP: ship 3** (Structured Discussion, Research & Synthesis, Production Pipeline). Remaining 11 patterns are V1.5 scope. The Pattern *system* is the MVP value, not the Pattern *count*. *(v2.0 — addresses OPUS Discrepancy #2)*

**Exit Criteria:** Can run full Pattern lifecycle with Primacy Protection, Tempo control, and safe abort.

---

### Phase 6: Dispatcher, Routing & Spines

> **v2.0 Phasing Note (OPUS Discrepancy #3):** Basic Context Assembly (naive load-what's-relevant, stuff-the-prompt) ships with MVP as part of Phase 2. The full Spines optimization system (80%+ cost reduction) is critical for scale but not for first users who won't have enough L3 knowledge to need it. Implement basic context assembly early; defer Spines optimization to post-MVP when real usage data reveals cost pain points. The Phase 2 "Basic Spine Generator prototype" remains as an experiment.

**Goal:** Implement cost-optimized knowledge routing with Spines for 80%+ cost reduction.

**Deliverables:**
- [ ] **Spines Generator** — derived, compact, machine-facing knowledge representations
- [ ] **Background Indexing** — deduplicate knowledge, generate spines, maintain dispatch surfaces
- [ ] Dispatcher module (no authority, structured output only)
- [ ] Session class determination (THIN/STANDARD/DEEP)
- [ ] Context assembly from Spines (not raw L3)
- [ ] Pattern selection assistance
- [ ] Agent role assignment
- [ ] Model tier selection (local-first)
- [ ] Cost estimation
- [ ] Dispatch Gate (permission to execute)

**Exit Criteria:** All execution flows through Dispatch → Assemble → Execute using Spines for 80%+ cost reduction.

---

### Phase 7: LLM Integration (Local-First, Model-Agnostic)

**Goal:** Implement multi-model AI calling with local models as primary.

**Deliverables:**
- [ ] **Ollama Integration (PRIMARY)** — local models for THIN sessions
- [ ] LLMProvider interface (model-agnostic abstraction)
- [ ] OllamaProvider (default for routing, triage, THIN)
- [ ] OpenAIProvider
- [ ] AnthropicProvider
- [ ] GoogleProvider (Gemini)
- [ ] DeepSeekProvider
- [ ] Provider factory with local-first selection
- [ ] LangChain thin integration layer
- [ ] System prompt construction (Telos + constraints + step mode)
- [ ] Response handling and parsing
- [ ] **Streaming output via WebSocket**
- [ ] Error handling, retry logic, **graceful offline degradation**
- [ ] Rate limiting and backoff
- [ ] Token usage tracking
- [ ] **Per-session model selector** (UI-visible)

**Exit Criteria:** Can make governed LLM calls with local models as default, cloud as fallback, full offline capability.

---

### Phase 8: Operator UI & Observability

**Goal:** Build keyboard-first, themeable UI with real-time streaming and observability.

**Deliverables:**

**Core Views:**
- [ ] ENGINE Manager view (global control panel)
- [ ] **Worlds Dashboard** (Kanban-style cards, drag-and-drop)
- [ ] World Cockpit view
- [ ] Session Wizard (Pattern selection, context narrowing)
- [ ] Session Runner (real-time streaming output)
- [ ] Memory Inspector (L2, L3, L4 browser)
- [ ] Agent Profiles panel
- [ ] Context Panel (mount/unmount L3 artifacts)

**UI/UX Features:**
- [ ] **Keyboard-first navigation** (single-key shortcuts: K, A, D, C, M, S, T)
- [ ] **25+ theme system** (Dracula, Nord, Catppuccin, Tokyo Night, etc.)
- [ ] Light/dark mode variants
- [ ] **Real-time streaming** (WebSocket → UI)
- [ ] **Progressive Disclosure Architecture** — design the UI with mode switching in mind *(v2.0 — addresses OPUS Discrepancy #7)*:
  - **Conversation Mode** (default for new/non-technical users): Chat interface with projects on left, conversation in center, context visualization on right. Hides Worlds/Patterns/Agents terminology. Think: enhanced ChatGPT with persistent memory and project structure.
  - **Studio Mode** (for power users): Full dashboard with sidebar, engine manager, agent profiles, pattern controls, governance visibility. The current developer-oriented layout.
  - Users switch freely; underlying engine is identical.
  - At MVP: Conversation Mode is the primary interface. Studio Mode elements are accessible but not default.
  - The "cheesecake test": A non-technical user should be able to use LOOM without ever seeing the word "Telos" or "L4 Identity Layer."
- [ ] **Model selector per session** (local vs cloud visible)
- [ ] **Session class selector** (THIN/STANDARD/DEEP)
- [ ] **Tempo indicator** in status bar
- [ ] Command interface (`/start_session`, `/switch_world`, etc.)
- [ ] Transparency indicators (World, Pattern, Agent, model, online/offline)

**Advanced Features:**
- [ ] **Dependency graph visualization** (@xyflow/react)
- [ ] **Terminal integration** (xterm.js)
- [ ] **Follow-up instructions** during Pattern execution
- [ ] File tree for `.loom/` directory
- [ ] "Open in Finder/Explorer" button

**Observability Dashboard:**
- [ ] Real-time metrics (non-content)
- [ ] Session: model, tokens in/out, latency, estimated cost
- [ ] Pattern usage frequency
- [ ] Aborts, retries, escalations count
- [ ] Agent activation patterns
- [ ] Local vs cloud usage ratio
- [ ] **NEVER log:** raw prompts, raw outputs, transcripts

**Silence-by-Default:**
- [ ] No auto-start, no auto-load
- [ ] Nothing persists without explicit consent

**Exit Criteria:** Full Operator workflow possible through keyboard-first UI with real-time observability.

---

### Phase 9: Security & Privacy

**Goal:** Implement data classification and access controls.

**Deliverables:**
- [ ] Classification system (PRIVATE_LOCAL, SHARED_LOCAL, EXTERNAL_OK, ANONYMIZED)
- [ ] Classification tagging for artifacts and memory
- [ ] Network policy enforcement (local-only mode, World-level rules)
- [ ] Secret handling (secure store, no echo to prompts)
- [ ] A0 classification checking on external calls
- [ ] Per-World filesystem sandboxing
- [ ] Optional workspace passphrase
- [ ] Dynamic command allowlisting per project

**Exit Criteria:** Sensitive data cannot leak to external models without authorization.

---

### Phase 10: Cost Governance

**Goal:** Implement cost tracking and budget enforcement.

**Deliverables:**
- [ ] Per-session cost tracking (tokens, estimated cost)
- [ ] Cost aggregation (per World, per Pattern, per time period)
- [ ] Budget configuration (global, per-World, per-session)
- [ ] A0 budget enforcement (warn, deny, fallback)
- [ ] Cost-aware Pattern postures (ultra-cheap, balanced, high-accuracy)
- [ ] Model fallback on budget constraints
- [ ] **Local model preference** — automatically route to Ollama when under budget pressure
- [ ] Cost dashboard in UI

**Exit Criteria:** Operator can set budgets; system respects them with intelligent fallbacks.

---

### Phase 11: Tool Registry & Sandboxing

> **v2.0 Note:** Basic tool primitives (filesystem read/write, shell execution, HTTP requests) are now delivered in Phase 4 so agents have day-one capabilities. Phase 11 adds the *governed registry* — META-managed whitelists, risk levels, sandboxing, and per-World tool scoping.

**Goal:** Implement governed tool access for Agents.

**Deliverables:**
- [ ] Tool registry (META-managed)
- [ ] Tool schema (name, capabilities, risk level, allowed scope)
- [ ] A0 tool permission checking
- [ ] Per-World tool whitelists
- [ ] Filesystem tool with World-scoped roots
- [ ] Network tool with classification checks
- [ ] Tool execution logging

**Exit Criteria:** Agents can only use whitelisted tools within their scope.

---

### Phase 12: Backup, Export & Audit

**Goal:** Implement data portability and explainability.

**Deliverables:**
- [ ] World export (bundle: Telos, definition, L2 history, artifacts)
- [ ] Full store backup
- [ ] Human-readable export format (JSON + Markdown)
- [ ] Audit trail (session steps, governance decisions)
- [ ] **"Why did this happen?" trace viewer**
- [ ] Import/restore functionality
- [ ] **Changelog generation** from sessions

**Exit Criteria:** Can export, backup, and explain any system behavior.

---

### Phase 13: V2 Features (Post-MVP)

**Goal:** Implement advanced V2 capabilities.

**Deliverables:**
- [ ] Progressive Context Narrowing (PCN)
- [ ] Time Constraint Modifiers (with Tempo integration)
- [ ] Multi-Model Cognition (per-Agent substrate selection)
- [ ] The Continuum (spatial cognitive scaffold)
- [ ] Monitoring Layer (real-time World metrics)
- [ ] Evaluation Patterns
- [ ] RLHF-inspired preference signals (behavioral metadata)
- [ ] Pattern Trails (history awareness)
- [ ] World Types (Creative, Production, Strategy, etc.)
- [ ] **Insights Chat** — codebase/project exploration interface

**Exit Criteria:** V2 features operational without breaking V1 stability.

---

### Phase 14: External Integration (V2+)

**Goal:** Implement interoperability with external ecosystems.

**Deliverables:**
- [ ] MCP adapter shell (Worlds as contexts, Patterns as schemas)
- [ ] Capability imports (agents.md style)
- [ ] Pattern export (Goose-style DSL)
- [ ] Replication Layer (cross-model validation)
- [ ] GitHub/GitLab integration (issue import)
- [ ] Linear integration (task sync)

**Exit Criteria:** LOOM can interface with external protocols without losing governance.

---

### Phase 15: Multi-Operator & Org LOOM (Future)

**Goal:** Enable team/organizational use.

**Deliverables:**
- [ ] Operator ID tracking on writes
- [ ] Org Telos (shared identity layer)
- [ ] Joint Worlds (multi-Operator)
- [ ] Cross-Operator trust levels
- [ ] Shared Pattern libraries
- [ ] Permission roles
- [ ] Parallel Session views (up to 12)

**Exit Criteria:** Multiple Operators can collaborate within LOOM governance.

---

### Strategic Vision: Org-LOOM & OKR Integration (v2.0)

> This section captures the long-term enterprise vision that Phase 15 enables. It is V4 scope — do not build before single-user MVP is proven. However, architectural decisions made today should ask: "Does this make Org-LOOM harder or easier?"

**Platform Evolution:**

| Version | Positioning | Key Capability |
|---------|------------|----------------|
| **V1 (MVP)** | "ChatGPT that remembers" | Single-user, basic memory, governed collaboration |
| **V2** | "An AI team that works for you" | Multi-model routing, multiple agents, pattern library |
| **V3** | "An ecosystem" | Agent marketplace, community patterns, inter-world bridging |
| **V4** | "Enterprise LOOM" | Org-LOOM + OKR integration, team collaboration |
| **V5** | "LOOM as a platform" | Protocol layer (A2A, MCP), plugin architecture |

**OKR → LOOM Mapping:**

| OKR Concept | LOOM Equivalent | How It Works |
|-------------|-----------------|--------------|
| Objective | Org Telos / World Purpose | An Objective becomes the telos of a Joint World — the immutable purpose governing all activity |
| Key Result | Intent Contract / Pattern Output Criteria | Key Results become measurable verification conditions for Intent Envelopes and Pattern completion |
| Initiative | Pattern Instance / Thread | Each initiative maps to a Pattern execution or Thread within a World |
| OKR Alignment (top-down/bottom-up) | Org Telos → World Telos → Session Intent | The existing L4 hierarchy naturally cascades objectives downward |
| OKR Review Cycle | Macro Feedback Loop / World Health Check | Designed as weekly/monthly rituals in the conceptual framework |
| OKR Progress Tracking | L2 Episodic Memory + State Layer | Session summaries, decision logs, and continuity artifacts capture progress |

**Key Org-LOOM Capabilities (V4 scope):**
- Operator ID tracking on all writes (start early — even with single user)
- Org Telos as a new L4 record type (schema extension)
- Joint Worlds (multi-Operator, shared world_id with permission matrix)
- OKR-aware Context Assembly: when starting a Session in an OKR-linked World, automatically include parent objectives, KR progress, related blockers, and cross-team context
- Event-sourcing sync layer (fits L2's append-only design naturally)
- 3-tier permissions: Private (default) → Shared (Joint World) → Org-wide

**Design-for-it-now Decisions:**
- Keep `packages/core` portable — runs in Electron main process today, in a server for Org-LOOM tomorrow
- Add `operator_id` to all write operations early, even with a single user
- Design L2 event sourcing with future sync in mind
- Use a simple permission interface that can grow (don't build RBAC until real users demand it)

**The Market Opportunity:** Every AI tool in this space is developer-first and code-focused. LOOM's mission — "for any type of person, technical or non-technical" — is completely unoccupied territory. No one is building governed, multi-agent collaboration for non-developers with OKR alignment. This is blue ocean.

---

## 4. Complete Feature List

### 4.1 Core Engine Features

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| CE-01 | 4-Layer Memory Model (L1-L4) | Critical | 1 |
| CE-02 | Write Permissions Matrix | Critical | 1 |
| CE-03 | Session Lifecycle | Critical | 2 |
| CE-04 | **Session Intent Envelope (SIE)** | Critical | 2 |
| CE-05 | **Incremental L2 Checkpointing** | High | 2 |
| CE-06 | Dispatch → Assemble → Execute Pipeline | Critical | 6 |
| CE-07 | Session Classes (THIN/STANDARD/DEEP) | High | 6 |
| CE-08 | Dispatch Gate (permission to execute) | High | 6 |
| CE-09 | Session Recovery | High | 2 |
| CE-10 | **Spines & Indexing System** | Critical | 6 |
| CE-11 | **Continuity Artifact Format** | High | 2 |
| CE-12 | **Failure Mode Handling** | High | 2 |

### 4.2 Governance Features

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| GV-01 | META Rules Engine | Critical | 1 |
| GV-02 | A0 Enforcement Module | Critical | 1 |
| GV-03 | Agent University (spec/certification) | High | 4 |
| GV-04 | Evolution Flow (META → University → A0) | High | 4 |
| GV-05 | Drift Detection | High | 1 |
| GV-06 | Replication Layer (validation) | Medium | 14 |
| GV-07 | **Agent Behavior Signals** | High | 4 |

### 4.3 World Features

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| WD-01 | World Creation & Configuration | Critical | 3 |
| WD-02 | World Telos (L4 Identity Kernel) | Critical | 3 |
| WD-03 | World Manager | High | 3 |
| WD-04 | World-Scoped L2 Isolation | Critical | 3 |
| WD-05 | Cross-World Navigation | High | 3 |
| WD-06 | World State Snapshots | Medium | 3 |
| WD-07 | **World Templates** | High | 3 |
| WD-08 | **Clone World with Fresh L2** | Medium | 3 |
| WD-09 | World Types (Creative, Production, etc.) | Low | 13 |
| WD-10 | World Growth Stages | Low | 15 |

### 4.4 Agent Features

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| AG-01 | Agent Profile Schema | Critical | 4 |
| AG-02 | Agent Telos Storage | Critical | 4 |
| AG-03 | Agent Runtime Instantiation | Critical | 4 |
| AG-04 | Agent Role Constraints | Critical | 4 |
| AG-05 | Agent Escalation Protocol | High | 4 |
| AG-06 | A0 Agent Supervision | High | 4 |
| AG-07 | Per-Agent Model Configuration | High | 7 |
| AG-08 | **Agent Behavior Signals** | High | 4 |
| AG-09 | Multi-Model Cognition | Medium | 13 |
| AG-10 | Agent Competency Levels | Low | 15 |

### 4.5 Pattern Features

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| PT-01 | Pattern Schema | Critical | 5 |
| PT-02 | Pattern Registry | Critical | 5 |
| PT-03 | 10-Phase Pattern Lifecycle | Critical | 5 |
| PT-04 | Pattern Step Execution | Critical | 5 |
| PT-05 | **Primacy Protection (Primacy Expansion)** | Critical | 5 |
| PT-06 | **Tempo System** | High | 5 |
| PT-07 | Pattern Switching Protocol | High | 5 |
| PT-08 | **Pattern Abort & Rollback** | High | 5 |
| PT-09 | 14 Core Patterns | High | 5 |
| PT-10 | Pattern Customization (World variants) | Medium | 5 |
| PT-11 | Time Constraint Modifiers | Medium | 13 |
| PT-12 | Evaluation Patterns | Low | 13 |
| PT-13 | Pattern Trails (history awareness) | Low | 13 |

### 4.6 UI Features

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| UI-01 | ENGINE Manager View | Critical | 8 |
| UI-02 | **Worlds Dashboard (Kanban-style)** | Critical | 8 |
| UI-03 | World Cockpit | Critical | 8 |
| UI-04 | Session Wizard | Critical | 8 |
| UI-05 | Session Runner (streaming) | Critical | 8 |
| UI-06 | Memory Inspector | High | 8 |
| UI-07 | **Keyboard-First Navigation** | High | 8 |
| UI-08 | **25+ Theme System** | High | 8 |
| UI-09 | **Real-Time Streaming UI** | High | 8 |
| UI-10 | **Model Selector Per Session** | High | 8 |
| UI-11 | **Session Class Selector** | High | 8 |
| UI-12 | Command Interface | High | 8 |
| UI-13 | Transparency Indicators | High | 8 |
| UI-14 | **Observability Dashboard** | High | 8 |
| UI-15 | **Progressive Disclosure** | High | 8 |
| UI-16 | **Agent Profiles Panel** | High | 8 |
| UI-17 | **Context Panel (L3 mount/unmount)** | High | 8 |
| UI-18 | **Dependency Graph Visualization** | Medium | 8 |
| UI-19 | **Terminal Integration (xterm.js)** | Medium | 8 |
| UI-20 | **Follow-Up Instructions** | Medium | 8 |
| UI-21 | File Tree for `.loom/` | Low | 8 |
| UI-22 | "Why did this happen?" Trace | Medium | 12 |
| UI-23 | Multi-World Dashboard | Low | 13 |

### 4.7 Security & Privacy Features

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| SP-01 | Data Classification System | High | 9 |
| SP-02 | Network Policy Enforcement | High | 9 |
| SP-03 | Local-Only Mode | High | 9 |
| SP-04 | Secret Handling | High | 9 |
| SP-05 | Per-World Filesystem Sandboxing | Medium | 11 |
| SP-06 | Workspace Passphrase | Low | 9 |
| SP-07 | Dynamic Command Allowlisting | Medium | 9 |

### 4.8 Cost Governance Features

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| CG-01 | Per-Session Cost Tracking | High | 10 |
| CG-02 | Budget Configuration | High | 10 |
| CG-03 | A0 Budget Enforcement | High | 10 |
| CG-04 | Cost-Aware Pattern Postures | Medium | 10 |
| CG-05 | Model Fallback on Budget | Medium | 10 |
| CG-06 | **Local Model Preference** | High | 7 |
| CG-07 | Cost Dashboard | High | 10 |

### 4.9 AI Integration Features (Model-Agnostic)

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| AI-01 | **Ollama Integration (PRIMARY)** | Critical | 7 |
| AI-02 | LLMProvider Interface | Critical | 7 |
| AI-03 | OpenAI Provider | High | 7 |
| AI-04 | Anthropic Provider | High | 7 |
| AI-05 | Google Provider (Gemini) | High | 7 |
| AI-06 | DeepSeek Provider | Medium | 7 |
| AI-07 | **Graceful Offline Degradation** | High | 7 |
| AI-08 | **Streaming Output (WebSocket)** | High | 7 |
| AI-09 | Per-Agent Model Selection | High | 7 |

### 4.10 Tool & Integration Features

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| TI-01 | Tool Registry | High | 11 |
| TI-02 | A0 Tool Permission Checking | High | 11 |
| TI-03 | Filesystem Tool (sandboxed) | Medium | 11 |
| TI-04 | Network Tool (governed) | Medium | 11 |
| TI-05 | MCP Adapter | Low | 14 |
| TI-06 | GitHub/GitLab Integration | Low | 14 |

### 4.11 Operational Features

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| OP-01 | World Export | High | 12 |
| OP-02 | Full Store Backup | High | 12 |
| OP-03 | Audit Trail | High | 12 |
| OP-04 | Import/Restore | Medium | 12 |
| OP-05 | **Failure Mode Handling** | High | 2 |
| OP-06 | **Graceful Offline Degradation** | High | 7 |
| OP-07 | Changelog Generation | Medium | 12 |

### 4.12 Engineering Discipline Features (v2.0)

| ID | Feature | Priority | Phase |
|----|---------|----------|-------|
| ED-01 | **Context Assembly Engine** (token budgeting, relevance scoring, dynamic assembly) | Critical | 2, 6 |
| ED-02 | **Intent Tracking Pipeline** (decompose SIE → sub-intents, track, detect drift, verify) | High | 2 |
| ED-03 | **Intent Drift Detection** (alert when execution diverges from SIE) | High | 2 |
| ED-04 | **Machine-Parseable Specs** (auto-generate tests/checklists from markdown specs) | Medium | 13 |
| ED-05 | **Autonomy Level Setting** (L1-L5 dial, session-scoped, cascading) | Medium | V1.5 |
| ED-06 | **Max Autonomy Level** (World config ceiling, Org Telos ceiling) | Medium | V1.5 |
| ED-07 | **OrchestratorPort Interface** (abstract LangChain behind swappable port) | Medium | 7 |
| ED-08 | **Progressive Disclosure UX** (Conversation Mode / Studio Mode) | High | 8 |
| ED-09 | **Hello World User Journey** (end-to-end onboarding flow) | Critical | 0.5 |
| ED-10 | **Basic Tool Primitives** (fs, shell, HTTP with Operator approval gates) | High | 4 |
| ED-11 | **DualTruthService Interface** (MD↔DB reconciliation pattern for all persistence) | High | 1 |

---

## 5. Detailed TODO

### 5.1 Phase 0: Foundation

```
[ ] Project Setup
    [ ] Initialize monorepo with pnpm workspaces
    [ ] Create packages: @loom/core, @loom/ui, @loom/electron, @loom/shared
    [ ] Configure TypeScript (strict mode, path aliases)
    [ ] Configure ESLint + Prettier
    [ ] Configure Husky + lint-staged
    [ ] Create .gitignore and .editorconfig

[ ] Electron Setup
    [ ] Initialize Electron 33+ with Vite
    [ ] Configure main/preload/renderer split
    [ ] Set up contextBridge for secure IPC
    [ ] Configure electron-builder for packaging
    [ ] Create dev scripts (dev, build, package)
    [ ] Set up WebSocket server in main process
    [ ] Configure chokidar for file watching

[ ] React Setup
    [ ] Initialize React 18 with TypeScript
    [ ] Configure Tailwind CSS 4
    [ ] Add shadcn/ui + Radix UI components
    [ ] Add Lucide Icons
    [ ] Set up routing (TanStack Router)
    [ ] Configure Zustand 5 with persistence
    [ ] Create basic layout shell

[ ] Database Setup
    [ ] Install SQLite (better-sqlite3)
    [ ] Configure Drizzle ORM
    [ ] Create initial schema (empty tables)
    [ ] Set up migration system
    [ ] Create DB initialization in main process

[ ] Testing Setup
    [ ] Configure Vitest for unit tests
    [ ] Configure Playwright for E2E
    [ ] Configure MSW for API mocking
    [ ] Create test utilities and mocks
    [ ] Set up CI test pipeline
    [ ] **Define Test Architecture** (Folder structure, naming conventions, mocks vs spies)

[ ] Documentation
    [ ] Create DEVELOPMENT.md (setup instructions)
    [ ] Create ARCHITECTURE.md (code structure)
    [ ] Configure TypeDoc
```

### 5.2 Phase 1: Core Engine

```
[ ] Schema Design
    [ ] Design L4 tables (operator_telos, world_telos, agent_telos, org_telos)
    [ ] Design L3 tables (worlds, agents, patterns, pattern_steps, meta_rules)
    [ ] Design L2 tables (sessions, session_summaries, decisions, world_deltas)
    [ ] Create Drizzle schema files
    [ ] Run initial migration

[ ] Memory Layer Implementation
    [ ] Create MemoryLayer interface
    [ ] Implement L4TelosLayer (read-only except Operator)
    [ ] Implement L3KnowledgeLayer (governed writes)
    [ ] Implement L2EpisodicLayer (World-scoped, append-mostly)
    [ ] Implement L1ActiveLayer (in-memory Map/WeakMap)
    [ ] Create layer composition service

[ ] Write Permissions
    [ ] Create WritePermissionMatrix type
    [ ] Implement permission checker
    [ ] Create write attempt interceptor
    [ ] Add permission violation logging
    [ ] Create unit tests for all permission scenarios

[ ] META Governance
    [ ] Design META rules schema (JSON/YAML)
    [ ] Create MetaGovernance service
    [ ] Implement rule loading from L3
    [ ] Implement rule evaluation
    [ ] Create constraint violation handler
    [ ] Add governance event logging

[ ] A0 Enforcement
    [ ] Create A0Enforcer service
    [ ] Implement operation interception
    [ ] Implement constraint application
    [ ] Create allow/deny response with reasons
    [ ] Wire A0 into all write paths

[ ] Reconciliation Service
    [ ] Create FileWatcher service (chokidar wrapper)
    [ ] Implement MD → DB sync logic (detect external edits)
    [ ] Implement DB → MD sync logic (write back)
    [ ] Handle conflict resolution (last write wins or Operator prompt)

[ ] Validation & Testing
    [ ] Unit Tests: Permission Matrix (Allow/Deny scenarios)
    [ ] Unit Tests: L4 Immutability (Attempted overwrites)
    [ ] Integration Tests: A0 Interception (Verify blocking)
    [ ] Integration Tests: File Sync (MD <-> DB consistency)
```

### 5.3 Phase 2: Session Lifecycle

```
[ ] Session State Machine
    [ ] Define SessionState enum (pending, initializing, primacy, active, summarizing, closed, failed)
    [ ] Create SessionStateMachine class
    [ ] Implement state transitions with validation
    [ ] Add transition event emitter

[ ] Session Intent Envelope (SIE)
    [ ] Define SIE schema (goal, constraints, audience, scope boundaries)
    [ ] Create SIE capture mechanism (during Primacy Expansion)
    [ ] Implement SIE sealing (immutable once sealed)
    [ ] Store SIE in L1, include in L2 summary
    [ ] Create SIE validation for Pattern outputs
    [ ] Block Pattern execution until SIE sealed

[ ] Session Service
    [ ] Create SessionService
    [ ] Implement session creation (generate ID, set World)
    [ ] Implement L4 → L3 → L1 load sequence
    [ ] Implement session activation
    [ ] Implement L2 summary generation
    [ ] Implement L1 flush
    [ ] Implement session close

[ ] Incremental L2 Checkpointing
    [ ] Define checkpoint triggers:
        [ ] Time-based (every 10 minutes)
        [ ] Step-based (after N pattern steps)
        [ ] Operator-requested (/checkpoint command)
    [ ] Create CheckpointService
    [ ] Implement partial summary generation (marked as draft)
    [ ] Implement checkpoint storage
    [ ] Implement recovery from checkpoint
    [ ] Distinguish checkpoint from final summary

[ ] Continuity Artifact Format
    [ ] Define structured schema for L2 summaries
    [ ] Include: decisions, state changes, open questions, next steps
    [ ] Include: SIE reference, checkpoint markers
    [ ] Create artifact generator
    [ ] Create artifact parser for session resumption

[ ] Session Recovery
    [ ] Detect incomplete sessions on startup
    [ ] Create recovery options (resume from checkpoint, discard, summarize-partial)
    [ ] Implement recovery flow from checkpoints
    [ ] Add recovery event logging

[ ] Failure Mode Handling
    [ ] Define failure types (model timeout, tool error, crash, network failure)
    [ ] Create FailureHandler service
    [ ] Implement retry with exponential backoff
    [ ] Implement clean abort protocol
    [ ] Implement partial-save on failure
    [ ] Log failure events (non-content)
    [ ] UI notification of failures

[ ] Session Metadata Logging
    [ ] Design session_logs table (non-content)
    [ ] Log: start time, end time, World, Pattern, model used
    [ ] Log: token counts, estimated cost, latency
    [ ] Log: aborts, retries, escalations, checkpoints
    [ ] Log: local vs cloud model usage
    [ ] Ensure NO raw prompts/outputs logged

[ ] Context & Spines (Prototype)
    [ ] Implement Basic Spine Generator (L3 → JSON)
    [ ] Implement Context Assembly Heuristic (how much L2 to load?)
    [ ] Test loading latency with Spines vs Raw Files

[ ] Lifecycle Testing
    [ ] Unit Tests: State Machine Transitions (Valid/Invalid)
    [ ] Integration Tests: Checkpoint Restoration (Data integrity)
    [ ] Chaos Tests: Simulate crash mid-write (Recovery verification)
    [ ] Load Tests: Long-running session memory usage
```

### 5.4 Phase 3: Worlds System

```
[ ] World Schema
    [ ] Extend worlds table (id, name, purpose, created_at, updated_at)
    [ ] Create world_config table (constraints, allowed_patterns, allowed_agents)
    [ ] Create world_state table (last active, current threads)
    [ ] Create world_templates table

[ ] World Service
    [ ] Create WorldService
    [ ] Implement world creation
    [ ] Implement world Telos (L4) writing with META approval
    [ ] Implement world configuration (L3)
    [ ] Implement world activation
    [ ] Implement world deactivation (safe L1 clear)

[ ] World Manager
    [ ] Create WorldManager class (per-World)
    [ ] Implement purpose/identity accessors
    [ ] Implement thread tracking
    [ ] Implement assigned agents list
    [ ] Implement recent state summary

[ ] World Templates
    [ ] Create template schema (name, description, telos, patterns, agents, config)
    [ ] Build Podcast World template (from WARP_WORKFLOW_EXAMPLE)
        [ ] Include: Atlas, Nova, Miles, SAM, Mark agents
        [ ] Include: PODCAST_EPISODE_* patterns
    [ ] Build Research World template
    [ ] Build Creative Writing template
    [ ] Build Software Project template
    [ ] Implement "Create from Template" flow
    [ ] Implement "Clone World with fresh L2" option
    [ ] Template preview in UI

[ ] World Isolation
    [ ] Ensure L2 queries are World-scoped
    [ ] Block cross-World L2 reads without explicit flag
    [ ] Create World boundary tests

[ ] World Isolation Testing
    [ ] Security Tests: Cross-World L2 Read Attempts (Must fail)
    [ ] Integrity Tests: Clone World (Verify fresh L2)
    [ ] Template Tests: Instantiation accuracy
```

### 5.5 Phase 4: Agent System

```
[ ] Agent Schema
    [ ] Create agent_profiles table
    [ ] Create agent_telos table (in L4)
    [ ] Create agent_modes table
    [ ] Create agent_tools table
    [ ] Create agent_behavior_signals table (non-content metadata)
    [ ] Create agent_model_preferences table

[ ] Agent Profile Loader
    [ ] Create AgentProfileLoader service
    [ ] Parse PROFILE, TELOS, MODES, TOOLS sections
    [ ] Parse model preferences (preferred, secondary, fallback)
    [ ] Validate against Agent schema
    [ ] Store in L3/L4 appropriately

[ ] Agent Runtime
    [ ] Create AgentRuntime class
    [ ] Implement instantiation from profile
    [ ] Implement constraint binding
    [ ] Implement escalation trigger
    [ ] Implement initiative level control
    [ ] Implement model selection per agent

[ ] A0 Agent Supervision
    [ ] Create agent behavior monitor
    [ ] Detect constraint violations
    [ ] Implement automatic escalation
    [ ] Log supervision events

[ ] Agent Behavior Signals
    [ ] Define signal types:
        [ ] Useful/not useful (Operator feedback)
        [ ] Drift indicators (output vs Telos alignment)
        [ ] Performance signals (latency, token efficiency)
        [ ] Alignment signals (followed constraints, escalated appropriately)
    [ ] Create BehaviorSignalCollector
    [ ] Capture signals per-session (non-content)
    [ ] Store in behavior_signals table (NOT L2/L3)
    [ ] Create signal aggregation for evolution decisions
    [ ] Wire to Replication Layer for analysis
    [ ] Never stored as memory, only as metadata

[ ] Agent Testing
    [ ] Unit Tests: Constraint Binding (Can Agent X do Y?)
    [ ] Integration Tests: Escalation Triggers (Does A0 catch violations?)
    [ ] Signal Tests: Behavior metric collection accuracy
```

### 5.6 Phase 5: Pattern System

```
[ ] Pattern Schema
    [ ] Create patterns table (id, name, purpose, family, world_scope)
    [ ] Create pattern_steps table (order, agent, layer_writes, constraints, tempo_mode)
    [ ] Create pattern_inputs table
    [ ] Create pattern_outputs table

[ ] Pattern Registry
    [ ] Create PatternRegistry service
    [ ] Implement pattern loading from L3
    [ ] Implement pattern search by family/name
    [ ] Implement World-scoped pattern filtering

[ ] Primacy Protection (Phase 0 of all Patterns)
    [ ] Create PrimacyExpansion phase
    [ ] Implement question-only mode:
        [ ] No proposals allowed
        [ ] No summaries allowed
        [ ] No reframing allowed
        [ ] Only clarifying questions
    [ ] Create Operator intent capture mechanism
    [ ] Implement SIE construction from Primacy
    [ ] Implement SIE sealing gate
    [ ] A0 blocks premature framing attempts
    [ ] Operator signals "ready to proceed" to seal SIE
    [ ] Cannot skip Primacy (must complete or cancel session)

[ ] Tempo System
    [ ] Define Tempo modes:
        [ ] Allegro (fast): minimal verbosity, quick steps, high initiative
        [ ] Andante (moderate): balanced pacing, normal detail
        [ ] Adagio (slow): deep exploration, high detail, deliberate
    [ ] Create TempoService
    [ ] Map time constraints to tempo modes
    [ ] Adjust per tempo:
        [ ] Step granularity
        [ ] Output verbosity
        [ ] Agent initiative level
        [ ] Reasoning depth
    [ ] Integrate with Pattern lifecycle
    [ ] Create tempo override commands (/tempo allegro, etc.)
    [ ] Display tempo in UI status bar

[ ] Pattern Lifecycle (11 Phases including Primacy)
    [ ] Create PatternLifecycle class
    [ ] Implement Phase 0: Primacy Expansion (NEW - REQUIRED)
    [ ] Implement Phase 1: Operator Intention capture
    [ ] Implement Phase 2: META Validation
    [ ] Implement Phase 3: Pattern Activation
    [ ] Implement Phase 4: Input Preparation
    [ ] Implement Phase 5: Step Execution (with Tempo)
    [ ] Implement Phase 6: Operator Steering hooks
    [ ] Implement Phase 7: Completion Conditions check
    [ ] Implement Phase 8: Output Delivery
    [ ] Implement Phase 9: L2 Update
    [ ] Implement Phase 10: Reintegration

[ ] Pattern Abort & Rollback
    [ ] Create PatternAbortService
    [ ] Implement abort at step boundaries only (clean cuts)
    [ ] Handle partial output:
        [ ] Discard option
        [ ] Save-as-draft option
    [ ] Clean L1 state on abort
    [ ] Write to L2: "Pattern aborted at step N" (explicit, not failure)
    [ ] Implement resume-from-checkpoint option
    [ ] Prevent abort during Primacy Expansion (must complete or cancel session)
    [ ] /abort command in UI

[ ] Pattern Step Execution
    [ ] Create PatternStepRunner
    [ ] Implement Agent assignment per step
    [ ] Implement layer write restrictions per step
    [ ] Apply Tempo settings to step
    [ ] Implement step output capture
    [ ] Implement handoff protocol
    [ ] Stream output via WebSocket

[ ] Core 14 Patterns
    [ ] Implement Option Burst (Ideation)
    [ ] Implement Metaphor Bloom (Ideation)
    [ ] Implement Divergent Spread (Ideation)
    [ ] Implement Framework Forge (Structuring)
    [ ] Implement Narrative Spine (Structuring)
    [ ] Implement Cluster Map (Structuring)
    [ ] Implement Criteria Filter (Decision)
    [ ] Implement Compare & Weigh (Decision)
    [ ] Implement Direction Lock (Decision)
    [ ] Implement Draft → Edit → Polish (Production)
    [ ] Implement Episode Workflow (Production)
    [ ] Implement Clarity Pass (Refinement)
    [ ] Implement Coherence Sweep (Refinement)
    [ ] Implement Insight Weave (Analysis)

[ ] Pattern Logic Testing
    [ ] Flow Tests: Step sequence enforcement
    [ ] Safety Tests: Primacy Protection (Block non-questions)
    [ ] Safety Tests: SIE Sealing (Block execution before seal)
    [ ] Feature Tests: Abort/Rollback (State cleanliness)
```

### 5.7 Phase 6: Dispatcher, Routing & Spines

```
[ ] Spines System (CRITICAL FOR COST)
    [ ] Define Spine schema:
        [ ] Compact, machine-facing format
        [ ] Regenerable from source
        [ ] Disposable (not source of truth)
        [ ] Non-authoritative
    [ ] Create SpineGenerator service
    [ ] Implement World execution spine:
        [ ] Condensed World identity
        [ ] Active threads summary
        [ ] Recent decisions
    [ ] Implement Agent capability spine:
        [ ] Role summary
        [ ] Constraints summary
        [ ] Tool access list
    [ ] Implement Pattern index spine:
        [ ] Pattern names and families
        [ ] Input/output signatures
        [ ] Activation conditions
    [ ] Implement Global session spine:
        [ ] Operator Telos summary
        [ ] Active World pointer
        [ ] Recent context
    [ ] Mark all spines as derived/disposable

[ ] Background Indexing
    [ ] Create IndexingService
    [ ] Implement periodic indexing:
        [ ] Runs in background
        [ ] Uses local/cheap resources only
        [ ] Triggered on: startup, World change, manual request
    [ ] Deduplicate knowledge during indexing
    [ ] Generate/refresh all spines
    [ ] Maintain fast dispatch surfaces
    [ ] No knowledge deletion/alteration (source unchanged)
    [ ] Shift cost: daily usage → background maintenance
    [ ] Index status indicator in UI

[ ] Dispatcher Service
    [ ] Create DispatcherService (no authority, no execution)
    [ ] Read from Spines (NOT raw L3) for speed/cost
    [ ] Implement session class determination:
        [ ] THIN: questions, navigation, micro-edits → local model
        [ ] STANDARD: Pattern execution → configurable
        [ ] DEEP: architecture, governance → explicit approval
    [ ] Implement Pattern suggestion based on intent
    [ ] Implement Agent role assignment
    [ ] Implement model tier selection (local-first logic)
    [ ] Implement cost estimation (before execution)
    [ ] Output structured dispatch plan ONLY (no execution)

[ ] Dispatch Gate
    [ ] Create DispatchGate class
    [ ] Check: SIE sealed (Primacy complete)
    [ ] Check: Pattern explicitly invoked
    [ ] Check: Context narrowed/stable
    [ ] Check: META authorization
    [ ] Check: World and Agent resolvable
    [ ] Check: Model available (local or cloud)
    [ ] Block ALL routing until gate passes
    [ ] Clear error messages on gate failure

[ ] Execution Pipeline
    [ ] Create ExecutionPipeline
    [ ] Enforce: Dispatch → Assemble → Execute
    [ ] Block direct prompting paths (no backdoors)
    [ ] Add pipeline event logging
```

### 5.8 Phase 7: LLM Integration (Local-First, Model-Agnostic)

```
[ ] Ollama Integration (PRIMARY - Default)
    [ ] Create OllamaProvider
    [ ] Implement model listing/selection
    [ ] Implement chat completion
    [ ] Implement streaming responses
    [ ] Configure as DEFAULT for:
        [ ] THIN sessions
        [ ] Dispatcher routing/triage
        [ ] Spine generation
    [ ] Test full offline functionality
    [ ] Create Ollama health check
    [ ] Auto-detect available models
    [ ] Model download suggestions

[ ] LLMProvider Interface (Model-Agnostic)
    [ ] Create abstract LLMProvider interface:
        [ ] chat(messages, options): Response
        [ ] stream(messages, options): AsyncIterator
        [ ] listModels(): Model[]
        [ ] estimateCost(messages): CostEstimate
    [ ] Create ProviderConfig type
    [ ] Create Response standardization

[ ] Cloud Provider Adapters
    [ ] Implement OpenAIProvider
    [ ] Implement AnthropicProvider
    [ ] Implement GoogleProvider (Gemini)
    [ ] Implement DeepSeekProvider
    [ ] Each provider implements LLMProvider interface
    [ ] Standardize error types across providers

[ ] Provider Factory
    [ ] Create ProviderFactory
    [ ] Implement local-first selection logic:
        1. Check if Ollama available → use Ollama
        2. Check session class → THIN always local
        3. Check budget → fallback to local if exceeded
        4. Check network → offline uses local only
    [ ] Support per-Agent provider preferences
    [ ] Support per-session provider override

[ ] LangChain Integration (Thin Layer)
    [ ] Create LangChainService
    [ ] Implement chain construction for Pattern steps
    [ ] Implement system prompt builder:
        [ ] Inject Telos (from Spine)
        [ ] Inject constraints
        [ ] Inject step mode
        [ ] Inject Tempo settings
    [ ] Implement user content assembly
    [ ] Keep chains stateless and Pattern-bound
    [ ] NO autonomous LangChain agents

[ ] Streaming & Response Handling
    [ ] Create ResponseParser
    [ ] Handle structured outputs
    [ ] Implement WebSocket streaming to UI
    [ ] Create error classification
    [ ] Implement retry with exponential backoff

[ ] Graceful Offline Degradation
    [ ] Detect network availability
    [ ] Automatic fallback to Ollama when offline
    [ ] Queue cloud requests for retry (optional)
    [ ] Clear user feedback: "Offline Mode - Using Local Models"
    [ ] Full functionality with local models only
    [ ] No features disabled in offline mode

[ ] Token & Cost Tracking
    [ ] Create TokenTracker
    [ ] Track input/output tokens per call
    [ ] Aggregate per session
    [ ] Estimate costs per provider (configurable rates)
    [ ] Track local vs cloud usage ratio
    [ ] Feed to Observability Dashboard

[ ] Provider & Resilience Testing
    [ ] Mock Tests: Provider Factory (Route selection logic)
    [ ] Offline Tests: Disconnect network (Verify Ollama fallback)
    [ ] Cost Tests: Budget limit enforcement (Verify denial/fallback)
    [ ] Stream Tests: WebSocket integrity and ordering
```

### 5.9 Phase 8: Operator UI & Observability

```
[ ] Layout & Navigation
    [ ] Create main layout shell
    [ ] Implement sidebar navigation
    [ ] Create header with status indicators
    [ ] Implement TanStack Router routing
    [ ] Implement silence-by-default (no auto-start, no auto-load)

[ ] Keyboard-First Navigation
    [ ] Define shortcut scheme:
        [ ] K → Worlds Dashboard (Kanban)
        [ ] A → Session Runner (Agent)
        [ ] D → Memory Inspector (Docs)
        [ ] C → Context Panel
        [ ] M → Agent Profiles (Models)
        [ ] S → Settings
        [ ] T → Terminal
    [ ] Make shortcuts customizable in Settings
    [ ] Display shortcut hints in UI
    [ ] Vim-style navigation optional

[ ] Theme System
    [ ] Implement 25+ themes:
        [ ] Dracula, Nord, Catppuccin, Tokyo Night
        [ ] Gruvbox, One Dark, Monokai, Solarized
        [ ] GitHub Light/Dark, VS Code Light/Dark
        [ ] And more...
    [ ] Light/dark variants for each
    [ ] Instant preview in Settings
    [ ] Theme persistence
    [ ] System theme detection option

[ ] Worlds Dashboard (Kanban-Style)
    [ ] Create WorldsDashboard component
    [ ] Display Worlds as cards
    [ ] Implement drag-and-drop reordering (dnd-kit)
    [ ] Show World status indicators
    [ ] Quick actions: Open, Archive, Clone
    [ ] "Create from Template" button
    [ ] Filter/search Worlds

[ ] World Cockpit View
    [ ] Create WorldCockpit component
    [ ] Display World purpose, identity, Telos
    [ ] Display assigned Agents and Patterns
    [ ] Display current threads
    [ ] Display recent state summary (L2)
    [ ] Quick Pattern activation

[ ] Session Wizard
    [ ] Create SessionWizard component
    [ ] Step 1: World selection (if not already in World)
    [ ] Step 2: Session class selection (THIN/STANDARD/DEEP)
    [ ] Step 3: Pattern selection
    [ ] Step 4: Context narrowing / artifact mounting
    [ ] Step 5: Model selection (with local-first default)
    [ ] Preview estimated cost before starting

[ ] Session Runner (Real-Time Streaming)
    [ ] Create SessionRunner component
    [ ] Display Primacy Expansion phase prominently
    [ ] Real-time streaming output (WebSocket)
    [ ] Step-by-step execution display
    [ ] Progressive disclosure: summary by default, expand for details
    [ ] Operator steering controls
    [ ] Approval buttons
    [ ] Summary review/edit before L2 write
    [ ] Follow-up instructions input (without stopping)
    [ ] Abort button with confirmation

[ ] Memory Inspector
    [ ] Create MemoryInspector component
    [ ] L2 Episodic viewer (World-scoped)
    [ ] L3 Knowledge browser
    [ ] L4 Telos viewer (read-only)
    [ ] Delta/diff views
    [ ] Search within memory
    [ ] Export individual items

[ ] Agent Profiles Panel
    [ ] Create AgentProfilesPanel component
    [ ] List all Agents in current World
    [ ] Display: PROFILE, TELOS, MODES
    [ ] Display model preferences
    [ ] Show behavior signals summary
    [ ] Read-only (editing requires evolution flow)

[ ] Context Panel
    [ ] Create ContextPanel component
    [ ] List available L3 artifacts
    [ ] Mount/unmount artifacts for current session
    [ ] Visual indicator of mounted items
    [ ] Quick search
    [ ] Upload new artifacts

[ ] Dependency Graph Visualization
    [ ] Integrate @xyflow/react
    [ ] Visualize World → Pattern relationships
    [ ] Visualize Pattern → Agent assignments
    [ ] Visualize L4 → L3 → L2 flow
    [ ] Interactive nodes (click to navigate)
    [ ] Zoom/pan controls

[ ] Terminal Integration
    [ ] Integrate xterm.js
    [ ] Tab support
    [ ] Split pane support
    [ ] Persistent session state
    [ ] Context injection from UI
    [ ] Command history

[ ] Command Interface
    [ ] Create CommandPalette component (Cmd+K / Ctrl+K)
    [ ] Implement commands:
        [ ] /start_session
        [ ] /close_session
        [ ] /switch_world <name>
        [ ] /recap
        [ ] /use_pattern <name>
        [ ] /pattern_suggest
        [ ] /checkpoint (manual)
        [ ] /abort
        [ ] /tempo <mode>
        [ ] /offline (toggle)
        [ ] /status
    [ ] Command autocomplete
    [ ] Command history

[ ] Transparency Indicators
    [ ] Create StatusBar component
    [ ] Display: Active World
    [ ] Display: Active Pattern / Step
    [ ] Display: Active Agent
    [ ] Display: Model in use (local badge for Ollama)
    [ ] Display: Online/Offline status
    [ ] Display: Current Tempo
    [ ] Display: Can write to L2 indicator
    [ ] Display: Cost (current session)

[ ] Observability Dashboard
    [ ] Create ObservabilityDashboard component
    [ ] Real-time metrics (non-content):
        [ ] Active session duration
        [ ] Model in use (local vs cloud)
        [ ] Tokens in/out (current session)
        [ ] Estimated cost (current session)
        [ ] Latency (last call)
        [ ] Pattern step progress
    [ ] Aggregate metrics:
        [ ] Sessions today/week/month
        [ ] Cost by World
        [ ] Cost by Pattern
        [ ] Local vs cloud usage ratio
        [ ] Aborts, retries, escalations count
        [ ] Agent activation patterns
    [ ] NEVER display: raw prompts, raw outputs, transcripts, identity data
    [ ] Export metrics as CSV

[ ] Follow-Up Instructions
    [ ] Create FollowUpInput component
    [ ] Send additional instructions during Pattern execution
    [ ] Does not stop/abort Pattern
    [ ] Logged in session for L2 summary
    [ ] Agent receives as context update

[ ] File Tree
    [ ] Create FileTree component
    [ ] Display .loom/ directory structure
    [ ] "Open in Finder/Explorer" button
    [ ] Refresh button

[ ] UI & End-to-End Testing
    [ ] Component Tests: Critical UI elements (SessionRunner, Cockpit)
    [ ] E2E Flows: "Zero to Hero" (New World -> Session -> Summary)
    [ ] Accessibility Tests: Keyboard navigation (Tab order, Shortcuts)
    [ ] Theme Tests: Visual regression (Dark/Light modes)
```

### 5.10 Phases 9-15: Remaining Phases

```
[ ] Phase 9: Security & Privacy
    [ ] Implement classification enum (PRIVATE_LOCAL, SHARED_LOCAL, EXTERNAL_OK, ANONYMIZED)
    [ ] Create ClassificationEnforcer
    [ ] Classification tagging for artifacts and memory
    [ ] Implement network policy rules
    [ ] Create local-only mode switch
    [ ] Implement secure credential store
    [ ] Add secret masking in outputs
    [ ] Dynamic command allowlisting per project

[ ] Phase 10: Cost Governance
    [ ] Create CostTracker service
    [ ] Implement budget configuration UI:
        [ ] Global budget
        [ ] Per-World budget
        [ ] Per-Session budget
    [ ] Wire A0 into cost checks
    [ ] Implement intelligent fallback (cloud → local on budget pressure)
    [ ] Cost-aware Pattern postures (ultra-cheap, balanced, high-accuracy)
    [ ] Create cost dashboard with trends

[ ] Phase 11: Tool Registry
    [ ] Create Tool interface
    [ ] Create ToolRegistry service
    [ ] Implement META-managed whitelist
    [ ] A0 tool permission checking
    [ ] Create filesystem tool (World-scoped sandbox)
    [ ] Create network tool (governed, classification-aware)
    [ ] Tool execution logging

[ ] Phase 12: Backup & Audit
    [ ] Implement World export (JSON + MD bundle)
    [ ] Implement full store backup
    [ ] Create audit log table
    [ ] Implement "Why did this happen?" trace viewer
    [ ] Create import/restore flow
    [ ] Changelog generation from sessions

[ ] Phase 13: V2 Features
    [ ] Implement PCN (Progressive Context Narrowing)
    [ ] Implement Time Constraint Modifiers (integrate with Tempo)
    [ ] Implement Multi-Model Cognition (per-Agent substrate selection)
    [ ] Implement Continuum rooms (spatial state machine)
    [ ] Implement Monitoring Layer (real-time World metrics)
    [ ] Implement Evaluation Patterns
    [ ] Implement Pattern Trails (history awareness)
    [ ] Implement World Types (Creative, Production, Strategy, etc.)
    [ ] Implement Insights Chat (project exploration interface)

[ ] Phase 14: External Integration
    [ ] Create MCP adapter shell
    [ ] Implement capability import (agents.md style)
    [ ] Implement Pattern export (Goose DSL)
    [ ] Implement Replication Layer (cross-model validation)
    [ ] GitHub/GitLab integration (issue import)
    [ ] Linear integration (task sync)

[ ] Phase 15: Multi-Operator & Org LOOM
    [ ] Add operator_id to writes
    [ ] Implement Org Telos (shared identity layer)
    [ ] Implement Joint Worlds (multi-Operator)
    [ ] Add cross-Operator trust levels
    [ ] Shared Pattern libraries
    [ ] Permission roles
    [ ] Parallel Session views (up to 12)
```

---

## 6. Dependencies & Critical Path

### Dependency Graph (v2.0)

```
Phase 0 (Foundation + WebSocket)
    ↓
Phase 0.5 (MVP Sprint — Hello World Journey) ← FIRST SHIPPABLE ARTIFACT
    ↓
Phase 1 (Core Engine: Memory + Governance + DualTruthService) ← CRITICAL
    ↓
Phase 2 (Session Lifecycle + SIE + Checkpointing + Intent Tracking + Basic Context Assembly)
    ↓
┌───────────────┬───────────────┐
↓               ↓               ↓
Phase 3         Phase 4         Phase 5
(Worlds +       (Agents +       (Patterns + Primacy
Templates)      Behavior        + Tempo + Abort
                Signals +       + 3 MVP Patterns)
                Tool Primitives)
└───────────────┴───────────────┘
                ↓
    Phase 7 (LLM: LOCAL-FIRST + Model-Agnostic + OrchestratorPort) ← CRITICAL
                ↓
    Phase 8 (UI + Observability + Progressive Disclosure) ← V1 Complete
                ↓
    Phase 6 (Dispatcher + SPINES) ← POST-MVP OPTIMIZATION (80%+ cost reduction)
                ↓
┌───────────────┬───────────────┐
↓               ↓               ↓
Phase 9         Phase 10        Phase 11
(Security)      (Cost Gov)      (Tool Registry)
└───────────────┴───────────────┘
                ↓
        Phase 12 (Backup/Audit)
                ↓
        Phase 13-14 (V2 Features + Integration)
                ↓
        Phase 15 (Multi-Operator → Org-LOOM V4)
```

### Critical Path (v2.0)

1. **Phase 0** → Foundation (cannot start without)
2. **Phase 0.5** → First shippable artifact (Hello World journey)
3. **Phase 1** → Memory model + DualTruthService + Governance
4. **Phase 2** → Session lifecycle + Intent Tracking + Basic Context Assembly (MVP context handling)
5. **Phase 7** → LLM integration (local-first, enables AI) — via OrchestratorPort
6. **Phase 8** → UI (Streaming + Progressive Disclosure)
7. **Phase 6** → Spines (80%+ cost reduction) — post-MVP optimization when real usage data reveals cost pain

### MVP Definition (v2.0)

**MVP = Phase 0 + 0.5 + 1 + 2 + 3 + 4 + 5 + 7 + 8**

> Phase 6 (Spines) deferred to post-MVP optimization. Basic context assembly lives in Phase 2.

At MVP:
- ✅ Create and switch Worlds (including from templates)
- ✅ Define Agents with Telos, behavior tracking, and basic tool access
- ✅ Run 3 core Patterns with Primacy Protection and safe abort
- ✅ Session Intent Envelope prevents drift, with intent tracking pipeline
- ✅ Incremental checkpointing provides crash resilience
- ✅ Basic Context Assembly (L1-L4 → LLM context window)
- ✅ Local models (Ollama) handle 80%+ of interactions
- ✅ Governed LLM calls with graceful offline degradation
- ✅ Model-agnostic via OrchestratorPort (works with any provider)
- ✅ Keyboard-first, themeable UI with Progressive Disclosure
- ✅ Real-time streaming output
- ✅ Observability dashboard
- ✅ Memory persistence across sessions
- ✅ Hello World user journey works end-to-end
- ✅ Markdown export

---

## 7. Validation Strategy

### 7.1 PoC Test (From LABS)

Run the **LOOM Prompt Lab** experiment:
- Compare LOOM-structured prompts vs natural prompts
- Test across 3 Agent profiles
- Run 30-45 paired comparisons
- Quantify improvement metrics

### 7.2 Unit Testing

- All memory layer operations
- All permission checks
- All governance rules
- All state transitions
- Session Intent Envelope sealing
- Primacy Protection blocking
- Tempo mode switching
- Pattern abort/rollback
- Spine generation
- Provider factory logic

### 7.3 Integration Testing

- Session lifecycle end-to-end (including checkpoints)
- Pattern execution end-to-end (with Primacy)
- LLM call chain (local and cloud)
- Offline degradation flow
- Failure recovery flow
- WebSocket streaming

### 7.4 E2E Testing

- Full Operator workflows via Playwright
- World creation → Session → Primacy → Pattern → Summary
- Template-based World creation
- Pattern abort and resume
- Checkpoint and recovery
- Keyboard navigation
- Theme switching

### 7.5 Governance Testing

- Attempt unauthorized writes (should fail)
- Attempt cross-World access (should fail)
- Attempt L4 modification by Agent (should fail)
- Attempt to skip Primacy Expansion (should fail)
- Attempt execution before SIE sealed (should fail)
- Drift detection scenarios

### 7.6 Cost & Performance Testing

- Measure token usage with/without Spines
- Verify 80%+ cost reduction with Spines
- Verify local model preference in THIN sessions
- Benchmark Dispatcher routing speed
- Measure offline performance parity

---

## 8. OPUS Review — Discrepancy Resolutions (v2.0)

This section documents the explicit resolution of each of the 10 discrepancies identified in [OPUS_REMARKS.md](OPUS_REMARKS.md) Part X. These represent strategic tensions between the original engineering roadmap (v1.2) and the OPUS architectural review (2026-02-24). Each has been resolved with a specific action taken in this v2.0 update.

| # | Discrepancy | Dev Plan v1.2 | OPUS Assessment | Resolution in v2.0 |
|---|-------------|---------------|-----------------|---------------------|
| 1 | **MVP Scope** | 9 phases (0-8) before anything ships | Radically smaller — ship in weeks | **Added Phase 0.5** — Hello World journey ships first. Full Phase 0-8 remains as V1 engineering milestones. |
| 2 | **Pattern Count** | 14 core Patterns at MVP | 1-3 Patterns at MVP | **Amended Phase 5** — ship 3 at MVP (Structured Discussion, Research & Synthesis, Production Pipeline). Remaining 11 are V1.5 scope. |
| 3 | **Spines Priority** | Phase 6 on critical path | Post-MVP optimization | **Annotated Phase 6** — basic context assembly in Phase 2 for MVP. Spines optimization deferred to post-MVP. |
| 4 | **IPC Architecture** | Electron contextBridge | electron-trpc | **Updated Section 2.2** — adopted electron-trpc for type-safe IPC. |
| 5 | **LangChain Role** | Core plumbing | Abstracted behind port | **Updated Section 2.4** — LangChain wrapped behind OrchestratorPort interface. |
| 6 | **Agent Tools** | Phase 11 (post-MVP) | Day-one capability | **Amended Phase 4** — basic tool primitives (fs, shell, HTTP) in Phase 4. Full registry stays Phase 11. |
| 7 | **UX Modes** | Single "progressive disclosure" bullet | Architectural concern | **Expanded Phase 8** — Progressive Disclosure Architecture with Conversation Mode / Studio Mode. |
| 8 | **Industry Framing** | Not mentioned | Strategic positioning needed | **Added Section 1.5** — Engineering Disciplines Framework (Context, Intent, Specification Engineering). |
| 9 | **User Journey** | Feature-oriented phases | Hello World experience needed | **Added Phase 0.5** — complete Hello World user journey defined with exit criteria. |
| 10 | **Dual Truth** | Phase 1 one-time fix | Ongoing architectural pattern | **Amended Phase 1** — added DualTruthService interface that all persistence operations must use. |

> **Reference:** Full analysis in [OPUS_REMARKS.md](OPUS_REMARKS.md) Part X: "Discrepancies — OPUS_REMARKS vs. LOOM_DEVELOPMENT_PLAN.md"

---

## Appendix A: Key File Locations (Canonical References)

| Document | Purpose |
|----------|---------|
| `GLOSSARY-ok.md` | Authoritative terminology |
| `LOOM-ARCHITECTURE.md` | System structure |
| `Cognitive Architecture.md` | How intelligence executes |
| `4-Layer Memory Model.md` | Memory separation spec |
| `GOVERNANCE & CONTROLLED EVOLUTION FRAMEWORK.md` | META/A0/University spec |
| `ENGINE Manager.md` | Command interface spec |
| `CARTRIDGES-AND-PATTERNS.md` | Full Pattern system |
| `WARPS_TAKE.md` | Implementation architecture |
| `WARP_WORKFLOW_EXAMPLE.md` | Concrete World/Pattern example |
| `V2 Library/LOOM_V2_Master_Synthesis.md` | V2 feature synthesis |
| `knowledge/V2.0.0/notes.md` | **V2 Ideas & Scratchpad** (Anti-feature-creep buffer) |
| `Systems/README.md` | Spines, Dispatcher, cost optimization |
| `OPUS_REMARKS.md` | **Strategic review & recommendations** (v2.0 source — Context/Intent/Spec Engineering, DeepMind Autonomy Levels, Org-LOOM vision) |

---

## Appendix B: Commands Reference

```
/start_session          Start clean session (load L4, L3)
/close_session          Flush L1, close session
/switch_world <name>    Safe World switch
/recap                  Display current state
/use_pattern <name>     Activate Pattern
/pattern_suggest        Get Pattern recommendations
/checkpoint             Create manual L2 checkpoint
/abort                  Clean abort current Pattern
/tempo <mode>           Set tempo (allegro/andante/adagio)
/show_recent_deltas     View L2 episodic
/show_world <name>      View L3 knowledge
/show_telos             View L4 identity
/deploy_agents          Load World's agents
/replicate "<task>"     Run replication test
/feedback <note>        Submit feedback note
/offline                Toggle local-only mode
/status                 Show observability summary
```

---

## Appendix C: Keyboard Shortcuts

| Key | Action |
|-----|--------|
| K | Worlds Dashboard (Kanban) |
| A | Session Runner (Agent) |
| D | Memory Inspector (Docs) |
| C | Context Panel |
| M | Agent Profiles (Models) |
| S | Settings |
| T | Terminal |
| Cmd/Ctrl + K | Command Palette |
| Cmd/Ctrl + , | Settings |
| Esc | Close modal / Cancel |

---

## Appendix D: Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-14 | Initial plan |
| 1.1 | 2026-01-14 | Added high-impact items: Spines, Tempo, Primacy, SIE, Checkpointing, Behavior Signals, Templates, Abort protocol, Observability |
| 1.2 | 2026-01-14 | Added UI/UX from Automaker & Auto-Claude: Keyboard navigation, themes, streaming, Kanban view, progressive disclosure, dependency graphs, terminal integration, model selector |
| 2.0 | 2026-03-01 | Integrated OPUS_REMARKS strategic review: added Engineering Disciplines framework (Context, Intent, Specification), Phase 0.5 MVP Sprint, DeepMind Autonomy Levels, Hello World user journey, Org-LOOM strategic vision, resolved 10 OPUS discrepancies, updated tech stack recommendations |

---

**END OF DEVELOPMENT PLAN**
