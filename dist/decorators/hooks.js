"use strict";
/**
 * Lifecycle Hook Decorators
 * Provides decorators for entity lifecycle events with automatic execution
 * Supports before/after operations for insert, update, and remove operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHooksByType = exports.isHook = exports.getHookMetadata = exports.AfterRemove = exports.BeforeRemove = exports.AfterUpdate = exports.BeforeUpdate = exports.AfterInsert = exports.BeforeInsert = void 0;
require("reflect-metadata");
const metadata_registry_1 = require("../core/metadata-registry");
const METADATA_KEY = Symbol('nythera:hook');
/**
 * Before insert hook decorator
 * Executes before entity is inserted into database
 */
function BeforeInsert() {
    return createHookDecorator('beforeInsert');
}
exports.BeforeInsert = BeforeInsert;
/**
 * After insert hook decorator
 * Executes after entity is inserted into database
 */
function AfterInsert() {
    return createHookDecorator('afterInsert');
}
exports.AfterInsert = AfterInsert;
/**
 * Before update hook decorator
 * Executes before entity is updated in database
 */
function BeforeUpdate() {
    return createHookDecorator('beforeUpdate');
}
exports.BeforeUpdate = BeforeUpdate;
/**
 * After update hook decorator
 * Executes after entity is updated in database
 */
function AfterUpdate() {
    return createHookDecorator('afterUpdate');
}
exports.AfterUpdate = AfterUpdate;
/**
 * Before remove hook decorator
 * Executes before entity is removed from database
 */
function BeforeRemove() {
    return createHookDecorator('beforeRemove');
}
exports.BeforeRemove = BeforeRemove;
/**
 * After remove hook decorator
 * Executes after entity is removed from database
 */
function AfterRemove() {
    return createHookDecorator('afterRemove');
}
exports.AfterRemove = AfterRemove;
/**
 * Create a hook decorator with the specified type
 */
function createHookDecorator(type) {
    return function (target, propertyKey, descriptor) {
        const registry = metadata_registry_1.MetadataRegistry.getInstance();
        const metadata = {
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
function getHookMetadata(target, propertyKey) {
    return Reflect.getMetadata(METADATA_KEY, target, propertyKey);
}
exports.getHookMetadata = getHookMetadata;
/**
 * Check if a method is marked as a hook
 */
function isHook(target, propertyKey) {
    return Reflect.hasMetadata(METADATA_KEY, target, propertyKey);
}
exports.isHook = isHook;
/**
 * Get all hooks for a specific type
 */
function getHooksByType(target, type) {
    const registry = metadata_registry_1.MetadataRegistry.getInstance();
    const allHooks = registry.getHooks(target);
    return allHooks.filter(hook => hook.type === type);
}
exports.getHooksByType = getHooksByType;
//# sourceMappingURL=hooks.js.map