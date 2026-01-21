// ============================================
// ERROR HANDLER HOOK
// React hook for error handling
// ============================================

import { useCallback, useState } from 'react';
import { errorReporter } from '@/lib/errorReporting';
import { logger } from '@/lib/logger';

interface ErrorState {
  error: Error | null;
  errorId: string | null;
  hasError: boolean;
}

interface UseErrorHandlerReturn extends ErrorState {
  handleError: (error: Error | unknown, context?: Record<string, any>) => void;
  clearError: () => void;
  retry: (fn: () => void | Promise<void>) => Promise<void>;
}

export function useErrorHandler(componentName?: string): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    errorId: null,
    hasError: false,
  });

  const handleError = useCallback(
    (error: Error | unknown, context?: Record<string, any>) => {
      const err = error instanceof Error ? error : new Error(String(error));
      
      const report = errorReporter.reportError(err, {
        ...context,
        component: componentName,
      });

      setErrorState({
        error: err,
        errorId: report.id,
        hasError: true,
      });

      logger.error(`Error in ${componentName || 'component'}`, err, context);
    },
    [componentName]
  );

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      errorId: null,
      hasError: false,
    });
  }, []);

  const retry = useCallback(
    async (fn: () => void | Promise<void>) => {
      try {
        clearError();
        await fn();
        logger.info('Retry successful', { component: componentName });
      } catch (error) {
        handleError(error, { retryFailed: true });
      }
    },
    [clearError, handleError, componentName]
  );

  return {
    ...errorState,
    handleError,
    clearError,
    retry,
  };
}
