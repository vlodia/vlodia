"use strict";
/**
 * Entity Decorator
 * Marks a class as a database entity and registers it with the metadata registry
 * Provides table name configuration and entity-level metadata
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEntity = exports.getEntityMetadata = exports.Entity = void 0;
require("reflect-metadata");
const metadata_registry_1 = require("../core/metadata-registry");
const METADATA_KEY = Symbol('nythera:entity');
/**
 * Entity decorator for marking classes as database entities
 * @param options Configuration options for the entity
 */
function Entity(options = {}) {
    return function (target) {
        const registry = metadata_registry_1.MetadataRegistry.getInstance();
        // Get existing metadata or create new
        const existingMetadata = Reflect.getMetadata(METADATA_KEY, target);
        const metadata = {
            name: options.name || target.name,
            tableName: options.tableName || target.name.toLowerCase(),
            target: target,
            columns: existingMetadata?.columns || [],
            relations: existingMetadata?.relations || [],
            hooks: existingMetadata?.hooks || [],
            indexes: existingMetadata?.indexes || [],
        };
        // Store metadata in reflection
        Reflect.defineMetadata(METADATA_KEY, metadata, target);
        // Register with metadata registry
        registry.registerEntity(target, metadata);
        return target;
    };
}
exports.Entity = Entity;
/**
 * Get entity metadata from a class
 */
function getEntityMetadata(target) {
    return Reflect.getMetadata(METADATA_KEY, target);
}
exports.getEntityMetadata = getEntityMetadata;
/**
 * Check if a class is marked as an entity
 */
function isEntity(target) {
    return Reflect.hasMetadata(METADATA_KEY, target);
}
exports.isEntity = isEntity;
//# sourceMappingURL=entity.js.map