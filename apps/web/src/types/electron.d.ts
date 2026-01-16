import { CreateWorldInput, World, UpdateWorldInput } from '@loom/core';

export interface WorldApi {
    create: (input: CreateWorldInput) => Promise<World>;
    get: (id: string) => Promise<World | null>;
    list: () => Promise<World[]>;
    update: (id: string, input: UpdateWorldInput) => Promise<World>;
    delete: (id: string) => Promise<void>;
}

export interface SessionApi {
    create: (worldId: string) => Promise<any>;
    list: (worldId: string) => Promise<any[]>;
    initialize: (sessionId: string) => Promise<void>;
    setIntent: (sessionId: string, goal: string, audience: string, constraints: string[]) => Promise<any>;
    start: (sessionId: string) => Promise<any>;
    end: (sessionId: string) => Promise<void>;
    getState: (sessionId: string) => Promise<any>;
    detectIncomplete: () => Promise<any[]>;
    recover: (sessionId: string, action: string) => Promise<any>;
}

declare global {
    interface Window {
        api: {
            world: WorldApi;
            session: SessionApi;
            window: {
                close: () => Promise<void>;
            };
        };
    }
}
