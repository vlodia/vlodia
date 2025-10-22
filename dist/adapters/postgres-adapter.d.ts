/**
 * PostgreSQL Adapter
 * Database adapter implementation for PostgreSQL with connection pooling
 * Provides optimized PostgreSQL-specific features and syntax
 */
import { BaseAdapter } from './base-adapter';
import { QueryResult, Transaction, DatabaseConfig } from '@/types';
export declare class PostgresAdapter extends BaseAdapter {
    private pool;
    private config;
    constructor(config: DatabaseConfig);
    /**
     * Connect to PostgreSQL database
     */
    connect(): Promise<void>;
    /**
     * Disconnect from PostgreSQL database
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
     * Get PostgreSQL-specific type mapping
     */
    protected getDatabaseType(columnType: string): string;
    /**
     * Get PostgreSQL-specific limit syntax
     */
    protected getLimitSyntax(limit: number, offset?: number): string;
    /**
     * Get PostgreSQL-specific order by syntax
     */
    protected getOrderBySyntax(orderBy: Record<string, 'ASC' | 'DESC'>): string;
    /**
     * Get PostgreSQL-specific escape identifier
     */
    protected escapeIdentifier(identifier: string): string;
    /**
     * Get PostgreSQL-specific value conversion
     */
    protected convertValue(value: any): any;
    /**
     * Get PostgreSQL-specific value conversion from database
     */
    protected convertFromDatabase(value: any, type: string): any;
}
//# sourceMappingURL=postgres-adapter.d.ts.map