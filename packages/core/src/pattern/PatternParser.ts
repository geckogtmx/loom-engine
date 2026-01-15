
// packages/core/src/pattern/PatternParser.ts

import { PatternDef, PatternStep, PatternParam } from './types';
import { v4 as uuidv4 } from 'uuid';

export class PatternParser {

    parse(content: string, filename: string): PatternDef {
        const lines = content.split('\n');

        // 1. Extract Header Info
        const nameMatch = lines[0].match(/^#\s+(.+)$/);
        const name = nameMatch ? nameMatch[1].trim() : filename.replace('.md', '');

        const familyMatch = content.match(/>\s*\*\*Family:\*\*\s*(.+)/);
        const family = familyMatch ? familyMatch[1].trim() : 'Unclassified';

        const purposeMatch = content.match(/>\s*\*\*Purpose:\*\*\s*(.+)/);
        const description = purposeMatch ? purposeMatch[1].trim() : name;

        // 2. Extract Steps
        // Very basic parser: looks for "### N. [Step Name]"
        const steps: PatternStep[] = [];

        const stepSections = content.split(/^###\s+/gm).slice(1);

        stepSections.forEach((section, index) => {
            const sectionLines = section.split('\n');
            const header = sectionLines[0].trim(); // "1. Step Name"

            // Parse order and name
            const orderMatch = header.match(/^(\d+)\.\s*(.+)/);
            const order = orderMatch ? parseInt(orderMatch[1]) : index + 1;
            const stepName = orderMatch ? orderMatch[2].trim() : header;

            // Extract attributes
            const agentMatch = section.match(/\*\*Agent:\*\*\s*(.+)/);
            const agentRole = agentMatch ? agentMatch[1].trim() : 'Assistant'; // Default role

            const tempoMatch = section.match(/\*\*Tempo:\*\*\s*(.+)/);
            const tempoMode = tempoMatch ? tempoMatch[1].toLowerCase().trim() : undefined;

            // System prompt is essentially the content minus headers
            // We strip the metadata lines
            const instructions = sectionLines
                .filter(l => !l.startsWith('**Agent:**') && !l.startsWith('**Tempo:**') && !l.startsWith('**Input Layers:**'))
                .slice(1) // Skip name line
                .join('\n')
                .trim();

            const step: PatternStep = {
                id: uuidv4(),
                order,
                name: stepName,
                description: stepName,
                agentRole,
                systemPrompt: instructions,
                // Defaults
                inputLayers: ['L1', 'L2'],
                outputLayers: ['L1']
            };

            if (tempoMode === 'allegro' || tempoMode === 'andante' || tempoMode === 'adagio') {
                step.tempoMode = tempoMode as any;
            }

            steps.push(step);
        });

        // 3. Inputs/Outputs Parsing
        const inputs: PatternParam[] = this.parseParams(content, 'Inputs');
        const outputs: PatternParam[] = this.parseParams(content, 'Outputs');

        return {
            id: uuidv4(),
            name,
            description,
            family,
            steps,
            inputs,
            outputs,
            tags: [],
            version: '1.0.0'
        };
    }

    private parseParams(content: string, sectionName: string): PatternParam[] {
        const params: PatternParam[] = [];
        // Regex to find the section: ## Inputs ... (until next ## or end)
        // We use split to be safer than complex regex
        const sections = content.split(/^##\s+/gm);

        const targetSection = sections.find(s => s.startsWith(sectionName));

        if (targetSection) {
            const lines = targetSection.split('\n').slice(1); // Skip header line
            for (const line of lines) {
                // "- paramName: type (optional)"
                const paramMatch = line.match(/^\s*-\s*([a-zA-Z0-9_\s]+):\s*([a-zA-Z]+)(.*)/);
                if (paramMatch) {
                    const name = paramMatch[1].trim();
                    const typeRaw = paramMatch[2].trim().toLowerCase();
                    const extra = paramMatch[3].trim();

                    const validTypes = ['string', 'number', 'boolean', 'json', 'file'];
                    const type = validTypes.includes(typeRaw) ? typeRaw as any : 'string';

                    params.push({
                        name,
                        type,
                        description: name, // Default desc
                        required: !extra.includes('(optional)')
                    });
                }
            }
        }
        return params;
    }
}
