import { DispatchGate } from './DispatchGate';
import { SpineGenerator } from './SpineGenerator';
import { ContextAssembler } from './ContextAssembler';
import { DispatchContext, DispatchResult, Spine } from './types';
import { SessionState } from '../session/types';

export class Dispatcher {
    constructor(
        private gate: DispatchGate,
        private spineGenerator: SpineGenerator,
        private assembler: ContextAssembler
    ) { }

    /**
     * The Main Pipeline: Gate -> Assemble -> Execute
     */
    async dispatch(context: DispatchContext, sessionState: SessionState, availableSpines: Spine[]): Promise<DispatchResult> {
        // 1. GATE
        const gateResult = await this.gate.check(context, sessionState);
        if (!gateResult.allowed) {
            return {
                success: false,
                error: `Governance Denied: ${gateResult.reason} (${gateResult.violations?.join(', ')})`,
                metadata: { tokensUsed: 0, model: 'none', cost: 0, durationMs: 0 }
            };
        }

        // 2. ROUTE / SPINE SELECTION
        // For Phase 6, we use a simple filter (heuristic)
        // In future: Vector Search or LLM Router
        const startTime = Date.now();
        const relevantSpines = this.selectSpines(context.query, availableSpines);

        // 3. ASSEMBLE
        const prompt = this.assembler.assemble(context, relevantSpines);

        // 4. EXECUTE (Placeholder for Phase 7 AI)
        // This is where we would call the LLMProvider
        // For now, we return the assembled prompt as the "output" to prove the pipeline works
        const mockDuration = Date.now() - startTime;

        return {
            success: true,
            output: `[DISPATCHED PROMPT PREVIEW]\n\n${prompt}`,
            metadata: {
                tokensUsed: prompt.length / 4, // Rough est
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
