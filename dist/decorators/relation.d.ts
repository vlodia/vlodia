/**
 * Relation Decorators
 * Provides decorators for defining entity relationships with type safety
 * Supports OneToOne, OneToMany, ManyToOne, and ManyToMany relationships
 */
import 'reflect-metadata';
import { RelationMetadata } from '../types';
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
/**
 * One-to-One relationship decorator
 * @param options Configuration options for the relationship
 */
export declare function OneToOne(target: () => Function, joinColumn?: string): PropertyDecorator;
export declare function OneToOne(options: RelationOptions): PropertyDecorator;
/**
 * One-to-Many relationship decorator
 * @param options Configuration options for the relationship
 */
export declare function OneToMany(target: () => Function, joinColumn: string): PropertyDecorator;
export declare function OneToMany(options: RelationOptions): PropertyDecorator;
/**
 * Many-to-One relationship decorator
 * @param options Configuration options for the relationship
 */
export declare function ManyToOne(target: () => Function, joinColumn: string): PropertyDecorator;
export declare function ManyToOne(options: RelationOptions): PropertyDecorator;
/**
 * Many-to-Many relationship decorator
 * @param options Configuration options for the relationship
 */
export declare function ManyToMany(target: () => Function, joinTable: string): PropertyDecorator;
export declare function ManyToMany(options: RelationOptions): PropertyDecorator;
/**
 * Get relation metadata from a property
 */
export declare function getRelationMetadata(target: any, propertyKey: string | symbol): RelationMetadata | undefined;
/**
 * Check if a property is marked as a relation
 */
export declare function isRelation(target: any, propertyKey: string | symbol): boolean;
/**
 * Join column decorator for specifying foreign key column name
 * @param columnName Name of the foreign key column
 */
export declare function JoinColumn(_columnName: string): PropertyDecorator;
/**
 * Join table decorator for Many-to-Many relationships
 * @param tableName Name of the join table
 */
export declare function JoinTable(_tableName: string): PropertyDecorator;
//# sourceMappingURL=relation.d.ts.map