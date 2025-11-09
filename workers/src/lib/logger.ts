/**
 * Logging Utility for Cloudflare Workers
 * 
 * Centralized logging for server-side code
 * 
 * @module workers/lib/logger
 * @version 1.0.0
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private serviceName: string;

  constructor(serviceName: string = 'HUMMBL-Workers') {
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

  debug(message: string, context?: LogContext): void {
    console.debug(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

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
  }

  child(componentName: string): Logger {
    return new Logger(`${this.serviceName}:${componentName}`);
  }
}

export const logger = new Logger('HUMMBL-Workers');

export function createLogger(componentName: string): Logger {
  return logger.child(componentName);
}
