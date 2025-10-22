/**
 * Serialization System
 * Entity serialization with circular reference handling
 * Provides toJSON() implementation and metadata removal
 */
export interface SerializationOptions {
    excludeMetadata?: boolean | undefined;
    excludeRelations?: boolean | undefined;
    excludeHooks?: boolean | undefined;
    excludePrivate?: boolean | undefined;
    excludeUndefined?: boolean | undefined;
    excludeNull?: boolean | undefined;
    maxDepth?: number | undefined;
    replacer?: ((key: string, value: any) => any) | undefined;
}
export declare class EntitySerializer {
    private metadataRegistry;
    private visited;
    constructor();
    /**
     * Serialize entity to JSON
     */
    serialize<T>(entity: T, options?: SerializationOptions): any;
    /**
     * Serialize array of entities
     */
    serializeArray<T>(entities: T[], options?: SerializationOptions): any[];
    /**
     * Serialize value with options
     */
    private serializeValue;
    /**
     * Check if property is metadata
     */
    private isMetadataProperty;
    /**
     * Check if property is hook
     */
    private isHookProperty;
    /**
     * Check if property is relation
     */
    private isRelationProperty;
    /**
     * Deserialize JSON to entity
     */
    deserialize<T>(entityClass: new () => T, data: any): T;
    /**
     * Convert value to appropriate type
     */
    private convertValue;
    /**
     * Create entity with toJSON method
     */
    addToJSONMethod<T>(entityClass: new () => T): void;
    /**
     * Remove circular references from object
     */
    removeCircularReferences(obj: any, maxDepth?: number): any;
    /**
     * Clone entity without circular references
     */
    cloneEntity<T>(entity: T): T;
}
//# sourceMappingURL=serializer.d.ts.map