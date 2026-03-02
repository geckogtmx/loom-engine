# LOOM Engine

A local-first desktop app for structured AI collaboration with persistent memory.

> **Status:** Pre-Alpha (Phase 0.5 — MVP Sprint)

---

## What is LOOM?

LOOM Engine is a cognitive architecture implemented as a desktop application. It enables structured AI collaboration across long time horizons without losing context or control.

Unlike typical chatbots that forget everything between conversations, LOOM remembers what you discussed, keeps your projects separate, and runs AI models locally on your machine by default — with optional cloud API access when you need more power.

Built with Electron and React. Runs on Windows, macOS, and Linux.

---

## Key Features

- **Persistent memory across sessions** — Pick up where you left off, even days later. The AI remembers your previous conversations and decisions.
- **Isolated projects** — Each project ("World") keeps its own data, context, and history separate. Managed cross-referencing is planned for future versions.
- **Local-first AI** — Runs [Ollama](https://ollama.com) models on your machine by default. No internet required for core functionality.
- **Model-agnostic** — Not locked to any AI provider. Switch between local (Ollama) and cloud (OpenAI, Anthropic, others) per session. The orchestration layer is abstracted so new providers can be added without changing application code.
- **Structured workflows** — Guided multi-step collaboration patterns (e.g., Research & Synthesis, Structured Discussion, Production Pipeline) instead of freeform chat.
- **Markdown is the source of truth** — All your data is stored as readable markdown files. The SQLite database is a fast cache that can be rebuilt from markdown at any time.
- **Themeable UI** — 6 built-in themes (Dracula, Nord, Catppuccin, Tokyo Night, Loom Dark, Antigravity) with more planned.
- **Built-in permission system** — A governance engine controls what gets written where, ensuring data integrity across sessions and projects.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Desktop Shell | Electron 33+ | Cross-platform, Node.js access |
| Frontend | React 18 + TypeScript | Tailwind CSS 4, shadcn/ui, Radix UI |
| State Management | Zustand | Lightweight, persistent |
| Database | SQLite + Drizzle ORM | Local, portable, no server needed |
| AI (Local) | Ollama | Default provider, privacy-first |
| AI (Cloud) | OpenAI, Anthropic | Opt-in, per-session selection |
| AI Orchestration | LangChain (abstracted) | Behind an `OrchestratorPort` interface for swappability |
| Streaming | WebSocket | Real-time AI response streaming |
| Testing | Vitest + Playwright | Unit + E2E |
| Monorepo | pnpm workspaces + Turborepo | 4 packages |

---

## Project Structure

```
loom-engine/
├── apps/
│   ├── electron/          # Desktop shell (Electron main process, IPC, WebSocket)
│   └── web/               # React UI (renderer process, themes, components)
├── packages/
│   ├── core/              # Business logic, governance, session management, LLM integration
│   └── db/                # Drizzle ORM schema, SQLite migrations
├── knowledge/             # Architecture docs, concept specifications
└── PHASE_*.md             # Task breakdowns for each development phase
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+
- **Ollama** (optional, for local AI) — [Install Ollama](https://ollama.com)

### Installation

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev
```

This launches the Electron app with hot-reload enabled for the React frontend.

> **Note:** The project is pre-alpha. Expect rough edges and breaking changes.

---

## Current Status

### Phase 0 (Foundation) — Complete

- Monorepo scaffolding with pnpm workspaces
- Electron + Vite + React setup
- SQLite database with 15+ tables and 3 applied migrations
- Session state machine with checkpoint and recovery support
- Pattern registry and lifecycle engine
- LLM provider abstraction (Ollama, OpenAI, Anthropic)
- 9 agent definitions in markdown
- 6-theme system with CSS variable architecture
- UI shell (layout, sidebar, status footer, navigation)
- Governance engine scaffolding
- WebSocket server for streaming
- 60 tests passing (Vitest)

### Phase 0.5 (MVP Sprint) — In Progress

Working toward the first end-to-end user journey:

1. Create a new project
2. Start a chat session with AI
3. Close the session — AI generates a structured summary
4. Come back later, start a new session — the AI remembers what happened
5. Export everything as markdown

See [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) for the full 16-phase roadmap.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Development Plan](LOOM_DEVELOPMENT_PLAN.md) | Full 16-phase roadmap (v2.0) |
| [Technical Standards](AI_CODEX.md) | Coding standards, architecture mandates, multi-model workflow |
| [Testing Guide](TESTING.md) | QA conventions, coverage thresholds, test templates |
| [Security Guidelines](SECURITY.md) | Electron hardening, IPC validation, secrets handling |
| [Architecture Docs](knowledge/) | Detailed concept specs, memory model, governance framework |
| [Phase Task Breakdowns](PHASE_0.5_TASKS.md) | Granular task lists for each development phase |

---

## License

Open source (specific license TBD).
