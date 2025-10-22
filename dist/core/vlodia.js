"use strict";
/**
 * Vlodia ORM Main Class
 * Central orchestrator for the ORM providing initialization, configuration, and high-level APIs
 * Implements the main entry point for database operations and entity management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vlodia = void 0;
require("reflect-metadata");
const metadata_registry_1 = require("./metadata-registry");
const entity_manager_1 = require("./entity-manager");
const adapters_1 = require("../adapters");
const websocket_manager_1 = require("./realtime/websocket-manager");
const schema_generator_1 = require("./graphql/schema-generator");
const query_analyzer_1 = require("./performance/query-analyzer");
const schema_designer_1 = require("./visual/schema-designer");
const tenant_manager_1 = require("./tenancy/tenant-manager");
class Vlodia {
    config;
    adapter;
    entityManager;
    metadataRegistry;
    logger;
    eventBus;
    cache = null;
    isInitialized = false;
    // New features
    webSocketManager = null;
    graphqlGenerator = null;
    queryAnalyzer = null;
    schemaDesigner = null;
    tenantManager = null;
    constructor(config) {
        this.config = config;
        this.metadataRegistry = metadata_registry_1.MetadataRegistry.getInstance();
        this.adapter = (0, adapters_1.createAdapter)(config.database);
        this.entityManager = new entity_manager_1.EntityManager({ adapter: this.adapter });
        this.logger = this.createLogger();
        this.eventBus = this.createEventBus();
    }
    /**
     * Connect to database
     */
    async connect() {
        await this.adapter.connect();
        this.isInitialized = true;
    }
    /**
     * Initialize the ORM
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            await this.adapter.connect();
            this.logger.info('Database connected successfully');
            // Initialize new features
            await this.initializeNewFeatures();
            this.registerEntities();
            this.logger.info(`Registered ${this.config.entities.length} entities`);
            if (this.config.cache?.enabled) {
                await this.initializeCache();
                this.logger.info('Cache initialized successfully');
            }
            this.eventBus.emit('initialized', { entities: this.config.entities.length });
            this.isInitialized = true;
            this.logger.info('Vlodia ORM initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Vlodia ORM', { error });
            throw error;
        }
    }
    /**
     * Initialize new features
     */
    async initializeNewFeatures() {
        // Initialize WebSocket Manager
        if (this.config.realtime?.enabled) {
            /**
             * Ensure correct EventBus implementation is provided to WebSocketManager.
             * Cast is required if config eventBus types diverge across modules.
             * All dependencies are explicitly passed.
             */
            this.webSocketManager = new websocket_manager_1.WebSocketManager(this.config.realtime, this.eventBus, this.logger);
            await this.webSocketManager.initialize();
            this.logger.info('WebSocket Manager initialized');
        }
        // Initialize GraphQL Schema Generator
        if (this.config.graphql?.enabled) {
            this.graphqlGenerator = new schema_generator_1.GraphQLSchemaGenerator(this.config.graphql);
            this.logger.info('GraphQL Schema Generator initialized');
        }
        // Initialize Query Analyzer
        this.queryAnalyzer = new query_analyzer_1.QueryAnalyzer(this.logger);
        this.logger.info('Query Analyzer initialized');
        // Initialize Schema Designer
        this.schemaDesigner = new schema_designer_1.SchemaDesigner({
            theme: 'light',
            layout: 'hierarchical',
            showTypes: true,
            showRelations: true,
            showConstraints: true,
            autoLayout: true,
        });
        this.logger.info('Schema Designer initialized');
        // Initialize Tenant Manager
        if (this.config.tenancy?.enabled) {
            this.tenantManager = new tenant_manager_1.TenantManager(this.entityManager, this.logger);
            await this.tenantManager.initialize();
            this.logger.info('Tenant Manager initialized');
        }
    }
    /**
     * Close the ORM and cleanup resources
     */
    async close() {
        if (!this.isInitialized) {
            return;
        }
        try {
            // Close new features
            if (this.webSocketManager) {
                await this.webSocketManager.close();
            }
            this.entityManager.clear();
            if (this.cache) {
                await this.cache.clear();
            }
            await this.adapter.disconnect();
            this.logger.info('Database disconnected successfully');
            this.eventBus.emit('closed');
            this.isInitialized = false;
            this.logger.info('Vlodia ORM closed successfully');
        }
        catch (error) {
            this.logger.error('Failed to close Vlodia ORM', { error });
            throw error;
        }
    }
    // ===== NEW FEATURES API =====
    /**
     * Get WebSocket Manager for real-time features
     */
    getWebSocketManager() {
        return this.webSocketManager;
    }
    /**
     * Get GraphQL Schema Generator
     */
    getGraphQLGenerator() {
        return this.graphqlGenerator;
    }
    /**
     * Get Query Analyzer for performance monitoring
     */
    getQueryAnalyzer() {
        return this.queryAnalyzer;
    }
    /**
     * Get Schema Designer for visual schema management
     */
    getSchemaDesigner() {
        return this.schemaDesigner;
    }
    /**
     * Get Tenant Manager for multi-tenancy
     */
    getTenantManager() {
        return this.tenantManager;
    }
    /**
     * Generate GraphQL schema
     */
    generateGraphQLSchema() {
        if (!this.graphqlGenerator) {
            throw new Error('GraphQL is not enabled');
        }
        return this.graphqlGenerator.generateSchema();
    }
    /**
     * Generate visual schema diagram
     */
    generateSchemaDiagram() {
        if (!this.schemaDesigner) {
            throw new Error('Schema Designer is not initialized');
        }
        return this.schemaDesigner.generateSchemaDiagram();
    }
    /**
     * Analyze query performance
     */
    analyzeQuery(sql, executionTime, rowCount) {
        if (!this.queryAnalyzer) {
            throw new Error('Query Analyzer is not initialized');
        }
        return this.queryAnalyzer.analyzeQuery(sql, executionTime, rowCount);
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        if (!this.queryAnalyzer) {
            throw new Error('Query Analyzer is not initialized');
        }
        return this.queryAnalyzer.getPerformanceMetrics();
    }
    /**
     * Get entity manager for database operations
     */
    get manager() {
        if (!this.isInitialized) {
            throw new Error('Vlodia ORM not initialized');
        }
        return this.entityManager;
    }
    /**
     * Get metadata registry
     */
    get metadata() {
        return this.metadataRegistry;
    }
    /**
     * Get logger instance
     */
    get log() {
        return this.logger;
    }
    /**
     * Get event bus instance
     */
    get events() {
        return this.eventBus;
    }
    /**
     * Get cache instance
     */
    get cacheInstance() {
        return this.cache;
    }
    /**
     * Execute a transaction
     */
    async transaction(callback) {
        if (!this.isInitialized) {
            throw new Error('Vlodia ORM not initialized');
        }
        const transaction = await this.adapter.begin();
        const transactionManager = new entity_manager_1.EntityManager({
            adapter: this.adapter,
            transaction,
        });
        try {
            this.eventBus.emit('transaction:start', { transactionId: transaction.id });
            const result = await callback(transactionManager);
            await this.adapter.commit(transaction);
            this.eventBus.emit('transaction:commit', { transactionId: transaction.id });
            return result;
        }
        catch (error) {
            await this.adapter.rollback(transaction);
            this.eventBus.emit('transaction:rollback', { transactionId: transaction.id, error });
            throw error;
        }
    }
    /**
     * Execute a nested transaction with savepoint
     */
    async savepoint(callback) {
        if (!this.isInitialized) {
            throw new Error('Vlodia ORM not initialized');
        }
        const currentTransaction = this.entityManager.getCurrentTransaction();
        if (!currentTransaction) {
            throw new Error('No active transaction for savepoint');
        }
        const savepointName = `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.adapter.savepoint(currentTransaction, savepointName);
        const transactionManager = new entity_manager_1.EntityManager({
            adapter: this.adapter,
            transaction: currentTransaction,
        });
        try {
            this.eventBus.emit('savepoint:start', { savepointName });
            const result = await callback(transactionManager);
            await this.adapter.releaseSavepoint(currentTransaction, savepointName);
            this.eventBus.emit('savepoint:release', { savepointName });
            return result;
        }
        catch (error) {
            await this.adapter.rollbackToSavepoint(currentTransaction, savepointName);
            this.eventBus.emit('savepoint:rollback', { savepointName, error });
            throw error;
        }
    }
    /**
     * Check if ORM is initialized
     */
    get initialized() {
        return this.isInitialized;
    }
    /**
     * Get configuration
     */
    get configuration() {
        return this.config;
    }
    /**
     * Register entities with metadata registry
     */
    registerEntities() {
        for (const entityClass of this.config.entities) {
            if (!this.metadataRegistry.hasEntity(entityClass)) {
                throw new Error(`Entity ${entityClass.name} not properly decorated with @Entity`);
            }
        }
    }
    /**
     * Initialize cache system
     */
    async initializeCache() {
        if (!this.config.cache?.enabled) {
            return;
        }
        this.cache = {
            get: async (_key) => {
                return null;
            },
            set: async (_key, _value, _ttl) => { },
            del: async (_key) => { },
            clear: async () => { },
        };
    }
    /**
     * Create logger instance
     */
    createLogger() {
        const level = this.config.logging?.level || 'info';
        return {
            error: (message, meta) => {
                if (level === 'error' || level === 'warn' || level === 'info' || level === 'debug') {
                    console.error(`[ERROR] ${message}`, meta || '');
                }
            },
            warn: (message, meta) => {
                if (level === 'warn' || level === 'info' || level === 'debug') {
                    console.warn(`[WARN] ${message}`, meta || '');
                }
            },
            info: (message, meta) => {
                if (level === 'info' || level === 'debug') {
                    console.info(`[INFO] ${message}`, meta || '');
                }
            },
            debug: (message, meta) => {
                if (level === 'debug') {
                    console.debug(`[DEBUG] ${message}`, meta || '');
                }
            },
        };
    }
    /**
     * Create event bus instance
     */
    createEventBus() {
        const handlers = new Map();
        return {
            emit: (event, data) => {
                const eventHandlers = handlers.get(event);
                if (eventHandlers) {
                    for (const handler of eventHandlers) {
                        try {
                            handler(data);
                        }
                        catch (error) {
                            this.logger.error(`Event handler error for ${event}`, { error });
                        }
                    }
                }
            },
            on: (event, handler) => {
                if (!handlers.has(event)) {
                    handlers.set(event, new Set());
                }
                handlers.get(event).add(handler);
            },
            off: (event, handler) => {
                const eventHandlers = handlers.get(event);
                if (eventHandlers) {
                    eventHandlers.delete(handler);
                }
            },
        };
    }
}
exports.Vlodia = Vlodia;
//# sourceMappingURL=vlodia.js.map