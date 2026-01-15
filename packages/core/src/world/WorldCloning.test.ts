import { describe, it, expect, beforeEach } from 'vitest';
import { WorldService } from './WorldService';
import { InMemoryWorldRepository, InMemoryWorldTelosRepository, InMemoryWorldConfigRepository } from './test-utils';
import { WorldStatus, WorldEvent } from './types';
import { TemplateService } from './TemplateService';

describe('WorldCloning Integration', () => {
    let worldService: WorldService;
    let telosRepository: InMemoryWorldTelosRepository;
    let configRepository: InMemoryWorldConfigRepository;

    beforeEach(() => {
        telosRepository = new InMemoryWorldTelosRepository();
        configRepository = new InMemoryWorldConfigRepository();
        worldService = new WorldService(
            new InMemoryWorldRepository(),
            telosRepository,
            configRepository,
            new TemplateService()
        );
    });

    it('should clone a World with fresh L2 but copied Telos and Config', async () => {
        // 1. Setup Source World
        const source = await worldService.create({ name: 'Source World', purpose: 'Original Purpose' });

        // Add Telos
        await telosRepository.set(source.id, '# Source Identity');

        // Add Config
        await configRepository.set(source.id, {
            allowedAgens: ['Agent-A'],
            constraints: { strict: true }
        } as any);

        // 2. Execute Clone
        const clone = await worldService.cloneWorld({
            sourceWorldId: source.id,
            nameOverride: 'Cloned World',
            operatorId: 'op-1'
        });

        // 3. Verify Clone Identity
        expect(clone.id).not.toBe(source.id);
        expect(clone.name).toBe('Cloned World'); // Overridden
        expect(clone.purpose).toBe('Original Purpose'); // Inherited
        expect(clone.status).toBe(WorldStatus.DORMANT);

        // 4. Verify Telos Copied
        const clonedTelos = await telosRepository.get(clone.id);
        expect(clonedTelos).toBeDefined();
        expect(clonedTelos?.content).toBe('# Source Identity');
        expect(clonedTelos?.id).not.toBe(source.id); // New ID for the Telos record

        // 5. Verify Config Copied
        const clonedConfig = await configRepository.get(clone.id);
        expect(clonedConfig).toBeDefined();
        expect(clonedConfig?.constraints).toEqual({ strict: true });
        expect(clonedConfig?.id).not.toBe(source.id);

        // 6. Verify Events
        const events = worldService.getEventLog();
        const cloneEvent = events.find(e => e.worldId === clone.id);
        expect(cloneEvent).toBeDefined();
        expect(cloneEvent?.event).toBe(WorldEvent.CREATED);
        expect(cloneEvent?.data?.clonedFrom).toBe(source.id);
    });

    it('should throw if source world does not exist', async () => {
        const missingId = '00000000-0000-0000-0000-000000000000';
        await expect(worldService.cloneWorld({
            sourceWorldId: missingId
        })).rejects.toThrow(`Source World ${missingId} not found`);
    });

    it('should handle cloning a world with no explicit Telos/Config gracefully', async () => {
        const source = await worldService.create({ name: 'Empty World', purpose: 'Empty' });

        const clone = await worldService.cloneWorld({
            sourceWorldId: source.id
        });

        expect(clone.name).toBe('Copy of Empty World');

        const clonedTelos = await telosRepository.get(clone.id);
        expect(clonedTelos).toBeNull(); // Should be null if source was null
    });
});
