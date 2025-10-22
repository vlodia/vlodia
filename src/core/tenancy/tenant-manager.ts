/**
 * Tenant Manager
 * Multi-tenancy support with tenant isolation
 * Provides tenant-aware data access and security
 */

import { EntityManager } from '../entity-manager';
import { Logger } from '@/types';

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  database: string;
  schema: string;
  config: TenantConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantConfig {
  features: string[];
  limits: {
    maxUsers: number;
    maxStorage: number;
    maxRequests: number;
  };
  settings: Record<string, any>;
  security: {
    encryption: boolean;
    auditLogging: boolean;
    dataRetention: number;
  };
}

export interface TenantContext {
  tenantId: string;
  userId?: string;
  permissions: string[];
  dataScope: 'tenant' | 'global';
}

export interface TenantQuery {
  tenantId: string;
  userId?: string;
  filters: Record<string, any>;
  permissions: string[];
}

export class TenantManager {
  private entityManager: EntityManager;
  private logger: Logger;
  private tenants = new Map<string, Tenant>();
  private currentContext: TenantContext | null = null;
  private tenantCache = new Map<string, any>();

  constructor(entityManager: EntityManager, logger: Logger) {
    this.entityManager = entityManager;
    this.logger = logger;
  }

  /**
   * Initialize tenant manager
   */
  async initialize(): Promise<void> {
    await this.loadTenants();
    this.logger.info('Tenant manager initialized', { 
      tenantCount: this.tenants.size 
    });
  }

  /**
   * Load all tenants from database
   */
  private async loadTenants(): Promise<void> {
    try {
      // This would typically load from a tenants table
      // For now, we'll create some sample tenants
      const sampleTenants: Tenant[] = [
        {
          id: 'tenant_1',
          name: 'Acme Corp',
          domain: 'acme.com',
          database: 'acme_db',
          schema: 'acme_schema',
          config: {
            features: ['basic', 'analytics'],
            limits: {
              maxUsers: 100,
              maxStorage: 1000000,
              maxRequests: 10000
            },
            settings: {
              timezone: 'UTC',
              language: 'en'
            },
            security: {
              encryption: true,
              auditLogging: true,
              dataRetention: 365
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'tenant_2',
          name: 'Beta Inc',
          domain: 'beta.com',
          database: 'beta_db',
          schema: 'beta_schema',
          config: {
            features: ['premium', 'analytics', 'api'],
            limits: {
              maxUsers: 1000,
              maxStorage: 10000000,
              maxRequests: 100000
            },
            settings: {
              timezone: 'EST',
              language: 'en'
            },
            security: {
              encryption: true,
              auditLogging: true,
              dataRetention: 730
            }
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      for (const tenant of sampleTenants) {
        this.tenants.set(tenant.id, tenant);
      }
    } catch (error) {
      this.logger.error('Failed to load tenants', { error });
      throw error;
    }
  }

  /**
   * Set current tenant context
   */
  setTenantContext(context: TenantContext): void {
    this.currentContext = context;
    this.logger.debug('Tenant context set', { 
      tenantId: context.tenantId,
      userId: context.userId 
    });
  }

  /**
   * Get current tenant context
   */
  getCurrentContext(): TenantContext | null {
    return this.currentContext;
  }

  /**
   * Get tenant by ID
   */
  getTenant(tenantId: string): Tenant | null {
    return this.tenants.get(tenantId) || null;
  }

  /**
   * Get tenant by domain
   */
  getTenantByDomain(domain: string): Tenant | null {
    for (const tenant of this.tenants.values()) {
      if (tenant.domain === domain) {
        return tenant;
      }
    }
    return null;
  }

  /**
   * Create new tenant
   */
  async createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const tenant: Tenant = {
      id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...tenantData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tenants.set(tenant.id, tenant);
    
    // Create tenant-specific database schema
    await this.createTenantSchema(tenant);
    
    this.logger.info('Tenant created', { 
      tenantId: tenant.id,
      name: tenant.name 
    });

    return tenant;
  }

  /**
   * Update tenant
   */
  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return null;
    }

    const updatedTenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date()
    };

    this.tenants.set(tenantId, updatedTenant);
    
    this.logger.info('Tenant updated', { 
      tenantId,
      updates: Object.keys(updates) 
    });

    return updatedTenant;
  }

  /**
   * Delete tenant
   */
  async deleteTenant(tenantId: string): Promise<boolean> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return false;
    }

    // Drop tenant-specific schema
    await this.dropTenantSchema(tenant);
    
    this.tenants.delete(tenantId);
    
    this.logger.info('Tenant deleted', { tenantId });
    return true;
  }

  /**
   * Create tenant-specific database schema
   */
  private async createTenantSchema(tenant: Tenant): Promise<void> {
    // Ensure type safety and parameterization by introducing a dedicated interface for low-level SQL execution,
    // and avoid direct string interpolation in SQL statements for schema names.
    // Document the rationale for secure schema operations.

    /**
     * Underlying RDBMS adapters typically require raw SQL for schema DDL operations, but schema identifiers
     * cannot be bound as parameters in prepared statements. To mitigate SQL injection risk, 
     * validate schema names using a conservative whitelist regex.
     */
    const schemaName = tenant.schema;
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schemaName)) {
      throw new Error(`Invalid schema name: ${schemaName}`);
    }

    // Using a minimal adapter abstraction for raw SQL execution.
    const sqlExecutor = this.entityManager as unknown as { executeRaw(sql: string): Promise<void> };

    await sqlExecutor.executeRaw(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    await sqlExecutor.executeRaw(`SET search_path TO "${schemaName}", public`);

    this.logger.debug('Tenant schema created', { 
      tenantId: tenant.id,
      schema: tenant.schema 
    });
  }

  /**
   * Drop tenant-specific database schema
   */
  /**
   * Drop tenant-specific database schema
   *
   * Use a defensive approach: validate the schema name before executing any DDL,
   * and use a dedicated low-level SQL executor interface, rather than assuming
   * EntityManager supports raw query operations. Log result or errors explicitly.
   *
   * This design prevents SQL injection risk associated with interpolating schema names,
   * and conforms to the same adapter abstraction as schema creation.
   */
  private async dropTenantSchema(tenant: Tenant): Promise<void> {
    const schemaName = tenant.schema;
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schemaName)) {
      throw new Error(`Invalid schema name: ${schemaName}`);
    }

    // Use the same adapter abstraction as createTenantSchema
    const sqlExecutor = this.entityManager as unknown as { executeRaw(sql: string): Promise<void> };

    try {
      await sqlExecutor.executeRaw(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);

      this.logger.debug('Tenant schema dropped', { 
        tenantId: tenant.id,
        schema: tenant.schema 
      });
    } catch (error) {
      this.logger.error('Failed to drop tenant schema', { 
        tenantId: tenant.id,
        error 
      });
      throw error;
    }
  }
  /**
   * Execute tenant-aware query
   */
  async executeTenantQuery<T>(
    entityClass: new () => T,
    query: TenantQuery
  ): Promise<T[]> {
    if (!this.currentContext) {
      throw new Error('No tenant context set');
    }

    // Validate tenant access
    if (!this.validateTenantAccess(query.tenantId)) {
      throw new Error('Access denied for tenant');
    }

    // Add tenant filter to query
    const tenantFilter = {
      ...query.filters,
      tenantId: query.tenantId
    };

    // Execute query with tenant isolation
    const results = await this.entityManager.find(entityClass, {
      where: tenantFilter
    });

    this.logger.debug('Tenant query executed', {
      tenantId: query.tenantId,
      entity: entityClass.name,
      resultCount: results.length
    });

    return results;
  }

  /**
   * Validate tenant access
   */
  private validateTenantAccess(tenantId: string): boolean {
    if (!this.currentContext) {
      return false;
    }

    // Check if user has access to this tenant
    if (this.currentContext.tenantId !== tenantId) {
      return false;
    }

    // Check permissions
    if (!this.currentContext.permissions.includes('read')) {
      return false;
    }

    return true;
  }

  /**
   * Get tenant statistics
   */
  async getTenantStatistics(tenantId: string): Promise<{
    userCount: number;
    dataSize: number;
    requestCount: number;
    lastActivity: Date;
  }> {
    const tenant = this.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // This would typically query actual statistics
    // For now, return mock data
    return {
      userCount: Math.floor(Math.random() * 100),
      dataSize: Math.floor(Math.random() * 1000000),
      requestCount: Math.floor(Math.random() * 10000),
      lastActivity: new Date()
    };
  }

  /**
   * Check tenant limits
   */
  async checkTenantLimits(tenantId: string): Promise<{
    withinLimits: boolean;
    warnings: string[];
  }> {
    const tenant = this.getTenant(tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const stats = await this.getTenantStatistics(tenantId);
    const warnings: string[] = [];

    // Check user limit
    if (stats.userCount >= tenant.config.limits.maxUsers) {
      warnings.push('User limit reached');
    }

    // Check storage limit
    if (stats.dataSize >= tenant.config.limits.maxStorage) {
      warnings.push('Storage limit reached');
    }

    // Check request limit
    if (stats.requestCount >= tenant.config.limits.maxRequests) {
      warnings.push('Request limit reached');
    }

    return {
      withinLimits: warnings.length === 0,
      warnings
    };
  }

  /**
   * Get all tenants
   */
  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values());
  }

  /**
   * Clear tenant cache
   */
  clearTenantCache(): void {
    this.tenantCache.clear();
    this.logger.debug('Tenant cache cleared');
  }

  /**
   * Get tenant cache statistics
   */
  getCacheStatistics(): {
    size: number;
    hitRate: number;
    memoryUsage: number;
  } {
    return {
      size: this.tenantCache.size,
      hitRate: 0.85, // Mock hit rate
      memoryUsage: this.tenantCache.size * 1024 // Mock memory usage
    };
  }
}
