---
name: world-isolation-auditor
description: Verifies World isolation is maintained in LOOM Engine code. Use this skill when writing database queries, implementing cross-World features, reviewing code that touches episodic (L2) or knowledge (L3) layers, or auditing for data leakage between Worlds. Enforces the mandatory "WHERE world_id = ?" pattern.
---

# World Isolation Auditor

This skill enforces LOOM's World isolation mandate: **Projects never bleed implicitly.**

## Core Rule

> Every query to L2 (Episodic) and most queries to L3 (Knowledge) MUST include `world_id` filtering.

## The Isolation Mandate

Worlds are isolated containers. Data from World A must NEVER appear in World B unless explicitly requested through a governed cross-World operation.

### What Must Be World-Scoped

| Data Type | Layer | Must Filter by `world_id` |
|-----------|-------|---------------------------|
| Sessions | L2 | ✅ ALWAYS |
| Session Summaries | L2 | ✅ ALWAYS |
| Decisions | L2 | ✅ ALWAYS |
| World Deltas | L2 | ✅ ALWAYS |
| Checkpoints | L2 | ✅ ALWAYS |
| Patterns | L3 | ✅ When World-specific |
| Agents | L3 | ✅ When World-assigned |
| World Config | L3 | ✅ By definition |

### What Is Global (No World Filter)

| Data Type | Layer | Reason |
|-----------|-------|--------|
| Operator Telos | L4 | Single Operator |
| Global META Rules | L3 | Apply to all Worlds |
| Shared Patterns | L3 | Explicitly marked shared |

## Code Patterns

### ✅ CORRECT: World-Scoped Query

```typescript
// Drizzle ORM - CORRECT
async function getWorldSessions(worldId: string) {
  return db.select()
    .from(sessions)
    .where(eq(sessions.worldId, worldId))
    .orderBy(desc(sessions.createdAt));
}

// CORRECT: Multiple conditions with World scope
async function getRecentDecisions(worldId: string, limit: number) {
  return db.select()
    .from(decisions)
    .where(
      and(
        eq(decisions.worldId, worldId),
        gte(decisions.createdAt, subDays(new Date(), 7))
      )
    )
    .limit(limit);
}
```

### ❌ WRONG: Missing World Scope

```typescript
// ❌ VIOLATION: No world filter
async function getAllSessions() {
  return db.select().from(sessions); // LEAKS ALL WORLDS
}

// ❌ VIOLATION: Forgot world_id in join
async function getSessionsWithSummaries() {
  return db.select()
    .from(sessions)
    .leftJoin(summaries, eq(sessions.id, summaries.sessionId));
    // Missing: .where(eq(sessions.worldId, worldId))
}
```

## Service Layer Pattern

Enforce World isolation at the service layer:

```typescript
class WorldScopedService {
  constructor(private worldId: string) {}

  // All methods automatically scoped
  async getSessions() {
    return db.select()
      .from(sessions)
      .where(eq(sessions.worldId, this.worldId));
  }

  async createSession(data: SessionData) {
    return db.insert(sessions).values({
      ...data,
      worldId: this.worldId, // Enforced
    });
  }
}

// Usage
const worldService = new WorldScopedService(currentWorldId);
const sessions = await worldService.getSessions(); // Always scoped
```

## Repository Pattern

```typescript
interface WorldScopedRepository<T> {
  worldId: string;
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'worldId'>): Promise<T>;
}

class SessionRepository implements WorldScopedRepository<Session> {
  constructor(public worldId: string) {}

  async findAll() {
    return db.select()
      .from(sessions)
      .where(eq(sessions.worldId, this.worldId));
  }

  async findById(id: string) {
    const [session] = await db.select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, id),
          eq(sessions.worldId, this.worldId) // Double-check isolation
        )
      );
    return session ?? null;
  }
}
```

## Cross-World Operations (Governed)

When cross-World access IS needed, it must be:
1. Explicitly requested
2. Governance-approved
3. Logged

```typescript
async function crossWorldRead(
  sourceWorldId: string,
  targetWorldId: string,
  governance: GovernanceContext
): Promise<CrossWorldResult> {
  // Step 1: Check governance
  const decision = await a0.checkCrossWorldAccess({
    source: sourceWorldId,
    target: targetWorldId,
    operation: 'read',
    caller: governance.caller,
  });

  if (!decision.allowed) {
    throw new WorldIsolationError(decision.reason);
  }

  // Step 2: Log the cross-World access
  await auditLog.record({
    type: 'cross-world-access',
    source: sourceWorldId,
    target: targetWorldId,
    caller: governance.caller,
  });

  // Step 3: Perform the read with explicit flag
  return db.select()
    .from(sessions)
    .where(eq(sessions.worldId, targetWorldId));
}
```

## Audit Checklist

When reviewing code, check:

- [ ] **All L2 queries** have `WHERE world_id = ?`
- [ ] **Joins** don't accidentally expose cross-World data
- [ ] **INSERT statements** always include `worldId`
- [ ] **Service methods** receive `worldId` as parameter or are World-scoped
- [ ] **No global SELECTs** on World-scoped tables
- [ ] **Cross-World access** goes through governance layer

## Testing World Isolation

```typescript
describe('World Isolation', () => {
  const worldA = 'world-a';
  const worldB = 'world-b';

  beforeEach(async () => {
    // Create sessions in both worlds
    await db.insert(sessions).values([
      { id: 'session-a', worldId: worldA, name: 'A Session' },
      { id: 'session-b', worldId: worldB, name: 'B Session' },
    ]);
  });

  it('should only return sessions from the requested world', async () => {
    const repo = new SessionRepository(worldA);
    const results = await repo.findAll();

    expect(results).toHaveLength(1);
    expect(results[0].worldId).toBe(worldA);
    expect(results.some(s => s.worldId === worldB)).toBe(false);
  });

  it('should not find session from another world by ID', async () => {
    const repo = new SessionRepository(worldA);
    const result = await repo.findById('session-b'); // From World B

    expect(result).toBeNull(); // Isolation enforced
  });

  it('should reject cross-world access without governance', async () => {
    await expect(
      crossWorldRead(worldA, worldB, { caller: { type: 'agent' } })
    ).rejects.toThrow(WorldIsolationError);
  });
});
```

## Schema Design

Ensure tables have `world_id`:

```typescript
// Drizzle schema
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  worldId: text('world_id').notNull(), // REQUIRED
  name: text('name').notNull(),
  // ... other fields
});

// Create index for World-scoped queries
export const sessionsWorldIdx = index('sessions_world_idx')
  .on(sessions.worldId);
```
