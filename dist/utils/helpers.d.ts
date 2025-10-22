/**
 * Utility Helpers
 * Common utility functions for Nythera ORM
 * Provides helper functions for data manipulation and validation
 */
/**
 * Generate UUID
 */
export declare function generateUUID(): string;
/**
 * Generate random string
 */
export declare function generateRandomString(length?: number): string;
/**
 * Generate random number
 */
export declare function generateRandomNumber(min?: number, max?: number): number;
/**
 * Generate random email
 */
export declare function generateRandomEmail(): string;
/**
 * Generate random date
 */
export declare function generateRandomDate(start?: Date, end?: Date): Date;
/**
 * Deep clone object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Check if value is empty
 */
export declare function isEmpty(value: any): boolean;
/**
 * Check if value is not empty
 */
export declare function isNotEmpty(value: any): boolean;
/**
 * Convert value to string
 */
export declare function toString(value: any): string;
/**
 * Convert value to number
 */
export declare function toNumber(value: any): number;
/**
 * Convert value to boolean
 */
export declare function toBoolean(value: any): boolean;
/**
 * Convert value to date
 */
export declare function toDate(value: any): Date | null;
/**
 * Sanitize string for SQL
 */
export declare function sanitizeString(str: string): string;
/**
 * Escape SQL identifier
 */
export declare function escapeIdentifier(identifier: string): string;
/**
 * Create SQL placeholder
 */
export declare function createPlaceholder(index: number): string;
/**
 * Hash string
 */
export declare function hashString(str: string): string;
/**
 * Sleep for specified milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, maxAttempts?: number, delay?: number): Promise<T>;
/**
 * Debounce function
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Format bytes to human readable string
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * Format duration to human readable string
 */
export declare function formatDuration(ms: number): string;
/**
 * Check if value is primitive
 */
export declare function isPrimitive(value: any): boolean;
/**
 * Check if value is object
 */
export declare function isObject(value: any): boolean;
/**
 * Get object keys recursively
 */
export declare function getObjectKeys(obj: any, prefix?: string): string[];
/**
 * Flatten nested object
 */
export declare function flattenObject(obj: any, prefix?: string): Record<string, any>;
/**
 * Unflatten object
 */
export declare function unflattenObject(obj: Record<string, any>): any;
//# sourceMappingURL=helpers.d.ts.map