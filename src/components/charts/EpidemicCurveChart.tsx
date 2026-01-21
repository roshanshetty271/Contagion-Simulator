'use client';

// ============================================
// EPIDEMIC CURVE CHART
// Specialized chart for epidemic visualization
// ============================================

import React, { useMemo } from 'react';
import { TimeSeriesChart, LineConfig } from './TimeSeriesChart';
import { transformEpidemicData, findPeak, exportChartDataAsCSV } from '@/lib/chartUtils';
import { SimulationStats } from '@/types';
import { Button } from '../ui/Button';
import { Download } from 'lucide-react';
import { useColorBlindMode } from '@/stores/simulationStore';

interface EpidemicCurveChartProps {
  history: SimulationStats[];
  showBrush?: boolean;
}

export function EpidemicCurveChart({ history, showBrush = false }: EpidemicCurveChartProps) {
  const colorBlindMode = useColorBlindMode();
  
  const data = useMemo(() => transformEpidemicData(history), [history]);
  
  const lines: LineConfig[] = useMemo(() => {
    if (colorBlindMode) {
      return [
        { dataKey: 'susceptible', name: 'Susceptible', color: '#0ea5e9', strokeWidth: 2 },
        { dataKey: 'infected', name: 'Infected', color: '#f59e0b', strokeWidth: 3 },
        { dataKey: 'recovered', name: 'Recovered', color: '#8b5cf6', strokeWidth: 2 },
        { dataKey: 'deceased', name: 'Deceased', color: '#ef4444', strokeWidth: 2 },
        { dataKey: 'vaccinated', name: 'Vaccinated', color: '#06b6d4', strokeWidth: 2, strokeDasharray: '5 5' },
      ];
    }
    
    return [
      { dataKey: 'susceptible', name: 'Susceptible', color: '#3b82f6', strokeWidth: 2 },
      { dataKey: 'infected', name: 'Infected', color: '#ef4444', strokeWidth: 3 },
      { dataKey: 'recovered', name: 'Recovered', color: '#10b981', strokeWidth: 2 },
      { dataKey: 'deceased', name: 'Deceased', color: '#64748b', strokeWidth: 2 },
      { dataKey: 'vaccinated', name: 'Vaccinated', color: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' },
    ];
  }, [colorBlindMode]);
  
  const peak = useMemo(() => {
    const peakPoint = findPeak(data, 'infected');
    if (!peakPoint) return null;
    
    return {
      tick: peakPoint.tick,
      value: peakPoint.infected,
      label: `Peak: ${peakPoint.infected}`,
    };
  }, [data]);
  
  const handleExport = () => {
    exportChartDataAsCSV(data, `epidemic-curve-${Date.now()}`);
  };
  
  if (data.length === 0) {
    return (
      <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Epidemic Curve</h3>
        <p className="text-slate-400 text-center py-8">
          Start the simulation to see the epidemic curve
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200">Epidemic Curve</h3>
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>
      
      <TimeSeriesChart
        data={data}
        lines={lines}
        xAxisLabel="Time Steps"
        yAxisLabel="Population"
        height={350}
        showBrush={showBrush}
        showGrid={true}
        showLegend={true}
        peak={peak}
      />
      
      {peak && (
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>Peak Infected: <span className="font-semibold text-slate-200">{peak.value}</span></span>
          <span>at Time Step: <span className="font-semibold text-slate-200">{peak.tick}</span></span>
        </div>
      )}
    </div>
  );
}
