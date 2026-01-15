import { MetaGovernanceService } from './meta';

export class A0Enforcer {
    private meta: MetaGovernanceService;
    private static PERMISSIVE_MODE = false; // Phase 7.9 Fallback

    constructor() {
        this.meta = new MetaGovernanceService();
    }

    /**
     * The Gateway function. All significant actions must pass through here.
     */
    enforce(actionType: string, context: any): boolean {
        // 1. Check META rules
        if (!this.meta.check(actionType)) {
            if (A0Enforcer.PERMISSIVE_MODE) {
                console.warn(`[A0] VIOLATION LOGGED (Permissive Mode): Action ${actionType} would differ from META protocols.`);
                return true;
            }
            console.error(`A0 BLOCKED: Action ${actionType} violates META protocols.`);
            return false;
        }

        // 2. Log enforcement
        // console.log(`A0 ALLOWED: ${actionType}`);
        return true;
    }

    static setPermissive(enabled: boolean) {
        this.PERMISSIVE_MODE = enabled;
        console.warn(`[A0] PERMISSIVE MODE set to: ${enabled}`);
    }
}
