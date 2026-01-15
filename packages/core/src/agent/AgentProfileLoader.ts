import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AgentProfile, AgentTelos, AgentMode } from './types';

export interface LoadedAgentData {
    profile: AgentProfile;
    telos: AgentTelos;
    modes: AgentMode[];
}

export class AgentProfileLoader {
    /**
     * Loads an Agent Profile from a directory of markdown files.
     * Expects: [Name]-PROFILE.md, [Name]-TELOS.md, [Name]-MODES.md
     */
    async loadFromDirectory(dirPath: string, worldId: string): Promise<LoadedAgentData> {
        const agentName = path.basename(dirPath); // Assumes dir name is Agent Name (e.g., "Atlas")
        const agentId = uuidv4();

        // 1. Load & Parse PROFILE
        const profileContent = await this.readFile(dirPath, `${agentName}-PROFILE.md`);
        const profile = this.parseProfile(agentId, worldId, agentName, profileContent);

        // 2. Load & Parse TELOS (Identity)
        let telosContent = await this.readFile(dirPath, `${agentName}-TELOS.md`);

        // 3. Append TOOLS & KNOWLEDGE (Cognitive Frameworks) if exists
        try {
            const toolsContent = await this.readFile(dirPath, `${agentName}-TOOLS & KNOWLEDGE.md`);
            telosContent += `\n\n---\n\n# TOOLS & KNOWLEDGE\n\n${toolsContent}`;
        } catch (e) {
            // Optional file, ignore if missing
        }

        const telos: AgentTelos = {
            id: uuidv4(),
            agentId: agentId,
            content: telosContent,
            updatedAt: new Date()
        };

        // 4. Load & Parse MODES
        let modes: AgentMode[] = [];
        try {
            const modesContent = await this.readFile(dirPath, `${agentName}-MODES.md`);
            modes = this.parseModes(agentId, modesContent);
        } catch (e) {
            // Optional file, ignore if missing
        }

        return { profile, telos, modes };
    }

    private async readFile(dir: string, filename: string): Promise<string> {
        const filePath = path.join(dir, filename);
        return fs.readFile(filePath, 'utf-8');
    }

    private parseProfile(agentId: string, worldId: string, agentName: string, content: string): AgentProfile {
        // Simple extraction logic - can be hardened later
        // Expects "# PROFILE — [Name] ([Role])"
        // And sections like "## Role Summary"

        const lines = content.split('\n');

        // Extract Role from Header or Summary
        // Fallback checks
        let role = 'Agent';
        const roleLine = lines.find(l => l.includes('Role Summary'));
        if (roleLine) {
            const idx = lines.indexOf(roleLine);
            if (lines[idx + 1]) role = lines[idx + 1].trim();
        }

        // Description is essentially the Role Summary for now or the first block
        let description = role;

        return {
            id: agentId,
            worldId,
            name: agentName,
            role,
            description,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    private parseModes(agentId: string, content: string): AgentMode[] {
        const modes: AgentMode[] = [];
        const sections = content.split(/^##\s/gm).slice(1); // Split by h2, ignore preamble

        for (const section of sections) {
            // "1. Research Mode (Default)" or "Research Mode"
            const titleLine = section.split('\n')[0].trim();
            // Remove numbering like "1. "
            const name = titleLine.replace(/^\d+\.\s*/, '').replace(/\s*\(.*\)/, '').trim();

            // Extract Trigger
            const triggerMatch = section.match(/Trigger:\s*["“](.*?)["”]/);
            const trigger = triggerMatch ? triggerMatch[1] : 'Manual activation';

            const mode: AgentMode = {
                id: uuidv4(),
                agentId,
                name,
                description: name, // Using name as desc for now if deeply structured
                trigger,
                behavior: section.trim(), // Store the whole section as the behavior def
                createdAt: new Date(),
                updatedAt: new Date()
            };
            modes.push(mode);
        }

        return modes;
    }
}
