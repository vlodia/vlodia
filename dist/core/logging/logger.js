"use strict";
/**
 * Logging System
 * Structured logging with multiple levels and formatters
 * Provides comprehensive logging for ORM operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceLogger = exports.QueryLogger = exports.DefaultLogger = exports.JSONLogFormatter = exports.DefaultLogFormatter = void 0;
class DefaultLogFormatter {
    format(entry) {
        const timestamp = entry.timestamp.toISOString();
        const level = entry.level.toUpperCase().padEnd(5);
        const context = entry.context ? `[${entry.context}]` : '';
        const meta = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';
        return `${timestamp} ${level} ${context} ${entry.message}${meta}`;
    }
}
exports.DefaultLogFormatter = DefaultLogFormatter;
class JSONLogFormatter {
    format(entry) {
        return JSON.stringify({
            timestamp: entry.timestamp.toISOString(),
            level: entry.level,
            message: entry.message,
            context: entry.context,
            meta: entry.meta,
        });
    }
}
exports.JSONLogFormatter = JSONLogFormatter;
class DefaultLogger {
    level = 'info';
    formatter;
    context;
    constructor(formatter = new DefaultLogFormatter(), context) {
        this.formatter = formatter;
        this.context = context || 'Vlodia';
    }
    /**
     * Log error message
     */
    error(message, meta, context) {
        this.log('error', message, meta, context);
    }
    /**
     * Log warning message
     */
    warn(message, meta, context) {
        this.log('warn', message, meta, context);
    }
    /**
     * Log info message
     */
    info(message, meta, context) {
        this.log('info', message, meta, context);
    }
    /**
     * Log debug message
     */
    debug(message, meta, context) {
        this.log('debug', message, meta, context);
    }
    /**
     * Set log level
     */
    setLevel(level) {
        this.level = level;
    }
    /**
     * Get current log level
     */
    getLevel() {
        return this.level;
    }
    /**
     * Check if level is enabled
     */
    isEnabled(level) {
        const levels = ['error', 'warn', 'info', 'debug'];
        const currentIndex = levels.indexOf(this.level);
        const targetIndex = levels.indexOf(level);
        return targetIndex <= currentIndex;
    }
    /**
     * Internal log method
     */
    log(level, message, meta, context) {
        if (!this.isEnabled(level)) {
            return;
        }
        const entry = {
            level,
            message,
            timestamp: new Date(),
            meta,
            context: context || this.context,
        };
        const formatted = this.formatter.format(entry);
        // Output to appropriate stream
        if (level === 'error') {
            console.error(formatted);
        }
        else if (level === 'warn') {
            console.warn(formatted);
        }
        else {
            console.log(formatted);
        }
    }
}
exports.DefaultLogger = DefaultLogger;
class QueryLogger {
    logger;
    enabled;
    constructor(logger, enabled = false) {
        this.logger = logger;
        this.enabled = enabled;
    }
    /**
     * Log query start
     */
    logQueryStart(sql, params) {
        if (!this.enabled)
            return;
        this.logger.debug('Query started', {
            sql: this.maskSensitiveData(sql),
            params: this.maskSensitiveParams(params),
            timestamp: Date.now(),
        }, 'QUERY');
    }
    /**
     * Log query end
     */
    logQueryEnd(sql, duration, rowCount) {
        if (!this.enabled)
            return;
        this.logger.debug('Query completed', {
            sql: this.maskSensitiveData(sql),
            duration: `${duration}ms`,
            rowCount,
            timestamp: Date.now(),
        }, 'QUERY');
    }
    /**
     * Log query error
     */
    logQueryError(sql, error, duration) {
        this.logger.error('Query failed', {
            sql: this.maskSensitiveData(sql),
            error: error.message,
            duration: duration ? `${duration}ms` : undefined,
            stack: error.stack,
        }, 'QUERY');
    }
    /**
     * Mask sensitive data in SQL
     */
    maskSensitiveData(sql) {
        return sql
            .replace(/password\s*=\s*'[^']*'/gi, "password = '***'")
            .replace(/password\s*=\s*"[^"]*"/gi, 'password = "***"')
            .replace(/token\s*=\s*'[^']*'/gi, "token = '***'")
            .replace(/token\s*=\s*"[^"]*"/gi, 'token = "***"');
    }
    /**
     * Mask sensitive parameters
     */
    maskSensitiveParams(params) {
        if (!params)
            return [];
        return params.map(param => {
            if (typeof param === 'string' &&
                (param.includes('password') || param.includes('token') || param.includes('secret'))) {
                return '***';
            }
            return param;
        });
    }
}
exports.QueryLogger = QueryLogger;
class PerformanceLogger {
    logger;
    timers = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Start performance timer
     */
    startTimer(name) {
        this.timers.set(name, Date.now());
    }
    /**
     * End performance timer and log
     */
    endTimer(name, context) {
        const startTime = this.timers.get(name);
        if (!startTime) {
            this.logger.warn(`Timer ${name} was not started`);
            return 0;
        }
        const duration = Date.now() - startTime;
        this.timers.delete(name);
        this.logger.debug(`Performance: ${name}`, {
            duration: `${duration}ms`,
            timestamp: Date.now(),
        }, context || 'PERFORMANCE');
        return duration;
    }
    /**
     * Measure function execution time
     */
    async measure(name, fn, context) {
        this.startTimer(name);
        try {
            const result = await fn();
            this.endTimer(name, context);
            return result;
        }
        catch (error) {
            this.endTimer(name, context);
            throw error;
        }
    }
}
exports.PerformanceLogger = PerformanceLogger;
//# sourceMappingURL=logger.js.map