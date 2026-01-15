import { SessionStateMachine } from './SessionStateMachine';
import { SessionIntentEnvelopeImpl } from './SessionIntentEnvelope';
import { SessionState, SessionContext } from './types';
import { L1ActiveLayer, L2EpisodicLayer, L3KnowledgeLayer } from '../memory/layers';

export class SessionService {
    private stateMachine: SessionStateMachine;
    private envelope: SessionIntentEnvelopeImpl;
    private l1: L1ActiveLayer;
    private l2: L2EpisodicLayer;
    private l3: L3KnowledgeLayer;

    private startTime: Date;

    constructor(worldId: string) {
        this.stateMachine = new SessionStateMachine();
        this.envelope = new SessionIntentEnvelopeImpl(worldId);

        // Initialize memory layers
        this.l1 = new L1ActiveLayer();
        this.l2 = new L2EpisodicLayer(worldId);
        this.l3 = new L3KnowledgeLayer();

        this.startTime = new Date();
    }

    get id(): string {
        return this.envelope.id;
    }

    get state(): SessionState {
        return this.stateMachine.state;
    }

    get intentEnvelope(): SessionIntentEnvelopeImpl {
        return this.envelope;
    }

    async initialize(): Promise<void> {
        this.stateMachine.transitionTo(SessionState.INITIALIZING);

        // Load context from L3 (placeholders for now)
        await this.l3.read('world-config');

        // Initialize L1
        await this.l1.clear();

        this.stateMachine.transitionTo(SessionState.PRIMACY);
    }

    async setIntent(goal: string, audience: string, constraints: string[]): Promise<void> {
        if (this.state !== SessionState.PRIMACY && this.state !== SessionState.INITIALIZING && this.state !== SessionState.PENDING) {
            throw new Error('Can only set intent during initialization phases.');
        }

        this.envelope.goal = goal;
        this.envelope.audience = audience;
        this.envelope.constraints = constraints;
    }

    async start(): Promise<void> {
        if (this.state !== SessionState.PRIMACY) {
            throw new Error('Session must be in PRIMACY state to start.');
        }

        // Seal the envelope
        this.envelope.seal();

        // Transition to ACTIVE
        this.stateMachine.transitionTo(SessionState.ACTIVE);
    }

    async end(): Promise<void> {
        if (this.state !== SessionState.ACTIVE) {
            // Allow closing from other states if needed, but primarily ACTIVE
            // For now, let's allow closing from anywhere except CLOSED
            if (this.state === SessionState.CLOSED) return;
        }

        this.stateMachine.transitionTo(SessionState.SUMMARIZING);

        // Perform summarization logic here (L2 write)
        await this.l2.write('session-summary', { id: this.id, goal: this.envelope.goal });

        // Flush L1
        await this.l1.clear();

        this.stateMachine.transitionTo(SessionState.CLOSED);
    }

    async fail(reason: string): Promise<void> {
        // Log failure
        console.error(`Session failed: ${reason}`);
        this.stateMachine.transitionTo(SessionState.FAILED);
        // Clean up?
        this.stateMachine.transitionTo(SessionState.CLOSED);
    }
}
