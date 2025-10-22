/**
 * CLI Commands
 * Command-line interface for entity generation, migrations, and schema management
 * Provides comprehensive CLI tools for development workflow
 */
export interface CLIOptions {
    config?: string;
    verbose?: boolean;
    dryRun?: boolean;
}
export declare class CLICommands {
    private orm;
    private config;
    constructor();
    /**
     * Setup CLI commands
     */
    private setupCommands;
    /**
     * Generate entity from database table
     */
    private generateEntity;
    /**
     * Create new entity
     */
    private createEntity;
    /**
     * Generate migration
     */
    private generateMigration;
    /**
     * Run migrations
     */
    private runMigrations;
    /**
     * Rollback migration
     */
    private rollbackMigration;
    /**
     * Show migration status
     */
    private showMigrationStatus;
    /**
     * Sync schema
     */
    private syncSchema;
    /**
     * Drop schema
     */
    private dropSchema;
    /**
     * Create schema
     */
    private createSchema;
    /**
     * Seed database
     */
    private seedDatabase;
    /**
     * Reset database
     */
    private resetDatabase;
    /**
     * Clear cache
     */
    private clearCache;
    /**
     * Show cache statistics
     */
    private showCacheStats;
    /**
     * Validate entities
     */
    private validateEntities;
    /**
     * Validate schema
     */
    private validateSchema;
    /**
     * Watch for changes
     */
    private watchChanges;
    /**
     * Open development console
     */
    private openConsole;
    /**
     * Show examples
     */
    private showExamples;
    /**
     * Open documentation
     */
    private openDocs;
    /**
     * Generate entity template
     */
    private generateEntityTemplate;
    /**
     * Initialize ORM instance
     */
    private initializeORM;
    /**
     * Load configuration
     */
    private loadConfig;
    /**
     * Get table schema from database
     */
    private getTableSchema;
    /**
     * Get current database schema
     */
    private getCurrentDatabaseSchema;
    /**
     * Get entity schema
     */
    private getEntitySchema;
    /**
     * Generate migration SQL
     */
    private generateMigrationSQL;
    /**
     * Generate migration template
     */
    private generateMigrationTemplate;
    /**
     * Get pending migrations
     */
    private getPendingMigrations;
    /**
     * Execute migration
     */
    private executeMigration;
    /**
     * Utility: Convert to PascalCase
     */
    private toPascalCase;
    /**
     * Generate schema changes
     */
    private generateSchemaChanges;
    /**
     * Find schema inconsistencies
     */
    private findSchemaInconsistencies;
    /**
     * Reload entities
     */
    private reloadEntities;
    /**
     * Start real-time WebSocket server
     */
    private startRealtime;
    /**
     * Generate GraphQL schema
     */
    private generateGraphQL;
    /**
     * Visualize schema
     */
    private visualizeSchema;
    /**
     * Analyze performance
     */
    private analyzePerformance;
    /**
     * Create tenant
     */
    private createTenant;
    /**
     * Initialize Vlodia project (like prisma init)
     */
    private initProject;
    /**
     * Generate schema.vlodia file content
     */
    private generateSchemaFile;
    /**
     * Generate config.ts file content
     */
    private generateConfigFile;
    /**
     * Generate example entity file
     */
    private generateExampleEntity;
    /**
     * Generate .env file content
     */
    private generateEnvFile;
    /**
     * Generate .env.example file content
     */
    private generateEnvExampleFile;
    /**
     * Generate app.ts file content
     */
    private generateAppFile;
    /**
     * Generate from schema.vlodia (like prisma generate)
     */
    private generateFromSchema;
    /**
     * Parse schema.vlodia file
     */
    private parseSchemaFile;
    /**
     * Extract value from config block
     */
    private extractValue;
    /**
     * Generate config from parsed schema
     */
    private generateConfigFromSchema;
    /**
     * Generate entities from schema
     */
    private generateEntitiesFromSchema;
    /**
     * Generate entity file from schema
     */
    private generateEntityFromSchema;
    /**
     * Setup CLI commands with new features
     */
    setupNewCommands(): void;
}
//# sourceMappingURL=commands.d.ts.map