/**
 * Base Database Adapter
 * Abstract base class for database adapters providing common functionality
 * Implements the adapter pattern for database-agnostic operations
 */
import { Adapter, QueryResult, Transaction } from '@/types';
export declare abstract class BaseAdapter implements Adapter {
    protected isConnected: boolean;
    protected currentTransaction: Transaction | null;
    /**
     * Connect to the database
     */
    abstract connect(): Promise<void>;
    /**
     * Disconnect from the database
     */
    abstract disconnect(): Promise<void>;
    /**
     * Execute a parameterized query
     */
    abstract query<T>(sql: string, params?: any[]): Promise<QueryResult<T>>;
    /**
     * Begin a new transaction
     */
    abstract begin(): Promise<Transaction>;
    /**
     * Commit a transaction
     */
    abstract commit(transaction: Transaction): Promise<void>;
    /**
     * Rollback a transaction
     */
    abstract rollback(transaction: Transaction): Promise<void>;
    /**
     * Create a savepoint within a transaction
     */
    abstract savepoint(transaction: Transaction, name: string): Promise<void>;
    /**
     * Rollback to a savepoint
     */
    abstract rollbackToSavepoint(transaction: Transaction, name: string): Promise<void>;
    /**
     * Release a savepoint
     */
    abstract releaseSavepoint(transaction: Transaction, name: string): Promise<void>;
    /**
     * Check if currently connected
     */
    isConnectedToDatabase(): boolean;
    /**
     * Get current transaction
     */
    getCurrentTransaction(): Transaction | null;
    /**
     * Check if in transaction
     */
    inTransaction(): boolean;
    /**
     * Generate a unique transaction ID
     */
    protected generateTransactionId(): string;
    /**
     * Generate a unique savepoint name
     */
    protected generateSavepointName(): string;
    /**
     * Validate SQL query for security
     */
    protected validateQuery(sql: string): void;
    /**
     * Escape identifier for database-specific syntax
     */
    protected escapeIdentifier(identifier: string): string;
    /**
     * Convert JavaScript value to database value
     */
    protected convertValue(value: any): any;
    /**
     * Convert database value to JavaScript value
     */
    protected convertFromDatabase(value: any, type: string): any;
    /**
     * Get database-specific type mapping
     */
    protected getDatabaseType(columnType: string): string;
    /**
     * Get database-specific limit syntax
     */
    protected getLimitSyntax(limit: number, offset?: number): string;
    /**
     * Get database-specific order by syntax
     */
    protected getOrderBySyntax(orderBy: Record<string, 'ASC' | 'DESC'>): string;
}
//# sourceMappingURL=base-adapter.d.ts.map