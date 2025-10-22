/**
 * Metadata Registry
 * Central registry for storing and managing entity metadata using reflection
 * Provides type-safe access to entity definitions, columns, and relationships
 */
import 'reflect-metadata';
import { EntityMetadata, ColumnMetadata, RelationMetadata, HookMetadata, IndexMetadata } from '@/types';
export declare class MetadataRegistry {
    private static instance;
    private entities;
    private columns;
    private relations;
    private hooks;
    private indexes;
    private constructor();
    static getInstance(): MetadataRegistry;
    /**
     * Register an entity class with its metadata
     */
    registerEntity<T>(entityClass: new () => T, metadata: EntityMetadata): void;
    /**
     * Register a column metadata for an entity
     */
    registerColumn<T>(entityClass: new () => T, propertyName: string, metadata: ColumnMetadata): void;
    /**
     * Register a relation metadata for an entity
     */
    registerRelation<T>(entityClass: new () => T, propertyName: string, metadata: RelationMetadata): void;
    /**
     * Register a hook metadata for an entity
     */
    registerHook<T>(entityClass: new () => T, propertyName: string, metadata: HookMetadata): void;
    /**
     * Register an index metadata for an entity
     */
    registerIndex<T>(entityClass: new () => T, indexName: string, metadata: IndexMetadata): void;
    /**
     * Get entity metadata by class
     */
    getEntity<T>(entityClass: new () => T): EntityMetadata | undefined;
    /**
     * Get column metadata for an entity property
     */
    getColumn<T>(entityClass: new () => T, propertyName: string): ColumnMetadata | undefined;
    /**
     * Get all columns for an entity
     */
    getColumns<T>(entityClass: new () => T): ColumnMetadata[];
    /**
     * Get relation metadata for an entity property
     */
    getRelation<T>(entityClass: new () => T, propertyName: string): RelationMetadata | undefined;
    /**
     * Get all relations for an entity
     */
    getRelations<T>(entityClass: new () => T): RelationMetadata[];
    /**
     * Get hook metadata for an entity property
     */
    getHook<T>(entityClass: new () => T, propertyName: string): HookMetadata | undefined;
    /**
     * Get all hooks for an entity
     */
    getHooks<T>(entityClass: new () => T): HookMetadata[];
    /**
     * Get index metadata for an entity
     */
    getIndex<T>(entityClass: new () => T, indexName: string): IndexMetadata | undefined;
    /**
     * Get all indexes for an entity
     */
    getIndexes<T>(entityClass: new () => T): IndexMetadata[];
    /**
     * Get primary key column for an entity
     */
    getPrimaryKey<T>(entityClass: new () => T): ColumnMetadata | undefined;
    /**
     * Get foreign key columns for an entity
     */
    getForeignKeys<T>(entityClass: new () => T): ColumnMetadata[];
    /**
     * Check if entity is registered
     */
    hasEntity<T>(entityClass: new () => T): boolean;
    /**
     * Clear all metadata (useful for testing)
     */
    clear(): void;
    /**
     * Get entity by table name
     */
    getEntityByTableName(tableName: string): EntityMetadata | undefined;
    /**
     * Get entity class by table name
     */
    getEntityClassByTableName<T>(tableName: string): (new () => T) | undefined;
    /**
     * Get all registered entities
     */
    getAllEntities(): EntityMetadata[];
}
//# sourceMappingURL=metadata-registry.d.ts.map