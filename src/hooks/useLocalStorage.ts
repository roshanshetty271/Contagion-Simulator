// ============================================
// LOCAL STORAGE HOOK
// Persist state to browser localStorage
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error(`Error reading localStorage key "${key}"`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback((value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        logger.debug(`Saved to localStorage: ${key}`);
      }
    } catch (error) {
      logger.error(`Error saving to localStorage key "${key}"`, error);
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
        logger.debug(`Removed from localStorage: ${key}`);
      }
    } catch (error) {
      logger.error(`Error removing from localStorage key "${key}"`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Save simulation state to localStorage
 */
export function saveSimulationState(state: any): void {
  try {
    localStorage.setItem('simulation-state', JSON.stringify(state));
    logger.info('Simulation state saved');
  } catch (error) {
    logger.error('Failed to save simulation state', error);
  }
}

/**
 * Load simulation state from localStorage
 */
export function loadSimulationState(): any | null {
  try {
    const state = localStorage.getItem('simulation-state');
    if (state) {
      logger.info('Simulation state loaded');
      return JSON.parse(state);
    }
  } catch (error) {
    logger.error('Failed to load simulation state', error);
  }
  return null;
}

/**
 * Clear all simulation data from localStorage
 */
export function clearSimulationState(): void {
  try {
    localStorage.removeItem('simulation-state');
    logger.info('Simulation state cleared');
  } catch (error) {
    logger.error('Failed to clear simulation state', error);
  }
}
