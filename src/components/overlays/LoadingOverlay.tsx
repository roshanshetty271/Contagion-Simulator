// ============================================
// LOADING OVERLAY
// Shown while network is generating
// ============================================

'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';

export function LoadingOverlay() {
  const isLoading = useSimulationStore(state => state.isLoading);
  
  if (!isLoading) return null;
  
  return (
    <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
        <p className="text-sm text-gray-400">Generating network...</p>
      </div>
    </div>
  );
}
