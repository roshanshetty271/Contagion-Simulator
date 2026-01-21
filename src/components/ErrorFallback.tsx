'use client';

// ============================================
// ERROR FALLBACK UI
// User-friendly error display
// ============================================

import React from 'react';
import { AlertTriangle, RefreshCw, Download, Home } from 'lucide-react';
import { Button } from './ui/Button';
import { logger } from '@/lib/logger';

interface ErrorFallbackProps {
  error: Error;
  errorId?: string;
  resetError?: () => void;
  showDetails?: boolean;
}

export function ErrorFallback({
  error,
  errorId,
  resetError,
  showDetails = false,
}: ErrorFallbackProps) {
  const [showStack, setShowStack] = React.useState(false);

  const handleDownloadLogs = () => {
    logger.downloadLogs();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              We encountered an unexpected error. Don't worry, your simulation data is safe.
            </p>

            {errorId && (
              <div className="mb-4 p-3 bg-slate-100 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-600">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Error ID: <code className="font-mono text-slate-800 dark:text-slate-200">{errorId}</code>
                </p>
              </div>
            )}

            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
              <p className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                Error Message:
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                {error.message || 'Unknown error'}
              </p>
            </div>

            {showDetails && error.stack && (
              <div className="mb-6">
                <button
                  onClick={() => setShowStack(!showStack)}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline mb-2"
                >
                  {showStack ? 'Hide' : 'Show'} technical details
                </button>
                
                {showStack && (
                  <pre className="p-4 bg-slate-900 dark:bg-black text-slate-100 text-xs rounded overflow-x-auto max-h-64 overflow-y-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {resetError && (
                <Button onClick={resetError} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              )}
              
              <Button onClick={handleReload} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              
              <Button onClick={handleGoHome} variant="outline" className="gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
              
              {showDetails && (
                <Button onClick={handleDownloadLogs} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download Logs
                </Button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                If this problem persists, please report it on our{' '}
                <a
                  href="https://github.com/roshanshetty271/Contagion-Simulator/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  GitHub Issues
                </a>
                {' '}page with the error ID above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
