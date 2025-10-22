/**
 * Cache Manager
 * Multi-level caching system with L1 Identity Map and L2 external cache
 * Provides intelligent cache invalidation and performance optimization
 */

import { Cache, Logger } from '@/types';
import { MetadataRegistry } from '../metadata-registry';

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

export class CacheManager {
  private l1Cache = new Map<string, CacheEntry>();
  private l2Cache: Cache | null = null;
  private config: CacheConfig;
  private logger: Logger;
  private invalidationQueue = new Set<string>();
  private metadataRegistry: MetadataRegistry;

  constructor(config: CacheConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.metadataRegistry = MetadataRegistry.getInstance();
  }

  /**
   * Initialize cache system
   */
  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    if (this.config.type === 'redis') {
      await this.initializeRedisCache();
    }

    this.logger.info('Cache system initialized', { type: this.config.type });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.config.enabled) {
      return null;
    }

    // Check L1 cache first
    const l1Entry = this.l1Cache.get(key);
    if (l1Entry && !this.isExpired(l1Entry)) {
      this.logger.debug('Cache hit (L1)', { key });
      return l1Entry.value as T;
    }

    // Check L2 cache if available
    if (this.l2Cache) {
      const l2Value = await this.l2Cache.get<T>(key);
      if (l2Value) {
        // Store in L1 cache
        this.setL1Entry(key, l2Value, this.config.ttl);
        this.logger.debug('Cache hit (L2)', { key });
        return l2Value;
      }
    }

    this.logger.debug('Cache miss', { key });
    return null;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number, tags?: string[]): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const cacheTTL = ttl || this.config.ttl;
    const cacheTags = tags || [];

    // Store in L1 cache
    this.setL1Entry(key, value, cacheTTL, cacheTags);

    // Store in L2 cache if available
    if (this.l2Cache) {
      await this.l2Cache.set(key, value, cacheTTL);
    }

    this.logger.debug('Cache set', { key, ttl: cacheTTL, tags: cacheTags });
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Remove from L1 cache
    this.l1Cache.delete(key);

    // Remove from L2 cache if available
    if (this.l2Cache) {
      await this.l2Cache.del(key);
    }

    this.logger.debug('Cache delete', { key });
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const keysToInvalidate: string[] = [];

    // Find keys with matching tags in L1 cache
    for (const [key, entry] of this.l1Cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        keysToInvalidate.push(key);
      }
    }

    // Remove from L1 cache
    for (const key of keysToInvalidate) {
      this.l1Cache.delete(key);
    }

    // Invalidate in L2 cache if available
    if (this.l2Cache) {
      for (const key of keysToInvalidate) {
        await this.l2Cache.del(key);
      }
    }

    this.logger.debug('Cache invalidated by tags', { tags, keys: keysToInvalidate.length });
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const regex = new RegExp(pattern);
    const keysToInvalidate: string[] = [];

    // Find matching keys in L1 cache
    for (const key of this.l1Cache.keys()) {
      if (regex.test(key)) {
        keysToInvalidate.push(key);
      }
    }

    // Remove from L1 cache
    for (const key of keysToInvalidate) {
      this.l1Cache.delete(key);
    }

    // Invalidate in L2 cache if available
    if (this.l2Cache) {
      for (const key of keysToInvalidate) {
        await this.l2Cache.del(key);
      }
    }

    this.logger.debug('Cache invalidated by pattern', { pattern, keys: keysToInvalidate.length });
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Clear L1 cache
    this.l1Cache.clear();

    // Clear L2 cache if available
    if (this.l2Cache) {
      await this.l2Cache.clear();
    }

    this.logger.debug('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    l1Size: number;
    l2Enabled: boolean;
    hitRate: number;
    memoryUsage: number;
  } {
    const l1Size = this.l1Cache.size;
    const l2Enabled = this.l2Cache !== null;
    
    // Calculate memory usage (approximate)
    let memoryUsage = 0;
    for (const entry of this.l1Cache.values()) {
      memoryUsage += JSON.stringify(entry).length;
    }

    return {
      l1Size,
      l2Enabled,
      hitRate: 0, // Would need to track hits/misses
      memoryUsage,
    };
  }

  /**
   * Generate cache key for entity
   */
  generateEntityKey<T>(entityClass: new () => T, id: any): string {
    return `entity:${entityClass.name}:${id}`;
  }

  /**
   * Generate cache key for query
   */
  generateQueryKey<T>(entityClass: new () => T, query: any): string {
    const queryHash = this.hashQuery(query);
    return `query:${entityClass.name}:${queryHash}`;
  }

  /**
   * Generate cache tags for entity
   */
  generateEntityTags<T>(entityClass: new () => T): string[] {
    return [`entity:${entityClass.name}`, `table:${entityClass.name.toLowerCase()}`];
  }

  /**
   * Set L1 cache entry
   */
  private setL1Entry<T>(key: string, value: T, ttl: number, tags: string[] = []): void {
    // Check cache size limit
    if (this.l1Cache.size >= this.config.maxSize) {
      this.evictOldestEntry();
    }

    this.l1Cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      tags,
    });
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl * 1000;
  }

  /**
   * Evict oldest cache entry
   */
  private evictOldestEntry(): void {
    let oldestKey = '';
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.l1Cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.l1Cache.delete(oldestKey);
    }
  }

  /**
   * Initialize Redis cache
   */
  private async initializeRedisCache(): Promise<void> {
    // Redis implementation would go here
    // For now, we'll create a mock implementation
    this.l2Cache = {
      get: async <T>(_key: string): Promise<T | null> => {
        return null;
      },
      set: async <T>(_key: string, _value: T, _ttl?: number): Promise<void> => {
      },
      del: async (_key: string): Promise<void> => {
      },
      clear: async (): Promise<void> => {
      },
    };
  }

  /**
   * Hash query for cache key
   */
  private hashQuery(query: any): string {
    const queryString = JSON.stringify(query);
    let hash = 0;
    for (let i = 0; i < queryString.length; i++) {
      const char = queryString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Cleanup expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.l1Cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.l1Cache.delete(key);
    }

    if (expiredKeys.length > 0) {
      this.logger.debug('Cleaned up expired cache entries', { count: expiredKeys.length });
    }
  }

  /**
   * Start cleanup interval
   */
  startCleanupInterval(intervalMs: number = 60000): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
      this.processInvalidationQueue();
    }, intervalMs);
  }

  /**
   * Add key to invalidation queue
   */
  private addToInvalidationQueue(key: string): void {
    this.invalidationQueue.add(key);
  }

  /**
   * Process invalidation queue
   */
  private async processInvalidationQueue(): Promise<void> {
    if (this.invalidationQueue.size === 0) {
      return;
    }

    const keysToInvalidate = Array.from(this.invalidationQueue);
    this.invalidationQueue.clear();

    for (const key of keysToInvalidate) {
      await this.del(key);
    }

    this.logger.debug('Processed invalidation queue', { count: keysToInvalidate.length });
  }

  /**
   * Invalidate related entity caches
   */
  async invalidateEntityCaches<T>(entityClass: new () => T, entityId: any): Promise<void> {
    const entityKey = this.generateEntityKey(entityClass, entityId);
    const queryPattern = `query:${entityClass.name}:*`;
    
    // Add to invalidation queue
    this.addToInvalidationQueue(entityKey);
    
    // Invalidate by pattern
    await this.invalidateByPattern(queryPattern);
    
    // Get entity metadata for related entities
    const entityMetadata = this.metadataRegistry.getEntity(entityClass);
    if (entityMetadata) {
      const relatedTags = this.generateEntityTags(entityClass);
      await this.invalidateByTags(relatedTags);
    }
  }
}
