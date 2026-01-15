import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FailureHandler, FailureType } from './FailureHandler';

describe('FailureHandler', () => {
    let handler: FailureHandler;

    beforeEach(() => {
        // Use short delays for testing
        handler = new FailureHandler(3, 10); // 3 retries, 10ms base delay
    });

    it('should succeed on first attempt', async () => {
        const operation = vi.fn().mockResolvedValue('success');
        const result = await handler.withRetry(operation);

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry and succeed on second attempt', async () => {
        const operation = vi.fn()
            .mockRejectedValueOnce(new Error('First fail'))
            .mockResolvedValue('success');

        const result = await handler.withRetry(operation, FailureType.NETWORK_FAILURE);

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should exhaust retries and throw', async () => {
        const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

        await expect(handler.withRetry(operation, FailureType.MODEL_TIMEOUT)).rejects.toThrow('Always fails');
        expect(operation).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });

    it('should log failures', () => {
        handler.logFailure(FailureType.CRASH, 'Test crash', 'session-1');

        const log = handler.getFailureLog();
        expect(log).toHaveLength(1);
        expect(log[0].type).toBe(FailureType.CRASH);
        expect(log[0].message).toBe('Test crash');
        expect(log[0].sessionId).toBe('session-1');
    });

    it('should clear resolved failures', () => {
        handler.logFailure(FailureType.TOOL_ERROR, 'Error 1');
        handler.logFailure(FailureType.VALIDATION_ERROR, 'Error 2');

        expect(handler.getFailureLog()).toHaveLength(2);

        handler.clearResolved();

        // All are unresolved, so nothing cleared
        expect(handler.getFailureLog()).toHaveLength(2);
    });

    it('should use exponential backoff', async () => {
        const startTime = Date.now();
        const operation = vi.fn()
            .mockRejectedValueOnce(new Error('Fail 1'))
            .mockRejectedValueOnce(new Error('Fail 2'))
            .mockResolvedValue('success');

        await handler.withRetry(operation);

        const elapsed = Date.now() - startTime;
        // Should have waited at least 10ms + 20ms = 30ms (exponential)
        expect(elapsed).toBeGreaterThanOrEqual(25);
    });
});
