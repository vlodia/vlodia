"use strict";
/**
 * Vlodia ORM Main Export
 * Central export point for all ORM functionality
 * Provides a clean API for entity definition, database operations, and ORM management
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchmarkRunner = exports.TenantManager = exports.SchemaDesigner = exports.QueryAnalyzer = exports.GraphQLSchemaGenerator = exports.WebSocketManager = exports.CLICommands = exports.JSONLogFormatter = exports.DefaultLogFormatter = exports.PerformanceLogger = exports.QueryLogger = exports.DefaultLogger = exports.ORM_EVENTS = exports.DefaultEventBus = exports.EntitySerializer = exports.UniqueValidationRule = exports.PasswordValidationRule = exports.EmailValidationRule = exports.CustomValidationRule = exports.EntityValidator = exports.RelationManager = exports.CacheManager = exports.MigrationManager = exports.SqliteAdapter = exports.MysqlAdapter = exports.PostgresAdapter = exports.BaseAdapter = exports.createAdapter = exports.QueryBuilder = exports.DefaultRepositoryFactory = exports.createRepository = exports.BaseRepository = exports.MetadataRegistry = exports.EntityManager = exports.Vlodia = void 0;
// Core ORM class
var vlodia_1 = require("./core/vlodia");
Object.defineProperty(exports, "Vlodia", { enumerable: true, get: function () { return vlodia_1.Vlodia; } });
// Entity management
var entity_manager_1 = require("./core/entity-manager");
Object.defineProperty(exports, "EntityManager", { enumerable: true, get: function () { return entity_manager_1.EntityManager; } });
var metadata_registry_1 = require("./core/metadata-registry");
Object.defineProperty(exports, "MetadataRegistry", { enumerable: true, get: function () { return metadata_registry_1.MetadataRegistry; } });
// Repository pattern
var repository_1 = require("./core/repository");
Object.defineProperty(exports, "BaseRepository", { enumerable: true, get: function () { return repository_1.BaseRepository; } });
Object.defineProperty(exports, "createRepository", { enumerable: true, get: function () { return repository_1.createRepository; } });
var repository_factory_1 = require("./core/repository-factory");
Object.defineProperty(exports, "DefaultRepositoryFactory", { enumerable: true, get: function () { return repository_factory_1.DefaultRepositoryFactory; } });
// Query building
var query_builder_1 = require("./core/query-builder");
Object.defineProperty(exports, "QueryBuilder", { enumerable: true, get: function () { return query_builder_1.QueryBuilder; } });
// Database adapters
var adapters_1 = require("./adapters");
Object.defineProperty(exports, "createAdapter", { enumerable: true, get: function () { return adapters_1.createAdapter; } });
var base_adapter_1 = require("./adapters/base-adapter");
Object.defineProperty(exports, "BaseAdapter", { enumerable: true, get: function () { return base_adapter_1.BaseAdapter; } });
var postgres_adapter_1 = require("./adapters/postgres-adapter");
Object.defineProperty(exports, "PostgresAdapter", { enumerable: true, get: function () { return postgres_adapter_1.PostgresAdapter; } });
var mysql_adapter_1 = require("./adapters/mysql-adapter");
Object.defineProperty(exports, "MysqlAdapter", { enumerable: true, get: function () { return mysql_adapter_1.MysqlAdapter; } });
var sqlite_adapter_1 = require("./adapters/sqlite-adapter");
Object.defineProperty(exports, "SqliteAdapter", { enumerable: true, get: function () { return sqlite_adapter_1.SqliteAdapter; } });
// Migrations
var migration_1 = require("./core/migrations/migration");
Object.defineProperty(exports, "MigrationManager", { enumerable: true, get: function () { return migration_1.MigrationManager; } });
// Caching
var cache_manager_1 = require("./core/cache/cache-manager");
Object.defineProperty(exports, "CacheManager", { enumerable: true, get: function () { return cache_manager_1.CacheManager; } });
// Relations
var relation_manager_1 = require("./core/relations/relation-manager");
Object.defineProperty(exports, "RelationManager", { enumerable: true, get: function () { return relation_manager_1.RelationManager; } });
// Validation
var validator_1 = require("./core/validation/validator");
Object.defineProperty(exports, "EntityValidator", { enumerable: true, get: function () { return validator_1.EntityValidator; } });
Object.defineProperty(exports, "CustomValidationRule", { enumerable: true, get: function () { return validator_1.CustomValidationRule; } });
Object.defineProperty(exports, "EmailValidationRule", { enumerable: true, get: function () { return validator_1.EmailValidationRule; } });
Object.defineProperty(exports, "PasswordValidationRule", { enumerable: true, get: function () { return validator_1.PasswordValidationRule; } });
Object.defineProperty(exports, "UniqueValidationRule", { enumerable: true, get: function () { return validator_1.UniqueValidationRule; } });
// Serialization
var serializer_1 = require("./core/serialization/serializer");
Object.defineProperty(exports, "EntitySerializer", { enumerable: true, get: function () { return serializer_1.EntitySerializer; } });
// Events
var event_bus_1 = require("./core/events/event-bus");
Object.defineProperty(exports, "DefaultEventBus", { enumerable: true, get: function () { return event_bus_1.DefaultEventBus; } });
Object.defineProperty(exports, "ORM_EVENTS", { enumerable: true, get: function () { return event_bus_1.ORM_EVENTS; } });
// Logging
var logger_1 = require("./core/logging/logger");
Object.defineProperty(exports, "DefaultLogger", { enumerable: true, get: function () { return logger_1.DefaultLogger; } });
Object.defineProperty(exports, "QueryLogger", { enumerable: true, get: function () { return logger_1.QueryLogger; } });
Object.defineProperty(exports, "PerformanceLogger", { enumerable: true, get: function () { return logger_1.PerformanceLogger; } });
Object.defineProperty(exports, "DefaultLogFormatter", { enumerable: true, get: function () { return logger_1.DefaultLogFormatter; } });
Object.defineProperty(exports, "JSONLogFormatter", { enumerable: true, get: function () { return logger_1.JSONLogFormatter; } });
// CLI
var commands_1 = require("./cli/commands");
Object.defineProperty(exports, "CLICommands", { enumerable: true, get: function () { return commands_1.CLICommands; } });
// New Features
var websocket_manager_1 = require("./core/realtime/websocket-manager");
Object.defineProperty(exports, "WebSocketManager", { enumerable: true, get: function () { return websocket_manager_1.WebSocketManager; } });
var schema_generator_1 = require("./core/graphql/schema-generator");
Object.defineProperty(exports, "GraphQLSchemaGenerator", { enumerable: true, get: function () { return schema_generator_1.GraphQLSchemaGenerator; } });
var query_analyzer_1 = require("./core/performance/query-analyzer");
Object.defineProperty(exports, "QueryAnalyzer", { enumerable: true, get: function () { return query_analyzer_1.QueryAnalyzer; } });
var schema_designer_1 = require("./core/visual/schema-designer");
Object.defineProperty(exports, "SchemaDesigner", { enumerable: true, get: function () { return schema_designer_1.SchemaDesigner; } });
var tenant_manager_1 = require("./core/tenancy/tenant-manager");
Object.defineProperty(exports, "TenantManager", { enumerable: true, get: function () { return tenant_manager_1.TenantManager; } });
// Decorators
__exportStar(require("./decorators"), exports);
// Types
__exportStar(require("./types"), exports);
// Utils
__exportStar(require("./utils/helpers"), exports);
// Examples are available in src/examples/complete-usage.ts
// Import them separately when needed:
// import { runAllExamples, basicUsageExample } from './examples/complete-usage';
// Benchmarks
var index_1 = require("./benchmarks/index");
Object.defineProperty(exports, "BenchmarkRunner", { enumerable: true, get: function () { return index_1.BenchmarkRunner; } });
// Re-export reflect-metadata for decorator support
require("reflect-metadata");
//# sourceMappingURL=index.js.map