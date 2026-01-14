# LOOM Engine

> **Status:** Phase 0 (Foundation)
> **Version:** 1.0.0 (Pre-Alpha)

**LOOM Engine** is an **Operator-first cognitive architecture** implemented as a desktop application. It enables structured, governed AI collaboration across long time horizons without losing context, identity, or control.

Unlike typical "Chat with AI" apps, LOOM is a **thinking environment** that enforces:
*   **Operator Supremacy:** All systems serve your intent.
*   **World Isolation:** Projects never bleed data.
*   **Long-Term Continuity:** 4-Layer Memory Model (Active, Episodic, Knowledge, Identity).

---

## Core Philosophy

1.  **Operator Supremacy:** The User (Operator) is the sole source of intent. We never infer intent; we ask.
2.  **Silence by Default:** Nothing auto-starts. Nothing auto-persists. Every action requires explicit logic or approval.
3.  **Model Sovereignty:** The system is strictly model-agnostic. It defaults to **Local Models** (Ollama) for privacy and zero-latency fluidity, while seamlessly integrating **Cloud APIs** (OpenAI, Anthropic) as high-power intelligence layers for complex reasoning. You choose the brain for the task.
4.  **Markdown is Canonical:** The SQLite database is an accelerator. The "real" data lives in Markdown files.
5.  **Governance:** No component bypasses the META rules engine.

---

## Technical Stack

The LOOM Engine is built as a **Local-First Desktop Application**:

*   **Runtime:** Electron 33+ (Main/Renderer/Preload separation)
*   **UI:** React 18, TypeScript, Tailwind CSS 4, shadcn/ui
*   **State:** Zustand (Client), SQLite + Drizzle (Persistence)
*   **AI:** Model-Agnostic (Ollama Primary, Cloud Opt-in), LangChain (Orchestration only)
*   **Package Manager:** pnpm (Monorepo)

---

## Architecture Overview

LOOM operates on a **4-Layer Memory Model**:

*   **L4 (Telos):** Read-Only Identity & Core Mandates.
*   **L3 (Knowledge):** World/Pattern/Agent definitions (The "Vault").
*   **L2 (Episodic):** Append-only session logs and summaries.
*   **L1 (Active):** In-memory RAM, flushed on session close.

For deep architectural details, see the `knowledge/` directory.

---

## Development

### Prerequisites
*   Node.js 20+
*   pnpm 9+
*   Ollama (for local model support)

### Getting Started
*Note: The project is currently in scaffolding phase.*

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

---

## Documentation

*   **`AI_CODEX.md`**: The Constitution & Technical Standards.
*   **`LOOM_DEVELOPMENT_PLAN.md`**: The Master Roadmap.
*   **`knowledge/`**: The detailed concept and architectural documentation.