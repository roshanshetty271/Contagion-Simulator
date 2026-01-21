// ============================================
// LOGGER UTILITY
// Development and production logging
// ============================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  stack?: string;
}

class Logger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, stack?: string) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      stack,
    };

    // Store log entry
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      const prefix = `[${level.toUpperCase()}] ${entry.timestamp.toISOString()}`;
      const contextStr = context ? `\n${JSON.stringify(context, null, 2)}` : '';
      const stackStr = stack ? `\n${stack}` : '';

      switch (level) {
        case 'debug':
          console.debug(prefix, message, contextStr);
          break;
        case 'info':
          console.info(prefix, message, contextStr);
          break;
        case 'warn':
          console.warn(prefix, message, contextStr);
          break;
        case 'error':
          console.error(prefix, message, contextStr, stackStr);
          break;
      }
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const stack = error instanceof Error ? error.stack : undefined;
    const errorContext = {
      ...context,
      ...(error instanceof Error && {
        name: error.name,
        message: error.message,
      }),
    };
    this.log('error', message, errorContext, stack);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  downloadLogs() {
    const logsJson = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contagion-simulator-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
export const logger = new Logger();
