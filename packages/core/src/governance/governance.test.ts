import { describe, it, expect, beforeEach } from 'vitest';
import { A0Enforcer } from './a0';
import { MetaGovernanceService } from './meta';
import { checkPermission, DefaultMatrix } from './permissions';

describe('A0Enforcer', () => {
    let enforcer: A0Enforcer;

    beforeEach(() => {
        enforcer = new A0Enforcer();
    });

    it('should block META violations (attempt_overwrite_telos)', () => {
        const result = enforcer.enforce('attempt_overwrite_telos', {});
        expect(result).toBe(false);
    });

    it('should allow non-violation actions', () => {
        const result = enforcer.enforce('normal_operation', {});
        expect(result).toBe(true);
    });
});

describe('MetaGovernanceService', () => {
    let meta: MetaGovernanceService;

    beforeEach(() => {
        meta = new MetaGovernanceService();
    });

    it('should deny attempt_overwrite_telos', () => {
        const result = meta.check('attempt_overwrite_telos');
        expect(result).toBe(false);
    });

    it('should allow unknown actions (default allow)', () => {
        const result = meta.check('some_random_action');
        expect(result).toBe(true);
    });
});

describe('WritePermissionMatrix', () => {
    it('should return READ_ONLY for L4', () => {
        expect(checkPermission('L4')).toBe('READ_ONLY');
    });

    it('should return GOVERNED for L3', () => {
        expect(checkPermission('L3')).toBe('GOVERNED');
    });

    it('should return WRITE for L2', () => {
        expect(checkPermission('L2')).toBe('WRITE');
    });

    it('should return WRITE for L1', () => {
        expect(checkPermission('L1')).toBe('WRITE');
    });

    it('should return READ_ONLY for unknown layers', () => {
        expect(checkPermission('L999')).toBe('READ_ONLY');
    });

    it('should use default matrix values', () => {
        expect(DefaultMatrix.L4).toBe('READ_ONLY');
        expect(DefaultMatrix.L3).toBe('GOVERNED');
        expect(DefaultMatrix.L2).toBe('WRITE');
        expect(DefaultMatrix.L1).toBe('WRITE');
    });
});
