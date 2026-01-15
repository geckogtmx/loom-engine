import { describe, it, expect } from 'vitest';
import { AgentRuntime } from './AgentRuntime';
import { AgentProfile, AgentTelos, AgentMode } from './types';
import { WorldConfig } from '../world/types';
import { v4 as uuidv4 } from 'uuid';

describe('AgentRuntime', () => {
    const mockProfile: AgentProfile = {
        id: uuidv4(),
        worldId: uuidv4(),
        name: 'TestAgent',
        role: 'Tester',
        description: 'Tests things.',
        modelPreferences: {
            preferred: 'openai:gpt-4',
            secondary: 'anthropic:claude-2'
        },
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockTelos: AgentTelos = {
        id: uuidv4(),
        agentId: mockProfile.id,
        content: 'I am a Test Agent.',
        updatedAt: new Date()
    };

    const mockModes: AgentMode[] = [
        {
            id: uuidv4(),
            agentId: mockProfile.id,
            name: 'Debug Mode',
            description: 'Debugging',
            trigger: 'Debug',
            behavior: 'Output verbose logs.',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    it('should generate a base system prompt', () => {
        const runtime = new AgentRuntime(mockProfile, mockTelos);
        const prompt = runtime.getSystemPrompt();

        expect(prompt).toContain('I am a Test Agent.');
        expect(prompt).toContain('Role: Tester');
        expect(prompt).not.toContain('Debug Mode');
    });

    it('should include mode instructions when requested', () => {
        const runtime = new AgentRuntime(mockProfile, mockTelos, mockModes);
        const prompt = runtime.getSystemPrompt('Debug Mode');

        expect(prompt).toContain('ACTIVE MODE: Debug Mode');
        expect(prompt).toContain('Output verbose logs.');
    });

    it('should fallback to base prompts if mode not found', () => {
        const runtime = new AgentRuntime(mockProfile, mockTelos, mockModes);
        const prompt = runtime.getSystemPrompt('NonExistentMode');

        expect(prompt).toContain('I am a Test Agent.');
        expect(prompt).not.toContain('ACTIVE MODE');
    });

    it('should resolve effective model based on preferences', () => {
        const runtime = new AgentRuntime(mockProfile, mockTelos);

        // 1. Preferred
        expect(runtime.getEffectiveModel()).toBe('openai:gpt-4');

        // 2. Override
        expect(runtime.getEffectiveModel('custom:model')).toBe('custom:model');
    });

    it('should detect escalation triggers', () => {
        const runtime = new AgentRuntime(mockProfile, mockTelos);

        expect(runtime.shouldEscalate('Please escalate to human')).toBe(true);
        expect(runtime.shouldEscalate('Hello agent')).toBe(false);
    });

    it('should append WORLD CONSTRAINTS if present in config', () => {
        const mockConfig: WorldConfig = {
            id: uuidv4(),
            worldId: mockProfile.worldId,
            constraints: {
                'Safe Mode': 'Enabled',
                'Topic Ban': 'Crypto'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const runtime = new AgentRuntime(mockProfile, mockTelos, [], mockConfig);
        const prompt = runtime.getSystemPrompt();

        expect(prompt).toContain('WORLD CONSTRAINTS (STRICT)');
        expect(prompt).toContain('- Safe Mode: Enabled');
        expect(prompt).toContain('- Topic Ban: Crypto');
    });
});
