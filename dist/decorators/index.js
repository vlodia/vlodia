"use strict";
/**
 * Decorators Index
 * Central export point for all Nythera decorators
 * Provides a clean API for entity definition and metadata management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHooksByType = exports.isHook = exports.getHookMetadata = exports.AfterRemove = exports.BeforeRemove = exports.AfterUpdate = exports.BeforeUpdate = exports.AfterInsert = exports.BeforeInsert = exports.isRelation = exports.getRelationMetadata = exports.JoinTable = exports.JoinColumn = exports.ManyToMany = exports.ManyToOne = exports.OneToMany = exports.OneToOne = exports.isColumn = exports.getColumnMetadata = exports.NotNull = exports.Unique = exports.Generated = exports.PrimaryKey = exports.Column = exports.isEntity = exports.getEntityMetadata = exports.Entity = void 0;
// Entity decorators
var entity_1 = require("./entity");
Object.defineProperty(exports, "Entity", { enumerable: true, get: function () { return entity_1.Entity; } });
Object.defineProperty(exports, "getEntityMetadata", { enumerable: true, get: function () { return entity_1.getEntityMetadata; } });
Object.defineProperty(exports, "isEntity", { enumerable: true, get: function () { return entity_1.isEntity; } });
// Column decorators
var column_1 = require("./column");
Object.defineProperty(exports, "Column", { enumerable: true, get: function () { return column_1.Column; } });
Object.defineProperty(exports, "PrimaryKey", { enumerable: true, get: function () { return column_1.PrimaryKey; } });
Object.defineProperty(exports, "Generated", { enumerable: true, get: function () { return column_1.Generated; } });
Object.defineProperty(exports, "Unique", { enumerable: true, get: function () { return column_1.Unique; } });
Object.defineProperty(exports, "NotNull", { enumerable: true, get: function () { return column_1.NotNull; } });
Object.defineProperty(exports, "getColumnMetadata", { enumerable: true, get: function () { return column_1.getColumnMetadata; } });
Object.defineProperty(exports, "isColumn", { enumerable: true, get: function () { return column_1.isColumn; } });
// Relation decorators
var relation_1 = require("./relation");
Object.defineProperty(exports, "OneToOne", { enumerable: true, get: function () { return relation_1.OneToOne; } });
Object.defineProperty(exports, "OneToMany", { enumerable: true, get: function () { return relation_1.OneToMany; } });
Object.defineProperty(exports, "ManyToOne", { enumerable: true, get: function () { return relation_1.ManyToOne; } });
Object.defineProperty(exports, "ManyToMany", { enumerable: true, get: function () { return relation_1.ManyToMany; } });
Object.defineProperty(exports, "JoinColumn", { enumerable: true, get: function () { return relation_1.JoinColumn; } });
Object.defineProperty(exports, "JoinTable", { enumerable: true, get: function () { return relation_1.JoinTable; } });
Object.defineProperty(exports, "getRelationMetadata", { enumerable: true, get: function () { return relation_1.getRelationMetadata; } });
Object.defineProperty(exports, "isRelation", { enumerable: true, get: function () { return relation_1.isRelation; } });
// Hook decorators
var hooks_1 = require("./hooks");
Object.defineProperty(exports, "BeforeInsert", { enumerable: true, get: function () { return hooks_1.BeforeInsert; } });
Object.defineProperty(exports, "AfterInsert", { enumerable: true, get: function () { return hooks_1.AfterInsert; } });
Object.defineProperty(exports, "BeforeUpdate", { enumerable: true, get: function () { return hooks_1.BeforeUpdate; } });
Object.defineProperty(exports, "AfterUpdate", { enumerable: true, get: function () { return hooks_1.AfterUpdate; } });
Object.defineProperty(exports, "BeforeRemove", { enumerable: true, get: function () { return hooks_1.BeforeRemove; } });
Object.defineProperty(exports, "AfterRemove", { enumerable: true, get: function () { return hooks_1.AfterRemove; } });
Object.defineProperty(exports, "getHookMetadata", { enumerable: true, get: function () { return hooks_1.getHookMetadata; } });
Object.defineProperty(exports, "isHook", { enumerable: true, get: function () { return hooks_1.isHook; } });
Object.defineProperty(exports, "getHooksByType", { enumerable: true, get: function () { return hooks_1.getHooksByType; } });
//# sourceMappingURL=index.js.map