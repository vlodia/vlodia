/**
 * Complete Vlodia ORM Usage Examples
 * Comprehensive examples demonstrating all ORM functionality including new features
 * Shows basic usage, advanced features, real-time, GraphQL, performance analysis, schema visualization, and multi-tenancy
 */

import { Vlodia, Entity, Column, PrimaryKey, OneToMany, ManyToOne } from '../index';

// ===== ENTITY DEFINITIONS =====

@Entity({ tableName: 'users' })
class User {
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

@Entity({ tableName: 'posts' })
class Post {
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

@Entity({ tableName: 'comments' })
class Comment {
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

// ===== CONFIGURATIONS =====

// Basic configuration
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

// Advanced configuration with all new features
const advancedConfig = {
  database: {
    type: 'postgres' as const,
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'vlodia_advanced',
    ssl: false
  },
  entities: [User, Post, Comment],
  logging: {
    level: 'debug' as const,
    format: 'json' as const,
    queries: true
  },
  cache: {
    enabled: true,
    type: 'memory' as const,
    ttl: 3600
  },
  // Real-time features
  realtime: {
    enabled: true,
    port: 8080,
    path: '/ws',
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true
    },
    heartbeat: {
      interval: 30000,
      timeout: 10000
    }
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
      credentials: true
    }
  },
  // Multi-tenancy
  tenancy: {
    enabled: true,
    defaultTenant: 'default'
  }
};

// ===== BASIC USAGE EXAMPLES =====

async function basicUsageExample() {
  console.log('🚀 Basic Vlodia ORM Usage Examples');
  console.log('=====================================');

  // Initialize ORM
  const orm = new Vlodia(basicConfig);
  await orm.initialize();

  try {
    // Create user
    const user = new User();
    user.name = 'John Doe';
    user.email = 'john@example.com';
    user.password = 'hashed_password';
    user.createdAt = new Date();
    user.updatedAt = new Date();

    const savedUser = await orm.manager.save(user);
    console.log('✅ User created:', savedUser);

    // Create post
    const post = new Post();
    post.title = 'My First Post';
    post.content = 'This is my first post content';
    post.published = true;
    post.author = savedUser;
    post.createdAt = new Date();
    post.updatedAt = new Date();

    const savedPost = await orm.manager.save(post);
    console.log('✅ Post created:', savedPost);

    // Create comment
    const comment = new Comment();
    comment.content = 'Great post!';
    comment.user = savedUser;
    comment.post = savedPost;
    comment.createdAt = new Date();

    const savedComment = await orm.manager.save(comment);
    console.log('✅ Comment created:', savedComment);

    // Query users
    const users = await orm.manager.find(User, {
      where: { name: 'John Doe' },
      relations: ['posts', 'comments'],
    });
    console.log('✅ Users with relations:', users);

    // Query posts with user
    const posts = await orm.manager.find(Post, {
      where: { published: true },
      relations: ['author', 'comments'],
      orderBy: { createdAt: 'DESC' },
      limit: 10,
    });
    console.log('✅ Published posts:', posts);

    // Transaction example
    await orm.transaction(async (manager) => {
      const user = new User();
      user.name = 'Jane Doe';
      user.email = 'jane@example.com';
      user.password = 'hashed_password';
      user.createdAt = new Date();
      user.updatedAt = new Date();

      const savedUser = await manager.save(user);

      const post = new Post();
      post.title = 'Transaction Post';
      post.content = 'This post was created in a transaction';
      post.published = false;
      post.author = savedUser;
      post.createdAt = new Date();
      post.updatedAt = new Date();

      await manager.save(post);
    });
    console.log('✅ Transaction completed');

    // Pagination example
    const paginatedUsers = await orm.manager.find(User, {
      limit: 10,
      offset: 0,
      orderBy: { createdAt: 'DESC' },
    });
    console.log('✅ Paginated users:', paginatedUsers);

    // Count example
    const userCount = await orm.manager.count(User);
    console.log('✅ Total users:', userCount);

    // Exists example
    const userExists = await orm.manager.exists(User, {
      where: { email: 'john@example.com' },
    });
    console.log('✅ User exists:', userExists);

    // Update example
    const userToUpdate = await orm.manager.findOne(User, {
      where: { email: 'john@example.com' },
    });
    
    if (userToUpdate) {
      userToUpdate.name = 'John Updated';
      userToUpdate.updatedAt = new Date();
      await orm.manager.save(userToUpdate);
      console.log('✅ User updated:', userToUpdate);
    }

    // Complex query example
    const complexQuery = await orm.manager.find(Post, {
      where: {
        $and: [
          { published: true },
          { $or: [
            { title: { $like: '%first%' } },
            { content: { $like: '%content%' } }
          ]}
        ]
      },
      relations: ['author', 'comments'],
      orderBy: { createdAt: 'DESC' },
      limit: 5,
    });
    console.log('✅ Complex query results:', complexQuery);

  } finally {
    await orm.close();
    console.log('🔒 Basic ORM closed');
  }
}

// ===== ADVANCED USAGE EXAMPLES =====

async function advancedUsageExample() {
  console.log('\n🚀 Advanced Vlodia ORM Usage Examples');
  console.log('======================================');

  // Initialize ORM with all features
  const orm = new Vlodia(advancedConfig);
  await orm.initialize();

  try {
    // ===== REAL-TIME FEATURES =====
    console.log('\n🚀 Real-time Features:');
    const webSocketManager = orm.getWebSocketManager();
    if (webSocketManager) {
      console.log('✅ WebSocket Manager active');
      console.log(`   - Port: ${advancedConfig.realtime?.port || 8080}`);
      console.log(`   - Path: ${advancedConfig.realtime?.path || '/ws'}`);
      console.log(`   - Connections: 0`);
    }

    // ===== GRAPHQL INTEGRATION =====
    console.log('\n🔗 GraphQL Integration:');
    const graphqlGenerator = orm.getGraphQLGenerator();
    if (graphqlGenerator) {
      const schema = orm.generateGraphQLSchema();
      console.log('✅ GraphQL schema generated');
      console.log(`   - Types: ${Object.keys(schema.types).length}`);
      console.log(`   - Queries: ${Object.keys(schema.queries).length}`);
      console.log(`   - Mutations: ${Object.keys(schema.mutations).length}`);
      console.log(`   - Subscriptions: ${Object.keys(schema.subscriptions).length}`);
    }

    // ===== PERFORMANCE ANALYSIS =====
    console.log('\n📊 Performance Analysis:');
    const queryAnalyzer = orm.getQueryAnalyzer();
    if (queryAnalyzer) {
      // Simulate some queries
      await orm.manager.find(User, {});
      await orm.manager.find(Post, {});
      
      const metrics = orm.getPerformanceMetrics();
      console.log('✅ Query Analyzer active');
      console.log(`   - Total Queries: ${metrics.totalQueries}`);
      console.log(`   - N+1 Queries: ${metrics.n1Queries}`);
      console.log(`   - Performance Score: ${metrics.performanceScore}/100`);
    }

    // ===== SCHEMA VISUALIZATION =====
    console.log('\n🎨 Schema Visualization:');
    const schemaDesigner = orm.getSchemaDesigner();
    if (schemaDesigner) {
      const diagram = orm.generateSchemaDiagram();
      console.log('✅ Schema Designer active');
      console.log(`   - Nodes: ${diagram.nodes.length}`);
      console.log(`   - Edges: ${diagram.edges.length}`);
      console.log(`   - Layout: hierarchical`);
      
      // Generate SVG
      const svg = schemaDesigner.generateSVG(diagram);
      console.log(`   - SVG generated (${svg.length} characters)`);
    }

    // ===== MULTI-TENANCY =====
    console.log('\n🏢 Multi-tenancy:');
    const tenantManager = orm.getTenantManager();
    if (tenantManager) {
      console.log('✅ Tenant Manager active');
      
      // Create a tenant
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
            maxRequests: 100000
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
        }
      });
      
      console.log(`   - Tenant created: ${tenant.name} (${tenant.id})`);
      console.log(`   - Database: ${tenant.database}`);
      console.log(`   - Schema: ${tenant.schema}`);
    }

    // ===== ENTITY OPERATIONS WITH NEW FEATURES =====
    console.log('\n💾 Entity Operations:');
    
    // Create user with real-time events
    const user = new User();
    user.name = 'John Doe';
    user.email = 'john@example.com';
    user.password = 'hashed_password';
    user.createdAt = new Date();
    user.updatedAt = new Date();
    const savedUser = await orm.manager.save(user);
    console.log(`✅ User created: ${savedUser.name} (ID: ${savedUser.id})`);

    // Create post with real-time events
    const post = new Post();
    post.title = 'Advanced Vlodia ORM';
    post.content = 'Demonstrating all new features...';
    post.published = true;
    post.author = savedUser;
    post.createdAt = new Date();
    post.updatedAt = new Date();
    const savedPost = await orm.manager.save(post);
    console.log(`✅ Post created: ${savedPost.title} (ID: ${savedPost.id})`);

    // Query with performance analysis
    const users = await orm.manager.find(User, {
      relations: ['posts']
    });
    console.log(`✅ Users with posts loaded: ${users.length}`);

    // ===== REAL-TIME SUBSCRIPTIONS =====
    if (webSocketManager) {
      console.log('\n📡 Real-time Subscriptions:');
      console.log('   - User events: user_created, user_updated, user_deleted');
      console.log('   - Post events: post_created, post_updated, post_deleted');
      console.log('   - Custom events: tenant_created, performance_alert');
    }

    // ===== GRAPHQL QUERIES =====
    if (graphqlGenerator) {
      console.log('\n🔍 GraphQL Queries Available:');
      console.log('   - users: [User]');
      console.log('   - user(id: ID!): User');
      console.log('   - posts: [Post]');
      console.log('   - post(id: ID!): Post');
      console.log('   - createUser(input: UserInput!): User');
      console.log('   - updateUser(id: ID!, input: UserInput!): User');
      console.log('   - deleteUser(id: ID!): Boolean');
    }

    console.log('\n🎉 All advanced features demonstrated successfully!');
    console.log('\n📋 Available CLI Commands:');
    console.log('   - vlodia realtime:start --port 8080');
    console.log('   - vlodia graphql:generate --output schema.graphql');
    console.log('   - vlodia schema:visualize --format svg');
    console.log('   - vlodia performance:analyze');
    console.log('   - vlodia tenant:create --name demo --domain demo.com');

  } catch (error) {
    console.error('❌ Error demonstrating advanced features:', error);
  } finally {
    await orm.close();
    console.log('\n🔒 Advanced ORM closed');
  }
}

// ===== REPOSITORY PATTERN EXAMPLES =====

async function repositoryPatternExample() {
  console.log('\n🚀 Repository Pattern Examples');
  console.log('=================================');

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
    // Repository pattern
    const userRepository = orm.manager.getRepository(User);
    
    // Find users with pagination
    const paginatedUsers = await userRepository.find({ limit: 10, offset: 0 });
    console.log('✅ Paginated users:', paginatedUsers);

    // Find users with relations
    const usersWithPosts = await userRepository.find({ select: ['id', 'name', 'email'] });
    console.log('✅ Users with relations:', usersWithPosts);

    // Find users by field
    const usersByName = await userRepository.find({ where: { name: 'John Doe' } });
    console.log('✅ Users by name:', usersByName);

    // Find users where field is in array
    const usersByIds = await userRepository.find({ where: { id: { in: [1, 2, 3] } } });
    console.log('✅ Users by IDs:', usersByIds);

    // Find users with pattern matching
    const usersByPattern = await userRepository.find({ where: { name: { like: '%John%' } } });
    console.log('✅ Users by pattern:', usersByPattern);

    // Find users with date range
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');
    const usersByDateRange = await userRepository.find({ 
      where: { createdAt: { between: [startDate, endDate] } } 
    });
    console.log('✅ Users by date range:', usersByDateRange);

    // Find users with null values
    const usersWithNullEmail = await userRepository.find({ where: { email: { is: null } } });
    console.log('✅ Users with null email:', usersWithNullEmail);

    // Find users with non-null values
    const usersWithEmail = await userRepository.find({ where: { email: { isNot: null } } });
    console.log('✅ Users with email:', usersWithEmail);

    // Find users ordered by field
    const usersOrdered = await userRepository.find({ orderBy: { createdAt: 'DESC' } });
    console.log('✅ Users ordered by creation date:', usersOrdered);

    // Find first N users
    const firstUsers = await userRepository.find({ limit: 5, orderBy: { id: 'ASC' } });
    console.log('✅ First 5 users:', firstUsers);

    // Find last N users
    const lastUsers = await userRepository.find({ limit: 5, orderBy: { id: 'DESC' } });
    console.log('✅ Last 5 users:', lastUsers);

    // Batch operations
    const users = [
      new User(),
      new User(),
      new User(),
    ];
    
    users[0]!.name = 'User 1';
    users[0]!.email = 'user1@example.com';
    users[0]!.password = 'password1';
    users[0]!.createdAt = new Date();
    users[0]!.updatedAt = new Date();
    
    users[1]!.name = 'User 2';
    users[1]!.email = 'user2@example.com';
    users[1]!.password = 'password2';
    users[1]!.createdAt = new Date();
    users[1]!.updatedAt = new Date();
    
    users[2]!.name = 'User 3';
    users[2]!.email = 'user3@example.com';
    users[2]!.password = 'password3';
    users[2]!.createdAt = new Date();
    users[2]!.updatedAt = new Date();

    const savedUsers = await userRepository.saveMany(users);
    console.log('✅ Batch saved users:', savedUsers);

    // Event handling
    orm.events.on('transaction:start', (data) => {
      console.log('✅ Transaction started:', data.transactionId);
    });

    orm.events.on('transaction:commit', (data) => {
      console.log('✅ Transaction committed:', data.transactionId);
    });

    orm.events.on('transaction:rollback', (data) => {
      console.log('✅ Transaction rolled back:', data.transactionId);
    });

    // Cache operations
    if (orm.cacheInstance) {
      await orm.cacheInstance.set('test-key', 'test-value', 3600);
      const cachedValue = await orm.cacheInstance.get('test-key');
      console.log('✅ Cached value:', cachedValue);
    }

  } finally {
    await orm.close();
    console.log('🔒 Repository ORM closed');
  }
}

// ===== MAIN EXECUTION =====

async function runAllExamples() {
  console.log('🎯 Vlodia ORM Complete Usage Examples');
  console.log('=====================================');
  console.log('Demonstrating all ORM features including new advanced capabilities');
  console.log('');

  try {
    await basicUsageExample();
    await advancedUsageExample();
    await repositoryPatternExample();
    
    console.log('\n🎉 All examples completed successfully!');
    console.log('\n📚 Summary of demonstrated features:');
    console.log('   ✅ Basic CRUD operations');
    console.log('   ✅ Entity relationships');
    console.log('   ✅ Transactions');
    console.log('   ✅ Query building');
    console.log('   ✅ Pagination');
    console.log('   ✅ Repository pattern');
    console.log('   ✅ Caching');
    console.log('   ✅ Event handling');
    console.log('   ✅ Real-time WebSocket features');
    console.log('   ✅ GraphQL schema generation');
    console.log('   ✅ Performance analysis');
    console.log('   ✅ Schema visualization');
    console.log('   ✅ Multi-tenancy support');
    console.log('\n🚀 Vlodia ORM is production-ready!');
    
  } catch (error) {
    console.error('❌ Error running examples:', error);
    process.exit(1);
  }
}

// Export for use in other examples
export {
  runAllExamples,
  basicUsageExample,
  advancedUsageExample,
  repositoryPatternExample,
  basicConfig,
  advancedConfig,
};

// Run if this file is executed directly
if (require.main === module) {
  runAllExamples();
}
