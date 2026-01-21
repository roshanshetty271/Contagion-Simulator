// ============================================
// MAIN PAGE
// Entry point for the application
// ============================================

'use client';

import React, { useEffect } from 'react';
import { Header, Sidebar } from '@/components/layout';
import { SimulationContainer } from '@/components/SimulationContainer';
import { SimulationCompleteModal } from '@/components/overlays';
import { useSimulationWorker } from '@/hooks/useSimulationWorker';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSimulationStore } from '@/stores/simulationStore';

export default function HomePage() {
  // Initialize worker
  useSimulationWorker();
  
  // Setup keyboard shortcuts
  useKeyboardShortcuts();
  
  // Generate initial network on mount
  const regenerateNetwork = useSimulationStore(state => state.regenerateNetwork);
  
  useEffect(() => {
    // Small delay to ensure worker is ready
    const timer = setTimeout(() => {
      regenerateNetwork();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [regenerateNetwork]);
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar with controls */}
        <Sidebar />
        
        {/* Visualization area */}
        <SimulationContainer />
      </div>
      
      {/* Modal overlays */}
      <SimulationCompleteModal />
    </div>
  );
}
