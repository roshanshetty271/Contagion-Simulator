// ============================================
// FINANCIAL CONTROLS COMPONENT
// Systemic risk model parameters
// ============================================

'use client';

import React from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Slider } from '@/components/ui';
import { formatPercent } from '@/lib/utils';

export function FinancialControls() {
  const financialParams = useSimulationStore(state => state.financialParams);
  const setFinancialParams = useSimulationStore(state => state.setFinancialParams);
  
  return (
    <div className="p-4 border-b border-panel-border">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">
        Financial Parameters
      </div>
      
      <div className="space-y-4">
        {/* Leverage Ratio */}
        <Slider
          label="Leverage Ratio"
          value={financialParams.leverageRatio}
          min={5}
          max={25}
          step={1}
          onChange={(leverageRatio) => setFinancialParams({ leverageRatio })}
          formatValue={(v) => `${v}x`}
        />
        
        {/* Capital Buffer */}
        <Slider
          label="Capital Buffer"
          value={financialParams.capitalBuffer}
          min={0.03}
          max={0.15}
          step={0.01}
          onChange={(capitalBuffer) => setFinancialParams({ capitalBuffer })}
          formatValue={(v) => formatPercent(v, 0)}
        />
        
        {/* Correlation Factor */}
        <Slider
          label="Asset Correlation"
          value={financialParams.correlationFactor}
          min={0}
          max={1}
          step={0.05}
          onChange={(correlationFactor) => setFinancialParams({ correlationFactor })}
          formatValue={(v) => v.toFixed(2)}
        />
        
        {/* Fire Sale Discount */}
        <Slider
          label="Fire Sale Discount"
          value={financialParams.fireSaleDiscount}
          min={0}
          max={0.5}
          step={0.05}
          onChange={(fireSaleDiscount) => setFinancialParams({ fireSaleDiscount })}
          formatValue={(v) => formatPercent(v, 0)}
        />
        
        {/* Bailout Threshold */}
        <Slider
          label="Bailout Threshold"
          value={financialParams.bailoutThreshold}
          min={0}
          max={1}
          step={0.1}
          onChange={(bailoutThreshold) => setFinancialParams({ bailoutThreshold })}
          formatValue={(v) => v === 1 ? 'Off' : formatPercent(v, 0)}
        />
      </div>
      
      {/* Parameter explanation */}
      <div className="mt-3 space-y-1 text-xs text-gray-500">
        <p><strong>Leverage</strong>: Debt/Equity ratio (higher = riskier)</p>
        <p><strong>Correlation</strong>: How linked asset prices are</p>
        <p><strong>Fire Sale</strong>: Price drop when distressed sell</p>
        <p><strong>Bailout</strong>: Min size for government rescue</p>
      </div>
    </div>
  );
}
