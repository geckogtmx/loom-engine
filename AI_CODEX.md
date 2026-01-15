# AI_CODEX.md — The Single Source of Truth

> **Scope:** Canonical Reference for ALL AI Models (Gemini, Claude, etc.) working on LOOM.
> **Status:** Constitution. Overrides individual model preferences.

---

## 1. Core Mandates (The Physics of LOOM)

1.  **Operator Supremacy:** The User (Operator) is the sole source of intent. We never infer intent, we ask. We never drift.
2.  **Silence by Default:** Nothing auto-starts. Nothing auto-persists. Every write to memory (L2/L3/L4) requires explicit logic or approval.
3.  **World Isolation:** Data never bleeds between Worlds. `SELECT * FROM ... WHERE world_id = ?` is mandatory.
4.  **Markdown is Canonical:** The SQLite database is an accelerator. The "real" data lives in Markdown files. If they disagree, Markdown wins.
5.  **Model Agnostic & Local-Ready:** The architecture is neutral. We default to Local Models for base functionality to ensure privacy and speed, but the system is designed to act as a harness for *any* model. Cloud usage is an explicit Operator choice, not a dependency.

## 2. Architecture & Stack

*   **Runtime:** Electron 33+ (Main/Renderer/Preload separation).
*   **UI:** React 18, TypeScript, Tailwind 4, shadcn/ui.
*   **State:** Zustand (Client), SQLite + Drizzle (Persistence).
*   **AI Orchestration:** LangChain (Plumbing only), **NO** autonomous agents.
*   **Memory Model:**
    *   **L4 (Telos):** Read-Only Identity.
    *   **L3 (Knowledge):** World/Pattern/Agent definitions.
    *   **L2 (Episodic):** Append-only session logs.
    *   **L1 (Active):** In-memory RAM, flushed on session close.

## 3. The "Handoff" Protocol

We operate in a Multi-Model environment. You do not share context with the next model.

1.  **Read First:** Always check `DEV_HANDOFF.md` at the start of your turn to see what the previous model did.
2.  **Write Last:** Before you exit, you **MUST** update `DEV_HANDOFF.md` with:
    *   What you finished.
    *   What is broken/pending.
    *   The specific instruction for the next model.

## 4. Coding Standards

*   **Language:** TypeScript (Strict).
*   **Style:** Functional over Class-based (except for Core Services).
*   **Naming:** `PascalCase` for Components/Classes, `camelCase` for functions/vars, `snake_case` for DB columns.
*   **Testing:** Vitest for Logic, Playwright for E2E. **See `TESTING.md` for full QA guide.**
*   **Skills:** We utilize local skills in `.agent/skills/` (e.g., `security-officer`, `backend-testing`, `frontend-design`) to enforce constitutional mandates.
*   **Security:** All code must comply with `SECURITY.md` (Electron hardening, IPC validation, secrets handling).
*   **Error Handling:** Never swallow errors. Fail loudly or degrade gracefully to "Offline Mode".

## 4.1 QA Mandate

> **All new features MUST include unit tests. All PRs MUST pass the test suite.**

*   Run tests: `cd packages/core && npx vitest run`
*   New tests go in `<feature>.test.ts` adjacent to the source file.
*   Cover: happy path, edge cases, error conditions.
*   See `TESTING.md` for conventions and templates.

## 5. File Structure Strategy

*   `knowledge/`: The Obsidian Vault (Specs & Documentation).
*   `apps/web`: The React Frontend.
*   `apps/electron`: The Main Process.
*   `packages/core`: Shared business logic, Types, Governance Engine.
*   `packages/db`: Drizzle schema and migrations.

---
**END OF CODEX**
