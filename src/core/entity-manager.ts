/**
 * Entity Manager
 * Central entity management with Unit of Work pattern and Identity Map
 * Provides CRUD operations, change tracking, and transactional context
 */

import { MetadataRegistry } from './metadata-registry';
import { QueryBuilder } from './query-builder';
import { RepositoryFactory, DefaultRepositoryFactory } from './repository-factory';
import { Repository } from './repository';
import { Adapter, QueryOptions, SaveOptions, RemoveOptions, Transaction } from '@/types';

export interface EntityManagerOptions {
  adapter: Adapter;
  transaction?: Transaction;
}

export class EntityManager {
  private adapter: Adapter;
  private transaction: Transaction | null = null;
  private identityMap = new Map<string, any>();
  private changeTracker = new Map<string, any>();
  private metadataRegistry: MetadataRegistry;
  private repositoryFactory: RepositoryFactory;

  constructor(options: EntityManagerOptions) {
    this.adapter = options.adapter;
    this.transaction = options.transaction || null;
    this.metadataRegistry = MetadataRegistry.getInstance();
    this.repositoryFactory = new DefaultRepositoryFactory(this);
  }

  /**
   * Find entities by criteria
   */
  async find<T>(entityClass: new () => T, options: QueryOptions = {}): Promise<T[]> {
    const metadata = this.metadataRegistry.getEntity(entityClass);
    if (!metadata) {
      throw new Error(`Entity ${entityClass.name} not registered`);
    }

    const queryBuilder = new QueryBuilder({
      tableName: metadata.tableName,
      select: options.select || [],
      where: options.where || {},
      orderBy: options.orderBy || {},
      limit: options.limit || 0,
      offset: options.offset || 0,
    });

    const { sql, parameters } = queryBuilder.build();
    const result = await this.adapter.query<T>(sql, parameters);

    return result.rows.map(row => this.hydrateEntity(entityClass, row));
  }

  /**
   * Find a single entity by criteria
   */
  async findOne<T>(entityClass: new () => T, options: QueryOptions = {}): Promise<T | null> {
    const results = await this.find(entityClass, { ...options, limit: 1 });
    return results[0] || null;
  }

  /**
   * Find entity by primary key
   */
  async findById<T>(entityClass: new () => T, id: any): Promise<T | null> {
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
  async save<T>(entity: T, options: SaveOptions = {}): Promise<T> {
    const entityClass = (entity as any).constructor as new () => T;
    const metadata = this.metadataRegistry.getEntity(entityClass);
    if (!metadata) {
      throw new Error(`Entity ${entityClass.name} not registered`);
    }

    const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
    if (!primaryKey) {
      throw new Error(`Entity ${entityClass.name} has no primary key`);
    }

    const id = (entity as any)[primaryKey.propertyName];
    const isNew = id === undefined || id === null;

    if (isNew) {
      return this.insert(entity, options);
    } else {
      return this.update(entity, options);
    }
  }

  /**
   * Insert new entity
   */
  async insert<T>(entity: T, options: SaveOptions = {}): Promise<T> {
    const entityClass = (entity as any).constructor as new () => T;
    const metadata = this.metadataRegistry.getEntity(entityClass);
    if (!metadata) {
      throw new Error(`Entity ${entityClass.name} not registered`);
    }

    // Execute before hooks
    if (options.hooks !== false) {
      await this.executeHooks(entityClass, 'beforeInsert', entity);
    }

    const columns = this.metadataRegistry.getColumns(entityClass);
    const values: Record<string, any> = {};

    for (const column of columns) {
      if (!column.generated) {
        const value = (entity as any)[column.propertyName];
        if (value !== undefined) {
          values[column.name] = value;
        }
      }
    }

    const queryBuilder = new QueryBuilder({
      tableName: metadata.tableName,
    });

    const { sql, parameters } = queryBuilder.insert(values).build();
    const result = await this.adapter.query(sql, parameters);

    // Set generated primary key
    const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
    if (primaryKey && primaryKey.generated) {
      (entity as any)[primaryKey.propertyName] =
        (result.rows[0] as any)?.id || (result.rows[0] as any)?.[primaryKey.name];
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
  async update<T>(entity: T, options: SaveOptions = {}): Promise<T> {
    const entityClass = (entity as any).constructor as new () => T;
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

    const id = (entity as any)[primaryKey.propertyName];
    if (id === undefined || id === null) {
      throw new Error('Cannot update entity without primary key');
    }

    const columns = this.metadataRegistry.getColumns(entityClass);
    const setValues: Record<string, any> = {};

    for (const column of columns) {
      if (!column.primary && !column.generated) {
        const value = (entity as any)[column.propertyName];
        if (value !== undefined) {
          setValues[column.name] = value;
        }
      }
    }

    const queryBuilder = new QueryBuilder({
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
  async remove<T>(entity: T, options: RemoveOptions = {}): Promise<void> {
    const entityClass = (entity as any).constructor as new () => T;
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

    const id = (entity as any)[primaryKey.propertyName];
    if (id === undefined || id === null) {
      throw new Error('Cannot remove entity without primary key');
    }

    const queryBuilder = new QueryBuilder({
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
  async removeById<T>(
    entityClass: new () => T,
    id: any,
    options: RemoveOptions = {}
  ): Promise<void> {
    const entity = await this.findById(entityClass, id);
    if (entity) {
      await this.remove(entity, options);
    }
  }

  /**
   * Count entities by criteria
   */
  async count<T>(entityClass: new () => T, options: QueryOptions = {}): Promise<number> {
    const metadata = this.metadataRegistry.getEntity(entityClass);
    if (!metadata) {
      throw new Error(`Entity ${entityClass.name} not registered`);
    }

    const queryBuilder = new QueryBuilder({
      tableName: metadata.tableName,
      select: ['COUNT(*) as count'],
      where: options.where || {},
    });

    const { sql, parameters } = queryBuilder.build();
    const result = await this.adapter.query<{ count: number }>(sql, parameters);

    return result.rows[0]?.count || 0;
  }

  /**
   * Check if entity exists
   */
  async exists<T>(entityClass: new () => T, options: QueryOptions = {}): Promise<boolean> {
    const count = await this.count(entityClass, options);
    return count > 0;
  }

  /**
   * Hydrate entity from database row
   */
  private hydrateEntity<T>(entityClass: new () => T, row: any): T {
    const entity = new entityClass();
    const columns = this.metadataRegistry.getColumns(entityClass);

    for (const column of columns) {
      const value = row[column.name];
      if (value !== undefined) {
        (entity as any)[column.propertyName] = this.convertValue(value, column.type);
      }
    }

    // Add to identity map
    this.addToIdentityMap(entity);

    return entity;
  }

  /**
   * Convert database value to entity property value
   */
  private convertValue(value: any, type: string): any {
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
  private addToIdentityMap<T>(entity: T): void {
    const entityClass = (entity as any).constructor as new () => T;
    const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
    if (primaryKey) {
      const id = (entity as any)[primaryKey.propertyName];
      if (id !== undefined && id !== null) {
        const key = `${entityClass.name}:${id}`;
        this.identityMap.set(key, entity);
      }
    }
  }

  /**
   * Update entity in identity map
   */
  private updateIdentityMap<T>(entity: T): void {
    this.addToIdentityMap(entity);
  }

  /**
   * Remove entity from identity map
   */
  private removeFromIdentityMap<T>(entity: T): void {
    const entityClass = (entity as any).constructor as new () => T;
    const primaryKey = this.metadataRegistry.getPrimaryKey(entityClass);
    if (primaryKey) {
      const id = (entity as any)[primaryKey.propertyName];
      if (id !== undefined && id !== null) {
        const key = `${entityClass.name}:${id}`;
        this.identityMap.delete(key);
      }
    }
  }

  /**
   * Execute entity hooks
   */
  private async executeHooks<T>(
    entityClass: new () => T,
    hookType: string,
    entity: T
  ): Promise<void> {
    const hooks = this.metadataRegistry.getHooks(entityClass);
    const relevantHooks = hooks.filter(hook => hook.type === hookType);

    for (const hook of relevantHooks) {
      const method = (entity as any)[hook.method];
      if (typeof method === 'function') {
        await method.call(entity);
      }
    }
  }

  /**
   * Clear identity map
   */
  clear(): void {
    this.identityMap.clear();
    this.changeTracker.clear();
  }

  /**
   * Get identity map size
   */
  getIdentityMapSize(): number {
    return this.identityMap.size;
  }

  /**
   * Get repository for entity
   */
  getRepository<T extends object>(entityClass: new () => T): Repository<T> {
    return this.repositoryFactory.getRepository(entityClass);
  }

  /**
   * Get repository factory
   */
  getRepositoryFactory(): RepositoryFactory {
    return this.repositoryFactory;
  }

  /**
   * Get current transaction
   */
  getCurrentTransaction(): Transaction | null {
    return this.transaction;
  }
}
