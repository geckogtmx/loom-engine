# Phase 0.5 — MVP Sprint: Hello World Journey

**Parent:** [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) v2.0, Phase 0.5
**Goal:** Deliver the smallest LOOM that demonstrates persistent, governed AI collaboration.
**Exit Criteria:** A user can create a project, chat across multiple sessions with persistent memory, and export results as markdown.

---

## Prerequisites

- Phase 0 (Foundation) is complete — monorepo, Electron shell, SQLite, WebSocket, React scaffolding all exist
- Current blocker: IPC handler registration crash prevents UI ↔ backend communication

---

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 0.5-01 | Fix IPC handler registration crash | 2h | — | TODO |
| 0.5-02 | Migrate IPC to electron-trpc | 4h | 0.5-01 | TODO |
| 0.5-03 | Wire World CRUD end-to-end | 3h | 0.5-02 | TODO |
| 0.5-04 | Wire Session lifecycle end-to-end | 4h | 0.5-02 | TODO |
| 0.5-05 | Implement basic Context Assembly | 4h | — | TODO |
| 0.5-06 | Implement L2 session summaries | 3h | 0.5-05 | TODO |
| 0.5-07 | Wire LLM chat through Dispatcher | 3h | 0.5-04, 0.5-05 | TODO |
| 0.5-08 | Build "Create First Project" onboarding | 2h | 0.5-03 | TODO |
| 0.5-09 | Build Session Runner with streaming | 4h | 0.5-04, 0.5-07 | TODO |
| 0.5-10 | Implement session resume with recap | 3h | 0.5-06 | TODO |
| 0.5-11 | Implement markdown export | 2h | 0.5-03, 0.5-06 | TODO |
| 0.5-12 | Hello World integration test | 2h | ALL | TODO |

**Total estimated effort:** ~36 hours

---

## Task Details

### 0.5-01: Fix IPC Handler Registration Crash

**Priority:** P0 — BLOCKER
**Assignee:** Any
**Files:**
- `apps/electron/src/main.ts` — handler registration call site
- `apps/electron/src/ipc/worldHandlers.ts` — `registerWorldHandlers()` (line ~25-35)
- `apps/electron/src/ipc/sessionHandlers.ts` — `registerSessionHandlers()`

**Problem:** `registerWorldHandlers()` throws during Electron startup, causing all IPC to fail. `world:create` returns "No handler registered" in the renderer.

**Likely root causes (investigate in order):**
1. `createDb(dbPath)` fails (bad path or missing directory)
2. Repository constructors throw (DrizzleWorldRepository, DrizzleWorldTelosRepository, DrizzleWorldConfigRepository)
3. Async initialization not properly awaited
4. Exception swallowed — no error logging in the registration function

**Acceptance Criteria:**
- [ ] `registerWorldHandlers(db)` completes without throwing
- [ ] `registerSessionHandlers(db)` completes without throwing
- [ ] `window.api.world.list()` returns an array from the renderer
- [ ] `window.api.world.create({...})` creates a world and returns it
- [ ] Error logging added: if registration fails, the error is logged with full stack trace

**Tests:**
- Manual: Open Electron DevTools console → `window.api.world.list()` → should return `[]`
- Manual: `window.api.world.create({ name: 'Test', purpose: 'Testing' })` → should return world object

---

### 0.5-02: Migrate IPC to electron-trpc

**Priority:** P0
**Assignee:** Any
**Files to create:**
- `apps/electron/src/trpc/router.ts` — tRPC router definition
- `apps/electron/src/trpc/context.ts` — request context (db, services)
- `apps/electron/src/trpc/worldRouter.ts` — world procedures
- `apps/electron/src/trpc/sessionRouter.ts` — session procedures
- `apps/web/src/lib/trpc.ts` — tRPC client setup

**Files to modify:**
- `apps/electron/src/main.ts` — replace manual IPC registration with trpc router
- `apps/electron/src/preload.ts` — update exposed API surface
- `apps/web/src/store/useWorldStore.ts` — use trpc client instead of `window.api`
- `apps/electron/package.json` — add `electron-trpc` dependency
- `apps/web/package.json` — add `@trpc/client`, `@trpc/react-query` dependencies

**Files to remove/deprecate:**
- `apps/electron/src/ipc/channels.ts` — replaced by trpc router
- `apps/electron/src/ipc/worldHandlers.ts` — replaced by `worldRouter.ts`
- `apps/electron/src/ipc/sessionHandlers.ts` — replaced by `sessionRouter.ts`

**Scope:**
1. Install `electron-trpc`, `@trpc/server`, `@trpc/client`
2. Create a tRPC router with `worldRouter` and `sessionRouter` sub-routers
3. Each procedure uses Zod schemas (reuse existing from `packages/core/src/ipc/schemas/`)
4. Wire the router into Electron main process via `createIPCHandler`
5. Create tRPC client in the renderer via `createTRPCProxyClient`
6. Update stores to call trpc methods
7. Remove old manual IPC handler files

**Acceptance Criteria:**
- [ ] `electron-trpc` installed and configured
- [ ] tRPC router serves world CRUD + session CRUD procedures
- [ ] Renderer calls via typed trpc client (no more `window.api` strings)
- [ ] All existing IPC functionality preserved (create, list, get, update, delete worlds; create, list sessions)
- [ ] Type safety: changing a procedure input schema causes a TypeScript error in the renderer
- [ ] Old manual IPC handler files removed or deprecated

**Tests:**
- Existing IPC-related tests updated to use trpc
- Smoke test: app starts, worlds can be created/listed via UI

---

### 0.5-03: Wire World CRUD End-to-End

**Priority:** P1
**Assignee:** Any
**Depends on:** 0.5-02
**Files:**
- `apps/web/src/store/useWorldStore.ts` — connect to trpc
- `apps/web/src/components/views/WorldsDashboard.tsx` — list worlds, create button
- `apps/web/src/components/views/CreateWorldModal.tsx` — wire form submission
- `packages/core/src/world/WorldService.ts` — verify CRUD operations

**Scope:**
1. `useWorldStore.fetchWorlds()` calls trpc `world.list` → populates store
2. "Create World" button opens modal
3. Modal form submits → trpc `world.create` → refreshes list
4. Click world card → `selectWorld()` → navigates to World cockpit or sessions
5. Delete world → trpc `world.delete` → removes from list with confirmation

**Acceptance Criteria:**
- [ ] WorldsDashboard shows real worlds from the database (not mock data)
- [ ] "Create World" modal opens, submits, and new world appears in list
- [ ] Clicking a world card selects it and shows its sessions
- [ ] Delete world works with a confirmation dialog
- [ ] Loading states shown during async operations
- [ ] Error states displayed when operations fail

**Tests:**
- Unit: `useWorldStore` methods return correct state after trpc calls (mock trpc)
- E2E: Create world → appears in list → delete → disappears

---

### 0.5-04: Wire Session Lifecycle End-to-End

**Priority:** P1
**Assignee:** Any
**Depends on:** 0.5-02
**Files:**
- `packages/core/src/session/SessionService.ts` — add `load()` static method for hydration
- `apps/electron/src/trpc/sessionRouter.ts` — session procedures
- `apps/web/src/store/useSessionStore.ts` — create or update store
- `apps/web/src/components/views/SessionsView.tsx` — list sessions for active world

**Scope:**
1. Fix session hydration: add `SessionService.load(id, worldId, repos)` static factory
2. Session create → trpc `session.create` → returns session with ID
3. Session list → trpc `session.list` → shows all sessions for current world
4. Session resume → trpc `session.load` → reconstructs SessionService from DB state
5. Session end → trpc `session.end` → writes L2 summary, flushes L1

**Acceptance Criteria:**
- [ ] Can create a new session within a world
- [ ] Can list all sessions for a world (showing status: active, closed)
- [ ] Can resume a closed session (loads previous state)
- [ ] Session state machine transitions work: PENDING → ACTIVE → CLOSED
- [ ] Closing a session persists summary to L2

**Tests:**
- Unit: SessionService.load() reconstructs valid state from DB
- Unit: State machine rejects invalid transitions (e.g., CLOSED → ACTIVE)
- Integration: Create session → chat → close → list shows as closed → resume shows recap

---

### 0.5-05: Implement Basic Context Assembly

**Priority:** P1
**Assignee:** Any (can work in parallel with 0.5-01 through 0.5-04)
**Files:**
- `packages/core/src/dispatcher/ContextAssembler.ts` — enhance existing skeleton
- `packages/core/src/memory/layers.ts` — wire L2/L3/L4 to DB repositories

**Scope:**
This is the "naive load-what's-relevant, stuff-the-prompt" approach for MVP (not the full Spines optimization from Phase 6).

1. When an LLM call is made, assemble context from all layers:
   - **L4 (Telos):** Load world_telos.content as system prompt prefix
   - **L3 (Knowledge):** Load world_config constraints + relevant pattern definitions
   - **L2 (Episodic):** Load last N session summaries (configurable, default 3)
   - **L1 (Active):** Include current session conversation history
2. Simple token budget: estimate total tokens, truncate L2 history if over budget
3. Assemble into a structured system prompt + conversation messages

**Acceptance Criteria:**
- [ ] `ContextAssembler.assemble(worldId, sessionId)` returns `{ systemPrompt: string, messages: Message[] }`
- [ ] System prompt includes L4 telos content
- [ ] System prompt includes relevant L3 constraints
- [ ] Messages include L2 session recap (last 3 sessions)
- [ ] Messages include L1 current conversation
- [ ] Token estimation works (rough count, not exact)
- [ ] If total exceeds model context window, L2 history is truncated (oldest first)

**Tests:**
- Unit: ContextAssembler returns well-formed output with mock layer data
- Unit: Token budget truncation removes oldest L2 entries first
- Unit: Empty layers produce valid (minimal) context

---

### 0.5-06: Implement L2 Session Summaries

**Priority:** P1
**Assignee:** Any
**Depends on:** 0.5-05
**Files:**
- `packages/core/src/session/SessionService.ts` — add summary generation on close
- `packages/core/src/memory/layers.ts` — L2EpisodicLayer persistence
- `packages/db/src/schema/memory.ts` — verify session_summaries table

**Scope:**
1. When a session closes, generate a structured summary:
   - Key decisions made
   - Topics discussed
   - Open questions / next steps
   - SIE reference (what was the original intent)
2. Store summary in L2 (session_summaries table)
3. On next session start, load last N summaries as context (feeds 0.5-05)

**Format (Continuity Artifact):**
```markdown
## Session Summary — {date}
**Intent:** {SIE goal}
**Decisions:** {bulleted list}
**Key Topics:** {bulleted list}
**Open Questions:** {bulleted list}
**Next Steps:** {bulleted list}
```

**Acceptance Criteria:**
- [ ] Closing a session generates a structured summary
- [ ] Summary is stored in the database (L2 table)
- [ ] Summary includes decisions, topics, open questions, next steps
- [ ] Next session's context assembly includes previous summaries
- [ ] Summary generation uses the LLM (not hand-coded extraction)

**Tests:**
- Unit: Summary generator produces valid markdown from conversation history
- Integration: Close session → summary stored → new session loads it

---

### 0.5-07: Wire LLM Chat Through Dispatcher

**Priority:** P1
**Assignee:** Any
**Depends on:** 0.5-04, 0.5-05
**Files:**
- `apps/electron/src/trpc/sessionRouter.ts` — add `session.chat` procedure
- `packages/core/src/dispatcher/Dispatcher.ts` — enhance for chat flow
- `packages/core/src/llm/ProviderFactory.ts` — verify provider selection works

**Scope:**
1. Add `session.chat` trpc procedure: accepts `{ sessionId, message }`, returns streamed response
2. Chat flow: User message → ContextAssembler → Dispatcher → ProviderFactory → LLM → Response
3. Dispatcher selects model based on session class (THIN → Ollama, STANDARD → configurable)
4. Stream response back to renderer via WebSocket (or trpc subscription)
5. Append user message + assistant response to L1 conversation history

**Acceptance Criteria:**
- [ ] User types a message → message sent to backend → LLM responds
- [ ] Response streams back to UI (not all-at-once)
- [ ] Context includes L4 telos + L2 history + L1 conversation
- [ ] Model selection respects session class / world config
- [ ] Conversation history tracked in L1 for the session duration
- [ ] Works with Ollama (local) when available
- [ ] Falls back to cloud provider when Ollama unavailable and API key configured

**Tests:**
- Integration: Send chat message → receive response → verify context included telos
- Mock: ProviderFactory returns correct provider for THIN vs STANDARD sessions

---

### 0.5-08: Build "Create First Project" Onboarding

**Priority:** P2
**Assignee:** Any (frontend)
**Depends on:** 0.5-03
**Files:**
- `apps/web/src/components/views/WorldsDashboard.tsx` — empty state
- `apps/web/src/components/onboarding/FirstProjectPrompt.tsx` — new component

**Scope:**
1. When no worlds exist, show a welcoming empty state instead of an empty list
2. Prompt: "Create your first project" with a text input for purpose
3. On submit: create world with auto-generated name (derived from purpose), navigate to session view
4. Auto-create first session in the new world

**Acceptance Criteria:**
- [ ] Fresh install shows "Create your first project" prompt (not empty list)
- [ ] User types a project purpose → world created → first session started
- [ ] User lands in the chat/session view ready to type
- [ ] World name auto-derived from purpose (e.g., "Marketing strategy for my coffee shop" → "Coffee Shop Marketing")

**Tests:**
- Component: FirstProjectPrompt renders when `worlds.length === 0`
- E2E: Fresh app → type purpose → end up in session view

---

### 0.5-09: Build Session Runner with Streaming

**Priority:** P1
**Assignee:** Any (frontend)
**Depends on:** 0.5-04, 0.5-07
**Files:**
- `apps/web/src/components/views/SessionRunner.tsx` — overhaul existing scaffold
- `apps/web/src/hooks/useSession.ts` — WebSocket streaming hook
- `apps/web/src/store/useSessionStore.ts` — chat messages state

**Scope:**
1. Chat interface: message list + input box + send button
2. User types message → calls `session.chat` → response streams in
3. Messages rendered with markdown support (user messages + assistant responses)
4. Streaming indicator while response is generating
5. Session header shows: world name, session status, model in use
6. "End Session" button → closes session, triggers summary generation

**Acceptance Criteria:**
- [ ] Chat input sends messages to backend
- [ ] Responses stream in token-by-token (not all at once)
- [ ] Markdown rendered properly in assistant messages
- [ ] Loading/streaming indicator visible during generation
- [ ] "End Session" button works and navigates back to session list
- [ ] Session header shows current world + model info

**Tests:**
- Component: SessionRunner renders messages from store
- Component: Send button calls chat procedure with correct sessionId
- E2E: Type message → see streaming response → end session

---

### 0.5-10: Implement Session Resume with Recap

**Priority:** P2
**Assignee:** Any
**Depends on:** 0.5-06
**Files:**
- `apps/web/src/components/views/SessionsView.tsx` — "Resume" button on closed sessions
- `packages/core/src/session/SessionService.ts` — recap generation
- `apps/web/src/components/views/SessionRunner.tsx` — show recap at session start

**Scope:**
1. When opening a new session in a world that has previous sessions:
   - Load last session summary from L2
   - Display as a "recap" card at the top of the session
   - Format: "Last time, you worked on X. You decided Y. Open questions: Z."
2. "Resume" on a closed session: create new session, pre-load recap from that session's summary

**Acceptance Criteria:**
- [ ] New session shows recap from last session at the top
- [ ] Recap includes: decisions, topics, open questions, next steps
- [ ] "Resume" on a closed session loads its summary as context
- [ ] Recap is visually distinct from chat messages (card/banner style)

**Tests:**
- Unit: Recap generation produces readable summary from L2 data
- E2E: Close session → start new session → recap card visible

---

### 0.5-11: Implement Markdown Export

**Priority:** P2
**Assignee:** Any
**Depends on:** 0.5-03, 0.5-06
**Files:**
- `apps/electron/src/trpc/worldRouter.ts` — add `world.export` procedure
- `packages/core/src/world/WorldExporter.ts` — new service
- `apps/web/src/components/views/WorldsDashboard.tsx` — "Export" action on world card

**Scope:**
1. Export a world as a structured markdown directory:
   ```
   {world-name}/
   ├── README.md          (world purpose, telos, creation date)
   ├── sessions/
   │   ├── 001-{date}.md  (session summary + full conversation)
   │   ├── 002-{date}.md
   │   └── ...
   └── knowledge/         (any L3 artifacts)
   ```
2. Trigger via "Export" button on world card → Electron save dialog → writes to chosen directory
3. Uses `dialog.showOpenDialog` for directory selection

**Acceptance Criteria:**
- [ ] "Export" button appears on world cards
- [ ] Clicking export opens a directory picker
- [ ] World exported as structured markdown directory
- [ ] README.md contains world purpose and metadata
- [ ] Each session gets its own markdown file with summary + conversation
- [ ] Export works for worlds with 0 sessions (just README.md)

**Tests:**
- Unit: WorldExporter produces correct markdown structure from mock data
- Integration: Create world → add sessions → export → verify file contents

---

### 0.5-12: Hello World Integration Test

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL above
**Files:**
- `apps/electron/e2e/helloWorld.test.ts` — new E2E test (Playwright)

**Scope:**
End-to-end test that validates the complete Hello World user journey:

1. App launches with no worlds
2. "Create your first project" prompt is visible
3. User types "Marketing strategy for my coffee shop"
4. World is created, session starts
5. User sends "What should my first marketing priority be?"
6. AI responds (verify response is non-empty)
7. User ends session
8. User starts a new session in the same world
9. Recap card is visible with summary from previous session
10. User exports the world as markdown
11. Verify exported files exist and contain expected content

**Acceptance Criteria:**
- [ ] Test passes end-to-end without manual intervention
- [ ] Each step has explicit assertions
- [ ] Test cleans up after itself (removes test data)

**Tests:**
- This IS the test. It validates the entire Phase 0.5 delivery.

---

## Parallel Execution Guide

Tasks that can be worked on simultaneously by different agents:

```
Track A (Infrastructure):  0.5-01 → 0.5-02 → 0.5-03
Track B (Core Engine):     0.5-05 → 0.5-06 → 0.5-10
Track C (Frontend):        0.5-08 (after 0.5-03), 0.5-09 (after 0.5-04 + 0.5-07)

Convergence:               0.5-07 (needs 0.5-04 + 0.5-05)
                           0.5-11 (needs 0.5-03 + 0.5-06)
Final:                     0.5-12 (needs ALL)
```

**Maximum parallelism:** 2 agents (Track A + Track B), converging at 0.5-07.
