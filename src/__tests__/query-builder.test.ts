/**
 * Query Builder Tests
 * Comprehensive test suite for QueryBuilder functionality
 * Tests SQL generation, parameter binding, and query composition
 */

import { QueryBuilder } from '../core/query-builder';

describe('QueryBuilder', () => {
  describe('SELECT queries', () => {
    it('should build basic SELECT query', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users');
      expect(parameters).toEqual([]);
    });

    it('should build SELECT query with specific columns', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        select: ['id', 'name', 'email'],
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT id, name, email FROM users');
      expect(parameters).toEqual([]);
    });

    it('should build SELECT query with WHERE clause', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        where: { name: 'John Doe' },
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users WHERE name = $1');
      expect(parameters).toEqual(['John Doe']);
    });

    it('should build SELECT query with complex WHERE clause', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        where: {
          $and: [{ name: 'John Doe' }, { age: { $gt: 18 } }],
        },
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users WHERE (name = $1 AND age > $2)');
      expect(parameters).toEqual(['John Doe', 18]);
    });

    it('should build SELECT query with OR condition', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        where: {
          $or: [{ name: 'John Doe' }, { name: 'Jane Doe' }],
        },
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users WHERE (name = $1 OR name = $2)');
      expect(parameters).toEqual(['John Doe', 'Jane Doe']);
    });

    it('should build SELECT query with IN condition', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        where: { id: { $in: [1, 2, 3] } },
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users WHERE id IN ($1, $2, $3)');
      expect(parameters).toEqual([1, 2, 3]);
    });

    it('should build SELECT query with LIKE condition', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        where: { name: { $like: '%John%' } },
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users WHERE name LIKE $1');
      expect(parameters).toEqual(['%John%']);
    });

    it('should build SELECT query with BETWEEN condition', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        where: { age: { $between: [18, 65] } },
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users WHERE age BETWEEN $1 AND $2');
      expect(parameters).toEqual([18, 65]);
    });

    it('should build SELECT query with IS NULL condition', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        where: { email: { $isNull: true } },
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users WHERE email IS NULL');
      expect(parameters).toEqual([]);
    });

    it('should build SELECT query with IS NOT NULL condition', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        where: { email: { $isNotNull: true } },
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users WHERE email IS NOT NULL');
      expect(parameters).toEqual([]);
    });

    it('should build SELECT query with ORDER BY clause', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        orderBy: { name: 'ASC', createdAt: 'DESC' },
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users ORDER BY name ASC, createdAt DESC');
      expect(parameters).toEqual([]);
    });

    it('should build SELECT query with LIMIT clause', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        limit: 10,
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users LIMIT 10');
      expect(parameters).toEqual([]);
    });

    it('should build SELECT query with OFFSET clause', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        limit: 10,
        offset: 20,
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users LIMIT 10 OFFSET 20');
      expect(parameters).toEqual([]);
    });
  });

  describe('JOIN queries', () => {
    it('should build SELECT query with INNER JOIN', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        joins: [
          {
            type: 'INNER',
            table: 'posts',
            alias: 'p',
            on: 'users.id = p.userId',
          },
        ],
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users INNER JOIN posts AS p ON users.id = p.userId');
      expect(parameters).toEqual([]);
    });

    it('should build SELECT query with LEFT JOIN', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
      });

      builder.leftJoin('posts', 'p', 'users.id = p.userId');

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users LEFT JOIN posts AS p ON users.id = p.userId');
      expect(parameters).toEqual([]);
    });

    it('should build SELECT query with RIGHT JOIN', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
      });

      builder.rightJoin('posts', 'p', 'users.id = p.userId');

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users RIGHT JOIN posts AS p ON users.id = p.userId');
      expect(parameters).toEqual([]);
    });

    it('should build SELECT query with FULL JOIN', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
      });

      builder.fullJoin('posts', 'p', 'users.id = p.userId');

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users FULL JOIN posts AS p ON users.id = p.userId');
      expect(parameters).toEqual([]);
    });
  });

  describe('GROUP BY queries', () => {
    it('should build SELECT query with GROUP BY clause', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        groupBy: ['department', 'status'],
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users GROUP BY department, status');
      expect(parameters).toEqual([]);
    });

    it('should build SELECT query with HAVING clause', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        groupBy: ['department'],
        having: { count: { $gt: 5 } },
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe('SELECT * FROM users GROUP BY department HAVING count > $1');
      expect(parameters).toEqual([5]);
    });
  });

  describe('INSERT queries', () => {
    it('should build INSERT query', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
      });

      const { sql, parameters } = builder
        .insert({
          name: 'John Doe',
          email: 'john@example.com',
          age: 30,
        })
        .build();

      expect(sql).toBe('INSERT INTO users (name, email, age) VALUES ($1, $2, $3)');
      expect(parameters).toEqual(['John Doe', 'john@example.com', 30]);
    });
  });

  describe('UPDATE queries', () => {
    it('should build UPDATE query', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
      });

      const { sql, parameters } = builder
        .update({ name: 'John Updated', email: 'john.updated@example.com' })
        .where({ id: 1 })
        .build();

      expect(sql).toBe('UPDATE users SET name = $1, email = $2 WHERE id = $3');
      expect(parameters).toEqual(['John Updated', 'john.updated@example.com', 1]);
    });
  });

  describe('DELETE queries', () => {
    it('should build DELETE query', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
      });

      const { sql, parameters } = builder.delete().where({ id: 1 }).build();

      expect(sql).toBe('DELETE FROM users WHERE id = $1');
      expect(parameters).toEqual([1]);
    });
  });

  describe('Fluent API', () => {
    it('should support method chaining', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
      });

      const { sql, parameters } = builder
        .select(['id', 'name'])
        .where({ age: { $gt: 18 } })
        .orderBy({ name: 'ASC' })
        .limit(10)
        .build();

      expect(sql).toBe('SELECT id, name FROM users WHERE age > $1 ORDER BY name ASC LIMIT 10');
      expect(parameters).toEqual([18]);
    });

    it('should support AND WHERE chaining', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
      });

      const { sql, parameters } = builder
        .where({ name: 'John' })
        .andWhere({ age: { $gt: 18 } })
        .build();

      expect(sql).toBe('SELECT * FROM users WHERE (name = $1 AND age > $2)');
      expect(parameters).toEqual(['John', 18]);
    });

    it('should support OR WHERE chaining', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
      });

      const { sql, parameters } = builder.where({ name: 'John' }).orWhere({ name: 'Jane' }).build();

      expect(sql).toBe('SELECT * FROM users WHERE (name = $1 OR name = $2)');
      expect(parameters).toEqual(['John', 'Jane']);
    });
  });

  describe('Complex queries', () => {
    it('should build complex query with all clauses', () => {
      const builder = new QueryBuilder({
        tableName: 'users',
        select: ['id', 'name', 'email'],
        where: {
          $and: [{ age: { $gte: 18 } }, { $or: [{ status: 'active' }, { status: 'pending' }] }],
        },
        orderBy: { name: 'ASC' },
        limit: 10,
        offset: 20,
      });

      const { sql, parameters } = builder.build();

      expect(sql).toBe(
        'SELECT id, name, email FROM users WHERE (age >= $1 AND (status = $2 OR status = $3)) ORDER BY name ASC LIMIT 10 OFFSET 20'
      );
      expect(parameters).toEqual([18, 'active', 'pending']);
    });
  });
});
