"use strict";
/**
 * Column Decorators
 * Provides decorators for defining database columns with type safety and metadata
 * Supports various column types, constraints, and database-specific options
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isColumn = exports.getColumnMetadata = exports.NotNull = exports.Unique = exports.Generated = exports.PrimaryKey = exports.Column = void 0;
require("reflect-metadata");
const metadata_registry_1 = require("../core/metadata-registry");
const METADATA_KEY = Symbol('nythera:column');
/**
 * Column decorator for defining database columns
 * @param options Configuration options for the column
 */
function Column(options = {}) {
    return function (target, propertyKey) {
        const registry = metadata_registry_1.MetadataRegistry.getInstance();
        // Get existing metadata if any (from previous decorators)
        const existingMetadata = Reflect.getMetadata(METADATA_KEY, target, propertyKey);
        // Infer column type from TypeScript type if not specified
        const columnType = options.type || existingMetadata?.type || inferColumnType(target, propertyKey);
        const metadata = {
            name: options.name || existingMetadata?.name || String(propertyKey),
            propertyName: String(propertyKey),
            type: columnType,
            nullable: options.nullable ?? existingMetadata?.nullable ?? true,
            primary: options.primary ?? existingMetadata?.primary ?? false,
            generated: options.generated ?? existingMetadata?.generated ?? false,
            unique: options.unique ?? existingMetadata?.unique ?? false,
            length: options.length || existingMetadata?.length || 0,
            precision: options.precision || existingMetadata?.precision || 0,
            scale: options.scale || existingMetadata?.scale || 0,
            defaultValue: options.defaultValue ?? existingMetadata?.defaultValue,
        };
        // Store metadata in reflection
        Reflect.defineMetadata(METADATA_KEY, metadata, target, propertyKey);
        // Register with metadata registry
        // Property decorators receive the prototype, but we need the constructor
        const constructor = target.constructor;
        registry.registerColumn(constructor, String(propertyKey), metadata);
    };
}
exports.Column = Column;
/**
 * Primary key column decorator
 * @param options Configuration options for the primary key
 */
function PrimaryKey(options = {}) {
    return Column({ ...options, primary: true, nullable: false });
}
exports.PrimaryKey = PrimaryKey;
/**
 * Generated column decorator (auto-increment, UUID, etc.)
 * @param options Configuration options for the generated column
 */
function Generated(options = {}) {
    return Column({ ...options, generated: true });
}
exports.Generated = Generated;
/**
 * Unique column decorator
 * @param options Configuration options for the unique column
 */
function Unique(options = {}) {
    return Column({ ...options, unique: true });
}
exports.Unique = Unique;
/**
 * Not null column decorator
 * @param options Configuration options for the not null column
 */
function NotNull(options = {}) {
    return Column({ ...options, nullable: false });
}
exports.NotNull = NotNull;
/**
 * Infer column type from TypeScript type
 */
function inferColumnType(target, propertyKey) {
    const designType = Reflect.getMetadata('design:type', target, propertyKey);
    switch (designType) {
        case String:
            return 'string';
        case Number:
            return 'number';
        case Boolean:
            return 'boolean';
        case Date:
            return 'date';
        case Object:
            return 'json';
        default:
            return 'string';
    }
}
/**
 * Get column metadata from a property
 */
function getColumnMetadata(target, propertyKey) {
    return Reflect.getMetadata(METADATA_KEY, target, propertyKey);
}
exports.getColumnMetadata = getColumnMetadata;
/**
 * Check if a property is marked as a column
 */
function isColumn(target, propertyKey) {
    return Reflect.hasMetadata(METADATA_KEY, target, propertyKey);
}
exports.isColumn = isColumn;
//# sourceMappingURL=column.js.map