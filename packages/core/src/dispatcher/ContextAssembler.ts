import { DispatchContext, Spine } from './types';

export class ContextAssembler {
    private readonly MAX_Context = 4000; // Safe default for local models

    /**
     * Assembles the final prompt string from the DispatchContext.
     * Prioritizes: L1 (Active) > L2 (Recent History) > L3 (Spines).
     */
    assemble(context: DispatchContext, relevantSpines: Spine[]): string {
        const parts: string[] = [];

        // 1. System/Goal (Always First)
        // We assume the Goal is passed in context or wrapper, but here we just process what we have.
        // For now, prompt assembly logic:

        // 2. L1 Active Memory (High Priority)
        // This is immediate context (e.g., current scratchpad)
        if (context.l1Active) {
            parts.push(`[ACTIVE CONTEXT]\n${JSON.stringify(context.l1Active, null, 2)}`);
        }

        // 3. L2 History (Recent Conversation)
        // We usually want the last N messages
        if (context.l2History && context.l2History.length > 0) {
            const historyText = context.l2History
                .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
                .join('\n');
            parts.push(`[HISTORY]\n${historyText}`);
        }

        // 4. L3 Relevant Knowledge (via Spines)
        // We attempt to fit as many spines as possible within the remaining budget
        if (relevantSpines.length > 0) {
            let spineText = "[KNOWLEDGE]\n";
            let currentTokens = 0;

            for (const spine of relevantSpines) {
                // Heuristic Check: Do we have room?
                if (currentTokens + spine.tokens > 1000) break; // Limit knowledge to 1k tokens for now

                spineText += `- (${spine.type}) ${spine.content}\n`;
                currentTokens += spine.tokens;
            }
            parts.push(spineText);
        }

        // 5. The User Query (Last)
        parts.push(`[USER QUERY]\n${context.query}`);

        return parts.join('\n\n');
    }
}
