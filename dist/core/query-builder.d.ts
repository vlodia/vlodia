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
export declare class QueryBuilder {
    private ast;
    private parameters;
    private parameterIndex;
    constructor(options: QueryBuilderOptions);
    /**
     * Add SELECT columns
     */
    select(columns: string[]): this;
    /**
     * Add WHERE conditions
     */
    where(condition: WhereCondition): this;
    /**
     * Add AND WHERE conditions
     */
    andWhere(condition: WhereCondition): this;
    /**
     * Add OR WHERE conditions
     */
    orWhere(condition: WhereCondition): this;
    /**
     * Add ORDER BY clause
     */
    orderBy(orderBy: OrderByCondition): this;
    /**
     * Add LIMIT clause
     */
    limit(count: number): this;
    /**
     * Add OFFSET clause
     */
    offset(count: number): this;
    /**
     * Add JOIN clause
     */
    join(table: string, alias: string, on: string): this;
    /**
     * Add LEFT JOIN clause
     */
    leftJoin(table: string, alias: string, on: string): this;
    /**
     * Add RIGHT JOIN clause
     */
    rightJoin(table: string, alias: string, on: string): this;
    /**
     * Add FULL JOIN clause
     */
    fullJoin(table: string, alias: string, on: string): this;
    /**
     * Add GROUP BY clause
     */
    groupBy(columns: string[]): this;
    /**
     * Add HAVING clause
     */
    having(condition: WhereCondition): this;
    /**
     * Convert to INSERT query
     */
    insert(values: Record<string, any>): this;
    /**
     * Convert to UPDATE query
     */
    update(set: Record<string, any>): this;
    /**
     * Convert to DELETE query
     */
    delete(): this;
    /**
     * Build the final SQL query
     */
    build(): {
        sql: string;
        parameters: any[];
    };
    /**
     * Build SELECT query
     */
    private buildSelect;
    /**
     * Build INSERT query
     */
    private buildInsert;
    /**
     * Build UPDATE query
     */
    private buildUpdate;
    /**
     * Build DELETE query
     */
    private buildDelete;
    /**
     * Build WHERE clause from condition object
     */
    private buildWhere;
    /**
     * Add parameter and return placeholder
     */
    private addParameter;
}
//# sourceMappingURL=query-builder.d.ts.map