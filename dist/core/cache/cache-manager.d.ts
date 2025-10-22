/**
 * Cache Manager
 * Multi-level caching system with L1 Identity Map and L2 external cache
 * Provides intelligent cache invalidation and performance optimization
 */
import { Logger } from '@/types';
export interface CacheConfig {
    enabled: boolean;
    type: 'memory' | 'redis';
    ttl: number;
    maxSize: number;
    redis?: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    };
}
export interface CacheEntry<T = any> {
    value: T;
    timestamp: number;
    ttl: number;
    tags: string[];
}
export declare class CacheManager {
    private l1Cache;
    private l2Cache;
    private config;
    private logger;
    private invalidationQueue;
    private metadataRegistry;
    constructor(config: CacheConfig, logger: Logger);
    /**
     * Initialize cache system
     */
    initialize(): Promise<void>;
    /**
     * Get value from cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set value in cache
     */
    set<T>(key: string, value: T, ttl?: number, tags?: string[]): Promise<void>;
    /**
     * Delete value from cache
     */
    del(key: string): Promise<void>;
    /**
     * Invalidate cache by tags
     */
    invalidateByTags(tags: string[]): Promise<void>;
    /**
     * Invalidate cache by pattern
     */
    invalidateByPattern(pattern: string): Promise<void>;
    /**
     * Clear all cache
     */
    clear(): Promise<void>;
    /**
     * Get cache statistics
     */
    getStats(): {
        l1Size: number;
        l2Enabled: boolean;
        hitRate: number;
        memoryUsage: number;
    };
    /**
     * Generate cache key for entity
     */
    generateEntityKey<T>(entityClass: new () => T, id: any): string;
    /**
     * Generate cache key for query
     */
    generateQueryKey<T>(entityClass: new () => T, query: any): string;
    /**
     * Generate cache tags for entity
     */
    generateEntityTags<T>(entityClass: new () => T): string[];
    /**
     * Set L1 cache entry
     */
    private setL1Entry;
    /**
     * Check if cache entry is expired
     */
    private isExpired;
    /**
     * Evict oldest cache entry
     */
    private evictOldestEntry;
    /**
     * Initialize Redis cache
     */
    private initializeRedisCache;
    /**
     * Hash query for cache key
     */
    private hashQuery;
    /**
     * Cleanup expired entries
     */
    private cleanupExpiredEntries;
    /**
     * Start cleanup interval
     */
    startCleanupInterval(intervalMs?: number): void;
    /**
     * Add key to invalidation queue
     */
    private addToInvalidationQueue;
    /**
     * Process invalidation queue
     */
    private processInvalidationQueue;
    /**
     * Invalidate related entity caches
     */
    invalidateEntityCaches<T>(entityClass: new () => T, entityId: any): Promise<void>;
}
//# sourceMappingURL=cache-manager.d.ts.map