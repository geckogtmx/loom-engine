import { describe, it, expect } from 'vitest';
import { L4TelosLayer, L3KnowledgeLayer, L2EpisodicLayer, L1ActiveLayer } from './layers';

describe('L4TelosLayer', () => {
    it('should throw on write attempt', async () => {
        const l4 = new L4TelosLayer();
        await expect(l4.write('any-key', { data: 'test' })).rejects.toThrow('L4 Telos is immutable');
    });

    it('should throw on clear attempt', async () => {
        const l4 = new L4TelosLayer();
        await expect(l4.clear()).rejects.toThrow('L4 Telos cannot be cleared');
    });

    it('should return null for read (placeholder)', async () => {
        const l4 = new L4TelosLayer();
        const result = await l4.read('any-key');
        expect(result).toBeNull();
    });
});

describe('L3KnowledgeLayer', () => {
    it('should throw on clear attempt', async () => {
        const l3 = new L3KnowledgeLayer();
        await expect(l3.clear()).rejects.toThrow('L3 cannot be cleared');
    });

    it('should log warning on write (governance placeholder)', async () => {
        const l3 = new L3KnowledgeLayer();
        // This should not throw, but would need A0 check in real impl
        await expect(l3.write('test-key', { data: 'test' })).resolves.toBeUndefined();
    });
});

describe('L2EpisodicLayer', () => {
    it('should allow write (append-only)', async () => {
        const l2 = new L2EpisodicLayer();
        await expect(l2.write('log-entry', { event: 'test' })).resolves.toBeUndefined();
    });

    it('should allow clear (archival)', async () => {
        const l2 = new L2EpisodicLayer();
        await expect(l2.clear()).resolves.toBeUndefined();
    });
});

describe('L1ActiveLayer', () => {
    it('should store and retrieve values', async () => {
        const l1 = new L1ActiveLayer();
        await l1.write('key1', { value: 42 });
        const result = await l1.read('key1');
        expect(result).toEqual({ value: 42 });
    });

    it('should return undefined for missing keys', async () => {
        const l1 = new L1ActiveLayer();
        const result = await l1.read('missing');
        expect(result).toBeUndefined();
    });

    it('should clear all values', async () => {
        const l1 = new L1ActiveLayer();
        await l1.write('key1', 'value1');
        await l1.write('key2', 'value2');
        await l1.clear();
        expect(await l1.read('key1')).toBeUndefined();
        expect(await l1.read('key2')).toBeUndefined();
    });
});
