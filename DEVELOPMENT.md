# LOOM Engine — Development Guide

## Phase 0: Foundation

### 1. Prerequisites
- **Node.js**: v20+
- **pnpm**: v9+
- **Ollama**: (Optional, for local AI features)

### 2. Getting Started
```bash
# Install dependencies
pnpm install

# Start development environment
pnpm dev
```

### 3. Monorepo Structure
- `apps/electron`: Main process and Electron shell.
- `apps/web`: React-based Operator UI.
- `packages/core`: Shared business logic and types.
- `packages/db`: Drizzle ORM schema and SQLite persistence.

### 4. Standards
- **TypeScript**: Strict mode enabled.
- **Linting**: ESLint + Prettier.
- **Database**: Markdown is canonical; DB is an accelerator.
- **Persistence**: SQLite (Better-SQLite3).
