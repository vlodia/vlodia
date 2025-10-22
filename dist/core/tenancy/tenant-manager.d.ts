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
export declare class TenantManager {
    private entityManager;
    private logger;
    private tenants;
    private currentContext;
    private tenantCache;
    constructor(entityManager: EntityManager, logger: Logger);
    /**
     * Initialize tenant manager
     */
    initialize(): Promise<void>;
    /**
     * Load all tenants from database
     */
    private loadTenants;
    /**
     * Set current tenant context
     */
    setTenantContext(context: TenantContext): void;
    /**
     * Get current tenant context
     */
    getCurrentContext(): TenantContext | null;
    /**
     * Get tenant by ID
     */
    getTenant(tenantId: string): Tenant | null;
    /**
     * Get tenant by domain
     */
    getTenantByDomain(domain: string): Tenant | null;
    /**
     * Create new tenant
     */
    createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant>;
    /**
     * Update tenant
     */
    updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null>;
    /**
     * Delete tenant
     */
    deleteTenant(tenantId: string): Promise<boolean>;
    /**
     * Create tenant-specific database schema
     */
    private createTenantSchema;
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
    private dropTenantSchema;
    /**
     * Execute tenant-aware query
     */
    executeTenantQuery<T>(entityClass: new () => T, query: TenantQuery): Promise<T[]>;
    /**
     * Validate tenant access
     */
    private validateTenantAccess;
    /**
     * Get tenant statistics
     */
    getTenantStatistics(tenantId: string): Promise<{
        userCount: number;
        dataSize: number;
        requestCount: number;
        lastActivity: Date;
    }>;
    /**
     * Check tenant limits
     */
    checkTenantLimits(tenantId: string): Promise<{
        withinLimits: boolean;
        warnings: string[];
    }>;
    /**
     * Get all tenants
     */
    getAllTenants(): Tenant[];
    /**
     * Clear tenant cache
     */
    clearTenantCache(): void;
    /**
     * Get tenant cache statistics
     */
    getCacheStatistics(): {
        size: number;
        hitRate: number;
        memoryUsage: number;
    };
}
//# sourceMappingURL=tenant-manager.d.ts.map