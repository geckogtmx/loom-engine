/**
 * IPC Channel Constants for Session Management
 */
export const SessionChannels = {
    // Session Lifecycle
    CREATE: 'session:create',
    LIST: 'session:list',
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

export const WorldChannels = {
    CREATE: 'world:create',
    GET: 'world:get',
    LIST: 'world:list',
    UPDATE: 'world:update',
    DELETE: 'world:delete',

    // Config
    GET_CONFIG: 'world:get-config',
    UPDATE_CONFIG: 'world:update-config',

    // Telos
    GET_TELOS: 'world:get-telos',
    UPDATE_TELOS: 'world:update-telos',
} as const;

export type SessionChannel = typeof SessionChannels[keyof typeof SessionChannels];
export type WorldChannel = typeof WorldChannels[keyof typeof WorldChannels];
