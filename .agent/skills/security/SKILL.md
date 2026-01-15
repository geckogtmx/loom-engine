---
name: security-officer
description: Enforces mandatory security guidelines for LOOM Engine development. Use this skill when reviewing code, designing new features, or checking for security vulnerabilities. It covers Electron hardening, IPC validation, database security, and secret handling.
license: Complete terms in LICENSE.txt
---

# Security Officer

This skill provides authoritative guidance on maintaining the security posture of the LOOM Engine. It is based on **`SECURITY.md`**, which is the single source of truth for all security protocols.

## When to Use

- **Code Reviews**: Check if new PRs violate standard security rules (e.g., direct SQL string interpolation).
- **New Feature Design**: Consult before building anything involving IPC, Database, or Network capabilities.
- **Auditing**: Use the checklists below to verify compliance.

## Core Mandates

### 1. Electron Hardening
**Rule:** All `BrowserWindow` instances MUST be sandboxed.
**Check:**
```typescript
webPreferences: {
  contextIsolation: true,       // REQUIRED
  nodeIntegration: false,       // REQUIRED
  sandbox: true,                // REQUIRED
  webSecurity: true,            // REQUIRED
  allowRunningInsecureContent: false,
  preload: path.join(__dirname, 'preload.js'),
}
```
**Violation**: Setting `nodeIntegration: true` or `contextIsolation: false` is grounds for immediate rejection.

### 2. IPC Channel Validation
**Rule:** Never trust renderer data. All `ipcMain.handle()` calls must validate input using **Zod** schemas.
**Code Pattern:**
```typescript
// ✅ GOOD
const StartSessionSchema = z.object({ ... });
ipcMain.handle('channel', (_, data) => {
  const validated = StartSessionSchema.parse(data);
  return service.action(validated);
});

// ❌ BAD
ipcMain.handle('channel', (_, data) => service.action(data));
```

### 3. Database Security
**Rule:** NO raw SQL string interpolation. Use Drizzle ORM's parameterized queries.
**Code Pattern:**
```typescript
// ✅ GOOD
db.select().from(table).where(eq(table.id, inputId));

// ❌ BAD
db.execute(`SELECT * FROM table WHERE id = '${inputId}'`);
```

### 4. Memory Layer Access
**Rule:** Writes to L3/L4 memory must pass through `A0Enforcer` governance checks.
**Code Pattern:**
```typescript
if (!governance.canWrite('L4', 'key', caller)) {
  throw new GovernanceError('Denied');
}
await l4.set('key', val);
```

### 5. Network & Secrets
- **Secrets**: Use Electron `safeStorage` for API keys. NEVER use `localStorage` for sensitive data.
- **External Calls**: All data must be classified (`PRIVATE_LOCAL`, `EXTERNAL_OK`, etc.) before leaving the machine.
- **WebSockets**: Must authenticate `token` on connection.

## Security Review Checklist

Before approving any code, verify:

- [ ] **Electron**: No `nodeIntegration: true`.
- [ ] **IPC**: All inputs Zod-validated.
- [ ] **SQL**: No string interpolation.
- [ ] **Secrets**: No `.env` or keys committed (add to `.gitignore`).
- [ ] **Logging**: No sensitive data in `console.log`.
- [ ] **Errors**: Stack traces are caught and sanitized before returning to renderer.

## Vulnerability Scanning

Run before releases:
```bash
pnpm audit --audit-level=high
```
