import { describe, it, expect } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { CreateAgentInputSchema, AgentSignalType, AgentModelPreferencesSchema } from './types';

describe('Agent Types', () => {
    describe('CreateAgentInputSchema', () => {
        it('should validate complete valid input', () => {
            const input = {
                worldId: uuidv4(),
                name: 'Test Agent',
                description: 'A test agent',
                role: 'Tester',
                telos: '# Identity',
                modelPreferences: {
                    preferred: 'openai:gpt-4',
                    fallback: 'ollama:llama3'
                }
            };
            const result = CreateAgentInputSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it('should validate minimal valid input', () => {
            const input = {
                worldId: uuidv4(),
                name: 'Test Agent',
                description: 'A test agent',
                role: 'Tester',
                telos: '# Identity'
            };
            const result = CreateAgentInputSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it('should reject invalid UUID', () => {
            const input = {
                worldId: 'invalid-uuid',
                name: 'Test',
                description: 'Test',
                role: 'Test',
                telos: 'Test'
            };
            const result = CreateAgentInputSchema.safeParse(input);
            expect(result.success).toBe(false);
        });
    });

    describe('AgentModelPreferencesSchema', () => {
        it('should allow partial preferences', () => {
            const prefs = { preferred: 'gpt-4' };
            const result = AgentModelPreferencesSchema.safeParse(prefs);
            expect(result.success).toBe(true);
        });
    });

    describe('AgentSignalType', () => {
        it('should have correct enum values', () => {
            expect(AgentSignalType.DRIFT).toBe('DRIFT');
            expect(AgentSignalType.PERFORMANCE).toBe('PERFORMANCE');
        });
    });
});
