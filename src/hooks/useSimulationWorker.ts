// ============================================
// SIMULATION WORKER HOOK
// Manages WebWorker lifecycle and communication
// ============================================

import { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore, setWorkerRef } from '@/stores/simulationStore';
import { logger } from '@/lib/logger';
import { errorReporter } from '@/lib/errorReporting';
import type { WorkerTickMessage } from '@/types';

export function useSimulationWorker() {
  const workerRef = useRef<Worker | null>(null);
  const updateFromWorker = useSimulationStore(state => state.updateFromWorker);
  const retryCount = useRef(0);
  const maxRetries = 3;
  
  const createWorker = useCallback(() => {
    try {
      // Create worker
      const worker = new Worker(
        new URL('../workers/simulationWorker.ts', import.meta.url)
      );
      
      // Set global reference for store actions
      setWorkerRef(worker);
      
      // Handle messages from worker
      worker.onmessage = (event: MessageEvent<WorkerTickMessage>) => {
        try {
          if (event.data.type === 'tick') {
            updateFromWorker(event.data);
          }
        } catch (error) {
          logger.error('Error processing worker message', error);
          errorReporter.reportError(error, {
            component: 'useSimulationWorker',
            action: 'onmessage',
          });
        }
      };
      
      // Handle errors with retry logic
      worker.onerror = (error) => {
        logger.error('Simulation worker error', error);
        errorReporter.reportError(error, {
          component: 'useSimulationWorker',
          retryCount: retryCount.current,
        });
        
        // Attempt to recover
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          logger.info(`Attempting to restart worker (attempt ${retryCount.current}/${maxRetries})`);
          
          // Cleanup old worker
          worker.terminate();
          
          // Create new worker after delay
          setTimeout(() => {
            workerRef.current = createWorker();
          }, 1000 * retryCount.current);
        } else {
          logger.error('Max worker retry attempts reached');
        }
      };
      
      logger.info('Simulation worker created successfully');
      retryCount.current = 0; // Reset retry count on success
      
      return worker;
    } catch (error) {
      logger.error('Failed to create simulation worker', error);
      errorReporter.reportError(error, {
        component: 'useSimulationWorker',
        action: 'createWorker',
      });
      throw error;
    }
  }, [updateFromWorker]);
  
  // Initialize worker
  useEffect(() => {
    workerRef.current = createWorker();
    
    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        try {
          workerRef.current.terminate();
          workerRef.current = null;
          setWorkerRef(null);
          logger.info('Simulation worker terminated');
        } catch (error) {
          logger.error('Error terminating worker', error);
        }
      }
    };
  }, [createWorker]);
  
  // Send message to worker with error handling
  const postMessage = useCallback((message: unknown) => {
    try {
      if (workerRef.current) {
        workerRef.current.postMessage(message);
      } else {
        logger.warn('Attempted to post message to null worker');
      }
    } catch (error) {
      logger.error('Error posting message to worker', error);
      errorReporter.reportError(error, {
        component: 'useSimulationWorker',
        action: 'postMessage',
        message,
      });
    }
  }, []);
  
  return { postMessage };
}
