# TESTING.md — Quality Assurance Guide

> **Mandate:** All new features MUST include unit tests. All PRs MUST pass the test suite.

---

## Quick Start

```bash
# Run all tests (single run)
cd packages/core
npx vitest run

# Run tests in watch mode (development)
pnpm test
```

---

## Test Architecture

| Layer | Location | Framework | Purpose |
|-------|----------|-----------|---------|
| Unit | `packages/core/src/**/*.test.ts` | Vitest | Logic, services, utilities |
| Integration | `packages/core/src/**/*.test.ts` | Vitest | Cross-component flows |
| E2E | `apps/electron/tests/` (TBD) | Playwright | Full UI flows |

---

## Current Coverage (Phase 1 + Phase 2)

### Memory Layer (`src/memory/`)
| Test File | Tests | Coverage |
|-----------|-------|----------|
| `memory.test.ts` | 10 | L1 CRUD, L2 append, L3 governance, L4 immutability |

### Governance (`src/governance/`)
| Test File | Tests | Coverage |
|-----------|-------|----------|
| `governance.test.ts` | 10 | A0 blocking, META rules, Permission matrix |

### Session Lifecycle (`src/session/`)
| Test File | Tests | Coverage |
|-----------|-------|----------|
| `session.test.ts` | 5 | Full lifecycle, guards, fail() handling |
| `checkpoint/checkpoint.test.ts` | 3 | Trigger logic, step counting |
| `continuity/continuity.test.ts` | 5 | Artifact generation, parsing, resumption |
| `recovery/recovery.test.ts` | 6 | Retry, backoff, exhaustion, logging |

**Total: 39 tests**

---

## Writing Tests

### Conventions
- **File naming:** `<module>.test.ts` adjacent to source
- **Describe blocks:** One per class/module
- **Test naming:** `should <expected behavior>`
- **Mocking:** Use `vi.fn()` for functions, `vi.mock()` for modules

### Template
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyService } from './MyService';

describe('MyService', () => {
    let service: MyService;

    beforeEach(() => {
        service = new MyService();
    });

    it('should do expected behavior', () => {
        expect(service.method()).toBe(expectedValue);
    });
});
```

---

## CI Integration (TBD)

Tests will run automatically on:
- Pull Request creation
- Push to `main`

Failure blocks merge.

---

## Adding Tests for New Features

1. Create `<feature>.test.ts` in the same directory as the source.
2. Cover: happy path, edge cases, error conditions.
3. Run `npx vitest run` to verify.
4. Commit with message: `test(<scope>): <description>`

---

**END OF QA GUIDE**
