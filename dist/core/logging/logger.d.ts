/**
 * Logging System
 * Structured logging with multiple levels and formatters
 * Provides comprehensive logging for ORM operations
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
    meta?: any;
    context?: string;
}
export interface Logger {
    error(message: string, meta?: any, context?: string): void;
    warn(message: string, meta?: any, context?: string): void;
    info(message: string, meta?: any, context?: string): void;
    debug(message: string, meta?: any, context?: string): void;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    isEnabled(level: LogLevel): boolean;
}
export interface LogFormatter {
    format(entry: LogEntry): string;
}
export declare class DefaultLogFormatter implements LogFormatter {
    format(entry: LogEntry): string;
}
export declare class JSONLogFormatter implements LogFormatter {
    format(entry: LogEntry): string;
}
export declare class DefaultLogger implements Logger {
    private level;
    private formatter;
    private context;
    constructor(formatter?: LogFormatter, context?: string);
    /**
     * Log error message
     */
    error(message: string, meta?: any, context?: string): void;
    /**
     * Log warning message
     */
    warn(message: string, meta?: any, context?: string): void;
    /**
     * Log info message
     */
    info(message: string, meta?: any, context?: string): void;
    /**
     * Log debug message
     */
    debug(message: string, meta?: any, context?: string): void;
    /**
     * Set log level
     */
    setLevel(level: LogLevel): void;
    /**
     * Get current log level
     */
    getLevel(): LogLevel;
    /**
     * Check if level is enabled
     */
    isEnabled(level: LogLevel): boolean;
    /**
     * Internal log method
     */
    private log;
}
export declare class QueryLogger {
    private logger;
    private enabled;
    constructor(logger: Logger, enabled?: boolean);
    /**
     * Log query start
     */
    logQueryStart(sql: string, params?: any[]): void;
    /**
     * Log query end
     */
    logQueryEnd(sql: string, duration: number, rowCount?: number): void;
    /**
     * Log query error
     */
    logQueryError(sql: string, error: Error, duration?: number): void;
    /**
     * Mask sensitive data in SQL
     */
    private maskSensitiveData;
    /**
     * Mask sensitive parameters
     */
    private maskSensitiveParams;
}
export declare class PerformanceLogger {
    private logger;
    private timers;
    constructor(logger: Logger);
    /**
     * Start performance timer
     */
    startTimer(name: string): void;
    /**
     * End performance timer and log
     */
    endTimer(name: string, context?: string): number;
    /**
     * Measure function execution time
     */
    measure<T>(name: string, fn: () => Promise<T>, context?: string): Promise<T>;
}
//# sourceMappingURL=logger.d.ts.map