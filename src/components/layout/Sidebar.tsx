// ============================================
// SIDEBAR COMPONENT
// Contains all control panels
// ============================================

'use client';

import React from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { PlaybackControls, NetworkControls, EpidemicControls, FinancialControls, PresetSelector } from '@/components/controls';
import { EpidemicStats, FinancialStats } from '@/components/stats';
import { AccessibilitySettings } from '@/components/settings';

export function Sidebar() {
  const mode = useSimulationStore(state => state.mode);
  
  return (
    <aside className="w-80 border-r border-panel-border bg-panel flex flex-col h-full overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Presets at top for quick access */}
        <PresetSelector />
        
        {/* Playback */}
        <PlaybackControls />
        
        {/* Stats */}
        {mode === 'epidemic' ? <EpidemicStats /> : <FinancialStats />}
        
        {/* Network */}
        <NetworkControls />
        
        {/* Mode-specific parameters */}
        {mode === 'epidemic' ? <EpidemicControls /> : <FinancialControls />}
        
        {/* Accessibility */}
        <AccessibilitySettings />
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-panel-border text-xs text-gray-600">
        <p>Click a node to infect/shock it</p>
        <p className="mt-1">Drag nodes to reposition</p>
      </div>
    </aside>
  );
}
