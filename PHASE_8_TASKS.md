# Phase 8 — Operator UI & Observability

**Parent:** [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) v2.0, Phase 8
**Goal:** Build keyboard-first, themeable UI with real-time streaming and observability. Full Operator workflow possible through the UI.
**Depends on:** Phase 7 (LLM streaming, WebSocket), Phase 3 (Worlds CRUD), Phase 5 (Patterns)
**Exit Criteria:** Operator can manage Worlds, configure Sessions, execute Patterns with real-time streaming output, inspect Memory layers, and monitor system metrics — all through a keyboard-first UI with observability dashboard.

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Theme system (25+ themes) | COMPLETE | 6 themes registered in `ThemeStore.ts`, CSS variable injection via `ThemeProvider` |
| Navigation shell (`MainLayout`) | COMPLETE | `Sidebar`, `StatusFooter`, view routing via `useUIStore` |
| `WorldsDashboard` view | SCAFFOLDED | Renders world cards from store, no Kanban/drag-drop, no real CRUD wiring |
| `EngineManager` view | SCAFFOLDED | Static metric cards, placeholder governance console |
| `SessionsView` | SCAFFOLDED | Lists sessions, create button, basic state display |
| `SessionRunner` (chat) | SCAFFOLDED | Mock messages, simulated AI responses, no WebSocket integration |
| `PrimacyView` (intent setting) | SCAFFOLDED | Goal/audience/constraints form, calls IPC `setIntent`/`start` |
| `WorldSelector` sidebar | COMPLETE | Lists worlds, select/delete, `CreateWorldModal` |
| `useKeyboardShortcuts` hook | SCAFFOLDED | Framework exists, only 2 shortcuts (K, D) logging to console |
| `useSession` WebSocket hook | SCAFFOLDED | Connection/auth/message scaffolding, mock auth |
| World Cockpit view | MISSING | No dedicated world detail/config view |
| Session Wizard | MISSING | No pattern selection, model selection, session class picker |
| Memory Inspector | MISSING | No L2/L3/L4 browser |
| Agent Profiles panel | MISSING | Not implemented |
| Context Panel | MISSING | No mount/unmount L3 artifacts |
| Progressive Disclosure | MISSING | No Conversation Mode / Studio Mode toggle |
| Command interface | MISSING | No `/start_session`, `/switch_world`, etc. |
| Observability Dashboard | MISSING | No real-time metrics, no usage tracking |
| Transparency indicators | MISSING | `StatusFooter` has placeholders, not wired to real data |
| Terminal integration | MISSING | `xterm` dependency installed, not integrated |
| Dependency graph viz | MISSING | `@xyflow/react` dependency installed, not integrated |

---

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 8-01 | Wire Worlds Dashboard to real data with Kanban layout | 4h | — | TODO |
| 8-02 | Build World Cockpit view | 4h | 8-01 | TODO |
| 8-03 | Build Session Wizard (pattern, model, class selection) | 4h | 8-02 | TODO |
| 8-04 | Build Session Runner with real-time WebSocket streaming | 4h | 8-03 | TODO |
| 8-05 | Build Memory Inspector (L2, L3, L4 browser) | 4h | — | TODO |
| 8-06 | Build Agent Profiles panel | 3h | — | TODO |
| 8-07 | Build Context Panel (mount/unmount L3 artifacts) | 3h | 8-05 | TODO |
| 8-08 | Implement keyboard-first navigation system | 3h | 8-01, 8-02 | TODO |
| 8-09 | Implement Progressive Disclosure (Conversation / Studio Mode) | 4h | 8-04 | TODO |
| 8-10 | Build command interface | 4h | 8-08 | TODO |
| 8-11 | Build Observability Dashboard | 4h | — | TODO |
| 8-12 | Wire transparency indicators in StatusFooter | 3h | 8-04, 8-11 | TODO |
| 8-13 | Terminal integration (xterm.js) | 4h | 8-09 | TODO |
| 8-14 | Dependency graph visualization (@xyflow/react) | 4h | 8-05 | TODO |
| 8-15 | Phase 8 integration tests | 4h | ALL | TODO |

**Total estimated effort:** ~57 hours

---

## Task Details

### 8-01: Wire Worlds Dashboard to Real Data with Kanban Layout

**Priority:** P0
**Assignee:** Any
**Files:**
- `apps/web/src/components/views/WorldsDashboard.tsx` — rewrite with Kanban layout
- `apps/web/src/store/useWorldStore.ts` — add `updateWorld`, drag-drop reorder actions
- `apps/web/src/types/electron.d.ts` — extend `WorldApi` if needed for status updates
- `apps/web/src/components/WorldCard.tsx` — new: extracted world card component with status, telos preview, session count
- `apps/web/src/components/CreateWorldModal.tsx` — enhance with telos field, model defaults

**Scope:**
1. Refactor `WorldsDashboard` from simple grid to Kanban-style columns (Active, Paused, Archived) using `@dnd-kit`
2. World cards show: name, purpose/telos preview, session count, last activity timestamp, status badge
3. Drag-and-drop between columns updates world status via IPC `world.update()`
4. "Create World" button opens enhanced modal (name, purpose, telos, default model)
5. World card click navigates to World Cockpit (8-02) via `useUIStore.setView('WORLD_COCKPIT')`
6. Wire all CRUD operations through `window.api.world.*` IPC handlers
7. Empty state with call-to-action when no worlds exist

**Acceptance Criteria:**
- [ ] Worlds load from IPC `world.list()` on mount and display in Kanban columns
- [ ] Cards are draggable between Active/Paused/Archived columns
- [ ] Drag-drop triggers `world.update()` IPC call with new status
- [ ] "Create World" modal submits via `world.create()` IPC and new world appears in dashboard
- [ ] Delete world via context menu or card action triggers `world.delete()` with confirmation
- [ ] World card click sets active world and navigates to Cockpit view
- [ ] Loading skeleton shown while worlds are fetching
- [ ] Error state displayed when IPC calls fail

**Tests:**
- Unit: `WorldsDashboard` renders world cards from store data
- Unit: Drag-drop event triggers status update action
- Unit: Create modal validation (name required, purpose required)
- Unit: Empty state renders when worlds array is empty

---

### 8-02: Build World Cockpit View

**Priority:** P0
**Assignee:** Any
**Depends on:** 8-01
**Files:**
- `apps/web/src/components/views/WorldCockpit.tsx` — new: world detail view
- `apps/web/src/store/useUIStore.ts` — add `WORLD_COCKPIT` to `ViewType`
- `apps/web/src/App.tsx` — wire `WORLD_COCKPIT` view routing
- `apps/web/src/components/layout/Sidebar.tsx` — add Cockpit nav item (visible when world selected)
- `apps/web/src/store/useWorldStore.ts` — add `fetchWorldDetails()` action for full config/telos

**Scope:**
1. World Cockpit is the detailed control panel for a single world
2. Header: world name, status badge, edit button, delete button
3. Telos Display: rendered markdown of L4 telos content (read-only unless Operator edits)
4. Config Panel: world constraints, default model, allowed agents, enabled patterns
5. Sessions Summary: count of active/closed sessions, link to Sessions view
6. Quick Actions: "New Session" button, "Edit Telos" button, "View Memory" link
7. Activity feed: last 5 session summaries from L2 (placeholder data until Memory Inspector)

**Acceptance Criteria:**
- [ ] Cockpit renders when a world is selected and `activeView === 'WORLD_COCKPIT'`
- [ ] World name, purpose, and telos displayed correctly from store data
- [ ] Edit telos opens inline editor; save calls `world.update()` IPC
- [ ] Config section shows world constraints and default model
- [ ] "New Session" button navigates to Session Wizard (8-03)
- [ ] Back button returns to Worlds Dashboard
- [ ] Responsive layout: single column on narrow screens, two-column on wide

**Tests:**
- Unit: Cockpit renders world data from active world in store
- Unit: Edit telos triggers update action
- Unit: Navigation buttons change view state correctly
- Unit: Cockpit shows empty/error state when world data is null

---

### 8-03: Build Session Wizard (Pattern, Model, Class Selection)

**Priority:** P0
**Assignee:** Any
**Depends on:** 8-02
**Files:**
- `apps/web/src/components/views/SessionWizard.tsx` — new: multi-step session creation wizard
- `apps/web/src/store/useUIStore.ts` — add `SESSION_WIZARD` to `ViewType`
- `apps/web/src/store/useSessionStore.ts` — extend with pattern/model/class selection actions
- `apps/web/src/store/usePatternStore.ts` — new: fetch available patterns for world
- `apps/web/src/types/electron.d.ts` — add `PatternApi`, `AgentApi` interfaces
- `apps/web/src/App.tsx` — wire `SESSION_WIZARD` view routing

**Scope:**
1. Multi-step wizard flow: (1) Select Pattern -> (2) Choose Model & Class -> (3) Set Intent -> (4) Review & Launch
2. Step 1 — Pattern Selection: list available patterns for active world, preview pattern steps, select one
3. Step 2 — Model & Class: model selector dropdown (Ollama models, cloud models), session class radio (THIN/STANDARD/DEEP) with descriptions
4. Step 3 — Intent Setting: reuse/enhance existing `PrimacyView` (goal, audience, constraints)
5. Step 4 — Review: summary of all selections, "Launch Session" button
6. Context narrowing: after pattern selection, show which L3 artifacts will be loaded
7. Back/forward navigation between steps with state preservation

**Acceptance Criteria:**
- [ ] Wizard renders 4 steps with progress indicator
- [ ] Patterns fetched from IPC and displayed as selectable cards with descriptions
- [ ] Model selector shows available local models (from Ollama) and cloud options
- [ ] Session class selector (THIN/STANDARD/DEEP) with clear descriptions of each
- [ ] Intent envelope fields (goal, audience, constraints) carried from existing `PrimacyView`
- [ ] Review step shows complete summary before launch
- [ ] "Launch Session" creates session via IPC, sets intent, starts session, navigates to Runner
- [ ] Back button at any step preserves previous selections
- [ ] Keyboard: Enter advances to next step, Escape cancels wizard

**Tests:**
- Unit: Wizard step navigation (forward, backward, state preservation)
- Unit: Pattern selection updates session config
- Unit: Model selector renders available models
- Unit: Session class selection stores correct value
- Unit: Launch button disabled until all required fields filled

---

### 8-04: Build Session Runner with Real-Time WebSocket Streaming

**Priority:** P0
**Assignee:** Any
**Depends on:** 8-03
**Files:**
- `apps/web/src/components/SessionRunner.tsx` — rewrite with real WebSocket integration
- `apps/web/src/hooks/useSession.ts` — complete WebSocket implementation with token streaming
- `apps/web/src/hooks/useStreamingMessage.ts` — new: manages token-by-token rendering
- `apps/web/src/store/useSessionStore.ts` — add streaming state (isStreaming, currentTokens, etc.)
- `apps/web/src/components/MessageBubble.tsx` — new: individual message component with markdown rendering
- `apps/web/src/components/StreamingIndicator.tsx` — new: animated typing/thinking indicator

**Scope:**
1. Replace mock message simulation with real WebSocket connection from `useSession` hook
2. Token-by-token streaming: as tokens arrive via WebSocket `data.type === 'token'`, append to current message
3. Message types: user input, assistant response (streaming), system notifications, error messages
4. Markdown rendering in assistant messages (code blocks, lists, headers)
5. Auto-scroll to bottom during streaming, pause auto-scroll if user scrolls up
6. Follow-up instructions: allow user to send additional input during Pattern execution
7. Session state indicators: PRIMACY -> ACTIVE -> CLOSING, with visual transitions
8. Error handling: reconnection logic, timeout indicators, failed message retry
9. Token count display per message (from WebSocket metadata)

**Acceptance Criteria:**
- [ ] WebSocket connects to session endpoint on mount, authenticates with token
- [ ] Tokens stream into UI in real-time, character by character
- [ ] Completed messages render with full markdown formatting
- [ ] User can send messages while assistant is responding (queued)
- [ ] Auto-scroll follows new content; pauses when user scrolls up; "Jump to bottom" button appears
- [ ] Session state transitions (PRIMACY -> ACTIVE -> CLOSING) update UI indicators
- [ ] Network disconnection shows reconnecting indicator; auto-reconnects
- [ ] Token count and model name displayed per assistant message
- [ ] Escape key cancels current streaming response (sends abort signal)

**Tests:**
- Unit: `useStreamingMessage` appends tokens correctly
- Unit: Message list renders in correct order
- Unit: Auto-scroll logic (follow mode vs. manual scroll detection)
- Unit: Reconnection logic triggers after disconnection
- Unit: Abort signal sent on Escape key during streaming

---

### 8-05: Build Memory Inspector (L2, L3, L4 Browser)

**Priority:** P1
**Assignee:** Any
**Files:**
- `apps/web/src/components/views/MemoryInspector.tsx` — new: memory layer browser
- `apps/web/src/store/useMemoryStore.ts` — new: Zustand store for memory data
- `apps/web/src/store/useUIStore.ts` — add `MEMORY_INSPECTOR` to `ViewType`
- `apps/web/src/types/electron.d.ts` — add `MemoryApi` interface (read L2, L3, L4)
- `apps/web/src/App.tsx` — wire `MEMORY_INSPECTOR` view routing
- `apps/web/src/components/memory/LayerPanel.tsx` — new: individual layer display panel
- `apps/web/src/components/memory/MemoryEntry.tsx` — new: single memory entry renderer

**Scope:**
1. Three-tab interface: L2 (Episodic), L3 (Knowledge), L4 (Telos)
2. L4 Tab: Read-only telos display for active world and its agents. Markdown rendered.
3. L3 Tab: World config, pattern definitions, agent profiles. Tree-structured browser.
4. L2 Tab: Session summaries, decisions log. Chronological list with search/filter.
5. All data fetched via IPC from memory layer services
6. World-scoped: only shows data for the active world (World Isolation mandate)
7. Search within memory entries (client-side text filter)
8. Expand/collapse entries for detail view
9. Visual indicators: layer color coding (L4=gold, L3=blue, L2=green)

**Acceptance Criteria:**
- [ ] Three tabs render for L2, L3, L4 with distinct visual styling
- [ ] L4 content displays world telos and agent telos as rendered markdown
- [ ] L3 content shows world config, patterns, and agent profiles in a tree view
- [ ] L2 content lists session summaries in reverse chronological order
- [ ] All queries are world-scoped (only active world data shown)
- [ ] Text search filters entries across the active tab
- [ ] Entries are expandable/collapsible for detail inspection
- [ ] Empty state shown when no data exists for a layer
- [ ] Loading skeletons while data is being fetched

**Tests:**
- Unit: Tab switching renders correct layer content
- Unit: L4 renders telos markdown correctly
- Unit: L2 entries sorted reverse chronological
- Unit: Search filter matches entry content
- Unit: World-scoping: store only requests data for active world ID

---

### 8-06: Build Agent Profiles Panel

**Priority:** P1
**Assignee:** Any
**Files:**
- `apps/web/src/components/views/AgentProfiles.tsx` — new: agent browser and configurator
- `apps/web/src/store/useAgentStore.ts` — new: Zustand store for agent data
- `apps/web/src/store/useUIStore.ts` — add `AGENT_PROFILES` to `ViewType`
- `apps/web/src/types/electron.d.ts` — add `AgentApi` interface
- `apps/web/src/App.tsx` — wire `AGENT_PROFILES` view routing
- `apps/web/src/components/agents/AgentCard.tsx` — new: individual agent display

**Scope:**
1. List all agents available to the active world
2. Agent card shows: name, role, capabilities, assigned model, status (active/idle)
3. Click agent to view full profile: role description, constraints, telos, conversation style
4. Operator can edit agent configuration (name, role, model assignment, constraints)
5. "Assign to World" / "Remove from World" actions
6. Agent activation patterns: show which patterns an agent participates in
7. Visual indicator for currently active agent in a running session

**Acceptance Criteria:**
- [ ] Agent list loads from IPC for the active world
- [ ] Agent cards display name, role, model, and status
- [ ] Clicking an agent opens a detail panel with full profile
- [ ] Operator can edit agent config (role, model, constraints) and save via IPC
- [ ] Assign/remove agent from world triggers IPC call and updates UI
- [ ] Currently active agent (in running session) has visual highlight
- [ ] Empty state when no agents are configured

**Tests:**
- Unit: Agent list renders from store data
- Unit: Agent detail panel opens on card click
- Unit: Edit form validates required fields (name, role)
- Unit: Assign/remove actions update store correctly

---

### 8-07: Build Context Panel (Mount/Unmount L3 Artifacts)

**Priority:** P1
**Assignee:** Any
**Depends on:** 8-05
**Files:**
- `apps/web/src/components/context/ContextPanel.tsx` — new: side panel for context management
- `apps/web/src/store/useContextStore.ts` — new: Zustand store for mounted context
- `apps/web/src/types/electron.d.ts` — add context mount/unmount to `SessionApi`
- `apps/web/src/components/context/ArtifactItem.tsx` — new: individual artifact display with mount toggle
- `apps/web/src/components/context/FileTree.tsx` — new: `.loom/` directory tree browser

**Scope:**
1. Slide-out panel accessible from Session Runner and World Cockpit
2. Shows all available L3 artifacts for the active world: pattern defs, agent profiles, world configs
3. Toggle to mount/unmount artifacts into the active session's context
4. Mounted artifacts show token count estimate (how much context they consume)
5. `.loom/` file tree browser: navigate the world's markdown file structure
6. Drag artifacts from file tree to "mounted" area
7. Total context budget display (tokens used / max tokens for selected model)
8. Visual grouping: Patterns, Agents, Knowledge, Custom files

**Acceptance Criteria:**
- [ ] Context panel opens as slide-out overlay from right edge
- [ ] Available L3 artifacts listed and grouped by type (Patterns, Agents, Knowledge)
- [ ] Mount/unmount toggle on each artifact sends IPC to update session context
- [ ] Token count estimate shown per artifact and as total
- [ ] `.loom/` file tree renders directory structure of active world
- [ ] Context budget bar shows used/available tokens
- [ ] Panel closes on Escape or clicking outside
- [ ] Panel state persists during session (does not reset on re-open)

**Tests:**
- Unit: Panel opens/closes via store toggle
- Unit: Artifact list grouped by type
- Unit: Mount/unmount toggles update store and trigger IPC
- Unit: Token budget calculation is accurate
- Unit: File tree renders nested directory structure

---

### 8-08: Implement Keyboard-First Navigation System

**Priority:** P0
**Assignee:** Any
**Depends on:** 8-01, 8-02
**Files:**
- `apps/web/src/hooks/useKeyboardShortcuts.ts` — expand with full shortcut registry
- `apps/web/src/components/KeyboardShortcutOverlay.tsx` — new: "?" key shows all shortcuts
- `apps/web/src/store/useUIStore.ts` — add shortcut registry, help overlay state
- `apps/web/src/components/layout/MainLayout.tsx` — wire global shortcuts
- `apps/web/src/components/layout/Sidebar.tsx` — show shortcut hints next to nav items

**Scope:**
1. Global single-key shortcuts (when no input focused):
   - `D` — Dashboard (Worlds)
   - `K` — World Cockpit (when world selected)
   - `A` — Agent Profiles
   - `S` — Sessions view
   - `M` — Memory Inspector
   - `C` — Context Panel toggle
   - `T` — Theme switcher toggle
   - `?` — Show keyboard shortcut overlay
   - `Escape` — Close modals/panels, go back one level
   - `/` — Focus command interface input
2. Session Runner shortcuts:
   - `Ctrl+Enter` — Send message
   - `Escape` — Cancel streaming
   - `Ctrl+Shift+C` — Toggle Context Panel
3. Shortcut overlay: modal listing all available shortcuts, grouped by context
4. Sidebar nav items show shortcut hint badges (e.g., "[D]" next to Dashboard)
5. Shortcuts are context-aware: some only active in certain views

**Acceptance Criteria:**
- [ ] All single-key shortcuts navigate to correct views
- [ ] Shortcuts disabled when input/textarea is focused (existing behavior preserved)
- [ ] `?` key opens shortcut help overlay
- [ ] `Escape` closes overlays and navigates back one level
- [ ] `/` focuses the command input (8-10)
- [ ] Sidebar shows shortcut hint badges next to navigation items
- [ ] Shortcuts are context-aware (Session Runner shortcuts only active during session)
- [ ] No conflicts between shortcuts and browser defaults

**Tests:**
- Unit: Each shortcut triggers correct navigation action
- Unit: Shortcuts suppressed when input is focused
- Unit: Help overlay opens on `?` and lists all shortcuts
- Unit: Context-aware shortcuts only fire in correct view
- Unit: Escape key closes modal/panel/overlay in priority order

---

### 8-09: Implement Progressive Disclosure (Conversation / Studio Mode)

**Priority:** P1
**Assignee:** Any
**Depends on:** 8-04
**Files:**
- `apps/web/src/store/useUIStore.ts` — add `uiMode: 'CONVERSATION' | 'STUDIO'` state
- `apps/web/src/components/views/ConversationMode.tsx` — new: simplified chat-only interface
- `apps/web/src/components/views/StudioMode.tsx` — new: full multi-panel layout
- `apps/web/src/components/SessionRunner.tsx` — conditional rendering based on mode
- `apps/web/src/components/layout/MainLayout.tsx` — mode toggle in header
- `apps/web/src/components/ModeToggle.tsx` — new: Conversation/Studio toggle switch

**Scope:**
1. **Conversation Mode:** Minimal, distraction-free chat interface. Center-aligned messages, no side panels, large input area. Ideal for quick interactions.
2. **Studio Mode:** Full multi-panel layout with Session Runner (center), Context Panel (right), Agent State (right), Data Context (left). Ideal for complex Pattern execution.
3. Toggle between modes via keyboard shortcut (`Ctrl+Shift+M`) or UI toggle button
4. Mode preference persisted in `useUIStore` (survives page reload via Zustand persist)
5. Smooth transition animation between modes (panels slide in/out)
6. Context Panel and Agent State auto-hide in Conversation Mode, auto-show in Studio Mode
7. The mode toggle is visible in both the `StatusFooter` and session header

**Acceptance Criteria:**
- [ ] Conversation Mode renders clean single-column chat interface
- [ ] Studio Mode renders multi-panel layout with sidebar panels
- [ ] `Ctrl+Shift+M` toggles between modes
- [ ] UI toggle button in header/footer switches modes
- [ ] Mode preference persisted across sessions
- [ ] Transition animation between modes is smooth (no layout jank)
- [ ] Side panels auto-hide/show based on mode
- [ ] Existing session state preserved when switching modes

**Tests:**
- Unit: Mode toggle updates store state
- Unit: Conversation Mode renders without side panels
- Unit: Studio Mode renders with side panels
- Unit: Mode persists after store rehydration
- Unit: Keyboard shortcut triggers mode switch

---

### 8-10: Build Command Interface

**Priority:** P1
**Assignee:** Any
**Depends on:** 8-08
**Files:**
- `apps/web/src/components/CommandPalette.tsx` — new: command palette overlay (Ctrl+K or `/`)
- `apps/web/src/hooks/useCommandRegistry.ts` — new: command registration and execution
- `apps/web/src/store/useCommandStore.ts` — new: command history, suggestions
- `apps/web/src/components/layout/MainLayout.tsx` — wire command palette trigger

**Scope:**
1. Command palette (similar to VS Code's Ctrl+K): overlay with text input and filtered command list
2. Built-in commands:
   - `/start_session` — create and launch a new session in active world
   - `/switch_world <name>` — switch to a different world by name
   - `/set_model <model>` — change active model for current session
   - `/set_class <THIN|STANDARD|DEEP>` — change session class
   - `/inspect_memory <layer>` — open Memory Inspector at specific layer
   - `/theme <name>` — switch theme
   - `/help` — show available commands
   - `/end_session` — end current session
3. Fuzzy search: typing filters commands by name and description
4. Command history: up/down arrows cycle through recent commands
5. Auto-complete suggestions as user types
6. Commands execute via appropriate store actions or IPC calls
7. Accessible via `/` key (global shortcut) or `Ctrl+K`

**Acceptance Criteria:**
- [ ] Command palette opens on `/` or `Ctrl+K`
- [ ] All built-in commands listed and filterable
- [ ] Fuzzy search narrows command list as user types
- [ ] Selecting a command executes the corresponding action
- [ ] `/switch_world` accepts world name argument and switches context
- [ ] `/start_session` navigates through Session Wizard flow
- [ ] Command history accessible with up/down arrow keys
- [ ] `Escape` closes command palette
- [ ] Invalid commands show "Command not found" feedback

**Tests:**
- Unit: Command registry contains all built-in commands
- Unit: Fuzzy search filters commands correctly
- Unit: Command execution triggers correct store actions
- Unit: Command history stored and navigable
- Unit: Invalid command shows error feedback

---

### 8-11: Build Observability Dashboard

**Priority:** P1
**Assignee:** Any
**Files:**
- `apps/web/src/components/views/ObservabilityDashboard.tsx` — new: metrics dashboard
- `apps/web/src/store/useMetricsStore.ts` — new: Zustand store for metrics data
- `apps/web/src/store/useUIStore.ts` — add `OBSERVABILITY` to `ViewType`
- `apps/web/src/types/electron.d.ts` — add `MetricsApi` interface
- `apps/web/src/App.tsx` — wire `OBSERVABILITY` view routing
- `apps/web/src/components/metrics/MetricCard.tsx` — new: reusable metric display (replace inline in `EngineManager`)
- `apps/web/src/components/metrics/UsageChart.tsx` — new: simple bar/line chart for usage over time
- `apps/web/src/components/metrics/PatternUsageTable.tsx` — new: pattern frequency table

**Scope:**
1. Real-time metrics display (non-content data only — NEVER log raw prompts/outputs/transcripts):
   - Active model per session
   - Token usage (input/output counts)
   - Latency per request (avg, p95, p99)
   - Estimated cost per session and cumulative
2. Pattern usage frequency: table of patterns sorted by usage count
3. Session health: aborts, retries, escalations count
4. Agent activation: which agents activated and how often
5. Local vs. cloud usage ratio (pie chart or bar)
6. Auto-refresh: metrics update in real-time via WebSocket or polling (configurable interval)
7. Time range selector: last hour, last 24h, last 7 days
8. Export metrics as JSON (download button)

**Acceptance Criteria:**
- [ ] Dashboard renders real-time metrics cards (model, tokens, latency, cost)
- [ ] Pattern usage frequency table shows patterns sorted by use count
- [ ] Abort/retry/escalation counts displayed
- [ ] Agent activation patterns shown
- [ ] Local vs. cloud usage ratio displayed
- [ ] Metrics auto-refresh on configurable interval (default: 5s)
- [ ] Time range selector filters displayed data
- [ ] Export button downloads metrics as JSON
- [ ] NEVER displays raw prompts, raw outputs, or transcripts (privacy mandate)

**Tests:**
- Unit: Metrics cards render with correct values from store
- Unit: Pattern usage table sorts correctly
- Unit: Time range filter updates displayed data
- Unit: Export generates valid JSON
- Unit: No raw content fields present in any metric data structure

---

### 8-12: Wire Transparency Indicators in StatusFooter

**Priority:** P1
**Assignee:** Any
**Depends on:** 8-04, 8-11
**Files:**
- `apps/web/src/components/layout/StatusFooter.tsx` — rewrite with real data bindings
- `apps/web/src/store/useWorldStore.ts` — expose active world name for footer
- `apps/web/src/store/useSessionStore.ts` — expose active pattern, agent, model for footer
- `apps/web/src/store/useMetricsStore.ts` — expose connection status, cost for footer
- `apps/web/src/components/layout/StatusFooterItem.tsx` — new: reusable footer item component

**Scope:**
1. Replace all hardcoded values in `StatusFooter` with real store data:
   - Connection status: online/offline from WebSocket state
   - Active World name (from `useWorldStore`)
   - Active Pattern name (from `useSessionStore` or session metadata)
   - Active Agent name (from session context)
   - Active Model (from session config)
   - Session cost (cumulative, from `useMetricsStore`)
   - Tempo indicator (from session or engine config)
   - Local/Cloud indicator (from model type detection)
2. Footer items are clickable: clicking world name navigates to Cockpit, clicking model name opens model selector
3. Truncation with tooltip for long names
4. Color-coded status: green for online, red for offline, amber for degraded

**Acceptance Criteria:**
- [ ] Connection status reflects actual WebSocket connection state
- [ ] Active World name shown, clickable to navigate to Cockpit
- [ ] Active Pattern name shown when session is running
- [ ] Active Agent name shown when agent is engaged
- [ ] Active Model shown from session config (not hardcoded)
- [ ] Session cost updates in real-time from metrics store
- [ ] Tempo indicator reflects actual session tempo
- [ ] Local/Cloud badge indicates current model source
- [ ] All indicators show "—" or "N/A" when no session is active (graceful fallback)

**Tests:**
- Unit: Footer renders all indicators from store data
- Unit: Indicators show fallback values when no session active
- Unit: Click on world name triggers navigation
- Unit: Connection status updates on WebSocket state change
- Unit: Cost display formats currency correctly

---

### 8-13: Terminal Integration (xterm.js)

**Priority:** P2 (Advanced)
**Assignee:** Any
**Depends on:** 8-09
**Files:**
- `apps/web/src/components/terminal/TerminalPanel.tsx` — new: xterm.js wrapper component
- `apps/web/src/hooks/useTerminal.ts` — new: terminal instance management
- `apps/web/src/store/useUIStore.ts` — add terminal panel visibility state
- `apps/web/src/components/views/StudioMode.tsx` — integrate terminal as bottom panel

**Scope:**
1. Embed `xterm.js` terminal in Studio Mode as a bottom panel (toggle with `Ctrl+`` `)
2. Terminal connects to a pseudo-terminal on the Electron main process via IPC
3. Supports: reading `.loom/` files, running loom CLI commands, viewing logs
4. Terminal theme syncs with app theme (background, foreground, cursor colors)
5. Resize handle between terminal and main content area
6. Multiple terminal tabs support (like VS Code)
7. Copy/paste support within terminal
8. Terminal output searchable (Ctrl+F within terminal)

**Acceptance Criteria:**
- [ ] Terminal panel renders `xterm.js` instance in Studio Mode
- [ ] Toggle terminal with `Ctrl+`` ` keyboard shortcut
- [ ] Terminal theme colors sync with active app theme
- [ ] Resize handle adjusts terminal/content split
- [ ] Text input and output works through IPC to main process
- [ ] Copy/paste supported (Ctrl+C/V within terminal)
- [ ] Terminal persists across view changes within Studio Mode

**Tests:**
- Unit: Terminal panel renders without errors
- Unit: Toggle shortcut shows/hides terminal
- Unit: Theme sync applies correct colors
- Unit: Resize handle updates panel dimensions

---

### 8-14: Dependency Graph Visualization (@xyflow/react)

**Priority:** P2 (Advanced)
**Assignee:** Any
**Depends on:** 8-05
**Files:**
- `apps/web/src/components/graph/DependencyGraph.tsx` — new: @xyflow/react graph component
- `apps/web/src/hooks/useDependencyGraph.ts` — new: compute graph nodes/edges from world data
- `apps/web/src/store/useUIStore.ts` — add `DEPENDENCY_GRAPH` to `ViewType`
- `apps/web/src/App.tsx` — wire `DEPENDENCY_GRAPH` view routing
- `apps/web/src/components/graph/GraphNode.tsx` — new: custom node renderers for different entity types
- `apps/web/src/components/graph/GraphControls.tsx` — new: zoom, pan, filter controls

**Scope:**
1. Visualize relationships between world entities using `@xyflow/react`:
   - World -> Patterns (which patterns are available)
   - Patterns -> Agents (which agents participate in each pattern)
   - Patterns -> Sessions (which sessions used which patterns)
   - Agents -> Models (which model each agent uses)
2. Custom node types: World (globe icon), Pattern (flow icon), Agent (user icon), Session (terminal icon)
3. Edge types: solid (active relationship), dashed (optional/inactive)
4. Interactive: click node to navigate to detail view (e.g., click agent node -> Agent Profiles)
5. Layout algorithms: hierarchical (default), force-directed (toggle)
6. Zoom/pan controls, minimap, fit-to-view button
7. Filter: show/hide node types, filter by status

**Acceptance Criteria:**
- [ ] Graph renders world entities as nodes with correct icons
- [ ] Edges connect related entities (world->patterns->agents)
- [ ] Nodes are clickable and navigate to corresponding detail views
- [ ] Hierarchical and force-directed layout options available
- [ ] Zoom, pan, and minimap controls functional
- [ ] Filter toggles show/hide specific node types
- [ ] Graph re-renders when world data changes
- [ ] Empty state when no relationships exist

**Tests:**
- Unit: Graph nodes generated correctly from world data
- Unit: Edges computed for all entity relationships
- Unit: Node click triggers correct navigation
- Unit: Filter toggles update visible nodes
- Unit: Layout toggle switches between hierarchical and force-directed

---

### 8-15: Phase 8 Integration Tests

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL above
**Files:**
- `apps/web/src/__tests__/integration/phase8.test.tsx` — new: integration test suite
- `apps/web/src/__tests__/integration/navigation.test.tsx` — new: view navigation tests
- `apps/web/src/__tests__/integration/streaming.test.tsx` — new: WebSocket streaming tests
- `apps/web/src/__tests__/helpers/mockStores.ts` — new: mock Zustand stores for testing

**Scope:**
Comprehensive tests validating Phase 8 exit criteria:

1. **Navigation Flow:** Dashboard -> World Cockpit -> Session Wizard -> Session Runner -> Memory Inspector (full cycle)
2. **Keyboard Navigation:** All single-key shortcuts navigate correctly
3. **World CRUD:** Create world -> appears in dashboard -> edit in cockpit -> delete -> removed
4. **Session Lifecycle:** Create session via wizard -> set intent -> start -> stream messages -> end session
5. **Memory Inspection:** Open inspector -> switch tabs -> view L2/L3/L4 content -> search
6. **Progressive Disclosure:** Toggle Conversation/Studio mode -> panels show/hide correctly
7. **Command Palette:** Open -> type command -> execute -> verify action
8. **Observability:** Metrics update in real-time -> no raw content exposed
9. **Theme System:** Switch theme -> CSS variables update -> all components re-render
10. **Transparency:** StatusFooter shows correct active world/pattern/agent/model

**Acceptance Criteria:**
- [ ] All integration tests pass
- [ ] Full Operator workflow (create world -> session -> execute pattern -> inspect memory) tested end-to-end
- [ ] Keyboard navigation covers all views
- [ ] No raw prompts/outputs leaked in observability data
- [ ] Theme switching applies globally without layout breaks
- [ ] Progressive Disclosure modes render correctly
- [ ] Command interface executes all built-in commands

**Tests:**
- This IS the test suite. 25-30 test cases covering all Phase 8 deliverables.

---

## Parallel Execution Guide

```
Track A (Core Views):       8-01 (Worlds Dashboard) → 8-02 (Cockpit) → 8-03 (Session Wizard) → 8-04 (Session Runner)
Track B (Data & Memory):    8-05 (Memory Inspector) → 8-07 (Context Panel) → 8-14 (Dependency Graph)
Track C (Agents & Config):  8-06 (Agent Profiles) — independent
Track D (Observability):    8-11 (Observability Dashboard) — independent

After Track A + Track D:    8-12 (Transparency Indicators)
After 8-01 + 8-02:         8-08 (Keyboard Navigation)
After 8-04:                8-09 (Progressive Disclosure) → 8-13 (Terminal)
After 8-08:                8-10 (Command Interface)

Final:                      8-15 (Integration Tests — needs ALL)
```

**Maximum parallelism:** 4 agents — one per track (A, B, C, D).

**Critical path:** Track A (8-01 -> 8-02 -> 8-03 -> 8-04) is the longest chain at ~16 hours. Start here first.

**Quick wins (independent, can start immediately):**
- 8-05 (Memory Inspector) — no dependencies
- 8-06 (Agent Profiles) — no dependencies
- 8-11 (Observability Dashboard) — no dependencies
