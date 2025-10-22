/**
 * Database Adapters Index
 * Central export point for all database adapters
 * Provides a clean API for database-agnostic operations
 */

export { BaseAdapter } from './base-adapter';
export { PostgresAdapter } from './postgres-adapter';
export { MysqlAdapter } from './mysql-adapter';
export { SqliteAdapter } from './sqlite-adapter';

/**
 * Adapter factory for creating database adapters
 */
import { Adapter, DatabaseConfig } from '@/types';
import { PostgresAdapter } from './postgres-adapter';
import { MysqlAdapter } from './mysql-adapter';
import { SqliteAdapter } from './sqlite-adapter';

export function createAdapter(config: DatabaseConfig): Adapter {
  switch (config.type) {
    case 'postgres':
      return new PostgresAdapter(config);
    case 'mysql':
      return new MysqlAdapter(config);
    case 'sqlite':
      return new SqliteAdapter(config);
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
}
