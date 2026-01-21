// ============================================
// LEGEND COMPONENT
// Shows node state colors and meanings
// ============================================

'use client';

import React from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { 
  EPIDEMIC_COLORS, 
  FINANCIAL_COLORS,
  EPIDEMIC_COLORS_CB,
  FINANCIAL_COLORS_CB,
} from '@/types';

const EPIDEMIC_LEGEND = [
  { state: 'SUSCEPTIBLE', label: 'Susceptible' },
  { state: 'INFECTED', label: 'Infected' },
  { state: 'RECOVERED', label: 'Recovered' },
  { state: 'DECEASED', label: 'Deceased' },
  { state: 'VACCINATED', label: 'Vaccinated' },
] as const;

const FINANCIAL_LEGEND = [
  { state: 'HEALTHY', label: 'Healthy' },
  { state: 'STRESSED', label: 'Stressed' },
  { state: 'DISTRESSED', label: 'Distressed' },
  { state: 'DEFAULTED', label: 'Defaulted' },
  { state: 'BAILED_OUT', label: 'Bailed Out' },
] as const;

export function Legend() {
  const mode = useSimulationStore(state => state.mode);
  const colorBlindMode = useSimulationStore(state => state.colorBlindMode);
  
  const legendItems = mode === 'epidemic' ? EPIDEMIC_LEGEND : FINANCIAL_LEGEND;
  const colors = mode === 'epidemic' 
    ? (colorBlindMode ? EPIDEMIC_COLORS_CB : EPIDEMIC_COLORS)
    : (colorBlindMode ? FINANCIAL_COLORS_CB : FINANCIAL_COLORS);
  
  return (
    <div className="absolute bottom-4 left-4 bg-panel/90 backdrop-blur-sm rounded-lg p-3 border border-panel-border">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">
        {mode === 'epidemic' ? 'Epidemic States' : 'Financial States'}
      </div>
      <div className="space-y-1.5">
        {legendItems.map((item) => (
          <div key={item.state} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[item.state as keyof typeof colors] }}
            />
            <span className="text-xs text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
