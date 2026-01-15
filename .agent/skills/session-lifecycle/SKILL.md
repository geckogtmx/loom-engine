---
name: session-lifecycle
description: Implements Session state machine, checkpointing, and recovery for LOOM Engine. Use this skill when working on session initialization, Session Intent Envelope (SIE) sealing, L2 checkpointing, crash recovery, session summarization, or the L4→L3→L1 load sequence. Essential for Phase 2 Session Lifecycle work.
---

# Session Lifecycle

This skill guides implementation of LOOM's session state machine and crash resilience.

## Session States

```typescript
type SessionState =
  | 'pending'      // Created, not started
  | 'initializing' // Loading L4 → L3 → L1
  | 'primacy'      // Primacy Expansion phase
  | 'active'       // Pattern execution
  | 'summarizing'  // Generating L2 summary
  | 'closed'       // Successfully completed
  | 'failed';      // Error state
```

## State Machine

```
┌─────────┐
│ pending │
└────┬────┘
     │ start()
     ▼
┌─────────────┐
│ initializing │──── error ────┐
└──────┬──────┘                │
       │ loaded                │
       ▼                       ▼
┌─────────┐               ┌────────┐
│ primacy │──── error ───▶│ failed │
└────┬────┘               └────────┘
     │ sealSIE()               ▲
     ▼                         │
┌─────────┐                    │
│ active  │──── error ─────────┤
└────┬────┘                    │
     │ complete()              │
     ▼                         │
┌─────────────┐                │
│ summarizing │──── error ─────┘
└──────┬──────┘
       │ saved
       ▼
┌─────────┐
│ closed  │
└─────────┘
```

## Session State Machine Implementation

```typescript
class SessionStateMachine {
  private state: SessionState = 'pending';
  private readonly events = new EventEmitter();

  private readonly validTransitions: Record<SessionState, SessionState[]> = {
    pending: ['initializing'],
    initializing: ['primacy', 'failed'],
    primacy: ['active', 'failed'],
    active: ['summarizing', 'failed'],
    summarizing: ['closed', 'failed'],
    closed: [],
    failed: [],
  };

  transition(to: SessionState): void {
    if (!this.validTransitions[this.state].includes(to)) {
      throw new InvalidTransitionError(
        `Cannot transition from ${this.state} to ${to}`
      );
    }

    const from = this.state;
    this.state = to;
    this.events.emit('transition', { from, to });
  }

  canTransition(to: SessionState): boolean {
    return this.validTransitions[this.state].includes(to);
  }

  getState(): SessionState {
    return this.state;
  }

  onTransition(handler: (event: TransitionEvent) => void): void {
    this.events.on('transition', handler);
  }
}
```

## Session Service

```typescript
class SessionService {
  async createSession(worldId: string): Promise<Session> {
    const session: Session = {
      id: generateId(),
      worldId,
      status: 'pending',
      createdAt: new Date(),
    };

    await db.insert(sessions).values(session);
    return session;
  }

  async startSession(sessionId: string): Promise<L1ActiveMemory> {
    const session = await this.getSession(sessionId);
    const stateMachine = new SessionStateMachine();

    // Transition: pending → initializing
    stateMachine.transition('initializing');
    await this.updateStatus(sessionId, 'initializing');

    try {
      // Load L4 → L3 → L1
      const l1 = await this.loadSessionContext(session.worldId);

      // Transition: initializing → primacy
      stateMachine.transition('primacy');
      await this.updateStatus(sessionId, 'primacy');

      return l1;
    } catch (error) {
      stateMachine.transition('failed');
      await this.updateStatus(sessionId, 'failed');
      throw error;
    }
  }

  private async loadSessionContext(worldId: string): Promise<L1ActiveMemory> {
    const l1 = new L1ActiveMemory();

    // Step 1: Load L4 Telos
    const operatorTelos = await l4Store.getOperatorTelos();
    const worldTelos = await l4Store.getWorldTelos(worldId);
    l1.set('operatorTelos', operatorTelos);
    l1.set('worldTelos', worldTelos);

    // Step 2: Load L3 Knowledge
    const world = await l3Store.getWorld(worldId);
    const agents = await l3Store.listAgentsForWorld(worldId);
    const patterns = await l3Store.listPatternsForWorld(worldId);
    l1.set('world', world);
    l1.set('agents', agents);
    l1.set('patterns', patterns);

    // Step 3: Load L2 Recent Context
    const recentSummaries = await l2Store.getSessionSummaries(worldId, 5);
    l1.set('recentContext', recentSummaries);

    return l1;
  }
}
```

## Session Intent Envelope (SIE)

Created during Primacy, immutable after sealing:

```typescript
interface SessionIntentEnvelope {
  id: string;
  sessionId: string;
  patternId: string;

  goal: string;
  constraints: string[];
  audience: string;
  scopeBoundaries: string[];
  successCriteria: string[];

  createdAt: Date;
  sealedAt?: Date;
}

class SIEManager {
  private sie: SessionIntentEnvelope | null = null;

  create(sessionId: string, patternId: string): SessionIntentEnvelope {
    this.sie = {
      id: generateId(),
      sessionId,
      patternId,
      goal: '',
      constraints: [],
      audience: '',
      scopeBoundaries: [],
      successCriteria: [],
      createdAt: new Date(),
    };
    return this.sie;
  }

  update(updates: Partial<SessionIntentEnvelope>): void {
    if (this.sie?.sealedAt) {
      throw new SIESealedError('Cannot update sealed SIE');
    }
    this.sie = { ...this.sie!, ...updates };
  }

  seal(): SessionIntentEnvelope {
    if (!this.sie) throw new Error('No SIE to seal');
    if (this.sie.sealedAt) throw new SIESealedError('Already sealed');

    // Validate completeness
    if (!this.sie.goal) throw new SIEIncompleteError('Goal required');

    this.sie.sealedAt = new Date();
    return this.sie;
  }

  isSealed(): boolean {
    return !!this.sie?.sealedAt;
  }
}
```

## Incremental L2 Checkpointing

Checkpoints provide crash resilience:

```typescript
interface Checkpoint {
  id: string;
  sessionId: string;
  worldId: string;
  type: 'auto' | 'manual' | 'step';

  stepNumber: number;
  partialSummary: string;
  l1Snapshot: Record<string, unknown>;

  createdAt: Date;
}

class CheckpointService {
  private readonly AUTO_CHECKPOINT_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
  private readonly STEP_CHECKPOINT_INTERVAL = 5; // Every 5 steps

  private timer: NodeJS.Timeout | null = null;
  private stepCount = 0;

  startAutoCheckpointing(session: Session, l1: L1ActiveMemory): void {
    this.timer = setInterval(async () => {
      await this.createCheckpoint(session, l1, 'auto');
    }, this.AUTO_CHECKPOINT_INTERVAL_MS);
  }

  stopAutoCheckpointing(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async onStepComplete(session: Session, l1: L1ActiveMemory): Promise<void> {
    this.stepCount++;
    if (this.stepCount % this.STEP_CHECKPOINT_INTERVAL === 0) {
      await this.createCheckpoint(session, l1, 'step');
    }
  }

  async createCheckpoint(
    session: Session,
    l1: L1ActiveMemory,
    type: 'auto' | 'manual' | 'step'
  ): Promise<Checkpoint> {
    const checkpoint: Checkpoint = {
      id: generateId(),
      sessionId: session.id,
      worldId: session.worldId,
      type,
      stepNumber: this.stepCount,
      partialSummary: await this.generatePartialSummary(l1),
      l1Snapshot: l1.snapshot(),
      createdAt: new Date(),
    };

    await db.insert(checkpoints).values(checkpoint);
    return checkpoint;
  }

  async getLatestCheckpoint(sessionId: string): Promise<Checkpoint | null> {
    const [checkpoint] = await db.select()
      .from(checkpoints)
      .where(eq(checkpoints.sessionId, sessionId))
      .orderBy(desc(checkpoints.createdAt))
      .limit(1);

    return checkpoint ?? null;
  }
}
```

## Session Recovery

Handle incomplete sessions on startup:

```typescript
class SessionRecoveryService {
  async checkForIncompleteSessions(): Promise<IncompleteSession[]> {
    const incomplete = await db.select()
      .from(sessions)
      .where(
        and(
          not(eq(sessions.status, 'closed')),
          not(eq(sessions.status, 'failed'))
        )
      );

    return incomplete.map(s => ({
      session: s,
      hasCheckpoint: false, // Will check
    }));
  }

  async recoverSession(
    sessionId: string,
    option: RecoveryOption
  ): Promise<RecoveryResult> {
    const session = await this.getSession(sessionId);
    const checkpoint = await this.checkpointService.getLatestCheckpoint(sessionId);

    switch (option) {
      case 'resume':
        if (!checkpoint) {
          throw new NoCheckpointError('No checkpoint available');
        }
        return this.resumeFromCheckpoint(session, checkpoint);

      case 'summarize-partial':
        return this.summarizePartial(session, checkpoint);

      case 'discard':
        return this.discardSession(session);
    }
  }

  private async resumeFromCheckpoint(
    session: Session,
    checkpoint: Checkpoint
  ): Promise<RecoveryResult> {
    // Restore L1 from checkpoint
    const l1 = new L1ActiveMemory();
    l1.restore(checkpoint.l1Snapshot);

    // Update session status
    await this.updateStatus(session.id, 'active');

    return {
      type: 'resumed',
      session,
      l1,
      resumedFromStep: checkpoint.stepNumber,
    };
  }

  private async summarizePartial(
    session: Session,
    checkpoint: Checkpoint | null
  ): Promise<RecoveryResult> {
    const partialSummary = checkpoint?.partialSummary ??
      'Session incomplete - no checkpoint available';

    // Write partial summary to L2
    await l2Store.appendSessionSummary(session.worldId, {
      sessionId: session.id,
      type: 'partial',
      content: partialSummary,
      note: 'Recovered from incomplete session',
    });

    await this.updateStatus(session.id, 'closed');

    return { type: 'summarized-partial', session };
  }
}

type RecoveryOption = 'resume' | 'summarize-partial' | 'discard';
```

## Continuity Artifact Format

Structured L2 summary schema:

```typescript
interface ContinuityArtifact {
  sessionId: string;
  worldId: string;
  patternId: string;

  // Core content
  summary: string;
  decisions: Decision[];
  stateChanges: StateChange[];

  // For next session
  openQuestions: string[];
  nextSteps: string[];

  // Metadata
  sieReference: string;
  checkpointCount: number;
  completionStatus: 'full' | 'partial' | 'aborted';

  createdAt: Date;
}

async function generateContinuityArtifact(
  session: Session,
  l1: L1ActiveMemory
): Promise<ContinuityArtifact> {
  return {
    sessionId: session.id,
    worldId: session.worldId,
    patternId: session.patternId ?? '',

    summary: await summarizeSession(l1),
    decisions: l1.get('decisions') ?? [],
    stateChanges: l1.get('stateChanges') ?? [],

    openQuestions: l1.get('openQuestions') ?? [],
    nextSteps: l1.get('nextSteps') ?? [],

    sieReference: l1.getSIE()?.id ?? '',
    checkpointCount: l1.get('checkpointCount') ?? 0,
    completionStatus: 'full',

    createdAt: new Date(),
  };
}
```

## Testing Session Lifecycle

```typescript
describe('SessionStateMachine', () => {
  it('should follow valid transition path', () => {
    const sm = new SessionStateMachine();

    expect(sm.getState()).toBe('pending');

    sm.transition('initializing');
    expect(sm.getState()).toBe('initializing');

    sm.transition('primacy');
    sm.transition('active');
    sm.transition('summarizing');
    sm.transition('closed');

    expect(sm.getState()).toBe('closed');
  });

  it('should reject invalid transitions', () => {
    const sm = new SessionStateMachine();

    expect(() => sm.transition('active')).toThrow(InvalidTransitionError);
    expect(() => sm.transition('closed')).toThrow(InvalidTransitionError);
  });
});

describe('CheckpointService', () => {
  it('should create checkpoint every N steps', async () => {
    const service = new CheckpointService();
    const session = mockSession();
    const l1 = new L1ActiveMemory();

    // Complete 5 steps
    for (let i = 0; i < 5; i++) {
      await service.onStepComplete(session, l1);
    }

    const checkpoints = await db.select()
      .from(checkpoints)
      .where(eq(checkpoints.sessionId, session.id));

    expect(checkpoints).toHaveLength(1);
    expect(checkpoints[0].type).toBe('step');
  });
});
```
