---
name: pattern-designer
description: Helps design and implement LOOM Patterns with the 11-phase lifecycle. Use this skill when creating new Patterns, implementing Primacy Protection (Phase 0), Tempo system (allegro/andante/adagio), Pattern abort/rollback logic, or working on the core 14 Patterns. Essential for Phase 5 Pattern System work.
---

# Pattern Designer

This skill guides implementation of LOOM's Pattern System—the structured execution framework.

## Pattern Fundamentals

A Pattern is a **governed, multi-step workflow** that transforms Operator intent into structured output.

### Pattern Schema

```typescript
interface Pattern {
  id: string;
  name: string;
  family: PatternFamily;
  purpose: string;
  worldScope: 'global' | 'world-specific';

  inputs: PatternInput[];
  outputs: PatternOutput[];
  steps: PatternStep[];
  constraints: PatternConstraint[];

  primacyQuestions?: string[];  // Questions for Phase 0
  defaultTempo: Tempo;
}

type PatternFamily =
  | 'ideation'      // Option Burst, Metaphor Bloom, Divergent Spread
  | 'structuring'   // Framework Forge, Narrative Spine, Cluster Map
  | 'decision'      // Criteria Filter, Compare & Weigh, Direction Lock
  | 'production'    // Draft → Edit → Polish, Episode Workflow
  | 'refinement'    // Clarity Pass, Coherence Sweep
  | 'analysis';     // Insight Weave

interface PatternStep {
  order: number;
  name: string;
  agent: string;           // Agent ID to execute
  layerWrites: Layer[];    // Which layers this step can write to
  tempoMode: Tempo;        // Can override Pattern default
  constraints: string[];
  handoffTo?: string;      // Next step or 'complete'
}
```

## The 11-Phase Lifecycle

Every Pattern execution follows this lifecycle:

```
Phase 0:  PRIMACY EXPANSION (Required, cannot skip)
Phase 1:  Operator Intention Capture
Phase 2:  META Validation
Phase 3:  Pattern Activation
Phase 4:  Input Preparation
Phase 5:  Step Execution (with Tempo)
Phase 6:  Operator Steering Hooks
Phase 7:  Completion Conditions Check
Phase 8:  Output Delivery
Phase 9:  L2 Update
Phase 10: Reintegration
```

### Phase 0: Primacy Protection (CRITICAL)

**Purpose:** Capture Operator intent before ANY framing or proposals.

**Rules:**
- Only clarifying questions allowed
- NO proposals
- NO summaries
- NO reframing
- Must complete before Pattern execution begins
- Operator signals "ready to proceed" to seal SIE

```typescript
class PrimacyExpansion {
  private questions: string[] = [];
  private answers: Map<string, string> = new Map();
  private sealed = false;

  async runPrimacy(pattern: Pattern, l1: L1ActiveMemory): Promise<SessionIntentEnvelope> {
    // Ask clarifying questions only
    for (const question of pattern.primacyQuestions ?? this.defaultQuestions) {
      const answer = await this.askOperator(question);
      this.answers.set(question, answer);
    }

    // Build and seal the Session Intent Envelope
    const sie = this.buildSIE();
    l1.sealSIE(sie);
    this.sealed = true;

    return sie;
  }

  private defaultQuestions = [
    "What is the primary goal of this session?",
    "What constraints or boundaries should I respect?",
    "Who is the intended audience for the output?",
    "What would success look like?"
  ];

  // A0 blocks these during Primacy
  validateOutput(output: string): void {
    if (!this.sealed) {
      if (this.containsProposal(output)) {
        throw new PrimacyViolation('No proposals during Primacy Expansion');
      }
      if (this.containsSummary(output)) {
        throw new PrimacyViolation('No summaries during Primacy Expansion');
      }
    }
  }
}
```

### Session Intent Envelope (SIE)

Created during Primacy, immutable after sealing:

```typescript
interface SessionIntentEnvelope {
  id: string;
  patternId: string;
  sealedAt: Date;

  goal: string;
  constraints: string[];
  audience: string;
  scopeBoundaries: string[];
  successCriteria: string[];

  // Immutable after sealing
  readonly sealed: boolean;
}
```

## Tempo System

Tempo controls execution pace:

| Tempo | Verbosity | Step Granularity | Initiative | Use Case |
|-------|-----------|------------------|------------|----------|
| **Allegro** | Minimal | Quick steps | High | Time pressure, simple tasks |
| **Andante** | Balanced | Normal | Moderate | Default, most sessions |
| **Adagio** | Detailed | Deep exploration | Deliberate | Complex, architecture |

```typescript
type Tempo = 'allegro' | 'andante' | 'adagio';

class TempoService {
  private currentTempo: Tempo = 'andante';

  setTempo(tempo: Tempo): void {
    this.currentTempo = tempo;
  }

  getSettings(): TempoSettings {
    return {
      allegro: {
        verbosity: 'minimal',
        stepGranularity: 'coarse',
        reasoningDepth: 'shallow',
        agentInitiative: 'high',
      },
      andante: {
        verbosity: 'balanced',
        stepGranularity: 'normal',
        reasoningDepth: 'moderate',
        agentInitiative: 'moderate',
      },
      adagio: {
        verbosity: 'detailed',
        stepGranularity: 'fine',
        reasoningDepth: 'deep',
        agentInitiative: 'low',
      },
    }[this.currentTempo];
  }
}
```

## Pattern Abort & Rollback

Clean cancellation at step boundaries:

```typescript
class PatternAbortService {
  async abort(
    patternRun: PatternRun,
    options: AbortOptions
  ): Promise<AbortResult> {
    // Can only abort at step boundaries
    if (patternRun.currentStep.inProgress) {
      await this.waitForStepBoundary(patternRun);
    }

    // Handle partial output
    const partialOutput = patternRun.getPartialOutput();

    if (options.saveAsDraft) {
      await this.saveDraft(patternRun.worldId, partialOutput);
    }

    // Clean L1 state
    patternRun.l1.flush();

    // Write abort record to L2
    await l2.appendDecision(patternRun.worldId, {
      type: 'pattern-abort',
      patternId: patternRun.pattern.id,
      abortedAtStep: patternRun.currentStep.order,
      reason: options.reason,
      partialOutputSaved: options.saveAsDraft,
    });

    return { success: true, partialOutputSaved: options.saveAsDraft };
  }
}
```

## Pattern Step Runner

```typescript
class PatternStepRunner {
  async runStep(
    step: PatternStep,
    context: StepContext
  ): Promise<StepOutput> {
    // Get Agent for this step
    const agent = await this.loadAgent(step.agent);

    // Apply Tempo settings
    const tempoSettings = this.tempo.getSettings();

    // Validate layer write permissions
    this.validateLayerWrites(step.layerWrites, agent);

    // Execute with streaming
    const output = await this.executeWithStreaming(agent, context, tempoSettings);

    // Handle handoff
    if (step.handoffTo && step.handoffTo !== 'complete') {
      return { output, nextStep: step.handoffTo };
    }

    return { output, complete: step.handoffTo === 'complete' };
  }

  private async executeWithStreaming(
    agent: Agent,
    context: StepContext,
    tempo: TempoSettings
  ): Promise<string> {
    const stream = await this.llm.stream({
      agent,
      context,
      verbosity: tempo.verbosity,
    });

    for await (const chunk of stream) {
      this.websocket.send(chunk); // Real-time to UI
    }

    return stream.complete;
  }
}
```

## Core 14 Patterns Reference

| Family | Pattern | Purpose |
|--------|---------|---------|
| **Ideation** | Option Burst | Generate many options quickly |
| | Metaphor Bloom | Explore through metaphors |
| | Divergent Spread | Expand in multiple directions |
| **Structuring** | Framework Forge | Build organizing frameworks |
| | Narrative Spine | Create story structure |
| | Cluster Map | Group related concepts |
| **Decision** | Criteria Filter | Filter by criteria |
| | Compare & Weigh | Compare options |
| | Direction Lock | Commit to direction |
| **Production** | Draft → Edit → Polish | Iterative refinement |
| | Episode Workflow | Multi-part production |
| **Refinement** | Clarity Pass | Improve clarity |
| | Coherence Sweep | Ensure consistency |
| **Analysis** | Insight Weave | Extract insights |

## Testing Patterns

```typescript
describe('Pattern Lifecycle', () => {
  it('should enforce Primacy before execution', async () => {
    const pattern = await loadPattern('option-burst');
    const runner = new PatternRunner();

    // Attempt to skip Primacy
    await expect(
      runner.execute(pattern, { skipPrimacy: true })
    ).rejects.toThrow('Primacy Expansion required');
  });

  it('should seal SIE before step execution', async () => {
    const runner = new PatternRunner();
    const run = await runner.startPattern('option-burst');

    // Before Primacy completes
    expect(run.l1.getSIE()?.sealed).toBe(false);

    // Complete Primacy
    await run.completePrimacy(mockAnswers);

    // After Primacy
    expect(run.l1.getSIE()?.sealed).toBe(true);
  });

  it('should abort cleanly at step boundary', async () => {
    const runner = new PatternRunner();
    const run = await runner.startPattern('draft-edit-polish');
    await run.completePrimacy(mockAnswers);

    // Start execution, then abort
    run.executeStep(1);
    const result = await run.abort({ saveAsDraft: true });

    expect(result.success).toBe(true);
    expect(run.l1.get('test')).toBeUndefined(); // L1 flushed
  });
});
```
