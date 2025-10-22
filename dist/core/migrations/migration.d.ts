/**
 * Migration System
 * Schema management with automatic migration generation and version tracking
 * Provides database schema evolution with rollback capabilities
 */
import { Adapter } from '@/types';
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
export declare class MigrationManager {
    private adapter;
    private metadataRegistry;
    private migrationsTable;
    constructor(adapter: Adapter);
    /**
     * Initialize migrations table
     */
    initialize(): Promise<void>;
    /**
     * Generate migration from entity metadata
     */
    generateMigration(name: string): Promise<Migration>;
    /**
     * Apply pending migrations
     */
    migrate(): Promise<MigrationResult>;
    /**
     * Rollback last migration
     */
    rollback(): Promise<void>;
    /**
     * Rollback to specific migration
     */
    rollbackTo(migrationId: string): Promise<void>;
    /**
     * Get migration status
     */
    getStatus(): Promise<{
        applied: Migration[];
        pending: Migration[];
        lastApplied: Migration | null;
    }>;
    /**
     * Generate schema diff from entities
     */
    private generateSchemaDiff;
    /**
     * Get current database schema
     */
    private getCurrentSchema;
    /**
     * Generate target schema from entities
     */
    private generateTargetSchema;
    /**
     * Find added tables
     */
    private findAddedTables;
    /**
     * Find modified tables
     */
    private findModifiedTables;
    /**
     * Find removed tables
     */
    private findRemovedTables;
    /**
     * Find column differences
     */
    private findColumnDiffs;
    /**
     * Check if column has changed
     */
    private hasColumnChanged;
    /**
     * Generate CREATE TABLE SQL
     */
    private generateCreateTableSQL;
    /**
     * Generate column SQL
     */
    private generateColumnSQL;
    /**
     * Generate index SQL
     */
    private generateIndexSQL;
    /**
     * Generate UP SQL from schema diff
     */
    private generateUpSQL;
    /**
     * Generate DOWN SQL from schema diff
     */
    private generateDownSQL;
    /**
     * Apply migration
     */
    private applyMigration;
    /**
     * Rollback migration
     */
    private rollbackMigration;
    /**
     * Record applied migration
     */
    private recordMigration;
    /**
     * Remove migration record
     */
    private removeMigrationRecord;
    /**
     * Get applied migrations
     */
    private getAppliedMigrations;
    /**
     * Get pending migrations
     */
    private getPendingMigrations;
    /**
     * Get last applied migration
     */
    private getLastAppliedMigration;
    /**
     * Generate migration ID
     */
    private generateMigrationId;
    /**
     * Generate checksum
     */
    private generateChecksum;
    /**
     * Get database type
     */
    private getDatabaseType;
    /**
     * Escape value for SQL
     */
    private escapeValue;
}
//# sourceMappingURL=migration.d.ts.map