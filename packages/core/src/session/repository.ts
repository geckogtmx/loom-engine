import { SessionState, CheckpointData, CheckpointTrigger } from './types';

export interface SessionData {
    id: string;
    worldId: string;
    intentEnvelope: any; // JSON
    state: SessionState;
    createdAt: Date;
    closedAt?: Date;
}

export interface ISessionRepository {
    create(data: Omit<SessionData, 'closedAt'>): Promise<SessionData>;
    getById(id: string): Promise<SessionData | null>;
    updateStatus(id: string, status: SessionState): Promise<void>;
    updateEnvelope(id: string, envelope: any): Promise<void>;
    close(id: string, closedAt: Date): Promise<void>;
    list(worldId: string): Promise<SessionData[]>;
    listActive(worldId: string): Promise<SessionData[]>;
    listIncomplete(): Promise<SessionData[]>;
}

export interface CheckpointRecord {
    id: string;
    sessionId: string;
    trigger: string;
    l1Snapshot: string; // JSON
    stepCount: number;
    createdAt: Date;
}

export interface ICheckpointRepository {
    create(data: CheckpointRecord): Promise<CheckpointRecord>;
    getLatestForSession(sessionId: string): Promise<CheckpointRecord | null>;
    deleteOld(sessionId: string, keepCount: number): Promise<void>;
}
