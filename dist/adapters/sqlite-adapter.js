"use strict";
/**
 * SQLite Adapter
 * Database adapter implementation for SQLite with connection pooling
 * Provides optimized SQLite-specific features and syntax
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteAdapter = void 0;
const base_adapter_1 = require("./base-adapter");
class SqliteAdapter extends base_adapter_1.BaseAdapter {
    db = null;
    config;
    constructor(config) {
        super();
        this.config = config;
    }
    /**
     * Connect to SQLite database
     */
    async connect() {
        if (this.isConnected) {
            return;
        }
        const sqlite = require('sqlite');
        this.db = await sqlite.open(this.config.database);
        this.isConnected = true;
    }
    /**
     * Disconnect from SQLite database
     */
    async disconnect() {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
    /**
     * Execute a parameterized query
     */
    async query(sql, params) {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        this.validateQuery(sql);
        const rows = await this.db.all(sql, params || []);
        return {
            rows: rows,
            rowCount: rows.length,
            fields: [], // SQLite doesn't provide field metadata in this format
        };
    }
    /**
     * Begin a new transaction
     */
    async begin() {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        const transaction = {
            id: this.generateTransactionId(),
            level: 'SERIALIZABLE',
            savepoints: [],
            isActive: true,
        };
        this.currentTransaction = transaction;
        await this.db.run('BEGIN TRANSACTION');
        return transaction;
    }
    /**
     * Commit a transaction
     */
    async commit(transaction) {
        if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
            throw new Error('Invalid transaction');
        }
        await this.db.run('COMMIT');
        this.currentTransaction = null;
    }
    /**
     * Rollback a transaction
     */
    async rollback(transaction) {
        if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
            throw new Error('Invalid transaction');
        }
        await this.db.run('ROLLBACK');
        this.currentTransaction = null;
    }
    /**
     * Create a savepoint within a transaction
     */
    async savepoint(transaction, name) {
        if (!this.currentTransaction || this.currentTransaction.id !== transaction.id) {
            throw new Error('Invalid transaction');
        }
        await this.db.run(`SAVEPOINT ${name}`);
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
        await this.db.run(`ROLLBACK TO SAVEPOINT ${name}`);
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
        await this.db.run(`RELEASE SAVEPOINT ${name}`);
        const index = transaction.savepoints.indexOf(name);
        transaction.savepoints.splice(index, 1);
    }
    /**
     /**
      * Get SQLite-specific type mapping.
      * Maps logical ORM column types to their SQLite storage representations.
      *
      * @param columnType - The logical column type (from Nythera's type system).
      * @returns SQLite type as a string.
      *
      * Design:
      *   - Uses an explicit type map.
      *   - Defaults to TEXT for unknown types; ensures type safety.
      *   - Complies with strict TypeScript and production standards.
      *
      * Trade-offs:
      *   - Simplicity and maintainability; sacrificing lower-level type control.
      *   - Performance is unaffected at runtime (static config).
      */
    getDatabaseType(columnType) {
        const typeMap = {
            string: 'TEXT',
            number: 'INTEGER',
            boolean: 'INTEGER',
            date: 'TEXT',
            json: 'TEXT',
            uuid: 'TEXT',
            text: 'TEXT',
            blob: 'BLOB',
        };
        return typeMap[columnType] || 'TEXT';
    }
    /**
     * Get SQLite-specific limit syntax
     */
    getLimitSyntax(limit, offset) {
        if (offset) {
            return `LIMIT ${limit} OFFSET ${offset}`;
        }
        return `LIMIT ${limit}`;
    }
    /**
     * Get SQLite-specific order by syntax
     */
    getOrderBySyntax(orderBy) {
        const clauses = Object.entries(orderBy).map(([column, direction]) => `"${column}" ${direction}`);
        return `ORDER BY ${clauses.join(', ')}`;
    }
    /**
     * Get SQLite-specific escape identifier
     */
    escapeIdentifier(identifier) {
        return `"${identifier}"`;
    }
    /**
     * Get SQLite-specific value conversion
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
        if (typeof value === 'boolean') {
            return value ? 1 : 0;
        }
        return value;
    }
    /**
     * Get SQLite-specific value conversion from database
     */
    convertFromDatabase(value, type) {
        if (value === null || value === undefined) {
            return null;
        }
        switch (type.toLowerCase()) {
            case 'text':
                // Try to parse as date if it looks like an ISO string
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                    return new Date(value);
                }
                return value;
            case 'json':
                return typeof value === 'string' ? JSON.parse(value) : value;
            case 'integer':
                return Number(value);
            case 'boolean':
                return Boolean(value);
            default:
                return value;
        }
    }
}
exports.SqliteAdapter = SqliteAdapter;
//# sourceMappingURL=sqlite-adapter.js.map