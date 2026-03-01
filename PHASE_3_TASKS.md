# Phase 3 — Worlds System: Isolation, Management & Templates

**Parent:** [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) v2.0, Phase 3
**Goal:** Implement World isolation, management, templates, snapshots, and cross-World navigation.
**Depends on:** Phase 2 (Session Lifecycle)
**Exit Criteria:** Can create multiple isolated Worlds (including from templates), switch between them safely, snapshot and restore World state.

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| World CRUD (create, get, update, delete, list, archive) | COMPLETE | `WorldService` fully functional |
| World types & Zod schemas | COMPLETE | `types.ts` — World, WorldConfig, WorldTelos, WorldTemplate, input schemas |
| DB schema (worlds, world_config, world_state, world_telos, world_templates) | COMPLETE | 5 tables in `packages/db/src/schema/world.ts` |
| World Telos repository (Drizzle) | COMPLETE | `DrizzleWorldTelosRepository` — get/set/delete |
| World Config repository (Drizzle) | COMPLETE | `DrizzleWorldConfigRepository` — get/set/delete with JSON serialization |
| World activation/deactivation | IMPLEMENTED | `WorldService.activate()` / `deactivate()` — basic, no session cleanup |
| World cloning | IMPLEMENTED | `WorldService.cloneWorld()` — copies telos + config, fresh L2 |
| World Templates (TemplateService) | IMPLEMENTED | In-memory repository, seed defaults, `createFromTemplate()` works |
| WorldManager (local control panel) | SCAFFOLDED | Placeholder methods: `getIdentity()`, `getAgents()`, `getThreads()`, `getRecentState()` |
| World-scoped L2 isolation | NOT ENFORCED | L2EpisodicLayer takes worldId but queries not verified as world-scoped |
| Cross-World navigation | NOT IMPLEMENTED | No safe context switch mechanism |
| World state snapshots | NOT IMPLEMENTED | `world_state` table exists, no serialize/deserialize logic |
| Template governance integration | NOT IMPLEMENTED | Templates not wired to A0 or META |
| Telos L4 integration | NOT IMPLEMENTED | WorldManager.getIdentity() returns hardcoded placeholder |

---

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 3-01 | Harden WorldManager — replace placeholders with real implementations | 3h | — | TODO |
| 3-02 | Wire World Telos to L4 layer | 3h | — | TODO |
| 3-03 | Enforce World-scoped L2 isolation | 4h | — | TODO |
| 3-04 | World activation lifecycle with session cleanup | 3h | 3-01 | TODO |
| 3-05 | Cross-World navigation with safe context switch | 4h | 3-04 | TODO |
| 3-06 | World state snapshots (serialize/deserialize) | 4h | 3-03 | TODO |
| 3-07 | Wire World Templates to governance and Drizzle persistence | 3h | 3-02 | TODO |
| 3-08 | Add governance checks to World operations | 3h | 3-07 | TODO |
| 3-09 | Phase 3 integration tests | 3h | ALL | TODO |

**Total estimated effort:** ~30 hours

---

## Task Details

### 3-01: Harden WorldManager — Replace Placeholders with Real Implementations

**Priority:** P0
**Assignee:** Any
**Feature IDs:** WD-03
**Files:**
- `packages/core/src/world/WorldManager.ts` — replace all placeholder methods
- `packages/core/src/world/repository.ts` — extend `IWorldConfigRepository` if needed for agent/thread queries
- `packages/core/src/world/types.ts` — add `WorldRuntimeInfo` interface
- `packages/core/src/world/WorldManager.test.ts` — rewrite tests for real implementations

**Scope:**
1. `getIdentity()` — read from `IWorldTelosRepository.get(worldId)`, return telos content string (wire to real L4 in 3-02)
2. `getAgents()` — read from `IWorldConfigRepository.get(worldId)`, extract `allowedAgents` from config
3. `getThreads()` — read from `world_state` table via a new `IWorldStateRepository` interface, return `activeThreads`
4. `getRecentState()` — query L2EpisodicLayer for recent session summaries scoped to `worldId`
5. Add constructor dependencies: `IWorldTelosRepository`, `IWorldConfigRepository`, `IWorldStateRepository`
6. Add `getConfig()` method returning full `WorldConfig` for the World
7. Add `getStatus()` method returning `WorldStatus` and last-active timestamp

**Acceptance Criteria:**
- [ ] `getIdentity()` returns real telos content from the database (not a placeholder string)
- [ ] `getAgents()` returns the `allowedAgents` array from the World's config record
- [ ] `getThreads()` returns active thread IDs from the `world_state` table
- [ ] `getRecentState()` returns recent L2 summaries scoped to this World
- [ ] `getConfig()` returns the full `WorldConfig` object
- [ ] All methods throw a descriptive error if the World does not exist
- [ ] No placeholder strings remain in `WorldManager`

**Tests:**
- Unit: `getIdentity()` returns telos content from mock repository
- Unit: `getAgents()` returns agents from mock config repository
- Unit: `getThreads()` returns threads from mock state repository
- Unit: All methods throw when world not found
- Unit: `getConfig()` returns full config object

---

### 3-02: Wire World Telos to L4 Layer

**Priority:** P0
**Assignee:** Any
**Feature IDs:** WD-02
**Files:**
- `packages/core/src/memory/layers.ts` — enhance `L4TelosLayer` to support world telos reads
- `packages/core/src/world/WorldManager.ts` — update `getIdentity()` to use L4TelosLayer
- `packages/core/src/world/DrizzleWorldTelosRepository.ts` — add versioning support (append-only writes)
- `packages/core/src/world/repository.ts` — add `getHistory(worldId): Promise<WorldTelos[]>` to `IWorldTelosRepository`
- `packages/db/src/schema/world.ts` — add `version` column to `world_telos` if not present
- `packages/core/src/__tests__/world/telos-l4.test.ts` — new test file

**Scope:**
1. World Telos is an L4 artifact — reads are free, writes require Operator authorization
2. Modify `DrizzleWorldTelosRepository.set()` to append new version instead of overwriting
3. Add `getHistory(worldId)` to retrieve all historical telos versions
4. Integrate with `L4TelosLayer` so `L4TelosLayer.read('world', worldId)` delegates to `IWorldTelosRepository`
5. Telos writes must pass through A0 governance check before persisting
6. Add `version: number` field to `WorldTelos` interface

**Acceptance Criteria:**
- [ ] `L4TelosLayer.read('world', worldId)` returns telos content from `DrizzleWorldTelosRepository`
- [ ] Telos writes create a new version record (old versions are preserved, not overwritten)
- [ ] `getHistory(worldId)` returns all versions in chronological order
- [ ] Telos write without Operator authorization throws `TelosImmutabilityError`
- [ ] WorldManager.getIdentity() uses L4TelosLayer under the hood
- [ ] Version number auto-increments on each write

**Tests:**
- Unit: Read returns latest telos content from repository
- Unit: Write creates new version, preserves old
- Unit: getHistory returns all versions
- Unit: Unauthorized write throws TelosImmutabilityError
- Unit: Version numbers increment correctly

---

### 3-03: Enforce World-Scoped L2 Isolation

**Priority:** P0
**Assignee:** Any
**Feature IDs:** WD-04
**Files:**
- `packages/core/src/memory/layers.ts` — audit `L2EpisodicLayer` for world-scoping
- `packages/core/src/session/SessionService.ts` — verify `worldId` propagation to L2
- `packages/core/src/session/repository.ts` — audit `ISessionRepository` queries for world-scoping
- `packages/core/src/session/DrizzleSessionRepository.ts` — add world-scoped query methods
- `packages/core/src/world/WorldBoundary.ts` — new file: world-scoping guard utility
- `packages/core/src/__tests__/world/l2-isolation.test.ts` — new test file

**Scope:**
1. Audit every L2 read/write path to confirm `worldId` is a mandatory parameter
2. Create `WorldBoundary` utility class that wraps any query with world-scoping:
   - `WorldBoundary.enforce(worldId, query)` — ensures the `worldId` filter is always applied
   - Throws `WorldIsolationViolationError` if `worldId` is null/undefined
3. Modify `L2EpisodicLayer` to reject any operation without a valid `worldId`
4. Modify `SessionService` to pass `worldId` through all L2 interactions
5. Add world-scoped variants of session queries: `getSessionsByWorld(worldId)`, `getSummariesByWorld(worldId)`
6. Verify that `DrizzleSessionRepository` always includes `WHERE world_id = ?` in queries

**Acceptance Criteria:**
- [ ] Every L2 read operation requires a `worldId` parameter
- [ ] Every L2 write operation requires a `worldId` parameter
- [ ] Attempting an L2 operation with null/undefined worldId throws `WorldIsolationViolationError`
- [ ] Sessions from World A are not returned when querying World B
- [ ] `WorldBoundary.enforce()` utility is used in all world-scoped query paths
- [ ] DrizzleSessionRepository queries always include `world_id` filter

**Tests:**
- Unit: L2 write without worldId throws WorldIsolationViolationError
- Unit: L2 read without worldId throws WorldIsolationViolationError
- Unit: WorldBoundary.enforce rejects null worldId
- Unit: Two worlds with separate data — querying one returns only its data
- Integration: Create sessions in two Worlds, verify isolation

---

### 3-04: World Activation Lifecycle with Session Cleanup

**Priority:** P1
**Assignee:** Any
**Depends on:** 3-01
**Feature IDs:** WD-01, WD-03
**Files:**
- `packages/core/src/world/WorldService.ts` — enhance `activate()` and `deactivate()`
- `packages/core/src/world/types.ts` — add `WorldActivationResult` interface
- `packages/core/src/session/SessionService.ts` — add `closeAllForWorld(worldId)` method
- `packages/core/src/session/repository.ts` — add `getActiveByWorld(worldId)` to `ISessionRepository`
- `packages/core/src/world/WorldManager.ts` — add `isActive()` method
- `packages/core/src/__tests__/world/activation.test.ts` — new test file

**Scope:**
1. **Activation** must:
   - Verify the World exists and is not ARCHIVED
   - Close or suspend any active sessions in the previously active World
   - Initialize the `world_state` record (set `last_active`, clear `active_threads`)
   - Load the World's L3 config into the runtime context
   - Return a `WorldActivationResult` with status and any warnings
2. **Deactivation** must:
   - Close or checkpoint all active sessions in the World
   - Persist final `world_state` (last_active timestamp, flush active_threads)
   - Clear any L1 data associated with the World
   - Set status to DORMANT
3. **Edge cases:**
   - Activating an already-active World is a no-op (return success)
   - Deactivating an inactive World is a no-op
   - Activation while sessions are mid-flight: force-close with checkpoint

**Acceptance Criteria:**
- [ ] `activate(id)` closes sessions in the previously active World before switching
- [ ] `activate(id)` initializes `world_state` record with current timestamp
- [ ] `deactivate(id)` closes or checkpoints all active sessions
- [ ] `deactivate(id)` persists final world state to DB
- [ ] `deactivate(id)` flushes L1 data for the World
- [ ] Activating an archived World throws a descriptive error
- [ ] Re-activating the already-active World returns success without side effects
- [ ] `WorldActivationResult` includes activation status and any warnings

**Tests:**
- Unit: Activate sets status to ACTIVE and creates world_state record
- Unit: Activate deactivates previously active World
- Unit: Deactivate closes active sessions
- Unit: Deactivate sets status to DORMANT
- Unit: Activate archived World throws error
- Unit: Re-activation is idempotent

---

### 3-05: Cross-World Navigation with Safe Context Switch

**Priority:** P1
**Assignee:** Any
**Depends on:** 3-04
**Feature IDs:** WD-05
**Files:**
- `packages/core/src/world/WorldNavigator.ts` — new file: cross-world navigation controller
- `packages/core/src/world/types.ts` — add `NavigationRequest`, `NavigationResult` interfaces
- `packages/core/src/world/WorldService.ts` — add `switchTo(targetWorldId)` method delegating to Navigator
- `packages/core/src/memory/layers.ts` — add `flush()` / `loadForWorld()` methods on L1
- `packages/core/src/__tests__/world/navigation.test.ts` — new test file

**Scope:**
1. Create `WorldNavigator` class responsible for orchestrating a safe World switch:
   - **Pre-switch:** Validate target World exists and is not ARCHIVED
   - **Checkpoint:** Save current session state (if any active session)
   - **Flush:** Clear L1 active memory for the source World
   - **Deactivate:** Deactivate source World (delegates to `WorldService.deactivate()`)
   - **Activate:** Activate target World (delegates to `WorldService.activate()`)
   - **Load:** Load target World's L3 config and L4 telos into context
   - **Resume:** If the target World had a suspended session, offer to resume it
2. Navigation is atomic — if any step fails, roll back to the source World
3. `NavigationResult` reports: `success`, `sourceWorldId`, `targetWorldId`, `sessionSuspended`, `sessionResumed`, `warnings`
4. Emit `WORLD_SWITCHED` event with source and target IDs

**Acceptance Criteria:**
- [ ] `WorldNavigator.switchTo(targetWorldId)` performs a complete context switch
- [ ] L1 memory from the source World is flushed before activating the target
- [ ] Active session in the source World is checkpointed (not lost)
- [ ] Target World's L3/L4 context is loaded after activation
- [ ] Navigation to a non-existent World throws a descriptive error
- [ ] Navigation to an ARCHIVED World throws a descriptive error
- [ ] If activation of the target fails, the source World remains active (rollback)
- [ ] `NavigationResult` includes full status and any warnings
- [ ] `WORLD_SWITCHED` event is emitted on success

**Tests:**
- Unit: Switch from World A to World B — A deactivated, B activated
- Unit: L1 flushed during switch
- Unit: Active session checkpointed during switch
- Unit: Switch to non-existent World throws error
- Unit: Switch to archived World throws error
- Unit: Failed activation rolls back to source World
- Unit: NavigationResult populated correctly

---

### 3-06: World State Snapshots (Serialize/Deserialize)

**Priority:** P2
**Assignee:** Any
**Depends on:** 3-03
**Feature IDs:** WD-06
**Files:**
- `packages/core/src/world/WorldSnapshot.ts` — new file: snapshot service
- `packages/core/src/world/types.ts` — add `WorldSnapshot`, `SnapshotMetadata` interfaces
- `packages/core/src/world/repository.ts` — add `IWorldSnapshotRepository` interface
- `packages/core/src/world/DrizzleWorldSnapshotRepository.ts` — new file: Drizzle implementation
- `packages/db/src/schema/world.ts` — add `world_snapshots` table
- `packages/core/src/__tests__/world/snapshot.test.ts` — new test file

**Scope:**
1. **Snapshot creation:**
   - Serialize: World record, WorldConfig, WorldTelos, WorldState, L2 summaries (scoped)
   - Store as a single JSON blob with a `version` and `createdAt` timestamp
   - Assign a snapshot ID and optional label (e.g., "before-migration", "weekly-backup")
2. **Snapshot restoration:**
   - Deserialize snapshot JSON → recreate World, Config, Telos, and State records
   - Restoration creates a *new* World (does not overwrite the original)
   - L2 data from the snapshot is imported into the new World's scope
3. **Snapshot listing:**
   - `listSnapshots(worldId)` — returns all snapshots for a World
   - `getSnapshot(snapshotId)` — returns full snapshot data
4. **Snapshot deletion:**
   - `deleteSnapshot(snapshotId)` — removes a snapshot record
5. Add `world_snapshots` table: `id`, `world_id`, `label`, `data` (JSON text), `created_at`

**Acceptance Criteria:**
- [ ] `createSnapshot(worldId, label)` serializes World + Config + Telos + State + L2 into JSON
- [ ] `restoreSnapshot(snapshotId, newName)` creates a new World from the snapshot
- [ ] Restored World has its own ID (not the original's)
- [ ] L2 data in the restored World is scoped to the new World ID
- [ ] `listSnapshots(worldId)` returns all snapshots sorted by creation date
- [ ] `deleteSnapshot(snapshotId)` removes the snapshot from the database
- [ ] Snapshot data includes a schema version for future migration compatibility

**Tests:**
- Unit: createSnapshot serializes all world components
- Unit: restoreSnapshot creates a new World with correct data
- Unit: Restored World has a unique ID
- Unit: L2 data re-scoped to new World ID after restore
- Unit: listSnapshots returns snapshots in chronological order
- Unit: deleteSnapshot removes the record

---

### 3-07: Wire World Templates to Governance and Drizzle Persistence

**Priority:** P1
**Assignee:** Any
**Depends on:** 3-02
**Feature IDs:** WD-07, WD-08
**Files:**
- `packages/core/src/world/TemplateService.ts` — add governance checks, wire to Drizzle repository
- `packages/core/src/world/DrizzleTemplateRepository.ts` — new file: Drizzle implementation of `ITemplateRepository`
- `packages/core/src/world/repository.ts` — add `update` and `delete` methods to `ITemplateRepository`
- `packages/core/src/world/types.ts` — add `CreateTemplateInput` schema, `UpdateTemplateInput` schema
- `packages/core/src/world/WorldService.ts` — validate template instantiation wires telos to L4
- `packages/core/src/world/TemplateService.test.ts` — update tests for governance and Drizzle

**Scope:**
1. **Drizzle persistence:** Replace `InMemoryTemplateRepository` with `DrizzleTemplateRepository` backed by `world_templates` table
2. **Full CRUD:** Add `update(id, data)` and `delete(id)` to `ITemplateRepository` and implement in Drizzle
3. **Governance integration:**
   - Template creation requires Operator authorization (A0 check)
   - Template deletion requires Operator authorization
   - Template instantiation (`createFromTemplate`) logs an audit event via A0
4. **Validation:** Add `CreateTemplateInputSchema` and `UpdateTemplateInputSchema` with Zod
5. **Template instantiation hardening:**
   - Verify that `createFromTemplate` correctly writes telos via L4 layer (not just raw repository)
   - Verify that config is written via proper governance-checked path
6. **Clone World with fresh L2:** Verify `cloneWorld()` does NOT copy L2 data (fresh episodic memory)

**Acceptance Criteria:**
- [ ] `DrizzleTemplateRepository` persists templates to SQLite via `world_templates` table
- [ ] Template create/update/delete require Operator authorization via A0
- [ ] `createFromTemplate()` writes telos through the L4 governance-checked path
- [ ] `createFromTemplate()` writes config through the governance-checked path
- [ ] `cloneWorld()` creates a new World with copied telos/config but empty L2
- [ ] Zod schemas validate template input (name length, required fields)
- [ ] `seedDefaults()` works with Drizzle repository (not just in-memory)

**Tests:**
- Unit: DrizzleTemplateRepository CRUD operations
- Unit: Template creation without Operator auth throws
- Unit: createFromTemplate writes telos via L4 path
- Unit: cloneWorld has empty L2 in the new World
- Unit: Zod validation rejects invalid template input
- Unit: seedDefaults populates default templates in DB

---

### 3-08: Add Governance Checks to World Operations

**Priority:** P1
**Assignee:** Any
**Depends on:** 3-07
**Feature IDs:** WD-01, WD-03
**Files:**
- `packages/core/src/world/WorldService.ts` — wire A0 enforcement into create, update, delete, activate, deactivate
- `packages/core/src/governance/rules.ts` — add World-specific governance rules (if rules engine from Phase 1 exists)
- `packages/core/src/governance/a0.ts` — verify `A0Enforcer.enforce()` handles World action types
- `packages/core/src/world/types.ts` — add `WorldAction` enum for governance action types
- `packages/core/src/__tests__/world/governance.test.ts` — new test file

**Scope:**
1. Define `WorldAction` enum: `WORLD_CREATE`, `WORLD_UPDATE`, `WORLD_DELETE`, `WORLD_ACTIVATE`, `WORLD_DEACTIVATE`, `WORLD_CLONE`, `WORLD_SNAPSHOT`
2. Wire `A0Enforcer.enforce(action, context)` into every mutating WorldService method:
   - `create()` — `WORLD_CREATE` check
   - `update()` — `WORLD_UPDATE` check
   - `delete()` — `WORLD_DELETE` check (requires Operator confirmation)
   - `activate()` / `deactivate()` — `WORLD_ACTIVATE` / `WORLD_DEACTIVATE` checks
   - `cloneWorld()` — `WORLD_CLONE` check
3. Add governance rules:
   - `WORLD_DELETE_REQUIRES_OPERATOR` — block World deletion without Operator context
   - `WORLD_ACTIVATE_NOT_ARCHIVED` — block activation of archived Worlds (already enforced, formalize as rule)
   - `WORLD_ISOLATION` — block operations that reference a different World's data
4. All governance denials throw `GovernanceDeniedError` with the violated rule name and context

**Acceptance Criteria:**
- [ ] Every mutating WorldService method calls `A0Enforcer.enforce()` before proceeding
- [ ] World deletion without Operator context is denied by governance
- [ ] World activation of an archived World is denied by governance rule (not just code)
- [ ] All governance denials throw `GovernanceDeniedError` with rule name and human-readable message
- [ ] Governance decisions (allow and deny) are logged to the audit trail
- [ ] In permissive mode, violations are logged but operations proceed

**Tests:**
- Unit: World creation passes governance check with valid context
- Unit: World deletion without Operator context denied
- Unit: World activation of archived World denied by rule
- Unit: Governance denial includes rule name in error
- Unit: Permissive mode logs but allows
- Unit: Audit trail contains entries for all tested operations

---

### 3-09: Phase 3 Integration Tests

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL above
**Feature IDs:** All WD-01 through WD-08
**Files:**
- `packages/core/src/__tests__/integration/phase3.test.ts` — new integration test suite

**Scope:**
Comprehensive tests validating Phase 3 exit criteria:

1. **World lifecycle:** Create World → Activate → Deactivate → Archive → Verify status transitions
2. **Template instantiation:** Create from template → Verify telos/config copied → Verify L2 is empty
3. **World cloning:** Clone World → Verify telos/config copied → Verify L2 is fresh
4. **L2 isolation:** Create 2 Worlds → Write L2 data in each → Verify cross-world queries return empty
5. **Cross-World navigation:** Activate World A → Create session → Switch to World B → Verify A's session checkpointed → Verify B is now active → Switch back to A → Verify session resumable
6. **Snapshots:** Create World → Add data → Snapshot → Modify World → Restore from snapshot → Verify restored state matches snapshot
7. **Governance:** Attempt unauthorized World delete → Verify blocked → Attempt with Operator auth → Verify allowed
8. **Telos versioning:** Write telos → Overwrite telos → Verify both versions exist in history
9. **WorldManager:** Activate World → Use WorldManager to read identity, agents, threads → Verify real data returned

**Acceptance Criteria:**
- [ ] All integration tests pass
- [ ] At least 15 test cases covering all Phase 3 deliverables
- [ ] Zero cross-world data leaks in isolation tests
- [ ] World navigation round-trip succeeds without data loss
- [ ] Snapshot restore produces a functional World
- [ ] Governance blocks unauthorized operations
- [ ] Telos history is preserved across writes

**Tests:**
- This IS the test suite. 15-20 test cases covering all Phase 3 deliverables.

---

## Parallel Execution Guide

```
Track A (World Core):        3-01 (Harden WorldManager) → 3-04 (Activation Lifecycle) → 3-05 (Cross-World Navigation)
Track B (Memory & Telos):    3-02 (Wire Telos to L4) → 3-07 (Templates + Governance) → 3-08 (Governance Checks)
Track C (Isolation & State):  3-03 (L2 Isolation) → 3-06 (Snapshots)

Convergence:                 3-09 (Integration Tests — needs ALL)
```

**Maximum parallelism:** 3 agents — one per track.

**Dependency graph:**
```
3-01 ──────→ 3-04 ──→ 3-05 ──┐
3-02 ──→ 3-07 ──→ 3-08 ──────┤
3-03 ──────→ 3-06 ────────────┼──→ 3-09
                              │
```
