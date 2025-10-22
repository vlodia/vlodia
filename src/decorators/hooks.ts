/**
 * Lifecycle Hook Decorators
 * Provides decorators for entity lifecycle events with automatic execution
 * Supports before/after operations for insert, update, and remove operations
 */

import 'reflect-metadata';
import { MetadataRegistry } from '../core/metadata-registry';
import { HookMetadata } from '../types';

export type HookType =
  | 'beforeInsert'
  | 'afterInsert'
  | 'beforeUpdate'
  | 'afterUpdate'
  | 'beforeRemove'
  | 'afterRemove';

const METADATA_KEY = Symbol('nythera:hook');

/**
 * Before insert hook decorator
 * Executes before entity is inserted into database
 */
export function BeforeInsert(): MethodDecorator {
  return createHookDecorator('beforeInsert');
}

/**
 * After insert hook decorator
 * Executes after entity is inserted into database
 */
export function AfterInsert(): MethodDecorator {
  return createHookDecorator('afterInsert');
}

/**
 * Before update hook decorator
 * Executes before entity is updated in database
 */
export function BeforeUpdate(): MethodDecorator {
  return createHookDecorator('beforeUpdate');
}

/**
 * After update hook decorator
 * Executes after entity is updated in database
 */
export function AfterUpdate(): MethodDecorator {
  return createHookDecorator('afterUpdate');
}

/**
 * Before remove hook decorator
 * Executes before entity is removed from database
 */
export function BeforeRemove(): MethodDecorator {
  return createHookDecorator('beforeRemove');
}

/**
 * After remove hook decorator
 * Executes after entity is removed from database
 */
export function AfterRemove(): MethodDecorator {
  return createHookDecorator('afterRemove');
}

/**
 * Create a hook decorator with the specified type
 */
function createHookDecorator(type: HookType): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const registry = MetadataRegistry.getInstance();

    const metadata: HookMetadata = {
      name: String(propertyKey),
      propertyName: String(propertyKey),
      type,
      method: String(propertyKey),
    };

    // Store metadata in reflection
    Reflect.defineMetadata(METADATA_KEY, metadata, target, propertyKey);

    // Register with metadata registry
    // Method decorators receive the prototype, but we need the constructor
    const constructor = target.constructor;
    registry.registerHook(constructor, String(propertyKey), metadata);

    return descriptor;
  };
}

/**
 * Get hook metadata from a method
 */
export function getHookMetadata(
  target: any,
  propertyKey: string | symbol
): HookMetadata | undefined {
  return Reflect.getMetadata(METADATA_KEY, target, propertyKey);
}

/**
 * Check if a method is marked as a hook
 */
export function isHook(target: any, propertyKey: string | symbol): boolean {
  return Reflect.hasMetadata(METADATA_KEY, target, propertyKey);
}

/**
 * Get all hooks for a specific type
 */
export function getHooksByType<T>(target: new () => T, type: HookType): HookMetadata[] {
  const registry = MetadataRegistry.getInstance();
  const allHooks = registry.getHooks(target);
  return allHooks.filter(hook => hook.type === type);
}
