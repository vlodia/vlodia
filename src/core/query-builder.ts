/**
 * Query Builder
 * Fluent, composable SQL query builder with AST compilation
 * Provides type-safe query construction with parameterized SQL generation
 */

import { WhereCondition, OrderByCondition } from '@/types';

export interface QueryBuilderOptions {
  tableName: string;
  alias?: string;
  select?: string[];
  where?: WhereCondition;
  orderBy?: OrderByCondition;
  limit?: number;
  offset?: number;
  joins?: JoinClause[];
  groupBy?: string[];
  having?: WhereCondition;
}

export interface JoinClause {
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
  table: string;
  alias?: string;
  on: string;
}

export interface QueryAST {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  alias?: string;
  columns: string[];
  where?: WhereCondition;
  orderBy?: OrderByCondition;
  limit?: number;
  offset?: number;
  joins?: JoinClause[];
  groupBy?: string[];
  having?: WhereCondition;
  values?: Record<string, any>;
  set?: Record<string, any>;
}

export class QueryBuilder {
  private ast: QueryAST;
  private parameters: any[] = [];
  private parameterIndex = 0;

  constructor(options: QueryBuilderOptions) {
    this.ast = {
      type: 'SELECT',
      table: options.tableName,
      ...(options.alias && { alias: options.alias }),
      columns: options.select || ['*'],
      ...(options.where && { where: options.where }),
      ...(options.orderBy && { orderBy: options.orderBy }),
      ...(options.limit && { limit: options.limit }),
      ...(options.offset && { offset: options.offset }),
      joins: options.joins || [],
      ...(options.groupBy && { groupBy: options.groupBy }),
      ...(options.having && { having: options.having }),
    };
  }

  /**
   * Add SELECT columns
   */
  select(columns: string[]): this {
    this.ast.columns = columns;
    return this;
  }

  /**
   * Add WHERE conditions
   */
  where(condition: WhereCondition): this {
    this.ast.where = condition;
    return this;
  }

  /**
   * Add AND WHERE conditions
   */
  andWhere(condition: WhereCondition): this {
    if (this.ast.where) {
      this.ast.where = { $and: [this.ast.where, condition] };
    } else {
      this.ast.where = condition;
    }
    return this;
  }

  /**
   * Add OR WHERE conditions
   */
  orWhere(condition: WhereCondition): this {
    if (this.ast.where) {
      this.ast.where = { $or: [this.ast.where, condition] };
    } else {
      this.ast.where = condition;
    }
    return this;
  }

  /**
   * Add ORDER BY clause
   */
  orderBy(orderBy: OrderByCondition): this {
    this.ast.orderBy = orderBy;
    return this;
  }

  /**
   * Add LIMIT clause
   */
  limit(count: number): this {
    this.ast.limit = count;
    return this;
  }

  /**
   * Add OFFSET clause
   */
  offset(count: number): this {
    this.ast.offset = count;
    return this;
  }

  /**
   * Add JOIN clause
   */
  join(table: string, alias: string, on: string): this {
    this.ast.joins = this.ast.joins || [];
    this.ast.joins.push({ type: 'INNER', table, alias, on });
    return this;
  }

  /**
   * Add LEFT JOIN clause
   */
  leftJoin(table: string, alias: string, on: string): this {
    this.ast.joins = this.ast.joins || [];
    this.ast.joins.push({ type: 'LEFT', table, alias, on });
    return this;
  }

  /**
   * Add RIGHT JOIN clause
   */
  rightJoin(table: string, alias: string, on: string): this {
    this.ast.joins = this.ast.joins || [];
    this.ast.joins.push({ type: 'RIGHT', table, alias, on });
    return this;
  }

  /**
   * Add FULL JOIN clause
   */
  fullJoin(table: string, alias: string, on: string): this {
    this.ast.joins = this.ast.joins || [];
    this.ast.joins.push({ type: 'FULL', table, alias, on });
    return this;
  }

  /**
   * Add GROUP BY clause
   */
  groupBy(columns: string[]): this {
    this.ast.groupBy = columns;
    return this;
  }

  /**
   * Add HAVING clause
   */
  having(condition: WhereCondition): this {
    this.ast.having = condition;
    return this;
  }

  /**
   * Convert to INSERT query
   */
  insert(values: Record<string, any>): this {
    this.ast.type = 'INSERT';
    this.ast.values = values;
    return this;
  }

  /**
   * Convert to UPDATE query
   */
  update(set: Record<string, any>): this {
    this.ast.type = 'UPDATE';
    this.ast.set = set;
    return this;
  }

  /**
   * Convert to DELETE query
   */
  delete(): this {
    this.ast.type = 'DELETE';
    return this;
  }

  /**
   * Build the final SQL query
   */
  build(): { sql: string; parameters: any[] } {
    this.parameters = [];
    this.parameterIndex = 0;

    let sql: string;
    switch (this.ast.type) {
      case 'SELECT':
        sql = this.buildSelect();
        break;
      case 'INSERT':
        sql = this.buildInsert();
        break;
      case 'UPDATE':
        sql = this.buildUpdate();
        break;
      case 'DELETE':
        sql = this.buildDelete();
        break;
      default:
        throw new Error(`Unsupported query type: ${this.ast.type}`);
    }

    return { sql, parameters: this.parameters };
  }

  /**
   * Build SELECT query
   */
  private buildSelect(): string {
    let sql = `SELECT ${this.ast.columns.join(', ')} FROM ${this.ast.table}`;

    if (this.ast.alias) {
      sql += ` AS ${this.ast.alias}`;
    }

    // Add JOINs
    if (this.ast.joins) {
      for (const join of this.ast.joins) {
        sql += ` ${join.type} JOIN ${join.table}`;
        if (join.alias) {
          sql += ` AS ${join.alias}`;
        }
        sql += ` ON ${join.on}`;
      }
    }

    // Add WHERE clause
    if (this.ast.where) {
      sql += ` WHERE ${this.buildWhere(this.ast.where)}`;
    }

    // Add GROUP BY clause
    if (this.ast.groupBy) {
      sql += ` GROUP BY ${this.ast.groupBy.join(', ')}`;
    }

    // Add HAVING clause
    if (this.ast.having) {
      sql += ` HAVING ${this.buildWhere(this.ast.having)}`;
    }

    // Add ORDER BY clause
    if (this.ast.orderBy) {
      const orderByClauses = Object.entries(this.ast.orderBy).map(
        ([column, direction]) => `${column} ${direction}`
      );
      sql += ` ORDER BY ${orderByClauses.join(', ')}`;
    }

    // Add LIMIT clause
    if (this.ast.limit) {
      sql += ` LIMIT ${this.ast.limit}`;
    }

    // Add OFFSET clause
    if (this.ast.offset) {
      sql += ` OFFSET ${this.ast.offset}`;
    }

    return sql;
  }

  /**
   * Build INSERT query
   */
  private buildInsert(): string {
    if (!this.ast.values) {
      throw new Error('INSERT query requires values');
    }

    const columns = Object.keys(this.ast.values);
    const values = columns.map(col => this.addParameter(this.ast.values![col]));

    return `INSERT INTO ${this.ast.table} (${columns.join(', ')}) VALUES (${values.join(', ')})`;
  }

  /**
   * Build UPDATE query
   */
  private buildUpdate(): string {
    if (!this.ast.set) {
      throw new Error('UPDATE query requires set values');
    }

    const setClauses = Object.entries(this.ast.set).map(
      ([column, value]) => `${column} = ${this.addParameter(value)}`
    );

    let sql = `UPDATE ${this.ast.table} SET ${setClauses.join(', ')}`;

    // Add WHERE clause
    if (this.ast.where) {
      sql += ` WHERE ${this.buildWhere(this.ast.where)}`;
    }

    return sql;
  }

  /**
   * Build DELETE query
   */
  private buildDelete(): string {
    let sql = `DELETE FROM ${this.ast.table}`;

    // Add WHERE clause
    if (this.ast.where) {
      sql += ` WHERE ${this.buildWhere(this.ast.where)}`;
    }

    return sql;
  }

  /**
   * Build WHERE clause from condition object
   */
  private buildWhere(condition: WhereCondition): string {
    const clauses: string[] = [];

    for (const [key, value] of Object.entries(condition)) {
      if (key === '$and') {
        const andClauses = (value as WhereCondition[]).map(cond => this.buildWhere(cond));
        clauses.push(`(${andClauses.join(' AND ')})`);
      } else if (key === '$or') {
        const orClauses = (value as WhereCondition[]).map(cond => this.buildWhere(cond));
        clauses.push(`(${orClauses.join(' OR ')})`);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle operators like { $gt: 18 }
        for (const [operator, opValue] of Object.entries(value)) {
          if (operator === '$in') {
            const values = (opValue as any[]).map(v => this.addParameter(v));
            clauses.push(`${key} IN (${values.join(', ')})`);
          } else if (operator === '$notIn') {
            const values = (opValue as any[]).map(v => this.addParameter(v));
            clauses.push(`${key} NOT IN (${values.join(', ')})`);
          } else if (operator === '$like') {
            clauses.push(`${key} LIKE ${this.addParameter(opValue)}`);
          } else if (operator === '$notLike') {
            clauses.push(`${key} NOT LIKE ${this.addParameter(opValue)}`);
          } else if (operator === '$between') {
            const [start, end] = opValue as [any, any];
            clauses.push(
              `${key} BETWEEN ${this.addParameter(start)} AND ${this.addParameter(end)}`
            );
          } else if (operator === '$notBetween') {
            const [start, end] = opValue as [any, any];
            clauses.push(
              `${key} NOT BETWEEN ${this.addParameter(start)} AND ${this.addParameter(end)}`
            );
          } else if (operator === '$isNull') {
            clauses.push(`${key} IS ${opValue ? '' : 'NOT '}NULL`);
          } else if (operator === '$isNotNull') {
            clauses.push(`${key} IS ${opValue ? 'NOT ' : ''}NULL`);
          } else if (operator === '$gt') {
            clauses.push(`${key} > ${this.addParameter(opValue)}`);
          } else if (operator === '$gte') {
            clauses.push(`${key} >= ${this.addParameter(opValue)}`);
          } else if (operator === '$lt') {
            clauses.push(`${key} < ${this.addParameter(opValue)}`);
          } else if (operator === '$lte') {
            clauses.push(`${key} <= ${this.addParameter(opValue)}`);
          } else if (operator === '$ne') {
            clauses.push(`${key} != ${this.addParameter(opValue)}`);
          }
        }
      } else {
        // Simple equality
        clauses.push(`${key} = ${this.addParameter(value)}`);
      }
    }

    return clauses.join(' AND ');
  }

  /**
   * Add parameter and return placeholder
   */
  private addParameter(value: any): string {
    this.parameters.push(value);
    return `$${++this.parameterIndex}`;
  }
}
