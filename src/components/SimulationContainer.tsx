// ============================================
// SIMULATION CONTAINER
// Main visualization area with overlays
// ============================================

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { NetworkVisualization, Legend, NodeTooltip, ZoomControls } from '@/components/visualization';
import { LoadingOverlay } from '@/components/overlays';

export function SimulationContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 relative bg-canvas overflow-hidden"
    >
      {/* Main visualization */}
      <NetworkVisualization 
        width={dimensions.width} 
        height={dimensions.height} 
      />
      
      {/* Overlays */}
      <Legend />
      <NodeTooltip />
      <ZoomControls />
      <LoadingOverlay />
    </div>
  );
}
