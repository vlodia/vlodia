/**
 * SQLite Adapter
 * Database adapter implementation for SQLite with connection pooling
 * Provides optimized SQLite-specific features and syntax
 */
import { BaseAdapter } from './base-adapter';
import { QueryResult, Transaction, DatabaseConfig } from '@/types';
export declare class SqliteAdapter extends BaseAdapter {
    private db;
    private config;
    constructor(config: DatabaseConfig);
    /**
     * Connect to SQLite database
     */
    connect(): Promise<void>;
    /**
     * Disconnect from SQLite database
     */
    disconnect(): Promise<void>;
    /**
     * Execute a parameterized query
     */
    query<T>(sql: string, params?: any[]): Promise<QueryResult<T>>;
    /**
     * Begin a new transaction
     */
    begin(): Promise<Transaction>;
    /**
     * Commit a transaction
     */
    commit(transaction: Transaction): Promise<void>;
    /**
     * Rollback a transaction
     */
    rollback(transaction: Transaction): Promise<void>;
    /**
     * Create a savepoint within a transaction
     */
    savepoint(transaction: Transaction, name: string): Promise<void>;
    /**
     * Rollback to a savepoint
     */
    rollbackToSavepoint(transaction: Transaction, name: string): Promise<void>;
    /**
     * Release a savepoint
     */
    releaseSavepoint(transaction: Transaction, name: string): Promise<void>;
    /**
     /**
      * Get SQLite-specific type mapping.
      * Maps logical ORM column types to their SQLite storage representations.
      *
      * @param columnType - The logical column type (from Nythera's type system).
      * @returns SQLite type as a string.
      *
      * Design:
      *   - Uses an explicit type map.
      *   - Defaults to TEXT for unknown types; ensures type safety.
      *   - Complies with strict TypeScript and production standards.
      *
      * Trade-offs:
      *   - Simplicity and maintainability; sacrificing lower-level type control.
      *   - Performance is unaffected at runtime (static config).
      */
    protected getDatabaseType(columnType: string): string;
    /**
     * Get SQLite-specific limit syntax
     */
    protected getLimitSyntax(limit: number, offset?: number): string;
    /**
     * Get SQLite-specific order by syntax
     */
    protected getOrderBySyntax(orderBy: Record<string, 'ASC' | 'DESC'>): string;
    /**
     * Get SQLite-specific escape identifier
     */
    protected escapeIdentifier(identifier: string): string;
    /**
     * Get SQLite-specific value conversion
     */
    protected convertValue(value: any): any;
    /**
     * Get SQLite-specific value conversion from database
     */
    protected convertFromDatabase(value: any, type: string): any;
}
//# sourceMappingURL=sqlite-adapter.d.ts.map