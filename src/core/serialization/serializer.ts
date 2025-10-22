/**
 * Serialization System
 * Entity serialization with circular reference handling
 * Provides toJSON() implementation and metadata removal
 */

import { MetadataRegistry } from '../metadata-registry';

export interface SerializationOptions {
  excludeMetadata?: boolean | undefined;
  excludeRelations?: boolean | undefined;
  excludeHooks?: boolean | undefined;
  excludePrivate?: boolean | undefined;
  excludeUndefined?: boolean | undefined;
  excludeNull?: boolean | undefined;
  maxDepth?: number | undefined;
  replacer?: ((key: string, value: any) => any) | undefined;
}

export class EntitySerializer {
  private metadataRegistry: MetadataRegistry;
  private visited = new Set<any>();

  constructor() {
    this.metadataRegistry = MetadataRegistry.getInstance();
  }

  /**
   * Serialize entity to JSON
   */
  serialize<T>(entity: T, options: SerializationOptions = {}): any {
    const {
      excludeMetadata = true,
      excludeRelations = false,
      excludeHooks = true,
      excludePrivate = true,
      excludeUndefined = true,
      excludeNull = false,
      maxDepth = 10,
      replacer
    } = options;

    this.visited.clear();
    return this.serializeValue(entity, {
      excludeMetadata,
      excludeRelations,
      excludeHooks,
      excludePrivate,
      excludeUndefined,
      excludeNull,
      maxDepth,
      replacer,
      currentDepth: 0
    });
  }

  /**
   * Serialize array of entities
   */
  serializeArray<T>(entities: T[], options: SerializationOptions = {}): any[] {
    return entities.map(entity => this.serialize(entity, options));
  }

  /**
   * Serialize value with options
   */
  private serializeValue(
    value: any,
    options: SerializationOptions & { currentDepth: number }
  ): any {
    const {
      excludeMetadata,
      excludeRelations,
      excludeHooks,
      excludePrivate,
      excludeUndefined,
      excludeNull,
      maxDepth,
      replacer,
      currentDepth
    } = options;

    // Check depth limit defensively, ensuring maxDepth is always a number
    if (typeof maxDepth !== "number" || currentDepth >= maxDepth) {
      return '[Max Depth Reached]';
    }

    // Handle null and undefined

    if (value === null) {
      return excludeNull ? undefined : null;
    }
    
    if (value === undefined) {
      return excludeUndefined ? undefined : undefined;
    }

    // Handle primitive types
    if (typeof value !== 'object') {
      return value;
    }

    // Handle Date
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Handle Array
    if (Array.isArray(value)) {
      return value.map(item => this.serializeValue(item, {
        ...options,
        currentDepth: currentDepth + 1
      }));
    }

    // Handle circular references
    if (this.visited.has(value)) {
      return '[Circular Reference]';
    }

    this.visited.add(value);

    try {
      const result: any = {};

      // Get entity metadata
      const entityMetadata = this.metadataRegistry.getEntity(value.constructor);
      const columns = entityMetadata ? this.metadataRegistry.getColumns(value.constructor) : [];
      const relations = entityMetadata ? this.metadataRegistry.getRelations(value.constructor) : [];
      const hooks = entityMetadata ? this.metadataRegistry.getHooks(value.constructor) : [];

      // Serialize properties
      for (const [key, val] of Object.entries(value)) {
        // Skip non-column properties if entity has metadata
        if (entityMetadata && columns.length > 0) {
          const isColumn = columns.some(col => col.propertyName === key);
          if (!isColumn && !this.isMetadataProperty(key) && !this.isHookProperty(key, hooks)) {
            continue;
          }
        }
        // Skip private properties
        if (excludePrivate && key.startsWith('_')) {
          continue;
        }

        // Skip metadata properties
        if (excludeMetadata && this.isMetadataProperty(key)) {
          continue;
        }

        // Skip hook properties
        if (excludeHooks && this.isHookProperty(key, hooks)) {
          continue;
        }

        // Skip relation properties
        if (excludeRelations && this.isRelationProperty(key, relations)) {
          continue;
        }

        // Apply replacer
        let serializedValue = val;
        if (replacer) {
          const replaced = replacer(key, val);
          if (replaced !== undefined) {
            serializedValue = replaced;
          }
        }

        // Serialize nested value
        serializedValue = this.serializeValue(serializedValue, {
          ...options,
          currentDepth: currentDepth + 1
        });

        // Skip undefined/null values based on options
        if (serializedValue === undefined && excludeUndefined) {
          continue;
        }
        
        if (serializedValue === null && excludeNull) {
          continue;
        }

        result[key] = serializedValue;
      }

      return result;
    } finally {
      this.visited.delete(value);
    }
  }

  /**
   * Check if property is metadata
   */
  private isMetadataProperty(key: string): boolean {
    return key.startsWith('__') || key.endsWith('__') || key === 'constructor';
  }

  /**
   * Check if property is hook
   */
  private isHookProperty(key: string, hooks: any[]): boolean {
    return hooks.some(hook => hook.method === key);
  }

  /**
   * Check if property is relation
   */
  private isRelationProperty(key: string, relations: any[]): boolean {
    return relations.some(relation => relation.propertyName === key);
  }

  /**
   * Deserialize JSON to entity
   */
  deserialize<T>(entityClass: new () => T, data: any): T {
    const entity = new entityClass();
    const columns = this.metadataRegistry.getColumns(entityClass);

    for (const column of columns) {
      const value = data[column.propertyName];
      if (value !== undefined) {
        (entity as any)[column.propertyName] = this.convertValue(value, column.type);
      }
    }

    return entity;
  }

  /**
   * Convert value to appropriate type
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
      case 'string':
        return String(value);
      default:
        return value;
    }
  }

  /**
   * Create entity with toJSON method
   */
  addToJSONMethod<T>(entityClass: new () => T): void {
    const originalPrototype = entityClass.prototype;
    
    originalPrototype.toJSON = function(options: SerializationOptions = {}) {
      const serializer = new EntitySerializer();
      return serializer.serialize(this, options);
    };
  }

  /**
   * Remove circular references from object
   */
  removeCircularReferences(obj: any, maxDepth: number = 10): any {
    const visited = new Set<any>();
    
    const removeCircular = (value: any, depth: number): any => {
      if (depth >= maxDepth) {
        return '[Max Depth Reached]';
      }

      if (value === null || typeof value !== 'object') {
        return value;
      }

      if (visited.has(value)) {
        return '[Circular Reference]';
      }

      visited.add(value);

      if (Array.isArray(value)) {
        return value.map(item => removeCircular(item, depth + 1));
      }

      const result: any = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = removeCircular(val, depth + 1);
      }

      return result;
    };

    return removeCircular(obj, 0);
  }

  /**
   * Clone entity without circular references
   */
  cloneEntity<T>(entity: T): T {
    const serialized = this.serialize(entity);
    return JSON.parse(JSON.stringify(serialized));
  }
}
