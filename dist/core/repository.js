"use strict";
/**
 * Repository Pattern Implementation
 * Type-safe repository with custom extensions and query methods
 * Provides high-level data access patterns with entity-specific operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepository = exports.BaseRepository = void 0;
class BaseRepository {
    entityManager;
    entityClass;
    constructor(entityManager, entityClass) {
        this.entityManager = entityManager;
        this.entityClass = entityClass;
    }
    /**
     * Find entities by criteria
     */
    async find(options = {}) {
        return this.entityManager.find(this.entityClass, options);
    }
    /**
     * Find a single entity by criteria
     */
    async findOne(options = {}) {
        return this.entityManager.findOne(this.entityClass, options);
    }
    /**
     * Find entity by primary key
     */
    async findById(id) {
        return this.entityManager.findById(this.entityClass, id);
    }
    /**
     * Save entity (insert or update)
     */
    async save(entity, options = {}) {
        return this.entityManager.save(entity, options);
    }
    /**
     * Save multiple entities
     */
    async saveMany(entities, options = {}) {
        const results = [];
        for (const entity of entities) {
            const saved = await this.entityManager.save(entity, options);
            results.push(saved);
        }
        return results;
    }
    /**
     * Remove entity
     */
    async remove(entity, options = {}) {
        return this.entityManager.remove(entity, options);
    }
    /**
     * Remove entity by ID
     */
    async removeById(id, options = {}) {
        return this.entityManager.removeById(this.entityClass, id, options);
    }
    /**
     * Count entities by criteria
     */
    async count(options = {}) {
        return this.entityManager.count(this.entityClass, options);
    }
    /**
     * Check if entity exists
     */
    async exists(options = {}) {
        return this.entityManager.exists(this.entityClass, options);
    }
    /**
     * Create new entity instance
     */
    create(data) {
        const entity = new this.entityClass();
        if (data) {
            Object.assign(entity, data);
        }
        return entity;
    }
    /**
     * Update entity by ID
     */
    async update(id, data, options = {}) {
        const entity = await this.findById(id);
        if (!entity) {
            throw new Error(`Entity with ID ${id} not found`);
        }
        Object.assign(entity, data);
        return this.save(entity, options);
    }
    /**
     * Find entities with pagination
     */
    async findWithPagination(page = 1, limit = 10, options = {}) {
        const offset = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.find({ ...options, limit, offset }),
            this.count(options),
        ]);
        return {
            data,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    /**
     * Find entities with relations
     */
    async findWithRelations(relations, options = {}) {
        return this.find({ ...options, relations });
    }
    /**
     * Find one entity with relations
     */
    async findOneWithRelations(relations, options = {}) {
        return this.findOne({ ...options, relations });
    }
    /**
     * Find entities by field value
     */
    async findBy(field, value) {
        return this.find({ where: { [field]: value } });
    }
    /**
     * Find one entity by field value
     */
    async findOneBy(field, value) {
        return this.findOne({ where: { [field]: value } });
    }
    /**
     * Find entities where field is in array of values
     */
    async findWhereIn(field, values) {
        return this.find({ where: { [field]: { $in: values } } });
    }
    /**
     * Find entities where field is like pattern
     */
    async findWhereLike(field, pattern) {
        return this.find({ where: { [field]: { $like: pattern } } });
    }
    /**
     * Find entities where field is between values
     */
    async findWhereBetween(field, start, end) {
        return this.find({ where: { [field]: { $between: [start, end] } } });
    }
    /**
     * Find entities where field is null
     */
    async findWhereNull(field) {
        return this.find({ where: { [field]: { $isNull: true } } });
    }
    /**
     * Find entities where field is not null
     */
    async findWhereNotNull(field) {
        return this.find({ where: { [field]: { $isNotNull: true } } });
    }
    /**
     * Find entities ordered by field
     */
    async findOrderedBy(field, direction = 'ASC') {
        return this.find({ orderBy: { [field]: direction } });
    }
    /**
     * Find first N entities
     */
    async findFirst(limit, options = {}) {
        return this.find({ ...options, limit });
    }
    /**
     * Find last N entities
     */
    async findLast(limit, options = {}) {
        return this.find({ ...options, limit, orderBy: { id: 'DESC' } });
    }
}
exports.BaseRepository = BaseRepository;
/**
 * Repository factory for creating typed repositories
 */
function createRepository(entityManager, entityClass) {
    return new BaseRepository(entityManager, entityClass);
}
exports.createRepository = createRepository;
//# sourceMappingURL=repository.js.map