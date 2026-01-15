---
name: memory-layer-architect
description: Guides implementation of LOOM's 4-Layer Memory Model (L1-L4). Use this skill when designing storage logic, implementing layer transitions, auditing data flow between layers, or ensuring proper separation between L1 (Active/ephemeral), L2 (Episodic/session logs), L3 (Knowledge/definitions), and L4 (Telos/identity). Critical for Phase 1 Core Engine work.
---

# Memory Layer Architect

This skill provides authoritative guidance on LOOM's 4-Layer Memory Model.

## The 4 Layers

| Layer | Name | Persistence | Scope | Write Access |
|-------|------|-------------|-------|--------------|
| **L4** | Telos | Permanent | Global | Operator ONLY |
| **L3** | Knowledge | Permanent | World | META-governed |
| **L2** | Episodic | Session-scoped | World | Append-mostly |
| **L1** | Active | Ephemeral (RAM) | Session | Any |

## Layer Details

### L4: Telos (Identity Layer)
**Purpose:** Immutable identity kernels that define WHO entities are.

**Contents:**
- `operator_telos` - Operator's core identity and values
- `world_telos` - Each World's purpose and identity
- `agent_telos` - Each Agent's core purpose
- `org_telos` - (Future) Organization identity

**Rules:**
- Read by all, written ONLY by Operator
- Never modified during sessions
- Changes require explicit Operator action outside session flow

```typescript
interface L4Store {
  getOperatorTelos(): Promise<OperatorTelos>;
  getWorldTelos(worldId: string): Promise<WorldTelos>;
  getAgentTelos(agentId: string): Promise<AgentTelos>;
  // NO set methods - writes go through OperatorService
}
```

### L3: Knowledge (Definition Layer)
**Purpose:** Structured definitions that govern behavior.

**Contents:**
- World configurations and constraints
- Agent profiles (PROFILE, MODES, TOOLS)
- Pattern definitions and steps
- META rules

**Rules:**
- World-scoped (most queries need `world_id`)
- Writes require META approval
- Source of truth for "what exists"

```typescript
interface L3Store {
  // Worlds
  getWorld(id: string): Promise<World>;
  listWorlds(): Promise<World[]>;

  // Agents
  getAgent(id: string): Promise<Agent>;
  listAgentsForWorld(worldId: string): Promise<Agent[]>;

  // Patterns
  getPattern(id: string): Promise<Pattern>;
  listPatternsForWorld(worldId: string): Promise<Pattern[]>;

  // All writes require governance context
  createWorld(world: World, governance: GovernanceContext): Promise<void>;
  updateAgent(agent: Agent, governance: GovernanceContext): Promise<void>;
}
```

### L2: Episodic (Session Memory)
**Purpose:** Append-mostly log of what happened in sessions.

**Contents:**
- Session summaries (Continuity Artifacts)
- Decisions made during sessions
- World state deltas
- Checkpoints

**Rules:**
- Strictly World-scoped
- Append-mostly (rarely updated, never deleted)
- Summarized at session end

```typescript
interface L2Store {
  // Always requires worldId
  getSessionSummaries(worldId: string, limit?: number): Promise<SessionSummary[]>;
  getDecisions(worldId: string, sessionId?: string): Promise<Decision[]>;
  getWorldDeltas(worldId: string): Promise<WorldDelta[]>;

  // Append operations
  appendSessionSummary(worldId: string, summary: SessionSummary): Promise<void>;
  appendDecision(worldId: string, decision: Decision): Promise<void>;
  appendCheckpoint(worldId: string, checkpoint: Checkpoint): Promise<void>;
}
```

### L1: Active (Working Memory)
**Purpose:** Ephemeral in-memory state for current session.

**Contents:**
- Loaded context from L4/L3
- Session Intent Envelope (SIE)
- Current Pattern state
- Streaming buffers

**Rules:**
- Lives in RAM only
- Flushed on session close
- Never persisted directly (summarized to L2)

```typescript
class L1ActiveMemory {
  private store = new Map<string, unknown>();

  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;

  // Session lifecycle
  loadFromL4(telos: Telos): void;
  loadFromL3(knowledge: Knowledge): void;
  flush(): void; // Clears all state

  // Special accessors
  getSIE(): SessionIntentEnvelope | undefined;
  sealSIE(sie: SessionIntentEnvelope): void;
}
```

## Session Load Sequence

When a session starts, layers load in order:

```
1. L4 → L1: Load Telos (Operator, World, Agents)
2. L3 → L1: Load Knowledge (World config, Patterns, Agent profiles)
3. L2 → L1: Load Recent Episodic (last N summaries for context)
4. Ready: Session can begin
```

```typescript
async function initializeSession(worldId: string): Promise<L1ActiveMemory> {
  const l1 = new L1ActiveMemory();

  // Step 1: Load L4 Telos
  const operatorTelos = await l4.getOperatorTelos();
  const worldTelos = await l4.getWorldTelos(worldId);
  l1.loadFromL4({ operatorTelos, worldTelos });

  // Step 2: Load L3 Knowledge
  const world = await l3.getWorld(worldId);
  const agents = await l3.listAgentsForWorld(worldId);
  const patterns = await l3.listPatternsForWorld(worldId);
  l1.loadFromL3({ world, agents, patterns });

  // Step 3: Load L2 Episodic (recent context)
  const recentSummaries = await l2.getSessionSummaries(worldId, 5);
  l1.set('recentContext', recentSummaries);

  return l1;
}
```

## Session Close Sequence

When a session ends:

```
1. Generate L2 Summary from L1 state
2. Append Summary to L2 (World-scoped)
3. Flush L1 (clear all ephemeral state)
```

```typescript
async function closeSession(worldId: string, l1: L1ActiveMemory): Promise<void> {
  // Step 1: Generate summary
  const summary = await generateContinuityArtifact(l1);

  // Step 2: Append to L2
  await l2.appendSessionSummary(worldId, summary);

  // Step 3: Flush L1
  l1.flush();
}
```

## Cross-Layer Flow Validation

Use this pattern to validate data flow:

```typescript
function validateLayerFlow(source: Layer, target: Layer, operation: string): boolean {
  const validFlows: Record<string, Layer[]> = {
    'read': ['L4', 'L3', 'L2', 'L1'],  // All can read from all
    'write': {
      'L4': [],           // No direct writes (Operator only, outside flow)
      'L3': ['L1'],       // L1 can write to L3 (with governance)
      'L2': ['L1'],       // L1 can write to L2 (session summaries)
      'L1': ['L4', 'L3', 'L2'], // L1 loads from others
    }
  };

  return validFlows[operation][target]?.includes(source) ?? false;
}
```

## Testing Memory Layers

```typescript
describe('Memory Layer Isolation', () => {
  it('should load L4 before L3', async () => {
    const loadOrder: string[] = [];
    vi.spyOn(l4, 'getOperatorTelos').mockImplementation(() => {
      loadOrder.push('L4');
      return Promise.resolve(mockTelos);
    });
    vi.spyOn(l3, 'getWorld').mockImplementation(() => {
      loadOrder.push('L3');
      return Promise.resolve(mockWorld);
    });

    await initializeSession('world-1');
    expect(loadOrder).toEqual(['L4', 'L3']);
  });

  it('should flush L1 on session close', async () => {
    const l1 = new L1ActiveMemory();
    l1.set('test', 'value');

    await closeSession('world-1', l1);

    expect(l1.get('test')).toBeUndefined();
  });
});
```
