import { WorldService } from './WorldService';
import { World } from './types';

/**
 * WorldManager
 * 
 * Runtime controller for a specific World.
 * Acts as the "local control panel" for the Operator when inside a World.
 * Enforces per-World isolation and governance checks.
 * 
 * @security IPC handlers wrapping this must enforce Zod validation and Rate Limiting.
 */
export class WorldManager {
    private worldId: string;
    private worldService: WorldService;

    constructor(worldId: string, worldService?: WorldService) {
        this.worldId = worldId;
        this.worldService = worldService || new WorldService();
    }

    /**
     * Get the core Purpose of the World (L3)
     */
    async getPurpose(): Promise<string> {
        const world = await this.getWorldOrThrow();
        return world.purpose;
    }

    /**
     * Get the Identity/Telos of the World (L4)
     * TODO: Connect to actual L4 storage
     */
    async getIdentity(): Promise<string> {
        // Placeholder for L4 read
        // In real impl, this would read from world_telos table
        return `Identity for world ${this.worldId}`;
    }

    /**
     * Get assigned Agents for this World (L3 Config)
     * TODO: Connect to world_config table
     */
    async getAgents(): Promise<string[]> {
        // Placeholder
        return ['Atlas', 'Nova'];
    }

    /**
     * Get active threads/sessions (Runtime State)
     * TODO: Connect to world_state table
     */
    async getThreads(): Promise<string[]> {
        // Placeholder
        return [];
    }

    /**
     * Get summary of recent events (L2)
     * TODO: Connect to L2EpisodicLayer
     */
    async getRecentState(): Promise<string> {
        // This would query the L2 layer for this worldId
        return "Recent state summary...";
    }

    private async getWorldOrThrow(): Promise<World> {
        const world = await this.worldService.getById(this.worldId);
        if (!world) {
            throw new Error(`World ${this.worldId} not found`);
        }
        return world;
    }
}
