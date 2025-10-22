"use strict";
/**
 * Relation Manager
 * Advanced relationship loading and management with lazy/eager loading
 * Provides intelligent relationship resolution with performance optimization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationManager = void 0;
const metadata_registry_1 = require("../metadata-registry");
class RelationManager {
    entityManager;
    metadataRegistry;
    loadedRelations = new Map();
    logger;
    constructor(entityManager) {
        this.entityManager = entityManager;
        this.metadataRegistry = metadata_registry_1.MetadataRegistry.getInstance();
    }
    /**
     * Load relations for entities
     */
    async loadRelations(entities, relations, options = {}) {
        if (entities.length === 0) {
            return entities;
        }
        const entityClass = entities[0].constructor;
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
    async loadRelationsForEntity(entity, relations, options = {}) {
        return (await this.loadRelations([entity], relations, options))[0];
    }
    /**
     * Load relation for entities
     */
    async loadRelation(entities, relationMetadata, _options) {
        const entityClass = entities[0].constructor;
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
    async loadOneToOneRelation(entities, relationMetadata, _options) {
        const entityClass = entities[0].constructor;
        const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
        if (!primaryKey) {
            throw new Error(`Entity ${entityClass.name} has no primary key`);
        }
        const joinColumn = relationMetadata.joinColumn || `${relationMetadata.name}Id`;
        const entityIds = entities.map(entity => entity[primaryKey.propertyName]);
        if (entityIds.length === 0) {
            return;
        }
        const relatedEntities = await this.entityManager.find(relationMetadata.target, {
            where: { [joinColumn]: { $in: entityIds } }
        });
        // Group related entities by foreign key
        const relatedEntitiesMap = new Map();
        for (const relatedEntity of relatedEntities) {
            const fkValue = relatedEntity[joinColumn];
            relatedEntitiesMap.set(fkValue, relatedEntity);
        }
        // Assign related entities
        for (const entity of entities) {
            const entityId = entity[primaryKey.propertyName];
            const relatedEntity = relatedEntitiesMap.get(entityId);
            entity[relationMetadata.propertyName] = relatedEntity || null;
        }
    }
    /**
     * Load OneToMany relation
     */
    async loadOneToManyRelation(entities, relationMetadata, _options) {
        const entityClass = entities[0].constructor;
        const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
        if (!primaryKey) {
            throw new Error(`Entity ${entityClass.name} has no primary key`);
        }
        const joinColumn = relationMetadata.joinColumn || `${entityClass.name.toLowerCase()}Id`;
        const entityIds = entities.map(entity => entity[primaryKey.propertyName]);
        if (entityIds.length === 0) {
            return;
        }
        const relatedEntities = await this.entityManager.find(relationMetadata.target, {
            where: { [joinColumn]: { $in: entityIds } }
        });
        // Group related entities by foreign key
        const relatedEntitiesMap = new Map();
        for (const relatedEntity of relatedEntities) {
            const fkValue = relatedEntity[joinColumn];
            if (!relatedEntitiesMap.has(fkValue)) {
                relatedEntitiesMap.set(fkValue, []);
            }
            relatedEntitiesMap.get(fkValue).push(relatedEntity);
        }
        // Assign related entities
        for (const entity of entities) {
            const entityId = entity[primaryKey.propertyName];
            const relatedEntities = relatedEntitiesMap.get(entityId) || [];
            entity[relationMetadata.propertyName] = relatedEntities;
        }
    }
    /**
     * Load ManyToOne relation
     */
    async loadManyToOneRelation(entities, relationMetadata, _options) {
        const joinColumn = relationMetadata.joinColumn || `${relationMetadata.name}Id`;
        const foreignKeyValues = entities
            .map(entity => entity[joinColumn])
            .filter(value => value !== undefined && value !== null);
        if (foreignKeyValues.length === 0) {
            return;
        }
        const relatedEntities = await this.entityManager.find(relationMetadata.target, {
            where: { id: { $in: foreignKeyValues } }
        });
        // Group related entities by ID
        const relatedEntitiesMap = new Map();
        for (const relatedEntity of relatedEntities) {
            const id = relatedEntity.id;
            relatedEntitiesMap.set(id, relatedEntity);
        }
        // Assign related entities
        for (const entity of entities) {
            const fkValue = entity[joinColumn];
            const relatedEntity = relatedEntitiesMap.get(fkValue);
            entity[relationMetadata.propertyName] = relatedEntity || null;
        }
    }
    /**
     * Load ManyToMany relation
     */
    async loadManyToManyRelation(entities, relationMetadata, _options) {
        const entityClass = entities[0].constructor;
        const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
        if (!primaryKey) {
            throw new Error(`Entity ${entityClass.name} has no primary key`);
        }
        const joinTable = relationMetadata.joinTable || `${entityClass.name.toLowerCase()}_${relationMetadata.name}`;
        const joinColumn = relationMetadata.joinColumn || `${entityClass.name.toLowerCase()}Id`;
        const inverseJoinColumn = relationMetadata.inverseJoinColumn || `${relationMetadata.name}Id`;
        const entityIds = entities.map(entity => entity[primaryKey.propertyName]);
        if (entityIds.length === 0) {
            return;
        }
        // Get join table data - for ManyToMany we need to query the join table
        const joinTableData = await this.entityManager.find(relationMetadata.target, {
            where: { [joinColumn]: { $in: entityIds } }
        });
        // Log join table usage for debugging
        this.logger?.debug(`ManyToMany relation using join table: ${joinTable}, inverse column: ${inverseJoinColumn}`);
        // Group by foreign key
        const relatedEntitiesMap = new Map();
        for (const relatedEntity of joinTableData) {
            const fkValue = relatedEntity[joinColumn];
            if (!relatedEntitiesMap.has(fkValue)) {
                relatedEntitiesMap.set(fkValue, []);
            }
            relatedEntitiesMap.get(fkValue).push(relatedEntity);
        }
        // Assign related entities
        for (const entity of entities) {
            const entityId = entity[primaryKey.propertyName];
            const relatedEntities = relatedEntitiesMap.get(entityId) || [];
            entity[relationMetadata.propertyName] = relatedEntities;
        }
    }
    /**
     * Get relation metadatas for entity
     */
    getRelationMetadatas(entityClass, relationNames) {
        const allRelations = this.metadataRegistry.getRelations(entityClass);
        return allRelations.filter(relation => relationNames.includes(relation.name));
    }
    /**
     * Check if relation is loaded
     */
    isRelationLoaded(entity, relationName) {
        const key = `${entity.constructor.name}:${relationName}`;
        return this.loadedRelations.has(key);
    }
    /**
     * Mark relation as loaded
     */
    markRelationLoaded(entity, relationName) {
        const key = `${entity.constructor.name}:${relationName}`;
        this.loadedRelations.set(key, true);
    }
    /**
     * Clear loaded relations
     */
    clearLoadedRelations() {
        this.loadedRelations.clear();
    }
    /**
     * Get loaded relations count
     */
    getLoadedRelationsCount() {
        return this.loadedRelations.size;
    }
    /**
     * Preload relations for entities
     */
    async preloadRelations(entities, relations, options = {}) {
        if (entities.length === 0) {
            return entities;
        }
        // Group entities by type
        const entitiesByType = new Map();
        for (const entity of entities) {
            const type = entity.constructor.name;
            if (!entitiesByType.has(type)) {
                entitiesByType.set(type, []);
            }
            entitiesByType.get(type).push(entity);
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
    async loadRelationsBatched(entities, relations, batchSize = 100, options = {}) {
        if (entities.length === 0) {
            return entities;
        }
        const batches = this.chunkArray(entities, batchSize);
        const results = [];
        for (const batch of batches) {
            const batchResults = await this.loadRelations(batch, relations, options);
            results.push(...batchResults);
        }
        return results;
    }
    /**
     * Chunk array into batches
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}
exports.RelationManager = RelationManager;
//# sourceMappingURL=relation-manager.js.map