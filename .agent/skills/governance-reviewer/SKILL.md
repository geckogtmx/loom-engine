---
name: governance-reviewer
description: Validates META/A0 governance compliance in LOOM Engine code. Use this skill when reviewing PRs, implementing write operations to L2/L3/L4 memory layers, designing features that interact with the Governance Engine, or auditing existing code for governance violations. Covers Write Permissions Matrix, A0 enforcement, drift detection, and Operator Supremacy mandates.
---

# Governance Reviewer

This skill enforces LOOM's governance architecture: META rules, A0 enforcement, and the Write Permissions Matrix.

## Core Governance Principles

### 1. Operator Supremacy
The Operator is the sole source of intent. Code must NEVER:
- Infer Operator intent
- Auto-execute without explicit approval
- Drift from stated goals

### 2. Write Permissions Matrix

| Layer | Who Can Write | Governance |
|-------|---------------|------------|
| **L4 (Telos)** | Operator ONLY | Immutable by Agents |
| **L3 (Knowledge)** | META-approved writes | Requires governance check |
| **L2 (Episodic)** | Session-scoped, append-mostly | World-isolated |
| **L1 (Active)** | Any (ephemeral) | Flushed on session close |

### 3. A0 Enforcement Pattern

Every write to L2/L3/L4 MUST pass through A0:

```typescript
// ✅ CORRECT: A0 gate before write
async function writeToL3(key: string, value: unknown, caller: CallerContext) {
  const decision = await a0Enforcer.checkWrite({
    layer: 'L3',
    key,
    caller,
    operation: 'write'
  });

  if (!decision.allowed) {
    throw new GovernanceError(decision.reason);
  }

  await l3Store.set(key, value);
  await auditLog.record({ layer: 'L3', key, caller, decision });
}

// ❌ WRONG: Direct write bypassing governance
async function writeToL3(key: string, value: unknown) {
  await l3Store.set(key, value); // NO GOVERNANCE CHECK
}
```

## Review Checklist

When reviewing code, verify:

- [ ] **L4 writes**: Only Operator-initiated, never Agent-initiated
- [ ] **L3 writes**: Pass through `MetaGovernance.canWrite()` or `A0Enforcer.checkWrite()`
- [ ] **L2 writes**: World-scoped (`world_id` always present)
- [ ] **No silent state changes**: All mutations logged/auditable
- [ ] **Explicit pathways**: No backdoor writes that skip governance
- [ ] **Drift detection**: Long-running operations check against SIE (Session Intent Envelope)

## META Rules Engine

META rules are stored in L3 and evaluated at runtime:

```typescript
interface MetaRule {
  id: string;
  scope: 'global' | 'world' | 'pattern';
  condition: RuleCondition;
  action: 'allow' | 'deny' | 'escalate';
  reason: string;
}

// Example: Block Agent writes to L4
const blockAgentL4Write: MetaRule = {
  id: 'meta-001',
  scope: 'global',
  condition: { layer: 'L4', callerType: 'agent' },
  action: 'deny',
  reason: 'Agents cannot modify Telos'
};
```

## A0Enforcer Interface

```typescript
interface A0Enforcer {
  checkWrite(request: WriteRequest): Promise<Decision>;
  checkRead(request: ReadRequest): Promise<Decision>;
  checkPatternActivation(pattern: Pattern, context: SessionContext): Promise<Decision>;
  checkAgentAction(agent: Agent, action: AgentAction): Promise<Decision>;
}

interface Decision {
  allowed: boolean;
  reason: string;
  rule?: MetaRule;
  escalate?: boolean;
}
```

## Common Violations

### 1. Direct L4 Mutation
```typescript
// ❌ VIOLATION
agent.updateTelos(newTelos);

// ✅ CORRECT
if (caller.isOperator) {
  await operatorService.updateTelos(newTelos);
}
```

### 2. Cross-World Data Access
```typescript
// ❌ VIOLATION
const allSessions = await db.select().from(sessions);

// ✅ CORRECT
const worldSessions = await db.select()
  .from(sessions)
  .where(eq(sessions.worldId, currentWorldId));
```

### 3. Missing Audit Trail
```typescript
// ❌ VIOLATION
await store.delete(key);

// ✅ CORRECT
await auditLog.record({ action: 'delete', key, caller });
await store.delete(key);
```

## Testing Governance

```typescript
describe('A0Enforcer', () => {
  it('should deny Agent writes to L4', async () => {
    const decision = await a0.checkWrite({
      layer: 'L4',
      caller: { type: 'agent', id: 'agent-1' }
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('Telos');
  });

  it('should allow Operator writes to L4', async () => {
    const decision = await a0.checkWrite({
      layer: 'L4',
      caller: { type: 'operator' }
    });
    expect(decision.allowed).toBe(true);
  });
});
```
