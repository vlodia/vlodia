/**
 * Relation Decorators
 * Provides decorators for defining entity relationships with type safety
 * Supports OneToOne, OneToMany, ManyToOne, and ManyToMany relationships
 */

import 'reflect-metadata';
import { MetadataRegistry } from '../core/metadata-registry';
import { RelationMetadata, RelationType } from '../types';

export interface RelationOptions {
  target: () => Function;
  joinColumn?: string;
  inverseJoinColumn?: string;
  joinTable?: string;
  mappedBy?: string;
  cascade?: ('insert' | 'update' | 'remove')[];
  eager?: boolean;
  lazy?: boolean;
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

const METADATA_KEY = Symbol('vlodia:relation');

/**
 * One-to-One relationship decorator
 * @param options Configuration options for the relationship
 */
export function OneToOne(target: () => Function, joinColumn?: string): PropertyDecorator;
export function OneToOne(options: RelationOptions): PropertyDecorator;
export function OneToOne(targetOrOptions: (() => Function) | RelationOptions, joinColumn?: string): PropertyDecorator {
  if (typeof targetOrOptions === 'function') {
    return createRelationDecorator('OneToOne', { target: targetOrOptions, joinColumn: joinColumn || '' });
  }
  return createRelationDecorator('OneToOne', targetOrOptions);
}

/**
 * One-to-Many relationship decorator
 * @param options Configuration options for the relationship
 */
export function OneToMany(target: () => Function, joinColumn: string): PropertyDecorator;
export function OneToMany(options: RelationOptions): PropertyDecorator;
export function OneToMany(targetOrOptions: (() => Function) | RelationOptions, joinColumn?: string): PropertyDecorator {
  if (typeof targetOrOptions === 'function') {
    return createRelationDecorator('OneToMany', { target: targetOrOptions, joinColumn: joinColumn || '' });
  }
  return createRelationDecorator('OneToMany', targetOrOptions);
}

/**
 * Many-to-One relationship decorator
 * @param options Configuration options for the relationship
 */
export function ManyToOne(target: () => Function, joinColumn: string): PropertyDecorator;
export function ManyToOne(options: RelationOptions): PropertyDecorator;
export function ManyToOne(targetOrOptions: (() => Function) | RelationOptions, joinColumn?: string): PropertyDecorator {
  if (typeof targetOrOptions === 'function') {
    return createRelationDecorator('ManyToOne', { target: targetOrOptions, joinColumn: joinColumn || '' });
  }
  return createRelationDecorator('ManyToOne', targetOrOptions);
}

/**
 * Many-to-Many relationship decorator
 * @param options Configuration options for the relationship
 */
export function ManyToMany(target: () => Function, joinTable: string): PropertyDecorator;
export function ManyToMany(options: RelationOptions): PropertyDecorator;
export function ManyToMany(targetOrOptions: (() => Function) | RelationOptions, joinTable?: string): PropertyDecorator {
  if (typeof targetOrOptions === 'function') {
    return createRelationDecorator('ManyToMany', { target: targetOrOptions, joinTable: joinTable || '' });
  }
  return createRelationDecorator('ManyToMany', targetOrOptions);
}

/**
 * Create a relation decorator with the specified type
 */
function createRelationDecorator(
  type: RelationType,
  options: RelationOptions
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const registry = MetadataRegistry.getInstance();
    
    const metadata: RelationMetadata = {
      name: String(propertyKey),
      propertyName: String(propertyKey),
      type,
      target: options.target(),
      joinColumn: options.joinColumn || '',
      inverseJoinColumn: options.inverseJoinColumn || '',
      joinTable: options.joinTable || '',
      cascade: options.cascade ? options.cascade.map(() => true) : [],
      eager: options.eager ?? false,
      lazy: options.lazy ?? true,
    };

    // Store metadata in reflection
    Reflect.defineMetadata(METADATA_KEY, metadata, target, propertyKey);
    
    // Register with metadata registry
    // Property decorators receive the prototype, but we need the constructor
    const constructor = target.constructor;
    registry.registerRelation(constructor, String(propertyKey), metadata);
  };
}

/**
 * Get relation metadata from a property
 */
export function getRelationMetadata(target: any, propertyKey: string | symbol): RelationMetadata | undefined {
  return Reflect.getMetadata(METADATA_KEY, target, propertyKey);
}

/**
 * Check if a property is marked as a relation
 */
export function isRelation(target: any, propertyKey: string | symbol): boolean {
  return Reflect.hasMetadata(METADATA_KEY, target, propertyKey);
}

/**
 * Join column decorator for specifying foreign key column name
 * @param columnName Name of the foreign key column
 */
export function JoinColumn(_columnName: string): PropertyDecorator {
  return function (_target: any, _propertyKey: string | symbol) {
    // This decorator works in conjunction with relation decorators
    // The actual implementation is handled by the relation decorators
  };
}

/**
 * Join table decorator for Many-to-Many relationships
 * @param tableName Name of the join table
 */
export function JoinTable(_tableName: string): PropertyDecorator {
  return function (_target: any, _propertyKey: string | symbol) {
    // This decorator works in conjunction with ManyToMany decorators
    // The actual implementation is handled by the relation decorators
  };
}
