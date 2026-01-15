
// packages/core/src/pattern/PatternIntegration.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { PatternRegistry } from './PatternRegistry';
import { PatternLifecycle } from './lifecycle/PatternLifecycle';
import { PatternStepRunner } from './PatternStepRunner';
import { LifecyclePhase } from './lifecycle/types';
import { SessionIntentEnvelopeImpl } from '../session/SessionIntentEnvelope';
import { AgentRuntime } from '../agent/AgentRuntime';
import { TempoService } from './tempo/TempoService';
import { TempoMode } from './tempo/types';
import * as path from 'path';

// Mock AgentRuntime dependencies
const mockProfile = { id: 'a1', worldId: 'w1', name: 'MOCK', role: 'Tester', description: 'desc', createdAt: new Date(), updatedAt: new Date() };
const mockTelos = { id: 't1', agentId: 'a1', content: 'You are MOCK.', updatedAt: new Date() };
const mockRuntime = new AgentRuntime(mockProfile, mockTelos);

describe('Pattern System End-to-End', () => {
    let registry: PatternRegistry;
    let stepRunner: PatternStepRunner;
    let tempoService: TempoService;

    beforeEach(() => {
        registry = new PatternRegistry();
        stepRunner = new PatternStepRunner();
        tempoService = new TempoService();
    });

    it('should load Option Burst, init lifecycle, and run steps', async () => {
        // 1. Load Pattern from Knowledge (simulated by parsing string directly for speed, or strict file load)
        const optionBurstMd = `
# Option Burst
> **Family:** Ideation
> **Purpose:** Generate options.

### 1. Diverge
**Agent:** Ideator
**Tempo:** Allegro
Generate options.
`;
        const parser = (registry as any).parser;
        const pattern = parser.parse(optionBurstMd, 'Option Burst.md');

        expect(pattern).toBeDefined();
        expect(pattern.steps.length).toBe(1);

        // 2. Initialize Session & Lifecycle
        const sie = new SessionIntentEnvelopeImpl('w1', 'Generate ideas');
        sie.seal(); // Assume Primacy done

        const lifecycle = new PatternLifecycle('s1', 'w1', pattern, sie);

        // 3. Advance Lifecycle
        lifecycle.start();
        // Should auto-advance past primacy since sealed
        expect(lifecycle.getState()).toBe(LifecyclePhase.ACTIVATION);

        lifecycle.advanceStep();
        expect(lifecycle.getState()).toBe(LifecyclePhase.STEP_EXECUTION);

        // 4. Run Step 1
        const step = pattern.steps[0];
        const tempoConfig = tempoService.getConfig(TempoMode.ALLEGRO);

        const result = await stepRunner.executeStep(
            step,
            "Problem: Need dinner ideas.",
            mockRuntime,
            tempoConfig
        );

        expect(result.status).toBe('completed');
        expect(result.output).toContain('MOCK OUTPUT');
        expect(result.metadata?.tempo).toBe('allegro');
    });

    it('should run multi-step Fact Check pattern', async () => {
        const factCheckMd = `
# Fact Check
> **Family:** Analysis

### 1. Research
**Agent:** Researcher
**Tempo:** Andante
Find facts.

### 2. Verify
**Agent:** Reviewer
**Tempo:** Adagio
Verify facts.
`;
        const parser = (registry as any).parser;
        const pattern = parser.parse(factCheckMd, 'Fact Check.md');

        expect(pattern.steps.length).toBe(2);

        const sie = new SessionIntentEnvelopeImpl('w1', 'Check facts');
        sie.seal();
        const lifecycle = new PatternLifecycle('s2', 'w1', pattern, sie);
        lifecycle.start();

        // Step 1
        lifecycle.advanceStep();
        const step1 = pattern.steps[0];
        const res1 = await stepRunner.executeStep(step1, "Claim: X is true", mockRuntime, tempoService.getConfig(TempoMode.ANDANTE));
        expect(res1.status).toBe('completed');

        // Step 2
        lifecycle.advanceStep(); // Should move index to 1
        expect(lifecycle.info.stepIndex).toBe(1);

        const step2 = pattern.steps[1];
        const res2 = await stepRunner.executeStep(step2, res1.output, mockRuntime, tempoService.getConfig(TempoMode.ADAGIO));
        expect(res2.status).toBe('completed');

        // Finish
        lifecycle.advanceStep();
        expect(lifecycle.getState()).toBe(LifecyclePhase.COMPLETED);
    });
});

