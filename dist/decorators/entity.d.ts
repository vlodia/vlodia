/**
 * Entity Decorator
 * Marks a class as a database entity and registers it with the metadata registry
 * Provides table name configuration and entity-level metadata
 */
import 'reflect-metadata';
import { EntityMetadata } from '../types';
export interface EntityOptions {
    name?: string;
    tableName?: string;
    schema?: string;
    database?: string;
}
/**
 * Entity decorator for marking classes as database entities
 * @param options Configuration options for the entity
 */
export declare function Entity(options?: EntityOptions): ClassDecorator;
/**
 * Get entity metadata from a class
 */
export declare function getEntityMetadata<T>(target: new () => T): EntityMetadata | undefined;
/**
 * Check if a class is marked as an entity
 */
export declare function isEntity<T>(target: new () => T): boolean;
//# sourceMappingURL=entity.d.ts.map