/**
 * Core type definitions for Nythera ORM
 * Defines the fundamental interfaces and types used throughout the system
 */
export type DatabaseType = 'postgres' | 'mysql' | 'sqlite';
export type ColumnType = 'string' | 'number' | 'boolean' | 'date' | 'json' | 'uuid' | 'text' | 'blob';
export type RelationType = 'OneToOne' | 'OneToMany' | 'ManyToOne' | 'ManyToMany';
export type IsolationLevel = 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
export interface DatabaseConfig {
    type: DatabaseType;
    host?: string;
    port?: number;
    database: string;
    username?: string;
    password?: string;
    ssl?: boolean;
    pool?: {
        min: number;
        max: number;
        idle: number;
    };
}
export interface CacheConfig {
    enabled: boolean;
    type: 'memory' | 'redis';
    ttl: number;
    redis?: {
        host: string;
        port: number;
        password?: string;
    };
}
export interface LoggingConfig {
    level: 'error' | 'warn' | 'info' | 'debug';
    format: 'json' | 'text';
    queries: boolean;
}
export interface VlodiaConfig {
    database: DatabaseConfig;
    entities: Function[];
    cache?: CacheConfig;
    logging?: LoggingConfig;
    migrations?: {
        path: string;
        tableName: string;
    };
    realtime?: {
        enabled: boolean;
        port: number;
        path: string;
        cors: {
            origin: string[];
            credentials: boolean;
        };
        heartbeat: {
            interval: number;
            timeout: number;
        };
    };
    graphql?: {
        enabled: boolean;
        path: string;
        playground: boolean;
        introspection: boolean;
        subscriptions: boolean;
        cors: {
            origin: string[];
            credentials: boolean;
        };
    };
    tenancy?: {
        enabled: boolean;
        defaultTenant?: string;
    };
}
export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    fields: FieldInfo[];
}
export interface FieldInfo {
    name: string;
    dataType: string;
    nullable: boolean;
}
export interface Transaction {
    id: string;
    level: IsolationLevel;
    savepoints: string[];
    isActive: boolean;
}
export interface EntityMetadata {
    name: string;
    tableName: string;
    target: new () => any;
    columns: ColumnMetadata[];
    relations: RelationMetadata[];
    hooks: HookMetadata[];
    indexes: IndexMetadata[];
}
export interface ColumnMetadata {
    name: string;
    propertyName: string;
    type: ColumnType;
    nullable: boolean;
    primary: boolean;
    generated: boolean;
    unique: boolean;
    length?: number;
    precision?: number;
    scale?: number;
    defaultValue?: any;
}
export interface RelationMetadata {
    name: string;
    propertyName: string;
    type: RelationType;
    target: Function;
    joinColumn?: string;
    inverseJoinColumn?: string;
    joinTable?: string;
    cascade: boolean[];
    eager: boolean;
    lazy: boolean;
}
export interface HookMetadata {
    name: string;
    propertyName: string;
    type: 'beforeInsert' | 'afterInsert' | 'beforeUpdate' | 'afterUpdate' | 'beforeRemove' | 'afterRemove';
    method: string;
}
export interface IndexMetadata {
    name: string;
    columns: string[];
    unique: boolean;
    sparse: boolean;
}
export interface QueryOptions {
    where?: WhereCondition;
    orderBy?: OrderByCondition;
    limit?: number;
    offset?: number;
    relations?: string[];
    select?: string[];
    lock?: boolean;
}
export interface WhereCondition {
    [key: string]: any;
    $and?: WhereCondition[];
    $or?: WhereCondition[];
    $in?: any[];
    $notIn?: any[];
    $like?: string;
    $notLike?: string;
    $between?: [any, any];
    $notBetween?: [any, any];
    $isNull?: boolean;
    $isNotNull?: boolean;
    $gt?: any;
    $gte?: any;
    $lt?: any;
    $lte?: any;
    $ne?: any;
}
export interface OrderByCondition {
    [key: string]: 'ASC' | 'DESC';
}
export interface SaveOptions {
    cascade?: boolean;
    validate?: boolean;
    hooks?: boolean;
}
export interface RemoveOptions {
    cascade?: boolean;
    hooks?: boolean;
}
export interface Migration {
    id: string;
    name: string;
    up: string;
    down: string;
    timestamp: number;
}
export interface SchemaDiff {
    added: EntityMetadata[];
    modified: EntityMetadata[];
    removed: EntityMetadata[];
}
export interface Logger {
    error(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    debug(message: string, meta?: any): void;
}
export interface EventBus {
    emit(event: string, data?: any): void;
    on(event: string, handler: (data?: any) => void): void;
    off(event: string, handler: (data?: any) => void): void;
}
export interface Cache {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    clear(): Promise<void>;
}
export interface Adapter {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query<T>(sql: string, params?: any[]): Promise<QueryResult<T>>;
    begin(): Promise<Transaction>;
    commit(transaction: Transaction): Promise<void>;
    rollback(transaction: Transaction): Promise<void>;
    savepoint(transaction: Transaction, name: string): Promise<void>;
    rollbackToSavepoint(transaction: Transaction, name: string): Promise<void>;
    releaseSavepoint(transaction: Transaction, name: string): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map