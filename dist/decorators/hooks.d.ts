/**
 * Lifecycle Hook Decorators
 * Provides decorators for entity lifecycle events with automatic execution
 * Supports before/after operations for insert, update, and remove operations
 */
import 'reflect-metadata';
import { HookMetadata } from '../types';
export type HookType = 'beforeInsert' | 'afterInsert' | 'beforeUpdate' | 'afterUpdate' | 'beforeRemove' | 'afterRemove';
/**
 * Before insert hook decorator
 * Executes before entity is inserted into database
 */
export declare function BeforeInsert(): MethodDecorator;
/**
 * After insert hook decorator
 * Executes after entity is inserted into database
 */
export declare function AfterInsert(): MethodDecorator;
/**
 * Before update hook decorator
 * Executes before entity is updated in database
 */
export declare function BeforeUpdate(): MethodDecorator;
/**
 * After update hook decorator
 * Executes after entity is updated in database
 */
export declare function AfterUpdate(): MethodDecorator;
/**
 * Before remove hook decorator
 * Executes before entity is removed from database
 */
export declare function BeforeRemove(): MethodDecorator;
/**
 * After remove hook decorator
 * Executes after entity is removed from database
 */
export declare function AfterRemove(): MethodDecorator;
/**
 * Get hook metadata from a method
 */
export declare function getHookMetadata(target: any, propertyKey: string | symbol): HookMetadata | undefined;
/**
 * Check if a method is marked as a hook
 */
export declare function isHook(target: any, propertyKey: string | symbol): boolean;
/**
 * Get all hooks for a specific type
 */
export declare function getHooksByType<T>(target: new () => T, type: HookType): HookMetadata[];
//# sourceMappingURL=hooks.d.ts.map