# Vlodia ORM

**Vlodia** is a next-generation TypeScript ORM that combines the best features of modern ORMs with enterprise-grade performance and developer experience. Built for TypeScript-first development with reflection-driven metadata, database-agnostic architecture, and production-ready features.

**[Full Documentation](https://vlodia.github.io/vlodia)** | **[Quick Start](#quick-start)** | **[Examples](#examples)**

## Quick Start

### 1. Initialize Project

```bash
# Create new project
vlodia init my-vlodia-app
cd my-vlodia-app

# Install dependencies
npm install
```

### 2. Project Structure

```
my-vlodia-app/
├── vlodia/
│   ├── schema.vlodia    # Schema definition
│   └── config.ts       # Auto-generated configuration
├── src/
│   ├── entities/        # Entity definitions
│   ├── migrations/      # Database migrations
│   └── app.ts          # Application entry point
├── .env                 # Environment variables
└── package.json
```

### 3. Database Setup

```bash
# Generate entities from schema
vlodia generate

# Run migrations
vlodia migration:run
```

### 4. Generate Types

```bash
# Generate TypeScript types
vlodia generate:types
```

### 5. Database Configuration

The `vlodia/schema.vlodia` file

```vlodia
// Vlodia Schema Definition
// This file defines your database schema and ORM configuration

// Database configuration
database {
  provider = "postgresql"
  url      = "postgresql://postgres:password@localhost:5432/myapp"
  host     = "localhost"
  port     = 5432
  username = "postgres"
  password = "password"
  database = "myapp"
  ssl      = false
}

// ORM configuration
orm {
  logging {
    level   = "info"
    format  = "text"
    queries = true
  }
  
  cache {
    enabled = true
    type    = "memory"
    ttl     = 3600
  }
}

// Real-time features
realtime {
  enabled = true
  port    = 8080
  path    = "/ws"
}

// GraphQL features
graphql {
  enabled       = true
  path          = "/graphql"
  playground    = true
  introspection = true
}

// Entity definitions
entity User {
  id        Int      @id @default(autoincrement())
  name      String   @length(100)
  email     String   @unique
  password  String
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 6. Application Usage

```typescript
import { Vlodia } from 'vlodia';
import { User } from './src/entities/User';

// Initialize ORM
const orm = new Vlodia({
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'myapp'
  },
  entities: [User],
  logging: {
    level: 'info',
    queries: true
  }
});

async function main() {
  await orm.initialize();
  
  // Create user
  const user = new User();
  user.name = 'John Doe';
  user.email = 'john@example.com';
  user.password = 'hashed_password';
  user.createdAt = new Date();
  user.updatedAt = new Date();
  
  const savedUser = await orm.manager.save(user);
  console.log('User created:', savedUser);
  
  await orm.close();
}

main();
```

## Examples

### Complete Usage Examples

#### Entity Definitions

```typescript
import { Vlodia, Entity, Column, PrimaryKey, OneToMany, ManyToOne } from 'vlodia';

/**
 * User entity demonstrating basic entity structure with relationships
 * Shows primary key, columns, and one-to-many relationships
 */
@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string', length: 100 })
  name!: string;

  @Column({ type: 'string', unique: true })
  email!: string;

  @Column({ type: 'string' })
  password!: string;

  @Column({ type: 'date' })
  createdAt!: Date;

  @Column({ type: 'date' })
  updatedAt!: Date;

  @OneToMany(() => Post, 'authorId')
  posts!: Post[];

  @OneToMany(() => Comment, 'userId')
  comments!: Comment[];
}

/**
 * Post entity demonstrating many-to-one and one-to-many relationships
 * Shows how entities reference each other through foreign keys
 */
@Entity({ tableName: 'posts' })
export class Post {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'boolean' })
  published!: boolean;

  @Column({ type: 'date' })
  createdAt!: Date;

  @Column({ type: 'date' })
  updatedAt!: Date;

  @ManyToOne(() => User, 'authorId')
  author!: User;

  @OneToMany(() => Comment, 'postId')
  comments!: Comment[];
}

/**
 * Comment entity demonstrating many-to-one relationships
 * Shows how entities can reference multiple parent entities
 */
@Entity({ tableName: 'comments' })
export class Comment {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'date' })
  createdAt!: Date;

  @ManyToOne(() => User, 'userId')
  user!: User;

  @ManyToOne(() => Post, 'postId')
  post!: Post;
}
```

#### Basic Configuration

```typescript
/**
 * Basic ORM configuration for standard usage
 * Demonstrates minimal setup with essential features
 */
const basicConfig = {
  database: {
    type: 'postgres' as const,
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    username: 'user',
    password: 'password',
  },
  entities: [User, Post, Comment],
  logging: {
    level: 'info' as const,
    format: 'text' as const,
    queries: true,
  },
};
```

#### Advanced Configuration

```typescript
/**
 * Advanced ORM configuration with all new features
 * Demonstrates real-time, GraphQL, performance analysis, and multi-tenancy
 */
const advancedConfig = {
  database: {
    type: 'postgres' as const,
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'vlodia_advanced',
    ssl: false,
  },
  entities: [User, Post, Comment],
  logging: {
    level: 'debug' as const,
    format: 'json' as const,
    queries: true,
  },
  cache: {
    enabled: true,
    type: 'memory' as const,
    ttl: 3600,
  },
  // Real-time features
  realtime: {
    enabled: true,
    port: 8080,
    path: '/ws',
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true,
    },
    heartbeat: {
      interval: 30000,
      timeout: 10000,
    },
  },
  // GraphQL features
  graphql: {
    enabled: true,
    path: '/graphql',
    playground: true,
    introspection: true,
    subscriptions: true,
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true,
    },
  },
  // Multi-tenancy
  tenancy: {
    enabled: true,
    defaultTenant: 'default',
  },
};
```

#### Basic Usage Example

```typescript
/**
 * Demonstrates basic CRUD operations, relationships, and transactions
 * Shows fundamental ORM usage patterns for production applications
 */
async function basicUsageExample() {
  console.log('Basic Vlodia ORM Usage Examples');
  console.log('=====================================');

  // Initialize ORM with basic configuration
  const orm = new Vlodia(basicConfig);
  await orm.initialize();

  try {
    // Create user entity instance
    const user = new User();
    user.name = 'John Doe';
    user.email = 'john@example.com';
    user.password = 'hashed_password';
    user.createdAt = new Date();
    user.updatedAt = new Date();

    // Save user to database using EntityManager
    const savedUser = await orm.manager.save(user);
    console.log('User created:', savedUser);

    // Create post entity with relationship to user
    const post = new Post();
    post.title = 'My First Post';
    post.content = 'This is my first post content';
    post.published = true;
    post.author = savedUser;
    post.createdAt = new Date();
    post.updatedAt = new Date();

    // Save post to database
    const savedPost = await orm.manager.save(post);
    console.log('Post created:', savedPost);

    // Create comment entity with relationships to both user and post
    const comment = new Comment();
    comment.content = 'Great post!';
    comment.user = savedUser;
    comment.post = savedPost;
    comment.createdAt = new Date();

    // Save comment to database
    const savedComment = await orm.manager.save(comment);
    console.log('Comment created:', savedComment);

    // Query users with relationships loaded
    const users = await orm.manager.find(User, {
      where: { name: 'John Doe' },
      relations: ['posts', 'comments'],
    });
    console.log('Users with relations:', users);

    // Query posts with author and comments loaded
    const posts = await orm.manager.find(Post, {
      where: { published: true },
      relations: ['author', 'comments'],
      orderBy: { createdAt: 'DESC' },
      limit: 10,
    });
    console.log('Published posts:', posts);

    // Transaction example demonstrating atomic operations
    await orm.transaction(async manager => {
      // Create user within transaction
      const user = new User();
      user.name = 'Jane Doe';
      user.email = 'jane@example.com';
      user.password = 'hashed_password';
      user.createdAt = new Date();
      user.updatedAt = new Date();

      const savedUser = await manager.save(user);

      // Create post within same transaction
      const post = new Post();
      post.title = 'Transaction Post';
      post.content = 'This post was created in a transaction';
      post.published = false;
      post.author = savedUser;
      post.createdAt = new Date();
      post.updatedAt = new Date();

      await manager.save(post);
    });
    console.log('Transaction completed');

    // Pagination example with limit and offset
    const paginatedUsers = await orm.manager.find(User, {
      limit: 10,
      offset: 0,
      orderBy: { createdAt: 'DESC' },
    });
    console.log('Paginated users:', paginatedUsers);

    // Count total number of users
    const userCount = await orm.manager.count(User);
    console.log('Total users:', userCount);

    // Check if user exists with specific criteria
    const userExists = await orm.manager.exists(User, {
      where: { email: 'john@example.com' },
    });
    console.log('User exists:', userExists);

    // Update existing user
    const userToUpdate = await orm.manager.findOne(User, {
      where: { email: 'john@example.com' },
    });

    if (userToUpdate) {
      userToUpdate.name = 'John Updated';
      userToUpdate.updatedAt = new Date();
      await orm.manager.save(userToUpdate);
      console.log('User updated:', userToUpdate);
    }

    // Complex query with multiple conditions and operators
    const complexQuery = await orm.manager.find(Post, {
      where: {
        $and: [
          { published: true },
          { $or: [{ title: { $like: '%first%' } }, { content: { $like: '%content%' } }] },
        ],
      },
      relations: ['author', 'comments'],
      orderBy: { createdAt: 'DESC' },
      limit: 5,
    });
    console.log('Complex query results:', complexQuery);
  } finally {
    await orm.close();
    console.log('Basic ORM closed');
  }
}
```

#### Advanced Usage Example

```typescript
/**
 * Demonstrates advanced features including real-time, GraphQL, performance analysis, and multi-tenancy
 * Shows enterprise-grade ORM capabilities for complex applications
 */
async function advancedUsageExample() {
  console.log('Advanced Vlodia ORM Usage Examples');
  console.log('======================================');

  // Initialize ORM with all advanced features enabled
  const orm = new Vlodia(advancedConfig);
  await orm.initialize();

  try {
    // Real-time WebSocket features demonstration
    console.log('Real-time Features:');
    const webSocketManager = orm.getWebSocketManager();
    if (webSocketManager) {
      console.log('WebSocket Manager active');
      console.log(`   - Port: ${advancedConfig.realtime?.port || 8080}`);
      console.log(`   - Path: ${advancedConfig.realtime?.path || '/ws'}`);
      console.log(`   - Connections: 0`);
    }

    // GraphQL integration demonstration
    console.log('GraphQL Integration:');
    const graphqlGenerator = orm.getGraphQLGenerator();
    if (graphqlGenerator) {
      const schema = orm.generateGraphQLSchema();
      console.log('GraphQL schema generated');
      console.log(`   - Types: ${Object.keys(schema.types).length}`);
      console.log(`   - Queries: ${Object.keys(schema.queries).length}`);
      console.log(`   - Mutations: ${Object.keys(schema.mutations).length}`);
      console.log(`   - Subscriptions: ${Object.keys(schema.subscriptions).length}`);
    }

    // Performance analysis and query optimization
    console.log('Performance Analysis:');
    const queryAnalyzer = orm.getQueryAnalyzer();
    if (queryAnalyzer) {
      // Simulate some queries for analysis
      await orm.manager.find(User, {});
      await orm.manager.find(Post, {});

      const metrics = orm.getPerformanceMetrics();
      console.log('Query Analyzer active');
      console.log(`   - Total Queries: ${metrics.totalQueries}`);
      console.log(`   - N+1 Queries: ${metrics.n1Queries}`);
      console.log(`   - Performance Score: ${metrics.performanceScore}/100`);
    }

    // Schema visualization and diagram generation
    console.log('Schema Visualization:');
    const schemaDesigner = orm.getSchemaDesigner();
    if (schemaDesigner) {
      const diagram = orm.generateSchemaDiagram();
      console.log('Schema Designer active');
      console.log(`   - Nodes: ${diagram.nodes.length}`);
      console.log(`   - Edges: ${diagram.edges.length}`);
      console.log(`   - Layout: hierarchical`);

      // Generate SVG representation of schema
      const svg = schemaDesigner.generateSVG(diagram);
      console.log(`   - SVG generated (${svg.length} characters)`);
    }

    // Multi-tenancy support demonstration
    console.log('Multi-tenancy:');
    const tenantManager = orm.getTenantManager();
    if (tenantManager) {
      console.log('Tenant Manager active');

      // Create a new tenant with configuration
      const tenant = await tenantManager.createTenant({
        name: 'demo-tenant',
        domain: 'demo.example.com',
        database: 'demo_tenant_db',
        schema: 'demo_tenant_schema',
        config: {
          features: ['basic', 'advanced'],
          limits: {
            maxUsers: 1000,
            maxStorage: 10000000,
            maxRequests: 100000,
          },
          settings: {
            timezone: 'UTC',
            language: 'en',
          },
          security: {
            encryption: true,
            auditLogging: true,
            dataRetention: 365,
          },
        },
      });

      console.log(`   - Tenant created: ${tenant.name} (${tenant.id})`);
      console.log(`   - Database: ${tenant.database}`);
      console.log(`   - Schema: ${tenant.schema}`);
    }

    // Entity operations with advanced features
    console.log('Entity Operations:');

    // Create user with real-time events
    const user = new User();
    user.name = 'John Doe';
    user.email = 'john@example.com';
    user.password = 'hashed_password';
    user.createdAt = new Date();
    user.updatedAt = new Date();
    const savedUser = await orm.manager.save(user);
    console.log(`User created: ${savedUser.name} (ID: ${savedUser.id})`);

    // Create post with real-time events
    const post = new Post();
    post.title = 'Advanced Vlodia ORM';
    post.content = 'Demonstrating all new features...';
    post.published = true;
    post.author = savedUser;
    post.createdAt = new Date();
    post.updatedAt = new Date();
    const savedPost = await orm.manager.save(post);
    console.log(`Post created: ${savedPost.title} (ID: ${savedPost.id})`);

    // Query with performance analysis
    const users = await orm.manager.find(User, {
      relations: ['posts'],
    });
    console.log(`Users with posts loaded: ${users.length}`);

    // Real-time subscription events
    if (webSocketManager) {
      console.log('Real-time Subscriptions:');
      console.log('   - User events: user_created, user_updated, user_deleted');
      console.log('   - Post events: post_created, post_updated, post_deleted');
      console.log('   - Custom events: tenant_created, performance_alert');
    }

    // GraphQL query capabilities
    if (graphqlGenerator) {
      console.log('GraphQL Queries Available:');
      console.log('   - users: [User]');
      console.log('   - user(id: ID!): User');
      console.log('   - posts: [Post]');
      console.log('   - post(id: ID!): Post');
      console.log('   - createUser(input: UserInput!): User');
      console.log('   - updateUser(id: ID!, input: UserInput!): User');
      console.log('   - deleteUser(id: ID!): Boolean');
    }

    console.log('All advanced features demonstrated successfully!');
    console.log('Available CLI Commands:');
    console.log('   - vlodia realtime:start --port 8080');
    console.log('   - vlodia graphql:generate --output schema.graphql');
    console.log('   - vlodia schema:visualize --format svg');
    console.log('   - vlodia performance:analyze');
    console.log('   - vlodia tenant:create --name demo --domain demo.com');
  } catch (error) {
    console.error('Error demonstrating advanced features:', error);
  } finally {
    await orm.close();
    console.log('Advanced ORM closed');
  }
}
```

#### Repository Pattern Example

```typescript
/**
 * Demonstrates repository pattern usage with advanced querying capabilities
 * Shows how to use repositories for complex data access patterns
 */
async function repositoryPatternExample() {
  console.log('Repository Pattern Examples');
  console.log('=================================');

  // Initialize ORM with caching enabled
  const orm = new Vlodia({
    ...basicConfig,
    cache: {
      enabled: true,
      type: 'memory' as const,
      ttl: 3600,
    },
  });

  await orm.initialize();

  try {
    // Get repository for User entity
    const userRepository = orm.manager.getRepository(User);

    // Find users with pagination
    const paginatedUsers = await userRepository.find({ limit: 10, offset: 0 });
    console.log('Paginated users:', paginatedUsers);

    // Find users with specific field selection
    const usersWithPosts = await userRepository.find({ select: ['id', 'name', 'email'] });
    console.log('Users with relations:', usersWithPosts);

    // Find users by exact field match
    const usersByName = await userRepository.find({ where: { name: 'John Doe' } });
    console.log('Users by name:', usersByName);

    // Find users where field value is in array
    const usersByIds = await userRepository.find({ where: { id: { in: [1, 2, 3] } } });
    console.log('Users by IDs:', usersByIds);

    // Find users with pattern matching using LIKE operator
    const usersByPattern = await userRepository.find({ where: { name: { like: '%John%' } } });
    console.log('Users by pattern:', usersByPattern);

    // Find users with date range filtering
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');
    const usersByDateRange = await userRepository.find({
      where: { createdAt: { between: [startDate, endDate] } },
    });
    console.log('Users by date range:', usersByDateRange);

    // Find users with null values
    const usersWithNullEmail = await userRepository.find({ where: { email: { is: null } } });
    console.log('Users with null email:', usersWithNullEmail);

    // Find users with non-null values
    const usersWithEmail = await userRepository.find({ where: { email: { isNot: null } } });
    console.log('Users with email:', usersWithEmail);

    // Find users ordered by specific field
    const usersOrdered = await userRepository.find({ orderBy: { createdAt: 'DESC' } });
    console.log('Users ordered by creation date:', usersOrdered);

    // Find first N users with ascending order
    const firstUsers = await userRepository.find({ limit: 5, orderBy: { id: 'ASC' } });
    console.log('First 5 users:', firstUsers);

    // Find last N users with descending order
    const lastUsers = await userRepository.find({ limit: 5, orderBy: { id: 'DESC' } });
    console.log('Last 5 users:', lastUsers);

    // Batch operations for multiple entities
    const users = [new User(), new User(), new User()];

    // Configure first user
    users[0]!.name = 'User 1';
    users[0]!.email = 'user1@example.com';
    users[0]!.password = 'password1';
    users[0]!.createdAt = new Date();
    users[0]!.updatedAt = new Date();

    // Configure second user
    users[1]!.name = 'User 2';
    users[1]!.email = 'user2@example.com';
    users[1]!.password = 'password2';
    users[1]!.createdAt = new Date();
    users[1]!.updatedAt = new Date();

    // Configure third user
    users[2]!.name = 'User 3';
    users[2]!.email = 'user3@example.com';
    users[2]!.password = 'password3';
    users[2]!.createdAt = new Date();
    users[2]!.updatedAt = new Date();

    // Save all users in batch operation
    const savedUsers = await userRepository.saveMany(users);
    console.log('Batch saved users:', savedUsers);

    // Event handling for transaction lifecycle
    orm.events.on('transaction:start', data => {
      console.log('Transaction started:', data.transactionId);
    });

    orm.events.on('transaction:commit', data => {
      console.log('Transaction committed:', data.transactionId);
    });

    orm.events.on('transaction:rollback', data => {
      console.log('Transaction rolled back:', data.transactionId);
    });

    // Cache operations demonstration
    if (orm.cacheInstance) {
      await orm.cacheInstance.set('test-key', 'test-value', 3600);
      const cachedValue = await orm.cacheInstance.get('test-key');
      console.log('Cached value:', cachedValue);
    }
  } finally {
    await orm.close();
    console.log('Repository ORM closed');
  }
}
```

#### Complete Example Runner

```typescript
/**
 * Main execution function that runs all examples
 * Demonstrates comprehensive ORM usage from basic to advanced features
 */
async function runAllExamples() {
  console.log('Vlodia ORM Complete Usage Examples');
  console.log('=====================================');
  console.log('Demonstrating all ORM features including new advanced capabilities');
  console.log('');

  try {
    // Execute basic usage examples
    await basicUsageExample();
    
    // Execute advanced usage examples
    await advancedUsageExample();
    
    // Execute repository pattern examples
    await repositoryPatternExample();

    console.log('All examples completed successfully!');
    console.log('Summary of demonstrated features:');
    console.log('   - Basic CRUD operations');
    console.log('   - Entity relationships');
    console.log('   - Transactions');
    console.log('   - Query building');
    console.log('   - Pagination');
    console.log('   - Repository pattern');
    console.log('   - Caching');
    console.log('   - Event handling');
    console.log('   - Real-time WebSocket features');
    console.log('   - GraphQL schema generation');
    console.log('   - Performance analysis');
    console.log('   - Schema visualization');
    console.log('   - Multi-tenancy support');
    console.log('Vlodia ORM is production-ready!');
  } catch (error) {
    console.error('Error running examples:', error);
    process.exit(1);
  }
}

// Export functions for use in other examples
export {
  runAllExamples,
  basicUsageExample,
  advancedUsageExample,
  repositoryPatternExample,
  basicConfig,
  advancedConfig,
};

// Execute examples if this file is run directly
if (require.main === module) {
  runAllExamples();
}
```

## Development

### Watch Mode

```bash
# Watch for changes and auto-reload
vlodia watch
```

### Validation

```bash
# Validate entities and configuration
vlodia validate
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Build for production
npm run build

# Build and watch for changes
npm run build:watch
```

## Advanced Features

### Real-time Features

#### WebSocket Integration

```typescript
import { Vlodia } from 'vlodia';

const orm = new Vlodia({
  database: { /* ... */ },
  realtime: {
    enabled: true,
    port: 8080,
    path: '/ws',
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true
    }
  }
});

await orm.initialize();

// Get WebSocket manager
const wsManager = orm.getWebSocketManager();

// Subscribe to entity events
wsManager?.subscribe('user_created', (data) => {
  console.log('New user created:', data);
});

// Publish custom events
wsManager?.publish('custom_event', { message: 'Hello World' });
```

#### Real-time Subscriptions

```typescript
// Client-side WebSocket connection
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'user_created':
      console.log('User created:', data.payload);
      break;
    case 'user_updated':
      console.log('User updated:', data.payload);
      break;
    case 'user_deleted':
      console.log('User deleted:', data.payload);
      break;
  }
};

// Subscribe to specific events
ws.send(JSON.stringify({
  type: 'subscribe',
  event: 'user_created'
}));
```

### GraphQL Integration

#### Schema Generation

```typescript
import { Vlodia } from 'vlodia';

const orm = new Vlodia({
  database: { /* ... */ },
  graphql: {
    enabled: true,
    path: '/graphql',
    playground: true,
    introspection: true,
    subscriptions: true
  }
});

await orm.initialize();

// Generate GraphQL schema
const schema = orm.generateGraphQLSchema();
console.log('Generated types:', Object.keys(schema.types));
console.log('Generated queries:', Object.keys(schema.queries));
console.log('Generated mutations:', Object.keys(schema.mutations));
```

#### GraphQL Resolvers

```typescript
// Express.js integration
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';

const app = express();

// Use generated schema
const schema = orm.generateGraphQLSchema();
const graphqlSchema = buildSchema(schema.schema);

app.use('/graphql', graphqlHTTP({
  schema: graphqlSchema,
  rootValue: schema.resolvers,
  graphiql: true
}));

app.listen(4000, () => {
  console.log('GraphQL server running on http://localhost:4000/graphql');
});
```

#### GraphQL Queries

```graphql
# Query users with posts
query GetUsersWithPosts {
  users {
    id
    name
    email
    posts {
      id
      title
      content
      published
    }
  }
}

# Query specific user
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
    }
  }
}

# Create user mutation
mutation CreateUser($input: UserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}

# Update user mutation
mutation UpdateUser($id: ID!, $input: UserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
  }
}

# Delete user mutation
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}

# Real-time subscription
subscription UserCreated {
  userCreated {
    id
    name
    email
  }
}
```

### Performance Analysis

#### Query Optimization

```typescript
import { Vlodia } from 'vlodia';

const orm = new Vlodia({
  database: { /* ... */ },
  // Performance monitoring is automatically enabled
});

await orm.initialize();

// Get query analyzer
const analyzer = orm.getQueryAnalyzer();

// Analyze specific query
const analysis = orm.analyzeQuery(
  'SELECT * FROM users WHERE active = true',
  150, // execution time in ms
  1000 // memory usage in KB
);

console.log('Query analysis:', analysis);
console.log('N+1 detected:', analysis.n1Detected);
console.log('Performance score:', analysis.performanceScore);
console.log('Suggestions:', analysis.suggestions);

// Get performance metrics
const metrics = orm.getPerformanceMetrics();
console.log('Total queries:', metrics.totalQueries);
console.log('N+1 queries:', metrics.n1Queries);
console.log('Average execution time:', metrics.avgExecutionTime);
console.log('Performance score:', metrics.performanceScore);
```

#### N+1 Query Detection

```typescript
// Example of N+1 query detection
async function demonstrateN1Detection() {
  // This will trigger N+1 queries
  const users = await orm.manager.find(User, {});
  
  for (const user of users) {
    // This creates N+1 queries
    const posts = await orm.manager.find(Post, {
      where: { authorId: user.id }
    });
  }
  
  // Get N+1 detection report
  const report = analyzer.getN1DetectionReport();
  console.log('N+1 queries detected:', report.detected);
  console.log('Affected entities:', report.affectedEntities);
  console.log('Optimization suggestions:', report.suggestions);
}

// Optimized version
async function optimizedQuery() {
  // Use relations to avoid N+1
  const users = await orm.manager.find(User, {
    relations: ['posts'] // This loads posts in a single query
  });
}
```

### Schema Visualization

#### Generate Schema Diagrams

```typescript
import { Vlodia } from 'vlodia';

const orm = new Vlodia({
  database: { /* ... */ }
});

await orm.initialize();

// Get schema designer
const designer = orm.getSchemaDesigner();

// Generate schema diagram
const diagram = orm.generateSchemaDiagram();
console.log('Schema nodes:', diagram.nodes.length);
console.log('Schema edges:', diagram.edges.length);

// Generate SVG representation
const svg = designer.generateSVG(diagram);
console.log('SVG generated:', svg.length, 'characters');

// Save SVG to file
import fs from 'fs';
fs.writeFileSync('schema.svg', svg);

// Generate different layouts
const hierarchicalDiagram = designer.generateSchemaDiagram('hierarchical');
const forceDiagram = designer.generateSchemaDiagram('force');
const circularDiagram = designer.generateSchemaDiagram('circular');
```

#### Interactive Schema Designer

```typescript
// CLI command to visualize schema
// vlodia schema:visualize --format svg --output schema.svg

// Programmatic schema visualization
const config = {
  layout: 'hierarchical',
  direction: 'TB', // Top to Bottom
  nodeSpacing: 50,
  levelSpacing: 100,
  edgeRouting: 'orthogonal'
};

const customDiagram = designer.generateSchemaDiagram(config);
const customSvg = designer.generateSVG(customDiagram);
```

### Multi-tenancy Support

#### Tenant Management

```typescript
import { Vlodia } from 'vlodia';

const orm = new Vlodia({
  database: { /* ... */ },
  tenancy: {
    enabled: true,
    defaultTenant: 'default'
  }
});

await orm.initialize();

// Get tenant manager
const tenantManager = orm.getTenantManager();

// Create new tenant
const tenant = await tenantManager.createTenant({
  name: 'acme-corp',
  domain: 'acme.example.com',
  database: 'acme_tenant_db',
  schema: 'acme_schema',
  config: {
    features: ['basic', 'advanced', 'enterprise'],
    limits: {
      maxUsers: 10000,
      maxStorage: 100000000,
      maxRequests: 1000000
    },
    settings: {
      timezone: 'America/New_York',
      language: 'en',
      currency: 'USD'
    },
    security: {
      encryption: true,
      auditLogging: true,
      dataRetention: 2555, // 7 years
      backupFrequency: 'daily'
    }
  }
});

console.log('Tenant created:', tenant.id);
```

#### Tenant Operations

```typescript
// Switch to specific tenant
await tenantManager.setCurrentTenant('acme-corp');

// Get current tenant context
const context = tenantManager.getCurrentContext();
console.log('Current tenant:', context.tenantId);

// Execute query in tenant context
const users = await tenantManager.executeTenantQuery({
  entity: User,
  operation: 'find',
  options: { where: { active: true } }
});

// Create tenant-specific entities
const tenantUser = new User();
tenantUser.name = 'Tenant User';
tenantUser.email = 'user@acme.com';
await tenantManager.saveInTenant(tenantUser);

// Get tenant information
const tenantInfo = tenantManager.getTenant('acme-corp');
console.log('Tenant info:', tenantInfo);
```

#### Tenant Isolation

```typescript
// Each tenant has isolated data
await tenantManager.setCurrentTenant('tenant-a');
const usersA = await orm.manager.find(User, {});

await tenantManager.setCurrentTenant('tenant-b');
const usersB = await orm.manager.find(User, {});

// usersA and usersB are completely separate
console.log('Tenant A users:', usersA.length);
console.log('Tenant B users:', usersB.length);
```

### Caching Strategies

#### Multi-level Caching

```typescript
import { Vlodia } from 'vlodia';

const orm = new Vlodia({
  database: { /* ... */ },
  cache: {
    enabled: true,
    type: 'redis', // or 'memory'
    ttl: 3600,
    maxSize: 10000,
    strategy: 'lru'
  }
});

await orm.initialize();

// L1 Cache (Identity Map)
const user1 = await orm.manager.findOne(User, { where: { id: 1 } });
const user1Cached = await orm.manager.findOne(User, { where: { id: 1 } }); // From L1 cache

// L2 Cache (Redis/Memory)
await orm.cacheInstance.set('user:1', user1, 3600);
const cachedUser = await orm.cacheInstance.get('user:1');

// Cache invalidation
await orm.cacheInstance.invalidate('user:1');
await orm.cacheInstance.invalidatePattern('user:*');
```

#### Cache Configuration

```typescript
// Advanced cache configuration
const orm = new Vlodia({
  database: { /* ... */ },
  cache: {
    enabled: true,
    type: 'redis',
    ttl: 3600,
    maxSize: 10000,
    strategy: 'lru',
    compression: true,
    serialization: 'json',
    invalidation: {
      onUpdate: true,
      onDelete: true,
      onInsert: false
    },
    redis: {
      host: 'localhost',
      port: 6379,
      password: 'secret',
      db: 0
    }
  }
});
```

### Migration Management

#### Creating Migrations

```typescript
// CLI command to create migration
// vlodia migration:create AddUserTable

// Programmatic migration creation
import { MigrationManager } from 'vlodia';

const migrationManager = new MigrationManager(orm);

// Create migration
const migration = await migrationManager.createMigration('AddUserTable', {
  up: `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,
  down: `
    DROP TABLE users;
  `
});

console.log('Migration created:', migration.id);
```

#### Running Migrations

```typescript
// Run all pending migrations
await migrationManager.migrate();

// Run specific migration
await migrationManager.migrateTo('20231201000000');

// Rollback migrations
await migrationManager.rollback(1); // Rollback last migration
await migrationManager.rollbackTo('20231101000000');

// Check migration status
const status = await migrationManager.getStatus();
console.log('Pending migrations:', status.pending);
console.log('Executed migrations:', status.executed);
```

### Validation and Serialization

#### Entity Validation

```typescript
import { EntityValidator } from 'vlodia';

const validator = new EntityValidator();

// Validate entity before saving
const user = new User();
user.name = 'John Doe';
user.email = 'invalid-email'; // Invalid email

const validationResult = await validator.validate(user);
if (!validationResult.isValid) {
  console.log('Validation errors:', validationResult.errors);
  // Handle validation errors
}

// Custom validation rules
validator.addRule('email', (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
});

validator.addRule('password', (value) => {
  return value.length >= 8;
});
```

#### Entity Serialization

```typescript
import { EntitySerializer } from 'vlodia';

const serializer = new EntitySerializer();

// Serialize entity to JSON
const user = await orm.manager.findOne(User, { where: { id: 1 } });
const serialized = serializer.serialize(user, {
  includeRelations: true,
  excludeColumns: ['password'],
  format: 'json'
});

console.log('Serialized user:', serialized);

// Deserialize JSON to entity
const deserializedUser = serializer.deserialize(User, serialized);
```

### Event Handling

#### Entity Events

```typescript
// Listen to entity events
orm.events.on('entity:created', (data) => {
  console.log('Entity created:', data.entity, data.id);
});

orm.events.on('entity:updated', (data) => {
  console.log('Entity updated:', data.entity, data.id);
});

orm.events.on('entity:deleted', (data) => {
  console.log('Entity deleted:', data.entity, data.id);
});

// Transaction events
orm.events.on('transaction:start', (data) => {
  console.log('Transaction started:', data.transactionId);
});

orm.events.on('transaction:commit', (data) => {
  console.log('Transaction committed:', data.transactionId);
});

orm.events.on('transaction:rollback', (data) => {
  console.log('Transaction rolled back:', data.transactionId);
});
```

#### Custom Events

```typescript
// Emit custom events
orm.events.emit('user:login', {
  userId: 1,
  timestamp: new Date(),
  ipAddress: '192.168.1.1'
});

// Listen to custom events
orm.events.on('user:login', (data) => {
  console.log('User logged in:', data.userId);
  // Update last login time
  orm.manager.update(User, data.userId, {
    lastLoginAt: data.timestamp
  });
});
```

### Logging and Diagnostics

#### Structured Logging

```typescript
import { Vlodia } from 'vlodia';

const orm = new Vlodia({
  database: { /* ... */ },
  logging: {
    level: 'debug',
    format: 'json',
    queries: true,
    slowQueries: true,
    slowQueryThreshold: 1000
  }
});

// Custom logger
const customLogger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${message}`, meta);
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${message}`, meta);
  },
  debug: (message: string, meta?: any) => {
    console.debug(`[DEBUG] ${message}`, meta);
  }
};

orm.setLogger(customLogger);
```

#### Query Profiling

```typescript
// Enable query profiling
const orm = new Vlodia({
  database: { /* ... */ },
  logging: {
    level: 'debug',
    queries: true,
    slowQueries: true,
    slowQueryThreshold: 100
  }
});

// Get query statistics
const stats = orm.getQueryStatistics();
console.log('Total queries:', stats.totalQueries);
console.log('Average execution time:', stats.avgExecutionTime);
console.log('Slow queries:', stats.slowQueries);
```

### Testing

#### Unit Testing

```typescript
import { Vlodia } from 'vlodia';
import { User } from './entities/User';

describe('User Entity', () => {
  let orm: Vlodia;

  beforeAll(async () => {
    orm = new Vlodia({
      database: {
        type: 'sqlite',
        database: ':memory:'
      },
      entities: [User],
      logging: {
        level: 'error' // Reduce logging in tests
      }
    });
    await orm.initialize();
  });

  afterAll(async () => {
    await orm.close();
  });

  beforeEach(async () => {
    // Clean database before each test
    await orm.manager.clear(User);
  });

  it('should create user', async () => {
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.password = 'password123';
    user.createdAt = new Date();
    user.updatedAt = new Date();

    const savedUser = await orm.manager.save(user);
    expect(savedUser.id).toBeDefined();
    expect(savedUser.name).toBe('Test User');
  });

  it('should find user by email', async () => {
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.password = 'password123';
    user.createdAt = new Date();
    user.updatedAt = new Date();
    await orm.manager.save(user);

    const foundUser = await orm.manager.findOne(User, {
      where: { email: 'test@example.com' }
    });

    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe('test@example.com');
  });
});
```

#### Integration Testing

```typescript
import { Vlodia } from 'vlodia';
import { User, Post } from './entities';

describe('User-Post Integration', () => {
  let orm: Vlodia;

  beforeAll(async () => {
    orm = new Vlodia({
      database: {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'test',
        password: 'test',
        database: 'test_db'
      },
      entities: [User, Post]
    });
    await orm.initialize();
  });

  afterAll(async () => {
    await orm.close();
  });

  it('should create user with posts', async () => {
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.password = 'password123';
    user.createdAt = new Date();
    user.updatedAt = new Date();

    const savedUser = await orm.manager.save(user);

    const post = new Post();
    post.title = 'Test Post';
    post.content = 'Test content';
    post.published = true;
    post.author = savedUser;
    post.createdAt = new Date();
    post.updatedAt = new Date();

    const savedPost = await orm.manager.save(post);

    expect(savedPost.id).toBeDefined();
    expect(savedPost.author.id).toBe(savedUser.id);
  });
});
```

### Production Deployment

#### Environment Configuration

```typescript
// config/production.ts
export const productionConfig = {
  database: {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'myapp',
    ssl: process.env.NODE_ENV === 'production'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    queries: process.env.LOG_QUERIES === 'true'
  },
  cache: {
    enabled: true,
    type: 'redis',
    ttl: 3600,
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    }
  }
};
```

#### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY vlodia ./vlodia

EXPOSE 3000

CMD ["node", "dist/app.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_USERNAME=postgres
      - DB_PASSWORD=password
      - DB_DATABASE=myapp
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### CLI Commands

#### Available Commands

```bash
# Project initialization
vlodia init <project-name>

# Entity generation
vlodia generate:entity User
vlodia generate:entity Post --with-relations

# Migration management
vlodia migration:create AddUserTable
vlodia migration:run
vlodia migration:revert
vlodia migration:status

# Schema management
vlodia schema:sync
vlodia schema:drop
vlodia schema:validate

# Real-time features
vlodia realtime:start --port 8080
vlodia realtime:stop

# GraphQL features
vlodia graphql:generate --output schema.graphql
vlodia graphql:start --port 4000

# Performance analysis
vlodia performance:analyze
vlodia performance:report

# Schema visualization
vlodia schema:visualize --format svg
vlodia schema:visualize --format png

# Multi-tenancy
vlodia tenant:create --name acme --domain acme.com
vlodia tenant:list
vlodia tenant:delete acme

# Validation
vlodia validate
vlodia validate:entities
vlodia validate:schema

# Development
vlodia watch
vlodia build
vlodia test
```

### Best Practices

#### Entity Design

```typescript
// Good entity design
@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string', length: 100, nullable: false })
  name!: string;

  @Column({ type: 'string', unique: true, nullable: false })
  email!: string;

  @Column({ type: 'string', nullable: false })
  password!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  @OneToMany(() => Post, 'authorId')
  posts!: Post[];

  // Business logic methods
  isActive(): boolean {
    return this.active;
  }

  getFullName(): string {
    return this.name;
  }

  // Validation methods
  validateEmail(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }
}
```

#### Query Optimization

```typescript
// Good: Use relations to avoid N+1 queries
const users = await orm.manager.find(User, {
  relations: ['posts', 'comments']
});

// Bad: N+1 queries
const users = await orm.manager.find(User, {});
for (const user of users) {
  const posts = await orm.manager.find(Post, {
    where: { authorId: user.id }
  });
}

// Good: Use pagination for large datasets
const users = await orm.manager.find(User, {
  limit: 20,
  offset: 0,
  orderBy: { createdAt: 'DESC' }
});

// Good: Use specific field selection
const users = await orm.manager.find(User, {
  select: ['id', 'name', 'email']
});
```

#### Error Handling

```typescript
import { VlodiaError } from 'vlodia';

try {
  const user = await orm.manager.save(newUser);
  console.log('User created:', user);
} catch (error) {
  if (error instanceof VlodiaError) {
    console.error('Vlodia error:', error.message);
    console.error('Error code:', error.code);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Troubleshooting

#### Common Issues

```typescript
// Issue: Connection timeout
const orm = new Vlodia({
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'myapp',
    connectionTimeout: 30000, // 30 seconds
    idleTimeout: 300000, // 5 minutes
    maxConnections: 10
  }
});

// Issue: Memory leaks
// Solution: Always close connections
try {
  await orm.initialize();
  // ... your code
} finally {
  await orm.close();
}

// Issue: Slow queries
// Solution: Enable query logging and optimization
const orm = new Vlodia({
  database: { /* ... */ },
  logging: {
    level: 'debug',
    queries: true,
    slowQueries: true,
    slowQueryThreshold: 1000
  }
});
```

#### Performance Monitoring

```typescript
// Monitor performance metrics
setInterval(async () => {
  const metrics = orm.getPerformanceMetrics();
  console.log('Performance metrics:', {
    totalQueries: metrics.totalQueries,
    avgExecutionTime: metrics.avgExecutionTime,
    n1Queries: metrics.n1Queries,
    performanceScore: metrics.performanceScore
  });
}, 60000); // Every minute
```

## Documentation

- **API Reference**: [https://vlodia.github.io/vlodia](https://vlodia.github.io/vlodia)
- **User Guide**: [https://vlodia.github.io/vlodia/guide](https://vlodia.github.io/vlodia/guide)
- **Examples**: [https://vlodia.github.io/vlodia/examples](https://vlodia.github.io/vlodia/examples)
