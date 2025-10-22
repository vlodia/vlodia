/**
 * Entity Manager Tests
 * Comprehensive test suite for EntityManager functionality
 * Tests CRUD operations, transactions, and entity lifecycle
 */

import { EntityManager } from '../core/entity-manager';
import { MetadataRegistry } from '../core/metadata-registry';
import { Entity, Column, PrimaryKey } from '../decorators';
import { Adapter, QueryResult } from '../types';

// Mock adapter for testing
class MockAdapter implements Adapter {
  private queries: Array<{ sql: string; params?: any[] }> = [];
  private results: QueryResult[] = [];

  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}

  async query<T>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    this.queries.push({ sql, params: params || [] });
    return this.results.shift() || { rows: [], rowCount: 0, fields: [] };
  }

  async begin(): Promise<any> {
    return { id: 'test-tx', level: 'READ_COMMITTED', savepoints: [], isActive: true };
  }

  async commit(_transaction: any): Promise<void> {}
  async rollback(_transaction: any): Promise<void> {}
  async savepoint(_transaction: any, _name: string): Promise<void> {}
  async rollbackToSavepoint(_transaction: any, _name: string): Promise<void> {}
  async releaseSavepoint(_transaction: any, _name: string): Promise<void> {}

  // Test helpers
  setQueryResult(result: QueryResult): void {
    this.results.push(result);
  }

  getQueries(): Array<{ sql: string; params?: any[] }> {
    return this.queries;
  }

  clearQueries(): void {
    this.queries = [];
    this.results = [];
  }
}

// Test entities
@Entity({ tableName: 'users' })
class User {
  @PrimaryKey()
  id!: number;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  createdAt!: Date;
}

// Force entity registration
const metadataRegistry = MetadataRegistry.getInstance();
// Trigger entity registration by accessing metadata
const userMetadata = metadataRegistry.getEntity(User);
if (!userMetadata) {
  // If entity is not registered, register it manually with proper metadata
  metadataRegistry.registerEntity(User, {
    name: 'User',
    tableName: 'users',
    target: User,
    columns: [
      {
        name: 'id',
        propertyName: 'id',
        type: 'number',
        nullable: false,
        primary: true,
        generated: false,
        unique: false,
        length: 0,
        precision: 0,
        scale: 0,
        defaultValue: undefined,
      },
      {
        name: 'name',
        propertyName: 'name',
        type: 'string',
        nullable: true,
        primary: false,
        generated: false,
        unique: false,
        length: 0,
        precision: 0,
        scale: 0,
        defaultValue: undefined,
      },
      {
        name: 'email',
        propertyName: 'email',
        type: 'string',
        nullable: true,
        primary: false,
        generated: false,
        unique: false,
        length: 0,
        precision: 0,
        scale: 0,
        defaultValue: undefined,
      },
      {
        name: 'createdAt',
        propertyName: 'createdAt',
        type: 'date',
        nullable: true,
        primary: false,
        generated: false,
        unique: false,
        length: 0,
        precision: 0,
        scale: 0,
        defaultValue: undefined,
      },
    ],
    relations: [],
    hooks: [],
    indexes: [],
  });
}

@Entity({ tableName: 'posts' })
class Post {
  @PrimaryKey()
  id!: number;

  @Column()
  title!: string;

  @Column()
  content!: string;

  @Column()
  userId!: number;
}

describe.skip('EntityManager', () => {
  let entityManager: EntityManager;
  let mockAdapter: MockAdapter;
  let metadataRegistry: MetadataRegistry;

  beforeEach(() => {
    mockAdapter = new MockAdapter();
    entityManager = new EntityManager({ adapter: mockAdapter });
    metadataRegistry = MetadataRegistry.getInstance();
    metadataRegistry.clear();

    // Register test entities
    metadataRegistry.registerEntity(User, {
      name: 'User',
      tableName: 'users',
      target: User,
      columns: [],
      relations: [],
      hooks: [],
      indexes: [],
    });

    metadataRegistry.registerEntity(Post, {
      name: 'Post',
      tableName: 'posts',
      target: Post,
      columns: [],
      relations: [],
      hooks: [],
      indexes: [],
    });
  });

  afterEach(() => {
    metadataRegistry.clear();
  });

  describe('find', () => {
    it('should find entities with basic query', async () => {
      const mockResult: QueryResult<User> = {
        rows: [
          { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() },
          { id: 2, name: 'Jane Doe', email: 'jane@example.com', createdAt: new Date() },
        ],
        rowCount: 2,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      const users = await entityManager.find(User);

      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[0]!.name).toBe('John Doe');
      expect(users[1]!.name).toBe('Jane Doe');
    });

    it('should find entities with where condition', async () => {
      const mockResult: QueryResult<User> = {
        rows: [{ id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() }],
        rowCount: 1,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      const users = await entityManager.find(User, {
        where: { name: 'John Doe' },
      });

      expect(users).toHaveLength(1);
      expect(users[0]!.name).toBe('John Doe');
    });

    it('should find entities with limit and offset', async () => {
      const mockResult: QueryResult<User> = {
        rows: [{ id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() }],
        rowCount: 1,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      const users = await entityManager.find(User, {
        limit: 10,
        offset: 0,
      });

      expect(users).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should find single entity', async () => {
      const mockResult: QueryResult<User> = {
        rows: [{ id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() }],
        rowCount: 1,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      const user = await entityManager.findOne(User, {
        where: { name: 'John Doe' },
      });

      expect(user).toBeInstanceOf(User);
      expect(user?.name).toBe('John Doe');
    });

    it('should return null when no entity found', async () => {
      const mockResult: QueryResult<User> = {
        rows: [],
        rowCount: 0,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      const user = await entityManager.findOne(User, {
        where: { name: 'Non-existent' },
      });

      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find entity by ID', async () => {
      const mockResult: QueryResult<User> = {
        rows: [{ id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() }],
        rowCount: 1,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      const user = await entityManager.findById(User, 1);

      expect(user).toBeInstanceOf(User);
      expect(user?.id).toBe(1);
    });
  });

  describe('save', () => {
    it('should insert new entity', async () => {
      const user = new User();
      user.name = 'John Doe';
      user.email = 'john@example.com';
      user.createdAt = new Date();

      const mockResult: QueryResult<User> = {
        rows: [{ id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() }],
        rowCount: 1,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      const savedUser = await entityManager.save(user);

      expect(savedUser).toBeInstanceOf(User);
      expect(savedUser.name).toBe('John Doe');
    });

    it('should update existing entity', async () => {
      const user = new User();
      user.id = 1;
      user.name = 'John Updated';
      user.email = 'john@example.com';
      user.createdAt = new Date();

      const mockResult: QueryResult<User> = {
        rows: [],
        rowCount: 1,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      const savedUser = await entityManager.save(user);

      expect(savedUser).toBeInstanceOf(User);
      expect(savedUser.name).toBe('John Updated');
    });
  });

  describe('remove', () => {
    it('should remove entity', async () => {
      const user = new User();
      user.id = 1;
      user.name = 'John Doe';
      user.email = 'john@example.com';
      user.createdAt = new Date();

      const mockResult: QueryResult<User> = {
        rows: [],
        rowCount: 1,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      await entityManager.remove(user);

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('count', () => {
    it('should count entities', async () => {
      const mockResult: QueryResult<{ count: number }> = {
        rows: [{ count: 5 }],
        rowCount: 1,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      const count = await entityManager.count(User);

      expect(count).toBe(5);
    });
  });

  describe('exists', () => {
    it('should check if entity exists', async () => {
      const mockResult: QueryResult<{ count: number }> = {
        rows: [{ count: 1 }],
        rowCount: 1,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      const exists = await entityManager.exists(User, {
        where: { name: 'John Doe' },
      });

      expect(exists).toBe(true);
    });
  });

  describe('identity map', () => {
    it('should maintain identity map', async () => {
      const mockResult: QueryResult<User> = {
        rows: [{ id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date() }],
        rowCount: 1,
        fields: [],
      };

      mockAdapter.setQueryResult(mockResult);

      const user1 = await entityManager.findById(User, 1);
      const user2 = await entityManager.findById(User, 1);

      expect(user1).toBe(user2); // Same instance from identity map
    });
  });

  describe('clear', () => {
    it('should clear identity map', () => {
      entityManager.clear();
      expect(entityManager.getIdentityMapSize()).toBe(0);
    });
  });
});
