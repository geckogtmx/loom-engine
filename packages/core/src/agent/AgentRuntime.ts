import { AgentProfile, AgentTelos, AgentMode } from './types';
import { WorldConfig } from '../world/types';

export class AgentRuntime {
    private profile: AgentProfile;
    private telos: AgentTelos;
    private modes: Map<string, AgentMode>;
    private worldConfig?: WorldConfig;

    constructor(
        profile: AgentProfile,
        telos: AgentTelos,
        modes: AgentMode[] = [],
        worldConfig?: WorldConfig
    ) {
        this.profile = profile;
        this.telos = telos;
        this.modes = new Map(modes.map(m => [m.name, m]));
        this.worldConfig = worldConfig;
    }

    /**
     * Composites the System Prompt from Telos, Profile, and Active Mode.
     * @param modeName Optional name of the mode to activate (e.g., "Deep Dive Mode")
     */
    getSystemPrompt(modeName?: string): string {
        const sections: string[] = [];

        // 1. Identity (Telos) - The immutable core
        sections.push(this.telos.content);

        // 2. Profile Context (Role)
        sections.push(`\n---\n\n# OPERATIONAL CONTEXT\nRole: ${this.profile.role}\nDescription: ${this.profile.description}`);

        // 3. Mode Behavior (if requested)
        if (modeName) {
            const mode = this.modes.get(modeName);
            if (mode) {
                sections.push(`\n---\n\n# ACTIVE MODE: ${mode.name}\n\n${mode.behavior}`);
            } else {
                console.warn(`[AgentRuntime] Mode '${modeName}' requested but not found for agent ${this.profile.name}`);
            }
        }

        // 4. World Constraints (L3)
        if (this.worldConfig?.constraints) {
            const constraints = this.worldConfig.constraints;
            const constraintList = Object.entries(constraints)
                .map(([key, value]) => `- ${key}: ${value}`)
                .join('\n');

            if (constraintList.length > 0) {
                sections.push(`\n---\n\n# WORLD CONSTRAINTS (STRICT)\n\n${constraintList}`);
            }
        }

        // 4. Default Mode (if no specific mode requested, check for a "Default" mode in map?)
        // For now, we assume Telos covers default behavior unless overridden.

        return sections.join('\n');
    }

    /**
     * Resolves the model to use based on profile preferences and system defaults.
     * @param preferenceOverride Optional override for this specific call
     */
    getEffectiveModel(preferenceOverride?: string): string {
        // 1. Explicit override
        if (preferenceOverride) return preferenceOverride;

        // 2. Profile Preferred
        if (this.profile.modelPreferences?.preferred) {
            return this.profile.modelPreferences.preferred;
        }

        // 3. Profile Secondary
        if (this.profile.modelPreferences?.secondary) {
            return this.profile.modelPreferences.secondary;
        }

        // 4. System Default (Hardcoded fallback for now)
        return 'openai:gpt-4o';
    }

    /**
     * Checks if the user query triggers an escalation.
     * @param userQuery The user's input text
     */
    shouldEscalate(userQuery: string): boolean {
        // Placeholder simple regex - will be expanded in Phase 5
        const escalationTriggers = [
            /escalate to human/i,
            /talk to operator/i,
            /call operator/i
        ];

        return escalationTriggers.some(regex => regex.test(userQuery));
    }
}
