// ============================================
// SIMULATION COMPLETE MODAL
// Shown when simulation ends
// ============================================

'use client';

import React from 'react';
import { CheckCircle2, RotateCcw, Share2 } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Button } from '@/components/ui';
import { formatPercent } from '@/lib/utils';

export function SimulationCompleteModal() {
  const playbackState = useSimulationStore(state => state.playbackState);
  const mode = useSimulationStore(state => state.mode);
  const stats = useSimulationStore(state => state.stats);
  const reset = useSimulationStore(state => state.reset);
  
  if (playbackState !== 'complete') return null;
  
  const epidemicStats = stats.epidemic;
  const financialStats = stats.financial;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-panel border border-panel-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Simulation Complete
            </h2>
            <p className="text-sm text-gray-400">
              {mode === 'epidemic' ? 'Epidemic has run its course' : 'Market has stabilized'}
            </p>
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="bg-canvas rounded-lg p-4 mb-4 space-y-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Final Results
          </div>
          
          {mode === 'epidemic' ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Infected</span>
                <span className="text-white font-medium">{epidemicStats.totalInfected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peak Infected</span>
                <span className="text-amber-400 font-medium">{epidemicStats.peakInfected}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deceased</span>
                <span className="text-gray-300 font-medium">{epidemicStats.deceased}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recovered</span>
                <span className="text-green-400 font-medium">{epidemicStats.recovered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Final R₀</span>
                <span className="text-white font-medium">{epidemicStats.r0.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">Defaulted Institutions</span>
                <span className="text-red-400 font-medium">{financialStats.defaulted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bailed Out</span>
                <span className="text-purple-400 font-medium">{financialStats.bailedOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peak Systemic Risk</span>
                <span className="text-amber-400 font-medium">{formatPercent(financialStats.systemicRisk)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Losses</span>
                <span className="text-red-400 font-medium">${financialStats.totalLosses.toFixed(0)}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between pt-2 border-t border-panel-border">
            <span className="text-gray-400">Duration</span>
            <span className="text-white font-medium">{stats.tick} ticks</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            className="flex-1"
            onClick={reset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Run Again
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              // Could implement share functionality
              alert('Share feature coming soon!');
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
