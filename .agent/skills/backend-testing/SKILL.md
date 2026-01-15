---
name: backend-testing
description: Enforces mandatory backend testing guidelines using Vitest. Use this skill when writing unit tests, integration tests, or verifying code coverage for core logic (non-UI). It ensures compliance with TESTING.md standards.
license: Complete terms in LICENSE.txt
---

# Backend Testing Specialist

This skill provides authoritative guidance on writing and running backend tests for the LOOM Engine. It is based on **`TESTING.md`**.

## When to Use

- **New Features**: Every new feature MUST include unit tests.
- **Refactoring**: Ensure no regression by running the test suite.
- **Coverage Checks**: Verify that code meets the strict coverage thresholds.

## Core Mandates

### 1. Test Framework: Vitest
All backend tests (Unit & Integration) use **Vitest**.
- **Run All**: `npx vitest run` (in `packages/core`)
- **Coverage**: `pnpm test:coverage`
- **Watch**: `pnpm test`

### 2. Location & Naming
- **Location**: Test files must be **adjacent** to the source file.
- **Naming**: `<filename>.test.ts`
- **Example**: `src/services/UserService.ts` -> `src/services/UserService.test.ts`

### 3. Coverage Thresholds
Builds will FAIL if these are not met:

| Scope | Threshold |
|-------|-----------|
| **Global** | 70% |
| **Governance (`src/governance`)** | **90%** (Critical) |
| **Memory (`src/memory`)** | **90%** (Critical) |

### 4. Test Template
Use this standard boilerplate for all new test files:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TargetClass } from './TargetClass';

describe('TargetClass', () => {
    let instance: TargetClass;

    beforeEach(() => {
        // Reset mocks and instance
        vi.clearAllMocks();
        instance = new TargetClass();
    });

    it('should perform expected behavior', () => {
        // Arrange
        const input = 'test';
        
        // Act
        const result = instance.method(input);
        
        // Assert
        expect(result).toBeDefined();
    });
});
```

## Creating a Test Plan
When asked to "implement X", your plan MUST include a **Verification Plan** section:

```markdown
## Verification Plan
### Automated Tests
- [ ] Create `src/path/to/X.test.ts`
- [ ] Run `npx vitest run src/path/to/X.test.ts`
- [ ] Verify coverage meets thresholds
```

## Common Commands

- **Run specific test file**: `npx vitest run src/path/to/file.test.ts`
- **Run with coverage**: `pnpm test:coverage`
