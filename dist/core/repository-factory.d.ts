/**
 * Repository Factory
 * Factory for creating typed repositories with custom extensions
 * Provides repository pattern implementation with dependency injection
 */
import { EntityManager } from './entity-manager';
import { Repository } from './repository';
export interface RepositoryFactory {
    create<T extends object>(entityClass: new () => T): Repository<T>;
    getRepository<T extends object>(entityClass: new () => T): Repository<T>;
    hasRepository<T extends object>(entityClass: new () => T): boolean;
    clearRepositories(): void;
}
export declare class DefaultRepositoryFactory implements RepositoryFactory {
    private repositories;
    private entityManager;
    constructor(entityManager: EntityManager);
    /**
     * Create repository for entity
     */
    create<T extends object>(entityClass: new () => T): Repository<T>;
    /**
     * Get existing repository
     */
    getRepository<T extends object>(entityClass: new () => T): Repository<T>;
    /**
     * Check if repository exists
     */
    hasRepository<T extends object>(entityClass: new () => T): boolean;
    /**
     * Clear all repositories
     */
    clearRepositories(): void;
    /**
     * Get all repositories
     */
    getAllRepositories(): Repository<any>[];
    /**
     * Get repository count
     */
    getRepositoryCount(): number;
}
//# sourceMappingURL=repository-factory.d.ts.map