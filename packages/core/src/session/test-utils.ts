import { ISessionRepository, ICheckpointRepository, SessionData, CheckpointRecord } from './repository';
import { SessionState } from './types';

export class InMemorySessionRepository implements ISessionRepository {
    private sessions: Map<string, SessionData> = new Map();

    async create(data: Omit<SessionData, 'closedAt'>): Promise<SessionData> {
        const session: SessionData = { ...data };
        this.sessions.set(session.id, session);
        return session;
    }

    async getById(id: string): Promise<SessionData | null> {
        return this.sessions.get(id) || null;
    }

    async updateStatus(id: string, status: SessionState): Promise<void> {
        const session = this.sessions.get(id);
        if (session) {
            session.state = status;
            this.sessions.set(id, session);
        }
    }

    async updateEnvelope(id: string, envelope: any): Promise<void> {
        const session = this.sessions.get(id);
        if (session) {
            session.intentEnvelope = envelope;
            this.sessions.set(id, session);
        }
    }

    async close(id: string, closedAt: Date): Promise<void> {
        const session = this.sessions.get(id);
        if (session) {
            session.state = SessionState.CLOSED;
            session.closedAt = closedAt;
            this.sessions.set(id, session);
        }
    }

    async listActive(worldId: string): Promise<SessionData[]> {
        return Array.from(this.sessions.values())
            .filter(s => s.worldId === worldId && s.state !== SessionState.CLOSED);
    }

    async listIncomplete(): Promise<SessionData[]> {
        return Array.from(this.sessions.values())
            .filter(s => s.state !== SessionState.CLOSED);
    }
}

export class InMemoryCheckpointRepository implements ICheckpointRepository {
    private checkpoints: CheckpointRecord[] = [];

    async create(data: CheckpointRecord): Promise<CheckpointRecord> {
        this.checkpoints.push(data);
        return data;
    }

    async getLatestForSession(sessionId: string): Promise<CheckpointRecord | null> {
        const sessionCheckpoints = this.checkpoints
            .filter(c => c.sessionId === sessionId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return sessionCheckpoints.length > 0 ? sessionCheckpoints[0] : null;
    }

    async deleteOld(sessionId: string, keepCount: number): Promise<void> {
        // Simplistic implementation
        const sessionCheckpoints = this.checkpoints
            .filter(c => c.sessionId === sessionId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (sessionCheckpoints.length <= keepCount) return;

        const toKeep = sessionCheckpoints.slice(0, keepCount).map(c => c.id);
        this.checkpoints = this.checkpoints.filter(c => c.sessionId !== sessionId || toKeep.includes(c.id));
    }
}
