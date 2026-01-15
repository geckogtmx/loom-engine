import { CheckpointData, CheckpointTrigger, CheckpointConfig } from './types';
import { IMemoryLayer } from '../../memory/types';
import { L1ActiveLayer, L2EpisodicLayer } from '../../memory/layers';

export class CheckpointService {
    private config: CheckpointConfig;
    private lastCheckpointTime: number;
    private stepCount: number;

    constructor(config: CheckpointConfig = { timeIntervalMs: 600000, stepInterval: 5 }) {
        this.config = config;
        this.lastCheckpointTime = Date.now();
        this.stepCount = 0;
    }

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
        // In a real implementation, we would serialize L1 generically.
        // For now, we assume L1 has a method to get a snapshot or we iterate.
        // We'll access the private store via any cast or add a method to L1 later.
        const l1Snapshot = {}; // Placeholder for serialization

        const data: CheckpointData = {
            sessionId,
            timestamp: Date.now(),
            trigger,
            state,
            l1Snapshot,
            l2Count: 0 // Placeholder
        };

        // Reset counters
        this.lastCheckpointTime = Date.now();
        if (trigger === CheckpointTrigger.STEP_COUNT) {
            this.stepCount = 0;
        }

        // TODO: Persist to disk/DB (Draft mode)
        console.log(`[Checkpoint] Created for session ${sessionId} via ${trigger}`);

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
