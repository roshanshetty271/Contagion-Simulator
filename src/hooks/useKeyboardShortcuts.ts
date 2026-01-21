// ============================================
// KEYBOARD SHORTCUTS HOOK
// Global keyboard controls for simulation
// ============================================

import { useEffect, useCallback } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';

export function useKeyboardShortcuts() {
  const play = useSimulationStore(state => state.play);
  const pause = useSimulationStore(state => state.pause);
  const reset = useSimulationStore(state => state.reset);
  const step = useSimulationStore(state => state.step);
  const setMode = useSimulationStore(state => state.setMode);
  const playbackState = useSimulationStore(state => state.playbackState);
  const setColorBlindMode = useSimulationStore(state => state.setColorBlindMode);
  const colorBlindMode = useSimulationStore(state => state.colorBlindMode);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if typing in an input
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }
    
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        if (playbackState === 'playing') {
          pause();
        } else {
          play();
        }
        break;
        
      case 'KeyR':
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          reset();
        }
        break;
        
      case 'ArrowRight':
        event.preventDefault();
        step();
        break;
        
      case 'Digit1':
        event.preventDefault();
        setMode('epidemic');
        break;
        
      case 'Digit2':
        event.preventDefault();
        setMode('financial');
        break;
        
      case 'KeyC':
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          setColorBlindMode(!colorBlindMode);
        }
        break;
    }
  }, [playbackState, play, pause, reset, step, setMode, setColorBlindMode, colorBlindMode]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
