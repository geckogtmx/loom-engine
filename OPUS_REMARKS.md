# OPUS_REMARKS.md — Architectural Review & Strategic Recommendations

> **Author:** Claude Opus 4.6 (System Architect)
> **Date:** 2026-02-24
> **Scope:** Full codebase audit, conceptual framework review, external landscape analysis, strategic recommendations
> **Inputs:** LOOM Engine repository (all packages, docs, tests), Obsidian conceptual vault, Google ADK docs, Context Engineering literature, Intent Engineering frameworks, Spec-Based Development research, Cursor IDE and Google Antigravity analysis

---

## Preamble

This document is a frank strategic review of the LOOM Engine project. It examines what exists today in code, what exists only in concept, how the project compares to the rapidly evolving AI tooling landscape of 2025-2026, and — most importantly — what concrete path leads to a tool that people actually use.

The review is structured to be useful at multiple levels: for the next development session, for the next quarter of work, and for the long-term vision of the project.

**The central question this document addresses:** *Can LOOM Engine become a real product, and what must change for that to happen?*

---

## Part I: State of the Engine

### What Exists Today (Working Code)

The LOOM Engine is a **pnpm monorepo** with four packages:

| Package | Purpose | Status |
|---------|---------|--------|
| `packages/core` | Business logic, governance, memory, LLM integration | ~70% implemented, 96% line coverage in core modules |
| `packages/db` | Drizzle ORM schema, SQLite persistence | Schema complete, migrations working |
| `apps/electron` | Desktop shell, IPC handlers, security hardening | Scaffolded, **IPC registration broken** |
| `apps/web` | React 18 UI, Zustand state, theme system | UI shell complete, not wired to data |

**Phases completed (0-8, partial):**

- **Phase 0-1:** Foundation + Core Memory/Governance — 4-layer memory model (L1-L4) fully designed, L1/L2 substantially implemented, MetaGovernance skeleton, A0Enforcer skeleton
- **Phase 2:** Session lifecycle — State machine (7 states), checkpointing, recovery, continuity artifacts
- **Phase 3:** Worlds — CRUD, telos isolation, templates, cloning, safe cross-world navigation
- **Phase 4:** Agents — Profile schema, telos storage, runtime instantiation, role constraints, escalation
- **Phase 5:** Patterns — 5 of 14 core patterns, 10-phase lifecycle, Primacy Protection, Tempo system
- **Phase 6:** Dispatcher — DispatchGate, SpineGenerator, ContextAssembler (partial)
- **Phase 7:** LLM Integration — ProviderFactory (Ollama/OpenAI/Anthropic/Google), streaming, rate limiting
- **Phase 8:** UI — Theme system (25+ themes), MainLayout, Sidebar, StatusFooter, view switching

**Critical blocker:** IPC handler registration fails at Electron startup. The UI cannot communicate with the backend. This is the #1 item to fix before anything else works end-to-end.

### What Exists Only in Concept (The Obsidian Vault)

The Obsidian vault contains approximately **3,000+ lines** of rich conceptual material covering:

- 9 Pattern categories with detailed anatomy and lifecycle
- 8 World types with 4-phase lifecycle (Birth/Growth/Maturity/Closure)
- Agent evolution protocols with lineage architecture and trait mutation
- Threading system with 7 thread types and branching/linking
- Feedback loops (micro/macro) with 3 channels
- Multi-World ecosystem management with bridging protocols
- Operator Growth Kernel (OGK) as a non-agentic observational module
- Philosophical positioning (Safety-First, Capability-First, Symbolic AI, Human-Centered views)
- World Identity system (tone, lexicon, themes, emotional resonance, boundaries)
- Clean Shutdown Protocol (6-step world closure)
- Cartridge system (modular workflow templates)
- Opening/Closing rituals, dosage control, energy awareness

This is a **remarkably well-thought-out framework**. The depth of thinking here is genuinely impressive — it anticipates problems that most AI frameworks haven't even considered (identity drift, cognitive load management, emotional resonance, world lifecycle).

### The Gap: Vision vs. Reality

Here's the honest assessment:

| Concept (Obsidian) | Implementation (Code) | Gap |
|--------------------|-----------------------|-----|
| 9 Pattern categories | 5 of 14 core patterns | Large — most pattern types are spec-only |
| 10-phase Pattern lifecycle | PatternLifecycle class exists | Medium — skeleton works, but no real execution |
| Agent Evolution Protocol | Basic AgentRuntime | Very Large — lineage, traits, karma not started |
| Threading system | Not implemented | Complete gap |
| OGK (Operator Growth Kernel) | Not implemented | Complete gap |
| Feedback loops (micro/macro) | Not implemented | Complete gap |
| World Identity system | world_telos table exists | Large — no tone/lexicon/resonance tracking |
| Cartridge system | Patterns serve this role conceptually | Medium — renaming needed, modular loading not done |
| Opening/Closing rituals | Not implemented | Complete gap |
| Multi-World bridging | World isolation exists (the opposite) | Medium — isolation works, bridging is inverse |
| Context Assembly | ContextAssembler skeleton | Large — no real context budget optimization |
| Markdown ↔ DB reconciliation | Not implemented | Critical gap for "Markdown is Canonical" |

**The uncomfortable truth:** The Obsidian vault describes a system that would take 2-3 years of focused development to fully implement. The current codebase is perhaps 15-20% of the way there, and the most important 15% (infrastructure, data model, security) is done, while the most visible 85% (the parts users interact with) is not.

---

## Part II: The External Landscape (2025-2026)

### Google Agent Development Kit (ADK)

**What it is:** Google's open-source framework for building AI agents. Released in 2025, available in Python, TypeScript, Go, and Java.

**Key abstractions:**
- `LlmAgent` — LLM-driven dynamic routing
- `SequentialAgent`, `ParallelAgent`, `LoopAgent` — Deterministic workflow agents
- Agent-as-Tool composition — Agents can be tools for other agents
- Scoped state (app/user/temp) — Hierarchical state management
- Event-sourced architecture — Append-only event streams
- Built-in evaluation framework

**What LOOM should learn from ADK:**
1. **Agent orchestration primitives are table stakes.** LOOM needs Sequential, Parallel, Loop, and Hierarchical delegation as first-class patterns. Currently, LOOM has governance but not flexible composition.
2. **Agent-as-Tool is powerful.** The idea that an Agent can be wrapped and used as a tool by another Agent enables composability that LOOM's rigid role hierarchy doesn't support.
3. **Event sourcing fits LOOM's L2 (Episodic) perfectly.** ADK's append-only event stream is exactly what LOOM's L2 should be.
4. **A formal callback/hook system** at governance enforcement points would make MetaGovernance practical, not just theoretical.

**Where LOOM surpasses ADK:**
- ADK has no governance model. No "Operator Supremacy," no constitutional constraints, no layered approval.
- ADK's state is a flat key-value store. LOOM's L1-L4 is fundamentally more sophisticated.
- ADK has no concept of World isolation, identity, or continuity across sessions.
- ADK has no human-in-the-loop as a first-class primitive.

> **Source:** [Google ADK Documentation](https://google.github.io/adk-docs/)

### Context Engineering: The Discipline LOOM Was Already Practicing

**What it is:** The systematic design of everything an LLM sees at runtime — retrieved documents, system state, prior outputs, tool definitions, memory, and API results. Recognized as the successor to "prompt engineering" in 2025.

Gartner stated in mid-2025: *"Context engineering is in, and prompt engineering is out."* LangChain's 2025 State of Agent Engineering report found that **57% of organizations now have AI agents in production**, yet 32% cite quality as the top barrier — with most failures traced to **poor context management**, not LLM capabilities.

**Core principles:**
1. Context is the new hyperparameter — output quality is determined by context quality
2. Layered context architecture — static instructions, semi-static knowledge, dynamic conversation, ephemeral scratchpad
3. Context budget management — every token has opportunity cost
4. Context poisoning prevention — bad context is worse than no context
5. Tool-augmented context — give models tools to fetch context on demand

**LOOM's relationship to Context Engineering:**

This is the key insight of this entire review: **LOOM's 4-Layer Memory Model IS a context engineering architecture.** The industry is now discovering and naming what LOOM was designing from the start:

| Context Engineering Principle | LOOM Equivalent |
|------------------------------|-----------------|
| Static instructions layer | L4 (Telos) — immutable identity |
| Semi-static knowledge layer | L3 (Knowledge) — world/pattern/agent definitions |
| Dynamic conversation layer | L2 (Episodic) — append-only session logs |
| Ephemeral scratchpad | L1 (Active) — in-memory RAM, flushed on close |
| Context budget management | ContextAssembler + SpineGenerator (partial) |
| Context quality scoring | Not yet implemented |
| Tool-augmented retrieval | Not yet implemented |

**What this means strategically:** LOOM should explicitly position itself as a **Context Engineering platform**. This is the language the industry now uses. The 4-layer model is a genuine innovation that predates the mainstream adoption of the term.

> **Sources:** [deepset blog](https://www.deepset.ai/blog/context-engineering-the-next-frontier-beyond-prompt-engineering), [CIO](https://www.cio.com/article/4080592/context-engineering-improving-ai-by-moving-beyond-the-prompt.html), [Context Studios](https://www.contextstudios.ai/blog/context-engineering-how-to-build-reliable-llm-systems-by-designing-the-context)

### Intent Engineering: Operator Supremacy Validated

**What it is:** The practice of translating human goals into precise, actionable specifications that AI agents can execute reliably.

**Key concepts:**
- **Intent Decomposition:** Breaking goals into sub-intents → tasks → actions
- **Intent Disambiguation:** Ask (don't assume), default safely, present options
- **Intent Persistence:** Track original intent through decomposition and execution
- **Intent Verification:** Check outcomes against original intent
- **Intent Contracts:** Formalized agreements between user and system

**LOOM's relationship:**
- `Operator Supremacy` from AI_CODEX.md IS intent engineering principle #1
- `Silence by Default` IS intent boundary enforcement
- `task.md` artifacts ARE lightweight intent contracts
- L4 (Telos) IS an intent store — the highest-level "what is this system for"
- `SessionIntentEnvelope` (already implemented!) IS an intent contract

**What's missing:** A formal intent tracking pipeline that follows decomposition from Goal → Plan → Task → Action, with the ability to always answer "what was the operator's original intent?" and "are we still aligned with it?" at any point during execution.

> **Source:** [intent-driven.dev](https://intent-driven.dev/)

### Specification-Based Development: Markdown-Canonical Confirmed

**What it is:** Driving agent behavior through formal or semi-formal specifications rather than imperative code or ad-hoc prompts. Recognized by Thoughtworks and ICSE 2026 as an emerging methodology.

**Key insight:** SBD splits work into two phases: *thinking* (humans write specifications) and *doing* (agents execute against specs). ICSE 2026 research demonstrates that incorporating architectural documentation **substantially improves LLM-assisted code generation** in functional correctness, architectural conformance, and code modularity.

**LOOM's relationship:**
- `AI_CODEX.md` IS a system-level specification
- `Markdown is Canonical` (Mandate #4) IS spec-based development
- L3 (Knowledge) stores world/pattern/agent definitions — these ARE specifications
- The knowledge/ directory IS a spec registry

**What's missing:** Specs should be machine-parseable and automatically generate test skeletons, conformance checks, and task checklists. Currently, LOOM's markdown specs are human-readable but not programmatically actionable.

> **Sources:** [Thoughtworks](https://thoughtworks.medium.com/spec-driven-development-d85995a81387), [Augment Code](https://www.augmentcode.com/guides/ai-spec-driven-development-workflows)

### Competitive Positioning: Cursor, Antigravity, Claude Code

**Cursor IDE** (VS Code fork with deep AI integration):
- Inline editing, codebase chat, Composer (multi-file agent mode)
- `.cursorrules` as project constitution
- Codebase indexing for semantic search
- Single model, no governance, no persistent memory, no world isolation

**Google Antigravity** (released November 2025):
- Multi-agent: deploy 5 agents on 5 different bugs simultaneously
- Artifact-based verification (task lists, screenshots, browser recordings)
- Autonomous planning, execution, and verification
- Multi-model support (Gemini 3, Claude, OpenAI)
- **No governance layer, no structured memory, no intent tracking**

**Claude Code** (Anthropic CLI):
- Agent mode with file read/write, terminal, web access
- Plan mode, todo tracking, sub-agents
- CLAUDE.md as project constitution
- Single-session context, no persistent memory between sessions

| Dimension | Cursor | Antigravity | Claude Code | **LOOM** |
|-----------|--------|-------------|-------------|----------|
| Domain | Code | Code | Code | **Any project** |
| Agent Model | Single | Multi-agent | Single + sub-agents | **Multi-agent, governed** |
| Human Role | Co-pilot | Supervisor | Co-pilot | **Operator (sole intent source)** |
| Context | Codebase index | Task-scoped | Session-scoped | **4-layer persistent memory** |
| Multi-Model | No | Yes | No | **Yes (by design)** |
| Governance | Advisory (.cursorrules) | None | Advisory (CLAUDE.md) | **Constitutional (enforced)** |
| Non-technical users | No | No | No | **Target audience** |
| Memory persistence | Per-session | Per-task | Per-session | **L1-L4 (minutes to permanent)** |

**The positioning opportunity:** Every tool in this space is developer-first and code-focused. LOOM's stated mission — "for any type of person, technical or non-technical" — is **completely unoccupied territory**. No one is building a governed, multi-agent collaboration harness for non-developers.

> **Sources:** [Google Antigravity Blog](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/), [Antigravity Guide](https://antigravity.im)

---

## Part III: What LOOM Gets Right

### 1. The 4-Layer Memory Model Is a Genuine Innovation

LOOM's L1 (Active) → L2 (Episodic) → L3 (Knowledge) → L4 (Telos) memory architecture is the most sophisticated context engineering system I've seen in any project at this scale. It predates the mainstream adoption of "Context Engineering" as a discipline and naturally implements the layered context architecture that researchers now recommend.

The key insight — that memory should have different lifespans, mutability rules, and governance requirements at each layer — is correct and important. No major framework (ADK, LangChain, CrewAI) has anything this structured.

### 2. Constitutional Governance Is the Unique Differentiator

The MetaGovernance + A0Enforcer system, while still skeletal in implementation, represents a design philosophy that no competitor offers. In a world where AI agent safety is a growing concern, having enforced (not advisory) governance is a genuine product differentiator.

The AI_CODEX.md approach — a constitutional document that ALL models must follow — is ahead of its time. Cursor has `.cursorrules` (advisory). Claude Code has `CLAUDE.md` (advisory). LOOM has a rules engine that can actually block actions.

### 3. Operator Supremacy Is Intent Engineering Done Right

"Never infer intent; always ask" is the correct design principle for AI-human collaboration. Every major AI failure in production traces back to the system assuming what the user wanted instead of asking. LOOM got this right from day one.

### 4. Model-Agnostic Architecture

The ProviderFactory with local-first routing (THIN → Ollama, STANDARD → Ollama/OpenAI fallback, DEEP → Anthropic/OpenAI/Ollama) is well-designed. As the model landscape fragments, this flexibility is essential.

### 5. World Isolation

The principle that projects never bleed data is correct for privacy, for cognitive clarity, and for the practical reality that different projects need different rules, agents, and tone. This maps cleanly to the "separation of concerns" that Context Engineering recommends.

---

## Part IV: What Needs to Change

### 1. The Electron Question

**Current:** Electron 33+ desktop application.

**The initial impulse:** Electron adds complexity (security hardening, IPC, preload bridges, native module compilation). The IPC handler registration bug blocking Phase 8 makes this feel heavy.

**However, Electron is the right choice. Here's why:**

LOOM agents need **deep system access** to be useful — not just for developers, but for any serious project work:

| Capability | Why It Matters | Requires Desktop |
|-----------|---------------|-----------------|
| **Shell / terminal execution** | Agents running scripts, build tools, data processing | Yes |
| **File system read/write** | Reading local documents, organizing project files, markdown export | Yes |
| **Database access** | Local SQLite, connecting to user's databases | Yes |
| **OS keychain (safeStorage)** | Secure API key storage | Yes |
| **Native process spawning** | Running Ollama, local tools, data pipelines | Yes |
| **Local network access** | Connecting to local services, dev servers, IoT devices | Yes |
| **Clipboard, drag-and-drop** | Natural desktop UX for non-technical users | Yes |

A browser-based architecture puts agents behind a sandbox wall. You'd need to rebuild everything Electron gives you for free (file access, shell, native modules) as HTTP endpoints — producing a worse version of what Electron provides natively. Cursor is Electron. VS Code is Electron. Claude Code runs in terminal. Every tool that needs system access stays on the desktop.

**The real problem isn't Electron — it's the IPC boilerplate.** The fix is to simplify IPC, not abandon the desktop:

**Recommendation:** **Stay desktop-first. Simplify the IPC layer.**

1. **Fix the IPC registration bug** — this is likely an initialization ordering issue in `main.ts`, not an architectural flaw
2. **Adopt `electron-trpc` or `comlink`** — type-safe RPC over IPC without manual handler registration. This eliminates the class of bugs you're hitting while keeping full system access
3. **Keep `packages/core` portable** — it should run in both Electron's main process AND a standalone Node.js server. This preserves the option for a web/server deployment path later (for Org-LOOM) without sacrificing desktop capabilities
4. **For future Org-LOOM:** The Electron app connects to a sync server for multi-user collaboration, but the local agent retains full system access. Best of both worlds.

**The principle:** LOOM agents are not chatbots in a browser. They are **local cognitive operators** with full access to the user's machine, governed by constitutional rules. That's the desktop contract.

### 2. The Complexity Problem

**The Obsidian vault describes a system that would overwhelm most users.** The conceptual framework is beautiful for someone who wants to think deeply about AI collaboration. It is paralyzing for someone who wants to "get a recipe for cheesecake."

LOOM's stated mission includes non-technical users. But the current conceptual model requires understanding:
- Worlds, Sessions, Patterns, Threads, Agents, Cartridges, Regions
- 4 memory layers with different mutability rules
- Governance rules, META, A0U, OGK
- Opening rituals, closing rituals, dosage control
- 9 pattern categories, 10-phase lifecycle
- Identity drift, tone management, emotional resonance

**This is too much for an MVP.** The concepts are valid, but they need to be discoverable progressively, not front-loaded.

**Recommendation:** Design a **progressive disclosure architecture:**

| User Level | What They See | What's Actually Happening |
|-----------|---------------|---------------------------|
| Beginner | "New Project" → chat interface | World auto-created with sane defaults, L4 telos inferred from first few messages |
| Intermediate | Projects, sessions, model selection | World management, session lifecycle, provider routing |
| Advanced | Agents, patterns, governance rules, threading | Full LOOM power — everything in the Obsidian vault |
| Power User | Raw markdown specs, custom patterns, agent creation | Direct L3/L4 editing, custom CartridgeS |

**The cheesecake test:** A non-technical user should be able to open LOOM, type "I want to develop a cheesecake recipe for my bakery," and have the system guide them through a structured creative process — without ever seeing the word "Telos" or "L4 Identity Layer."

### 3. Missing: Agent Orchestration Primitives

LOOM has agents and governance. What it lacks is **composable orchestration** — the ability to wire agents into workflows dynamically.

**Learn from ADK:** Implement four core orchestration types:
1. `SequentialPipeline` — Agent A → Agent B → Agent C (each seeing previous output)
2. `ParallelFanOut` — Agents A, B, C work simultaneously on the same input
3. `GovernedLoop` — Repeat Agent A until a condition is met (with META oversight preventing infinite loops)
4. `HierarchicalDelegation` — Agent A decomposes a task and delegates sub-tasks to B, C, D

Each of these should have governance hooks — META validates the pipeline before execution, A0 enforces constraints at each step.

### 4. Missing: Context Assembly Engine

The ContextAssembler skeleton exists but lacks the critical intelligence:

**What's needed:**
- **Context budget calculator** — Given a model's context window, what fits?
- **Relevance scorer** — When L3 knowledge exceeds the budget, which items are most relevant to the current task?
- **Summarization pipeline** — Compress L2 episodic history to fit within budget
- **Dynamic assembly** — Different tasks need different context compositions (a creative brainstorm needs world identity + recent threads; a technical task needs agent specs + pattern constraints)

**This is where LOOM's theory meets practice.** The 4-layer model is the architecture. The Context Assembly Engine is the runtime that makes it useful.

### 5. Missing: Intent Tracking Pipeline

LOOM has `SessionIntentEnvelope` (good start) but lacks:
- Intent decomposition: automatically breaking "develop a marketing strategy" into sub-intents
- Intent persistence: tracking the original intent through all subsequent actions
- Intent drift detection: alerting when execution has diverged from stated intent
- Intent verification: at session end, checking outcomes against original intent

**This should be a core differentiator.** "LOOM always remembers what you asked for" is a powerful pitch.

### 6. The LangChain Decision

**Current:** LangChain is listed as "plumbing only, NO autonomous agents."

**The problem:** LangChain is a rapidly-changing abstraction layer that adds dependency weight without adding clear value when you're already building your own orchestration.

**Recommendation:** **Abstract it away.** Keep LangChain as one possible backend behind an `OrchestratorPort` interface. Let the core work without it. If a better tool emerges (and in this space, one always does), swap it without touching application code.

Concretely:
```
interface OrchestratorPort {
  assemble(layers: ContextLayers): AssembledContext;
  route(context: AssembledContext, pipeline: Pipeline): ExecutionPlan;
  execute(plan: ExecutionPlan): AsyncIterable<ExecutionEvent>;
}
```

LangChain becomes `LangChainOrchestrator implements OrchestratorPort`. Tomorrow it could be `ADKOrchestrator` or `NativeOrchestrator`.

### 7. The "Non-Technical User" Gap

The current UI is a developer tool. Dark theme, sidebar navigation, "Engine Manager" view, terminal emulator (xterm.js). This is fine for Phase 1, but it won't serve the cheesecake baker.

**Long-term, LOOM needs two UX modes:**

1. **Conversation Mode** (default for non-technical users): Looks like a chat app. Projects on the left, conversation in the center, context/memory visualization on the right. Think: enhanced ChatGPT with persistent memory and project structure.

2. **Studio Mode** (for power users): The current dashboard/sidebar/engine-manager layout. Full visibility into agents, patterns, governance, threading.

Users should be able to switch freely. The underlying engine is the same.

---

## Part V: The MVP Path

### What "MVP" Means for LOOM

An MVP is the smallest version of LOOM that demonstrates the core value proposition and is usable by a real person for a real task. It is NOT the full Obsidian vault brought to life.

### The Core Value Proposition (One Sentence)

> **LOOM gives you persistent, governed AI collaboration that remembers everything and never goes off-script.**

### MVP Feature Set

**Include:**
1. **Create a World** (project) — name, purpose, optional description
2. **Start a Session** — within a World, begin a conversation
3. **Multi-model chat** — choose or auto-route to Ollama/OpenAI/Anthropic
4. **Session memory** — previous sessions visible and resumable (L2 working)
5. **World memory** — knowledge persists across sessions (L3 working)
6. **Basic governance** — world rules enforced, no cross-world data bleed
7. **One Pattern** — "Structured Discussion" (brainstorm → organize → decide)
8. **Markdown export** — all content exportable as markdown files
9. **Theme system** — already built, ship it

**Exclude from MVP (defer to V2+):**
- Agent Evolution Protocol
- Threading system
- OGK (Operator Growth Kernel)
- Feedback loops (micro/macro)
- Opening/Closing rituals
- Multi-World bridging
- Pattern customization
- Agent creation UI
- Complex governance rules
- Tempo system
- Dosage control

### The "Hello World" User Journey

1. User opens LOOM
2. Sees "Create your first project" prompt
3. Types: "Marketing strategy for my new coffee shop"
4. LOOM creates a World with:
   - Name: "Coffee Shop Marketing"
   - Purpose: "Develop marketing strategy for a new coffee shop"
   - Default agent assigned
   - Default pattern available
5. User starts chatting. The AI remembers everything.
6. User closes LOOM, comes back tomorrow. **Everything is still there.**
7. User starts a new session. AI provides a recap of where they left off.
8. After 3 sessions, user has a structured marketing plan they can export as markdown.

**If this journey works, LOOM has demonstrated its core value.** Everything else is enhancement.

### Critical Path Dependencies

```
Fix IPC handlers (or eliminate IPC via web-server approach)
    ↓
Wire UI to real data (World CRUD, Session lifecycle)
    ↓
Implement Context Assembly (L1-L3 content → LLM context window)
    ↓
Implement basic session memory (L2 summaries across sessions)
    ↓
Implement "Structured Discussion" pattern (the one MVP pattern)
    ↓
Markdown export
    ↓
MVP
```

Estimated timeline: If focused full-time, 4-8 weeks. If part-time, 2-3 months.

---

## Part VI: The V5 Vision

### Where LOOM Sits in 2027+

By V5, the landscape will have matured. ADK, Antigravity, Claude Code, and competitors we haven't seen yet will be established. LOOM's play is not to out-engineer Google. It's to occupy the space they're not interested in:

**LOOM is the governed collaboration harness for everyone — not just developers.**

### The Platform Evolution

**V1 (MVP):** Single-user, single-model, basic memory. "ChatGPT that remembers."

**V2:** Multi-model routing, multiple agents per world, pattern library. "An AI team that works for you."

**V3:** Agent marketplace, community patterns, inter-world bridging. "An ecosystem."

**V4:** Team/organizational use, shared worlds, role-based access. "Enterprise LOOM."

**V5:** Protocol layer (A2A, MCP), plugin architecture, custom agent frameworks. "LOOM as a platform."

### Key V5 Capabilities

**Agent Marketplace:** Users create and share agent configurations. A "marketing strategist" agent created by one user can be imported by another. Agents are markdown specs (already LOOM's approach) — no code required.

**Cross-World Intelligence:** With user permission, patterns discovered in one World can be suggested in another. "In your 'Podcast Production' world, you always do X before Y. Want me to apply that here?"

**Protocol Compatibility:**
- **A2A (Agent-to-Agent Protocol):** LOOM agents can communicate with external agents (Google's, others') using the standardized JSON protocol
- **MCP (Model Context Protocol):** LOOM can expose tools and context via Anthropic's MCP standard
- **OpenSpec:** LOOM's markdown specs become interoperable with the emerging spec-driven dev ecosystem

**LOOM as Platform vs. Product:**
- **Product:** The desktop/web app people download and use (revenue: subscription or one-time license)
- **Platform:** The engine that other tools build on (revenue: API access, marketplace fees, enterprise licensing)

Both paths are viable. The platform path is higher ceiling but requires more investment. Start with product, evolve to platform.

---

## Part VII: Stack Recommendations

### Keep

| Component | Why |
|-----------|-----|
| **TypeScript (Strict)** | Correct choice. The whole ecosystem runs on it. |
| **SQLite + Drizzle** | Perfect for local-first, portable, zero-config. Drizzle is the right ORM. |
| **React 18** | Stable, massive ecosystem, no reason to change. |
| **Zustand** | Right choice for this app's state management needs. Simple, fast, TypeScript-first. |
| **Tailwind CSS 4** | Correct choice. Industry standard. |
| **Vitest** | Fast, Vite-native, good API. Keep. |
| **pnpm monorepo** | Working well. No reason to change. |
| **Zod** | Excellent for runtime validation. Essential for IPC/governance. |
| **Model-agnostic LLM layer** | ProviderFactory design is solid. Keep expanding. |

### Replace or Reconsider

| Component | Current | Recommendation | Why |
|-----------|---------|----------------|-----|
| **Manual IPC handlers** | Hand-written ipcMain.handle() | Use `electron-trpc` or `comlink` | Type-safe RPC eliminates handler registration bugs entirely |
| **LangChain** | AI orchestration | Abstract behind OrchestratorPort | Dependency risk, rapid API churn, LOOM's needs are specific |
| **xterm.js** | Terminal in UI | Keep — but defer deep integration to V2 | Agents need shell access; xterm.js visualizes it. Essential for dev users, hide for beginners. |
| **@xyflow/react** | Graph visualization | Defer for MVP | Impressive but not needed until agent/pattern visualization is built |
| **dnd-kit** | Drag and drop | Defer for MVP | Not needed until complex UI interactions are built |

### Add

| Component | Purpose | Why |
|-----------|---------|-----|
| **electron-trpc** | Type-safe IPC | Eliminates manual handler registration, provides end-to-end type safety between renderer and main process |
| **Marked or MDX** | Markdown processing | For "Markdown is Canonical" — parse, render, and validate markdown specs |
| **AI SDK (Vercel)** | Streaming LLM responses | Well-maintained, model-agnostic, excellent streaming UX primitives |
| **@tanstack/query** | Data fetching/caching | For the web UI, handles loading states, caching, refetching elegantly |
| **node-pty** (future) | Terminal process spawning | For agent shell access — run commands, capture output, stream to xterm.js |

### Architecture: Desktop-First with Portable Core

**Keep:** Electron as the primary runtime (agents need system access)

**Improve:** Replace manual IPC with type-safe RPC

```
┌──────────────────────────────────────────────────┐
│              Electron Main Process                │
│     (Full Node.js — shell, fs, OS access)        │
│                                                    │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ SQLite  │  │ LLM Providers│  │ Agent Tools  │ │
│  │(Drizzle)│  │(Ollama/Cloud)│  │(shell,fs,db) │ │
│  └─────────┘  └──────────────┘  └─────────────┘ │
│  ┌──────────────────────────────────────────────┐│
│  │  Core Engine (Memory, Gov, Sessions,         ││
│  │  Patterns, Agents, Context Assembly)         ││
│  └──────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────┐│
│  │  electron-trpc Router (type-safe IPC)        ││
│  └──────────────────────────────────────────────┘│
└──────────────────┬───────────────────────────────┘
                   │ Type-safe IPC (trpc)
┌──────────────────┴───────────────────────────────┐
│           Electron Renderer (Sandboxed)           │
│  ┌──────────────────────────────────────────────┐│
│  │  React SPA (Vite) + Zustand + Tailwind       ││
│  │  trpc client ← type-safe calls to main       ││
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘

Future (V4 Org-LOOM):
┌──────────────────────────────────────────────────┐
│           Sync Server (Cloud/Self-hosted)          │
│  Event sync, Org Telos, Joint Worlds, Auth        │
│  packages/core runs here too (portable)           │
└──────────────────────────────────────────────────┘
```

**Why this works:**
- **Agents have full system access** — shell, file system, databases, local tools, Ollama
- **Type-safe IPC** eliminates the current blocking bug class entirely
- **`packages/core` stays portable** — same engine runs in Electron main process today, in a server for Org-LOOM tomorrow
- **Security model is proven** — Electron's contextIsolation + sandbox keeps the renderer safe while the main process has full power
- **Desktop UX** — native clipboard, drag-and-drop, OS integration, safeStorage for secrets
- **Agent tool access** — the key differentiator. LOOM agents can read files, run shell commands, query databases, execute scripts — all governed by META
**The cost:** Replacing manual IPC handlers with electron-trpc requires a migration of the 12 existing handlers. This is a one-time investment (~1-2 days) that eliminates the entire category of IPC registration bugs and makes every future handler trivial to add.

---

## Part VIII: Concrete Next Steps

### This Week

1. **Replace manual IPC with electron-trpc (or comlink).** Don't debug the handler registration bug — eliminate the entire class of bugs by switching to type-safe RPC over IPC. This unblocks Phase 8 and makes future IPC work painless.
2. **Wire the UI to real data.** World CRUD must work end-to-end via the new trpc router. This is the #1 prerequisite for everything else.
3. **Add Operator ID to all write operations.** Even with a single user, start tracking who wrote what. This is a cheap change now that pays off massively for Org-LOOM later.

### This Month

4. **Implement Context Assembly Engine.** This is the heart of LOOM. When an LLM call is made, the system must:
   - Read L4 (telos) for identity/constraints
   - Read L3 (knowledge) for relevant world knowledge
   - Read L2 (episodic) for session history
   - Assemble into a context that fits the model's window
   - Optimize for relevance within the token budget
5. **Implement basic L2 session summaries.** After each session, generate and store a summary. On the next session, load the summary as context. This alone makes LOOM 10x more useful than ChatGPT.
6. **Build the "Hello World" user journey.** Create Project → Start Session → Chat → Close → Resume → See recap.

### This Quarter

7. **Implement 3 core patterns** — "Structured Discussion" (brainstorm → organize → decide), "Research & Synthesis" (gather → analyze → summarize), "Production Pipeline" (draft → edit → polish).
8. **Build progressive disclosure UI.** Beginner sees a chat. Intermediate sees projects and sessions. Advanced sees the full dashboard.
9. **Add markdown export.** Every World's content exportable as a structured markdown directory.
10. **Implement Intent Tracking.** SessionIntentEnvelope evolves into a full intent pipeline: capture → decompose → track → verify.
11. **Ship an alpha.** Even if rough, get it into the hands of 5-10 people and observe how they use it.

---

## Appendix A: LOOM Concepts → Industry Terminology

| LOOM Term | Industry Term (2025-2026) | Notes |
|-----------|---------------------------|-------|
| L4 (Telos) | System Prompt + Constitutional Rules | LOOM's version is persistent and enforced, not per-call |
| L3 (Knowledge) | Knowledge Base / RAG Corpus | LOOM adds governance and world-scoping |
| L2 (Episodic) | Session Memory / Event Log | LOOM makes it append-only and structured |
| L1 (Active) | Working Memory / Scratchpad | Standard across all frameworks |
| World | Project / Workspace / Environment | LOOM adds identity, isolation, and lifecycle |
| Operator | User / Human-in-the-loop | LOOM elevates to "sole source of intent" |
| META / MetaGovernance | Guardrails / Safety Layer | LOOM's is constitutional, not just advisory |
| A0Enforcer | Permission Gateway / Policy Engine | Unique to LOOM |
| Pattern / Cartridge | Workflow Template / Runbook | LOOM adds governance and lifecycle |
| Agent | Agent (same term) | LOOM adds role constraints and escalation |
| Session | Session / Conversation / Run | LOOM adds state machine and recovery |
| Thread | Task / Workstream / Branch | LOOM adds semantic linking and lifecycle |
| Spine | Compressed Context / Summary | LOOM's approach to context budget management |
| Dispatcher | Orchestrator / Router / Planner | LOOM adds cost estimation and governance gating |
| OGK | User Analytics / Behavioral Insights | LOOM makes it non-agentic and transparent |
| Telos | Mission / Purpose / Constitution | LOOM makes it immutable and enforced |

## Appendix B: Reference Links

**Context Engineering:**
- [Context Engineering: The Next Frontier (deepset)](https://www.deepset.ai/blog/context-engineering-the-next-frontier-beyond-prompt-engineering)
- [Context Engineering Guide (PromptingGuide.ai)](https://www.promptingguide.ai/guides/context-engineering-guide)
- [Context Engineering in 2026 (CodeConductor)](https://codeconductor.ai/blog/context-engineering/)
- [From Mode Collapse to Context Engineering (Context Studios)](https://www.contextstudios.ai/blog/from-mode-collapse-to-context-engineering-how-we-build-reliable-ai-systems-2026)

**Intent Engineering & Spec-Based Development:**
- [Intent-Driven Development & OpenSpec](https://intent-driven.dev/)
- [Spec-Driven Development (Thoughtworks)](https://thoughtworks.medium.com/spec-driven-development-d85995a81387)
- [AI Spec-Driven Workflows (Augment Code)](https://www.augmentcode.com/guides/ai-spec-driven-development-workflows)
- [What is Spec-Driven Development? (Intellibytes)](https://medium.com/@Intellibytes/what-is-spec-driven-development-17e9681c6fd1)

**Agent Frameworks & Tools:**
- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [Google Antigravity Launch Blog](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)
- [Google Antigravity Guide](https://antigravity.im)
- [AI Agents in 2025 (IEEE Spectrum)](https://spectrum.ieee.org/2025-year-of-ai-agents)
- [Agentic AI in Engineering (SimScale)](https://www.simscale.com/blog/2026-the-breakout-year-for-agentic-ai-in-engineering/)

**Industry Analysis:**
- [AI Trends 2026 (OpenDataScience)](https://opendatascience.com/the-ai-trends-shaping-2026/)
- [How Agentic AI Will Reshape Engineering (CIO)](https://www.cio.com/article/4134741/how-agentic-ai-will-reshape-engineering-workflows-in-2026.html)
- [Best AI Coding Agents 2026 (Faros AI)](https://www.faros.ai/blog/best-ai-coding-agents-2026)
- [AI Tools for Developers 2026 (Cortex)](https://www.cortex.io/post/the-engineering-leaders-guide-to-ai-tools-for-developers-in-2026)

---

## Part IX: Org-LOOM — The Enterprise & Team Collaboration Layer

### What Already Exists in the Design

The Org-LOOM vision is remarkably well-specified. In [22-ORG-LOOM.md](knowledge/02_Governance/22-ORG-LOOM.md), the conceptual framework defines six structural components for organizational collaboration:

1. **Org Identity** — A shared organizational personality (tone, vocabulary, cultural flavor, strategic bias) that agents from different Operators adopt when working in shared contexts
2. **Org Values & Working Principles** — Transparency, calm communication, shared responsibility, clarity over ambiguity, alignment over speed
3. **Org Communication Protocols** — Tone protocol, clarity protocol, escalation protocol, pacing protocol
4. **Org Collaboration Rules** — Three layers: Human-Human (Operator ↔ Operator), Agent-Agent (cross-Operator), and Mixed collaboration
5. **Boundary & Permission Model** — Personal data boundaries, capability boundaries, context boundaries, identity separation
6. **Joint Worlds** — Worlds co-owned by multiple Operators, where agents from both sides adopt the Joint World identity

Phase 15 of the [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) explicitly defines deliverables: Operator ID tracking, Org Telos (shared identity layer), Joint Worlds, cross-Operator trust levels, shared Pattern libraries, permission roles, and parallel Session views.

The V2 notes expand further: dynamic agent negotiation between Operators, pattern-compatibility resolution, shared decision-weighting models, multi-Operator authority frameworks, and a Pattern Market for teams to publish, share, and version workflows.

### The OKR Integration Opportunity

The Org-LOOM design, combined with LOOM's existing Intent Engineering architecture, creates a natural home for **OKR-driven collaboration**. Here's why this is a strong fit:

**OKRs map directly onto LOOM's existing abstractions:**

| OKR Concept | LOOM Equivalent | How It Works |
|-------------|-----------------|--------------|
| **Objective** | Org Telos / World Purpose | An Objective becomes the telos of a Joint World — the immutable purpose that governs all activity within it |
| **Key Result** | Intent Contract / Pattern Output Criteria | Key Results become the measurable verification conditions for Intent Envelopes and Pattern completion |
| **Initiative** | Pattern Instance / Thread | Each initiative maps to a Pattern execution or a Thread within a World |
| **OKR Alignment** (top-down/bottom-up) | Org Telos → World Telos → Session Intent hierarchy | The existing L4 hierarchy naturally cascades objectives downward |
| **OKR Review Cycle** | Macro Feedback Loop / World Health Check | Already designed as weekly/monthly rituals in the Obsidian vault |
| **OKR Progress Tracking** | L2 Episodic Memory + State Layer | Session summaries, decision logs, and continuity artifacts already capture progress |

**What this looks like in practice:**

1. **CTO** creates an Org Telos: *"Ship LOOM MVP by Q3 2026"*
2. This becomes the top-level Objective, stored as an immutable L4 record
3. **Key Results** are defined as measurable conditions: *"Core user journey works end-to-end," "5 alpha users onboarded," "Context Assembly Engine passes benchmark"*
4. Each Key Result spawns a **Joint World** — a collaborative space where team members work together toward that outcome
5. Within each Joint World, **Patterns** execute the work: "Sprint Planning" pattern, "Design Review" pattern, "QA Sweep" pattern
6. **META governance** ensures every Session and Pattern execution stays aligned with the OKR hierarchy — if someone starts working on a V5 feature when the Q3 MVP objective is active, META flags the drift
7. **Weekly OKR Reviews** use LOOM's existing Feedback Loop: the system generates a structured summary of what was accomplished, what's at risk, and what needs adjustment — grounded in real L2 session data, not guesswork
8. **Quarterly OKR Cycles** trigger World lifecycle transitions: Joint Worlds for completed OKRs enter the Clean Shutdown Protocol; new OKR Worlds are birthed

**The killer feature: OKR-aware Context Assembly.** When an Operator starts a Session in an OKR-linked World, the Context Assembly Engine automatically includes:
- The parent Objective and Key Results (from Org Telos)
- Current progress against each KR (from L2 episodic summaries)
- Related decisions and blockers (from State Layer)
- Which other team members' Worlds relate to this OKR (from Cross-World Mapping)

Every AI interaction is automatically grounded in organizational purpose. The agent doesn't just help you work — it helps you work *toward the right outcomes*.

### Viability Assessment

**Technical viability: HIGH (with caveats)**

The foundational architecture supports this. The 4-layer memory model, World isolation, governance engine, and session lifecycle are the right primitives. What's needed is:

- Multi-user authentication and Operator ID tracking
- Org Telos as a new L4 record type (schema extension)
- Joint World ownership model (shared world_id with permission matrix)
- Cross-Operator context boundaries in the Context Assembly Engine
- A sync layer for multi-user state (currently SQLite is single-process)

The sync layer is the hardest part. SQLite is single-user by nature. Moving to multi-Operator requires either:
- A shared database (PostgreSQL, LibSQL/Turso for SQLite-compatible cloud)
- A sync protocol (CRDTs, or event-sourcing with merge)
- A server-based architecture (for the Org-LOOM sync layer — separate from the desktop app)

**For Org-LOOM, a dedicated sync server is needed regardless of the desktop architecture.** The Electron app keeps full local capabilities; the sync server handles multi-user state, authentication, and event merging. `packages/core` is already portable — it runs in both environments.

### Market Opportunity

**The market is large and underserved:**

AI-powered OKR tools exist ([Relevance AI](https://relevanceai.com/agent-templates-tasks/okr-objectives-and-key-results-tracking-ai-agents), [Akira.ai](https://www.akira.ai/ai-agents/okr-ai-agents), [OKRsTool](https://www.okrstool.com/blog/ai-powered-okr-tool)), but they are **tracking tools with AI bolted on** — they help you write better OKRs and visualize progress. None of them provide:

- **Governed AI agents that actually do the work** within the OKR framework
- **Structured memory** that connects OKR objectives to daily AI-assisted sessions
- **Cross-team context engineering** where agents understand the full organizational hierarchy of objectives
- **Constitutional governance** ensuring work stays aligned with objectives

Enterprise OKR software (Workpath, Lattice, 15Five) focuses on human workflow. AI coding tools (Cursor, Antigravity) focus on individual productivity. **Nobody is building governed multi-agent collaboration for teams with OKR alignment.** This is blue ocean.

**The pitch writes itself:** *"LOOM for Teams: every meeting, every brainstorm, every decision automatically aligned with your OKRs. AI agents that know your objectives and ensure nothing goes off-track."*

**Potential customer segments:**
- Startups (5-50 people) where everyone does everything and alignment is hard
- Creative agencies where projects span months and drift is the #1 failure mode
- Product teams running quarterly OKR cycles with multiple workstreams
- Consulting firms managing multiple client engagements simultaneously
- Any knowledge-work team that uses OKRs and AI tools but can't connect the two

### Major Blockers

**1. The MVP Must Come First**

Org-LOOM is a V4 feature. Building it before the single-user experience works would be a classic premature scaling mistake. The dependency chain is:

```
V1: Single-user LOOM works (World → Session → Chat → Memory)
    ↓
V2: Multi-agent + Pattern library (agents actually do structured work)
    ↓
V3: Agent marketplace + inter-world bridging (ecosystem exists)
    ↓
V4: Org-LOOM + OKR integration (teams use it)
```

Skipping steps here would produce a team tool where the individual experience doesn't work yet. That's how products die.

**2. The Sync Problem**

Multi-user collaboration requires real-time or near-real-time state synchronization. This is a fundamentally different technical challenge from single-user SQLite. Options:

| Approach | Complexity | Pros | Cons |
|----------|-----------|------|------|
| **LibSQL/Turso** (SQLite-compatible cloud) | Medium | Keeps SQLite semantics, Drizzle works | Vendor dependency, latency |
| **PostgreSQL** | Medium-High | Battle-tested, real multi-user | Breaks "local-first" mandate, requires hosting |
| **CRDT-based sync** (Automerge, Yjs) | High | True local-first, offline-capable, conflict-free | Complex to implement, memory overhead |
| **Event sourcing + server merge** | Medium | Fits L2's append-only design naturally | Requires a central server for merge |

**Recommendation:** Event sourcing is the natural fit. L2 is already append-only. Extend this pattern: every state change is an event, events sync to a central server, the server resolves ordering. This aligns with ADK's event-sourced architecture and LOOM's existing design philosophy.

**3. The Permission Complexity**

Org-LOOM's boundary model (personal data boundaries, capability boundaries, context boundaries, identity separation) is well-specified in concept. In practice, implementing fine-grained permissions that are both secure and usable is one of the hardest problems in software.

The risk: over-engineering permissions leads to a system that's correct but unusable (people can't figure out what they can share). Under-engineering leads to data leaks.

**Recommendation:** Start with three permission levels:
- **Private** — Only the Operator sees this (default for all personal Worlds)
- **Shared** — All members of a Joint World see this (explicit opt-in)
- **Org-wide** — Visible across the organization (Org Telos, shared Pattern libraries)

Don't build RBAC (role-based access control) until real users demand it.

**4. The "Translation Layer" Problem**

The Org-LOOM spec describes a cross-Operator translation layer: tone translation, communication style reconciliation, constraint harmonization. This is conceptually beautiful but technically hard to implement reliably with current LLMs.

An agent that "translates" between two Operators' communication styles risks:
- Misrepresenting one party's intent (violating Operator Supremacy)
- Smoothing over genuine disagreements (removing useful friction)
- Adding latency and cost to every interaction

**Recommendation:** Defer the translation layer. In V4, agents in Joint Worlds should adopt the Org Identity directly (already specified). Cross-Operator translation is a V5+ feature that requires significant research into safe semantic mediation.

**5. The Pricing Question**

Single-user LOOM can be free or one-time license (the Ollama model — runs locally, no ongoing cost). Org-LOOM requires infrastructure (sync server, hosting, potentially cloud LLM costs). This forces a recurring revenue model.

**Options:**
- **Freemium:** Single-user free, team features paid (standard SaaS)
- **Self-hosted enterprise:** Companies run their own LOOM server (license fee + support)
- **Hybrid:** Local LOOM is free; the sync/collaboration layer is paid

The self-hosted model aligns with LOOM's privacy philosophy ("Model Sovereignty," "Local-First"). Companies that care about data sovereignty will pay for a tool that runs on their infrastructure.

### The OKR-Aware Governance Model

Here's how the full system would work, combining Org-LOOM with OKR integration:

```
┌──────────────────────────────────────────────────┐
│                  ORG TELOS (L4)                   │
│    Mission: "Be the leading AI bakery chain"      │
│    Values: Quality, Innovation, Sustainability    │
│    Constraints: No synthetic ingredients          │
└────────────────────┬─────────────────────────────┘
                     │
        ┌────────────┴───────────────┐
        ▼                            ▼
┌───────────────────┐    ┌───────────────────────┐
│   Q1 OBJECTIVE    │    │    Q1 OBJECTIVE        │
│ "Launch 3 new     │    │ "Grow online orders    │
│  product lines"   │    │  by 40%"               │
│                   │    │                         │
│ KR1: Recipes done │    │ KR1: Website redesign   │
│ KR2: Supply chain │    │ KR2: Marketing campaign │
│ KR3: Staff trained│    │ KR3: Delivery partners  │
└───────┬───────────┘    └───────────┬─────────────┘
        │                            │
        ▼                            ▼
┌───────────────────┐    ┌───────────────────────┐
│  JOINT WORLD:     │    │  JOINT WORLD:          │
│  "New Products"   │    │  "Online Growth"       │
│                   │    │                         │
│  Operators:       │    │  Operators:             │
│  - Chef (you)     │    │  - Marketing lead       │
│  - Supplier lead  │    │  - Dev team             │
│  - QA specialist  │    │  - Ops manager          │
│                   │    │                         │
│  Agents:          │    │  Agents:                │
│  - Recipe Creator │    │  - Campaign Strategist  │
│  - Cost Analyst   │    │  - UX Researcher        │
│  - Taste Profiler │    │  - Analytics Agent      │
│                   │    │                         │
│  Patterns:        │    │  Patterns:              │
│  - Ideation Burst │    │  - Market Analysis      │
│  - Decision Lock  │    │  - A/B Test Design      │
│  - Production Run │    │  - Sprint Planning      │
│                   │    │                         │
│  META enforces:   │    │  META enforces:         │
│  - No synthetic   │    │  - Brand guidelines     │
│    ingredients    │    │  - Budget constraints    │
│  - Timeline gates │    │  - Accessibility reqs   │
└───────────────────┘    └───────────────────────┘
```

Every Session in every Joint World automatically inherits governance from the OKR hierarchy. An agent in the "New Products" World literally cannot suggest synthetic ingredients because the Org Telos forbids it, cascading down through the Objective's constraints and the World's rules. **This is constitutional governance applied to organizational alignment** — something no OKR tool or AI agent framework offers today.

### Strategic Verdict

**Is Org-LOOM with OKR integration viable?** Yes — architecturally sound, market-differentiated, and built on foundations that already exist in the design.

**Should you build it now?** No. It's V4 work. The dependency chain is real.

**Should you design for it now?** Absolutely. Every architectural decision made today should ask: "Does this make Org-LOOM harder or easier?" Specifically:
- Keeping `packages/core` portable (Part VII) makes deploying a sync server straightforward
- Operator ID tracking should be added early (even if only one Operator exists)
- The event-sourcing pattern for L2 should be designed with future sync in mind
- The permission model should use a simple interface now that can grow later

**The bottom line:** Org-LOOM is LOOM's clearest path to a business. Single-user LOOM competes with ChatGPT (hard). Org-LOOM with OKR alignment competes with nothing (blue ocean). Get the MVP right, prove the single-user value, then the enterprise play is the prize.

> **Sources:** [Relevance AI - OKR Tracking Agents](https://relevanceai.com/agent-templates-tasks/okr-objectives-and-key-results-tracking-ai-agents), [Akira.ai - OKR AI Agents](https://www.akira.ai/ai-agents/okr-ai-agents), [OKRs 2026 Guide (Reclaim)](https://reclaim.ai/blog/okr), [Workpath Enterprise OKR](https://www.workpath.com/en/magazine/best-ai-okr-kpi-business-review-software), [Atlassian OKR Guide](https://www.atlassian.com/agile/agile-at-scale/okr)

---

---

## Part X: Discrepancies — OPUS_REMARKS vs. LOOM_DEVELOPMENT_PLAN.md

This section identifies the major disagreements and gaps between the assessments in this document and the existing [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) (v1.2, 2026-01-14). These are not corrections — the Dev Plan is a legitimate engineering roadmap. These are strategic tensions that need explicit resolution before further development.

### Discrepancy 1: MVP Scope — Everything vs. Something

| | Dev Plan | OPUS Assessment |
|---|---|---|
| **MVP Definition** | Phase 0 through Phase 8 (all 9 phases) | World CRUD → Sessions → Chat → Memory → 1-3 Patterns → Markdown export |
| **Implied Timeline** | Months of work before anything ships | Weeks to a demonstrable prototype |

**The tension:** The Dev Plan's MVP includes Worlds, Agents, Patterns, Spines, Dispatching, full LLM integration, keyboard-first UI with 25+ themes, observability dashboards, streaming, and Kanban views. That's not an MVP — it's a V1 product. OPUS argues for a radically smaller first deliverable that proves the core thesis (persistent, governed AI collaboration) and nothing else. The risk of the Dev Plan approach is building for 6+ months before any user touches it. The risk of the OPUS approach is shipping something too thin to demonstrate the real value.

**Resolution needed:** Define a "Phase 0.5" that ships to internal testers in weeks, not months. The Dev Plan phases are fine as engineering milestones, but the first *usable* artifact should come much sooner.

---

### Discrepancy 2: Pattern Count — 14 vs. 1-3

| | Dev Plan | OPUS Assessment |
|---|---|---|
| **Patterns at MVP** | 14 core Patterns (5 already built) | Ship with 1-3, prove the Pattern model works |

**The tension:** The Dev Plan treats 14 Patterns as critical MVP scope (Phase 5 line: "Core 14 Patterns implementation (5/14 Complete)"). OPUS argues that the Pattern *system* is the value, not the Pattern *count*. One well-executed Brainstorm Pattern that demonstrably works with governance proves the entire architecture. 14 Patterns before shipping is a content creation burden that delays feedback.

**Resolution needed:** Separate "Pattern System works" (MVP) from "Pattern Library is comprehensive" (V1.5). Ship with Brainstorm + Decision Lock + one domain-specific Pattern. Let the rest follow based on real user demand.

---

### Discrepancy 3: Spines as MVP-Critical

| | Dev Plan | OPUS Assessment |
|---|---|---|
| **Spines priority** | Phase 6 on critical path; "80%+ cost reduction" framed as MVP prerequisite | Build basic Context Assembly first; defer Spines optimization to post-MVP |

**The tension:** The Dev Plan places Spines (compact machine-facing knowledge representations) on the critical path and even pulls a "Basic Spine Generator" prototype into Phase 2. The framing is that the system is too expensive to use without them. OPUS argues that early users won't have enough L3 knowledge to need Spines — cost optimization matters at scale, not at first contact. Premature optimization of context assembly could delay the core experience.

**Resolution needed:** Implement a naive Context Assembly (load what's relevant, stuff the prompt) for MVP. Track token costs. When real usage data shows cost pain, *then* build Spines. The Phase 2 "prototype Spine Generator" is fine as an experiment, but don't gate MVP on it.

---

### Discrepancy 4: IPC Architecture — contextBridge vs. electron-trpc

| | Dev Plan | OPUS Assessment |
|---|---|---|
| **IPC approach** | Electron contextBridge (manual handler registration) | electron-trpc (typed, auto-generated, end-to-end safe) |

**The tension:** The Dev Plan specifies contextBridge as the IPC mechanism. The existing codebase already has a `DEV_HANDOFF.md` noting IPC handler registration as a CRITICAL bug source. OPUS recommends electron-trpc to eliminate the entire category of "forgot to register a handler" bugs and get end-to-end TypeScript safety from renderer to main process.

**Resolution needed:** This is a clear win. electron-trpc is a drop-in improvement that reduces bugs and maintenance burden. Adopt it in the next infrastructure pass.

---

### Discrepancy 5: LangChain — Core Plumbing vs. Abstracted Away

| | Dev Plan | OPUS Assessment |
|---|---|---|
| **LangChain role** | "Plumbing" layer for prompting, routing, chain composition | Abstract behind an OrchestratorPort; be ready to swap |

**The tension:** The Dev Plan correctly constrains LangChain ("plumbing, not an agent runtime") but still lists it as the orchestration layer. OPUS argues that LangChain's abstraction overhead, frequent breaking changes, and opinionated patterns create a coupling risk. The Dev Plan's own constraint — "No autonomous LangChain agents, only Pattern-bound chains" — already limits its value. A thin OrchestratorPort interface that LangChain *implements today* but could be replaced tomorrow is lower-risk.

**Resolution needed:** Keep LangChain for now (it works), but wrap it behind a port interface in `packages/core`. This is an afternoon of work that buys future flexibility.

---

### Discrepancy 6: Agent System Access — Post-MVP vs. Day One

| | Dev Plan | OPUS Assessment |
|---|---|---|
| **Tool Registry** | Phase 11 (post-MVP) — governed tool access | Agent system access (shell, fs, db) is fundamental from day one |

**The tension:** The Dev Plan defers the entire Tool Registry to Phase 11, well after MVP. OPUS argues that agents without tools are just chatbots. If LOOM positions itself as a collaboration platform for *completing projects* — from recipes to full-stack apps — agents need to actually *do* things: read files, run commands, query databases, access the shell. Without tools, the governed collaboration is theoretical. The Electron architecture was preserved specifically because it enables deep system access.

**Resolution needed:** Move basic tool primitives (filesystem read/write within World scope, shell execution with approval gates, HTTP requests) into Phase 4 or 5. The full governed Tool Registry (whitelists, risk levels, sandboxing) can stay in Phase 11, but the basic capability cannot wait.

---

### Discrepancy 7: Progressive Disclosure / UX Modes — Absent vs. Critical

| | Dev Plan | OPUS Assessment |
|---|---|---|
| **UX modes** | Single UI (Phase 8 mentions "progressive disclosure" as one bullet) | Two distinct modes: Conversation Mode (beginners) vs. Studio Mode (power users) |

**The tension:** The Dev Plan includes "progressive disclosure (details hidden by default, expandable)" as a single UI/UX feature bullet in Phase 8. OPUS treats this as an architectural concern — the difference between a tool that non-technical users can approach and one that scares them away. A recipe enthusiast and a full-stack developer should not see the same UI surface. OPUS proposes Conversation Mode (looks like a chat app, hides Worlds/Patterns/Agents) and Studio Mode (full dashboard with all controls visible).

**Resolution needed:** This doesn't need to be built for MVP, but the UI architecture should be designed with mode switching in mind from Phase 8 onward. At minimum, the MVP chat interface should be usable without requiring the user to understand Worlds, Patterns, or Agents.

---

### Discrepancy 8: Context Engineering / Intent Engineering Framing — Absent vs. Strategic Positioning

| | Dev Plan | OPUS Assessment |
|---|---|---|
| **Industry framing** | Not mentioned | LOOM's memory model IS Context Engineering; Operator Supremacy IS Intent Engineering |

**The tension:** The Dev Plan is engineering-focused (correctly). It doesn't frame LOOM in terms of the industry concepts that emerged in 2025-2026. OPUS identifies this as a strategic positioning gap — not a code problem, but a messaging problem. LOOM has independently invented what the industry now calls Context Engineering and Intent Engineering, but the Dev Plan doesn't leverage this for positioning, marketing, or architectural validation.

**Resolution needed:** This is a documentation/messaging task, not a code change. Update the project README, landing page copy (when it exists), and architectural docs to explicitly map LOOM concepts to industry terminology: "4-Layer Memory Model = Context Engineering," "Operator Supremacy = Intent Engineering," "Markdown-Canonical = Specification-Based Development."

---

### Discrepancy 9: User Journey vs. Feature Phases

| | Dev Plan | OPUS Assessment |
|---|---|---|
| **Orientation** | Feature-oriented (phases deliver capabilities) | User-journey-oriented (what does the user actually *do*?) |

**The tension:** The Dev Plan reads as: "Phase 3 delivers Worlds. Phase 4 delivers Agents. Phase 5 delivers Patterns." OPUS asks: "What does the user do in their first 5 minutes?" The Dev Plan never describes a Hello World experience — a complete user flow from install to value. This gap means the phases might technically complete without producing a coherent user experience.

**Resolution needed:** Write a "Hello World" user journey document. Literally: "User opens LOOM → sees X → clicks Y → types Z → LOOM does W → user sees result." Then validate that the Phase 0-8 deliverables actually support this journey without gaps.

---

### Discrepancy 10: The "Dual Truth" Problem — Solved vs. Ongoing

| | Dev Plan | OPUS Assessment |
|---|---|---|
| **MD/DB reconciliation** | Phase 1 deliverable: File Watcher & Reconciliation Service | Identified as an ongoing architectural tension, not a one-phase fix |

**The tension:** The Dev Plan treats the Dual Truth problem (Markdown files vs. SQLite database as competing sources of truth) as a Phase 1 deliverable — build a file watcher, reconcile, done. OPUS sees this as a deeper architectural tension that will recur every time a new feature touches persistence. The "Markdown is Canonical" mandate means the DB is always derivative, but performance requires the DB for queries. This is a reconciliation *pattern* that needs to be baked into every service, not a one-time fix.

**Resolution needed:** Define a `DualTruthService` interface in `packages/core` that every persistence operation must use. Phase 1 builds the first implementation, but the interface ensures all future phases automatically handle reconciliation rather than reinventing it.

---

### Summary Table

| # | Topic | Dev Plan Says | OPUS Says | Severity |
|---|-------|--------------|-----------|----------|
| 1 | MVP Scope | 9 phases | Radically smaller | **High** — affects timeline to first user |
| 2 | Pattern Count | 14 at MVP | 1-3 at MVP | **Medium** — affects scope, not architecture |
| 3 | Spines Priority | Critical path | Post-MVP optimization | **Medium** — affects cost, not functionality |
| 4 | IPC Architecture | contextBridge | electron-trpc | **Low** — clear improvement, easy swap |
| 5 | LangChain Role | Core plumbing | Abstracted behind port | **Low** — wrap it, don't rewrite |
| 6 | Agent Tools | Phase 11 | Day one | **High** — agents without tools = chatbots |
| 7 | UX Modes | Single UI bullet | Architectural concern | **Medium** — affects non-technical adoption |
| 8 | Industry Framing | Not mentioned | Strategic positioning | **Low** — messaging, not code |
| 9 | User Journey | Feature phases | Hello World experience | **High** — user experience gap |
| 10 | Dual Truth | Phase 1 fix | Ongoing pattern | **Medium** — architectural hygiene |

### Final Note

These discrepancies don't mean the Dev Plan is wrong. It's a solid engineering roadmap with clear phases, dependencies, and exit criteria. The OPUS assessment applies a *different lens* — one focused on time-to-value, market positioning, and the gap between building features and building a product.

The ideal path forward merges both perspectives:
- **Keep the Dev Plan phases** as the engineering backbone (they're well-structured)
- **Add a "Phase 0.5"** that defines the first usable artifact (OPUS's MVP within the Dev Plan's Phase 2-3)
- **Promote tool access** from Phase 11 to Phase 4-5 (agents need tools to be useful)
- **Write the Hello World journey** to validate that features compose into an experience
- **Adopt electron-trpc and the OrchestratorPort** as low-risk infrastructure improvements

The Dev Plan tells you *what to build*. This review asks *what to ship first and why*.

---

## Part XI: DeepMind Autonomy Levels — A Unifying Framework for LOOM's Control Model

### The Framework

Google DeepMind proposed a 5-level taxonomy of human-agent interaction that defines how much control the human retains versus how much the agent acts independently:

| Level | Name | Description |
|-------|------|-------------|
| **L1** | **Operator** | User is in charge at all times. Agent performs simple tasks or requires strict, step-by-step approval. |
| **L2** | **Collaborator** | User and agent work together to plan and execute. Easy transfer of control between them. |
| **L3** | **Consultant** | Agent takes initiative in planning and executing, offering suggestions. Human provides guidance or feedback. |
| **L4** | **Approver** | Agent acts independently but pauses for human approval on consequential or high-risk actions. |
| **L5** | **Observer** | Agent is fully autonomous. All decisions and execution end-to-end without human supervision. |

This is relevant to LOOM because **LOOM already has the primitives for every level, but they're scattered across separate systems with no unified control surface.**

### What LOOM Already Has (Mapped to DeepMind Levels)

| DeepMind Level | Existing LOOM Concept | Where It Lives |
|---------------|----------------------|---------------|
| **L1 Operator** | **Operator Supremacy** — "The Operator is the sole source of intent." Anti-Agency Constraint prevents self-directed action. Bounded Initiative forbids agents from initiating new objectives. | AI_CODEX.md (Mandate #1), GLOSSARY-ok.md (Anti-Agency Constraint), 02-AGENT-SYSTEM.md |
| **L2 Collaborator** | **Primacy Protection** — question-only phase before execution. Session Intent Envelope negotiated between Operator and system. Pattern steps with explicit handoffs. | Phase 5 (Pattern System), Session Lifecycle, SIE |
| **L3 Consultant** | **Tempo System (Andante/Adagio)** — deeper reasoning, agent proposes structured options. Pattern suggestion system. Dispatcher recommends session class and agent assignments. | Tempo system (L1 variable), Dispatcher (Phase 6) |
| **L4 Approver** | **DEEP Session Class** — requires explicit Operator confirmation. Dispatch Gate (permission to execute). A0 budget enforcement (warn, deny, fallback). Evolution flow requires META authorization. | Session Classes, A0Enforcer, MetaGovernance |
| **L5 Observer** | **Not currently supported** — by design. The Anti-Agency Constraint explicitly forbids fully autonomous operation. "No emergent, implicit, or self-directed agency." | Governance framework (constitutional prohibition) |

**Key insight:** LOOM has built these capabilities *accidentally* through independent design decisions. Tempo, Session Classes, Bounded Initiative, Escalation Protocol, Dispatch Gate, and the Anti-Agency Constraint are all facets of the same underlying question: *how much autonomy does the agent have right now?* But they're not unified — an Operator can't simply say "run at Level 3" and have all systems adjust.

### What's Missing: The Autonomy Dial

LOOM needs a **single, explicit Autonomy Level setting** that acts as a master control, cascading across all existing subsystems:

```
┌─────────────────────────────────────────────────────────┐
│              AUTONOMY LEVEL (Operator-Set)                │
│                                                           │
│   L1 ──── L2 ──── L3 ──── L4 ──── L5                    │
│   ◄━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━►                    │
│   Full         Collaborative       Autonomous             │
│   Control      Partnership         (Gated)                │
│                                                           │
│   Current default: L1-L2 (Operator Supremacy)            │
│   Maximum allowed: Configurable per World                 │
└─────────────┬───────────────────────────────────────────┘
              │ Cascades to:
              ▼
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  Session Class    │  Tempo         │  Agent Initiative    │
│  ─────────────    │  ─────────     │  ────────────────    │
│  L1: Always THIN  │  L1: Allegro   │  L1: Execute only    │
│  L2: THIN/STD     │  L2: Andante   │  L2: Propose + wait  │
│  L3: STD default  │  L3: Andante   │  L3: Suggest + act   │
│  L4: Any          │  L4: Any       │  L4: Act, pause on   │
│  L5: Any          │  L5: Any       │      high-risk       │
│                   │                │  L5: Full autonomy   │
│                                                           │
│  Tool Access      │  Approval      │  Escalation          │
│  ────────────     │  ────────      │  ──────────          │
│  L1: None/Read    │  L1: Every     │  L1: Always          │
│  L2: Read + safe  │      step      │  L2: On ambiguity    │
│  L3: Most tools   │  L2: Plans     │  L3: On conflict     │
│  L4: All governed │  L3: Results   │  L4: On high-risk    │
│  L5: All          │  L4: High-risk │  L5: On failure      │
│                   │  L5: None      │      only            │
│                   │  (audit only)  │                      │
└─────────────────────────────────────────────────────────┘
```

### How This Maps to Existing LOOM Architecture

The Autonomy Level would be a **new L1 (Active Memory) variable** — session-scoped, like Tempo — that governs the behavior of all downstream systems:

| System | How It Responds to Autonomy Level |
|--------|----------------------------------|
| **Tempo** | L1-L2 defaults to Allegro (fast, Operator-driven). L3-L4 allows Andante/Adagio (deeper agent reasoning). |
| **Session Classes** | L1 restricts to THIN only. L2-L3 allow STANDARD. L4-L5 unlock DEEP without per-action approval. |
| **Bounded Initiative** | L1-L2: agent never initiates. L3: agent proposes next steps. L4-L5: agent executes and reports. |
| **Dispatch Gate** | L1-L2: always requires Operator go-ahead. L3: requires approval for new Patterns. L4: auto-dispatches, pauses on budget/risk thresholds. L5: full auto-dispatch. |
| **Tool Access** | L1: read-only tools. L2: safe tools (file read, search). L3: most tools with logging. L4: all tools with governance. L5: all tools, audit-only oversight. |
| **Escalation Protocol** | L1: escalate everything. L2: escalate ambiguity. L3: escalate conflicts. L4: escalate only high-risk. L5: escalate only on failure. |
| **A0 Enforcement** | All levels: A0 always active. The difference is *what triggers intervention*. At L1, A0 gates every action. At L5, A0 monitors passively and intervenes only on constraint violation. |
| **Agent Modes** | The `agent_modes` table (already in schema) naturally becomes the per-agent behavior profile at each level. |

### Implementation: Surprisingly Simple

The infrastructure already exists. What's needed:

1. **Add `autonomy_level` to Session state** — an L1 variable (like Tempo), values 1-5, default 1
2. **Add `max_autonomy_level` to World config** — governance ceiling per World (e.g., a Production World might cap at L2)
3. **Add `max_autonomy_level` to Org Telos** (future) — organizational ceiling
4. **Modify existing gate checks** to reference the current autonomy level:
   - `DispatchGate.shouldRequireApproval()` → checks autonomy level
   - `A0Enforcer.evaluateAction()` → adjusts threshold by level
   - Agent initiative bounds → read from autonomy level
   - Tool access permissions → gated by autonomy level
5. **UI: Add the dial** — a simple 5-position selector in the Session header, with tooltip descriptions

The key design decisions:

- **Operator can always override.** Even at L5, the Operator can intervene at any moment. The level sets the *default* behavior, not a lock.
- **Downward pressure only.** A World can cap autonomy below the Operator's preference, but never raise it above. Governance always constrains.
- **META enforces the ceiling.** If an Org Telos says "max L3," no World in that Org can go to L4-L5. Constitutional governance cascades.
- **L5 is opt-in and scary.** The UI should require explicit acknowledgment: "You are enabling fully autonomous operation. The agent will make decisions without asking. Are you sure?" This aligns with LOOM's Silence-by-Default philosophy.
- **Audit trail at every level.** Even at L5, every action is logged. The difference is whether the Operator sees it in real-time (L1-L3) or reviews it after (L4-L5).

### The Anti-Agency Constraint Revisited

LOOM's current philosophical position is that **L5 should not exist**. The Anti-Agency Constraint explicitly states: "No emergent, implicit, or self-directed agency."

The DeepMind framework challenges this position — or rather, refines it. There's a difference between:

- **Uncontrolled autonomy** (agent decides on its own, no governance) — this is what the Anti-Agency Constraint correctly prohibits
- **Delegated autonomy** (Operator consciously chooses to let the agent run, with governance still active, and can revoke at any time) — this is what L4-L5 represent

The distinction matters. A chef who says "make the sauce while I prep the main course" is *delegating*, not *abdicating*. The chef can taste the sauce at any time, give feedback, or take over. The agent at L5 isn't *ungoverned* — it's *trusted within the governance framework*.

**Recommendation:** Reframe the Anti-Agency Constraint as "No *ungoverned* agency." Governed autonomy — where the Operator explicitly chooses the level, META enforces the ceiling, A0 monitors continuously, and the Operator can revoke at any moment — is not a violation of Operator Supremacy. It's an extension of it. The Operator who chooses L5 is exercising supremacy by choosing to delegate.

This is philosophically consistent with the existing framework:
- **Operator Supremacy is preserved** — the Operator *chose* the level
- **META governance is active** — ceilings, constraints, and rules still apply
- **A0 enforcement never sleeps** — it just shifts from "gate every action" to "monitor and intervene on violation"
- **The Operator can always pull the level back** — delegation is revocable

### Where This Fits in the Roadmap

| When | What |
|------|------|
| **MVP (now)** | Default to L1-L2. Don't build the dial yet. All existing behavior is correct for these levels. |
| **V1.5** | Add `autonomy_level` to Session state and `max_autonomy_level` to World config. Expose L1-L3 in the UI. |
| **V2** | Enable L4 (Approver mode). This requires robust tool governance (Phase 11) and the audit trail (Phase 12). |
| **V3+** | Enable L5 (Observer mode) with full safeguards. This requires mature governance, proven A0 enforcement, and user trust earned through L1-L4 experience. |
| **Org-LOOM** | Org Telos sets max autonomy level for the organization. Different teams/Worlds can operate at different levels within that ceiling. |

### Strategic Value

Adopting the DeepMind Autonomy Levels gives LOOM:

1. **A unified control model** — instead of explaining Tempo + Session Classes + Bounded Initiative + Escalation separately, users understand one concept: "How much do I want the agent to do on its own?"
2. **A progression path** — new users start at L1, gain trust, move to L2-L3. Power users reach L4-L5. This is progressive disclosure applied to *trust*, not just UI.
3. **Industry alignment** — as the DeepMind framework becomes standard vocabulary (2026+), LOOM speaks the same language
4. **A differentiator** — other tools are either L1-only (manual copilots) or L5-only (autonomous agents with no governance). LOOM offers the full spectrum with constitutional governance at every level. That's the unique position.
5. **Natural Org-LOOM integration** — teams set autonomy ceilings by role, project, or organizational policy. A junior engineer might operate at L2 max; a senior architect at L4. This is governance-driven autonomy management.

> **Source:** [Google DeepMind — Levels of AGI and Human-AI Interaction](https://deepmind.google/research/) (2024-2025 framework, widely adopted in 2026 AI safety and governance discourse)

---

## Closing Remarks

LOOM Engine is conceptually ahead of its time. The 4-layer memory model, constitutional governance, operator supremacy, and world isolation are exactly the patterns the industry is now converging on under names like "Context Engineering," "Intent Engineering," and "Spec-Based Development."

But concepts don't ship. Code does.

The gap between the Obsidian vault's beautiful philosophy and the working software is the gap that matters. The vault describes a V5 system. The codebase is pre-V1. The strategic imperative is to ruthlessly prioritize the path from here to an MVP that demonstrates the core value: **persistent, governed AI collaboration that remembers everything and never goes off-script.**

Everything else — agent evolution, OGK, threading, feedback rituals, dosage control — is real and valuable. But it's V2, V3, V4 work. Ship the simple thing first. Let real users tell you which of those concepts matter most.

The tool that matters is the one that exists.

---

*End of review.*
