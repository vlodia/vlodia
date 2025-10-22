"use strict";
/**
 * Base Database Adapter
 * Abstract base class for database adapters providing common functionality
 * Implements the adapter pattern for database-agnostic operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAdapter = void 0;
class BaseAdapter {
    isConnected = false;
    currentTransaction = null;
    /**
     * Check if currently connected
     */
    isConnectedToDatabase() {
        return this.isConnected;
    }
    /**
     * Get current transaction
     */
    getCurrentTransaction() {
        return this.currentTransaction;
    }
    /**
     * Check if in transaction
     */
    inTransaction() {
        return this.currentTransaction !== null && this.currentTransaction.isActive;
    }
    /**
     * Generate a unique transaction ID
     */
    generateTransactionId() {
        return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Generate a unique savepoint name
     */
    generateSavepointName() {
        return `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Validate SQL query for security
     */
    validateQuery(sql) {
        // Basic SQL injection prevention
        const dangerousPatterns = [
            /--/g,
            /\/\*/g,
            /\/\*.*?\*\//g,
            /;\s*drop\s+table/gi,
            /;\s*delete\s+from/gi,
            /;\s*truncate\s+table/gi,
            /;\s*alter\s+table/gi,
            /;\s*create\s+table/gi,
            /;\s*drop\s+database/gi,
        ];
        for (const pattern of dangerousPatterns) {
            if (pattern.test(sql)) {
                throw new Error('Potentially dangerous SQL detected');
            }
        }
    }
    /**
     * Escape identifier for database-specific syntax
     */
    escapeIdentifier(identifier) {
        return `"${identifier}"`;
    }
    /**
     * Convert JavaScript value to database value
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
     * Convert database value to JavaScript value
     */
    convertFromDatabase(value, type) {
        if (value === null || value === undefined) {
            return null;
        }
        switch (type.toLowerCase()) {
            case 'date':
            case 'timestamp':
            case 'datetime':
                return new Date(value);
            case 'json':
            case 'jsonb':
                return typeof value === 'string' ? JSON.parse(value) : value;
            case 'boolean':
                return Boolean(value);
            case 'number':
            case 'integer':
            case 'bigint':
                return Number(value);
            default:
                return value;
        }
    }
    /**
     * Get database-specific type mapping
     */
    getDatabaseType(columnType) {
        const typeMap = {
            string: 'VARCHAR',
            number: 'INTEGER',
            boolean: 'BOOLEAN',
            date: 'TIMESTAMP',
            json: 'JSON',
            uuid: 'UUID',
            text: 'TEXT',
            blob: 'BLOB',
        };
        return typeMap[columnType] || 'VARCHAR';
    }
    /**
     * Get database-specific limit syntax
     */
    getLimitSyntax(limit, offset) {
        if (offset) {
            return `LIMIT ${limit} OFFSET ${offset}`;
        }
        return `LIMIT ${limit}`;
    }
    /**
     * Get database-specific order by syntax
     */
    getOrderBySyntax(orderBy) {
        const clauses = Object.entries(orderBy).map(([column, direction]) => `${this.escapeIdentifier(column)} ${direction}`);
        return `ORDER BY ${clauses.join(', ')}`;
    }
}
exports.BaseAdapter = BaseAdapter;
//# sourceMappingURL=base-adapter.js.map