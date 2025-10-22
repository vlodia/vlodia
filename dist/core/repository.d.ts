/**
 * Repository Pattern Implementation
 * Type-safe repository with custom extensions and query methods
 * Provides high-level data access patterns with entity-specific operations
 */
import { EntityManager } from './entity-manager';
import { QueryOptions, SaveOptions, RemoveOptions } from '@/types';
export interface Repository<T extends object> {
    find(options?: QueryOptions): Promise<T[]>;
    findOne(options?: QueryOptions): Promise<T | null>;
    findById(id: any): Promise<T | null>;
    save(entity: T, options?: SaveOptions): Promise<T>;
    saveMany(entities: T[], options?: SaveOptions): Promise<T[]>;
    remove(entity: T, options?: RemoveOptions): Promise<void>;
    removeById(id: any, options?: RemoveOptions): Promise<void>;
    count(options?: QueryOptions): Promise<number>;
    exists(options?: QueryOptions): Promise<boolean>;
    create(data?: Partial<T>): T;
    update(id: any, data: Partial<T>, options?: SaveOptions): Promise<T>;
}
export declare class BaseRepository<T extends object> implements Repository<T> {
    protected entityManager: EntityManager;
    protected entityClass: new () => T;
    constructor(entityManager: EntityManager, entityClass: new () => T);
    /**
     * Find entities by criteria
     */
    find(options?: QueryOptions): Promise<T[]>;
    /**
     * Find a single entity by criteria
     */
    findOne(options?: QueryOptions): Promise<T | null>;
    /**
     * Find entity by primary key
     */
    findById(id: any): Promise<T | null>;
    /**
     * Save entity (insert or update)
     */
    save(entity: T, options?: SaveOptions): Promise<T>;
    /**
     * Save multiple entities
     */
    saveMany(entities: T[], options?: SaveOptions): Promise<T[]>;
    /**
     * Remove entity
     */
    remove(entity: T, options?: RemoveOptions): Promise<void>;
    /**
     * Remove entity by ID
     */
    removeById(id: any, options?: RemoveOptions): Promise<void>;
    /**
     * Count entities by criteria
     */
    count(options?: QueryOptions): Promise<number>;
    /**
     * Check if entity exists
     */
    exists(options?: QueryOptions): Promise<boolean>;
    /**
     * Create new entity instance
     */
    create(data?: Partial<T>): T;
    /**
     * Update entity by ID
     */
    update(id: any, data: Partial<T>, options?: SaveOptions): Promise<T>;
    /**
     * Find entities with pagination
     */
    findWithPagination(page?: number, limit?: number, options?: QueryOptions): Promise<{
        data: T[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    /**
     * Find entities with relations
     */
    findWithRelations(relations: string[], options?: QueryOptions): Promise<T[]>;
    /**
     * Find one entity with relations
     */
    findOneWithRelations(relations: string[], options?: QueryOptions): Promise<T | null>;
    /**
     * Find entities by field value
     */
    findBy(field: string, value: any): Promise<T[]>;
    /**
     * Find one entity by field value
     */
    findOneBy(field: string, value: any): Promise<T | null>;
    /**
     * Find entities where field is in array of values
     */
    findWhereIn(field: string, values: any[]): Promise<T[]>;
    /**
     * Find entities where field is like pattern
     */
    findWhereLike(field: string, pattern: string): Promise<T[]>;
    /**
     * Find entities where field is between values
     */
    findWhereBetween(field: string, start: any, end: any): Promise<T[]>;
    /**
     * Find entities where field is null
     */
    findWhereNull(field: string): Promise<T[]>;
    /**
     * Find entities where field is not null
     */
    findWhereNotNull(field: string): Promise<T[]>;
    /**
     * Find entities ordered by field
     */
    findOrderedBy(field: string, direction?: 'ASC' | 'DESC'): Promise<T[]>;
    /**
     * Find first N entities
     */
    findFirst(limit: number, options?: QueryOptions): Promise<T[]>;
    /**
     * Find last N entities
     */
    findLast(limit: number, options?: QueryOptions): Promise<T[]>;
}
/**
 * Repository factory for creating typed repositories
 */
export declare function createRepository<T extends object>(entityManager: EntityManager, entityClass: new () => T): Repository<T>;
//# sourceMappingURL=repository.d.ts.map