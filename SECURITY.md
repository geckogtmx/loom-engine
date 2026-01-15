# SECURITY.md — Security Guidelines

> **Scope:** Mandatory security practices for all LOOM development.
> **Status:** Active. All new code must comply.

---

## 1. Electron Hardening (Critical)

All `BrowserWindow` instances must use these `webPreferences`:

```typescript
webPreferences: {
  contextIsolation: true,       // REQUIRED: Isolate preload from renderer
  nodeIntegration: false,       // REQUIRED: No Node.js in renderer
  sandbox: true,                // REQUIRED: Process sandboxing
  webSecurity: true,            // REQUIRED: Enforce same-origin policy
  allowRunningInsecureContent: false, // REQUIRED: Block mixed content
  preload: path.join(__dirname, 'preload.js'),
}
```

**Never disable** any of these settings, even for development.

---

## 2. IPC Channel Validation

Every `ipcMain.handle()` must validate input with Zod before processing. **Never trust renderer data.**

```typescript
// ❌ BAD — No validation
ipcMain.handle('session:start', (_, data) => sessionService.start(data));

// ✅ GOOD — Zod validation first
import { z } from 'zod';

const StartSessionSchema = z.object({
  worldId: z.string().uuid(),
  intent: z.string().min(1).max(500),
});

ipcMain.handle('session:start', (_, data) => {
  const validated = StartSessionSchema.parse(data);
  return sessionService.start(validated);
});
```

**Schema location:** Keep IPC schemas in `packages/core/src/ipc/schemas/`.

---

## 3. Memory Layer Write Guards

All L3/L4 writes must pass through governance checks. Never write directly.

```typescript
// ❌ BAD — Direct write
await l4Layer.set('telos', newValue);

// ✅ GOOD — Governance-gated write
if (!governanceService.canWrite('L4', 'telos', caller)) {
  throw new GovernanceError('Write denied by A0 policy');
}
await l4Layer.set('telos', newValue);
```

**Enforcement:** The `A0Enforcer` in `packages/core/src/governance/a0.ts` must intercept all write paths.

---

## 4. Database Security

### Parameterized Queries Only
Always use Drizzle's parameterized queries. **Never** interpolate strings into SQL.

```typescript
// ❌ BAD — SQL injection risk
db.execute(`SELECT * FROM sessions WHERE id = '${sessionId}'`);

// ✅ GOOD — Parameterized via Drizzle
db.select().from(sessions).where(eq(sessions.id, sessionId));
```

### SQLite Pragmas
Initialize SQLite with security and performance pragmas:

```typescript
db.exec('PRAGMA journal_mode = WAL');        // Write-ahead logging
db.exec('PRAGMA synchronous = NORMAL');      // Balanced durability
db.exec('PRAGMA cache_size = -64000');       // 64MB cache
db.exec('PRAGMA foreign_keys = ON');         // Enforce FK constraints
```

---

## 5. Secrets Handling

### Storage Rules
| Data Type | Storage Method | Location |
|-----------|----------------|----------|
| API Keys | `safeStorage` | Electron encrypted store |
| User Preferences | Zustand (non-sensitive) | `localStorage` |
| Tokens | Never store | Fetch fresh per-session |

### Git Exclusions
Ensure `.gitignore` includes:
```
.env
*.key
*.pem
*.db
```

### Code Patterns
```typescript
import { safeStorage } from 'electron';

// Store API key securely
const encrypted = safeStorage.encryptString(apiKey);
await keyStore.set('openai_key', encrypted);

// Retrieve API key
const encrypted = await keyStore.get('openai_key');
const apiKey = safeStorage.decryptString(encrypted);
```

---

## 6. Network Security

### Classification System
All data must be classified before any external call:

| Classification | Can Send Externally? |
|----------------|---------------------|
| `PRIVATE_LOCAL` | ❌ Never |
| `SHARED_LOCAL` | ❌ Never |
| `EXTERNAL_OK` | ✅ With consent |
| `ANONYMIZED` | ✅ Freely |

### External Calls
- Default to **local models** (Ollama) — no network required
- Cloud API calls require explicit Operator consent
- A0 must verify classification before any external LLM call

---

## 7. Quick Reference Checklist

| Area | Rule |
|------|------|
| Electron | Enable `sandbox: true`, `webSecurity: true` |
| IPC | Zod-validate all inputs |
| Memory | Governance check before L3/L4 writes |
| SQL | Parameterized queries only (Drizzle) |
| Secrets | Use `safeStorage`, never `localStorage` |
| Network | Classify data before external calls |
| Git | Never commit `.env`, `*.key`, `*.db` |

---

## 8. Security Review Checklist

Before any PR merge, verify:

- [ ] No `nodeIntegration: true` anywhere
- [ ] All IPC handlers have Zod schemas
- [ ] No raw SQL string interpolation
- [ ] No API keys in source code
- [ ] No `console.log` of sensitive data
- [ ] Governance checks on write paths
- [ ] WebSocket connections require authentication
- [ ] Error responses don't expose stack traces
- [ ] Rate limiting on high-frequency IPC channels
- [ ] `pnpm audit` shows no high/critical vulnerabilities

---


---

## 9. WebSocket Security

### Authentication Required
All WebSocket connections must authenticate before receiving data.

```typescript
// ❌ BAD — Open connection
wss.on('connection', (ws) => {
  streamOutput(ws); // Anyone can connect
});

// ✅ GOOD — Token validation on connect
wss.on('connection', (ws, req) => {
  const token = new URL(req.url, 'ws://localhost').searchParams.get('token');
  if (!sessionService.validateToken(token)) {
    ws.close(4001, 'Unauthorized');
    return;
  }
  streamOutput(ws);
});
```

### Transport

- **Local development:** `ws://localhost` acceptable
- **Production/networked:** Require `wss://` with TLS

---

## 10. Rate Limiting

IPC handlers must implement rate limiting to prevent DoS from compromised renderer.

```typescript
import { RateLimiter } from '../utils/rate-limiter';

const limiter = new RateLimiter({ maxRequests: 100, windowMs: 60000 });    

ipcMain.handle('session:start', (event, data) => {
  if (!limiter.allow(event.sender.id)) {
    throw new Error('Rate limit exceeded');
  }
  // ... handle request
});
```

---

## 11. Error Handling

Never leak stack traces or internal paths to the renderer.

```typescript
// ❌ BAD — Leaks internals
ipcMain.handle('session:start', async (_, data) => {
  return sessionService.start(data); // Raw error propagates
});

// ✅ GOOD — Sanitized errors
ipcMain.handle('session:start', async (_, data) => {
  try {
    return await sessionService.start(data);
  } catch (err) {
    logger.error('session:start failed', err);
    throw new Error('Session creation failed'); // Generic message
  }
});
```

---

## 12. Dependency Security

Run vulnerability scans before releases:

```bash
pnpm audit              # Check for known CVEs
pnpm outdated           # Identify stale dependencies
```

**CI Integration:** Add `pnpm audit --audit-level=high` to the test workflow. Fail on high/critical CVEs.

---

**END OF SECURITY GUIDELINES**
