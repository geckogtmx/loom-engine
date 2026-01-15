# TESTING.md — Quality Assurance Guide

> **Mandate:** All new features MUST include unit tests. All PRs MUST pass the test suite.

---

## Quick Start

```bash
# Run all tests (single run)
cd packages/core
npx vitest run

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode (development)
pnpm test
```

---

## Coverage Thresholds

Coverage is enforced via CI. Builds fail if thresholds aren't met.

### Global Thresholds
| Metric | Threshold |
|--------|-----------|
| Lines | 70% |
| Branches | 60% |
| Functions | 75% |
| Statements | 70% |

### Critical Path Overrides
| Path | Lines | Functions |
|------|-------|-----------|
| `src/governance/**` | 90% | 90% |
| `src/memory/**` | 90% | 90% |

> **Rationale:** Governance and memory are integrity-critical. Bugs there aren't UI glitches — they're data corruption.

---

## CI Pipeline

Tests run automatically on:
- ✅ Every push to `main`
- ✅ Every pull request to `main`

**Failure blocks merge.**

Workflow: `.github/workflows/test.yml`

---

## Test Architecture

| Layer | Location | Framework | Purpose |
|-------|----------|-----------|---------|
| Unit | `packages/core/src/**/*.test.ts` | Vitest | Logic, services, utilities |
| Integration | `packages/core/src/**/*.test.ts` | Vitest | Cross-component flows |
| E2E | `apps/electron/tests/` (TBD) | Playwright | Full UI flows |

---

## Current Coverage (Phase 1 + 2 + 3)

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

### Worlds (`src/world/`)
| Test File | Tests | Coverage |
|-----------|-------|----------|
| `world.test.ts` | 21 | CRUD, activation, archival, validation |

**Total: 60 tests**

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

## Adding Tests for New Features

1. Create `<feature>.test.ts` in the same directory as the source.
2. Cover: happy path, edge cases, error conditions.
3. Run `pnpm test:coverage` to verify thresholds.
4. Commit with message: `test(<scope>): <description>`

---

**END OF QA GUIDE**
