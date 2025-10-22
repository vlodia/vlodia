/**
 * Metadata Registry
 * Central registry for storing and managing entity metadata using reflection
 * Provides type-safe access to entity definitions, columns, and relationships
 */

import 'reflect-metadata';
import { EntityMetadata, ColumnMetadata, RelationMetadata, HookMetadata, IndexMetadata } from '@/types';

export class MetadataRegistry {
  private static instance: MetadataRegistry;
  private entities = new Map<Function, EntityMetadata>();
  private columns = new Map<Function, Map<string, ColumnMetadata>>();
  private relations = new Map<Function, Map<string, RelationMetadata>>();
  private hooks = new Map<Function, Map<string, HookMetadata>>();
  private indexes = new Map<Function, Map<string, IndexMetadata>>();

  private constructor() {}

  static getInstance(): MetadataRegistry {
    if (!MetadataRegistry.instance) {
      MetadataRegistry.instance = new MetadataRegistry();
    }
    return MetadataRegistry.instance;
  }

  /**
   * Register an entity class with its metadata
   */
  registerEntity<T>(entityClass: new () => T, metadata: EntityMetadata): void {
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
  registerColumn<T>(
    entityClass: new () => T,
    propertyName: string,
    metadata: ColumnMetadata
  ): void {
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
  registerRelation<T>(
    entityClass: new () => T,
    propertyName: string,
    metadata: RelationMetadata
  ): void {
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
  registerHook<T>(
    entityClass: new () => T,
    propertyName: string,
    metadata: HookMetadata
  ): void {
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
  registerIndex<T>(
    entityClass: new () => T,
    indexName: string,
    metadata: IndexMetadata
  ): void {
    const entityIndexes = this.indexes.get(entityClass);
    if (entityIndexes) {
      entityIndexes.set(indexName, metadata);
    }
  }

  /**
   * Get entity metadata by class
   */
  getEntity<T>(entityClass: new () => T): EntityMetadata | undefined {
    return this.entities.get(entityClass);
  }

  /**
   * Get column metadata for an entity property
   */
  getColumn<T>(
    entityClass: new () => T,
    propertyName: string
  ): ColumnMetadata | undefined {
    const entityColumns = this.columns.get(entityClass);
    return entityColumns?.get(propertyName);
  }

  /**
   * Get all columns for an entity
   */
  getColumns<T>(entityClass: new () => T): ColumnMetadata[] {
    const entityColumns = this.columns.get(entityClass);
    return entityColumns ? Array.from(entityColumns.values()) : [];
  }

  /**
   * Get relation metadata for an entity property
   */
  getRelation<T>(
    entityClass: new () => T,
    propertyName: string
  ): RelationMetadata | undefined {
    const entityRelations = this.relations.get(entityClass);
    return entityRelations?.get(propertyName);
  }

  /**
   * Get all relations for an entity
   */
  getRelations<T>(entityClass: new () => T): RelationMetadata[] {
    const entityRelations = this.relations.get(entityClass);
    return entityRelations ? Array.from(entityRelations.values()) : [];
  }

  /**
   * Get hook metadata for an entity property
   */
  getHook<T>(
    entityClass: new () => T,
    propertyName: string
  ): HookMetadata | undefined {
    const entityHooks = this.hooks.get(entityClass);
    return entityHooks?.get(propertyName);
  }

  /**
   * Get all hooks for an entity
   */
  getHooks<T>(entityClass: new () => T): HookMetadata[] {
    const entityHooks = this.hooks.get(entityClass);
    return entityHooks ? Array.from(entityHooks.values()) : [];
  }

  /**
   * Get index metadata for an entity
   */
  getIndex<T>(
    entityClass: new () => T,
    indexName: string
  ): IndexMetadata | undefined {
    const entityIndexes = this.indexes.get(entityClass);
    return entityIndexes?.get(indexName);
  }

  /**
   * Get all indexes for an entity
   */
  getIndexes<T>(entityClass: new () => T): IndexMetadata[] {
    const entityIndexes = this.indexes.get(entityClass);
    return entityIndexes ? Array.from(entityIndexes.values()) : [];
  }

  /**
   * Get primary key column for an entity
   */
  getPrimaryKey<T>(entityClass: new () => T): ColumnMetadata | undefined {
    const columns = this.getColumns(entityClass);
    return columns.find(col => col.primary);
  }

  /**
   * Get foreign key columns for an entity
   */
  getForeignKeys<T>(entityClass: new () => T): ColumnMetadata[] {
    const columns = this.getColumns(entityClass);
    return columns.filter(col => col.name.endsWith('_id') || col.name.endsWith('Id'));
  }

  /**
   * Check if entity is registered
   */
  hasEntity<T>(entityClass: new () => T): boolean {
    return this.entities.has(entityClass);
  }

  /**
   * Clear all metadata (useful for testing)
   */
  clear(): void {
    this.entities.clear();
    this.columns.clear();
    this.relations.clear();
    this.hooks.clear();
    this.indexes.clear();
  }

  /**
   * Get entity by table name
   */
  getEntityByTableName(tableName: string): EntityMetadata | undefined {
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
  getEntityClassByTableName<T>(tableName: string): (new () => T) | undefined {
    for (const [entityClass, metadata] of this.entities.entries()) {
      if (metadata.tableName === tableName) {
        return entityClass as new () => T;
      }
    }
    return undefined;
  }

  /**
   * Get all registered entities
   */
  getAllEntities(): EntityMetadata[] {
    return Array.from(this.entities.values());
  }
}
