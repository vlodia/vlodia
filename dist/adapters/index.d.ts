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
export declare function createAdapter(config: DatabaseConfig): Adapter;
//# sourceMappingURL=index.d.ts.map