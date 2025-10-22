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

export class BaseRepository<T extends object> implements Repository<T> {
  protected entityManager: EntityManager;
  protected entityClass: new () => T;

  constructor(entityManager: EntityManager, entityClass: new () => T) {
    this.entityManager = entityManager;
    this.entityClass = entityClass;
  }

  /**
   * Find entities by criteria
   */
  async find(options: QueryOptions = {}): Promise<T[]> {
    return this.entityManager.find(this.entityClass, options);
  }

  /**
   * Find a single entity by criteria
   */
  async findOne(options: QueryOptions = {}): Promise<T | null> {
    return this.entityManager.findOne(this.entityClass, options);
  }

  /**
   * Find entity by primary key
   */
  async findById(id: any): Promise<T | null> {
    return this.entityManager.findById(this.entityClass, id);
  }

  /**
   * Save entity (insert or update)
   */
  async save(entity: T, options: SaveOptions = {}): Promise<T> {
    return this.entityManager.save(entity, options);
  }

  /**
   * Save multiple entities
   */
  async saveMany(entities: T[], options: SaveOptions = {}): Promise<T[]> {
    const results: T[] = [];
    for (const entity of entities) {
      const saved = await this.entityManager.save(entity, options);
      results.push(saved);
    }
    return results;
  }

  /**
   * Remove entity
   */
  async remove(entity: T, options: RemoveOptions = {}): Promise<void> {
    return this.entityManager.remove(entity, options);
  }

  /**
   * Remove entity by ID
   */
  async removeById(id: any, options: RemoveOptions = {}): Promise<void> {
    return this.entityManager.removeById(this.entityClass, id, options);
  }

  /**
   * Count entities by criteria
   */
  async count(options: QueryOptions = {}): Promise<number> {
    return this.entityManager.count(this.entityClass, options);
  }

  /**
   * Check if entity exists
   */
  async exists(options: QueryOptions = {}): Promise<boolean> {
    return this.entityManager.exists(this.entityClass, options);
  }

  /**
   * Create new entity instance
   */
  create(data?: Partial<T>): T {
    const entity = new this.entityClass();
    if (data) {
      Object.assign(entity as object, data);
    }
    return entity;
  }

  /**
   * Update entity by ID
   */
  async update(id: any, data: Partial<T>, options: SaveOptions = {}): Promise<T> {
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
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    options: QueryOptions = {}
  ): Promise<{ data: T[]; total: number; page: number; limit: number; pages: number }> {
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
  async findWithRelations(
    relations: string[],
    options: QueryOptions = {}
  ): Promise<T[]> {
    return this.find({ ...options, relations });
  }

  /**
   * Find one entity with relations
   */
  async findOneWithRelations(
    relations: string[],
    options: QueryOptions = {}
  ): Promise<T | null> {
    return this.findOne({ ...options, relations });
  }

  /**
   * Find entities by field value
   */
  async findBy(field: string, value: any): Promise<T[]> {
    return this.find({ where: { [field]: value } });
  }

  /**
   * Find one entity by field value
   */
  async findOneBy(field: string, value: any): Promise<T | null> {
    return this.findOne({ where: { [field]: value } });
  }

  /**
   * Find entities where field is in array of values
   */
  async findWhereIn(field: string, values: any[]): Promise<T[]> {
    return this.find({ where: { [field]: { $in: values } } });
  }

  /**
   * Find entities where field is like pattern
   */
  async findWhereLike(field: string, pattern: string): Promise<T[]> {
    return this.find({ where: { [field]: { $like: pattern } } });
  }

  /**
   * Find entities where field is between values
   */
  async findWhereBetween(field: string, start: any, end: any): Promise<T[]> {
    return this.find({ where: { [field]: { $between: [start, end] } } });
  }

  /**
   * Find entities where field is null
   */
  async findWhereNull(field: string): Promise<T[]> {
    return this.find({ where: { [field]: { $isNull: true } } });
  }

  /**
   * Find entities where field is not null
   */
  async findWhereNotNull(field: string): Promise<T[]> {
    return this.find({ where: { [field]: { $isNotNull: true } } });
  }

  /**
   * Find entities ordered by field
   */
  async findOrderedBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): Promise<T[]> {
    return this.find({ orderBy: { [field]: direction } });
  }

  /**
   * Find first N entities
   */
  async findFirst(limit: number, options: QueryOptions = {}): Promise<T[]> {
    return this.find({ ...options, limit });
  }

  /**
   * Find last N entities
   */
  async findLast(limit: number, options: QueryOptions = {}): Promise<T[]> {
    return this.find({ ...options, limit, orderBy: { id: 'DESC' } });
  }
}

/**
 * Repository factory for creating typed repositories
 */
export function createRepository<T extends object>(
  entityManager: EntityManager,
  entityClass: new () => T
): Repository<T> {
  return new BaseRepository(entityManager, entityClass);
}
