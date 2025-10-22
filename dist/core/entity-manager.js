"use strict";
/**
 * Entity Manager
 * Central entity management with Unit of Work pattern and Identity Map
 * Provides CRUD operations, change tracking, and transactional context
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityManager = void 0;
const metadata_registry_1 = require("./metadata-registry");
const query_builder_1 = require("./query-builder");
const repository_factory_1 = require("./repository-factory");
class EntityManager {
    adapter;
    transaction = null;
    identityMap = new Map();
    changeTracker = new Map();
    metadataRegistry;
    repositoryFactory;
    constructor(options) {
        this.adapter = options.adapter;
        this.transaction = options.transaction || null;
        this.metadataRegistry = metadata_registry_1.MetadataRegistry.getInstance();
        this.repositoryFactory = new repository_factory_1.DefaultRepositoryFactory(this);
    }
    /**
     * Find entities by criteria
     */
    async find(entityClass, options = {}) {
        const metadata = this.metadataRegistry.getEntity(entityClass);
        if (!metadata) {
            throw new Error(`Entity ${entityClass.name} not registered`);
        }
        const queryBuilder = new query_builder_1.QueryBuilder({
            tableName: metadata.tableName,
            select: options.select || [],
            where: options.where || {},
            orderBy: options.orderBy || {},
            limit: options.limit || 0,
            offset: options.offset || 0,
        });
        const { sql, parameters } = queryBuilder.build();
        const result = await this.adapter.query(sql, parameters);
        return result.rows.map(row => this.hydrateEntity(entityClass, row));
    }
    /**
     * Find a single entity by criteria
     */
    async findOne(entityClass, options = {}) {
        const results = await this.find(entityClass, { ...options, limit: 1 });
        return results[0] || null;
    }
    /**
     * Find entity by primary key
     */
    async findById(entityClass, id) {
        const metadata = this.metadataRegistry.getEntity(entityClass);
        if (!metadata) {
            throw new Error(`Entity ${entityClass.name} not registered`);
        }
        const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
        if (!primaryKey) {
            throw new Error(`Entity ${entityClass.name} has no primary key`);
        }
        return this.findOne(entityClass, {
            where: { [primaryKey.name]: id },
        });
    }
    /**
     * Save entity (insert or update)
     */
    async save(entity, options = {}) {
        const entityClass = entity.constructor;
        const metadata = this.metadataRegistry.getEntity(entityClass);
        if (!metadata) {
            throw new Error(`Entity ${entityClass.name} not registered`);
        }
        const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
        if (!primaryKey) {
            throw new Error(`Entity ${entityClass.name} has no primary key`);
        }
        const id = entity[primaryKey.propertyName];
        const isNew = id === undefined || id === null;
        if (isNew) {
            return this.insert(entity, options);
        }
        else {
            return this.update(entity, options);
        }
    }
    /**
     * Insert new entity
     */
    async insert(entity, options = {}) {
        const entityClass = entity.constructor;
        const metadata = this.metadataRegistry.getEntity(entityClass);
        if (!metadata) {
            throw new Error(`Entity ${entityClass.name} not registered`);
        }
        // Execute before hooks
        if (options.hooks !== false) {
            await this.executeHooks(entityClass, 'beforeInsert', entity);
        }
        const columns = this.metadataRegistry.getColumns(entityClass);
        const values = {};
        for (const column of columns) {
            if (!column.generated) {
                const value = entity[column.propertyName];
                if (value !== undefined) {
                    values[column.name] = value;
                }
            }
        }
        const queryBuilder = new query_builder_1.QueryBuilder({
            tableName: metadata.tableName,
        });
        const { sql, parameters } = queryBuilder.insert(values).build();
        const result = await this.adapter.query(sql, parameters);
        // Set generated primary key
        const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
        if (primaryKey && primaryKey.generated) {
            entity[primaryKey.propertyName] =
                result.rows[0]?.id || result.rows[0]?.[primaryKey.name];
        }
        // Add to identity map
        this.addToIdentityMap(entity);
        // Execute after hooks
        if (options.hooks !== false) {
            await this.executeHooks(entityClass, 'afterInsert', entity);
        }
        return entity;
    }
    /**
     * Update existing entity
     */
    async update(entity, options = {}) {
        const entityClass = entity.constructor;
        const metadata = this.metadataRegistry.getEntity(entityClass);
        if (!metadata) {
            throw new Error(`Entity ${entityClass.name} not registered`);
        }
        // Execute before hooks
        if (options.hooks !== false) {
            await this.executeHooks(entityClass, 'beforeUpdate', entity);
        }
        const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
        if (!primaryKey) {
            throw new Error(`Entity ${entityClass.name} has no primary key`);
        }
        const id = entity[primaryKey.propertyName];
        if (id === undefined || id === null) {
            throw new Error('Cannot update entity without primary key');
        }
        const columns = this.metadataRegistry.getColumns(entityClass);
        const setValues = {};
        for (const column of columns) {
            if (!column.primary && !column.generated) {
                const value = entity[column.propertyName];
                if (value !== undefined) {
                    setValues[column.name] = value;
                }
            }
        }
        const queryBuilder = new query_builder_1.QueryBuilder({
            tableName: metadata.tableName,
        });
        const { sql, parameters } = queryBuilder
            .update(setValues)
            .where({ [primaryKey.name]: id })
            .build();
        await this.adapter.query(sql, parameters);
        // Update identity map
        this.updateIdentityMap(entity);
        // Execute after hooks
        if (options.hooks !== false) {
            await this.executeHooks(entityClass, 'afterUpdate', entity);
        }
        return entity;
    }
    /**
     * Remove entity
     */
    async remove(entity, options = {}) {
        const entityClass = entity.constructor;
        const metadata = this.metadataRegistry.getEntity(entityClass);
        if (!metadata) {
            throw new Error(`Entity ${entityClass.name} not registered`);
        }
        // Execute before hooks
        if (options.hooks !== false) {
            await this.executeHooks(entityClass, 'beforeRemove', entity);
        }
        const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
        if (!primaryKey) {
            throw new Error(`Entity ${entityClass.name} has no primary key`);
        }
        const id = entity[primaryKey.propertyName];
        if (id === undefined || id === null) {
            throw new Error('Cannot remove entity without primary key');
        }
        const queryBuilder = new query_builder_1.QueryBuilder({
            tableName: metadata.tableName,
        });
        const { sql, parameters } = queryBuilder
            .delete()
            .where({ [primaryKey.name]: id })
            .build();
        await this.adapter.query(sql, parameters);
        // Remove from identity map
        this.removeFromIdentityMap(entity);
        // Execute after hooks
        if (options.hooks !== false) {
            await this.executeHooks(entityClass, 'afterRemove', entity);
        }
    }
    /**
     * Remove entity by ID
     */
    async removeById(entityClass, id, options = {}) {
        const entity = await this.findById(entityClass, id);
        if (entity) {
            await this.remove(entity, options);
        }
    }
    /**
     * Count entities by criteria
     */
    async count(entityClass, options = {}) {
        const metadata = this.metadataRegistry.getEntity(entityClass);
        if (!metadata) {
            throw new Error(`Entity ${entityClass.name} not registered`);
        }
        const queryBuilder = new query_builder_1.QueryBuilder({
            tableName: metadata.tableName,
            select: ['COUNT(*) as count'],
            where: options.where || {},
        });
        const { sql, parameters } = queryBuilder.build();
        const result = await this.adapter.query(sql, parameters);
        return result.rows[0]?.count || 0;
    }
    /**
     * Check if entity exists
     */
    async exists(entityClass, options = {}) {
        const count = await this.count(entityClass, options);
        return count > 0;
    }
    /**
     * Hydrate entity from database row
     */
    hydrateEntity(entityClass, row) {
        const entity = new entityClass();
        const columns = this.metadataRegistry.getColumns(entityClass);
        for (const column of columns) {
            const value = row[column.name];
            if (value !== undefined) {
                entity[column.propertyName] = this.convertValue(value, column.type);
            }
        }
        // Add to identity map
        this.addToIdentityMap(entity);
        return entity;
    }
    /**
     * Convert database value to entity property value
     */
    convertValue(value, type) {
        if (value === null || value === undefined) {
            return null;
        }
        switch (type) {
            case 'date':
                return new Date(value);
            case 'json':
                return typeof value === 'string' ? JSON.parse(value) : value;
            case 'boolean':
                return Boolean(value);
            case 'number':
                return Number(value);
            default:
                return value;
        }
    }
    /**
     * Add entity to identity map
     */
    addToIdentityMap(entity) {
        const entityClass = entity.constructor;
        const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
        if (primaryKey) {
            const id = entity[primaryKey.propertyName];
            if (id !== undefined && id !== null) {
                const key = `${entityClass.name}:${id}`;
                this.identityMap.set(key, entity);
            }
        }
    }
    /**
     * Update entity in identity map
     */
    updateIdentityMap(entity) {
        this.addToIdentityMap(entity);
    }
    /**
     * Remove entity from identity map
     */
    removeFromIdentityMap(entity) {
        const entityClass = entity.constructor;
        const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
        if (primaryKey) {
            const id = entity[primaryKey.propertyName];
            if (id !== undefined && id !== null) {
                const key = `${entityClass.name}:${id}`;
                this.identityMap.delete(key);
            }
        }
    }
    /**
     * Execute entity hooks
     */
    async executeHooks(entityClass, hookType, entity) {
        const hooks = this.metadataRegistry.getHooks(entityClass);
        const relevantHooks = hooks.filter(hook => hook.type === hookType);
        for (const hook of relevantHooks) {
            const method = entity[hook.method];
            if (typeof method === 'function') {
                await method.call(entity);
            }
        }
    }
    /**
     * Clear identity map
     */
    clear() {
        this.identityMap.clear();
        this.changeTracker.clear();
    }
    /**
     * Get identity map size
     */
    getIdentityMapSize() {
        return this.identityMap.size;
    }
    /**
     * Get repository for entity
     */
    getRepository(entityClass) {
        return this.repositoryFactory.getRepository(entityClass);
    }
    /**
     * Get repository factory
     */
    getRepositoryFactory() {
        return this.repositoryFactory;
    }
    /**
     * Get current transaction
     */
    getCurrentTransaction() {
        return this.transaction;
    }
}
exports.EntityManager = EntityManager;
//# sourceMappingURL=entity-manager.js.map