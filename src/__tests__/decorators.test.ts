/**
 * Decorators Tests
 * Comprehensive test suite for decorator functionality
 * Tests entity, column, relation, and hook decorators
 */

import 'reflect-metadata';
import { MetadataRegistry } from '../core/metadata-registry';
import { Entity, Column, PrimaryKey, OneToMany, ManyToOne, OneToOne, ManyToMany, BeforeInsert, AfterUpdate } from '../decorators';

describe('Decorators', () => {
  let metadataRegistry: MetadataRegistry;

  beforeEach(() => {
    metadataRegistry = MetadataRegistry.getInstance();
    metadataRegistry.clear();
  });

  afterEach(() => {
    metadataRegistry.clear();
  });

  describe('@Entity decorator', () => {
    it('should register entity with default options', () => {
      @Entity()
      class User {
        @PrimaryKey()
        id!: number;
      }

      const entityMetadata = metadataRegistry.getEntity(User);
      expect(entityMetadata).toBeDefined();
      expect(entityMetadata?.name).toBe('User');
      expect(entityMetadata?.tableName).toBe('user');
    });

    it('should register entity with custom options', () => {
      @Entity({ tableName: 'users', name: 'UserEntity' })
      class User {
        @PrimaryKey()
        id!: number;
      }

      const entityMetadata = metadataRegistry.getEntity(User);
      expect(entityMetadata).toBeDefined();
      expect(entityMetadata?.name).toBe('UserEntity');
      expect(entityMetadata?.tableName).toBe('users');
    });
  });

  describe('@Column decorator', () => {
    it('should register column with default options', () => {
      @Entity()
      class User {
        @Column()
        name!: string;
      }

      // Force entity registration
      const entityMetadata = metadataRegistry.getEntity(User);
      expect(entityMetadata).toBeDefined();

      const columnMetadata = metadataRegistry.getColumn(User, 'name');
      expect(columnMetadata).toBeDefined();
      expect(columnMetadata?.name).toBe('name');
      expect(columnMetadata?.type).toBe('string');
      expect(columnMetadata?.nullable).toBe(true);
    });

    it('should register column with custom options', () => {
      @Entity()
      class User {
        @Column({ name: 'user_name', type: 'string', nullable: false, unique: true })
        name!: string;
      }

      // Force entity registration
      const entityMetadata = metadataRegistry.getEntity(User);
      expect(entityMetadata).toBeDefined();

      const columnMetadata = metadataRegistry.getColumn(User, 'name');
      expect(columnMetadata).toBeDefined();
      expect(columnMetadata?.name).toBe('user_name');
      expect(columnMetadata?.type).toBe('string');
      expect(columnMetadata?.nullable).toBe(false);
      expect(columnMetadata?.unique).toBe(true);
    });

    it('should register primary key column', () => {
      @Entity()
      class User {
        @PrimaryKey()
        id!: number;
      }

      const columnMetadata = metadataRegistry.getColumn(User, 'id');
      expect(columnMetadata).toBeDefined();
      expect(columnMetadata?.primary).toBe(true);
      expect(columnMetadata?.nullable).toBe(false);
    });

    it('should register generated column', () => {
      @Entity()
      class User {
        @PrimaryKey()
        @Column({ generated: true })
        id!: number;
      }

      const columnMetadata = metadataRegistry.getColumn(User, 'id');
      expect(columnMetadata).toBeDefined();
      expect(columnMetadata?.generated).toBe(true);
    });

    it('should register unique column', () => {
      @Entity()
      class User {
        @Column({ unique: true })
        email!: string;
      }

      const columnMetadata = metadataRegistry.getColumn(User, 'email');
      expect(columnMetadata).toBeDefined();
      expect(columnMetadata?.unique).toBe(true);
    });

    it('should register not null column', () => {
      @Entity()
      class User {
        @Column({ nullable: false })
        name!: string;
      }

      const columnMetadata = metadataRegistry.getColumn(User, 'name');
      expect(columnMetadata).toBeDefined();
      expect(columnMetadata?.nullable).toBe(false);
    });
  });

  describe('@OneToMany decorator', () => {
    it('should register OneToMany relation', () => {
      @Entity()
      class Post {
        @PrimaryKey()
        id!: number;
      }

      @Entity()
      class User {
        @PrimaryKey()
        id!: number;

        @OneToMany(() => Post, 'userId')
        posts!: Post[];
      }

      const relationMetadata = metadataRegistry.getRelation(User, 'posts');
      expect(relationMetadata).toBeDefined();
      expect(relationMetadata?.type).toBe('OneToMany');
      expect(relationMetadata?.target).toBe(Post);
      expect(relationMetadata?.joinColumn).toBe('userId');
    });

    it('should register OneToMany relation with cascade options', () => {
      @Entity()
      class Post {
        @PrimaryKey()
        id!: number;
      }

      @Entity()
      class User {
        @PrimaryKey()
        id!: number;

        @OneToMany({ 
          target: () => Post,
          joinColumn: 'userId',
          cascade: ['insert', 'update', 'remove'],
          eager: true
        })
        posts!: Post[];
      }

      const relationMetadata = metadataRegistry.getRelation(User, 'posts');
      expect(relationMetadata).toBeDefined();
      expect(relationMetadata?.cascade).toEqual([true, true, true]);
      expect(relationMetadata?.eager).toBe(true);
    });
  });

  describe('@ManyToOne decorator', () => {
    it('should register ManyToOne relation', () => {
      @Entity()
      class User {
        @PrimaryKey()
        id!: number;
      }

      @Entity()
      class Post {
        @PrimaryKey()
        id!: number;

        @ManyToOne(() => User, 'userId')
        user!: User;
      }

      const relationMetadata = metadataRegistry.getRelation(Post, 'user');
      expect(relationMetadata).toBeDefined();
      expect(relationMetadata?.type).toBe('ManyToOne');
      expect(relationMetadata?.target).toBe(User);
      expect(relationMetadata?.joinColumn).toBe('userId');
    });
  });

  describe('@OneToOne decorator', () => {
    it('should register OneToOne relation', () => {
      @Entity()
      class Profile {
        @PrimaryKey()
        id!: number;
      }

      @Entity()
      class User {
        @PrimaryKey()
        id!: number;

        @OneToOne(() => Profile, 'userId')
        profile!: Profile;
      }

      const relationMetadata = metadataRegistry.getRelation(User, 'profile');
      expect(relationMetadata).toBeDefined();
      expect(relationMetadata?.type).toBe('OneToOne');
      expect(relationMetadata?.target).toBe(Profile);
      expect(relationMetadata?.joinColumn).toBe('userId');
    });
  });

  describe('@ManyToMany decorator', () => {
    it('should register ManyToMany relation', () => {
      @Entity()
      class Tag {
        @PrimaryKey()
        id!: number;
      }

      @Entity()
      class Post {
        @PrimaryKey()
        id!: number;

        @ManyToMany({
          target: () => Tag,
          joinTable: 'post_tags',
          joinColumn: 'postId',
          inverseJoinColumn: 'tagId'
        })
        tags!: Tag[];
      }

      const relationMetadata = metadataRegistry.getRelation(Post, 'tags');
      expect(relationMetadata).toBeDefined();
      expect(relationMetadata?.type).toBe('ManyToMany');
      expect(relationMetadata?.target).toBe(Tag);
      expect(relationMetadata?.joinTable).toBe('post_tags');
      expect(relationMetadata?.joinColumn).toBe('postId');
      expect(relationMetadata?.inverseJoinColumn).toBe('tagId');
    });
  });

  describe('Hook decorators', () => {
    it('should register BeforeInsert hook', () => {
      @Entity()
      class User {
        @PrimaryKey()
        id!: number;

        @BeforeInsert()
        beforeInsert() {
          // Hook implementation
        }
      }

      const hookMetadata = metadataRegistry.getHook(User, 'beforeInsert');
      expect(hookMetadata).toBeDefined();
      expect(hookMetadata?.type).toBe('beforeInsert');
    });

    it('should register AfterUpdate hook', () => {
      @Entity()
      class User {
        @PrimaryKey()
        id!: number;

        @AfterUpdate()
        afterUpdate() {
          // Hook implementation
        }
      }

      const hookMetadata = metadataRegistry.getHook(User, 'afterUpdate');
      expect(hookMetadata).toBeDefined();
      expect(hookMetadata?.type).toBe('afterUpdate');
    });

    it('should register multiple hooks', () => {
      @Entity()
      class User {
        @PrimaryKey()
        id!: number;

        @BeforeInsert()
        beforeInsert() {
          // Hook implementation
        }

        @AfterUpdate()
        afterUpdate() {
          // Hook implementation
        }
      }

      const hooks = metadataRegistry.getHooks(User);
      expect(hooks).toHaveLength(2);
      expect(hooks.some(hook => hook.type === 'beforeInsert')).toBe(true);
      expect(hooks.some(hook => hook.type === 'afterUpdate')).toBe(true);
    });
  });

  describe('Complex entity with all decorators', () => {
    it('should register complex entity with all decorators', () => {
      // Define related classes first
      @Entity()
      class ComplexPost {
        @PrimaryKey()
        id!: number;
      }

      @Entity()
      class ComplexProfile {
        @PrimaryKey()
        id!: number;
      }

      @Entity()
      class ComplexTag {
        @PrimaryKey()
        id!: number;
      }

      @Entity({ tableName: 'users' })
      class User {
        @PrimaryKey()
        id!: number;

        @Column({ unique: true })
        email!: string;

        @Column()
        name!: string;

        @Column()
        password!: string;

        @Column()
        createdAt!: Date;

        @OneToMany(() => ComplexPost, 'userId')
        posts!: ComplexPost[];

        @OneToOne(() => ComplexProfile, 'userId')
        profile!: ComplexProfile;

        @BeforeInsert()
        beforeInsert() {
          this.createdAt = new Date();
        }

        @AfterUpdate()
        afterUpdate() {
          // Update timestamp
        }
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

        @ManyToOne(() => User, 'userId')
        user!: User;

        @ManyToMany({
          target: () => ComplexTag,
          joinTable: 'post_tags',
          joinColumn: 'postId',
          inverseJoinColumn: 'tagId'
        })
        tags!: ComplexTag[];
      }

      @Entity({ tableName: 'profiles' })
      class Profile {
        @PrimaryKey()
        id!: number;

        @Column()
        bio!: string;

        @Column()
        userId!: number;
      }

      @Entity({ tableName: 'tags' })
      class Tag {
        @PrimaryKey()
        id!: number;

        @Column({ unique: true })
        name!: string;
      }

      // Verify User entity
      const userMetadata = metadataRegistry.getEntity(User);
      expect(userMetadata).toBeDefined();
      expect(userMetadata?.tableName).toBe('users');

      const userColumns = metadataRegistry.getColumns(User);
      expect(userColumns).toHaveLength(5); // id, email, name, password, createdAt

      const userRelations = metadataRegistry.getRelations(User);
      expect(userRelations).toHaveLength(2); // posts, profile

      const userHooks = metadataRegistry.getHooks(User);
      expect(userHooks).toHaveLength(2); // beforeInsert, afterUpdate

      // Verify Post entity
      const postMetadata = metadataRegistry.getEntity(Post);
      expect(postMetadata).toBeDefined();
      expect(postMetadata?.tableName).toBe('posts');

      const postRelations = metadataRegistry.getRelations(Post);
      expect(postRelations).toHaveLength(2); // user, tags

      // Verify Profile entity
      const profileMetadata = metadataRegistry.getEntity(Profile);
      expect(profileMetadata).toBeDefined();
      expect(profileMetadata?.tableName).toBe('profiles');

      // Verify Tag entity
      const tagMetadata = metadataRegistry.getEntity(Tag);
      expect(tagMetadata).toBeDefined();
      expect(tagMetadata?.tableName).toBe('tags');
    });
  });
});
