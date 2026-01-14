# LOOM Engine — Development Plan

**Version:** 1.2
**Status:** Active
**Last Updated:** 2026-01-14

> This document translates the LOOM Engine conceptual specification into an actionable development plan. It consolidates all canonical and V2 materials into phases, features, stack decisions, and a detailed TODO.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technical Stack](#2-technical-stack)
3. [Development Phases](#3-development-phases)
4. [Complete Feature List](#4-complete-feature-list)
5. [Detailed TODO](#5-detailed-todo)
6. [Dependencies & Critical Path](#6-dependencies--critical-path)
7. [Validation Strategy](#7-validation-strategy)

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
| IPC | Electron contextBridge | Secure main/renderer communication |
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
| Orchestration | LangChain (thin layer) | Prompting, model routing, chain composition |
| Cloud Backends | OpenAI, Anthropic, Google, DeepSeek | Multi-model support for STANDARD/DEEP sessions |

**Key Constraints:**
- LangChain is **plumbing**, not an agent runtime
- No autonomous LangChain agents — only Pattern-bound chains
- Local models are the **default**; cloud is opt-in
- Per-session model selection visible in UI
- Per-Agent model preferences supported

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

**Exit Criteria:** Can start, run, checkpoint, recover, and properly close sessions with continuity preserved.

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

**Exit Criteria:** Agents can be defined, loaded, constrained, and their behavior tracked at runtime.

---

### Phase 5: Pattern System

**Goal:** Implement Pattern definitions, execution lifecycle, Primacy Protection, and Tempo.

**Deliverables:**
- [ ] Pattern schema (name, purpose, steps, inputs, outputs, constraints)
- [ ] Pattern registry in L3
- [ ] Pattern activation validation (META check)
- [ ] **Primacy Protection** — question-only phase before execution (Primacy Expansion)
- [ ] **Session Intent Envelope sealing** — lock intent before Pattern execution
- [ ] **Tempo System** — pace regulation (allegro/andante/adagio)
- [ ] 10-phase Pattern lifecycle implementation
- [ ] Pattern step execution with Agent handoffs
- [ ] Pattern completion conditions
- [ ] Pattern switching protocol
- [ ] **Pattern Abort & Rollback** — clean cancellation mid-Pattern
- [ ] Core 14 Patterns implementation

**Exit Criteria:** Can run full Pattern lifecycle with Primacy Protection, Tempo control, and safe abort.

---

### Phase 6: Dispatcher, Routing & Spines

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
- [ ] **Progressive disclosure** (details hidden by default, expandable)
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

### Dependency Graph

```
Phase 0 (Foundation + WebSocket)
    ↓
Phase 1 (Core Engine: Memory + Governance) ← CRITICAL
    ↓
Phase 2 (Session Lifecycle + SIE + Checkpointing)
    ↓
┌───────────────┬───────────────┐
↓               ↓               ↓
Phase 3         Phase 4         Phase 5
(Worlds +       (Agents +       (Patterns + Primacy
Templates)      Behavior        + Tempo + Abort)
                Signals)
└───────────────┴───────────────┘
                ↓
    Phase 6 (Dispatcher + SPINES) ← CRITICAL FOR COST (80%+ reduction)
                ↓
    Phase 7 (LLM: LOCAL-FIRST + Model-Agnostic) ← CRITICAL
                ↓
    Phase 8 (UI + Observability + Keyboard + Themes) ← MVP Complete
                ↓
┌───────────────┬───────────────┐
↓               ↓               ↓
Phase 9         Phase 10        Phase 11
(Security)      (Cost Gov)      (Tools)
└───────────────┴───────────────┘
                ↓
        Phase 12 (Backup/Audit)
                ↓
        Phase 13-15 (V2 & Beyond)
```

### Critical Path

1. **Phase 0** → Foundation (cannot start without)
2. **Phase 1** → Memory model + **Reconciliation** (Foundation + "Dual-Truth" fix)
3. **Phase 6** → Spines (80%+ cost reduction) - *Prototype moved to Phase 2*
4. **Phase 7** → LLM integration (local-first, enables AI)
5. **Phase 8** → UI (Streaming required to mask latency)

### MVP Definition

**MVP = Phase 0 + 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8**

At MVP:
- ✅ Create and switch Worlds (including from templates)
- ✅ Define Agents with Telos and behavior tracking
- ✅ Run Patterns with Primacy Protection, Tempo, and safe abort
- ✅ Session Intent Envelope prevents drift
- ✅ Incremental checkpointing provides crash resilience
- ✅ Spines enable cost-efficient routing (80%+ savings)
- ✅ Local models (Ollama) handle 80%+ of interactions
- ✅ Governed LLM calls with graceful offline degradation
- ✅ Model-agnostic (works with any provider)
- ✅ Keyboard-first, themeable UI
- ✅ Real-time streaming output
- ✅ Observability dashboard
- ✅ Memory persistence across sessions

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

---

**END OF DEVELOPMENT PLAN**
