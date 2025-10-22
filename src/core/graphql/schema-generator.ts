/**
 * GraphQL Schema Generator
 * Automatic GraphQL schema generation from entity metadata
 * Provides type-safe GraphQL API with subscriptions
 */

import { MetadataRegistry } from '../metadata-registry';
import { EntityMetadata, ColumnMetadata, RelationMetadata } from '@/types';

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

export class GraphQLSchemaGenerator {
  private metadataRegistry: MetadataRegistry;
  private config: GraphQLConfig;

  constructor(config: GraphQLConfig) {
    this.metadataRegistry = MetadataRegistry.getInstance();
    this.config = config;
  }

  /**
   * Generate complete GraphQL schema
   */
  generateSchema(): GraphQLSchema {
    const entities = this.metadataRegistry.getAllEntities();
    const typeDefs = this.generateTypeDefs(entities);
    const resolvers = this.generateResolvers(entities);
    const subscriptions = this.generateSubscriptions(entities);

    return {
      typeDefs,
      resolvers,
      subscriptions
    };
  }

  /**
   * Generate GraphQL type definitions
   */
  private generateTypeDefs(entities: EntityMetadata[]): string {
    let schema = `
      scalar Date
      scalar JSON

      type Query {
        _empty: String
      }

      type Mutation {
        _empty: String
      }
    `;

    if (this.config.subscriptions) {
      schema += `
        type Subscription {
          _empty: String
        }
      `;
    }

    // Generate entity types
    for (const entity of entities) {
      schema += this.generateEntityType(entity);
    }

    // Generate input types
    for (const entity of entities) {
      schema += this.generateInputTypes(entity);
    }

    // Generate query and mutation types
    schema += this.generateQueryTypes(entities);
    schema += this.generateMutationTypes(entities);

    if (this.config.subscriptions) {
      schema += this.generateSubscriptionTypes(entities);
    }

    return schema;
  }

  /**
   * Generate entity GraphQL type
   */
  private generateEntityType(entity: EntityMetadata): string {
    const columns = entity.columns;
    const relations = entity.relations;

    let typeDef = `
      type ${entity.name} {
    `;

    // Add columns
    for (const column of columns) {
      const graphqlType = this.mapColumnToGraphQLType(column);
      typeDef += `    ${column.propertyName}: ${graphqlType}\n`;
    }

    // Add relations
    for (const relation of relations) {
      const relationType = this.getRelationGraphQLType(relation);
      typeDef += `    ${relation.propertyName}: ${relationType}\n`;
    }

    typeDef += `  }\n\n`;

    return typeDef;
  }

  /**
   * Generate input types for mutations
   */
  private generateInputTypes(entity: EntityMetadata): string {
    const columns = entity.columns;
    const relations = entity.relations;

    let inputType = `
      input ${entity.name}Input {
    `;

    // Add non-primary key columns
    for (const column of columns) {
      if (!column.primary) {
        const graphqlType = this.mapColumnToGraphQLType(column);
        const optional = column.nullable ? '' : '!';
        inputType += `    ${column.propertyName}: ${graphqlType}${optional}\n`;
      }
    }

    // Add relation IDs
    for (const relation of relations) {
      if (relation.type === 'ManyToOne' || relation.type === 'OneToOne') {
        inputType += `    ${relation.propertyName}Id: Int\n`;
      }
    }

    inputType += `  }\n\n`;

    // Generate update input
    inputType += `
      input ${entity.name}UpdateInput {
        id: Int!
    `;

    for (const column of columns) {
      if (!column.primary) {
        const graphqlType = this.mapColumnToGraphQLType(column);
        inputType += `        ${column.propertyName}: ${graphqlType}\n`;
      }
    }

    inputType += `      }\n\n`;

    return inputType;
  }

  /**
   * Generate query types
   */
  private generateQueryTypes(entities: EntityMetadata[]): string {
    let queryType = `
      extend type Query {
    `;

    for (const entity of entities) {
      const entityName = entity.name.toLowerCase();
      queryType += `
        # Get all ${entityName}s
        ${entityName}s(
          where: ${entity.name}WhereInput
          orderBy: ${entity.name}OrderByInput
          limit: Int
          offset: Int
        ): [${entity.name}!]!
        
        # Get ${entityName} by ID
        ${entityName}(id: Int!): ${entity.name}
      `;
    }

    queryType += `  }\n\n`;

    // Generate where and orderBy input types
    for (const entity of entities) {
      queryType += this.generateWhereInput(entity);
      queryType += this.generateOrderByInput(entity);
    }

    return queryType;
  }

  /**
   * Generate mutation types
   */
  private generateMutationTypes(entities: EntityMetadata[]): string {
    let mutationType = `
      extend type Mutation {
    `;

    for (const entity of entities) {
      const entityName = entity.name.toLowerCase();
      mutationType += `
        # Create ${entityName}
        create${entity.name}(input: ${entity.name}Input!): ${entity.name}!
        
        # Update ${entityName}
        update${entity.name}(input: ${entity.name}UpdateInput!): ${entity.name}!
        
        # Delete ${entityName}
        delete${entity.name}(id: Int!): Boolean!
      `;
    }

    mutationType += `  }\n\n`;

    return mutationType;
  }

  /**
   * Generate subscription types
   */
  private generateSubscriptionTypes(entities: EntityMetadata[]): string {
    let subscriptionType = `
      extend type Subscription {
    `;

    for (const entity of entities) {
      const entityName = entity.name.toLowerCase();
      subscriptionType += `
        # ${entityName} created
        ${entityName}Created: ${entity.name}!
        
        # ${entityName} updated
        ${entityName}Updated: ${entity.name}!
        
        # ${entityName} deleted
        ${entityName}Deleted: ${entity.name}!
      `;
    }

    subscriptionType += `  }\n\n`;

    return subscriptionType;
  }

  /**
   * Generate where input type
   */
  private generateWhereInput(entity: EntityMetadata): string {
    const columns = entity.columns;

    let whereInput = `
      input ${entity.name}WhereInput {
    `;

    for (const column of columns) {
      const graphqlType = this.mapColumnToGraphQLType(column);
      whereInput += `    ${column.propertyName}: ${graphqlType}\n`;
      whereInput += `    ${column.propertyName}_in: [${graphqlType}!]\n`;
      whereInput += `    ${column.propertyName}_not_in: [${graphqlType}!]\n`;
      whereInput += `    ${column.propertyName}_like: String\n`;
      whereInput += `    ${column.propertyName}_not_like: String\n`;
    }

    whereInput += `  }\n\n`;

    return whereInput;
  }

  /**
   * Generate orderBy input type
   */
  private generateOrderByInput(entity: EntityMetadata): string {
    const columns = entity.columns;

    let orderByInput = `
      input ${entity.name}OrderByInput {
    `;

    for (const column of columns) {
      orderByInput += `    ${column.propertyName}: SortOrder\n`;
    }

    orderByInput += `  }\n\n`;

    return orderByInput;
  }

  /**
   * Generate GraphQL resolvers
   */
  private generateResolvers(entities: EntityMetadata[]): any {
    const resolvers: any = {
      Query: {},
      Mutation: {},
      Date: {
        serialize: (value: Date) => value.toISOString(),
        parseValue: (value: string) => new Date(value),
        parseLiteral: (ast: any) => new Date(ast.value)
      },
      JSON: {
        serialize: (value: any) => value,
        parseValue: (value: any) => value,
        parseLiteral: (ast: any) => ast.value
      }
    };

    if (this.config.subscriptions) {
      resolvers.Subscription = {};
    }

    // Generate entity resolvers
    for (const entity of entities) {
      const entityName = entity.name.toLowerCase();
      
      // Query resolvers
      resolvers.Query[`${entityName}s`] = this.generateListResolver(entity);
      resolvers.Query[entityName] = this.generateSingleResolver(entity);

      // Mutation resolvers
      resolvers.Mutation[`create${entity.name}`] = this.generateCreateResolver(entity);
      resolvers.Mutation[`update${entity.name}`] = this.generateUpdateResolver(entity);
      resolvers.Mutation[`delete${entity.name}`] = this.generateDeleteResolver(entity);

      // Subscription resolvers
      if (this.config.subscriptions) {
        resolvers.Subscription[`${entityName}Created`] = this.generateSubscriptionResolver(entity, 'created');
        resolvers.Subscription[`${entityName}Updated`] = this.generateSubscriptionResolver(entity, 'updated');
        resolvers.Subscription[`${entityName}Deleted`] = this.generateSubscriptionResolver(entity, 'deleted');
      }
    }

    return resolvers;
  }

  /**
   * Generate list resolver
   */
  private generateListResolver(entity: EntityMetadata): any {
    return async (_parent: any, args: any, context: any) => {
      const { entityManager } = context;
      return await entityManager.find(entity.target, {
        where: args.where,
        orderBy: args.orderBy,
        limit: args.limit,
        offset: args.offset
      });
    };
  }

  /**
   * Generate single resolver
   */
  private generateSingleResolver(entity: EntityMetadata): any {
    return async (_parent: any, args: any, context: any) => {
      const { entityManager } = context;
      return await entityManager.findOne(entity.target, { where: { id: args.id } });
    };
  }

  /**
   * Generate create resolver
   */
  private generateCreateResolver(entity: EntityMetadata): any {
    return async (_parent: any, args: any, context: any) => {
      const { entityManager } = context;
      const entityInstance = new (entity.target as any)();
      
      // Set properties from input
      Object.assign(entityInstance, args.input);
      
      return await entityManager.save(entityInstance);
    };
  }

  /**
   * Generate update resolver
   */
  private generateUpdateResolver(entity: EntityMetadata): any {
    return async (_parent: any, args: any, context: any) => {
      const { entityManager } = context;
      const { id, ...updateData } = args.input;
      
      const entityInstance = await entityManager.findOne(entity.target, { where: { id } });
      if (!entityInstance) {
        throw new Error(`${entity.name} not found`);
      }
      
      Object.assign(entityInstance, updateData);
      return await entityManager.save(entityInstance);
    };
  }

  /**
   * Generate delete resolver
   */
  private generateDeleteResolver(entity: EntityMetadata): any {
    return async (_parent: any, args: any, context: any) => {
      const { entityManager } = context;
      const entityInstance = await entityManager.findOne(entity.target, { where: { id: args.id } });
      if (!entityInstance) {
        throw new Error(`${entity.name} not found`);
      }
      
      await entityManager.remove(entityInstance);
      return true;
    };
  }

  /**
   * Generate subscription resolver
   */
  private generateSubscriptionResolver(entity: EntityMetadata, event: string): any {
    return {
      subscribe: async (_parent: any, _args: any, context: any) => {
        const { pubsub } = context;
        return pubsub.asyncIterator(`${entity.name.toLowerCase()}_${event}`);
      }
    };
  }

  /**
   * Map column type to GraphQL type
   */
  private mapColumnToGraphQLType(column: ColumnMetadata): string {
    switch (column.type) {
      case 'string':
      case 'text':
        return 'String';
      case 'number':
        return 'Int';
      case 'boolean':
        return 'Boolean';
      case 'date':
        return 'Date';
      case 'json':
        return 'JSON';
      case 'uuid':
        return 'String';
      case 'blob':
        return 'String';
      default:
        return 'String';
    }
  }

  /**
   * Get relation GraphQL type
   */
  private getRelationGraphQLType(relation: RelationMetadata): string {
    switch (relation.type) {
      case 'OneToOne':
      case 'ManyToOne':
        return relation.target.name;
      case 'OneToMany':
      case 'ManyToMany':
        return `[${relation.target.name}!]!`;
      default:
        return 'String';
    }
  }

  /**
   * Generate subscriptions
   */
  private generateSubscriptions(entities: EntityMetadata[]): any {
    const subscriptions: any = {};

    for (const entity of entities) {
      const entityName = entity.name.toLowerCase();
      
      subscriptions[`${entityName}Created`] = {
        subscribe: async (_parent: any, _args: any, context: any) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(`${entityName}_created`);
        }
      };

      subscriptions[`${entityName}Updated`] = {
        subscribe: async (_parent: any, _args: any, context: any) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(`${entityName}_updated`);
        }
      };

      subscriptions[`${entityName}Deleted`] = {
        subscribe: async (_parent: any, _args: any, context: any) => {
          const { pubsub } = context;
          return pubsub.asyncIterator(`${entityName}_deleted`);
        }
      };
    }

    return subscriptions;
  }
}
