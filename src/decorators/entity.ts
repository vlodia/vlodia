/**
 * Entity Decorator
 * Marks a class as a database entity and registers it with the metadata registry
 * Provides table name configuration and entity-level metadata
 */

import 'reflect-metadata';
import { MetadataRegistry } from '../core/metadata-registry';
import { EntityMetadata } from '../types';

export interface EntityOptions {
  name?: string;
  tableName?: string;
  schema?: string;
  database?: string;
}

const METADATA_KEY = Symbol('nythera:entity');

/**
 * Entity decorator for marking classes as database entities
 * @param options Configuration options for the entity
 */
export function Entity(options: EntityOptions = {}): ClassDecorator {
  return function (target: any) {
    const registry = MetadataRegistry.getInstance();

    // Get existing metadata or create new
    const existingMetadata = Reflect.getMetadata(METADATA_KEY, target) as
      | EntityMetadata
      | undefined;

    const metadata: EntityMetadata = {
      name: options.name || target.name,
      tableName: options.tableName || target.name.toLowerCase(),
      target: target,
      columns: existingMetadata?.columns || [],
      relations: existingMetadata?.relations || [],
      hooks: existingMetadata?.hooks || [],
      indexes: existingMetadata?.indexes || [],
    };

    // Store metadata in reflection
    Reflect.defineMetadata(METADATA_KEY, metadata, target);

    // Register with metadata registry
    registry.registerEntity(target, metadata);

    return target;
  };
}

/**
 * Get entity metadata from a class
 */
export function getEntityMetadata<T>(target: new () => T): EntityMetadata | undefined {
  return Reflect.getMetadata(METADATA_KEY, target);
}

/**
 * Check if a class is marked as an entity
 */
export function isEntity<T>(target: new () => T): boolean {
  return Reflect.hasMetadata(METADATA_KEY, target);
}
