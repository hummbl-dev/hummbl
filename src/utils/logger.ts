/**
 * Logging Utility
 * 
 * Centralized logging with environment-aware behavior
 * Production logs are minimal, development logs are verbose
 * 
 * @module utils/logger
 * @version 1.0.0
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private serviceName: string;

  constructor(serviceName: string = 'HUMMBL') {
    this.isDevelopment = import.meta.env.DEV;
    this.serviceName = serviceName;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.serviceName}] [${level.toUpperCase()}]`;
    
    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }
    
    return `${prefix} ${message}`;
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Info logs - always logged
   */
  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
    // In production, could send to analytics/monitoring service
  }

  /**
   * Warning logs - always logged
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
    // In production, could send to monitoring service
  }

  /**
   * Error logs - always logged with full context
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext: LogContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    
    console.error(this.formatMessage('error', message, errorContext));
    // In production, could send to error tracking service (Sentry, etc.)
  }

  /**
   * Create child logger with additional context
   */
  child(componentName: string): Logger {
    return new Logger(`${this.serviceName}:${componentName}`);
  }
}

// Export singleton instance
export const logger = new Logger('HUMMBL');

// Export factory for component-specific loggers
export function createLogger(componentName: string): Logger {
  return logger.child(componentName);
}
