import { SessionIntentEnvelope } from './types';
import { v4 as uuidv4 } from 'uuid';

export class SessionIntentEnvelopeImpl implements SessionIntentEnvelope {
    readonly id: string;
    readonly worldId: string;

    private _goal: string;
    private _constraints: string[];
    private _audience: string;
    private _sealedAt?: Date;

    constructor(worldId: string, goal: string = '', constraints: string[] = [], audience: string = '') {
        this.id = uuidv4();
        this.worldId = worldId;
        this._goal = goal;
        this._constraints = [...constraints];
        this._audience = audience;
    }

    get goal(): string {
        return this._goal;
    }

    set goal(value: string) {
        if (this.isSealed()) {
            throw new Error('Cannot modify goal: SessionIntentEnvelope is sealed.');
        }
        this._goal = value;
    }

    get constraints(): string[] {
        return [...this._constraints];
    }

    set constraints(value: string[]) {
        if (this.isSealed()) {
            throw new Error('Cannot modify constraints: SessionIntentEnvelope is sealed.');
        }
        this._constraints = [...value];
    }

    get audience(): string {
        return this._audience;
    }

    set audience(value: string) {
        if (this.isSealed()) {
            throw new Error('Cannot modify audience: SessionIntentEnvelope is sealed.');
        }
        this._audience = value;
    }

    get sealedAt(): Date | undefined {
        return this._sealedAt;
    }

    isSealed(): boolean {
        return this._sealedAt !== undefined;
    }

    seal(): void {
        if (this.isSealed()) {
            return; // Already sealed, idempotent
        }
        // Basic validation before sealing
        if (!this._goal.trim()) {
            throw new Error('Cannot seal an empty goal.');
        }

        this._sealedAt = new Date();
    }
}
