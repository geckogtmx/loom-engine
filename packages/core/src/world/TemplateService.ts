import { v4 as uuidv4 } from 'uuid';
import { WorldTemplate, ITemplateRepository } from './types';

export class InMemoryTemplateRepository implements ITemplateRepository {
    private templates: Map<string, WorldTemplate> = new Map();

    async create(data: Omit<WorldTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorldTemplate> {
        const now = new Date();
        const template: WorldTemplate = {
            id: uuidv4(),
            ...data,
            createdAt: now,
            updatedAt: now
        };
        this.templates.set(template.id, template);
        return template;
    }

    async getById(id: string): Promise<WorldTemplate | null> {
        return this.templates.get(id) || null;
    }

    async getAll(): Promise<WorldTemplate[]> {
        return Array.from(this.templates.values());
    }
}

export class TemplateService {
    private repository: ITemplateRepository;

    constructor(repository?: ITemplateRepository) {
        this.repository = repository || new InMemoryTemplateRepository();
        // Auto-seed defaults for prototype
        this.seedDefaults().catch(console.error);
    }

    async getAll(): Promise<WorldTemplate[]> {
        return this.repository.getAll();
    }

    async getById(id: string): Promise<WorldTemplate | null> {
        return this.repository.getById(id);
    }

    /**
     * Seeds default templates if they don't exist.
     * In production, this would be a DB migration or seed script.
     */
    async seedDefaults(): Promise<void> {
        const existing = await this.repository.getAll();
        if (existing.length > 0) return;

        // 1. Podcast World Template
        await this.repository.create({
            name: 'Podcast Production',
            description: 'A World optimized for planning, researching, and scripting podcast episodes.',
            telos: `
# World Telos: Signalcast Support
- Serve the core audience.
- Prioritize clarity and honesty.
- No hype or clickbait.
- Calm, thoughtful tone.
            `.trim(),
            config: {
                allowedAgents: ['Atlas', 'Nova', 'Miles', 'SAM', 'Mark'],
                allowedPatterns: [
                    'PODCAST_EPISODE_DISCOVERY',
                    'PODCAST_EPISODE_RESEARCH',
                    'PODCAST_EPISODE_OUTLINE',
                    'PODCAST_EPISODE_SCRIPT',
                    'PODCAST_EPISODE_PRODUCTION_PREP',
                    'PODCAST_EPISODE_POSTMORTEM'
                ],
                constraints: {
                    defaultClassification: 'PRIVATE_LOCAL'
                }
            }
        });

        // 2. Research World Template
        await this.repository.create({
            name: 'Deep Research',
            description: 'A World for synthesizing complex topics from papers and data.',
            telos: `
# World Telos: Deep Research
- Rigorous fact-checking.
- Synthesis over summary.
- Traceable citations required.
            `.trim(),
            config: {
                allowedAgents: ['Atlas', 'SAM'],
                allowedPatterns: ['DEEP_READ', 'SYNTHESIS_LOOP', 'GAP_ANALYSIS'],
                constraints: {
                    defaultClassification: 'PRIVATE_LOCAL'
                }
            }
        });

        console.log('[TemplateService] Seeded default templates.');
    }
}
