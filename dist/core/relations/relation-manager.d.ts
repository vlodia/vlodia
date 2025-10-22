/**
 * Relation Manager
 * Advanced relationship loading and management with lazy/eager loading
 * Provides intelligent relationship resolution with performance optimization
 */
import { EntityManager } from '../entity-manager';
import { QueryOptions } from '@/types';
export interface RelationLoadOptions {
    eager?: boolean;
    lazy?: boolean;
    cascade?: boolean;
    depth?: number;
}
export interface RelationQueryOptions extends QueryOptions {
    relations?: string[];
    loadStrategy?: 'eager' | 'lazy' | 'mixed';
}
export declare class RelationManager {
    private entityManager;
    private metadataRegistry;
    private loadedRelations;
    private logger?;
    constructor(entityManager: EntityManager);
    /**
     * Load relations for entities
     */
    loadRelations<T>(entities: T[], relations: string[], options?: RelationLoadOptions): Promise<T[]>;
    /**
     * Load relations for a single entity
     */
    loadRelationsForEntity<T>(entity: T, relations: string[], options?: RelationLoadOptions): Promise<T>;
    /**
     * Load relation for entities
     */
    private loadRelation;
    /**
     * Load OneToOne relation
     */
    private loadOneToOneRelation;
    /**
     * Load OneToMany relation
     */
    private loadOneToManyRelation;
    /**
     * Load ManyToOne relation
     */
    private loadManyToOneRelation;
    /**
     * Load ManyToMany relation
     */
    private loadManyToManyRelation;
    /**
     * Get relation metadatas for entity
     */
    private getRelationMetadatas;
    /**
     * Check if relation is loaded
     */
    isRelationLoaded<T>(entity: T, relationName: string): boolean;
    /**
     * Mark relation as loaded
     */
    markRelationLoaded<T>(entity: T, relationName: string): void;
    /**
     * Clear loaded relations
     */
    clearLoadedRelations(): void;
    /**
     * Get loaded relations count
     */
    getLoadedRelationsCount(): number;
    /**
     * Preload relations for entities
     */
    preloadRelations<T>(entities: T[], relations: string[], options?: RelationLoadOptions): Promise<T[]>;
    /**
     * Load relations with batching
     */
    loadRelationsBatched<T>(entities: T[], relations: string[], batchSize?: number, options?: RelationLoadOptions): Promise<T[]>;
    /**
     * Chunk array into batches
     */
    private chunkArray;
}
//# sourceMappingURL=relation-manager.d.ts.map