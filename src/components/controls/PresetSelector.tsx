// ============================================
// PRESET SELECTOR COMPONENT
// Quick-select demo presets
// ============================================

'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { getPresetsByMode } from '@/lib/presets';
import { cn } from '@/lib/utils';

export function PresetSelector() {
  const mode = useSimulationStore(state => state.mode);
  const applyPreset = useSimulationStore(state => state.applyPreset);
  const playbackState = useSimulationStore(state => state.playbackState);
  
  const presets = getPresetsByMode(mode);
  const isRunning = playbackState === 'playing';
  
  return (
    <div className="p-4 border-b border-panel-border">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          Demo Presets
        </span>
      </div>
      
      <div className="space-y-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            disabled={isRunning}
            className={cn(
              'w-full text-left p-3 rounded-lg transition-all',
              'bg-canvas hover:bg-panel-border',
              'border border-transparent hover:border-gray-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <div className="font-medium text-sm text-gray-200">
              {preset.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {preset.description}
            </div>
          </button>
        ))}
      </div>
      
      <p className="text-xs text-gray-600 mt-3">
        Presets configure network, parameters, and trigger an initial action for guaranteed impressive results.
      </p>
    </div>
  );
}
