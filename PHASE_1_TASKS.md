# Phase 1 — Core Engine: Memory + Governance

**Parent:** [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) v2.0, Phase 1
**Goal:** Implement the 4-layer memory model with DB persistence and governance enforcement.
**Depends on:** Phase 0.5 (IPC working, basic session lifecycle functional)
**Exit Criteria:** Can store/retrieve all memory layers, governance blocks unauthorized writes, external file edits sync to DB.

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| DB schema (all tables) | COMPLETE | 15+ tables, 3 migrations applied |
| L1 Active Memory | IMPLEMENTED | In-memory Map, clears on session end |
| L2 Episodic Layer | SCAFFOLDED | Placeholder — no DB persistence |
| L3 Knowledge Layer | SCAFFOLDED | Placeholder — no DB persistence |
| L4 Telos Layer | SCAFFOLDED | Placeholder — immutability not enforced via code |
| MetaGovernance | SCAFFOLDED | 1 hardcoded rule (block telos overwrites) |
| A0Enforcer | SCAFFOLDED | Gateway exists, permissive fallback mode |
| Write Permission Matrix | MISSING | Not implemented |
| Reconciliation Service | MISSING | File watcher exists (chokidar), no sync logic |
| DualTruthService | MISSING | Interface not defined |

---

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 1-01 | Implement L4 Telos Layer with DB persistence | 3h | — | TODO |
| 1-02 | Implement L3 Knowledge Layer with DB persistence | 4h | — | TODO |
| 1-03 | Implement L2 Episodic Layer with DB persistence | 4h | — | TODO |
| 1-04 | Implement Write Permission Matrix | 3h | 1-01, 1-02, 1-03 | TODO |
| 1-05 | Expand META Governance rules engine | 4h | — | TODO |
| 1-06 | Harden A0 Enforcement module | 3h | 1-05 | TODO |
| 1-07 | Implement cross-layer flow validation | 2h | 1-04, 1-06 | TODO |
| 1-08 | Define DualTruthService interface | 2h | — | TODO |
| 1-09 | Implement File Watcher & Reconciliation Service | 4h | 1-08 | TODO |
| 1-10 | Phase 1 integration tests | 3h | ALL | TODO |

**Total estimated effort:** ~32 hours

---

## Task Details

### 1-01: Implement L4 Telos Layer with DB Persistence

**Priority:** P0
**Assignee:** Any
**Files:**
- `packages/core/src/memory/layers.ts` — enhance `L4TelosLayer`
- `packages/core/src/memory/L4TelosLayer.ts` — extract to own file if needed
- `packages/db/src/schema/world.ts` — `world_telos` table (exists)
- `packages/db/src/schema/agent.ts` — `agent_telos` table (exists)
- `packages/core/src/__tests__/memory/l4.test.ts` — new tests

**Scope:**
1. L4TelosLayer reads from `world_telos`, `agent_telos`, `operator_telos` tables
2. L4 is READ-ONLY at runtime — writes only via explicit Operator action
3. Writes require A0 authorization (Operator Supremacy check)
4. Versioning: each write creates a new record (append), old records preserved
5. Interface: `read(entityType, entityId): string` and `write(entityType, entityId, content, operatorId): void`

**Acceptance Criteria:**
- [ ] `L4TelosLayer.read('world', worldId)` returns telos markdown content from DB
- [ ] `L4TelosLayer.read('agent', agentId)` returns agent telos from DB
- [ ] `L4TelosLayer.write()` succeeds only when called with valid operator authorization
- [ ] `L4TelosLayer.write()` without authorization throws `TelosImmutabilityError`
- [ ] Previous telos versions are preserved (not overwritten)

**Tests:**
- Unit: Read returns content from mock repository
- Unit: Write without auth throws
- Unit: Write with auth succeeds and stores new version
- Unit: Read returns latest version after write

---

### 1-02: Implement L3 Knowledge Layer with DB Persistence

**Priority:** P0
**Assignee:** Any
**Files:**
- `packages/core/src/memory/layers.ts` — enhance `L3KnowledgeLayer`
- `packages/core/src/memory/L3KnowledgeLayer.ts` — extract to own file
- `packages/db/src/schema/world.ts` — `world_config` table (exists)
- `packages/db/src/schema/pattern.ts` — patterns table (exists)
- `packages/db/src/schema/agent.ts` — `agent_profiles` table (exists)
- `packages/core/src/__tests__/memory/l3.test.ts` — new tests

**Scope:**
1. L3 stores: world configs, pattern definitions, agent profiles, meta rules
2. All L3 reads are world-scoped (must pass `worldId`)
3. L3 writes require authorized pathways (governance check)
4. Supports: `getWorldKnowledge(worldId)`, `getPatterns(worldId)`, `getAgentProfiles(worldId)`
5. Returns structured data, not raw DB rows

**Acceptance Criteria:**
- [ ] `L3KnowledgeLayer.getWorldKnowledge(worldId)` returns config + constraints
- [ ] `L3KnowledgeLayer.getPatterns(worldId)` returns pattern definitions for the world
- [ ] `L3KnowledgeLayer.getAgentProfiles(worldId)` returns agent profiles assigned to world
- [ ] All queries are world-scoped — cannot access other worlds' knowledge
- [ ] World isolation enforced: passing wrong worldId returns empty results, not errors

**Tests:**
- Unit: World-scoped queries return correct data
- Unit: Cross-world access returns empty (not data from other worlds)
- Unit: Write operations require governance authorization

---

### 1-03: Implement L2 Episodic Layer with DB Persistence

**Priority:** P0
**Assignee:** Any
**Files:**
- `packages/core/src/memory/layers.ts` — enhance `L2EpisodicLayer`
- `packages/core/src/memory/L2EpisodicLayer.ts` — extract to own file
- `packages/db/src/schema/memory.ts` — verify session_summaries, decisions tables
- `packages/core/src/__tests__/memory/l2.test.ts` — new tests

**Scope:**
1. L2 is append-only (existing records never modified)
2. Stores: session summaries, decisions, world deltas
3. All L2 data is world-scoped
4. Supports: `appendSummary(worldId, sessionId, summary)`, `getSummaries(worldId, limit)`, `getDecisions(worldId)`
5. Feeds into Context Assembly (Phase 0.5-05)

**Acceptance Criteria:**
- [ ] `appendSummary()` writes a new record to the database
- [ ] `getSummaries(worldId, 3)` returns the last 3 session summaries for a world
- [ ] `getDecisions(worldId)` returns all logged decisions
- [ ] Records are truly append-only — no update/delete methods exposed
- [ ] All queries are world-scoped

**Tests:**
- Unit: Append creates new record
- Unit: getSummaries returns in reverse chronological order
- Unit: World scoping prevents cross-world reads
- Unit: No update or delete operations exist on the interface

---

### 1-04: Implement Write Permission Matrix

**Priority:** P1
**Assignee:** Any
**Depends on:** 1-01, 1-02, 1-03
**Files:**
- `packages/core/src/memory/WritePermissionMatrix.ts` — new file
- `packages/core/src/memory/types.ts` — permission types
- `packages/core/src/__tests__/memory/permissions.test.ts` — new tests

**Scope:**
Implement the canonical write permission matrix from the dev plan:

| Component | L1 (Active) | L2 (Episodic) | L3 (Knowledge) | L4 (Telos) |
|-----------|-------------|---------------|-----------------|------------|
| Operator | Read | Read | Read | **Write** (explicit) |
| META | Read | Read | Read (auth only) | Read |
| Worlds | Read | **Write** | Read | Read |
| Agents | Read | **Write** | Read | Read |
| Patterns | **Write** | — | — | — |
| Sessions | Read | **Write** | — | — |

1. Create `WritePermissionMatrix` that checks `(actor, layer, operation) → allowed`
2. Wire into all layer write methods as a pre-check
3. Violation attempts throw `PermissionDeniedError` with explanation

**Acceptance Criteria:**
- [ ] Matrix correctly allows/denies per the table above
- [ ] Agent attempting L4 write → denied
- [ ] Pattern attempting L2 write → denied
- [ ] Operator L4 write → allowed
- [ ] Session L2 write → allowed
- [ ] All denials include a human-readable reason

**Tests:**
- Unit: Every cell in the permission matrix tested (allow and deny)
- Unit: Denial messages include actor, layer, and operation details

---

### 1-05: Expand META Governance Rules Engine

**Priority:** P1
**Assignee:** Any
**Files:**
- `packages/core/src/governance/meta.ts` — `MetaGovernanceService`
- `packages/core/src/governance/rules.ts` — new: rule definitions
- `packages/core/src/governance/types.ts` — rule schema types
- `packages/core/src/__tests__/governance/meta.test.ts` — expand tests

**Scope:**
Currently only 1 hardcoded rule. Expand to a proper rules engine:

1. **Rule schema:** `{ id, name, condition: (context) => boolean, action: 'BLOCK' | 'WARN' | 'LOG', message: string }`
2. **Core rules to implement:**
   - `TELOS_IMMUTABILITY` — block telos writes without Operator authorization (exists)
   - `WORLD_ISOLATION` — block cross-world data access
   - `OPERATOR_SUPREMACY` — block agent-initiated intent changes
   - `SILENCE_BY_DEFAULT` — block auto-persistence without explicit consent
   - `PATTERN_SEQUENCE` — block execution before Primacy Expansion complete
   - `AGENT_ROLE_BOUNDS` — block agents from acting outside their role constraints
3. Rules loaded from configuration (not hardcoded) — start with JSON, migrate to L3 later
4. Rule evaluation: `evaluate(action, context) → { allowed: boolean, violations: Violation[] }`

**Acceptance Criteria:**
- [ ] At least 6 governance rules implemented
- [ ] Rules are configurable (loaded from JSON config, not hardcoded)
- [ ] `evaluate()` returns structured result with all violations listed
- [ ] BLOCK violations prevent the action
- [ ] WARN violations allow but log a warning
- [ ] LOG violations silently record

**Tests:**
- Unit: Each rule tested with both passing and failing conditions
- Unit: Multiple violations returned when multiple rules fail
- Unit: BLOCK stops execution; WARN allows it

---

### 1-06: Harden A0 Enforcement Module

**Priority:** P1
**Assignee:** Any
**Depends on:** 1-05
**Files:**
- `packages/core/src/governance/a0.ts` — `A0Enforcer`
- `packages/core/src/__tests__/governance/a0.test.ts` — expand tests

**Scope:**
1. A0 is the runtime gateway — every significant action passes through it
2. A0 calls MetaGovernance `evaluate()` for every action
3. A0 logs all decisions (allowed and denied) to an audit trail
4. A0 handles the "permissive fallback" mode (for development) safely
5. A0 exposes: `authorize(action, context) → AuthorizationResult`

**Wire A0 into:**
- All memory layer write paths
- Session state transitions
- Pattern activation/step execution
- Agent instantiation
- World operations (create, delete, config changes)

**Acceptance Criteria:**
- [ ] Every write operation passes through A0
- [ ] A0 blocks operations that violate META rules
- [ ] A0 logs all authorization decisions (allowed + denied)
- [ ] Permissive mode logs violations but doesn't block (for dev)
- [ ] Strict mode blocks on any BLOCK-level violation
- [ ] Audit log is queryable: "show me all denied actions in the last session"

**Tests:**
- Unit: A0 blocks unauthorized telos write
- Unit: A0 blocks cross-world access
- Unit: A0 allows authorized operations
- Unit: Permissive mode logs but doesn't block
- Integration: Full action → A0 → META → result chain

---

### 1-07: Implement Cross-Layer Flow Validation

**Priority:** P2
**Assignee:** Any
**Depends on:** 1-04, 1-06
**Files:**
- `packages/core/src/memory/LayerCompositionService.ts` — enhance existing
- `packages/core/src/__tests__/memory/composition.test.ts` — new tests

**Scope:**
1. Validate that data flows respect the L4 → L3 → L2 → L1 hierarchy
2. Higher layers define; lower layers execute
3. Nothing writes upward without authorization
4. Composition service orchestrates layer interactions:
   - Session start: L4 → L3 → L1 load sequence
   - Session end: L1 → L2 summary, L1 flush
   - Knowledge update: validate against L4 constraints

**Acceptance Criteria:**
- [ ] Session start loads layers in correct order (L4 first, then L3, then L1)
- [ ] L1 content cannot promote to L3 without governance check
- [ ] L2 content cannot promote to L4 (ever, without explicit Operator action)
- [ ] Layer composition service provides `initializeSession(worldId)` and `closeSession(sessionId)`

**Tests:**
- Unit: Load sequence follows L4 → L3 → L1 order
- Unit: Upward promotion blocked without authorization
- Integration: Full session init → close cycle with layer verification

---

### 1-08: Define DualTruthService Interface

**Priority:** P1
**Assignee:** Any
**Files:**
- `packages/core/src/persistence/DualTruthService.ts` — new interface
- `packages/core/src/persistence/types.ts` — new types

**Scope:**
Define the interface that all persistence operations must use to handle the MD↔DB reconciliation pattern. This is the architectural foundation — implementation comes in 1-09.

```typescript
interface DualTruthService {
  /** Write to markdown first, then sync to DB */
  writeCanonical(path: string, content: string): Promise<void>;

  /** Read from DB (fast), fall back to markdown if DB stale */
  read(entityType: string, entityId: string): Promise<string>;

  /** Reconcile: detect drift between MD and DB, resolve */
  reconcile(path: string): Promise<ReconciliationResult>;

  /** Full rebuild: regenerate DB from all markdown files */
  rebuildFromMarkdown(rootPath: string): Promise<void>;
}
```

**Acceptance Criteria:**
- [ ] Interface defined with JSDoc explaining the "Markdown is Canonical" mandate
- [ ] Types cover: entity types, reconciliation results, conflict resolution strategies
- [ ] Design doc comment explains: DB is accelerator, markdown is source of truth
- [ ] Interface is generic enough for all entity types (worlds, agents, patterns, telos)

**Tests:**
- No runtime tests (this is an interface definition)
- TypeScript compilation validates the interface

---

### 1-09: Implement File Watcher & Reconciliation Service

**Priority:** P2
**Assignee:** Any
**Depends on:** 1-08
**Files:**
- `packages/core/src/persistence/MarkdownReconciler.ts` — implements DualTruthService
- `packages/core/src/persistence/FileWatcher.ts` — wraps existing chokidar setup
- `apps/electron/src/main.ts` — wire reconciler into file watcher events
- `packages/core/src/__tests__/persistence/reconciler.test.ts` — new tests

**Scope:**
1. FileWatcher detects changes to `.loom/` markdown files (chokidar already set up in main.ts)
2. On file change: parse markdown → compare with DB → update DB if markdown is newer
3. On DB write: write markdown file → mark as "DB-initiated" to avoid re-triggering watcher
4. Conflict resolution: markdown wins (Mandate #4), log the conflict
5. `rebuildFromMarkdown()` for disaster recovery — regenerate entire DB from markdown files

**Acceptance Criteria:**
- [ ] External edit to a world's telos markdown → DB updated automatically
- [ ] DB write to world config → markdown file updated
- [ ] Conflict (both changed): markdown wins, DB overwritten, conflict logged
- [ ] `rebuildFromMarkdown()` produces a valid DB from markdown files alone
- [ ] No infinite loops (MD change → DB update → MD write → DB update...)

**Tests:**
- Unit: Parse markdown → produce DB record
- Unit: Detect drift between MD and DB
- Unit: Conflict resolution: markdown wins
- Integration: Edit markdown file → verify DB updated within 2 seconds

---

### 1-10: Phase 1 Integration Tests

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL above
**Files:**
- `packages/core/src/__tests__/integration/phase1.test.ts` — new integration test suite

**Scope:**
Comprehensive tests validating Phase 1 exit criteria:

1. **Permission Matrix:** Attempt every unauthorized write scenario → all blocked
2. **L4 Immutability:** Attempt to overwrite telos from Agent → blocked
3. **A0 Interception:** Verify all write paths go through A0
4. **World Isolation:** Attempt cross-world L2 read → blocked
5. **Layer Composition:** Full session init → close → verify L2 written, L1 flushed
6. **File Sync:** Edit markdown → verify DB updated; write DB → verify markdown updated

**Acceptance Criteria:**
- [ ] All integration tests pass
- [ ] Zero unauthorized writes succeed
- [ ] Layer persistence round-trips (write → read → same data)
- [ ] Governance audit log contains entries for all tested actions

**Tests:**
- This IS the test suite. 15-20 test cases covering all Phase 1 deliverables.

---

## Parallel Execution Guide

```
Track A (Memory Layers):   1-01, 1-02, 1-03 (all independent) → 1-04 (needs all three)
Track B (Governance):      1-05 → 1-06
Track C (Persistence):     1-08 → 1-09

Convergence:               1-07 (needs Track A + Track B)
Final:                     1-10 (needs ALL)
```

**Maximum parallelism:** 3 agents — one per track.
