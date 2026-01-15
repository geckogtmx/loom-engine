export enum FailureType {
    MODEL_TIMEOUT = 'MODEL_TIMEOUT',
    TOOL_ERROR = 'TOOL_ERROR',
    NETWORK_FAILURE = 'NETWORK_FAILURE',
    CRASH = 'CRASH',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    UNKNOWN = 'UNKNOWN'
}

export interface FailureEvent {
    type: FailureType;
    message: string;
    timestamp: number;
    sessionId?: string;
    retryCount: number;
    resolved: boolean;
}

/**
 * FailureHandler
 * Manages error handling, retry logic, and graceful degradation.
 */
export class FailureHandler {
    private maxRetries: number;
    private baseDelayMs: number;
    private failureLog: FailureEvent[] = [];

    constructor(maxRetries: number = 3, baseDelayMs: number = 1000) {
        this.maxRetries = maxRetries;
        this.baseDelayMs = baseDelayMs;
    }

    /**
     * Execute an operation with exponential backoff retry.
     */
    async withRetry<T>(
        operation: () => Promise<T>,
        failureType: FailureType = FailureType.UNKNOWN,
        sessionId?: string
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;

                const event: FailureEvent = {
                    type: failureType,
                    message: lastError.message,
                    timestamp: Date.now(),
                    sessionId,
                    retryCount: attempt,
                    resolved: false
                };
                this.failureLog.push(event);

                if (attempt < this.maxRetries) {
                    const delay = this.baseDelayMs * Math.pow(2, attempt);
                    console.warn(`[FailureHandler] Retry ${attempt + 1}/${this.maxRetries} after ${delay}ms`);
                    await this.sleep(delay);
                }
            }
        }

        // All retries exhausted
        console.error(`[FailureHandler] All retries exhausted for ${failureType}`);
        throw lastError;
    }

    /**
     * Log a failure without retry (for non-retryable errors).
     */
    logFailure(type: FailureType, message: string, sessionId?: string): void {
        this.failureLog.push({
            type,
            message,
            timestamp: Date.now(),
            sessionId,
            retryCount: 0,
            resolved: false
        });
    }

    /**
     * Get failure log for observability.
     */
    getFailureLog(): FailureEvent[] {
        return [...this.failureLog];
    }

    /**
     * Clear resolved failures.
     */
    clearResolved(): void {
        this.failureLog = this.failureLog.filter(f => !f.resolved);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
