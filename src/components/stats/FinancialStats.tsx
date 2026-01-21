// ============================================
// FINANCIAL STATS COMPONENT
// Statistics for financial mode
// ============================================

'use client';

import React from 'react';
import { Building2, AlertTriangle, TrendingDown, XCircle, Landmark } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { StatCard } from './StatCard';
import { FINANCIAL_COLORS } from '@/types';
import { formatPercent, formatNumber } from '@/lib/utils';

export function FinancialStats() {
  const stats = useSimulationStore(state => state.stats.financial);
  
  return (
    <div className="p-4 border-b border-panel-border">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">
        Financial Statistics
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Healthy"
          value={stats.healthy}
          color={FINANCIAL_COLORS.HEALTHY}
          icon={Building2}
        />
        <StatCard
          label="Stressed"
          value={stats.stressed}
          color={FINANCIAL_COLORS.STRESSED}
          icon={AlertTriangle}
        />
        <StatCard
          label="Distressed"
          value={stats.distressed}
          color={FINANCIAL_COLORS.DISTRESSED}
          icon={TrendingDown}
        />
        <StatCard
          label="Defaulted"
          value={stats.defaulted}
          color={FINANCIAL_COLORS.DEFAULTED}
          icon={XCircle}
        />
      </div>
      
      {/* Additional metrics */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-canvas rounded-lg p-3 border border-panel-border">
          <div className="text-xs text-gray-500 mb-1">Systemic Risk</div>
          <div className={`text-lg font-semibold ${
            stats.systemicRisk > 0.5 ? 'text-red-400' : 
            stats.systemicRisk > 0.2 ? 'text-amber-400' : 'text-green-400'
          }`}>
            {formatPercent(stats.systemicRisk, 0)}
          </div>
        </div>
        <div className="bg-canvas rounded-lg p-3 border border-panel-border">
          <div className="text-xs text-gray-500 mb-1">Total Losses</div>
          <div className="text-lg font-semibold text-red-400">
            ${formatNumber(stats.totalLosses)}
          </div>
        </div>
      </div>
      
      {stats.bailedOut > 0 && (
        <div className="mt-2">
          <StatCard
            label="Bailed Out"
            value={stats.bailedOut}
            color={FINANCIAL_COLORS.BAILED_OUT}
            icon={Landmark}
          />
        </div>
      )}
    </div>
  );
}
