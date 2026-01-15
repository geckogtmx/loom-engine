import { IMemoryLayer } from './types';

export class L4TelosLayer implements IMemoryLayer {
    id = 'L4';
    name = 'Telos Identity';

    async read(key: string): Promise<any> {
        // TODO: Connect to DB via IPC or direct if in main
        return null;
    }

    async write(key: string, value: any): Promise<void> {
        throw new Error('L4 Telos is immutable via standard write. Use Governance Protocol.');
    }

    async clear(): Promise<void> {
        throw new Error('L4 Telos cannot be cleared.');
    }
}

export class L3KnowledgeLayer implements IMemoryLayer {
    id = 'L3';
    name = 'Knowledge Base';

    async read(key: string): Promise<any> {
        // Read from DB/File
        return null;
    }

    async write(key: string, value: any): Promise<void> {
        // Write needs A0 check
        console.warn('L3 write requested:', key);
    }

    async clear(): Promise<void> {
        throw new Error('L3 cannot be cleared massively.');
    }
}

export class L2EpisodicLayer implements IMemoryLayer {
    id = 'L2';
    name = 'Episodic History';
    private worldId: string;

    constructor(worldId: string) {
        this.worldId = worldId;
    }

    async read(key: string): Promise<any> {
        console.log(`[L2:${this.worldId}] Reading ${key}`);
        return null; // Placeholder
    }

    async write(key: string, value: any): Promise<void> {
        console.log(`[L2:${this.worldId}] Writing ${key}`, value);
    }

    async clear(): Promise<void> {
        // Only cleared on specific archival events
        console.log(`[L2:${this.worldId}] Clear requested (ignored safely)`);
    }
}

export class L1ActiveLayer implements IMemoryLayer {
    id = 'L1';
    name = 'Active RAM';
    private store: Map<string, any> = new Map();

    async read(key: string): Promise<any> {
        return this.store.get(key);
    }

    async write(key: string, value: any): Promise<void> {
        this.store.set(key, value);
    }

    async clear(): Promise<void> {
        this.store.clear();
    }
}
