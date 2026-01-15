import { SessionState } from '../types';
import { ISessionRepository, ICheckpointRepository } from '../repository';
import { SessionService } from '../SessionService';

export interface IncompleteSession {
    sessionId: string;
    worldId: string;
    state: SessionState;
    lastCheckpointId?: string;
    lastActivityTime: number;
}

export enum RecoveryAction {
    RESUME = 'RESUME',           // Resume from last checkpoint
    SUMMARIZE = 'SUMMARIZE',     // Generate partial summary and close
    DISCARD = 'DISCARD'          // Discard entirely
}

/**
 * SessionRecoveryService
 * Detects and handles incomplete sessions on startup.
 */
export class SessionRecoveryService {
    private incompleteSessions: IncompleteSession[] = [];

    constructor(
        private sessionRepo: ISessionRepository,
        private checkpointRepo: ICheckpointRepository
    ) { }

    /**
     * Scan for incomplete sessions.
     */
    async detectIncompleteSessions(): Promise<IncompleteSession[]> {
        console.log('[Recovery] Scanning for incomplete sessions...');

        const activeSessions = await this.sessionRepo.listIncomplete();

        this.incompleteSessions = activeSessions.map(s => ({
            sessionId: s.id,
            worldId: s.worldId,
            state: s.state,
            lastActivityTime: s.createdAt.getTime() // Approx
        }));

        return this.incompleteSessions;
    }

    /**
     * Get list of detected incomplete sessions.
     */
    getIncompleteSessions(): IncompleteSession[] {
        return this.incompleteSessions;
    }

    /**
     * Handle recovery of a specific session.
     */
    async recover(sessionId: string, action: RecoveryAction): Promise<boolean> {
        const sessionData = await this.sessionRepo.getById(sessionId);
        if (!sessionData) {
            console.error(`[Recovery] Session ${sessionId} not found in DB.`);
            return false;
        }

        switch (action) {
            case RecoveryAction.RESUME:
                console.log(`[Recovery] Resuming session ${sessionId} from checkpoint.`);
                // 1. Get latest checkpoint
                const checkpoint = await this.checkpointRepo.getLatestForSession(sessionId);
                if (checkpoint) {
                    // 2. Restore L1 from checkpoint (Pseudo-code)
                    // const service = new SessionService(sessionData.worldId, this.sessionRepo, this.checkpointRepo);
                    // await service.restore(checkpoint);
                }
                break;

            case RecoveryAction.SUMMARIZE:
                console.log(`[Recovery] Generating partial summary for session ${sessionId}.`);
                // 1. Generate summary
                // 2. Close session
                await this.sessionRepo.close(sessionId, new Date());
                break;

            case RecoveryAction.DISCARD:
                console.log(`[Recovery] Discarding session ${sessionId}.`);
                // Just close it without summary
                await this.sessionRepo.close(sessionId, new Date());
                break;
        }

        return true;
    }
}
