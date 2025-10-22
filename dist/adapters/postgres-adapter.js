"use strict";
/**
 * PostgreSQL Adapter
 * Database adapter implementation for PostgreSQL with connection pooling
 * Provides optimized PostgreSQL-specific features and syntax
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAdapter = void 0;
const pg_1 = require("pg");
const base_adapter_1 = require("./base-adapter");
class PostgresAdapter extends base_adapter_1.BaseAdapter {
    pool = null;
    config;
    constructor(config) {
        super();
        this.config = config;
    }
    /**
     * Connect to PostgreSQL database
     */
    async connect() {
        if (this.isConnected) {
            return;
        }
        this.pool = new pg_1.Pool({
            host: this.config.host || 'localhost',
            port: this.config.port || 5432,
            database: this.config.database,
            user: this.config.username,
            password: this.config.password,
            ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
            max: this.config.pool?.max || 20,
            min: this.config.pool?.min || 2,
            idleTimeoutMillis: this.config.pool?.idle || 30000,
        });
        // Test connection
        const client = await this.pool.connect();
        await client.query('SELECT 1');
        client.release();
        this.isConnected = true;
    }
    /**
     * Disconnect from PostgreSQL database
     */
    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
        this.isConnected = false;
    }
    /**
     * Execute a parameterized query
     */
    async query(sql, params) {
        if (!this.pool) {
            throw new Error('Database not connected');
        }
        this.validateQuery(sql);
        const client = await this.pool.connect();
        try {
            const result = await client.query(sql, params);
            return {
                rows: result.rows,
                rowCount: result.rowCount || 0,
                fields: result.fields.map((field) => ({
                    name: field.name,
                    dataType: field.dataTypeID.toString(),
                    nullable: field.nullable,
                })),
            };
        }
        finally {
            client.release();
        }
    }
    /**
     * Begin a new transaction
     */
    async begin() {
        if (!this.pool) {
            throw new Error('Database not connected');
        }
        const transaction = {
            id: this.generateTransactionId(),
            level: 'READ_COMMITTED',
            savepoints: [],
            isActive: true,
        };
        this.currentTransaction = transaction;
        await this.query('BEGIN');
        return transaction;
    }
    /**
     * Commit a transaction
     */
    async commit(transaction) {
        if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
            throw new Error('Invalid transaction');
        }
        await this.query('COMMIT');
        this.currentTransaction = null;
    }
    /**
     * Rollback a transaction
     */
    async rollback(transaction) {
        if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
            throw new Error('Invalid transaction');
        }
        await this.query('ROLLBACK');
        this.currentTransaction = null;
    }
    /**
     * Create a savepoint within a transaction
     */
    async savepoint(transaction, name) {
        if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
            throw new Error('Invalid transaction');
        }
        await this.query(`SAVEPOINT ${name}`);
        transaction.savepoints.push(name);
    }
    /**
     * Rollback to a savepoint
     */
    async rollbackToSavepoint(transaction, name) {
        if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
            throw new Error('Invalid transaction');
        }
        if (!transaction.savepoints.includes(name)) {
            throw new Error('Savepoint not found');
        }
        await this.query(`ROLLBACK TO SAVEPOINT ${name}`);
        // Remove savepoints after this one
        const index = transaction.savepoints.indexOf(name);
        transaction.savepoints = transaction.savepoints.slice(0, index);
    }
    /**
     * Release a savepoint
     */
    async releaseSavepoint(transaction, name) {
        if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
            throw new Error('Invalid transaction');
        }
        if (!transaction.savepoints.includes(name)) {
            throw new Error('Savepoint not found');
        }
        await this.query(`RELEASE SAVEPOINT ${name}`);
        const index = transaction.savepoints.indexOf(name);
        transaction.savepoints.splice(index, 1);
    }
    /**
     * Get PostgreSQL-specific type mapping
     */
    getDatabaseType(columnType) {
        const typeMap = {
            string: 'VARCHAR',
            number: 'INTEGER',
            boolean: 'BOOLEAN',
            date: 'TIMESTAMP',
            json: 'JSONB',
            uuid: 'UUID',
            text: 'TEXT',
            blob: 'BYTEA',
        };
        return typeMap[columnType] || 'VARCHAR';
    }
    /**
     * Get PostgreSQL-specific limit syntax
     */
    getLimitSyntax(limit, offset) {
        if (offset) {
            return `LIMIT ${limit} OFFSET ${offset}`;
        }
        return `LIMIT ${limit}`;
    }
    /**
     * Get PostgreSQL-specific order by syntax
     */
    getOrderBySyntax(orderBy) {
        const clauses = Object.entries(orderBy)
            .map(([column, direction]) => `"${column}" ${direction}`);
        return `ORDER BY ${clauses.join(', ')}`;
    }
    /**
     * Get PostgreSQL-specific escape identifier
     */
    escapeIdentifier(identifier) {
        return `"${identifier}"`;
    }
    /**
     * Get PostgreSQL-specific value conversion
     */
    convertValue(value) {
        if (value === null || value === undefined) {
            return null;
        }
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return value;
    }
    /**
     * Get PostgreSQL-specific value conversion from database
     */
    convertFromDatabase(value, type) {
        if (value === null || value === undefined) {
            return null;
        }
        switch (type.toLowerCase()) {
            case 'timestamp':
            case 'timestamptz':
                return new Date(value);
            case 'jsonb':
            case 'json':
                return typeof value === 'string' ? JSON.parse(value) : value;
            case 'boolean':
                return Boolean(value);
            case 'integer':
            case 'bigint':
                return Number(value);
            default:
                return value;
        }
    }
}
exports.PostgresAdapter = PostgresAdapter;
//# sourceMappingURL=postgres-adapter.js.map