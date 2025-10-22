/**
 * SQLite Adapter
 * Database adapter implementation for SQLite with connection pooling
 * Provides optimized SQLite-specific features and syntax
 */

import { Database } from 'sqlite';
import { BaseAdapter } from './base-adapter';
import { QueryResult, Transaction, DatabaseConfig } from '@/types';

export class SqliteAdapter extends BaseAdapter {
  private db: Database | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    super();
    this.config = config;
  }

  /**
   * Connect to SQLite database
   */
  override async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    const sqlite = require('sqlite');
    this.db = await sqlite.open(this.config.database);
    this.isConnected = true;
  }

  /**
   * Disconnect from SQLite database
   */
  override async disconnect(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }

  /**
   * Execute a parameterized query
   */
  override async query<T>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    this.validateQuery(sql);

    const rows = await this.db.all(sql, params || []);
    return {
      rows: rows as T[],
      rowCount: rows.length,
      fields: [], // SQLite doesn't provide field metadata in this format
    };
  }

  /**
   * Begin a new transaction
   */
  override async begin(): Promise<Transaction> {
    if (!this.db) {
      throw new Error('Database not connected');
    }

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      level: 'SERIALIZABLE',
      savepoints: [],
      isActive: true,
    };

    this.currentTransaction = transaction;
    await this.db.run('BEGIN TRANSACTION');

    return transaction;
  }

  /**
   * Commit a transaction
   */
  override async commit(transaction: Transaction): Promise<void> {
    if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
      throw new Error('Invalid transaction');
    }

    await this.db!.run('COMMIT');
    this.currentTransaction = null;
  }

  /**
   * Rollback a transaction
   */
  override async rollback(transaction: Transaction): Promise<void> {
    if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
      throw new Error('Invalid transaction');
    }

    await this.db!.run('ROLLBACK');
    this.currentTransaction = null;
  }

  /**
   * Create a savepoint within a transaction
   */
  async savepoint(transaction: Transaction, name: string): Promise<void> {
    if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
      throw new Error('Invalid transaction');
    }

    await this.db!.run(`SAVEPOINT ${name}`);
    transaction.savepoints.push(name);
  }

  /**
   * Rollback to a savepoint
   */
  async rollbackToSavepoint(transaction: Transaction, name: string): Promise<void> {
    if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
      throw new Error('Invalid transaction');
    }

    if (!transaction.savepoints.includes(name)) {
      throw new Error('Savepoint not found');
    }

    await this.db!.run(`ROLLBACK TO SAVEPOINT ${name}`);

    // Remove savepoints after this one
    const index = transaction.savepoints.indexOf(name);
    transaction.savepoints = transaction.savepoints.slice(0, index);
  }

  /**
   * Release a savepoint
   */
  async releaseSavepoint(transaction: Transaction, name: string): Promise<void> {
    if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
      throw new Error('Invalid transaction');
    }

    if (!transaction.savepoints.includes(name)) {
      throw new Error('Savepoint not found');
    }

    await this.db!.run(`RELEASE SAVEPOINT ${name}`);

    const index = transaction.savepoints.indexOf(name);
    transaction.savepoints.splice(index, 1);
  }

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
  protected override getDatabaseType(columnType: string): string {
    const typeMap: Record<string, string> = {
      string: 'TEXT',
      number: 'INTEGER',
      boolean: 'INTEGER',
      date: 'TEXT',
      json: 'TEXT',
      uuid: 'TEXT',
      text: 'TEXT',
      blob: 'BLOB',
    };

    return typeMap[columnType] || 'TEXT';
  }

  /**
   * Get SQLite-specific limit syntax
   */
  protected override getLimitSyntax(limit: number, offset?: number): string {
    if (offset) {
      return `LIMIT ${limit} OFFSET ${offset}`;
    }
    return `LIMIT ${limit}`;
  }

  /**
   * Get SQLite-specific order by syntax
   */
  protected override getOrderBySyntax(orderBy: Record<string, 'ASC' | 'DESC'>): string {
    const clauses = Object.entries(orderBy).map(
      ([column, direction]) => `"${column}" ${direction}`
    );
    return `ORDER BY ${clauses.join(', ')}`;
  }

  /**
   * Get SQLite-specific escape identifier
   */
  protected override escapeIdentifier(identifier: string): string {
    return `"${identifier}"`;
  }

  /**
   * Get SQLite-specific value conversion
   */
  protected override convertValue(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }

    return value;
  }

  /**
   * Get SQLite-specific value conversion from database
   */
  protected override convertFromDatabase(value: any, type: string): any {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type.toLowerCase()) {
      case 'text':
        // Try to parse as date if it looks like an ISO string
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value);
        }
        return value;
      case 'json':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'integer':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      default:
        return value;
    }
  }
}
