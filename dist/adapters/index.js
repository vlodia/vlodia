"use strict";
/**
 * Database Adapters Index
 * Central export point for all database adapters
 * Provides a clean API for database-agnostic operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdapter = exports.SqliteAdapter = exports.MysqlAdapter = exports.PostgresAdapter = exports.BaseAdapter = void 0;
var base_adapter_1 = require("./base-adapter");
Object.defineProperty(exports, "BaseAdapter", { enumerable: true, get: function () { return base_adapter_1.BaseAdapter; } });
var postgres_adapter_1 = require("./postgres-adapter");
Object.defineProperty(exports, "PostgresAdapter", { enumerable: true, get: function () { return postgres_adapter_1.PostgresAdapter; } });
var mysql_adapter_1 = require("./mysql-adapter");
Object.defineProperty(exports, "MysqlAdapter", { enumerable: true, get: function () { return mysql_adapter_1.MysqlAdapter; } });
var sqlite_adapter_1 = require("./sqlite-adapter");
Object.defineProperty(exports, "SqliteAdapter", { enumerable: true, get: function () { return sqlite_adapter_1.SqliteAdapter; } });
const postgres_adapter_2 = require("./postgres-adapter");
const mysql_adapter_2 = require("./mysql-adapter");
const sqlite_adapter_2 = require("./sqlite-adapter");
function createAdapter(config) {
    switch (config.type) {
        case 'postgres':
            return new postgres_adapter_2.PostgresAdapter(config);
        case 'mysql':
            return new mysql_adapter_2.MysqlAdapter(config);
        case 'sqlite':
            return new sqlite_adapter_2.SqliteAdapter(config);
        default:
            throw new Error(`Unsupported database type: ${config.type}`);
    }
}
exports.createAdapter = createAdapter;
//# sourceMappingURL=index.js.map