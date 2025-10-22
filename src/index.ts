/**
 * Vlodia ORM Main Export
 * Central export point for all ORM functionality
 * Provides a clean API for entity definition, database operations, and ORM management
 */

// Core ORM class
export { Vlodia } from './core/vlodia';

// Entity management
export { EntityManager } from './core/entity-manager';
export { MetadataRegistry } from './core/metadata-registry';

// Repository pattern
export { BaseRepository, createRepository } from './core/repository';
export { RepositoryFactory, DefaultRepositoryFactory } from './core/repository-factory';

// Query building
export { QueryBuilder } from './core/query-builder';

// Database adapters
export { createAdapter } from './adapters';
export { BaseAdapter } from './adapters/base-adapter';
export { PostgresAdapter } from './adapters/postgres-adapter';
export { MysqlAdapter } from './adapters/mysql-adapter';
export { SqliteAdapter } from './adapters/sqlite-adapter';

// Migrations
export { MigrationManager } from './core/migrations/migration';

// Caching
export { CacheManager } from './core/cache/cache-manager';

// Relations
export { RelationManager } from './core/relations/relation-manager';

// Validation
export {
  EntityValidator,
  CustomValidationRule,
  EmailValidationRule,
  PasswordValidationRule,
  UniqueValidationRule,
} from './core/validation/validator';

// Serialization
export { EntitySerializer } from './core/serialization/serializer';

// Events
export { DefaultEventBus, ORM_EVENTS } from './core/events/event-bus';

// Logging
export {
  DefaultLogger,
  QueryLogger,
  PerformanceLogger,
  DefaultLogFormatter,
  JSONLogFormatter,
} from './core/logging/logger';

// CLI
export { CLICommands } from './cli/commands';

// New Features
export { WebSocketManager } from './core/realtime/websocket-manager';
export { GraphQLSchemaGenerator } from './core/graphql/schema-generator';
export { QueryAnalyzer } from './core/performance/query-analyzer';
export { SchemaDesigner } from './core/visual/schema-designer';
export { TenantManager } from './core/tenancy/tenant-manager';

// Decorators
export * from './decorators';

// Types
export * from './types';

// Utils
export * from './utils/helpers';

// Examples are available in src/examples/complete-usage.ts
// Import them separately when needed:
// import { runAllExamples, basicUsageExample } from './examples/complete-usage';

// Benchmarks
export { BenchmarkRunner } from './benchmarks/index';

// Re-export reflect-metadata for decorator support
import 'reflect-metadata';
