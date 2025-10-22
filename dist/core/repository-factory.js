"use strict";
/**
 * Repository Factory
 * Factory for creating typed repositories with custom extensions
 * Provides repository pattern implementation with dependency injection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultRepositoryFactory = void 0;
const repository_1 = require("./repository");
class DefaultRepositoryFactory {
    repositories = new Map();
    entityManager;
    constructor(entityManager) {
        this.entityManager = entityManager;
    }
    /**
     * Create repository for entity
     */
    create(entityClass) {
        const className = entityClass.name;
        if (this.repositories.has(className)) {
            return this.repositories.get(className);
        }
        const repository = new repository_1.BaseRepository(this.entityManager, entityClass);
        this.repositories.set(className, repository);
        return repository;
    }
    /**
     * Get existing repository
     */
    getRepository(entityClass) {
        return this.create(entityClass);
    }
    /**
     * Check if repository exists
     */
    hasRepository(entityClass) {
        return this.repositories.has(entityClass.name);
    }
    /**
     * Clear all repositories
     */
    clearRepositories() {
        this.repositories.clear();
    }
    /**
     * Get all repositories
     */
    getAllRepositories() {
        return Array.from(this.repositories.values());
    }
    /**
     * Get repository count
     */
    getRepositoryCount() {
        return this.repositories.size;
    }
}
exports.DefaultRepositoryFactory = DefaultRepositoryFactory;
//# sourceMappingURL=repository-factory.js.map