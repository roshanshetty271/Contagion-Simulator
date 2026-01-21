// ============================================
// ERROR REPORTING
// Centralized error logging and reporting
// ============================================

import { logger } from './logger';

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  context?: Record<string, any>;
}

class ErrorReporter {
  private reports: ErrorReport[] = [];
  private maxReports: number = 50;

  reportError(error: Error | unknown, context?: Record<string, any>): ErrorReport {
    const report: ErrorReport = {
      id: crypto.randomUUID(),
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context,
    };

    // Store report
    this.reports.push(report);
    if (this.reports.length > this.maxReports) {
      this.reports.shift();
    }

    // Log error
    logger.error(report.message, error, {
      ...context,
      errorId: report.id,
    });

    // In production, you could send to error tracking service (Sentry, etc.)
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      this.sendToErrorService(report);
    }

    return report;
  }

  private sendToErrorService(report: ErrorReport) {
    // Placeholder for error tracking service integration
    // Example: Sentry, LogRocket, etc.
    console.info('Would send error report to service:', report.id);
  }

  getReports(): ErrorReport[] {
    return [...this.reports];
  }

  clearReports() {
    this.reports = [];
  }

  getReportById(id: string): ErrorReport | undefined {
    return this.reports.find(r => r.id === id);
  }
}

// Singleton instance
export const errorReporter = new ErrorReporter();

// Global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorReporter.reportError(event.error || new Error(event.message), {
      type: 'window.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorReporter.reportError(event.reason, {
      type: 'unhandledrejection',
      promise: 'Promise rejection',
    });
  });
}
