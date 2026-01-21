'use client';

// ============================================
// FINANCIAL METRICS CHART
// Specialized chart for financial contagion
// ============================================

import React, { useMemo } from 'react';
import { TimeSeriesChart, LineConfig } from './TimeSeriesChart';
import { 
  transformFinancialData, 
  transformSystemicRiskData, 
  exportChartDataAsCSV 
} from '@/lib/chartUtils';
import { SimulationStats } from '@/types';
import { Button } from '../ui/Button';
import { Download } from 'lucide-react';
import { useColorBlindMode } from '@/stores/simulationStore';

interface FinancialMetricsChartProps {
  history: SimulationStats[];
  showBrush?: boolean;
}

export function FinancialMetricsChart({ history, showBrush = false }: FinancialMetricsChartProps) {
  const colorBlindMode = useColorBlindMode();
  
  const institutionData = useMemo(() => transformFinancialData(history), [history]);
  const riskData = useMemo(() => transformSystemicRiskData(history), [history]);
  
  const institutionLines: LineConfig[] = useMemo(() => {
    if (colorBlindMode) {
      return [
        { dataKey: 'healthy', name: 'Healthy', color: '#0ea5e9', strokeWidth: 2 },
        { dataKey: 'stressed', name: 'Stressed', color: '#f59e0b', strokeWidth: 2 },
        { dataKey: 'distressed', name: 'Distressed', color: '#ef4444', strokeWidth: 3 },
        { dataKey: 'defaulted', name: 'Defaulted', color: '#64748b', strokeWidth: 2 },
        { dataKey: 'bailedOut', name: 'Bailed Out', color: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' },
      ];
    }
    
    return [
      { dataKey: 'healthy', name: 'Healthy', color: '#10b981', strokeWidth: 2 },
      { dataKey: 'stressed', name: 'Stressed', color: '#f59e0b', strokeWidth: 2 },
      { dataKey: 'distressed', name: 'Distressed', color: '#ef4444', strokeWidth: 3 },
      { dataKey: 'defaulted', name: 'Defaulted', color: '#64748b', strokeWidth: 2 },
      { dataKey: 'bailedOut', name: 'Bailed Out', color: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' },
    ];
  }, [colorBlindMode]);
  
  const riskLines: LineConfig[] = [
    { dataKey: 'systemicRisk', name: 'Systemic Risk %', color: '#ef4444', strokeWidth: 3 },
  ];
  
  const handleExportInstitutions = () => {
    exportChartDataAsCSV(institutionData, `financial-institutions-${Date.now()}`);
  };
  
  const handleExportRisk = () => {
    exportChartDataAsCSV(riskData, `systemic-risk-${Date.now()}`);
  };
  
  if (institutionData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Financial Metrics</h3>
          <p className="text-slate-400 text-center py-8">
            Start the simulation to see financial metrics
          </p>
        </div>
      </div>
    );
  }
  
  const currentRisk = riskData[riskData.length - 1]?.systemicRisk || 0;
  const maxRisk = Math.max(...riskData.map(d => d.systemicRisk));
  
  return (
    <div className="space-y-6">
      {/* Institution States Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-200">Institution States</h3>
          <Button
            onClick={handleExportInstitutions}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
        
        <TimeSeriesChart
          data={institutionData}
          lines={institutionLines}
          xAxisLabel="Time Steps"
          yAxisLabel="Number of Institutions"
          height={300}
          showBrush={showBrush}
          showGrid={true}
          showLegend={true}
        />
      </div>
      
      {/* Systemic Risk Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-200">Systemic Risk</h3>
          <Button
            onClick={handleExportRisk}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
        
        <TimeSeriesChart
          data={riskData}
          lines={riskLines}
          xAxisLabel="Time Steps"
          yAxisLabel="Risk Level (%)"
          height={250}
          showBrush={false}
          showGrid={true}
          showLegend={false}
        />
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Risk:</span>
            <span className={`font-semibold ${
              currentRisk > 50 ? 'text-red-400' :
              currentRisk > 25 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {currentRisk.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Peak Risk:</span>
            <span className="font-semibold text-slate-200">
              {maxRisk.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
