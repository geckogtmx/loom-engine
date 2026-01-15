---
name: spine-generator
description: Guides implementation of LOOM's Spines system for 80%+ cost reduction. Use this skill when implementing context assembly, background indexing, Dispatcher routing logic, or optimizing token usage. Ensures spines are derived, disposable, machine-facing representations. Essential for Phase 6 cost optimization.
---

# Spine Generator

This skill guides implementation of LOOM's Spines system—the key to 80%+ cost reduction.

## What Are Spines?

Spines are **derived, compact, machine-facing knowledge representations** that:
- Reduce token usage by 80%+
- Are regenerable from source (L3/L4)
- Are disposable (not source of truth)
- Are non-authoritative (MD files are canonical)

## Spine Types

| Spine Type | Source | Purpose |
|------------|--------|---------|
| **World Execution Spine** | World Telos + L2 | Condensed World context for sessions |
| **Agent Capability Spine** | Agent Profile | Role, constraints, tools summary |
| **Pattern Index Spine** | Pattern Registry | Quick pattern lookup and matching |
| **Global Session Spine** | Operator Telos | Cross-World context |

## Spine Schema

```typescript
interface Spine {
  id: string;
  type: SpineType;
  sourceId: string;          // ID of source entity
  sourceHash: string;        // Hash of source for invalidation
  content: SpineContent;     // Compact representation
  generatedAt: Date;
  expiresAt?: Date;          // Optional TTL
}

type SpineType =
  | 'world-execution'
  | 'agent-capability'
  | 'pattern-index'
  | 'global-session';

interface SpineContent {
  summary: string;           // Natural language summary
  structured: unknown;       // Type-specific structured data
  tokens: number;            // Estimated token count
}
```

## World Execution Spine

Condensed World context for session initialization:

```typescript
interface WorldExecutionSpine extends Spine {
  type: 'world-execution';
  content: {
    summary: string;
    structured: {
      worldId: string;
      purpose: string;        // 1-2 sentences
      activeThreads: ThreadSummary[];
      recentDecisions: DecisionSummary[];
      keyConstraints: string[];
    };
    tokens: number;
  };
}

// Generator
async function generateWorldExecutionSpine(worldId: string): Promise<WorldExecutionSpine> {
  // Load full data
  const worldTelos = await l4.getWorldTelos(worldId);
  const recentSummaries = await l2.getSessionSummaries(worldId, 10);
  const decisions = await l2.getDecisions(worldId, 20);

  // Condense to spine
  return {
    id: generateId(),
    type: 'world-execution',
    sourceId: worldId,
    sourceHash: hash(worldTelos, recentSummaries),
    content: {
      summary: condensePurpose(worldTelos.purpose),
      structured: {
        worldId,
        purpose: worldTelos.purpose.substring(0, 200),
        activeThreads: extractActiveThreads(recentSummaries),
        recentDecisions: condenseDecisions(decisions),
        keyConstraints: worldTelos.constraints.slice(0, 5),
      },
      tokens: estimateTokens(/* condensed content */),
    },
    generatedAt: new Date(),
  };
}
```

## Agent Capability Spine

Compact Agent representation for Dispatcher:

```typescript
interface AgentCapabilitySpine extends Spine {
  type: 'agent-capability';
  content: {
    summary: string;
    structured: {
      agentId: string;
      role: string;           // One sentence
      capabilities: string[]; // 3-5 key capabilities
      constraints: string[];  // 3-5 key constraints
      tools: string[];        // Tool names only
      modelPreference?: string;
    };
    tokens: number;
  };
}

async function generateAgentCapabilitySpine(agentId: string): Promise<AgentCapabilitySpine> {
  const profile = await l3.getAgent(agentId);
  const telos = await l4.getAgentTelos(agentId);

  return {
    id: generateId(),
    type: 'agent-capability',
    sourceId: agentId,
    sourceHash: hash(profile, telos),
    content: {
      summary: `${profile.name}: ${telos.corePurpose.substring(0, 100)}`,
      structured: {
        agentId,
        role: extractRoleSentence(profile),
        capabilities: extractTopCapabilities(profile.modes, 5),
        constraints: extractTopConstraints(telos.constraints, 5),
        tools: profile.tools.map(t => t.name),
        modelPreference: profile.modelPreferences?.preferred,
      },
      tokens: estimateTokens(/* condensed content */),
    },
    generatedAt: new Date(),
  };
}
```

## Pattern Index Spine

Quick pattern lookup for Dispatcher:

```typescript
interface PatternIndexSpine extends Spine {
  type: 'pattern-index';
  content: {
    summary: string;
    structured: {
      patterns: PatternIndexEntry[];
    };
    tokens: number;
  };
}

interface PatternIndexEntry {
  id: string;
  name: string;
  family: string;
  purpose: string;        // 1 sentence
  triggerKeywords: string[];
  inputSignature: string; // e.g., "topic: string, constraints?: string[]"
  outputType: string;     // e.g., "OptionList"
}

async function generatePatternIndexSpine(worldId?: string): Promise<PatternIndexSpine> {
  const patterns = worldId
    ? await l3.listPatternsForWorld(worldId)
    : await l3.listGlobalPatterns();

  return {
    id: generateId(),
    type: 'pattern-index',
    sourceId: worldId ?? 'global',
    sourceHash: hash(patterns),
    content: {
      summary: `${patterns.length} patterns available`,
      structured: {
        patterns: patterns.map(p => ({
          id: p.id,
          name: p.name,
          family: p.family,
          purpose: p.purpose.substring(0, 80),
          triggerKeywords: extractKeywords(p),
          inputSignature: formatInputSignature(p.inputs),
          outputType: p.outputs[0]?.type ?? 'unknown',
        })),
      },
      tokens: estimateTokens(/* condensed content */),
    },
    generatedAt: new Date(),
  };
}
```

## Spine Generator Service

```typescript
class SpineGeneratorService {
  private cache = new Map<string, Spine>();

  async getSpine<T extends Spine>(
    type: SpineType,
    sourceId: string
  ): Promise<T> {
    const cacheKey = `${type}:${sourceId}`;
    const cached = this.cache.get(cacheKey);

    // Check if cached and still valid
    if (cached && !this.isExpired(cached)) {
      const sourceHash = await this.computeSourceHash(type, sourceId);
      if (cached.sourceHash === sourceHash) {
        return cached as T;
      }
    }

    // Generate fresh spine
    const spine = await this.generate(type, sourceId);
    this.cache.set(cacheKey, spine);
    return spine as T;
  }

  private async generate(type: SpineType, sourceId: string): Promise<Spine> {
    switch (type) {
      case 'world-execution':
        return generateWorldExecutionSpine(sourceId);
      case 'agent-capability':
        return generateAgentCapabilitySpine(sourceId);
      case 'pattern-index':
        return generatePatternIndexSpine(sourceId);
      case 'global-session':
        return generateGlobalSessionSpine();
      default:
        throw new Error(`Unknown spine type: ${type}`);
    }
  }

  async invalidate(type: SpineType, sourceId: string): Promise<void> {
    const cacheKey = `${type}:${sourceId}`;
    this.cache.delete(cacheKey);
  }

  async invalidateAll(): Promise<void> {
    this.cache.clear();
  }
}
```

## Background Indexing

Generate spines proactively:

```typescript
class BackgroundIndexingService {
  private running = false;

  async startIndexing(): Promise<void> {
    if (this.running) return;
    this.running = true;

    try {
      // Index all Worlds
      const worlds = await l3.listWorlds();
      for (const world of worlds) {
        await this.indexWorld(world.id);
      }

      // Index global patterns
      await this.spineGenerator.getSpine('pattern-index', 'global');

      // Index global session context
      await this.spineGenerator.getSpine('global-session', 'operator');

    } finally {
      this.running = false;
    }
  }

  private async indexWorld(worldId: string): Promise<void> {
    // World execution spine
    await this.spineGenerator.getSpine('world-execution', worldId);

    // Agent spines for this World
    const agents = await l3.listAgentsForWorld(worldId);
    for (const agent of agents) {
      await this.spineGenerator.getSpine('agent-capability', agent.id);
    }

    // World-specific patterns
    await this.spineGenerator.getSpine('pattern-index', worldId);
  }

  // Trigger indexing on events
  onWorldChanged(worldId: string): void {
    this.spineGenerator.invalidate('world-execution', worldId);
    this.scheduleReindex();
  }

  onAgentChanged(agentId: string): void {
    this.spineGenerator.invalidate('agent-capability', agentId);
    this.scheduleReindex();
  }
}
```

## Dispatcher Integration

Dispatcher reads from Spines, not raw L3:

```typescript
class DispatcherService {
  constructor(private spineGenerator: SpineGeneratorService) {}

  async createDispatchPlan(
    intent: string,
    worldId: string
  ): Promise<DispatchPlan> {
    // Load spines (NOT raw L3)
    const worldSpine = await this.spineGenerator.getSpine<WorldExecutionSpine>(
      'world-execution',
      worldId
    );
    const patternSpine = await this.spineGenerator.getSpine<PatternIndexSpine>(
      'pattern-index',
      worldId
    );

    // Use compact spines for routing
    const suggestedPattern = this.matchPattern(intent, patternSpine);
    const sessionClass = this.determineSessionClass(intent, worldSpine);

    return {
      pattern: suggestedPattern,
      sessionClass,
      estimatedTokens: this.estimateTotalTokens(worldSpine, patternSpine),
      // Cost dramatically reduced because spines are compact
    };
  }
}
```

## Cost Comparison

| Approach | Tokens | Cost |
|----------|--------|------|
| Raw L3 load | ~10,000 | $0.30 |
| Spine-based | ~1,500 | $0.045 |
| **Savings** | **85%** | **85%** |

## Testing Spines

```typescript
describe('SpineGenerator', () => {
  it('should generate compact World spine', async () => {
    const spine = await generateWorldExecutionSpine('world-1');

    expect(spine.content.tokens).toBeLessThan(500);
    expect(spine.content.structured.purpose.length).toBeLessThan(250);
  });

  it('should invalidate spine when source changes', async () => {
    const service = new SpineGeneratorService();

    const spine1 = await service.getSpine('world-execution', 'world-1');

    // Modify source
    await l4.updateWorldTelos('world-1', { purpose: 'New purpose' });

    const spine2 = await service.getSpine('world-execution', 'world-1');

    expect(spine1.sourceHash).not.toBe(spine2.sourceHash);
  });

  it('should achieve 80%+ token reduction', async () => {
    const rawTokens = await countRawL3Tokens('world-1');
    const spine = await generateWorldExecutionSpine('world-1');

    const reduction = 1 - (spine.content.tokens / rawTokens);
    expect(reduction).toBeGreaterThan(0.8);
  });
});
```
