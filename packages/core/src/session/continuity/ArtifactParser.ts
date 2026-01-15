import { ContinuityArtifact, ContinuityArtifactSchema } from './schema';

/**
 * ArtifactParser
 * Responsible for reading and validating L2 artifacts for session resumption.
 */
export class ArtifactParser {
    /**
     * Parse a JSON string into a validated ContinuityArtifact.
     * Throws if validation fails.
     */
    static parse(jsonString: string): ContinuityArtifact {
        const data = JSON.parse(jsonString);
        return ContinuityArtifactSchema.parse(data);
    }

    /**
     * Safely parse without throwing. Returns null on failure.
     */
    static safeParse(jsonString: string): ContinuityArtifact | null {
        try {
            const data = JSON.parse(jsonString);
            const result = ContinuityArtifactSchema.safeParse(data);
            return result.success ? result.data : null;
        } catch {
            return null;
        }
    }

    /**
     * Extract resumption context from an artifact.
     * Used to seed a new session with prior state.
     */
    static extractResumptionContext(artifact: ContinuityArtifact): ResumptionContext {
        return {
            previousSessionId: artifact.sessionId,
            worldId: artifact.worldId,
            originalGoal: artifact.intent.goal,
            openQuestions: artifact.openQuestions,
            nextSteps: artifact.nextSteps,
            lastDecisions: artifact.decisions.slice(-5), // Last 5 decisions
            hasCheckpoints: (artifact.checkpointRefs?.length ?? 0) > 0
        };
    }
}

export interface ResumptionContext {
    previousSessionId: string;
    worldId: string;
    originalGoal: string;
    openQuestions: string[];
    nextSteps: string[];
    lastDecisions: { id: string; description: string }[];
    hasCheckpoints: boolean;
}
