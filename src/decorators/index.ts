/**
 * Decorators Index
 * Central export point for all Nythera decorators
 * Provides a clean API for entity definition and metadata management
 */

// Entity decorators
export { Entity, getEntityMetadata, isEntity } from './entity';

// Column decorators
export {
  Column,
  PrimaryKey,
  Generated,
  Unique,
  NotNull,
  getColumnMetadata,
  isColumn,
} from './column';

// Relation decorators
export {
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  getRelationMetadata,
  isRelation,
} from './relation';

// Hook decorators
export {
  BeforeInsert,
  AfterInsert,
  BeforeUpdate,
  AfterUpdate,
  BeforeRemove,
  AfterRemove,
  getHookMetadata,
  isHook,
  getHooksByType,
} from './hooks';
