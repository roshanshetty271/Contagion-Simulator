// ============================================
// SIDEBAR COMPONENT
// Contains all control panels
// ============================================

'use client';

import React, { useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { PlaybackControls, NetworkControls, EpidemicControls, FinancialControls, PresetSelector, ExportControls } from '@/components/controls';
import { EpidemicStats, FinancialStats, NetworkMetrics } from '@/components/stats';
import { AccessibilitySettings } from '@/components/settings';
import { EpidemicCurveChart, FinancialMetricsChart } from '@/components/charts';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function Sidebar() {
  const mode = useSimulationStore(state => state.mode);
  const history = useSimulationStore(state => state.history);
  const nodes = useSimulationStore(state => state.nodes);
  const [showCharts, setShowCharts] = useState(true);
  
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
        
        {/* Time-Series Charts */}
        {history.length > 0 && (
          <div className="p-4 border-t border-panel-border">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h2 className="text-lg font-semibold text-white">Charts</h2>
              {showCharts ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            
            {showCharts && (
              <div className="space-y-4">
                {mode === 'epidemic' ? (
                  <EpidemicCurveChart history={history} />
                ) : (
                  <FinancialMetricsChart history={history} />
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Network */}
        <NetworkControls />
        
        {/* Network Metrics */}
        {nodes.length > 0 && <NetworkMetrics />}
        
        {/* Mode-specific parameters */}
        {mode === 'epidemic' ? <EpidemicControls /> : <FinancialControls />}
        
        {/* Export & Share */}
        <ExportControls />
        
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
