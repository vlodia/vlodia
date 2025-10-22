"use strict";
/**
 * Utility Helpers
 * Common utility functions for Nythera ORM
 * Provides helper functions for data manipulation and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.unflattenObject = exports.flattenObject = exports.getObjectKeys = exports.isObject = exports.isPrimitive = exports.formatDuration = exports.formatBytes = exports.throttle = exports.debounce = exports.retry = exports.sleep = exports.hashString = exports.createPlaceholder = exports.escapeIdentifier = exports.sanitizeString = exports.toDate = exports.toBoolean = exports.toNumber = exports.toString = exports.isNotEmpty = exports.isEmpty = exports.deepClone = exports.generateRandomDate = exports.generateRandomEmail = exports.generateRandomNumber = exports.generateRandomString = exports.generateUUID = void 0;
const uuid_1 = require("uuid");
/**
 * Generate UUID
 */
function generateUUID() {
    return (0, uuid_1.v4)();
}
exports.generateUUID = generateUUID;
/**
 * Generate random string
 */
function generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
exports.generateRandomString = generateRandomString;
/**
 * Generate random number
 */
function generateRandomNumber(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.generateRandomNumber = generateRandomNumber;
/**
 * Generate random email
 */
function generateRandomEmail() {
    const domains = ['example.com', 'test.com', 'demo.org', 'sample.net'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const username = generateRandomString(8);
    return `${username}@${domain}`;
}
exports.generateRandomEmail = generateRandomEmail;
/**
 * Generate random date
 */
function generateRandomDate(start, end) {
    const startDate = start || new Date(2020, 0, 1);
    const endDate = end || new Date();
    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    return new Date(randomTime);
}
exports.generateRandomDate = generateRandomDate;
/**
 * Deep clone object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
    return obj;
}
exports.deepClone = deepClone;
/**
 * Check if value is empty
 */
function isEmpty(value) {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string') {
        return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }
    return false;
}
exports.isEmpty = isEmpty;
/**
 * Check if value is not empty
 */
function isNotEmpty(value) {
    return !isEmpty(value);
}
exports.isNotEmpty = isNotEmpty;
/**
 * Convert value to string
 */
function toString(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value);
}
exports.toString = toString;
/**
 * Convert value to number
 */
function toNumber(value) {
    if (value === null || value === undefined) {
        return 0;
    }
    const num = Number(value);
    return isNaN(num) ? 0 : num;
}
exports.toNumber = toNumber;
/**
 * Convert value to boolean
 */
function toBoolean(value) {
    if (value === null || value === undefined) {
        return false;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return Boolean(value);
}
exports.toBoolean = toBoolean;
/**
 * Convert value to date
 */
function toDate(value) {
    if (value === null || value === undefined) {
        return null;
    }
    if (value instanceof Date) {
        return value;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
}
exports.toDate = toDate;
/**
 * Sanitize string for SQL
 */
function sanitizeString(str) {
    return str
        .replace(/'/g, "''")
        .replace(/"/g, '""')
        .replace(/\\/g, '\\\\')
        .replace(/\0/g, '\\0')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}
exports.sanitizeString = sanitizeString;
/**
 * Escape SQL identifier
 */
function escapeIdentifier(identifier) {
    return `"${identifier.replace(/"/g, '""')}"`;
}
exports.escapeIdentifier = escapeIdentifier;
/**
 * Create SQL placeholder
 */
function createPlaceholder(index) {
    return `$${index}`;
}
exports.createPlaceholder = createPlaceholder;
/**
 * Hash string
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
}
exports.hashString = hashString;
/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
/**
 * Retry function with exponential backoff
 */
async function retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxAttempts) {
                throw lastError;
            }
            const backoffDelay = delay * Math.pow(2, attempt - 1);
            await sleep(backoffDelay);
        }
    }
    throw lastError;
}
exports.retry = retry;
/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
    };
}
exports.debounce = debounce;
/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(null, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
exports.throttle = throttle;
/**
 * Format bytes to human readable string
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
exports.formatBytes = formatBytes;
/**
 * Format duration to human readable string
 */
function formatDuration(ms) {
    if (ms < 1000) {
        return `${ms}ms`;
    }
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}m ${seconds % 60}s`;
    }
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
}
exports.formatDuration = formatDuration;
/**
 * Check if value is primitive
 */
function isPrimitive(value) {
    return value === null ||
        value === undefined ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'symbol' ||
        typeof value === 'bigint';
}
exports.isPrimitive = isPrimitive;
/**
 * Check if value is object
 */
function isObject(value) {
    return value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        !(value instanceof RegExp);
}
exports.isObject = isObject;
/**
 * Get object keys recursively
 */
function getObjectKeys(obj, prefix = '') {
    const keys = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            keys.push(fullKey);
            if (isObject(obj[key])) {
                keys.push(...getObjectKeys(obj[key], fullKey));
            }
        }
    }
    return keys;
}
exports.getObjectKeys = getObjectKeys;
/**
 * Flatten nested object
 */
function flattenObject(obj, prefix = '') {
    const flattened = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (isObject(obj[key])) {
                Object.assign(flattened, flattenObject(obj[key], fullKey));
            }
            else {
                flattened[fullKey] = obj[key];
            }
        }
    }
    return flattened;
}
exports.flattenObject = flattenObject;
/**
 * Unflatten object
 */
function unflattenObject(obj) {
    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const keys = key.split('.');
            let current = result;
            for (let i = 0; i < keys.length - 1; i++) {
                const k = keys[i];
                if (k && !(k in current)) {
                    current[k] = {};
                }
                if (k) {
                    current = current[k];
                }
            }
            const lastKey = keys[keys.length - 1];
            if (lastKey) {
                current[lastKey] = obj[key];
            }
        }
    }
    return result;
}
exports.unflattenObject = unflattenObject;
//# sourceMappingURL=helpers.js.map