import { v4 as uuidv4 } from 'uuid';
import {
    World,
    WorldStatus,
    WorldEvent,
    WorldEventPayload,
    CreateWorldInput,
    CreateWorldInputSchema,
    UpdateWorldInput,
    UpdateWorldInputSchema,
    CreateFromTemplateInput,
    CreateFromTemplateInputSchema,
    CloneWorldInput,
    CloneWorldInputSchema,
} from './types';
import {
    IWorldRepository,
    IWorldTelosRepository,
    IWorldConfigRepository
} from './repository';
import { TemplateService } from './TemplateService';

/**
 * WorldService
 * Manages World lifecycle including creation, activation, and archival.
 */
export class WorldService {
    private repository: IWorldRepository;
    private telosRepository: IWorldTelosRepository;
    private configRepository: IWorldConfigRepository;
    private activeWorldId: string | null = null;
    private eventLog: WorldEventPayload[] = [];
    private templateService: TemplateService;

    constructor(
        repository: IWorldRepository,
        telosRepository: IWorldTelosRepository,
        configRepository: IWorldConfigRepository,
        templateService?: TemplateService,
    ) {
        this.repository = repository;
        this.telosRepository = telosRepository;
        this.configRepository = configRepository;
        this.templateService = templateService || new TemplateService();
    }

    // ============================================
    // CRUD Operations
    // ============================================

    async create(input: CreateWorldInput): Promise<World> {
        // Validate input
        const validated = CreateWorldInputSchema.parse(input);

        const world = await this.repository.create({
            id: uuidv4(),
            name: validated.name,
            purpose: validated.purpose,
            status: WorldStatus.DORMANT,
            operatorId: validated.operatorId
        });

        // Initialize empty Telos and Config? 
        // Or wait for specific actions?
        // Codex says "Silence by Default". We don't auto-create content unless requested.
        // But we might want basic record existence.

        // For now, adhere to explicit creation.

        this.emitEvent(WorldEvent.CREATED, world.id);
        return world;
    }

    async createFromTemplate(input: CreateFromTemplateInput): Promise<World> {
        // Validate input
        const validated = CreateFromTemplateInputSchema.parse(input);

        // Fetch Template
        const template = await this.templateService.getById(validated.templateId);
        if (!template) {
            throw new Error(`Template ${validated.templateId} not found`);
        }

        // Create World with Template defaults
        // Create World with Template defaults
        const world = await this.repository.create({
            id: uuidv4(),
            name: validated.nameOverride || template.name,
            purpose: validated.purposeOverride || template.description,
            status: WorldStatus.DORMANT,
            operatorId: validated.operatorId
        });

        // Copy Telos (L4)
        await this.telosRepository.set(world.id, template.telos);

        // Copy Config (L3)
        await this.configRepository.set(world.id, template.config);

        this.emitEvent(WorldEvent.CREATED, world.id, { fromTemplate: template.id });
        return world;
    }

    async cloneWorld(input: CloneWorldInput): Promise<World> {
        const validated = CloneWorldInputSchema.parse(input);

        // 1. Verify source exists
        const sourceWorld = await this.repository.getById(validated.sourceWorldId);
        if (!sourceWorld) {
            throw new Error(`Source World ${validated.sourceWorldId} not found`);
        }

        // 2. Fetch Source Telos & Config
        const sourceTelos = await this.telosRepository.get(sourceWorld.id);
        const sourceConfig = await this.configRepository.get(sourceWorld.id);

        if (!sourceTelos) {
            console.warn(`[WorldService] Cloning World ${sourceWorld.id} but Telos is missing.`);
        }

        // 3. Create New World
        // 3. Create New World
        const newWorld = await this.repository.create({
            id: uuidv4(),
            name: validated.nameOverride || `Copy of ${sourceWorld.name}`,
            purpose: validated.purposeOverride || sourceWorld.purpose,
            status: WorldStatus.DORMANT,
            operatorId: validated.operatorId || sourceWorld.operatorId
        });

        // 4. Write Source Telos to New World
        if (sourceTelos) {
            await this.telosRepository.set(newWorld.id, sourceTelos.content);
        }

        // 5. Write Source Config to New World
        if (sourceConfig) {
            const { id, worldId, createdAt, updatedAt, ...configData } = sourceConfig;
            await this.configRepository.set(newWorld.id, configData);
        }

        this.emitEvent(WorldEvent.CREATED, newWorld.id, { clonedFrom: sourceWorld.id });
        return newWorld;
    }

    async getById(id: string): Promise<World | null> {
        return this.repository.getById(id);
    }

    async getAll(): Promise<World[]> {
        return this.repository.getAll();
    }

    async update(id: string, input: UpdateWorldInput): Promise<World> {
        // Validate input
        const validated = UpdateWorldInputSchema.parse(input);

        const world = await this.repository.update(id, validated);
        this.emitEvent(WorldEvent.UPDATED, id);
        return world;
    }

    async archive(id: string): Promise<void> {
        // Deactivate first if active
        if (this.activeWorldId === id) {
            await this.deactivate(id);
        }

        await this.repository.update(id, { status: WorldStatus.ARCHIVED });
        this.emitEvent(WorldEvent.ARCHIVED, id);
    }

    async delete(id: string): Promise<void> {
        // Logic:
        // 1. Check if active -> Deactivate
        // 2. Delete Telos -> Repository should handle this or we do it explicitly
        // 3. Delete Config
        // 4. Delete World

        if (this.activeWorldId === id) {
            await this.deactivate(id);
        }

        await this.telosRepository.delete(id);
        await this.configRepository.delete(id);
        await this.repository.delete(id);

        this.emitEvent(WorldEvent.DELETED, id);
    }

    // ============================================
    // Activation Logic
    // ============================================

    async activate(id: string): Promise<void> {
        const world = await this.repository.getById(id);
        if (!world) {
            throw new Error(`World ${id} not found`);
        }

        if (world.status === WorldStatus.ARCHIVED) {
            throw new Error('Cannot activate an archived World. Unarchive first.');
        }

        // Deactivate current world if different
        if (this.activeWorldId && this.activeWorldId !== id) {
            await this.deactivate(this.activeWorldId);
        }

        await this.repository.update(id, { status: WorldStatus.ACTIVE });
        this.activeWorldId = id;
        this.emitEvent(WorldEvent.ACTIVATED, id);
    }

    async deactivate(id: string): Promise<void> {
        if (this.activeWorldId !== id) {
            return; // Not active, nothing to do
        }

        await this.repository.update(id, { status: WorldStatus.DORMANT });
        this.activeWorldId = null;
        this.emitEvent(WorldEvent.DEACTIVATED, id);
    }

    async getActiveWorld(): Promise<World | null> {
        if (!this.activeWorldId) {
            return null;
        }
        return this.repository.getById(this.activeWorldId);
    }

    // ============================================
    // Event System
    // ============================================

    private emitEvent(event: WorldEvent, worldId: string, data?: Record<string, any>): void {
        const payload: WorldEventPayload = {
            event,
            worldId,
            timestamp: new Date(),
            data
        };
        this.eventLog.push(payload);
        // In real implementation, emit to event bus
        // console.log(`[WorldService] ${event}: ${worldId}`);
    }

    getEventLog(): WorldEventPayload[] {
        return [...this.eventLog];
    }
}
