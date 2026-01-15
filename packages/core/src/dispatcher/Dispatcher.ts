import { DispatchGate } from './DispatchGate';
import { SpineGenerator } from './SpineGenerator';
import { ContextAssembler } from './ContextAssembler';
import { DispatchContext, DispatchResult, Spine } from './types';
import { SessionState } from '../session/types';
import { LLMProvider, LLMRequest } from '../llm/types';
import { SystemPromptBuilder } from '../llm/SystemPromptBuilder';
import { AgentRuntime } from '../agent/AgentRuntime';
import { SessionIntentEnvelopeImpl } from '../session/SessionIntentEnvelope';

export class Dispatcher {
    constructor(
        private gate: DispatchGate,
        private spineGenerator: SpineGenerator,
        private assembler: ContextAssembler,
        private llmProvider?: LLMProvider,
        private systemPromptBuilder?: SystemPromptBuilder
    ) { }

    /**
     * The Main Pipeline: Gate -> Assemble -> Execute
     */
    async dispatch(
        context: DispatchContext,
        sessionState: SessionState,
        availableSpines: Spine[],
        agentRuntime?: AgentRuntime,
        envelope?: SessionIntentEnvelopeImpl
    ): Promise<DispatchResult> {
        // 1. GATE
        const gateResult = await this.gate.check(context, sessionState);
        if (!gateResult.allowed) {
            return {
                success: false,
                error: `Governance Denied: ${gateResult.reason} (${gateResult.violations?.join(', ')})`,
                metadata: { tokensUsed: 0, model: 'none', cost: 0, durationMs: 0 }
            };
        }

        const startTime = Date.now();

        // 2. ROUTE / SPINE SELECTION
        const relevantSpines = this.selectSpines(context.query, availableSpines);

        // 3. ASSEMBLE
        const assembledContext = this.assembler.assemble(context, relevantSpines);

        // 4. EXECUTE
        // If LLMProvider is available, execute with real LLM
        if (this.llmProvider && this.systemPromptBuilder && agentRuntime && envelope) {
            try {
                const systemPrompt = await this.systemPromptBuilder.build(
                    agentRuntime,
                    envelope,
                    assembledContext,
                    context.agentMode
                );

                const llmRequest: LLMRequest = {
                    systemPrompt,
                    userPrompt: context.query,
                    model: context.modelPreference,
                    temperature: 0.7,
                    maxTokens: 2000
                };

                const response = await this.llmProvider.complete(llmRequest);
                const duration = Date.now() - startTime;

                const costEstimate = await this.llmProvider.estimateCost(llmRequest);

                return {
                    success: true,
                    output: response.content,
                    metadata: {
                        tokensUsed: response.tokensUsed.total,
                        model: response.model,
                        cost: costEstimate.totalCost,
                        durationMs: duration
                    }
                };
            } catch (error) {
                const duration = Date.now() - startTime;
                return {
                    success: false,
                    error: `LLM Execution Failed: ${(error as Error).message}`,
                    metadata: { tokensUsed: 0, model: 'error', cost: 0, durationMs: duration }
                };
            }
        }

        // FALLBACK: Dry-run mode (no LLM provider)
        const mockDuration = Date.now() - startTime;
        return {
            success: true,
            output: `[DRY-RUN MODE]\n\n${assembledContext}`,
            metadata: {
                tokensUsed: assembledContext.length / 4,
                model: 'dry-run',
                cost: 0,
                durationMs: mockDuration
            }
        };
    }

    private selectSpines(query: string, availableSpines: Spine[]): Spine[] {
        if (!query) return [];
        const queryLower = query.toLowerCase();

        // Simple keyword match
        return availableSpines.filter(spine => {
            return spine.keywords.some(kw => queryLower.includes(kw)) ||
                spine.content.toLowerCase().includes(queryLower);
        });
    }
}
