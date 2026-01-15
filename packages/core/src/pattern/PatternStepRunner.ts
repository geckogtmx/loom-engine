
// packages/core/src/pattern/PatternStepRunner.ts

import { AgentRuntime } from '../agent/AgentRuntime';
import { PatternStep } from './types';
import { TempoConfig } from './tempo/types';

export interface StepExecutionResult {
    output: string;
    agentName: string;
    status: 'completed' | 'failed';
    error?: string;
    metadata?: {
        modelUsed: string;
        tempo: string;
        tokens?: number;
    };
}

export class PatternStepRunner {

    /**
     * Executes a single step of a pattern.
     * @param step The pattern step definition
     * @param context The current context (e.g., previous outputs, session goal)
     * @param agentRuntime The agent runtime instance to use for this step
     * @param tempoConfig The tempo configuration to apply
     */
    async executeStep(
        step: PatternStep,
        context: string,
        agentRuntime: AgentRuntime,
        tempoConfig: TempoConfig
    ): Promise<StepExecutionResult> {
        try {
            // 1. Construct System Prompt
            //    - Agent Telos/Profile (handled by AgentRuntime.getSystemPrompt())
            //    - Step specific instructions
            //    - Tempo instructions

            const agentSystemPrompt = agentRuntime.getSystemPrompt();

            const stepInstructions = `
# STEP INSTRUCTIONS: ${step.name}
${step.systemPrompt || ''}

# TEMPO: ${tempoConfig.mode.toUpperCase()}
Verbosity: ${tempoConfig.verbosity}
Depth: ${tempoConfig.reasoningDepth}
`;

            const fullSystemPrompt = `${agentSystemPrompt}\n\n---\n\n${stepInstructions}`;

            // 2. Determine Model
            const model = agentRuntime.getEffectiveModel();

            // 3. Call LLM (Mocked for now as we are in Phase 5, Phase 7 is LLM Integration)
            // In a real implementation, this would call 'LLMService.chat(model, fullSystemPrompt, context)'
            const output = await this.mockLLMCall(model, fullSystemPrompt, context);

            // 4. Return result
            return {
                output,
                agentName: 'Agent', // TODO: Get name from runtime profile
                status: 'completed',
                metadata: {
                    modelUsed: model,
                    tempo: tempoConfig.mode
                }
            };

        } catch (err: any) {
            return {
                output: '',
                agentName: 'System',
                status: 'failed',
                error: err.message || 'Unknown error during step execution'
            };
        }
    }

    private async mockLLMCall(model: string, system: string, user: string): Promise<string> {
        // Simulation of network delay
        // await new Promise(resolve => setTimeout(resolve, 100));
        return `[MOCK OUTPUT from ${model}]\nProcessed context of length ${user.length}.\nSystem Prompt length: ${system.length}`;
    }
}
