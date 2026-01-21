// ============================================
// EPIDEMIC CONTROLS COMPONENT
// SIR+ model parameters
// ============================================

'use client';

import React from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/ui';
import { formatPercent } from '@/lib/utils';

export function EpidemicControls() {
  const epidemicParams = useSimulationStore(state => state.epidemicParams);
  const setEpidemicParams = useSimulationStore(state => state.setEpidemicParams);
  
  return (
    <div className="p-4 border-b border-panel-border">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">
        Epidemic Parameters
      </div>
      
      <div className="space-y-4">
        {/* Infection Rate (β) */}
        <Slider
          label="Infection Rate (β)"
          value={epidemicParams.beta}
          min={0.05}
          max={0.8}
          step={0.01}
          onChange={(beta) => setEpidemicParams({ beta })}
          formatValue={(v) => v.toFixed(2)}
        />
        
        {/* Recovery Rate (γ) */}
        <Slider
          label="Recovery Rate (γ)"
          value={epidemicParams.gamma}
          min={0.01}
          max={0.5}
          step={0.01}
          onChange={(gamma) => setEpidemicParams({ gamma })}
          formatValue={(v) => v.toFixed(2)}
        />
        
        {/* Mortality Rate (μ) */}
        <Slider
          label="Mortality Rate (μ)"
          value={epidemicParams.mu}
          min={0}
          max={0.2}
          step={0.01}
          onChange={(mu) => setEpidemicParams({ mu })}
          formatValue={(v) => formatPercent(v, 0)}
        />
        
        {/* Vaccination Rate */}
        <Slider
          label="Vaccination Rate"
          value={epidemicParams.vaccinationRate}
          min={0}
          max={0.9}
          step={0.05}
          onChange={(vaccinationRate) => setEpidemicParams({ vaccinationRate })}
          formatValue={(v) => formatPercent(v, 0)}
        />
      </div>
      
      {/* Parameter explanation */}
      <div className="mt-3 space-y-1 text-xs text-gray-500">
        <p><strong>β</strong>: Probability of infection per contact</p>
        <p><strong>γ</strong>: Probability of recovery per tick</p>
        <p><strong>μ</strong>: Probability of death while infected</p>
      </div>
    </div>
  );
}
