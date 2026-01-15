import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AgentProfileLoader } from './AgentProfileLoader';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

describe('AgentProfileLoader', () => {
    let loader: AgentProfileLoader;
    let tempDir: string;
    let agentDir: string;
    const agentName = 'TestAgent';

    beforeEach(async () => {
        loader = new AgentProfileLoader();
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'loom-test-'));
        agentDir = path.join(tempDir, agentName);
        await fs.mkdir(agentDir);

        // Create Mock Files
        await fs.writeFile(path.join(agentDir, `${agentName}-PROFILE.md`),
            `# PROFILE — TestAgent (Tester)

## Role Summary
A capable test agent.

## Domain Expertise
- Testing
`);

        await fs.writeFile(path.join(agentDir, `${agentName}-TELOS.md`),
            `# TELOS
I am TestAgent.
`);

        await fs.writeFile(path.join(agentDir, `${agentName}-MODES.md`),
            `# MODES

## 1. Test Mode
**Purpose:** Verify things.
Trigger: "Test this."

## 2. Sleep Mode
**Purpose:** Do nothing.
Trigger: "Sleep."
`);
    });

    afterEach(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
    });

    it('should load and parse an agent profile directory', async () => {
        const worldId = uuidv4();
        const data = await loader.loadFromDirectory(agentDir, worldId);

        // Verify Profile
        expect(data.profile.name).toBe(agentName);
        expect(data.profile.worldId).toBe(worldId);
        expect(data.profile.role).toContain('A capable test agent');

        // Verify Telos
        expect(data.telos.content).toContain('I am TestAgent.');

        // Verify Modes
        expect(data.modes).toHaveLength(2);
        expect(data.modes[0].name).toBe('Test Mode');
        expect(data.modes[0].trigger).toBe('Test this.');
        expect(data.modes[1].name).toBe('Sleep Mode');
        expect(data.modes[1].trigger).toBe('Sleep.');
    });

    it('should append TOOLS to Telos if present', async () => {
        await fs.writeFile(path.join(agentDir, `${agentName}-TOOLS & KNOWLEDGE.md`),
            `# TOOLS
- Hammer
- Wrench`);

        const worldId = uuidv4();
        const data = await loader.loadFromDirectory(agentDir, worldId);

        expect(data.telos.content).toContain('I am TestAgent.');
        expect(data.telos.content).toContain('# TOOLS & KNOWLEDGE');
        expect(data.telos.content).toContain('- Hammer');
    });
});
