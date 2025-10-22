/**
 * Decorators Index
 * Central export point for all Nythera decorators
 * Provides a clean API for entity definition and metadata management
 */
export { Entity, getEntityMetadata, isEntity } from './entity';
export { Column, PrimaryKey, Generated, Unique, NotNull, getColumnMetadata, isColumn, } from './column';
export { OneToOne, OneToMany, ManyToOne, ManyToMany, JoinColumn, JoinTable, getRelationMetadata, isRelation, } from './relation';
export { BeforeInsert, AfterInsert, BeforeUpdate, AfterUpdate, BeforeRemove, AfterRemove, getHookMetadata, isHook, getHooksByType, } from './hooks';
//# sourceMappingURL=index.d.ts.map