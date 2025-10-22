/**
 * Migration System
 * Schema management with automatic migration generation and version tracking
 * Provides database schema evolution with rollback capabilities
 */

import { Adapter } from '@/types';
import { MetadataRegistry } from '../metadata-registry';

export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
  timestamp: number;
  checksum: string;
}

export interface MigrationResult {
  applied: string[];
  failed: string[];
  skipped: string[];
}

export interface SchemaDiff {
  added: TableDiff[];
  modified: TableDiff[];
  removed: TableDiff[];
}

export interface TableDiff {
  name: string;
  type: 'table' | 'column' | 'index' | 'constraint';
  action: 'add' | 'modify' | 'remove';
  definition?: string;
  oldDefinition?: string;
}

export class MigrationManager {
  private adapter: Adapter;
  private metadataRegistry: MetadataRegistry;
  private migrationsTable = 'nythera_migrations';

  constructor(adapter: Adapter) {
    this.adapter = adapter;
    this.metadataRegistry = MetadataRegistry.getInstance();
  }

  /**
   * Initialize migrations table
   */
  async initialize(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        up TEXT NOT NULL,
        down TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        checksum VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await this.adapter.query(createTableSQL);
  }

  /**
   * Generate migration from entity metadata
   */
  async generateMigration(name: string): Promise<Migration> {
    const entities = this.metadataRegistry.getAllEntities();
    const schemaDiff = await this.generateSchemaDiff(entities);

    const upSQL = this.generateUpSQL(schemaDiff);
    const downSQL = this.generateDownSQL(schemaDiff);

    const migration: Migration = {
      id: this.generateMigrationId(name),
      name,
      up: upSQL,
      down: downSQL,
      timestamp: Date.now(),
      checksum: this.generateChecksum(upSQL + downSQL),
    };

    return migration;
  }

  /**
   * Apply pending migrations
   */
  async migrate(): Promise<MigrationResult> {
    await this.initialize();

    await this.getAppliedMigrations();
    const pendingMigrations = await this.getPendingMigrations();

    const result: MigrationResult = {
      applied: [],
      failed: [],
      skipped: [],
    };

    for (const migration of pendingMigrations) {
      try {
        await this.applyMigration(migration);
        result.applied.push(migration.id);
      } catch (error) {
        result.failed.push(migration.id);
        throw error;
      }
    }

    return result;
  }

  /**
   * Rollback last migration
   */
  async rollback(): Promise<void> {
    const lastMigration = await this.getLastAppliedMigration();
    if (!lastMigration) {
      throw new Error('No migrations to rollback');
    }

    await this.rollbackMigration(lastMigration);
  }

  /**
   * Rollback to specific migration
   */
  async rollbackTo(migrationId: string): Promise<void> {
    const migrations = await this.getAppliedMigrations();
    const targetIndex = migrations.findIndex(m => m.id === migrationId);

    if (targetIndex === -1) {
      throw new Error(`Migration ${migrationId} not found`);
    }

    const migrationsToRollback = migrations.slice(targetIndex + 1).reverse();

    for (const migration of migrationsToRollback) {
      await this.rollbackMigration(migration);
    }
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    applied: Migration[];
    pending: Migration[];
    lastApplied: Migration | null;
  }> {
    const applied = await this.getAppliedMigrations();
    const pending = await this.getPendingMigrations();
    const lastApplied = applied[applied.length - 1] || null;

    return { applied, pending, lastApplied };
  }

  /**
   * Generate schema diff from entities
   */
  private async generateSchemaDiff(entities: any[]): Promise<SchemaDiff> {
    const currentSchema = await this.getCurrentSchema();
    const targetSchema = this.generateTargetSchema(entities);

    return {
      added: this.findAddedTables(currentSchema, targetSchema),
      modified: this.findModifiedTables(currentSchema, targetSchema),
      removed: this.findRemovedTables(currentSchema, targetSchema),
    };
  }

  /**
   * Get current database schema
   */
  private async getCurrentSchema(): Promise<any[]> {
    // Implementation would query database system tables
    // to get current schema information
    return [];
  }

  /**
   * Generate target schema from entities
   */
  private generateTargetSchema(entities: any[]): any[] {
    return entities.map(entity => ({
      name: entity.tableName,
      columns: entity.columns,
      indexes: entity.indexes,
      constraints: [],
    }));
  }

  /**
   * Find added tables
   */
  private findAddedTables(current: any[], target: any[]): TableDiff[] {
    const diffs: TableDiff[] = [];

    for (const table of target) {
      if (!current.find(t => t.name === table.name)) {
        diffs.push({
          name: table.name,
          type: 'table',
          action: 'add',
          definition: this.generateCreateTableSQL(table),
        });
      }
    }

    return diffs;
  }

  /**
   * Find modified tables
   */
  private findModifiedTables(current: any[], target: any[]): TableDiff[] {
    const diffs: TableDiff[] = [];

    for (const table of target) {
      const currentTable = current.find(t => t.name === table.name);
      if (currentTable) {
        const columnDiffs = this.findColumnDiffs(currentTable.columns, table.columns);
        diffs.push(...columnDiffs);
      }
    }

    return diffs;
  }

  /**
   * Find removed tables
   */
  private findRemovedTables(current: any[], target: any[]): TableDiff[] {
    const diffs: TableDiff[] = [];

    for (const table of current) {
      if (!target.find(t => t.name === table.name)) {
        diffs.push({
          name: table.name,
          type: 'table',
          action: 'remove',
        });
      }
    }

    return diffs;
  }

  /**
   * Find column differences
   */
  private findColumnDiffs(currentColumns: any[], targetColumns: any[]): TableDiff[] {
    const diffs: TableDiff[] = [];

    for (const column of targetColumns) {
      const currentColumn = currentColumns.find(c => c.name === column.name);
      if (!currentColumn) {
        diffs.push({
          name: column.name,
          type: 'column',
          action: 'add',
          definition: this.generateColumnSQL(column),
        });
      } else if (this.hasColumnChanged(currentColumn, column)) {
        diffs.push({
          name: column.name,
          type: 'column',
          action: 'modify',
          definition: this.generateColumnSQL(column),
          oldDefinition: this.generateColumnSQL(currentColumn),
        });
      }
    }

    return diffs;
  }

  /**
   * Check if column has changed
   */
  private hasColumnChanged(current: any, target: any): boolean {
    return (
      current.type !== target.type ||
      current.nullable !== target.nullable ||
      current.unique !== target.unique ||
      current.defaultValue !== target.defaultValue
    );
  }

  /**
   * Generate CREATE TABLE SQL
   */
  private generateCreateTableSQL(table: any): string {
    const columns = table.columns.map((col: any) => this.generateColumnSQL(col));
    const primaryKey = table.columns.find((col: any) => col.primary);
    const indexes = table.indexes.map((idx: any) => this.generateIndexSQL(idx));

    let sql = `CREATE TABLE ${table.name} (\n`;
    sql += `  ${columns.join(',\n  ')}`;

    if (primaryKey) {
      sql += `,\n  PRIMARY KEY (${primaryKey.name})`;
    }

    sql += `\n)`;

    if (indexes.length > 0) {
      sql += `;\n${indexes.join(';\n')}`;
    }

    return sql;
  }

  /**
   * Generate column SQL
   */
  private generateColumnSQL(column: any): string {
    let sql = `${column.name} ${this.getDatabaseType(column.type)}`;

    if (column.length) {
      sql += `(${column.length})`;
    }

    if (!column.nullable) {
      sql += ' NOT NULL';
    }

    if (column.unique) {
      sql += ' UNIQUE';
    }

    if (column.defaultValue !== undefined) {
      sql += ` DEFAULT ${this.escapeValue(column.defaultValue)}`;
    }

    return sql;
  }

  /**
   * Generate index SQL
   */
  private generateIndexSQL(index: any): string {
    const unique = index.unique ? 'UNIQUE ' : '';
    return `CREATE ${unique}INDEX ${index.name} ON ${index.table} (${index.columns.join(', ')})`;
  }

  /**
   * Generate UP SQL from schema diff
   */
  private generateUpSQL(diff: SchemaDiff): string {
    const statements: string[] = [];

    for (const added of diff.added) {
      statements.push(added.definition || '');
    }

    for (const modified of diff.modified) {
      if (modified.action === 'add') {
        statements.push(`ALTER TABLE ${modified.name} ADD COLUMN ${modified.definition}`);
      } else if (modified.action === 'modify') {
        statements.push(`ALTER TABLE ${modified.name} MODIFY COLUMN ${modified.definition}`);
      }
    }

    for (const removed of diff.removed) {
      if (removed.type === 'table') {
        statements.push(`DROP TABLE ${removed.name}`);
      } else if (removed.type === 'column') {
        statements.push(`ALTER TABLE ${removed.name} DROP COLUMN ${removed.name}`);
      }
    }

    return statements.join(';\n') + ';';
  }

  /**
   * Generate DOWN SQL from schema diff
   */
  private generateDownSQL(diff: SchemaDiff): string {
    const statements: string[] = [];

    for (const removed of diff.removed) {
      statements.push(removed.definition || '');
    }

    for (const modified of diff.modified) {
      if (modified.action === 'add') {
        statements.push(`ALTER TABLE ${modified.name} DROP COLUMN ${modified.name}`);
      } else if (modified.action === 'modify') {
        statements.push(`ALTER TABLE ${modified.name} MODIFY COLUMN ${modified.oldDefinition}`);
      }
    }

    for (const added of diff.added) {
      if (added.type === 'table') {
        statements.push(`DROP TABLE ${added.name}`);
      } else if (added.type === 'column') {
        statements.push(`ALTER TABLE ${added.name} DROP COLUMN ${added.name}`);
      }
    }

    return statements.join(';\n') + ';';
  }

  /**
   * Apply migration
   */
  private async applyMigration(migration: Migration): Promise<void> {
    await this.adapter.query(migration.up);
    await this.recordMigration(migration);
  }

  /**
   * Rollback migration
   */
  private async rollbackMigration(migration: Migration): Promise<void> {
    await this.adapter.query(migration.down);
    await this.removeMigrationRecord(migration.id);
  }

  /**
   * Record applied migration
   */
  private async recordMigration(migration: Migration): Promise<void> {
    const sql = `
      INSERT INTO ${this.migrationsTable} (id, name, up, down, timestamp, checksum)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await this.adapter.query(sql, [
      migration.id,
      migration.name,
      migration.up,
      migration.down,
      migration.timestamp,
      migration.checksum,
    ]);
  }

  /**
   * Remove migration record
   */
  private async removeMigrationRecord(id: string): Promise<void> {
    const sql = `DELETE FROM ${this.migrationsTable} WHERE id = ?`;
    await this.adapter.query(sql, [id]);
  }

  /**
   * Get applied migrations
   */
  private async getAppliedMigrations(): Promise<Migration[]> {
    const sql = `SELECT * FROM ${this.migrationsTable} ORDER BY timestamp ASC`;
    const result = await this.adapter.query<Migration>(sql);
    return result.rows;
  }

  /**
   * Get pending migrations
   */
  private async getPendingMigrations(): Promise<Migration[]> {
    // Implementation would scan migration files
    // and compare with applied migrations
    return [];
  }

  /**
   * Get last applied migration
   */
  private async getLastAppliedMigration(): Promise<Migration | null> {
    const sql = `SELECT * FROM ${this.migrationsTable} ORDER BY timestamp DESC LIMIT 1`;
    const result = await this.adapter.query<Migration>(sql);
    return result.rows[0] || null;
  }

  /**
   * Generate migration ID
   */
  private generateMigrationId(name: string): string {
    const timestamp = Date.now();
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${timestamp}_${sanitizedName}`;
  }

  /**
   * Generate checksum
   */
  private generateChecksum(content: string): string {
    // Simple checksum implementation
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Get database type
   */
  private getDatabaseType(type: string): string {
    const typeMap: Record<string, string> = {
      string: 'VARCHAR',
      number: 'INTEGER',
      boolean: 'BOOLEAN',
      date: 'TIMESTAMP',
      json: 'JSON',
      uuid: 'UUID',
      text: 'TEXT',
      blob: 'BLOB',
    };

    return typeMap[type] || 'VARCHAR';
  }

  /**
   * Escape value for SQL
   */
  private escapeValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }

    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }

    return String(value);
  }
}
