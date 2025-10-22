/**
 * Repository Factory
 * Factory for creating typed repositories with custom extensions
 * Provides repository pattern implementation with dependency injection
 */

import { EntityManager } from './entity-manager';
import { BaseRepository, Repository } from './repository';

export interface RepositoryFactory {
  create<T extends object>(entityClass: new () => T): Repository<T>;
  getRepository<T extends object>(entityClass: new () => T): Repository<T>;
  hasRepository<T extends object>(entityClass: new () => T): boolean;
  clearRepositories(): void;
}

export class DefaultRepositoryFactory implements RepositoryFactory {
  private repositories = new Map<string, Repository<any>>();
  private entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    this.entityManager = entityManager;
  }

  /**
   * Create repository for entity
   */
  create<T extends object>(entityClass: new () => T): Repository<T> {
    const className = entityClass.name;

    if (this.repositories.has(className)) {
      return this.repositories.get(className)!;
    }

    const repository = new BaseRepository(this.entityManager, entityClass);
    this.repositories.set(className, repository);

    return repository;
  }

  /**
   * Get existing repository
   */
  getRepository<T extends object>(entityClass: new () => T): Repository<T> {
    return this.create(entityClass);
  }

  /**
   * Check if repository exists
   */
  hasRepository<T extends object>(entityClass: new () => T): boolean {
    return this.repositories.has(entityClass.name);
  }

  /**
   * Clear all repositories
   */
  clearRepositories(): void {
    this.repositories.clear();
  }

  /**
   * Get all repositories
   */
  getAllRepositories(): Repository<any>[] {
    return Array.from(this.repositories.values());
  }

  /**
   * Get repository count
   */
  getRepositoryCount(): number {
    return this.repositories.size;
  }
}
