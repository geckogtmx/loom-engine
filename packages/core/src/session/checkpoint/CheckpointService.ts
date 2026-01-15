import { v4 as uuidv4 } from 'uuid';
import { CheckpointData, CheckpointTrigger, CheckpointConfig } from './types';
import { L1ActiveLayer, L2EpisodicLayer } from '../../memory/layers';
import { ICheckpointRepository } from '../repository';

export class CheckpointService {
    private config: CheckpointConfig;
    private lastCheckpointTime: number;
    private stepCount: number;
    private repository: ICheckpointRepository;

    constructor(
        repository: ICheckpointRepository,
        config: CheckpointConfig = { timeIntervalMs: 600000, stepInterval: 5 }
    ) {
        this.repository = repository;
        this.config = config;
        this.lastCheckpointTime = Date.now();
        this.stepCount = 0;
    }

    // ... shouldCheckpoint remains the same ...
    shouldCheckpoint(trigger: CheckpointTrigger): boolean {
        if (trigger === CheckpointTrigger.MANUAL || trigger === CheckpointTrigger.ON_FAILURE) {
            return true;
        }

        if (trigger === CheckpointTrigger.TIME && this.config.timeIntervalMs) {
            const now = Date.now();
            if (now - this.lastCheckpointTime >= this.config.timeIntervalMs) {
                return true;
            }
        }

        if (trigger === CheckpointTrigger.STEP_COUNT && this.config.stepInterval) {
            if (this.stepCount >= this.config.stepInterval) {
                return true;
            }
        }

        return false;
    }

    async createCheckpoint(
        sessionId: string,
        trigger: CheckpointTrigger,
        state: string,
        l1: L1ActiveLayer,
        l2: L2EpisodicLayer
    ): Promise<CheckpointData> {
        // Pseudo-snapshot of L1
        // In reality, L1 should provide a serializable export
        const l1Snapshot = JSON.stringify({});

        const data: CheckpointData = {
            sessionId,
            timestamp: Date.now(),
            trigger,
            state,
            l1Snapshot: {}, // This type might need adjustment if CheckpointData expects object, repo expects string
            l2Count: 0
        };

        // Persist
        await this.repository.create({
            id: uuidv4(),
            sessionId,
            trigger,
            l1Snapshot,
            stepCount: this.stepCount,
            createdAt: new Date(data.timestamp)
        });

        // Reset counters
        this.lastCheckpointTime = Date.now();
        if (trigger === CheckpointTrigger.STEP_COUNT) {
            this.stepCount = 0;
        }

        console.log(`[Checkpoint] Created and persisted for session ${sessionId} via ${trigger}`);

        return data;
    }

    incrementStep() {
        this.stepCount++;
    }

    async restore(checkpoint: CheckpointData, l1: L1ActiveLayer): Promise<void> {
        console.log(`[Checkpoint] Restoring session ${checkpoint.sessionId} from ${checkpoint.timestamp}`);
        // Restore L1 state
        // await l1.restore(checkpoint.l1Snapshot);
    }
}
