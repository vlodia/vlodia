/**
 * Vlodia ORM Main Class
 * Central orchestrator for the ORM providing initialization, configuration, and high-level APIs
 * Implements the main entry point for database operations and entity management
 */
import 'reflect-metadata';
import { MetadataRegistry } from './metadata-registry';
import { EntityManager } from './entity-manager';
import { VlodiaConfig, Adapter, Logger, EventBus, Cache } from '@/types';
import { WebSocketManager } from './realtime/websocket-manager';
import { GraphQLSchemaGenerator } from './graphql/schema-generator';
import { QueryAnalyzer } from './performance/query-analyzer';
import { SchemaDesigner } from './visual/schema-designer';
import { TenantManager } from './tenancy/tenant-manager';
export declare class Vlodia {
    private config;
    adapter: Adapter;
    private entityManager;
    private metadataRegistry;
    private logger;
    private eventBus;
    private cache;
    private isInitialized;
    private webSocketManager;
    private graphqlGenerator;
    private queryAnalyzer;
    private schemaDesigner;
    private tenantManager;
    constructor(config: VlodiaConfig);
    /**
     * Connect to database
     */
    connect(): Promise<void>;
    /**
     * Initialize the ORM
     */
    initialize(): Promise<void>;
    /**
     * Initialize new features
     */
    private initializeNewFeatures;
    /**
     * Close the ORM and cleanup resources
     */
    close(): Promise<void>;
    /**
     * Get WebSocket Manager for real-time features
     */
    getWebSocketManager(): WebSocketManager | null;
    /**
     * Get GraphQL Schema Generator
     */
    getGraphQLGenerator(): GraphQLSchemaGenerator | null;
    /**
     * Get Query Analyzer for performance monitoring
     */
    getQueryAnalyzer(): QueryAnalyzer | null;
    /**
     * Get Schema Designer for visual schema management
     */
    getSchemaDesigner(): SchemaDesigner | null;
    /**
     * Get Tenant Manager for multi-tenancy
     */
    getTenantManager(): TenantManager | null;
    /**
     * Generate GraphQL schema
     */
    generateGraphQLSchema(): any;
    /**
     * Generate visual schema diagram
     */
    generateSchemaDiagram(): any;
    /**
     * Analyze query performance
     */
    analyzeQuery(sql: string, executionTime: number, rowCount: number): any;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): any;
    /**
     * Get entity manager for database operations
     */
    get manager(): EntityManager;
    /**
     * Get metadata registry
     */
    get metadata(): MetadataRegistry;
    /**
     * Get logger instance
     */
    get log(): Logger;
    /**
     * Get event bus instance
     */
    get events(): EventBus;
    /**
     * Get cache instance
     */
    get cacheInstance(): Cache | null;
    /**
     * Execute a transaction
     */
    transaction<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T>;
    /**
     * Execute a nested transaction with savepoint
     */
    savepoint<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T>;
    /**
     * Check if ORM is initialized
     */
    get initialized(): boolean;
    /**
     * Get configuration
     */
    get configuration(): VlodiaConfig;
    /**
     * Register entities with metadata registry
     */
    private registerEntities;
    /**
     * Initialize cache system
     */
    private initializeCache;
    /**
     * Create logger instance
     */
    private createLogger;
    /**
     * Create event bus instance
     */
    private createEventBus;
}
//# sourceMappingURL=vlodia.d.ts.map