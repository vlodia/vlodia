/**
 * PostgreSQL Adapter
 * Database adapter implementation for PostgreSQL with connection pooling
 * Provides optimized PostgreSQL-specific features and syntax
 */

import { Pool } from 'pg';
import { BaseAdapter } from './base-adapter';
import { QueryResult, Transaction, DatabaseConfig } from '@/types';

export class PostgresAdapter extends BaseAdapter {
  private pool: Pool | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    super();
    this.config = config;
  }

  /**
   * Connect to PostgreSQL database
   */
  override async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    this.pool = new Pool({
      host: this.config.host || 'localhost',
      port: this.config.port || 5432,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
      max: this.config.pool?.max || 20,
      min: this.config.pool?.min || 2,
      idleTimeoutMillis: this.config.pool?.idle || 30000,
    });

    // Test connection
    const client = await this.pool.connect();
    await client.query('SELECT 1');
    client.release();

    this.isConnected = true;
  }

  /**
   * Disconnect from PostgreSQL database
   */
  override async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this.isConnected = false;
  }

  /**
   * Execute a parameterized query
   */
  override async query<T>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    this.validateQuery(sql);

    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);

      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        fields: result.fields.map((field: any) => ({
          name: field.name,
          dataType: field.dataTypeID.toString(),
          nullable: field.nullable,
        })),
      };
    } finally {
      client.release();
    }
  }

  /**
   * Begin a new transaction
   */
  override async begin(): Promise<Transaction> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      level: 'READ_COMMITTED',
      savepoints: [],
      isActive: true,
    };

    this.currentTransaction = transaction;
    await this.query('BEGIN');

    return transaction;
  }

  /**
   * Commit a transaction
   */
  override async commit(transaction: Transaction): Promise<void> {
    if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
      throw new Error('Invalid transaction');
    }

    await this.query('COMMIT');
    this.currentTransaction = null;
  }

  /**
   * Rollback a transaction
   */
  override async rollback(transaction: Transaction): Promise<void> {
    if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
      throw new Error('Invalid transaction');
    }

    await this.query('ROLLBACK');
    this.currentTransaction = null;
  }

  /**
   * Create a savepoint within a transaction
   */
  async savepoint(transaction: Transaction, name: string): Promise<void> {
    if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
      throw new Error('Invalid transaction');
    }

    await this.query(`SAVEPOINT ${name}`);
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

    await this.query(`ROLLBACK TO SAVEPOINT ${name}`);

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

    await this.query(`RELEASE SAVEPOINT ${name}`);

    const index = transaction.savepoints.indexOf(name);
    transaction.savepoints.splice(index, 1);
  }

  /**
   * Get PostgreSQL-specific type mapping
   */
  protected override getDatabaseType(columnType: string): string {
    const typeMap: Record<string, string> = {
      string: 'VARCHAR',
      number: 'INTEGER',
      boolean: 'BOOLEAN',
      date: 'TIMESTAMP',
      json: 'JSONB',
      uuid: 'UUID',
      text: 'TEXT',
      blob: 'BYTEA',
    };

    return typeMap[columnType] || 'VARCHAR';
  }

  /**
   * Get PostgreSQL-specific limit syntax
   */
  protected override getLimitSyntax(limit: number, offset?: number): string {
    if (offset) {
      return `LIMIT ${limit} OFFSET ${offset}`;
    }
    return `LIMIT ${limit}`;
  }

  /**
   * Get PostgreSQL-specific order by syntax
   */
  protected override getOrderBySyntax(orderBy: Record<string, 'ASC' | 'DESC'>): string {
    const clauses = Object.entries(orderBy).map(
      ([column, direction]) => `"${column}" ${direction}`
    );
    return `ORDER BY ${clauses.join(', ')}`;
  }

  /**
   * Get PostgreSQL-specific escape identifier
   */
  protected override escapeIdentifier(identifier: string): string {
    return `"${identifier}"`;
  }

  /**
   * Get PostgreSQL-specific value conversion
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

    return value;
  }

  /**
   * Get PostgreSQL-specific value conversion from database
   */
  protected override convertFromDatabase(value: any, type: string): any {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type.toLowerCase()) {
      case 'timestamp':
      case 'timestamptz':
        return new Date(value);
      case 'jsonb':
      case 'json':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'boolean':
        return Boolean(value);
      case 'integer':
      case 'bigint':
        return Number(value);
      default:
        return value;
    }
  }
}
