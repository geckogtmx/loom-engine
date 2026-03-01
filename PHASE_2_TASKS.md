# Phase 2 — Session Lifecycle

**Parent:** [LOOM_DEVELOPMENT_PLAN.md](LOOM_DEVELOPMENT_PLAN.md) v2.0, Phase 2
**Goal:** Implement the complete session lifecycle with crash resilience, intent tracking, and basic context assembly.
**Depends on:** Phase 1 (memory layers persisted, governance enforced)
**Exit Criteria:** Can start, run, checkpoint, recover, and properly close sessions with continuity preserved. Intent tracking captures and monitors operator intent throughout session.

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| SessionStateMachine | IMPLEMENTED | 7 states: PENDING → INITIALIZING → PRIMACY → ACTIVE → SUMMARIZING → CLOSED → FAILED |
| SessionService | SCAFFOLDED | Constructor always creates new ID. No `.load()`. No integration with memory layers. |
| SessionIntentEnvelopeImpl | SCAFFOLDED | Basic structure. No sealing enforcement. No drift detection. |
| CheckpointService | SCAFFOLDED | Service + DrizzleCheckpointRepository exist. Not wired into SessionService. |
| SessionRecoveryService | SCAFFOLDED | Exists but never called. No UI integration. |
| FailureHandler | SCAFFOLDED | Exists but unused. |
| L2 Summary Generation | MISSING | No summary generation on session close |
| Intent Tracking Pipeline | MISSING | SIE exists but no decomposition, drift detection, or verification |
| Context Assembly | PARTIAL | ContextAssembler skeleton exists. Basic version may come from Phase 0.5. |

---

## Task Index

| ID | Task | Est. | Depends On | Status |
|----|------|------|------------|--------|
| 2-01 | Complete SessionStateMachine with full transition validation | 2h | — | TODO |
| 2-02 | Integrate SessionService with persistent memory layers | 4h | Phase 1 | TODO |
| 2-03 | Implement SIE capture and sealing enforcement | 3h | 2-01 | TODO |
| 2-04 | Implement Primacy Expansion phase | 3h | 2-03 | TODO |
| 2-05 | Integrate CheckpointService into SessionService | 3h | 2-02 | TODO |
| 2-06 | Implement L2 Continuity Artifact generation | 4h | 2-02 | TODO |
| 2-07 | Implement session recovery from checkpoints | 3h | 2-05 | TODO |
| 2-08 | Implement FailureHandler integration | 2h | 2-07 | TODO |
| 2-09 | Implement Intent Tracking Pipeline | 4h | 2-03 | TODO |
| 2-10 | Enhance Context Assembly for session lifecycle | 3h | 2-02, Phase 0.5-05 | TODO |
| 2-11 | Session metadata logging (non-content) | 2h | 2-02 | TODO |
| 2-12 | Phase 2 integration tests | 3h | ALL | TODO |

**Total estimated effort:** ~36 hours

---

## Task Details

### 2-01: Complete SessionStateMachine with Full Transition Validation

**Priority:** P0
**Assignee:** Any
**Files:**
- `packages/core/src/session/SessionStateMachine.ts` — enhance
- `packages/core/src/__tests__/session/stateMachine.test.ts` — expand

**Scope:**
The state machine exists but needs hardening:

1. Define all valid transitions explicitly:
   ```
   PENDING → INITIALIZING
   INITIALIZING → PRIMACY
   PRIMACY → ACTIVE (only when SIE sealed)
   ACTIVE → SUMMARIZING
   ACTIVE → FAILED (on error)
   SUMMARIZING → CLOSED
   FAILED → CLOSED (after cleanup)
   Any → FAILED (on unrecoverable error)
   ```
2. Invalid transitions throw `InvalidTransitionError` with current state, attempted state, and reason
3. Each transition emits an event (for logging and UI updates)
4. Add `canTransitionTo(state): boolean` method

**Acceptance Criteria:**
- [ ] All valid transitions succeed
- [ ] All invalid transitions throw with descriptive error
- [ ] PRIMACY → ACTIVE blocked if SIE not sealed
- [ ] Events emitted on every transition
- [ ] `canTransitionTo()` returns correct boolean without side effects

**Tests:**
- Unit: Every valid transition (7 transitions)
- Unit: Every invalid transition (at least 10 invalid pairs)
- Unit: PRIMACY → ACTIVE blocked without sealed SIE
- Unit: Event emission on transition

---

### 2-02: Integrate SessionService with Persistent Memory Layers

**Priority:** P0
**Assignee:** Any
**Depends on:** Phase 1 (layers implemented)
**Files:**
- `packages/core/src/session/SessionService.ts` — major enhancement
- `packages/core/src/memory/LayerCompositionService.ts` — session integration
- `packages/core/src/__tests__/session/sessionService.test.ts` — expand

**Scope:**
1. Session initialization loads layers in order:
   - L4: Load world telos + agent telos (read-only for session)
   - L3: Load world knowledge, patterns, agent profiles
   - L1: Initialize fresh in-memory state
2. Session close writes to layers:
   - L2: Append session summary (continuity artifact)
   - L1: Flush all ephemeral state
3. Add `SessionService.load(sessionId, worldId, repos)` static factory for resumption
4. Wire memory layers as constructor dependencies (dependency injection)

**Acceptance Criteria:**
- [ ] `SessionService.create(worldId, operatorId)` initializes with L4 → L3 → L1 load
- [ ] `SessionService.load(sessionId, worldId)` reconstructs from DB state
- [ ] `session.close()` writes L2 summary and flushes L1
- [ ] Session exposes `getContext()` → assembled L4 + L3 + L2 + L1 content
- [ ] Session respects world isolation (only loads layers for its world)

**Tests:**
- Unit: Create session → layers loaded in correct order
- Unit: Load session → state reconstructed from DB
- Unit: Close session → L2 written, L1 empty
- Integration: Full lifecycle with real DB

---

### 2-03: Implement SIE Capture and Sealing Enforcement

**Priority:** P0
**Assignee:** Any
**Depends on:** 2-01
**Files:**
- `packages/core/src/session/SessionIntentEnvelopeImpl.ts` — enhance
- `packages/core/src/session/types.ts` — SIE types
- `packages/core/src/__tests__/session/sie.test.ts` — new/expand

**Scope:**
1. SIE captures during Primacy phase:
   - `goal`: What does the operator want to accomplish?
   - `constraints`: What are the boundaries?
   - `audience`: Who is this for?
   - `scope`: What's in/out of scope?
2. SIE sealing: once sealed, SIE is immutable for the session duration
3. Sealing gate: Pattern execution blocked until SIE is sealed
4. SIE stored in L1 during session, included in L2 summary on close

**Acceptance Criteria:**
- [ ] `SIE.capture({ goal, constraints, audience, scope })` sets fields
- [ ] `SIE.seal()` locks the envelope — further mutations throw
- [ ] `SIE.isSealed()` returns current seal state
- [ ] `SIE.getGoal()`, `.getConstraints()` etc. return captured values
- [ ] Sealed SIE included in session context for LLM calls
- [ ] Attempting to modify sealed SIE throws `SIEImmutabilityError`

**Tests:**
- Unit: Capture sets all fields
- Unit: Seal locks mutations
- Unit: Modify after seal throws
- Unit: Unseal not possible (no unseal method)

---

### 2-04: Implement Primacy Expansion Phase

**Priority:** P1
**Assignee:** Any
**Depends on:** 2-03
**Files:**
- `packages/core/src/session/PrimacyService.ts` — enhance existing
- `packages/core/src/governance/a0.ts` — add primacy enforcement rule
- `packages/core/src/__tests__/session/primacy.test.ts` — expand

**Scope:**
Primacy Expansion is Phase 0 of every session. During Primacy:

1. **Question-only mode**: AI can only ask clarifying questions
   - No proposals, summaries, or reframing allowed
   - A0 blocks premature framing attempts
2. Operator states expectations without being preshaped by the AI
3. Operator signals "ready to proceed" → SIE is sealed
4. Cannot skip Primacy (must complete or cancel session)
5. Cannot abort mid-Primacy (only cancel entire session)

**Acceptance Criteria:**
- [ ] Session in PRIMACY state only allows clarifying questions from AI
- [ ] AI attempting to propose/summarize during Primacy → blocked by A0
- [ ] Operator can answer questions and provide intent
- [ ] "Ready to proceed" command seals SIE and transitions to ACTIVE
- [ ] Cannot skip Primacy — session must go through it
- [ ] Cancel during Primacy → session transitions to CLOSED (no L2 write)

**Tests:**
- Unit: Primacy blocks non-question AI outputs
- Unit: "Ready to proceed" seals SIE and transitions state
- Unit: Skip attempt throws
- Unit: Cancel during Primacy closes cleanly

---

### 2-05: Integrate CheckpointService into SessionService

**Priority:** P1
**Assignee:** Any
**Depends on:** 2-02
**Files:**
- `packages/core/src/session/CheckpointService.ts` — wire into SessionService
- `packages/core/src/session/SessionService.ts` — add checkpoint triggers
- `packages/core/src/__tests__/session/checkpoint.test.ts` — expand

**Scope:**
1. Define checkpoint triggers:
   - Time-based: every 10 minutes of active session
   - Step-based: after every N pattern steps (configurable, default 3)
   - Manual: Operator `/checkpoint` command
2. Checkpoint captures:
   - Current L1 state (conversation history, working memory)
   - Current pattern step (if executing a pattern)
   - SIE reference
   - Timestamp
3. Checkpoint stored in DB (checkpoints table, already exists)
4. Mark as "draft" (vs. final L2 summary)

**Acceptance Criteria:**
- [ ] Time-based checkpoint triggers after 10 minutes
- [ ] Manual `/checkpoint` command creates checkpoint immediately
- [ ] Checkpoint captures full L1 state
- [ ] Checkpoint stored in DB with session reference
- [ ] Checkpoints marked as draft (distinguishable from final summary)
- [ ] Multiple checkpoints per session supported

**Tests:**
- Unit: Time trigger fires after configured interval
- Unit: Manual trigger creates checkpoint immediately
- Unit: Checkpoint data integrity (all fields present)
- Integration: Create session → wait/trigger → verify checkpoint in DB

---

### 2-06: Implement L2 Continuity Artifact Generation

**Priority:** P0
**Assignee:** Any
**Depends on:** 2-02
**Files:**
- `packages/core/src/session/ContinuityArtifactGenerator.ts` — new service
- `packages/core/src/session/types.ts` — artifact types
- `packages/core/src/__tests__/session/continuity.test.ts` — expand

**Scope:**
When a session closes, generate a structured Continuity Artifact for L2:

```markdown
## Session Summary — {date}
**World:** {world_name}
**Intent:** {SIE goal}
**Duration:** {start_time — end_time}
**Model Used:** {provider/model}

### Decisions Made
- {decision 1}
- {decision 2}

### Key Topics Discussed
- {topic 1}
- {topic 2}

### Open Questions
- {question 1}
- {question 2}

### Next Steps
- {step 1}
- {step 2}

### Session Metrics (non-content)
- Tokens: {in}/{out}
- Cost estimate: ${amount}
- Pattern steps completed: {N}
```

1. Use the LLM to generate the summary from conversation history (L1)
2. Structure the output according to the schema above
3. Store in L2 via `L2EpisodicLayer.appendSummary()`
4. Include SIE reference for intent tracking

**Acceptance Criteria:**
- [ ] Session close generates a structured summary
- [ ] Summary follows the Continuity Artifact format above
- [ ] Summary includes decisions, topics, open questions, next steps
- [ ] Summary stored in L2 (database)
- [ ] Summary includes non-content metrics (tokens, cost, duration)
- [ ] LLM-generated (not hand-coded extraction)

**Tests:**
- Unit: Generator produces valid markdown from mock conversation
- Unit: All required sections present in output
- Integration: Close session → artifact in DB → next session can load it

---

### 2-07: Implement Session Recovery from Checkpoints

**Priority:** P1
**Assignee:** Any
**Depends on:** 2-05
**Files:**
- `packages/core/src/session/SessionRecoveryService.ts` — enhance
- `packages/core/src/session/SessionService.ts` — add recovery path
- `packages/core/src/__tests__/session/recovery.test.ts` — expand

**Scope:**
1. On app startup, detect incomplete sessions (state not CLOSED or FAILED)
2. Present recovery options:
   - **Resume from last checkpoint** — load checkpoint state, continue session
   - **Summarize and close** — generate partial L2 summary, close session
   - **Discard** — flush L1, close session without L2 write
3. Recovery flow:
   - Load checkpoint from DB
   - Reconstruct L1 from checkpoint data
   - Resume session at the checkpoint state
   - Log recovery event

**Acceptance Criteria:**
- [ ] `detectIncompleteSessions()` returns sessions not in CLOSED/FAILED state
- [ ] Resume restores L1 from checkpoint and continues session
- [ ] Summarize-and-close generates partial summary and closes cleanly
- [ ] Discard closes without writing L2
- [ ] Recovery logged in session metadata

**Tests:**
- Unit: Detection finds incomplete sessions
- Unit: Resume restores correct L1 state
- Unit: Summarize-and-close produces valid partial summary
- Chaos: Simulate crash mid-write → restart → recover → verify data integrity

---

### 2-08: Implement FailureHandler Integration

**Priority:** P2
**Assignee:** Any
**Depends on:** 2-07
**Files:**
- `packages/core/src/session/FailureHandler.ts` — enhance
- `packages/core/src/session/SessionService.ts` — wire failure handling
- `packages/core/src/__tests__/session/failure.test.ts` — new tests

**Scope:**
1. Define failure types:
   - `MODEL_TIMEOUT` — LLM call timed out
   - `MODEL_ERROR` — LLM returned an error
   - `TOOL_ERROR` — Agent tool execution failed
   - `NETWORK_FAILURE` — connectivity lost
   - `CRASH` — unexpected exception
2. Handler strategies per type:
   - Timeout → retry with exponential backoff (max 3 retries)
   - Model error → fallback to different provider
   - Tool error → log, continue session without tool result
   - Network → switch to offline mode (Ollama)
   - Crash → checkpoint + transition to FAILED
3. All failures logged (non-content)
4. UI notification on failure

**Acceptance Criteria:**
- [ ] Each failure type has a defined handler
- [ ] Retry with backoff works for timeouts (3 attempts, increasing delay)
- [ ] Provider fallback works (cloud fails → Ollama)
- [ ] Crash triggers checkpoint before FAILED transition
- [ ] All failures logged with type, timestamp, and context
- [ ] FailureHandler returns `{ action: 'retry' | 'fallback' | 'abort', details }`

**Tests:**
- Unit: Timeout → retry 3 times → then abort
- Unit: Network failure → Ollama fallback
- Unit: Crash → checkpoint created before FAILED
- Unit: All failure types produce log entries

---

### 2-09: Implement Intent Tracking Pipeline

**Priority:** P1
**Assignee:** Any
**Depends on:** 2-03
**Files:**
- `packages/core/src/session/IntentTracker.ts` — new service
- `packages/core/src/session/types.ts` — intent tracking types
- `packages/core/src/__tests__/session/intentTracker.test.ts` — new tests

**Scope:**
This is the runtime implementation of Intent Engineering (Section 1.5.2 of the dev plan).

1. **Intent Decomposition:** Break SIE goal into sub-intents
   - "Develop a marketing strategy" → ["Identify target audience", "Define channels", "Set budget", "Create timeline"]
   - Use LLM to decompose (with structured output)
2. **Intent Persistence:** Track original intent through all actions
   - Every LLM call includes SIE goal as context
   - Every Pattern step checks alignment with SIE
3. **Intent Drift Detection:** Alert when execution diverges from SIE
   - After each significant action, score alignment (0-1) against SIE
   - If alignment drops below threshold (0.6), emit drift warning
4. **Intent Verification:** At session end, verify outcomes match intent
   - Compare session summary against SIE goal
   - Flag unmet goals in the Continuity Artifact

**Acceptance Criteria:**
- [ ] `IntentTracker.decompose(sie)` returns structured sub-intents
- [ ] `IntentTracker.checkAlignment(action, sie)` returns alignment score
- [ ] Alignment below threshold emits drift warning event
- [ ] `IntentTracker.verify(summary, sie)` returns verification result
- [ ] Drift warnings are logged and available in session metadata
- [ ] Intent tracking does not block execution (advisory, not gating)

**Tests:**
- Unit: Decompose produces reasonable sub-intents from mock SIE
- Unit: Alignment scoring returns values in 0-1 range
- Unit: Low alignment triggers drift warning
- Unit: Verification flags unmet goals

---

### 2-10: Enhance Context Assembly for Session Lifecycle

**Priority:** P1
**Assignee:** Any
**Depends on:** 2-02, Phase 0.5-05
**Files:**
- `packages/core/src/dispatcher/ContextAssembler.ts` — enhance
- `packages/core/src/__tests__/dispatcher/contextAssembler.test.ts` — expand

**Scope:**
Build on the basic context assembly from Phase 0.5 with session lifecycle awareness:

1. **Session start context:** L4 telos + L3 knowledge + L2 recap from previous sessions
2. **Mid-session context:** L4 + L3 + L2 recap + L1 conversation + SIE + current Pattern step
3. **Primacy context:** L4 + minimal L3 + SIE capture instructions (constrained to questions only)
4. **Summary context:** L4 + L1 full conversation + SIE + structured summary instructions
5. Context varies by session state (Primacy vs Active vs Summarizing)

**Acceptance Criteria:**
- [ ] `assemble(sessionId, state)` returns context appropriate for session state
- [ ] Primacy context includes question-only instructions
- [ ] Active context includes full layer stack + SIE
- [ ] Summary context optimized for summary generation
- [ ] Token budget respected across all states

**Tests:**
- Unit: Primacy context contains question-only constraint
- Unit: Active context includes all 4 layers + SIE
- Unit: Summary context includes full conversation + summary instructions
- Unit: Token budget truncation works for each state

---

### 2-11: Session Metadata Logging (Non-Content)

**Priority:** P2
**Assignee:** Any
**Depends on:** 2-02
**Files:**
- `packages/core/src/session/SessionLogger.ts` — new service
- `packages/db/src/schema/memory.ts` — verify session_logs table
- `packages/core/src/__tests__/session/logger.test.ts` — new tests

**Scope:**
Log non-content metadata for every session:

| Field | Example | Content? |
|-------|---------|----------|
| Start time | 2026-03-01T10:00:00Z | No |
| End time | 2026-03-01T10:45:00Z | No |
| World ID | uuid | No |
| Pattern used | "Structured Discussion" | No |
| Model used | "ollama/llama3" | No |
| Tokens in/out | 1200/800 | No |
| Estimated cost | $0.02 | No |
| Latency (avg) | 450ms | No |
| Checkpoints created | 3 | No |
| Aborts | 0 | No |
| Retries | 1 | No |
| Escalations | 0 | No |
| Local vs cloud | local | No |

**NEVER log:** raw prompts, raw outputs, conversation transcripts, identity data

**Acceptance Criteria:**
- [ ] Every session creates a metadata log entry on close
- [ ] All fields above captured
- [ ] No raw content (prompts/outputs) in logs
- [ ] Logs queryable by world, time range, model
- [ ] Feeds into Observability Dashboard (Phase 8)

**Tests:**
- Unit: Logger captures all required fields
- Unit: Logger rejects attempts to log raw content
- Integration: Session lifecycle → verify log entry in DB

---

### 2-12: Phase 2 Integration Tests

**Priority:** P1
**Assignee:** Any
**Depends on:** ALL above
**Files:**
- `packages/core/src/__tests__/integration/phase2.test.ts` — new integration test suite

**Scope:**
Comprehensive tests validating Phase 2 exit criteria:

1. **Full lifecycle:** Create → Primacy → SIE seal → Active → Chat → Summarize → Close
2. **Checkpoint & Recovery:** Create → Chat → Crash (simulated) → Recover from checkpoint → Continue
3. **Intent Tracking:** Create → Set SIE → Chat that drifts → Verify drift detected
4. **Failure Handling:** Create → Chat → Model timeout → Retry → Success
5. **Context Assembly:** Verify context varies by session state
6. **Layer Persistence:** Close session → start new → verify L2 recap available

**Acceptance Criteria:**
- [ ] All integration tests pass
- [ ] Full lifecycle completes without errors
- [ ] Recovery restores correct state after simulated crash
- [ ] Drift detection fires on off-topic responses
- [ ] Failure retry works end-to-end

**Tests:**
- This IS the test suite. 10-15 test cases covering all Phase 2 deliverables.

---

## Parallel Execution Guide

```
Track A (State Machine + SIE):   2-01 → 2-03 → 2-04
Track B (Memory Integration):    2-02 → 2-05, 2-06, 2-11 (parallel after 2-02)
Track C (Intent + Context):      2-09 (after 2-03), 2-10 (after 2-02)

Recovery chain:                  2-05 → 2-07 → 2-08
Final:                           2-12 (needs ALL)
```

**Maximum parallelism:** 3 agents — Track A (state/SIE/primacy), Track B (persistence/checkpoints), Track C (intent/context).
