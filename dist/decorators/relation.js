"use strict";
/**
 * Relation Decorators
 * Provides decorators for defining entity relationships with type safety
 * Supports OneToOne, OneToMany, ManyToOne, and ManyToMany relationships
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinTable = exports.JoinColumn = exports.isRelation = exports.getRelationMetadata = exports.ManyToMany = exports.ManyToOne = exports.OneToMany = exports.OneToOne = void 0;
require("reflect-metadata");
const metadata_registry_1 = require("../core/metadata-registry");
const METADATA_KEY = Symbol('vlodia:relation');
function OneToOne(targetOrOptions, joinColumn) {
    if (typeof targetOrOptions === 'function') {
        return createRelationDecorator('OneToOne', {
            target: targetOrOptions,
            joinColumn: joinColumn || '',
        });
    }
    return createRelationDecorator('OneToOne', targetOrOptions);
}
exports.OneToOne = OneToOne;
function OneToMany(targetOrOptions, joinColumn) {
    if (typeof targetOrOptions === 'function') {
        return createRelationDecorator('OneToMany', {
            target: targetOrOptions,
            joinColumn: joinColumn || '',
        });
    }
    return createRelationDecorator('OneToMany', targetOrOptions);
}
exports.OneToMany = OneToMany;
function ManyToOne(targetOrOptions, joinColumn) {
    if (typeof targetOrOptions === 'function') {
        return createRelationDecorator('ManyToOne', {
            target: targetOrOptions,
            joinColumn: joinColumn || '',
        });
    }
    return createRelationDecorator('ManyToOne', targetOrOptions);
}
exports.ManyToOne = ManyToOne;
function ManyToMany(targetOrOptions, joinTable) {
    if (typeof targetOrOptions === 'function') {
        return createRelationDecorator('ManyToMany', {
            target: targetOrOptions,
            joinTable: joinTable || '',
        });
    }
    return createRelationDecorator('ManyToMany', targetOrOptions);
}
exports.ManyToMany = ManyToMany;
/**
 * Create a relation decorator with the specified type
 */
function createRelationDecorator(type, options) {
    return function (target, propertyKey) {
        const registry = metadata_registry_1.MetadataRegistry.getInstance();
        const metadata = {
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
function getRelationMetadata(target, propertyKey) {
    return Reflect.getMetadata(METADATA_KEY, target, propertyKey);
}
exports.getRelationMetadata = getRelationMetadata;
/**
 * Check if a property is marked as a relation
 */
function isRelation(target, propertyKey) {
    return Reflect.hasMetadata(METADATA_KEY, target, propertyKey);
}
exports.isRelation = isRelation;
/**
 * Join column decorator for specifying foreign key column name
 * @param columnName Name of the foreign key column
 */
function JoinColumn(_columnName) {
    return function (_target, _propertyKey) {
        // This decorator works in conjunction with relation decorators
        // The actual implementation is handled by the relation decorators
    };
}
exports.JoinColumn = JoinColumn;
/**
 * Join table decorator for Many-to-Many relationships
 * @param tableName Name of the join table
 */
function JoinTable(_tableName) {
    return function (_target, _propertyKey) {
        // This decorator works in conjunction with ManyToMany decorators
        // The actual implementation is handled by the relation decorators
    };
}
exports.JoinTable = JoinTable;
//# sourceMappingURL=relation.js.map