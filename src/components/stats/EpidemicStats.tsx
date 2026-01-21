// ============================================
// EPIDEMIC STATS COMPONENT
// Statistics for epidemic mode
// ============================================

'use client';

import React from 'react';
import { Users, AlertCircle, HeartPulse, Skull, Shield } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { StatCard } from './StatCard';
import { EPIDEMIC_COLORS } from '@/types';

export function EpidemicStats() {
  const stats = useSimulationStore(state => state.stats.epidemic);
  const colorBlindMode = useSimulationStore(state => state.colorBlindMode);
  
  return (
    <div className="p-4 border-b border-panel-border">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">
        Epidemic Statistics
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Susceptible"
          value={stats.susceptible}
          color={EPIDEMIC_COLORS.SUSCEPTIBLE}
          icon={Users}
        />
        <StatCard
          label="Infected"
          value={stats.infected}
          color={EPIDEMIC_COLORS.INFECTED}
          icon={AlertCircle}
        />
        <StatCard
          label="Recovered"
          value={stats.recovered}
          color={EPIDEMIC_COLORS.RECOVERED}
          icon={HeartPulse}
        />
        <StatCard
          label="Deceased"
          value={stats.deceased}
          color={EPIDEMIC_COLORS.DECEASED}
          icon={Skull}
        />
      </div>
      
      {/* Additional metrics */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-canvas rounded-lg p-3 border border-panel-border">
          <div className="text-xs text-gray-500 mb-1">R₀ (Reproduction)</div>
          <div className="text-lg font-semibold text-white">
            {stats.r0.toFixed(2)}
          </div>
        </div>
        <div className="bg-canvas rounded-lg p-3 border border-panel-border">
          <div className="text-xs text-gray-500 mb-1">Peak Infected</div>
          <div className="text-lg font-semibold text-amber-400">
            {stats.peakInfected}
          </div>
        </div>
      </div>
      
      {stats.vaccinated > 0 && (
        <div className="mt-2">
          <StatCard
            label="Vaccinated"
            value={stats.vaccinated}
            color={EPIDEMIC_COLORS.VACCINATED}
            icon={Shield}
          />
        </div>
      )}
    </div>
  );
}
