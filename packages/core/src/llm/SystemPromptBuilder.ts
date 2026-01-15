import { AgentRuntime } from '../agent/AgentRuntime';
import { SessionIntentEnvelopeImpl } from '../session/SessionIntentEnvelope';
import { DispatchContext } from '../dispatcher/types';

/**
 * SystemPromptBuilder — Assembles System Prompts for LLM Execution
 * 
 * Combines:
 * - Agent Telos (L4 Identity)
 * - Agent Constraints (L3 Configuration)
 * - World Constraints (L3 Configuration)
 * - Session Intent Envelope (SIE)
 * - Assembled Context (from ContextAssembler)
 * 
 * Phase 7: AI Integration
 */
export class SystemPromptBuilder {
    /**
     * Build a complete system prompt from all governance sources
     * 
     * @param agentRuntime The agent executing this session
     * @param envelope The sealed Session Intent Envelope
     * @param assembledContext The context returned by ContextAssembler
     * @param modeName Optional Agent mode to activate (e.g., "Deep Dive Mode")
     */
    async build(
        agentRuntime: AgentRuntime,
        envelope: SessionIntentEnvelopeImpl,
        assembledContext: string,
        modeName?: string
    ): Promise<string> {
        const sections: string[] = [];

        // 1. Agent System Prompt (Telos + Profile + Mode + World Constraints)
        const agentPrompt = agentRuntime.getSystemPrompt(modeName);
        sections.push(agentPrompt);

        // 2. Session Intent Envelope (Immutable Contract)
        sections.push(this.formatSIE(envelope));

        // 3. Assembled Context (Knowledge from ContextAssembler)
        if (assembledContext.trim()) {
            sections.push(`\n---\n\n# ASSEMBLED CONTEXT\n\n${assembledContext}`);
        }

        // 4. Final Instructions
        sections.push(this.formatInstructions());

        return sections.join('\n');
    }

    /**
     * Format the Session Intent Envelope as part of the system prompt
     */
    private formatSIE(envelope: SessionIntentEnvelopeImpl): string {
        return `
---

# SESSION INTENT ENVELOPE (IMMUTABLE)

**Session ID:** ${envelope.id}
**World ID:** ${envelope.worldId}
**Goal:** ${envelope.goal || 'Not specified'}
**Audience:** ${envelope.audience || 'Operator'}
**Constraints:**
${envelope.constraints.length > 0 ? envelope.constraints.map(c => `- ${c}`).join('\n') : '- None'}

**Sealed:** ${envelope.isSealed() ? 'YES' : 'NO'}

> **CRITICAL:** You MUST respect this intent envelope. Any output that drifts from the stated goal or violates constraints is a governance violation.
`;
    }

    /**
     * Format final instructions for the LLM
     */
    private formatInstructions(): string {
        return `
---

# EXECUTION INSTRUCTIONS

1. **Respect Intent:** All responses must align with the Session Intent Envelope above.
2. **Use Context:** The assembled context contains knowledge relevant to this session. Reference it when applicable.
3. **Stay in Role:** Execute within your Agent's defined role and constraints.
4. **Explicit Reasoning:** If the user's query is ambiguous, ask for clarification rather than assuming intent.
5. **Operator Supremacy:** The Operator (user) is the ultimate authority. If uncertain, defer to them.
`;
    }
}
