export type PermissionLevel = 'READ_ONLY' | 'WRITE' | 'GOVERNED';

export interface WritePermissionMatrix {
    L4: PermissionLevel; // Telos
    L3: PermissionLevel; // Knowledge
    L2: PermissionLevel; // Episodic
    L1: PermissionLevel; // Active
}

export const DefaultMatrix: WritePermissionMatrix = {
    L4: 'READ_ONLY', // Only Operator can write via special flow
    L3: 'GOVERNED',  // Needs A0 check
    L2: 'WRITE',     // Append-only logs
    L1: 'WRITE'      // Free RAM
};

export function checkPermission(layerId: string, matrix: WritePermissionMatrix = DefaultMatrix): PermissionLevel {
    return matrix[layerId as keyof WritePermissionMatrix] || 'READ_ONLY';
}
