# Vlodia ORM

[![npm version](https://badge.fury.io/js/vlodia.svg)](https://badge.fury.io/js/vlodia)
[![Build Status](https://github.com/vlodia/vlodia/workflows/CI/badge.svg)](https://github.com/vlodia/vlodia/actions)
[![Coverage Status](https://coveralls.io/repos/github/vlodia/vlodia/badge.svg?branch=main)](https://coveralls.io/github/vlodia/vlodia?branch=main)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Vlodia** is a next-generation TypeScript ORM that combines the best features of modern ORMs with enterprise-grade performance and developer experience. Built for TypeScript-first development with reflection-driven metadata, database-agnostic architecture, and production-ready features.

## Quick Start

### 1. Installation

```bash
# Install Vlodia ORM
npm install vlodia

# Install database driver (choose one)
npm install pg mysql sqlite redis

# Install TypeScript types
npm install -D @types/pg @types/mysql
```

### 2. Project Setup

Create a new project structure:

```bash
mkdir my-vlodia-app
cd my-vlodia-app
npm init -y
npm install vlodia pg @types/pg
```

### 3. Initialize Vlodia

```bash
# Initialize Vlodia ORM project
vlodia init

# Or with specific database
vlodia init --database postgres --host localhost --username postgres --password password --name myapp
```

This creates:
```
my-vlodia-app/
├── vlodia/
│   ├── schema.vlodia    # Schema definition (like Prisma's schema.prisma)
│   └── config.ts       # Auto-generated configuration
├── src/
│   ├── entities/       # Entity definitions
│   │   └── User.ts
│   ├── migrations/    # Database migrations
│   └── app.ts         # Example application
├── .env               # Environment variables
└── .env.example       # Environment template
```

### 4. Generate Types (like Prisma)

```bash
# Generate TypeScript types from schema.vlodia
vlodia generate
```

### 5. Database Configuration

The `vlodia/schema.vlodia` file (like Prisma's `schema.prisma`):

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

### 4. Create Your First Entity

Create `src/entities/User.ts`:

```typescript
import { Entity, Column, PrimaryKey } from 'vlodia';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string', length: 100 })
  name!: string;

  @Column({ type: 'string', unique: true })
  email!: string;

  @Column({ type: 'date' })
  createdAt!: Date;
}
```

### 5. Initialize ORM

Create `src/app.ts`:

```typescript
import { Vlodia } from 'vlodia';
import { User } from './entities/User';
import { config } from '../vlodia.config';

const orm = new Vlodia({
  ...config,
  entities: [User]
});

async function main() {
  try {
    await orm.initialize();
    console.log('✅ Vlodia ORM connected successfully!');
    
    // Create a user
    const user = new User();
    user.name = 'John Doe';
    user.email = 'john@example.com';
    user.createdAt = new Date();
    
    const savedUser = await orm.manager.save(user);
    console.log('✅ User created:', savedUser);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await orm.close();
  }
}

main();
```

### 6. Run Your Application

```bash
# Compile TypeScript
npx tsc

# Run the application
node dist/app.js
```

## Project Structure

```
my-vlodia-app/
├── src/
│   ├── entities/           # Entity definitions
│   │   ├── User.ts
│   │   ├── Post.ts
│   │   └── Comment.ts
│   ├── migrations/        # Database migrations
│   │   └── 001_initial.ts
│   ├── repositories/      # Custom repositories
│   │   └── UserRepository.ts
│   └── app.ts            # Main application
├── vlodia.config.ts      # ORM configuration
├── package.json
└── tsconfig.json
```

## Database Setup

### PostgreSQL

```bash
# Install PostgreSQL
# Create database
createdb myapp

# Update vlodia.config.ts
database: {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'myapp',
  ssl: false
}
```

### MySQL

```bash
# Install MySQL
# Create database
mysql -u root -p -e "CREATE DATABASE myapp;"

# Update vlodia.config.ts
database: {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'myapp'
}
```

### SQLite

```bash
# No installation needed
# Update vlodia.config.ts
database: {
  type: 'sqlite',
  database: './database.sqlite'
}
```

## Entity Definition

### Basic Entity

```typescript
import { Entity, Column, PrimaryKey } from 'vlodia';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string', length: 100 })
  name!: string;

  @Column({ type: 'string', unique: true })
  email!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'date' })
  createdAt!: Date;
}
```

### Entity with Relations

```typescript
import { Entity, Column, PrimaryKey, OneToMany, ManyToOne } from 'vlodia';

@Entity({ tableName: 'posts' })
export class Post {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'boolean', default: false })
  published!: boolean;

  // Relations
  @ManyToOne(() => User, 'authorId')
  author!: User;

  @OneToMany(() => Comment, 'postId')
  comments!: Comment[];

  @Column({ type: 'date' })
  createdAt!: Date;
}

@Entity({ tableName: 'comments' })
export class Comment {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => User, 'userId')
  user!: User;

  @ManyToOne(() => Post, 'postId')
  post!: Post;

  @Column({ type: 'date' })
  createdAt!: Date;
}
```

## Advanced Configuration

### Full Configuration

```typescript
import { VlodiaConfig } from 'vlodia';

export const config: VlodiaConfig = {
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'myapp',
    ssl: false,
    pool: {
      min: 2,
      max: 10,
      idle: 10000
    }
  },
  entities: [User, Post, Comment],
  logging: {
    level: 'debug',
    format: 'json',
    queries: true
  },
  cache: {
    enabled: true,
    type: 'memory',
    ttl: 3600
  },
  migrations: {
    path: './src/migrations',
    tableName: 'vlodia_migrations'
  },
  // Real-time features
  realtime: {
    enabled: true,
    port: 8080,
    path: '/ws',
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true
    }
  },
  // GraphQL features
  graphql: {
    enabled: true,
    path: '/graphql',
    playground: true,
    introspection: true
  },
  // Multi-tenancy
  tenancy: {
    enabled: true,
    defaultTenant: 'default'
  }
};
```

## CLI Commands

### Installation

```bash
# Install globally
npm install -g vlodia

# Or use npx
npx vlodia --help
```

### Available Commands

```bash
# Entity management
vlodia entity:generate --table users --output src/entities/User.ts
vlodia entity:create --name Product --table products

# Migration management
vlodia migration:create --name add_user_table
vlodia migration:run
vlodia migration:revert

# Schema management
vlodia schema:sync
vlodia schema:validate

# New features
vlodia realtime:start --port 8080
vlodia graphql:generate --output schema.graphql
vlodia schema:visualize --format svg
vlodia performance:analyze
vlodia tenant:create --name demo --domain demo.com

# Development
vlodia watch
vlodia validate
```

## Database Operations

### Basic CRUD

```typescript
import { Vlodia } from 'vlodia';
import { User } from './entities/User';

const orm = new Vlodia(config);

// Create
const user = new User();
user.name = 'John Doe';
user.email = 'john@example.com';
user.createdAt = new Date();
const savedUser = await orm.manager.save(user);

// Read
const users = await orm.manager.find(User);
const user = await orm.manager.findOne(User, { where: { id: 1 } });

// Update
user.name = 'John Updated';
await orm.manager.save(user);

// Delete
await orm.manager.remove(user);
```

### Advanced Queries

```typescript
// Complex queries
const users = await orm.manager.find(User, {
  where: {
    $and: [
      { active: true },
      { $or: [
        { name: { $like: '%John%' } },
        { email: { $like: '%example.com' } }
      ]}
    ]
  },
  relations: ['posts'],
  orderBy: { createdAt: 'DESC' },
  limit: 10,
  offset: 0
});

// Pagination
const paginatedUsers = await orm.manager.find(User, {
  limit: 10,
  offset: 20,
  orderBy: { id: 'ASC' }
});

// Count and exists
const userCount = await orm.manager.count(User);
const userExists = await orm.manager.exists(User, { where: { email: 'john@example.com' } });
```

### Transactions

```typescript
await orm.transaction(async (manager) => {
  const user = new User();
  user.name = 'Jane Doe';
  user.email = 'jane@example.com';
  user.createdAt = new Date();
  
  const savedUser = await manager.save(user);
  
  const post = new Post();
  post.title = 'My Post';
  post.content = 'Content here';
  post.author = savedUser;
  post.createdAt = new Date();
  
  await manager.save(post);
});
```

## Migrations

### Create Migration

```bash
vlodia migration:create --name add_user_table
```

### Migration File

```typescript
import { Migration } from 'vlodia';

export class AddUserTable implements Migration {
  name = 'add_user_table';
  
  async up(adapter: any): Promise<void> {
    await adapter.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  
  async down(adapter: any): Promise<void> {
    await adapter.query('DROP TABLE users');
  }
}
```

### Run Migrations

```bash
# Run all pending migrations
vlodia migration:run

# Revert last migration
vlodia migration:revert

# Check migration status
vlodia migration:status
```

## Real-time Features

### WebSocket Server

```typescript
const orm = new Vlodia({
  ...config,
  realtime: {
    enabled: true,
    port: 8080,
    path: '/ws'
  }
});

await orm.initialize();

// Start WebSocket server
const wsManager = orm.getWebSocketManager();
// Server automatically starts on port 8080
```

### Client Connection

```javascript
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onopen = () => {
  console.log('Connected to Vlodia real-time server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

## GraphQL Integration

### Generate Schema

```bash
vlodia graphql:generate --output schema.graphql
```

### Programmatic Usage

```typescript
const orm = new Vlodia({
  ...config,
  graphql: {
    enabled: true,
    path: '/graphql',
    playground: true
  }
});

await orm.initialize();

// Generate GraphQL schema
const schema = orm.generateGraphQLSchema();
console.log('Types:', Object.keys(schema.types));
console.log('Queries:', Object.keys(schema.queries));
```

## Performance Analysis

### Analyze Queries

```bash
vlodia performance:analyze
```

### Programmatic Usage

```typescript
const orm = new Vlodia(config);
await orm.initialize();

// Get performance metrics
const metrics = orm.getPerformanceMetrics();
console.log('Total Queries:', metrics.totalQueries);
console.log('N+1 Queries:', metrics.n1Queries);
console.log('Performance Score:', metrics.performanceScore);

// Analyze specific query
const analysis = orm.analyzeQuery('SELECT * FROM users', 150, 1000);
console.log('Analysis:', analysis);
```

## Multi-tenancy

### Create Tenant

```bash
vlodia tenant:create --name demo --domain demo.com
```

### Programmatic Usage

```typescript
const orm = new Vlodia({
  ...config,
  tenancy: {
    enabled: true,
    defaultTenant: 'default'
  }
});

await orm.initialize();

// Create tenant
const tenantManager = orm.getTenantManager();
const tenant = await tenantManager?.createTenant({
  name: 'demo-tenant',
  domain: 'demo.example.com',
  database: 'demo_tenant_db',
  schema: 'demo_tenant_schema'
});
```

## Testing

### Test Setup

```typescript
import { Vlodia } from 'vlodia';
import { User } from '../entities/User';

describe('User Entity', () => {
  let orm: Vlodia;

  beforeAll(async () => {
    orm = new Vlodia({
      database: {
        type: 'sqlite',
        database: ':memory:'
      },
      entities: [User]
    });
    await orm.initialize();
  });

  afterAll(async () => {
    await orm.close();
  });

  it('should create user', async () => {
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.createdAt = new Date();
    
    const savedUser = await orm.manager.save(user);
    expect(savedUser.id).toBeDefined();
    expect(savedUser.name).toBe('Test User');
  });
});
```

## Examples

### Complete Usage Examples

```typescript
import { 
  runAllExamples,
  basicUsageExample,
  advancedUsageExample 
} from 'vlodia/examples/complete-usage';

// Run all examples
await runAllExamples();

// Run specific examples
await basicUsageExample();
await advancedUsageExample();
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

### Schema Sync

```bash
# Sync database schema with entities
vlodia schema:sync
```

## API Reference

### Core Classes

- **Vlodia**: Main ORM class
- **EntityManager**: Database operations
- **QueryBuilder**: Fluent query building
- **Repository**: Data access pattern

### Decorators

- **@Entity**: Mark class as entity
- **@Column**: Define entity properties
- **@PrimaryKey**: Mark primary key
- **@OneToMany**: One-to-many relation
- **@ManyToOne**: Many-to-one relation
- **@OneToOne**: One-to-one relation
- **@ManyToMany**: Many-to-many relation

### New Features

- **WebSocketManager**: Real-time features
- **GraphQLSchemaGenerator**: GraphQL integration
- **QueryAnalyzer**: Performance analysis
- **SchemaDesigner**: Visual schema management
- **TenantManager**: Multi-tenancy support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Advanced Features

### Schema Visualization

Generate visual diagrams of your database schema:

```bash
# Generate SVG diagram
vlodia schema:visualize --format svg --output schema.svg

# Generate JSON diagram
vlodia schema:visualize --format json --output schema.json
```

### Real-time Subscriptions

Subscribe to database changes in real-time:

```typescript
const orm = new Vlodia({
  ...config,
  realtime: {
    enabled: true,
    port: 8080,
    path: '/ws'
  }
});

await orm.initialize();

// WebSocket server automatically starts
// Clients can connect to ws://localhost:8080/ws
```

### GraphQL Auto-generation

Automatically generate GraphQL schemas from your entities:

```typescript
const orm = new Vlodia({
  ...config,
  graphql: {
    enabled: true,
    path: '/graphql',
    playground: true
  }
});

await orm.initialize();

// GraphQL endpoint available at http://localhost:4000/graphql
// Playground available at http://localhost:4000/graphql/playground
```

### Performance Monitoring

Monitor and analyze query performance:

```typescript
const orm = new Vlodia(config);
await orm.initialize();

// Get performance metrics
const metrics = orm.getPerformanceMetrics();
console.log('Performance Score:', metrics.performanceScore);
console.log('N+1 Queries Detected:', metrics.n1Queries);
console.log('Average Query Time:', metrics.averageExecutionTime);

// Analyze specific query
const analysis = orm.analyzeQuery('SELECT * FROM users WHERE active = true', 150, 1000);
console.log('Query Analysis:', analysis);
```

### Multi-tenancy Support

Create isolated tenant environments:

```typescript
const orm = new Vlodia({
  ...config,
  tenancy: {
    enabled: true,
    defaultTenant: 'default'
  }
});

await orm.initialize();

// Create tenant
const tenantManager = orm.getTenantManager();
const tenant = await tenantManager?.createTenant({
  name: 'acme-corp',
  domain: 'acme.example.com',
  database: 'acme_tenant_db',
  schema: 'acme_tenant_schema',
  config: {
    features: ['basic', 'premium'],
    limits: {
      maxUsers: 10000,
      maxStorage: 100000000,
      maxRequests: 1000000
    }
  }
});
```

## Best Practices

### Entity Design

```typescript
// Good: Clear entity structure
@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string', length: 100, nullable: false })
  name!: string;

  @Column({ type: 'string', unique: true, nullable: false })
  email!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Post, 'authorId')
  posts!: Post[];
}
```

### Query Optimization

```typescript
// Good: Use relations to avoid N+1 queries
const users = await orm.manager.find(User, {
  relations: ['posts', 'comments'],
  where: { active: true }
});

// Good: Use pagination for large datasets
const users = await orm.manager.find(User, {
  limit: 20,
  offset: 0,
  orderBy: { createdAt: 'DESC' }
});

// Good: Use specific columns when possible
const users = await orm.manager.find(User, {
  select: ['id', 'name', 'email'],
  where: { active: true }
});
```

### Error Handling

```typescript
try {
  await orm.initialize();
  
  const user = new User();
  user.name = 'John Doe';
  user.email = 'john@example.com';
  
  const savedUser = await orm.manager.save(user);
  console.log('User created:', savedUser);
  
} catch (error) {
  if (error.code === '23505') { // Unique constraint violation
    console.error('Email already exists');
  } else if (error.code === '23503') { // Foreign key constraint violation
    console.error('Invalid reference');
  } else {
    console.error('Database error:', error.message);
  }
} finally {
  await orm.close();
}
```

### Transaction Management

```typescript
// Good: Use transactions for related operations
await orm.transaction(async (manager) => {
  const user = new User();
  user.name = 'Jane Doe';
  user.email = 'jane@example.com';
  const savedUser = await manager.save(user);
  
  const post = new Post();
  post.title = 'My First Post';
  post.content = 'Hello World';
  post.author = savedUser;
  await manager.save(post);
  
  // Both operations will be committed together
  // or rolled back if any fails
});
```

## Troubleshooting

### Common Issues

#### Connection Issues

```typescript
// Check database connection
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
    level: 'debug',
    queries: true
  }
});

try {
  await orm.initialize();
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  // Check if PostgreSQL is running
  // Check if database exists
  // Check credentials
}
```

#### Entity Registration Issues

```typescript
// Make sure entities are properly registered
const orm = new Vlodia({
  ...config,
  entities: [User, Post, Comment] // All entities must be listed
});

// Check if entities are properly decorated
@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;
  // ... other properties
}
```

#### Migration Issues

```bash
# Check migration status
vlodia migration:status

# Reset migrations (development only)
vlodia migration:reset

# Create new migration
vlodia migration:create --name fix_user_table
```

### Performance Issues

#### N+1 Query Detection

```typescript
const orm = new Vlodia({
  ...config,
  logging: {
    level: 'debug',
    queries: true
  }
});

// Enable query analysis
const queryAnalyzer = orm.getQueryAnalyzer();
const metrics = queryAnalyzer.getPerformanceMetrics();

if (metrics.n1Queries > 0) {
  console.warn('N+1 queries detected:', metrics.n1Queries);
  // Use relations to fix N+1 queries
  const users = await orm.manager.find(User, {
    relations: ['posts'] // This prevents N+1 queries
  });
}
```

#### Query Optimization

```typescript
// Bad: Multiple queries
const users = await orm.manager.find(User);
for (const user of users) {
  const posts = await orm.manager.find(Post, { where: { authorId: user.id } });
  user.posts = posts;
}

// Good: Single query with relations
const users = await orm.manager.find(User, {
  relations: ['posts']
});
```

## Migration Guide

### From TypeORM

```typescript
// TypeORM
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}

// Vlodia
@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string' })
  name!: string;

  @Column({ type: 'string', unique: true })
  email!: string;
}
```

### From Prisma

```typescript
// Prisma Schema
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  posts Post[]
}

// Vlodia
@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string' })
  name!: string;

  @Column({ type: 'string', unique: true })
  email!: string;

  @OneToMany(() => Post, 'authorId')
  posts!: Post[];
}
```

## Community

### Getting Help

- **GitHub Issues**: [github.com/vlodia/vlodia/issues](https://github.com/vlodia/vlodia/issues)
- **Discord**: [discord.gg/vlodia](https://discord.gg/vlodia)
- **Stack Overflow**: Tag your questions with `vlodia-orm`

### Contributing

We welcome contributions! Here's how you can help:

1. **Report bugs** via GitHub Issues
2. **Suggest features** via GitHub Discussions
3. **Submit pull requests** for bug fixes and features
4. **Improve documentation** by submitting PRs
5. **Share examples** and use cases

### Roadmap

- [ ] **v1.1**: Advanced caching strategies
- [ ] **v1.2**: Database sharding support
- [ ] **v1.3**: Machine learning query optimization
- [ ] **v2.0**: Multi-database support
- [ ] **v2.1**: Advanced real-time features
- [ ] **v2.2**: Enterprise security features

## Acknowledgments

- Inspired by modern ORMs like Prisma, TypeORM, and Sequelize
- Built with TypeScript and modern JavaScript features
- Community-driven development and feedback
- Special thanks to all contributors and early adopters

## Database Setup

### PostgreSQL

```bash
# Install PostgreSQL
# Create database
createdb myapp

# Update vlodia.config.ts
database: {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'myapp',
  ssl: false
}
```

### MySQL

```bash
# Install MySQL
# Create database
mysql -u root -p -e "CREATE DATABASE myapp;"

# Update vlodia.config.ts
database: {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'password',
  database: 'myapp'
}
```

### SQLite

```bash
# No installation needed
# Update vlodia.config.ts
database: {
  type: 'sqlite',
  database: './database.sqlite'
}
```

## Entity Definition

### Basic Entity

```typescript
import { Entity, Column, PrimaryKey } from 'vlodia';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string', length: 100 })
  name!: string;

  @Column({ type: 'string', unique: true })
  email!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'date' })
  createdAt!: Date;
}
```

### Entity with Relations

```typescript
import { Entity, Column, PrimaryKey, OneToMany, ManyToOne } from 'vlodia';

@Entity({ tableName: 'posts' })
export class Post {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'boolean', default: false })
  published!: boolean;

  // Relations
  @ManyToOne(() => User, 'authorId')
  author!: User;

  @OneToMany(() => Comment, 'postId')
  comments!: Comment[];

  @Column({ type: 'date' })
  createdAt!: Date;
}

@Entity({ tableName: 'comments' })
export class Comment {
  @PrimaryKey()
  @Column({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @ManyToOne(() => User, 'userId')
  user!: User;

  @ManyToOne(() => Post, 'postId')
  post!: Post;

  @Column({ type: 'date' })
  createdAt!: Date;
}
```

## Advanced Configuration

### Full Configuration

```typescript
import { VlodiaConfig } from 'vlodia';

export const config: VlodiaConfig = {
  database: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'password',
    database: 'myapp',
    ssl: false,
    pool: {
      min: 2,
      max: 10,
      idle: 10000
    }
  },
  entities: [User, Post, Comment],
  logging: {
    level: 'debug',
    format: 'json',
    queries: true
  },
  cache: {
    enabled: true,
    type: 'memory',
    ttl: 3600
  },
  migrations: {
    path: './src/migrations',
    tableName: 'vlodia_migrations'
  },
  // Real-time features
  realtime: {
    enabled: true,
    port: 8080,
    path: '/ws',
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true
    }
  },
  // GraphQL features
  graphql: {
    enabled: true,
    path: '/graphql',
    playground: true,
    introspection: true
  },
  // Multi-tenancy
  tenancy: {
    enabled: true,
    defaultTenant: 'default'
  }
};
```

## CLI Commands

### Installation

```bash
# Install globally
npm install -g vlodia

# Or use npx
npx vlodia --help
```

### Available Commands

```bash
# Entity management
vlodia entity:generate --table users --output src/entities/User.ts
vlodia entity:create --name Product --table products

# Migration management
vlodia migration:create --name add_user_table
vlodia migration:run
vlodia migration:revert

# Schema management
vlodia schema:sync
vlodia schema:validate

# New features
vlodia realtime:start --port 8080
vlodia graphql:generate --output schema.graphql
vlodia schema:visualize --format svg
vlodia performance:analyze
vlodia tenant:create --name demo --domain demo.com

# Development
vlodia watch
vlodia validate
```

## Database Operations

### Basic CRUD

```typescript
import { Vlodia } from 'vlodia';
import { User } from './entities/User';

const orm = new Vlodia(config);

// Create
const user = new User();
user.name = 'John Doe';
user.email = 'john@example.com';
user.createdAt = new Date();
const savedUser = await orm.manager.save(user);

// Read
const users = await orm.manager.find(User);
const user = await orm.manager.findOne(User, { where: { id: 1 } });

// Update
user.name = 'John Updated';
await orm.manager.save(user);

// Delete
await orm.manager.remove(user);
```

### Advanced Queries

```typescript
// Complex queries
const users = await orm.manager.find(User, {
  where: {
    $and: [
      { active: true },
      { $or: [
        { name: { $like: '%John%' } },
        { email: { $like: '%example.com' } }
      ]}
    ]
  },
  relations: ['posts'],
  orderBy: { createdAt: 'DESC' },
  limit: 10,
  offset: 0
});

// Pagination
const paginatedUsers = await orm.manager.find(User, {
  limit: 10,
  offset: 20,
  orderBy: { id: 'ASC' }
});

// Count and exists
const userCount = await orm.manager.count(User);
const userExists = await orm.manager.exists(User, { where: { email: 'john@example.com' } });
```

### Transactions

```typescript
await orm.transaction(async (manager) => {
  const user = new User();
  user.name = 'Jane Doe';
  user.email = 'jane@example.com';
  user.createdAt = new Date();
  
  const savedUser = await manager.save(user);
  
  const post = new Post();
  post.title = 'My Post';
  post.content = 'Content here';
  post.author = savedUser;
  post.createdAt = new Date();
  
  await manager.save(post);
});
```

## Migrations

### Create Migration

```bash
vlodia migration:create --name add_user_table
```

### Migration File

```typescript
import { Migration } from 'vlodia';

export class AddUserTable implements Migration {
  name = 'add_user_table';
  
  async up(adapter: any): Promise<void> {
    await adapter.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  
  async down(adapter: any): Promise<void> {
    await adapter.query('DROP TABLE users');
  }
}
```

### Run Migrations

```bash
# Run all pending migrations
vlodia migration:run

# Revert last migration
vlodia migration:revert

# Check migration status
vlodia migration:status
```

## 🎨 Schema Visualization

### Generate Schema Diagram

```bash
# Generate SVG diagram
vlodia schema:visualize --format svg --output schema.svg

# Generate JSON diagram
vlodia schema:visualize --format json --output schema.json
```

### Programmatic Usage

```typescript
const orm = new Vlodia(config);
await orm.initialize();

// Generate schema diagram
const diagram = orm.generateSchemaDiagram();
console.log('Nodes:', diagram.nodes.length);
console.log('Edges:', diagram.edges.length);

// Generate SVG
const svg = orm.getSchemaDesigner()?.generateSVG(diagram);
```

## Real-time Features

### WebSocket Server

```typescript
const orm = new Vlodia({
  ...config,
  realtime: {
    enabled: true,
    port: 8080,
    path: '/ws'
  }
});

await orm.initialize();

// Start WebSocket server
const wsManager = orm.getWebSocketManager();
// Server automatically starts on port 8080
```

### Client Connection

```javascript
const ws = new WebSocket('ws://localhost:8080/ws');

ws.onopen = () => {
  console.log('Connected to Vlodia real-time server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

## 🔗 GraphQL Integration

### Generate Schema

```bash
vlodia graphql:generate --output schema.graphql
```

### Programmatic Usage

```typescript
const orm = new Vlodia({
  ...config,
  graphql: {
    enabled: true,
    path: '/graphql',
    playground: true
  }
});

await orm.initialize();

// Generate GraphQL schema
const schema = orm.generateGraphQLSchema();
console.log('Types:', Object.keys(schema.types));
console.log('Queries:', Object.keys(schema.queries));
```

## 📊 Performance Analysis

### Analyze Queries

```bash
vlodia performance:analyze
```

### Programmatic Usage

```typescript
const orm = new Vlodia(config);
await orm.initialize();

// Get performance metrics
const metrics = orm.getPerformanceMetrics();
console.log('Total Queries:', metrics.totalQueries);
console.log('N+1 Queries:', metrics.n1Queries);
console.log('Performance Score:', metrics.performanceScore);

// Analyze specific query
const analysis = orm.analyzeQuery('SELECT * FROM users', 150, 1000);
console.log('Analysis:', analysis);
```

## 🏢 Multi-tenancy

### Create Tenant

```bash
vlodia tenant:create --name demo --domain demo.com
```

### Programmatic Usage

```typescript
const orm = new Vlodia({
  ...config,
  tenancy: {
    enabled: true,
    defaultTenant: 'default'
  }
});

await orm.initialize();

// Create tenant
const tenantManager = orm.getTenantManager();
const tenant = await tenantManager?.createTenant({
  name: 'demo-tenant',
  domain: 'demo.example.com',
  database: 'demo_tenant_db',
  schema: 'demo_tenant_schema'
});
```

## Testing

### Test Setup

```typescript
import { Vlodia } from 'vlodia';
import { User } from '../entities/User';

describe('User Entity', () => {
  let orm: Vlodia;

  beforeAll(async () => {
    orm = new Vlodia({
      database: {
        type: 'sqlite',
        database: ':memory:'
      },
      entities: [User]
    });
    await orm.initialize();
  });

  afterAll(async () => {
    await orm.close();
  });

  it('should create user', async () => {
    const user = new User();
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.createdAt = new Date();
    
    const savedUser = await orm.manager.save(user);
    expect(savedUser.id).toBeDefined();
    expect(savedUser.name).toBe('Test User');
  });
});
```

## Examples

### Complete Usage Examples

```typescript
import { 
  runAllExamples,
  basicUsageExample,
  advancedUsageExample 
} from 'vlodia/examples/complete-usage';

// Run all examples
await runAllExamples();

// Run specific examples
await basicUsageExample();
await advancedUsageExample();
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

### Schema Sync

```bash
# Sync database schema with entities
vlodia schema:sync
```

## API Reference

### Core Classes

- **Vlodia**: Main ORM class
- **EntityManager**: Database operations
- **QueryBuilder**: Fluent query building
- **Repository**: Data access pattern

### Decorators

- **@Entity**: Mark class as entity
- **@Column**: Define entity properties
- **@PrimaryKey**: Mark primary key
- **@OneToMany**: One-to-many relation
- **@ManyToOne**: Many-to-one relation
- **@OneToOne**: One-to-one relation
- **@ManyToMany**: Many-to-many relation

### New Features

- **WebSocketManager**: Real-time features
- **GraphQLSchemaGenerator**: GraphQL integration
- **QueryAnalyzer**: Performance analysis
- **SchemaDesigner**: Visual schema management
- **TenantManager**: Multi-tenancy support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
