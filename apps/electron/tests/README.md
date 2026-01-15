# E2E Tests — Deferred to Phase 8

> **Status:** Not yet implemented. Will be set up when UI components exist.

## Why Deferred?

E2E (End-to-End) tests validate complete user flows through the UI. Since LOOM is currently in backend development (Phases 1-7), there's no UI to test.

## When to Implement

**Phase 8: Operator UI & Observability** — Before UI development begins:

1. Install Playwright + Electron adapter
2. Create smoke test (app launches)
3. Add to CI workflow

## Planned Setup

```bash
pnpm add -D @playwright/test playwright-electron
```

```typescript
// apps/electron/tests/app.spec.ts
import { test, expect, _electron as electron } from '@playwright/test';

test('app launches', async () => {
  const app = await electron.launch({ args: ['.'] });
  const window = await app.firstWindow();
  expect(await window.title()).toBeTruthy();
  await app.close();
});
```

## Test Coverage Goals

| Flow | Priority |
|------|----------|
| App launch/close | P0 |
| World creation wizard | P0 |
| Session lifecycle (start → end) | P0 |
| Pattern execution with streaming | P1 |
| Keyboard navigation | P1 |
| Theme switching | P2 |

---

**Owner:** Phase 8 developer
