/**
 * Base Database Adapter
 * Abstract base class for database adapters providing common functionality
 * Implements the adapter pattern for database-agnostic operations
 */

import { Adapter, QueryResult, Transaction } from '@/types';

export abstract class BaseAdapter implements Adapter {
  protected isConnected = false;
  protected currentTransaction: Transaction | null = null;

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
  isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  /**
   * Get current transaction
   */
  getCurrentTransaction(): Transaction | null {
    return this.currentTransaction;
  }

  /**
   * Check if in transaction
   */
  inTransaction(): boolean {
    return this.currentTransaction !== null && this.currentTransaction.isActive;
  }

  /**
   * Generate a unique transaction ID
   */
  protected generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique savepoint name
   */
  protected generateSavepointName(): string {
    return `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate SQL query for security
   */
  protected validateQuery(sql: string): void {
    // Basic SQL injection prevention
    const dangerousPatterns = [
      /--/g,
      /\/\*/g,
      /\/\*.*?\*\//g,
      /;\s*drop\s+table/gi,
      /;\s*delete\s+from/gi,
      /;\s*truncate\s+table/gi,
      /;\s*alter\s+table/gi,
      /;\s*create\s+table/gi,
      /;\s*drop\s+database/gi,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(sql)) {
        throw new Error('Potentially dangerous SQL detected');
      }
    }
  }

  /**
   * Escape identifier for database-specific syntax
   */
  protected escapeIdentifier(identifier: string): string {
    return `"${identifier}"`;
  }

  /**
   * Convert JavaScript value to database value
   */
  protected convertValue(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return value;
  }

  /**
   * Convert database value to JavaScript value
   */
  protected convertFromDatabase(value: any, type: string): any {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type.toLowerCase()) {
      case 'date':
      case 'timestamp':
      case 'datetime':
        return new Date(value);
      case 'json':
      case 'jsonb':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'boolean':
        return Boolean(value);
      case 'number':
      case 'integer':
      case 'bigint':
        return Number(value);
      default:
        return value;
    }
  }

  /**
   * Get database-specific type mapping
   */
  protected getDatabaseType(columnType: string): string {
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

    return typeMap[columnType] || 'VARCHAR';
  }

  /**
   * Get database-specific limit syntax
   */
  protected getLimitSyntax(limit: number, offset?: number): string {
    if (offset) {
      return `LIMIT ${limit} OFFSET ${offset}`;
    }
    return `LIMIT ${limit}`;
  }

  /**
   * Get database-specific order by syntax
   */
  protected getOrderBySyntax(orderBy: Record<string, 'ASC' | 'DESC'>): string {
    const clauses = Object.entries(orderBy).map(
      ([column, direction]) => `${this.escapeIdentifier(column)} ${direction}`
    );
    return `ORDER BY ${clauses.join(', ')}`;
  }
}
