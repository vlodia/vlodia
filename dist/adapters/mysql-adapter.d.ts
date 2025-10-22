/**
 * MySQL Adapter
 * Database adapter implementation for MySQL with connection pooling
 * Provides optimized MySQL-specific features and syntax
 */
import { BaseAdapter } from './base-adapter';
import { QueryResult, Transaction, DatabaseConfig } from '@/types';
/**
 * MySQL-specific adapter for Nythera ORM.
 * Utilizes connection pooling for efficient resource management.
 */
export declare class MysqlAdapter extends BaseAdapter {
    private pool;
    private config;
    constructor(config: DatabaseConfig);
    /**
     * Connect to MySQL database
     */
    connect(): Promise<void>;
    /**
     * Disconnect from MySQL database
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
     * Get MySQL-specific type mapping
     */
    protected getDatabaseType(columnType: string): string;
    /**
     * Get MySQL-specific limit syntax
     */
    protected getLimitSyntax(limit: number, offset?: number): string;
    /**
     * Get MySQL-specific order by syntax
     */
    protected getOrderBySyntax(orderBy: Record<string, 'ASC' | 'DESC'>): string;
    /**
     * Get MySQL-specific escape identifier
     */
    protected escapeIdentifier(identifier: string): string;
    /**
     * Get MySQL-specific value conversion
     */
    protected convertValue(value: any): any;
    /**
     * Get MySQL-specific value conversion from database
     */
    protected convertFromDatabase(value: any, type: string): any;
}
//# sourceMappingURL=mysql-adapter.d.ts.map