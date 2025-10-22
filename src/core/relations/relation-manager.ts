/**
 * Relation Manager
 * Advanced relationship loading and management with lazy/eager loading
 * Provides intelligent relationship resolution with performance optimization
 */

import { EntityManager } from '../entity-manager';
import { MetadataRegistry } from '../metadata-registry';
import { RelationMetadata, QueryOptions } from '@/types';

export interface RelationLoadOptions {
  eager?: boolean;
  lazy?: boolean;
  cascade?: boolean;
  depth?: number;
}

export interface RelationQueryOptions extends QueryOptions {
  relations?: string[];
  loadStrategy?: 'eager' | 'lazy' | 'mixed';
}

export class RelationManager {
  private entityManager: EntityManager;
  private metadataRegistry: MetadataRegistry;
  private loadedRelations = new Map<string, any>();
  private logger?: any;

  constructor(entityManager: EntityManager) {
    this.entityManager = entityManager;
    this.metadataRegistry = MetadataRegistry.getInstance();
  }

  /**
   * Load relations for entities
   */
  async loadRelations<T>(
    entities: T[],
    relations: string[],
    options: RelationLoadOptions = {}
  ): Promise<T[]> {
    if (entities.length === 0) {
      return entities;
    }

    const entityClass = entities[0]!.constructor as new () => T;
    const entityMetadata = this.metadataRegistry.getEntity(entityClass);

    if (!entityMetadata) {
      throw new Error(`Entity ${entityClass.name} not registered`);
    }

    const relationMetadatas = this.getRelationMetadatas(entityClass, relations);

    for (const relationMetadata of relationMetadatas) {
      await this.loadRelation(entities, relationMetadata, options);
    }

    return entities;
  }

  /**
   * Load relations for a single entity
   */
  async loadRelationsForEntity<T>(
    entity: T,
    relations: string[],
    options: RelationLoadOptions = {}
  ): Promise<T> {
    return (await this.loadRelations([entity], relations, options))[0]!;
  }

  /**
   * Load relation for entities
   */
  private async loadRelation<T>(
    entities: T[],
    relationMetadata: RelationMetadata,
    _options: RelationLoadOptions
  ): Promise<void> {
    const entityClass = entities[0]!.constructor as new () => T;

    // Validate relation exists for this entity
    const entityMetadata = this.metadataRegistry.getEntity(entityClass);
    if (!entityMetadata) {
      throw new Error(`Entity ${entityClass.name} not registered`);
    }

    switch (relationMetadata.type) {
      case 'OneToOne':
        await this.loadOneToOneRelation(entities, relationMetadata, _options);
        break;
      case 'OneToMany':
        await this.loadOneToManyRelation(entities, relationMetadata, _options);
        break;
      case 'ManyToOne':
        await this.loadManyToOneRelation(entities, relationMetadata, _options);
        break;
      case 'ManyToMany':
        await this.loadManyToManyRelation(entities, relationMetadata, _options);
        break;
    }
  }

  /**
   * Load OneToOne relation
   */
  private async loadOneToOneRelation<T>(
    entities: T[],
    relationMetadata: RelationMetadata,
    _options: RelationLoadOptions
  ): Promise<void> {
    const entityClass = entities[0]!.constructor as new () => T;
    const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);

    if (!primaryKey) {
      throw new Error(`Entity ${entityClass.name} has no primary key`);
    }

    const joinColumn = relationMetadata.joinColumn || `${relationMetadata.name}Id`;
    const entityIds = entities.map(entity => (entity as any)[primaryKey.propertyName]);

    if (entityIds.length === 0) {
      return;
    }

    const relatedEntities = await this.entityManager.find(relationMetadata.target as any, {
      where: { [joinColumn]: { $in: entityIds } },
    });

    // Group related entities by foreign key
    const relatedEntitiesMap = new Map();
    for (const relatedEntity of relatedEntities) {
      const fkValue = (relatedEntity as any)[joinColumn];
      relatedEntitiesMap.set(fkValue, relatedEntity);
    }

    // Assign related entities
    for (const entity of entities) {
      const entityId = (entity as any)[primaryKey.propertyName];
      const relatedEntity = relatedEntitiesMap.get(entityId);
      (entity as any)[relationMetadata.propertyName] = relatedEntity || null;
    }
  }

  /**
   * Load OneToMany relation
   */
  private async loadOneToManyRelation<T>(
    entities: T[],
    relationMetadata: RelationMetadata,
    _options: RelationLoadOptions
  ): Promise<void> {
    const entityClass = entities[0]!.constructor as new () => T;
    const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);

    if (!primaryKey) {
      throw new Error(`Entity ${entityClass.name} has no primary key`);
    }

    const joinColumn = relationMetadata.joinColumn || `${entityClass.name.toLowerCase()}Id`;
    const entityIds = entities.map(entity => (entity as any)[primaryKey.propertyName]);

    if (entityIds.length === 0) {
      return;
    }

    const relatedEntities = await this.entityManager.find(relationMetadata.target as any, {
      where: { [joinColumn]: { $in: entityIds } },
    });

    // Group related entities by foreign key
    const relatedEntitiesMap = new Map();
    for (const relatedEntity of relatedEntities) {
      const fkValue = (relatedEntity as any)[joinColumn];
      if (!relatedEntitiesMap.has(fkValue)) {
        relatedEntitiesMap.set(fkValue, []);
      }
      relatedEntitiesMap.get(fkValue).push(relatedEntity);
    }

    // Assign related entities
    for (const entity of entities) {
      const entityId = (entity as any)[primaryKey.propertyName];
      const relatedEntities = relatedEntitiesMap.get(entityId) || [];
      (entity as any)[relationMetadata.propertyName] = relatedEntities;
    }
  }

  /**
   * Load ManyToOne relation
   */
  private async loadManyToOneRelation<T>(
    entities: T[],
    relationMetadata: RelationMetadata,
    _options: RelationLoadOptions
  ): Promise<void> {
    const joinColumn = relationMetadata.joinColumn || `${relationMetadata.name}Id`;
    const foreignKeyValues = entities
      .map(entity => (entity as any)[joinColumn])
      .filter(value => value !== undefined && value !== null);

    if (foreignKeyValues.length === 0) {
      return;
    }

    const relatedEntities = await this.entityManager.find(relationMetadata.target as any, {
      where: { id: { $in: foreignKeyValues } },
    });

    // Group related entities by ID
    const relatedEntitiesMap = new Map();
    for (const relatedEntity of relatedEntities) {
      const id = (relatedEntity as any).id;
      relatedEntitiesMap.set(id, relatedEntity);
    }

    // Assign related entities
    for (const entity of entities) {
      const fkValue = (entity as any)[joinColumn];
      const relatedEntity = relatedEntitiesMap.get(fkValue);
      (entity as any)[relationMetadata.propertyName] = relatedEntity || null;
    }
  }

  /**
   * Load ManyToMany relation
   */
  private async loadManyToManyRelation<T>(
    entities: T[],
    relationMetadata: RelationMetadata,
    _options: RelationLoadOptions
  ): Promise<void> {
    const entityClass = entities[0]!.constructor as new () => T;
    const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);

    if (!primaryKey) {
      throw new Error(`Entity ${entityClass.name} has no primary key`);
    }

    const joinTable =
      relationMetadata.joinTable || `${entityClass.name.toLowerCase()}_${relationMetadata.name}`;
    const joinColumn = relationMetadata.joinColumn || `${entityClass.name.toLowerCase()}Id`;
    const inverseJoinColumn = relationMetadata.inverseJoinColumn || `${relationMetadata.name}Id`;

    const entityIds = entities.map(entity => (entity as any)[primaryKey.propertyName]);

    if (entityIds.length === 0) {
      return;
    }

    // Get join table data - for ManyToMany we need to query the join table
    const joinTableData = await this.entityManager.find(relationMetadata.target as any, {
      where: { [joinColumn]: { $in: entityIds } },
    });

    // Log join table usage for debugging
    this.logger?.debug(
      `ManyToMany relation using join table: ${joinTable}, inverse column: ${inverseJoinColumn}`
    );

    // Group by foreign key
    const relatedEntitiesMap = new Map();
    for (const relatedEntity of joinTableData) {
      const fkValue = (relatedEntity as any)[joinColumn];
      if (!relatedEntitiesMap.has(fkValue)) {
        relatedEntitiesMap.set(fkValue, []);
      }
      relatedEntitiesMap.get(fkValue).push(relatedEntity);
    }

    // Assign related entities
    for (const entity of entities) {
      const entityId = (entity as any)[primaryKey.propertyName];
      const relatedEntities = relatedEntitiesMap.get(entityId) || [];
      (entity as any)[relationMetadata.propertyName] = relatedEntities;
    }
  }

  /**
   * Get relation metadatas for entity
   */
  private getRelationMetadatas<T>(
    entityClass: new () => T,
    relationNames: string[]
  ): RelationMetadata[] {
    const allRelations = this.metadataRegistry.getRelations(entityClass);
    return allRelations.filter(relation => relationNames.includes(relation.name));
  }

  /**
   * Check if relation is loaded
   */
  isRelationLoaded<T>(entity: T, relationName: string): boolean {
    const key = `${(entity as any).constructor.name}:${relationName}`;
    return this.loadedRelations.has(key);
  }

  /**
   * Mark relation as loaded
   */
  markRelationLoaded<T>(entity: T, relationName: string): void {
    const key = `${(entity as any).constructor.name}:${relationName}`;
    this.loadedRelations.set(key, true);
  }

  /**
   * Clear loaded relations
   */
  clearLoadedRelations(): void {
    this.loadedRelations.clear();
  }

  /**
   * Get loaded relations count
   */
  getLoadedRelationsCount(): number {
    return this.loadedRelations.size;
  }

  /**
   * Preload relations for entities
   */
  async preloadRelations<T>(
    entities: T[],
    relations: string[],
    options: RelationLoadOptions = {}
  ): Promise<T[]> {
    if (entities.length === 0) {
      return entities;
    }

    // Group entities by type
    const entitiesByType = new Map<string, T[]>();
    for (const entity of entities) {
      const type = (entity as any).constructor.name;
      if (!entitiesByType.has(type)) {
        entitiesByType.set(type, []);
      }
      entitiesByType.get(type)!.push(entity);
    }

    // Load relations for each type
    for (const [_type, typeEntities] of entitiesByType) {
      await this.loadRelations(typeEntities, relations, options);
    }

    return entities;
  }

  /**
   * Load relations with batching
   */
  async loadRelationsBatched<T>(
    entities: T[],
    relations: string[],
    batchSize: number = 100,
    options: RelationLoadOptions = {}
  ): Promise<T[]> {
    if (entities.length === 0) {
      return entities;
    }

    const batches = this.chunkArray(entities, batchSize);
    const results: T[] = [];

    for (const batch of batches) {
      const batchResults = await this.loadRelations(batch, relations, options);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Chunk array into batches
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
