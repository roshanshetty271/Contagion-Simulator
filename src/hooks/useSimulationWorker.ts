// ============================================
// SIMULATION WORKER HOOK
// Manages WebWorker lifecycle and communication
// ============================================

import { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore, setWorkerRef } from '@/stores/simulationStore';
import type { WorkerTickMessage } from '@/types';

export function useSimulationWorker() {
  const workerRef = useRef<Worker | null>(null);
  const updateFromWorker = useSimulationStore(state => state.updateFromWorker);
  
  // Initialize worker
  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('../workers/simulationWorker.ts', import.meta.url)
    );
    
    // Set global reference for store actions
    setWorkerRef(workerRef.current);
    
    // Handle messages from worker
    workerRef.current.onmessage = (event: MessageEvent<WorkerTickMessage>) => {
      if (event.data.type === 'tick') {
        updateFromWorker(event.data);
      }
    };
    
    // Handle errors
    workerRef.current.onerror = (error) => {
      console.error('Simulation worker error:', error);
    };
    
    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        setWorkerRef(null);
      }
    };
  }, [updateFromWorker]);
  
  // Send message to worker
  const postMessage = useCallback((message: unknown) => {
    if (workerRef.current) {
      workerRef.current.postMessage(message);
    }
  }, []);
  
  return { postMessage };
}
