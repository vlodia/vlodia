/**
 * GraphQL Schema Generator
 * Automatic GraphQL schema generation from entity metadata
 * Provides type-safe GraphQL API with subscriptions
 */
export interface GraphQLConfig {
    enabled: boolean;
    path: string;
    playground: boolean;
    introspection: boolean;
    subscriptions: boolean;
    cors: {
        origin: string[];
        credentials: boolean;
    };
}
export interface GraphQLSchema {
    typeDefs: string;
    resolvers: any;
    subscriptions: any;
}
export declare class GraphQLSchemaGenerator {
    private metadataRegistry;
    private config;
    constructor(config: GraphQLConfig);
    /**
     * Generate complete GraphQL schema
     */
    generateSchema(): GraphQLSchema;
    /**
     * Generate GraphQL type definitions
     */
    private generateTypeDefs;
    /**
     * Generate entity GraphQL type
     */
    private generateEntityType;
    /**
     * Generate input types for mutations
     */
    private generateInputTypes;
    /**
     * Generate query types
     */
    private generateQueryTypes;
    /**
     * Generate mutation types
     */
    private generateMutationTypes;
    /**
     * Generate subscription types
     */
    private generateSubscriptionTypes;
    /**
     * Generate where input type
     */
    private generateWhereInput;
    /**
     * Generate orderBy input type
     */
    private generateOrderByInput;
    /**
     * Generate GraphQL resolvers
     */
    private generateResolvers;
    /**
     * Generate list resolver
     */
    private generateListResolver;
    /**
     * Generate single resolver
     */
    private generateSingleResolver;
    /**
     * Generate create resolver
     */
    private generateCreateResolver;
    /**
     * Generate update resolver
     */
    private generateUpdateResolver;
    /**
     * Generate delete resolver
     */
    private generateDeleteResolver;
    /**
     * Generate subscription resolver
     */
    private generateSubscriptionResolver;
    /**
     * Map column type to GraphQL type
     */
    private mapColumnToGraphQLType;
    /**
     * Get relation GraphQL type
     */
    private getRelationGraphQLType;
    /**
     * Generate subscriptions
     */
    private generateSubscriptions;
}
//# sourceMappingURL=schema-generator.d.ts.map