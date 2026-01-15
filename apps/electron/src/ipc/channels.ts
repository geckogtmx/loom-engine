/**
 * IPC Channel Constants for Session Management
 */
export const SessionChannels = {
    // Session Lifecycle
    CREATE: 'session:create',
    INITIALIZE: 'session:initialize',
    SET_INTENT: 'session:set-intent',
    START: 'session:start',
    END: 'session:end',
    FAIL: 'session:fail',
    GET_STATE: 'session:get-state',

    // Recovery
    DETECT_INCOMPLETE: 'session:detect-incomplete',
    RECOVER: 'session:recover',

    // Streaming (via WebSocket, not IPC)
    // These are for reference only
    STREAM_OUTPUT: 'ws:stream-output'
} as const;

export type SessionChannel = typeof SessionChannels[keyof typeof SessionChannels];
