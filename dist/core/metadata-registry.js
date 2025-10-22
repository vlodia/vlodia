"use strict";
/**
 * Metadata Registry
 * Central registry for storing and managing entity metadata using reflection
 * Provides type-safe access to entity definitions, columns, and relationships
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataRegistry = void 0;
require("reflect-metadata");
class MetadataRegistry {
    static instance;
    entities = new Map();
    columns = new Map();
    relations = new Map();
    hooks = new Map();
    indexes = new Map();
    constructor() { }
    static getInstance() {
        if (!MetadataRegistry.instance) {
            MetadataRegistry.instance = new MetadataRegistry();
        }
        return MetadataRegistry.instance;
    }
    /**
     * Register an entity class with its metadata
     */
    registerEntity(entityClass, metadata) {
        this.entities.set(entityClass, metadata);
        // Only initialize Maps if they don't exist (preserve existing data from property decorators)
        if (!this.columns.has(entityClass)) {
            this.columns.set(entityClass, new Map());
        }
        if (!this.relations.has(entityClass)) {
            this.relations.set(entityClass, new Map());
        }
        if (!this.hooks.has(entityClass)) {
            this.hooks.set(entityClass, new Map());
        }
        if (!this.indexes.has(entityClass)) {
            this.indexes.set(entityClass, new Map());
        }
    }
    /**
     * Register a column metadata for an entity
     */
    registerColumn(entityClass, propertyName, metadata) {
        let entityColumns = this.columns.get(entityClass);
        if (!entityColumns) {
            entityColumns = new Map();
            this.columns.set(entityClass, entityColumns);
        }
        entityColumns.set(propertyName, metadata);
    }
    /**
     * Register a relation metadata for an entity
     */
    registerRelation(entityClass, propertyName, metadata) {
        let entityRelations = this.relations.get(entityClass);
        if (!entityRelations) {
            entityRelations = new Map();
            this.relations.set(entityClass, entityRelations);
        }
        entityRelations.set(propertyName, metadata);
    }
    /**
     * Register a hook metadata for an entity
     */
    registerHook(entityClass, propertyName, metadata) {
        let entityHooks = this.hooks.get(entityClass);
        if (!entityHooks) {
            entityHooks = new Map();
            this.hooks.set(entityClass, entityHooks);
        }
        entityHooks.set(propertyName, metadata);
    }
    /**
     * Register an index metadata for an entity
     */
    registerIndex(entityClass, indexName, metadata) {
        const entityIndexes = this.indexes.get(entityClass);
        if (entityIndexes) {
            entityIndexes.set(indexName, metadata);
        }
    }
    /**
     * Get entity metadata by class
     */
    getEntity(entityClass) {
        return this.entities.get(entityClass);
    }
    /**
     * Get column metadata for an entity property
     */
    getColumn(entityClass, propertyName) {
        const entityColumns = this.columns.get(entityClass);
        return entityColumns?.get(propertyName);
    }
    /**
     * Get all columns for an entity
     */
    getColumns(entityClass) {
        const entityColumns = this.columns.get(entityClass);
        return entityColumns ? Array.from(entityColumns.values()) : [];
    }
    /**
     * Get relation metadata for an entity property
     */
    getRelation(entityClass, propertyName) {
        const entityRelations = this.relations.get(entityClass);
        return entityRelations?.get(propertyName);
    }
    /**
     * Get all relations for an entity
     */
    getRelations(entityClass) {
        const entityRelations = this.relations.get(entityClass);
        return entityRelations ? Array.from(entityRelations.values()) : [];
    }
    /**
     * Get hook metadata for an entity property
     */
    getHook(entityClass, propertyName) {
        const entityHooks = this.hooks.get(entityClass);
        return entityHooks?.get(propertyName);
    }
    /**
     * Get all hooks for an entity
     */
    getHooks(entityClass) {
        const entityHooks = this.hooks.get(entityClass);
        return entityHooks ? Array.from(entityHooks.values()) : [];
    }
    /**
     * Get index metadata for an entity
     */
    getIndex(entityClass, indexName) {
        const entityIndexes = this.indexes.get(entityClass);
        return entityIndexes?.get(indexName);
    }
    /**
     * Get all indexes for an entity
     */
    getIndexes(entityClass) {
        const entityIndexes = this.indexes.get(entityClass);
        return entityIndexes ? Array.from(entityIndexes.values()) : [];
    }
    /**
     * Get primary key column for an entity
     */
    getPrimaryKey(entityClass) {
        const columns = this.getColumns(entityClass);
        return columns.find(col => col.primary);
    }
    /**
     * Get foreign key columns for an entity
     */
    getForeignKeys(entityClass) {
        const columns = this.getColumns(entityClass);
        return columns.filter(col => col.name.endsWith('_id') || col.name.endsWith('Id'));
    }
    /**
     * Check if entity is registered
     */
    hasEntity(entityClass) {
        return this.entities.has(entityClass);
    }
    /**
     * Clear all metadata (useful for testing)
     */
    clear() {
        this.entities.clear();
        this.columns.clear();
        this.relations.clear();
        this.hooks.clear();
        this.indexes.clear();
    }
    /**
     * Get entity by table name
     */
    getEntityByTableName(tableName) {
        for (const metadata of this.entities.values()) {
            if (metadata.tableName === tableName) {
                return metadata;
            }
        }
        return undefined;
    }
    /**
     * Get entity class by table name
     */
    getEntityClassByTableName(tableName) {
        for (const [entityClass, metadata] of this.entities.entries()) {
            if (metadata.tableName === tableName) {
                return entityClass;
            }
        }
        return undefined;
    }
    /**
     * Get all registered entities
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }
}
exports.MetadataRegistry = MetadataRegistry;
//# sourceMappingURL=metadata-registry.js.map