/**
 * Centralized logging service with environment-aware configuration
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error | unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'
  private logLevel: LogLevel = this.isDevelopment ? 'debug' : 'info'

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }

    return levels[level] >= levels[this.logLevel]
  }

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry
    
    if (this.isDevelopment) {
      // Development: colorful, readable format
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      }
      const reset = '\x1b[0m'
      const color = colors[level]
      
      let log = `${color}[${level.toUpperCase()}]${reset} ${timestamp} - ${message}`
      
      if (context && Object.keys(context).length > 0) {
        log += `\n  Context: ${JSON.stringify(context, null, 2)}`
      }
      
      if (error) {
        if (error instanceof Error) {
          log += `\n  Error: ${error.message}`
          if (error.stack && level === 'error') {
            log += `\n  Stack: ${error.stack}`
          }
        } else {
          log += `\n  Error: ${JSON.stringify(error, null, 2)}`
        }
      }
      
      return log
    } else {
      // Production: JSON format for log aggregation services
      const logObject: Record<string, unknown> = {
        level,
        message,
        timestamp,
      }
      
      if (context) {
        logObject.context = context
      }
      
      if (error) {
        logObject.error = error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error
      }
      
      return JSON.stringify(logObject)
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error | unknown): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    }

    const formattedLog = this.formatLog(entry)

    switch (level) {
      case 'debug':
      case 'info':
        console.log(formattedLog)
        break
      case 'warn':
        console.warn(formattedLog)
        break
      case 'error':
        console.error(formattedLog)
        break
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    this.log('error', message, context, error)
  }

  // Special method for API request logging
  logRequest(method: string, path: string, statusCode: number, duration: number, context?: Record<string, unknown>): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
    
    this.log(level, `${method} ${path} - ${statusCode} (${duration}ms)`, {
      method,
      path,
      statusCode,
      duration,
      ...context,
    })
  }

  // Special method for service operations
  logService(service: string, operation: string, success: boolean, duration?: number, details?: Record<string, unknown>): void {
    const level: LogLevel = success ? 'info' : 'error'
    const status = success ? 'SUCCESS' : 'FAILED'
    
    this.log(level, `[${service}] ${operation} - ${status}`, {
      service,
      operation,
      success,
      ...(duration && { duration }),
      ...details,
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for testing purposes
export { Logger }