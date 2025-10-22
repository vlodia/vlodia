/**
 * Entity Manager
 * Central entity management with Unit of Work pattern and Identity Map
 * Provides CRUD operations, change tracking, and transactional context
 */
import { RepositoryFactory } from './repository-factory';
import { Repository } from './repository';
import { Adapter, QueryOptions, SaveOptions, RemoveOptions, Transaction } from '@/types';
export interface EntityManagerOptions {
    adapter: Adapter;
    transaction?: Transaction;
}
export declare class EntityManager {
    private adapter;
    private transaction;
    private identityMap;
    private changeTracker;
    private metadataRegistry;
    private repositoryFactory;
    constructor(options: EntityManagerOptions);
    /**
     * Find entities by criteria
     */
    find<T>(entityClass: new () => T, options?: QueryOptions): Promise<T[]>;
    /**
     * Find a single entity by criteria
     */
    findOne<T>(entityClass: new () => T, options?: QueryOptions): Promise<T | null>;
    /**
     * Find entity by primary key
     */
    findById<T>(entityClass: new () => T, id: any): Promise<T | null>;
    /**
     * Save entity (insert or update)
     */
    save<T>(entity: T, options?: SaveOptions): Promise<T>;
    /**
     * Insert new entity
     */
    insert<T>(entity: T, options?: SaveOptions): Promise<T>;
    /**
     * Update existing entity
     */
    update<T>(entity: T, options?: SaveOptions): Promise<T>;
    /**
     * Remove entity
     */
    remove<T>(entity: T, options?: RemoveOptions): Promise<void>;
    /**
     * Remove entity by ID
     */
    removeById<T>(entityClass: new () => T, id: any, options?: RemoveOptions): Promise<void>;
    /**
     * Count entities by criteria
     */
    count<T>(entityClass: new () => T, options?: QueryOptions): Promise<number>;
    /**
     * Check if entity exists
     */
    exists<T>(entityClass: new () => T, options?: QueryOptions): Promise<boolean>;
    /**
     * Hydrate entity from database row
     */
    private hydrateEntity;
    /**
     * Convert database value to entity property value
     */
    private convertValue;
    /**
     * Add entity to identity map
     */
    private addToIdentityMap;
    /**
     * Update entity in identity map
     */
    private updateIdentityMap;
    /**
     * Remove entity from identity map
     */
    private removeFromIdentityMap;
    /**
     * Execute entity hooks
     */
    private executeHooks;
    /**
     * Clear identity map
     */
    clear(): void;
    /**
     * Get identity map size
     */
    getIdentityMapSize(): number;
    /**
     * Get repository for entity
     */
    getRepository<T extends object>(entityClass: new () => T): Repository<T>;
    /**
     * Get repository factory
     */
    getRepositoryFactory(): RepositoryFactory;
    /**
     * Get current transaction
     */
    getCurrentTransaction(): Transaction | null;
}
//# sourceMappingURL=entity-manager.d.ts.map