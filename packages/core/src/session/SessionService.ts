import { v4 as uuidv4 } from 'uuid';
import { SessionStateMachine } from './SessionStateMachine';
import { SessionIntentEnvelopeImpl } from './SessionIntentEnvelope';
import { SessionState } from './types';
import { L1ActiveLayer, L2EpisodicLayer, L3KnowledgeLayer } from '../memory/layers';
import { ISessionRepository, ICheckpointRepository } from './repository';
import { CheckpointService } from './checkpoint/CheckpointService';

export class SessionService {
    private stateMachine: SessionStateMachine;
    private envelope: SessionIntentEnvelopeImpl;
    private l1: L1ActiveLayer;
    private l2: L2EpisodicLayer;
    private l3: L3KnowledgeLayer;

    // Services & Repos
    private sessionRepo: ISessionRepository;
    private checkpointService: CheckpointService;

    private startTime: Date;

    constructor(
        worldId: string,
        sessionRepo: ISessionRepository,
        checkpointRepo: ICheckpointRepository
    ) {
        this.sessionRepo = sessionRepo;
        // Checkpoint Service needs repo
        this.checkpointService = new CheckpointService(checkpointRepo);

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

    /**
     * initializes session and persists initial PENDING state
     */
    async initialize(): Promise<void> {
        this.stateMachine.transitionTo(SessionState.INITIALIZING);

        // Persist initial session record
        await this.sessionRepo.create({
            id: this.id,
            worldId: this.envelope.worldId,
            intentEnvelope: this.envelope.toJSON(), // Assuming toJSON exists or we map manually
            state: SessionState.INITIALIZING,
            createdAt: this.startTime
        });

        // Load context from L3 (placeholders for now)
        await this.l3.read('world-config');

        // Initialize L1
        await this.l1.clear();

        this.stateMachine.transitionTo(SessionState.PRIMACY);
        await this.sessionRepo.updateStatus(this.id, SessionState.PRIMACY);
    }

    async setIntent(goal: string, audience: string, constraints: string[]): Promise<void> {
        if (this.state !== SessionState.PRIMACY && this.state !== SessionState.INITIALIZING && this.state !== SessionState.PENDING) {
            throw new Error('Can only set intent during initialization phases.');
        }

        this.envelope.goal = goal;
        this.envelope.audience = audience;
        this.envelope.constraints = constraints;

        // Update envelope in DB
        await this.sessionRepo.updateEnvelope(this.id, this.envelope.toJSON());
    }

    async start(): Promise<void> {
        if (this.state !== SessionState.PRIMACY) {
            throw new Error('Session must be in PRIMACY state to start.');
        }

        // Seal the envelope
        this.envelope.seal();
        await this.sessionRepo.updateEnvelope(this.id, this.envelope.toJSON());

        // Transition to ACTIVE
        this.stateMachine.transitionTo(SessionState.ACTIVE);
        await this.sessionRepo.updateStatus(this.id, SessionState.ACTIVE);
    }

    async end(): Promise<void> {
        if (this.state !== SessionState.ACTIVE && this.state !== SessionState.PRIMACY) {
            // Allow closing from PRIMACY if aborted early
            if (this.state === SessionState.CLOSED) return;
        }

        this.stateMachine.transitionTo(SessionState.SUMMARIZING);
        await this.sessionRepo.updateStatus(this.id, SessionState.SUMMARIZING);

        // Perform summarization logic here (L2 write)
        // await this.l2.write('session-summary', { id: this.id, goal: this.envelope.goal });

        // Flush L1
        await this.l1.clear();

        this.stateMachine.transitionTo(SessionState.CLOSED);
        await this.sessionRepo.close(this.id, new Date());
    }

    async fail(reason: string): Promise<void> {
        console.error(`Session failed: ${reason}`);
        // Create emergency checkpoint
        // await this.checkpointService.createCheckpoint(this.id, CheckpointTrigger.ON_FAILURE, this.state, this.l1, this.l2);

        this.stateMachine.transitionTo(SessionState.FAILED);
        await this.sessionRepo.updateStatus(this.id, SessionState.FAILED);

        // Finalize
        this.stateMachine.transitionTo(SessionState.CLOSED);
        await this.sessionRepo.close(this.id, new Date());
    }
}
