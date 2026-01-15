---
name: electron-ipc-patterns
description: Secure IPC channel design for Electron main/renderer communication in LOOM Engine. Use this skill when creating new IPC handlers, validating inputs with Zod schemas, implementing contextBridge APIs, or designing the communication layer between UI and backend services. Complements the security skill with implementation patterns.
---

# Electron IPC Patterns

This skill provides patterns for secure IPC communication in LOOM Engine.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│              RENDERER PROCESS               │
│  React App ──▶ window.api.worlds.list()    │
└─────────────────────┬───────────────────────┘
                      │ contextBridge
┌─────────────────────▼───────────────────────┐
│              PRELOAD SCRIPT                 │
│  ipcRenderer.invoke('worlds:list')          │
└─────────────────────┬───────────────────────┘
                      │ IPC Channel
┌─────────────────────▼───────────────────────┐
│              MAIN PROCESS                   │
│  ipcMain.handle + Zod validation            │
│  ──▶ Services ──▶ Database                  │
└─────────────────────────────────────────────┘
```

## Preload Script

```typescript
// apps/electron/src/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

const api = {
  worlds: {
    list: () => ipcRenderer.invoke('worlds:list'),
    get: (id: string) => ipcRenderer.invoke('worlds:get', id),
    create: (data: unknown) => ipcRenderer.invoke('worlds:create', data),
  },
  sessions: {
    start: (worldId: string) => ipcRenderer.invoke('sessions:start', worldId),
    close: (id: string) => ipcRenderer.invoke('sessions:close', id),
  },
  // Events (main → renderer)
  on: {
    streamChunk: (cb: (data: unknown) => void) => {
      const handler = (_: unknown, data: unknown) => cb(data);
      ipcRenderer.on('stream:chunk', handler);
      return () => ipcRenderer.removeListener('stream:chunk', handler);
    },
  },
};

contextBridge.exposeInMainWorld('api', api);
```

## IPC Handlers with Zod

```typescript
// apps/electron/src/ipc/handlers.ts
import { ipcMain } from 'electron';
import { z } from 'zod';

const CreateWorldSchema = z.object({
  name: z.string().min(1).max(100),
  purpose: z.string().min(1),
});

export function registerHandlers(services: Services): void {
  // ✅ CORRECT: Zod validation
  ipcMain.handle('worlds:create', async (_, data: unknown) => {
    const validated = CreateWorldSchema.parse(data);
    return services.world.create(validated);
  });

  // ✅ CORRECT: Validate IDs
  ipcMain.handle('worlds:get', async (_, id: unknown) => {
    const validId = z.string().uuid().parse(id);
    return services.world.get(validId);
  });
}
```

## Error Handling

```typescript
function wrapHandler<T>(
  handler: (...args: unknown[]) => Promise<T>
): (...args: unknown[]) => Promise<T> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Sanitize - never send stack traces
      if (error instanceof ZodError) {
        throw new Error(`Validation: ${error.message}`);
      }
      console.error('IPC Error:', error);
      throw new Error('Operation failed');
    }
  };
}
```

## Events (Main → Renderer)

```typescript
// Main process
class IPCEvents {
  constructor(private window: BrowserWindow) {}

  emitStreamChunk(chunk: StreamChunk): void {
    this.window.webContents.send('stream:chunk', chunk);
  }
}

// Renderer (React)
useEffect(() => {
  return window.api.on.streamChunk((chunk) => {
    appendToStream(chunk.content);
  });
}, []);
```

## Channel Naming

```
{domain}:{action}

worlds:list, worlds:create
sessions:start, sessions:close
stream:chunk (event)
```

## Security Checklist

- [ ] All inputs Zod-validated
- [ ] Errors sanitized (no stack traces)
- [ ] UUIDs validated before DB queries
- [ ] Governance check for L2/L3/L4 writes
