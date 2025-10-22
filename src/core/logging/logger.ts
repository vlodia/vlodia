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

export class DefaultLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const context = entry.context ? `[${entry.context}]` : '';
    const meta = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';

    return `${timestamp} ${level} ${context} ${entry.message}${meta}`;
  }
}

export class JSONLogFormatter implements LogFormatter {
  format(entry: LogEntry): string {
    return JSON.stringify({
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      context: entry.context,
      meta: entry.meta,
    });
  }
}

export class DefaultLogger implements Logger {
  private level: LogLevel = 'info';
  private formatter: LogFormatter;
  private context: string;

  constructor(formatter: LogFormatter = new DefaultLogFormatter(), context?: string) {
    this.formatter = formatter;
    this.context = context || 'Vlodia';
  }

  /**
   * Log error message
   */
  error(message: string, meta?: any, context?: string): void {
    this.log('error', message, meta, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: any, context?: string): void {
    this.log('warn', message, meta, context);
  }

  /**
   * Log info message
   */
  info(message: string, meta?: any, context?: string): void {
    this.log('info', message, meta, context);
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: any, context?: string): void {
    this.log('debug', message, meta, context);
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Check if level is enabled
   */
  isEnabled(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentIndex = levels.indexOf(this.level);
    const targetIndex = levels.indexOf(level);
    return targetIndex <= currentIndex;
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, meta?: any, context?: string): void {
    if (!this.isEnabled(level)) {
      return;
    }

    const entry: LogEntry = {
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
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }
}

export class QueryLogger {
  private logger: Logger;
  private enabled: boolean;

  constructor(logger: Logger, enabled: boolean = false) {
    this.logger = logger;
    this.enabled = enabled;
  }

  /**
   * Log query start
   */
  logQueryStart(sql: string, params?: any[]): void {
    if (!this.enabled) return;

    this.logger.debug(
      'Query started',
      {
        sql: this.maskSensitiveData(sql),
        params: this.maskSensitiveParams(params),
        timestamp: Date.now(),
      },
      'QUERY'
    );
  }

  /**
   * Log query end
   */
  logQueryEnd(sql: string, duration: number, rowCount?: number): void {
    if (!this.enabled) return;

    this.logger.debug(
      'Query completed',
      {
        sql: this.maskSensitiveData(sql),
        duration: `${duration}ms`,
        rowCount,
        timestamp: Date.now(),
      },
      'QUERY'
    );
  }

  /**
   * Log query error
   */
  logQueryError(sql: string, error: Error, duration?: number): void {
    this.logger.error(
      'Query failed',
      {
        sql: this.maskSensitiveData(sql),
        error: error.message,
        duration: duration ? `${duration}ms` : undefined,
        stack: error.stack,
      },
      'QUERY'
    );
  }

  /**
   * Mask sensitive data in SQL
   */
  private maskSensitiveData(sql: string): string {
    return sql
      .replace(/password\s*=\s*'[^']*'/gi, "password = '***'")
      .replace(/password\s*=\s*"[^"]*"/gi, 'password = "***"')
      .replace(/token\s*=\s*'[^']*'/gi, "token = '***'")
      .replace(/token\s*=\s*"[^"]*"/gi, 'token = "***"');
  }

  /**
   * Mask sensitive parameters
   */
  private maskSensitiveParams(params?: any[]): any[] {
    if (!params) return [];

    return params.map(param => {
      if (
        typeof param === 'string' &&
        (param.includes('password') || param.includes('token') || param.includes('secret'))
      ) {
        return '***';
      }
      return param;
    });
  }
}

export class PerformanceLogger {
  private logger: Logger;
  private timers = new Map<string, number>();

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Start performance timer
   */
  startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  /**
   * End performance timer and log
   */
  endTimer(name: string, context?: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      this.logger.warn(`Timer ${name} was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    this.logger.debug(
      `Performance: ${name}`,
      {
        duration: `${duration}ms`,
        timestamp: Date.now(),
      },
      context || 'PERFORMANCE'
    );

    return duration;
  }

  /**
   * Measure function execution time
   */
  async measure<T>(name: string, fn: () => Promise<T>, context?: string): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      this.endTimer(name, context);
      return result;
    } catch (error) {
      this.endTimer(name, context);
      throw error;
    }
  }
}
