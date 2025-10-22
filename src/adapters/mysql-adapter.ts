/**
 * MySQL Adapter
 * Database adapter implementation for MySQL with connection pooling
  * Provides optimized MySQL-specific features and syntax
*/

import { Pool } from 'mysql';
import { BaseAdapter } from './base-adapter';
import { QueryResult, Transaction, DatabaseConfig } from '@/types';

/**
 * MySQL-specific adapter for Nythera ORM.
 * Utilizes connection pooling for efficient resource management.
 */
export class MysqlAdapter extends BaseAdapter {
  private pool: Pool | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    super();
    this.config = config;
  }

  /**
   * Connect to MySQL database
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    // Instantiate pool using the correct mysql2/promise interface for runtime compatibility, not type-only import.
    // This improves runtime correctness and leverages the official maintained client for pooled connections.
    const mysql = require('mysql2/promise'); // Only used here to ensure Pool is a value, not just a type
    this.pool = mysql.createPool({
      host: this.config.host || 'localhost',
      port: this.config.port || 3306,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      ssl: this.config.ssl,
      connectionLimit: this.config.pool?.max || 20,
      acquireTimeout: 60000,
      timeout: 60000,
    });

    // Test connection
    return new Promise((resolve, reject) => {
      this.pool!.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        
        connection.ping((pingErr) => {
          connection.release();
          if (pingErr) {
            reject(pingErr);
            return;
          }
          this.isConnected = true;
          resolve();
        });
      });
    });
  }

  /**
   * Disconnect from MySQL database
   */
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this.isConnected = false;
  }

  /**
   * Execute a parameterized query
   */
  async query<T>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    this.validateQuery(sql);

    return new Promise((resolve, reject) => {
      this.pool!.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        connection.query(sql, params, (queryErr, results, fields) => {
          connection.release();
          
          if (queryErr) {
            reject(queryErr);
            return;
          }

          resolve({
            rows: results as T[],
            rowCount: Array.isArray(results) ? results.length : 0,
            /**
             * MySQL `FieldInfo` lacks a `nullable` property; map the available metadata explicitly.
             * See: https://github.com/mysqljs/mysql#field-information
             */
            /**
             * Map MySQL field metadata to a safe, typed FieldInfo object.
             * - `field` type is inferred from mysqljs/mysql, but its runtime shape is not always guaranteed.
             * - Defensive property access to satisfy TypeScript strictness.
             */
            fields: (fields || []).map((field: any) => ({
              name: typeof field.name === 'string' ? field.name : '',
              dataType:
                typeof field.type === 'number'
                  ? String(field.type)
                  : (typeof field.type === 'string'
                      ? field.type
                      : ''),
              // MySQL 'flags' field is a number (bitmask); lowest bit (1) = NOT_NULL flag.
              // If field.flags is not a number, default to true (nullable).
              nullable: typeof field.flags === 'number' ? !(field.flags & 1) : true,
            })),
          });
        });
      });
    });
  }

  /**
   * Begin a new transaction
   */
  async begin(): Promise<Transaction> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      level: 'REPEATABLE_READ',
      savepoints: [],
      isActive: true,
    };

    this.currentTransaction = transaction;
    
    return new Promise((resolve, reject) => {
      this.pool!.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        connection.query('START TRANSACTION', (queryErr) => {
          connection.release();
          
          if (queryErr) {
            reject(queryErr);
            return;
          }
          
          resolve(transaction);
        });
      });
    });
  }

  /**
   * Commit a transaction
   */
  async commit(transaction: Transaction): Promise<void> {
    if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
      throw new Error('Invalid transaction');
    }

    return new Promise((resolve, reject) => {
      this.pool!.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        connection.query('COMMIT', (queryErr) => {
          connection.release();
          
          if (queryErr) {
            reject(queryErr);
            return;
          }
          
          this.currentTransaction = null;
          resolve();
        });
      });
    });
  }

  /**
   * Rollback a transaction
   */
  async rollback(transaction: Transaction): Promise<void> {
    if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
      throw new Error('Invalid transaction');
    }

    return new Promise((resolve, reject) => {
      this.pool!.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        connection.query('ROLLBACK', (queryErr) => {
          connection.release();
          
          if (queryErr) {
            reject(queryErr);
            return;
          }
          
          this.currentTransaction = null;
          resolve();
        });
      });
    });
  }

  /**
   * Create a savepoint within a transaction
   */
  async savepoint(transaction: Transaction, name: string): Promise<void> {
    if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
      throw new Error('Invalid transaction');
    }

    return new Promise((resolve, reject) => {
      this.pool!.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        connection.query(`SAVEPOINT ${name}`, (queryErr) => {
          connection.release();
          
          if (queryErr) {
            reject(queryErr);
            return;
          }
          
          transaction.savepoints.push(name);
          resolve();
        });
      });
    });
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

    return new Promise((resolve, reject) => {
      this.pool!.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        connection.query(`ROLLBACK TO SAVEPOINT ${name}`, (queryErr) => {
          connection.release();
          
          if (queryErr) {
            reject(queryErr);
            return;
          }
          
          // Remove savepoints after this one
          const index = transaction.savepoints.indexOf(name);
          transaction.savepoints = transaction.savepoints.slice(0, index);
          resolve();
        });
      });
    });
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

    return new Promise((resolve, reject) => {
      this.pool!.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        connection.query(`RELEASE SAVEPOINT ${name}`, (queryErr) => {
          connection.release();
          
          if (queryErr) {
            reject(queryErr);
            return;
          }
          
          const index = transaction.savepoints.indexOf(name);
          transaction.savepoints.splice(index, 1);
          resolve();
        });
      });
    });
  }

  /**
   * Get MySQL-specific type mapping
   */
  protected override getDatabaseType(columnType: string): string {
    const typeMap: Record<string, string> = {
      string: 'VARCHAR',
      number: 'INT',
      boolean: 'BOOLEAN',
      date: 'DATETIME',
      json: 'JSON',
      uuid: 'CHAR(36)',
      text: 'TEXT',
      blob: 'BLOB',
    };
    
    return typeMap[columnType] || 'VARCHAR';
  }

  /**
   * Get MySQL-specific limit syntax
   */
  protected override getLimitSyntax(limit: number, offset?: number): string {
    if (offset) {
      return `LIMIT ${offset}, ${limit}`;
    }
    return `LIMIT ${limit}`;
  }

  /**
   * Get MySQL-specific order by syntax
   */
  protected override getOrderBySyntax(orderBy: Record<string, 'ASC' | 'DESC'>): string {
    const clauses = Object.entries(orderBy)
      .map(([column, direction]) => `\`${column}\` ${direction}`);
    return `ORDER BY ${clauses.join(', ')}`;
  }

  /**
   * Get MySQL-specific escape identifier
   */
  protected override escapeIdentifier(identifier: string): string {
    return `\`${identifier}\``;
  }

  /**
   * Get MySQL-specific value conversion
   */
  protected override convertValue(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }
    
    if (value instanceof Date) {
      return value.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return value;
  }

  /**
   * Get MySQL-specific value conversion from database
   */
  protected override convertFromDatabase(value: any, type: string): any {
    if (value === null || value === undefined) {
      return null;
    }
    
    switch (type.toLowerCase()) {
      case 'datetime':
      case 'timestamp':
        return new Date(value);
      case 'json':
        return typeof value === 'string' ? JSON.parse(value) : value;
      case 'boolean':
      case 'tinyint':
        return Boolean(value);
      case 'int':
      case 'bigint':
        return Number(value);
      default:
        return value;
    }
  }
}
