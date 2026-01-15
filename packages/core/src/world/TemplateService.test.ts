import { describe, it, expect } from 'vitest';
import { TemplateService } from './TemplateService';

describe('TemplateService', () => {
    it('should seed default templates on initialization', async () => {
        const service = new TemplateService();

        // Allow async seed to complete
        await new Promise(resolve => setTimeout(resolve, 100));

        const templates = await service.getAll();
        expect(templates.length).toBeGreaterThanOrEqual(2);

        const podcast = templates.find(t => t.name === 'Podcast Production');
        expect(podcast).toBeDefined();
        expect(podcast?.config.allowedAgents).toContain('Atlas');
        expect(podcast?.config.allowedPatterns).toContain('PODCAST_EPISODE_DISCOVERY');

        const research = templates.find(t => t.name === 'Deep Research');
        expect(research).toBeDefined();
    });

    it('should retrieve a template by ID', async () => {
        const service = new TemplateService();
        await new Promise(resolve => setTimeout(resolve, 100));

        const all = await service.getAll();
        const first = all[0];

        const retrieved = await service.getById(first.id);
        expect(retrieved).toEqual(first);
    });
});
