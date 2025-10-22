/**
 * Vlodia ORM Main Class
 * Central orchestrator for the ORM providing initialization, configuration, and high-level APIs
 * Implements the main entry point for database operations and entity management
 */

import 'reflect-metadata';
import { MetadataRegistry } from './metadata-registry';
import { EntityManager } from './entity-manager';
import { createAdapter } from '../adapters';
import { VlodiaConfig, Adapter, Logger, EventBus, Cache } from '@/types';
import { WebSocketManager } from './realtime/websocket-manager';
import { GraphQLSchemaGenerator } from './graphql/schema-generator';
import { QueryAnalyzer } from './performance/query-analyzer';
import { SchemaDesigner } from './visual/schema-designer';
import { TenantManager } from './tenancy/tenant-manager';

export class Vlodia {
  private config: VlodiaConfig;
  public adapter: Adapter;
  private entityManager: EntityManager;
  private metadataRegistry: MetadataRegistry;
  private logger: Logger;
  private eventBus: EventBus;
  private cache: Cache | null = null;
  private isInitialized = false;

  // New features
  private webSocketManager: WebSocketManager | null = null;
  private graphqlGenerator: GraphQLSchemaGenerator | null = null;
  private queryAnalyzer: QueryAnalyzer | null = null;
  private schemaDesigner: SchemaDesigner | null = null;
  private tenantManager: TenantManager | null = null;

  constructor(config: VlodiaConfig) {
    this.config = config;
    this.metadataRegistry = MetadataRegistry.getInstance();
    this.adapter = createAdapter(config.database);
    this.entityManager = new EntityManager({ adapter: this.adapter });
    this.logger = this.createLogger();
    this.eventBus = this.createEventBus();
  }

  /**
   * Connect to database
   */
  async connect(): Promise<void> {
    await this.adapter.connect();
    this.isInitialized = true;
  }

  /**
   * Initialize the ORM
   */
  async initialize(): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to initialize Vlodia ORM', { error });
      throw error;
    }
  }

  /**
   * Initialize new features
   */
  private async initializeNewFeatures(): Promise<void> {
    // Initialize WebSocket Manager
    if (this.config.realtime?.enabled) {
      /**
       * Ensure correct EventBus implementation is provided to WebSocketManager.
       * Cast is required if config eventBus types diverge across modules.
       * All dependencies are explicitly passed.
       */
      this.webSocketManager = new WebSocketManager(
        this.config.realtime,
        this.eventBus as import('./events/event-bus').EventBus,
        this.logger
      );
      await this.webSocketManager.initialize();
      this.logger.info('WebSocket Manager initialized');
    }

    // Initialize GraphQL Schema Generator
    if (this.config.graphql?.enabled) {
      this.graphqlGenerator = new GraphQLSchemaGenerator(this.config.graphql);
      this.logger.info('GraphQL Schema Generator initialized');
    }

    // Initialize Query Analyzer
    this.queryAnalyzer = new QueryAnalyzer(this.logger);
    this.logger.info('Query Analyzer initialized');

    // Initialize Schema Designer
    this.schemaDesigner = new SchemaDesigner({
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
      this.tenantManager = new TenantManager(this.entityManager, this.logger);
      await this.tenantManager.initialize();
      this.logger.info('Tenant Manager initialized');
    }
  }

  /**
   * Close the ORM and cleanup resources
   */
  async close(): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to close Vlodia ORM', { error });
      throw error;
    }
  }

  // ===== NEW FEATURES API =====

  /**
   * Get WebSocket Manager for real-time features
   */
  getWebSocketManager(): WebSocketManager | null {
    return this.webSocketManager;
  }

  /**
   * Get GraphQL Schema Generator
   */
  getGraphQLGenerator(): GraphQLSchemaGenerator | null {
    return this.graphqlGenerator;
  }

  /**
   * Get Query Analyzer for performance monitoring
   */
  getQueryAnalyzer(): QueryAnalyzer | null {
    return this.queryAnalyzer;
  }

  /**
   * Get Schema Designer for visual schema management
   */
  getSchemaDesigner(): SchemaDesigner | null {
    return this.schemaDesigner;
  }

  /**
   * Get Tenant Manager for multi-tenancy
   */
  getTenantManager(): TenantManager | null {
    return this.tenantManager;
  }

  /**
   * Generate GraphQL schema
   */
  generateGraphQLSchema(): any {
    if (!this.graphqlGenerator) {
      throw new Error('GraphQL is not enabled');
    }
    return this.graphqlGenerator.generateSchema();
  }

  /**
   * Generate visual schema diagram
   */
  generateSchemaDiagram(): any {
    if (!this.schemaDesigner) {
      throw new Error('Schema Designer is not initialized');
    }
    return this.schemaDesigner.generateSchemaDiagram();
  }

  /**
   * Analyze query performance
   */
  analyzeQuery(sql: string, executionTime: number, rowCount: number): any {
    if (!this.queryAnalyzer) {
      throw new Error('Query Analyzer is not initialized');
    }
    return this.queryAnalyzer.analyzeQuery(sql, executionTime, rowCount);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): any {
    if (!this.queryAnalyzer) {
      throw new Error('Query Analyzer is not initialized');
    }
    return this.queryAnalyzer.getPerformanceMetrics();
  }

  /**
   * Get entity manager for database operations
   */
  get manager(): EntityManager {
    if (!this.isInitialized) {
      throw new Error('Vlodia ORM not initialized');
    }
    return this.entityManager;
  }

  /**
   * Get metadata registry
   */
  get metadata(): MetadataRegistry {
    return this.metadataRegistry;
  }

  /**
   * Get logger instance
   */
  get log(): Logger {
    return this.logger;
  }

  /**
   * Get event bus instance
   */
  get events(): EventBus {
    return this.eventBus;
  }

  /**
   * Get cache instance
   */
  get cacheInstance(): Cache | null {
    return this.cache;
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T> {
    if (!this.isInitialized) {
      throw new Error('Vlodia ORM not initialized');
    }

    const transaction = await this.adapter.begin();
    const transactionManager = new EntityManager({
      adapter: this.adapter,
      transaction,
    });

    try {
      this.eventBus.emit('transaction:start', { transactionId: transaction.id });

      const result = await callback(transactionManager);

      await this.adapter.commit(transaction);
      this.eventBus.emit('transaction:commit', { transactionId: transaction.id });

      return result;
    } catch (error) {
      await this.adapter.rollback(transaction);
      this.eventBus.emit('transaction:rollback', { transactionId: transaction.id, error });
      throw error;
    }
  }

  /**
   * Execute a nested transaction with savepoint
   */
  async savepoint<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T> {
    if (!this.isInitialized) {
      throw new Error('Vlodia ORM not initialized');
    }

    const currentTransaction = this.entityManager.getCurrentTransaction();
    if (!currentTransaction) {
      throw new Error('No active transaction for savepoint');
    }

    const savepointName = `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.adapter.savepoint(currentTransaction, savepointName);

    const transactionManager = new EntityManager({
      adapter: this.adapter,
      transaction: currentTransaction,
    });

    try {
      this.eventBus.emit('savepoint:start', { savepointName });

      const result = await callback(transactionManager);

      await this.adapter.releaseSavepoint(currentTransaction, savepointName);
      this.eventBus.emit('savepoint:release', { savepointName });

      return result;
    } catch (error) {
      await this.adapter.rollbackToSavepoint(currentTransaction, savepointName);
      this.eventBus.emit('savepoint:rollback', { savepointName, error });
      throw error;
    }
  }

  /**
   * Check if ORM is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get configuration
   */
  get configuration(): VlodiaConfig {
    return this.config;
  }

  /**
   * Register entities with metadata registry
   */
  private registerEntities(): void {
    for (const entityClass of this.config.entities) {
      if (!this.metadataRegistry.hasEntity(entityClass as new () => any)) {
        throw new Error(`Entity ${entityClass.name} not properly decorated with @Entity`);
      }
    }
  }

  /**
   * Initialize cache system
   */
  private async initializeCache(): Promise<void> {
    if (!this.config.cache?.enabled) {
      return;
    }

    this.cache = {
      get: async (_key: string) => {
        return null;
      },
      set: async (_key: string, _value: any, _ttl?: number) => {},
      del: async (_key: string) => {},
      clear: async () => {},
    };
  }

  /**
   * Create logger instance
   */
  private createLogger(): Logger {
    const level = this.config.logging?.level || 'info';

    return {
      error: (message: string, meta?: any) => {
        if (level === 'error' || level === 'warn' || level === 'info' || level === 'debug') {
          console.error(`[ERROR] ${message}`, meta || '');
        }
      },
      warn: (message: string, meta?: any) => {
        if (level === 'warn' || level === 'info' || level === 'debug') {
          console.warn(`[WARN] ${message}`, meta || '');
        }
      },
      info: (message: string, meta?: any) => {
        if (level === 'info' || level === 'debug') {
          console.info(`[INFO] ${message}`, meta || '');
        }
      },
      debug: (message: string, meta?: any) => {
        if (level === 'debug') {
          console.debug(`[DEBUG] ${message}`, meta || '');
        }
      },
    };
  }

  /**
   * Create event bus instance
   */
  private createEventBus(): EventBus {
    const handlers = new Map<string, Set<(data?: any) => void>>();

    return {
      emit: (event: string, data?: any) => {
        const eventHandlers = handlers.get(event);
        if (eventHandlers) {
          for (const handler of eventHandlers) {
            try {
              handler(data);
            } catch (error) {
              this.logger.error(`Event handler error for ${event}`, { error });
            }
          }
        }
      },
      on: (event: string, handler: (data?: any) => void) => {
        if (!handlers.has(event)) {
          handlers.set(event, new Set());
        }
        handlers.get(event)!.add(handler);
      },
      off: (event: string, handler: (data?: any) => void) => {
        const eventHandlers = handlers.get(event);
        if (eventHandlers) {
          eventHandlers.delete(handler);
        }
      },
    };
  }
}
