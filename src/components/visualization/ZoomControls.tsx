// ============================================
// ZOOM CONTROLS COMPONENT
// Zoom in/out and reset controls
// ============================================

'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';

export function ZoomControls() {
  const transform = useSimulationStore(state => state.transform);
  const setTransform = useSimulationStore(state => state.setTransform);
  
  const handleZoomIn = () => {
    const newK = Math.min(transform.k * 1.3, 4);
    setTransform({ ...transform, k: newK });
  };
  
  const handleZoomOut = () => {
    const newK = Math.max(transform.k / 1.3, 0.2);
    setTransform({ ...transform, k: newK });
  };
  
  const handleReset = () => {
    setTransform({ x: 0, y: 0, k: 1 });
  };
  
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-panel/90 backdrop-blur-sm rounded-lg border border-panel-border p-1">
      <button
        onClick={handleZoomIn}
        className="p-2 rounded hover:bg-panel-border text-gray-400 hover:text-white transition-colors"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        onClick={handleZoomOut}
        className="p-2 rounded hover:bg-panel-border text-gray-400 hover:text-white transition-colors"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <div className="h-px bg-panel-border my-1" />
      <button
        onClick={handleReset}
        className="p-2 rounded hover:bg-panel-border text-gray-400 hover:text-white transition-colors"
        aria-label="Reset zoom"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
      <div className="px-2 py-1 text-xs text-gray-500 text-center">
        {Math.round(transform.k * 100)}%
      </div>
    </div>
  );
}
