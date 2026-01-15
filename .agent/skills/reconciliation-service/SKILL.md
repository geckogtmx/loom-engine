---
name: reconciliation-service
description: Implements MD ↔ DB sync (the "Dual-Truth" problem) for LOOM Engine. Use this skill when building file watchers with chokidar, implementing conflict resolution, or ensuring Markdown remains canonical while SQLite serves as an accelerator. Essential for Phase 1 Core Engine work.
---

# Reconciliation Service

This skill solves LOOM's "Dual-Truth" problem: Markdown is canonical, but SQLite accelerates queries.

## The Problem

```
┌──────────────┐         ┌──────────────┐
│  .loom/*.md  │ ◀──?──▶ │   SQLite DB  │
│  (Canonical) │         │ (Accelerator)│
└──────────────┘         └──────────────┘

Who wins when they disagree? → Markdown ALWAYS wins.
```

## Core Principle

> The database is an **accelerator**, not the source of truth.
> All authoritative data must be rebuildable from Markdown files.

## Architecture

```typescript
interface ReconciliationService {
  // Watch for external MD changes
  startWatching(): void;
  stopWatching(): void;

  // Sync operations
  syncMdToDb(filePath: string): Promise<void>;
  syncDbToMd(entity: Entity): Promise<void>;
  fullReconcile(): Promise<ReconcileReport>;

  // Conflict handling
  detectConflicts(): Promise<Conflict[]>;
  resolveConflict(conflict: Conflict, resolution: Resolution): Promise<void>;
}
```

## File Watcher Setup

```typescript
import chokidar from 'chokidar';
import { debounce } from 'lodash';

class FileWatcherService {
  private watcher: chokidar.FSWatcher | null = null;

  startWatching(loomDir: string): void {
    this.watcher = chokidar.watch(`${loomDir}/**/*.md`, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100,
      },
    });

    const debouncedSync = debounce(
      (path: string) => this.onFileChange(path),
      300
    );

    this.watcher
      .on('add', debouncedSync)
      .on('change', debouncedSync)
      .on('unlink', (path) => this.onFileDelete(path));
  }

  private async onFileChange(filePath: string): Promise<void> {
    const entityType = this.detectEntityType(filePath);
    await this.reconciler.syncMdToDb(filePath, entityType);
  }

  private async onFileDelete(filePath: string): Promise<void> {
    // Mark as deleted in DB, don't hard delete
    await this.reconciler.markDeleted(filePath);
  }

  stopWatching(): void {
    this.watcher?.close();
    this.watcher = null;
  }
}
```

## MD → DB Sync

When Markdown changes externally (user edits in Obsidian):

```typescript
class MdToDbSyncer {
  async sync(filePath: string): Promise<void> {
    // 1. Parse markdown
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = this.parseMarkdown(content);

    // 2. Compute hash for change detection
    const contentHash = this.computeHash(content);

    // 3. Check if DB record exists
    const existing = await this.findByMdPath(filePath);

    if (!existing) {
      // New file - create DB record
      await this.createFromMd(parsed, filePath, contentHash);
    } else if (existing.mdHash !== contentHash) {
      // Changed - update DB record
      await this.updateFromMd(existing.id, parsed, contentHash);
    }
    // else: no change, skip
  }

  private parseMarkdown(content: string): ParsedEntity {
    // Extract YAML frontmatter
    const { data: frontmatter, content: body } = matter(content);

    return {
      frontmatter,
      body,
      sections: this.parseSections(body),
    };
  }
}
```

## DB → MD Sync

When DB changes (through UI):

```typescript
class DbToMdSyncer {
  async sync(entity: Entity): Promise<void> {
    const filePath = this.getMdPath(entity);

    // 1. Generate markdown
    const markdown = this.generateMarkdown(entity);

    // 2. Write to file
    await fs.writeFile(filePath, markdown, 'utf-8');

    // 3. Update hash in DB
    const newHash = this.computeHash(markdown);
    await this.updateMdHash(entity.id, newHash);
  }

  private generateMarkdown(entity: Entity): string {
    const frontmatter = yaml.stringify(entity.metadata);
    const body = this.generateBody(entity);

    return `---\n${frontmatter}---\n\n${body}`;
  }
}
```

## Conflict Detection

```typescript
interface Conflict {
  entityId: string;
  filePath: string;
  dbVersion: Entity;
  mdVersion: ParsedEntity;
  detectedAt: Date;
}

type Resolution = 'use-md' | 'use-db' | 'merge';

class ConflictDetector {
  async detect(): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];

    // Get all entities with MD paths
    const entities = await db.select()
      .from(table)
      .where(isNotNull(table.mdPath));

    for (const entity of entities) {
      const mdContent = await fs.readFile(entity.mdPath, 'utf-8');
      const mdHash = this.computeHash(mdContent);

      // Hash mismatch = potential conflict
      if (mdHash !== entity.mdHash) {
        const parsed = this.parseMarkdown(mdContent);

        // Check if it's a real conflict or just MD updated
        if (this.hasConflictingChanges(entity, parsed)) {
          conflicts.push({
            entityId: entity.id,
            filePath: entity.mdPath,
            dbVersion: entity,
            mdVersion: parsed,
            detectedAt: new Date(),
          });
        }
      }
    }

    return conflicts;
  }
}
```

## Conflict Resolution

```typescript
class ConflictResolver {
  async resolve(conflict: Conflict, resolution: Resolution): Promise<void> {
    switch (resolution) {
      case 'use-md':
        // MD wins (default behavior)
        await this.mdToDbSyncer.sync(conflict.filePath);
        break;

      case 'use-db':
        // DB wins (user explicitly chose)
        await this.dbToMdSyncer.sync(conflict.dbVersion);
        break;

      case 'merge':
        // Manual merge (show diff UI)
        await this.showMergeUI(conflict);
        break;
    }
  }
}
```

## Full Reconciliation

Run on startup or manually:

```typescript
class FullReconciler {
  async reconcile(): Promise<ReconcileReport> {
    const report: ReconcileReport = {
      created: 0,
      updated: 0,
      deleted: 0,
      conflicts: [],
    };

    // 1. Scan all MD files
    const mdFiles = await glob(`${this.loomDir}/**/*.md`);

    for (const file of mdFiles) {
      const result = await this.mdToDbSyncer.sync(file);
      if (result === 'created') report.created++;
      if (result === 'updated') report.updated++;
    }

    // 2. Find orphaned DB records (MD deleted)
    const orphans = await this.findOrphans();
    for (const orphan of orphans) {
      await this.markDeleted(orphan.id);
      report.deleted++;
    }

    // 3. Detect conflicts
    report.conflicts = await this.conflictDetector.detect();

    return report;
  }

  private async findOrphans(): Promise<Entity[]> {
    const entities = await db.select()
      .from(table)
      .where(isNotNull(table.mdPath));

    const orphans: Entity[] = [];
    for (const entity of entities) {
      if (!await fs.exists(entity.mdPath)) {
        orphans.push(entity);
      }
    }
    return orphans;
  }
}
```

## Schema Support

Add sync columns to tables:

```typescript
export const syncColumns = {
  mdPath: text('md_path'),
  mdHash: text('md_hash'),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
};

export const worlds = sqliteTable('worlds', {
  ...baseColumns,
  ...syncColumns,
  name: text('name').notNull(),
  purpose: text('purpose').notNull(),
});
```

## Testing

```typescript
describe('ReconciliationService', () => {
  it('should sync MD changes to DB', async () => {
    // Create MD file
    await fs.writeFile('.loom/worlds/test.md', '---\nname: Test\n---');

    // Trigger sync
    await reconciler.syncMdToDb('.loom/worlds/test.md');

    // Verify DB
    const world = await db.query.worlds.findFirst({
      where: eq(worlds.mdPath, '.loom/worlds/test.md'),
    });
    expect(world?.name).toBe('Test');
  });

  it('should detect conflicts', async () => {
    // Setup: DB and MD have different content
    await db.insert(worlds).values({
      id: 'w1',
      name: 'DB Version',
      mdPath: '.loom/worlds/test.md',
      mdHash: 'old-hash',
    });
    await fs.writeFile('.loom/worlds/test.md', '---\nname: MD Version\n---');

    const conflicts = await reconciler.detectConflicts();
    expect(conflicts).toHaveLength(1);
  });

  it('should resolve conflict using MD', async () => {
    const conflict = conflicts[0];
    await reconciler.resolveConflict(conflict, 'use-md');

    const world = await db.query.worlds.findFirst({
      where: eq(worlds.id, conflict.entityId),
    });
    expect(world?.name).toBe('MD Version');
  });
});
```
