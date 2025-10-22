"use strict";
/**
 * Migration System
 * Schema management with automatic migration generation and version tracking
 * Provides database schema evolution with rollback capabilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationManager = void 0;
const metadata_registry_1 = require("../metadata-registry");
class MigrationManager {
    adapter;
    metadataRegistry;
    migrationsTable = 'nythera_migrations';
    constructor(adapter) {
        this.adapter = adapter;
        this.metadataRegistry = metadata_registry_1.MetadataRegistry.getInstance();
    }
    /**
     * Initialize migrations table
     */
    async initialize() {
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
    async generateMigration(name) {
        const entities = this.metadataRegistry.getAllEntities();
        const schemaDiff = await this.generateSchemaDiff(entities);
        const upSQL = this.generateUpSQL(schemaDiff);
        const downSQL = this.generateDownSQL(schemaDiff);
        const migration = {
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
    async migrate() {
        await this.initialize();
        await this.getAppliedMigrations();
        const pendingMigrations = await this.getPendingMigrations();
        const result = {
            applied: [],
            failed: [],
            skipped: [],
        };
        for (const migration of pendingMigrations) {
            try {
                await this.applyMigration(migration);
                result.applied.push(migration.id);
            }
            catch (error) {
                result.failed.push(migration.id);
                throw error;
            }
        }
        return result;
    }
    /**
     * Rollback last migration
     */
    async rollback() {
        const lastMigration = await this.getLastAppliedMigration();
        if (!lastMigration) {
            throw new Error('No migrations to rollback');
        }
        await this.rollbackMigration(lastMigration);
    }
    /**
     * Rollback to specific migration
     */
    async rollbackTo(migrationId) {
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
    async getStatus() {
        const applied = await this.getAppliedMigrations();
        const pending = await this.getPendingMigrations();
        const lastApplied = applied[applied.length - 1] || null;
        return { applied, pending, lastApplied };
    }
    /**
     * Generate schema diff from entities
     */
    async generateSchemaDiff(entities) {
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
    async getCurrentSchema() {
        // Implementation would query database system tables
        // to get current schema information
        return [];
    }
    /**
     * Generate target schema from entities
     */
    generateTargetSchema(entities) {
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
    findAddedTables(current, target) {
        const diffs = [];
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
    findModifiedTables(current, target) {
        const diffs = [];
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
    findRemovedTables(current, target) {
        const diffs = [];
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
    findColumnDiffs(currentColumns, targetColumns) {
        const diffs = [];
        for (const column of targetColumns) {
            const currentColumn = currentColumns.find(c => c.name === column.name);
            if (!currentColumn) {
                diffs.push({
                    name: column.name,
                    type: 'column',
                    action: 'add',
                    definition: this.generateColumnSQL(column),
                });
            }
            else if (this.hasColumnChanged(currentColumn, column)) {
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
    hasColumnChanged(current, target) {
        return (current.type !== target.type ||
            current.nullable !== target.nullable ||
            current.unique !== target.unique ||
            current.defaultValue !== target.defaultValue);
    }
    /**
     * Generate CREATE TABLE SQL
     */
    generateCreateTableSQL(table) {
        const columns = table.columns.map((col) => this.generateColumnSQL(col));
        const primaryKey = table.columns.find((col) => col.primary);
        const indexes = table.indexes.map((idx) => this.generateIndexSQL(idx));
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
    generateColumnSQL(column) {
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
    generateIndexSQL(index) {
        const unique = index.unique ? 'UNIQUE ' : '';
        return `CREATE ${unique}INDEX ${index.name} ON ${index.table} (${index.columns.join(', ')})`;
    }
    /**
     * Generate UP SQL from schema diff
     */
    generateUpSQL(diff) {
        const statements = [];
        for (const added of diff.added) {
            statements.push(added.definition || '');
        }
        for (const modified of diff.modified) {
            if (modified.action === 'add') {
                statements.push(`ALTER TABLE ${modified.name} ADD COLUMN ${modified.definition}`);
            }
            else if (modified.action === 'modify') {
                statements.push(`ALTER TABLE ${modified.name} MODIFY COLUMN ${modified.definition}`);
            }
        }
        for (const removed of diff.removed) {
            if (removed.type === 'table') {
                statements.push(`DROP TABLE ${removed.name}`);
            }
            else if (removed.type === 'column') {
                statements.push(`ALTER TABLE ${removed.name} DROP COLUMN ${removed.name}`);
            }
        }
        return statements.join(';\n') + ';';
    }
    /**
     * Generate DOWN SQL from schema diff
     */
    generateDownSQL(diff) {
        const statements = [];
        for (const removed of diff.removed) {
            statements.push(removed.definition || '');
        }
        for (const modified of diff.modified) {
            if (modified.action === 'add') {
                statements.push(`ALTER TABLE ${modified.name} DROP COLUMN ${modified.name}`);
            }
            else if (modified.action === 'modify') {
                statements.push(`ALTER TABLE ${modified.name} MODIFY COLUMN ${modified.oldDefinition}`);
            }
        }
        for (const added of diff.added) {
            if (added.type === 'table') {
                statements.push(`DROP TABLE ${added.name}`);
            }
            else if (added.type === 'column') {
                statements.push(`ALTER TABLE ${added.name} DROP COLUMN ${added.name}`);
            }
        }
        return statements.join(';\n') + ';';
    }
    /**
     * Apply migration
     */
    async applyMigration(migration) {
        await this.adapter.query(migration.up);
        await this.recordMigration(migration);
    }
    /**
     * Rollback migration
     */
    async rollbackMigration(migration) {
        await this.adapter.query(migration.down);
        await this.removeMigrationRecord(migration.id);
    }
    /**
     * Record applied migration
     */
    async recordMigration(migration) {
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
    async removeMigrationRecord(id) {
        const sql = `DELETE FROM ${this.migrationsTable} WHERE id = ?`;
        await this.adapter.query(sql, [id]);
    }
    /**
     * Get applied migrations
     */
    async getAppliedMigrations() {
        const sql = `SELECT * FROM ${this.migrationsTable} ORDER BY timestamp ASC`;
        const result = await this.adapter.query(sql);
        return result.rows;
    }
    /**
     * Get pending migrations
     */
    async getPendingMigrations() {
        // Implementation would scan migration files
        // and compare with applied migrations
        return [];
    }
    /**
     * Get last applied migration
     */
    async getLastAppliedMigration() {
        const sql = `SELECT * FROM ${this.migrationsTable} ORDER BY timestamp DESC LIMIT 1`;
        const result = await this.adapter.query(sql);
        return result.rows[0] || null;
    }
    /**
     * Generate migration ID
     */
    generateMigrationId(name) {
        const timestamp = Date.now();
        const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        return `${timestamp}_${sanitizedName}`;
    }
    /**
     * Generate checksum
     */
    generateChecksum(content) {
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
    getDatabaseType(type) {
        const typeMap = {
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
    escapeValue(value) {
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
exports.MigrationManager = MigrationManager;
//# sourceMappingURL=migration.js.map