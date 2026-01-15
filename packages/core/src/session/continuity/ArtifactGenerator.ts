import { ContinuityArtifact, Decision, StateChange } from './schema';
import { SessionIntentEnvelopeImpl } from '../SessionIntentEnvelope';

/**
 * ArtifactGenerator
 * Responsible for creating structured L2 summaries from session data.
 */
export class ArtifactGenerator {
    private decisions: Decision[] = [];
    private stateChanges: StateChange[] = [];
    private openQuestions: string[] = [];
    private nextSteps: string[] = [];
    private checkpointRefs: string[] = [];

    constructor(
        private sessionId: string,
        private worldId: string,
        private envelope: SessionIntentEnvelopeImpl
    ) { }

    addDecision(description: string, rationale?: string): void {
        this.decisions.push({
            id: `dec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            description,
            rationale,
            timestamp: Date.now()
        });
    }

    addStateChange(layer: 'L1' | 'L2' | 'L3', key: string, action: 'CREATE' | 'UPDATE' | 'DELETE', summary?: string): void {
        this.stateChanges.push({ layer, key, action, summary });
    }

    addOpenQuestion(question: string): void {
        this.openQuestions.push(question);
    }

    addNextStep(step: string): void {
        this.nextSteps.push(step);
    }

    addCheckpointRef(checkpointId: string): void {
        this.checkpointRefs.push(checkpointId);
    }

    generate(status: 'DRAFT' | 'FINAL' = 'FINAL'): ContinuityArtifact {
        return {
            version: '1.0',
            sessionId: this.sessionId,
            worldId: this.worldId,
            createdAt: Date.now(),
            intent: {
                goal: this.envelope.goal,
                audience: this.envelope.audience,
                constraints: this.envelope.constraints
            },
            decisions: this.decisions,
            stateChanges: this.stateChanges,
            openQuestions: this.openQuestions,
            nextSteps: this.nextSteps,
            checkpointRefs: this.checkpointRefs.length > 0 ? this.checkpointRefs : undefined,
            status
        };
    }

    toJSON(): string {
        return JSON.stringify(this.generate(), null, 2);
    }
}
