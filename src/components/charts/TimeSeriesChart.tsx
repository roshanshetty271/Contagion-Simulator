'use client';

// ============================================
// TIME SERIES CHART
// Reusable chart component with Recharts
// ============================================

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from 'recharts';
import { ChartDataPoint } from '@/lib/chartUtils';

export interface LineConfig {
  dataKey: string;
  name: string;
  color: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

interface TimeSeriesChartProps {
  data: ChartDataPoint[];
  lines: LineConfig[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  height?: number;
  showBrush?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  peak?: { tick: number; value: number; label: string } | null;
}

export function TimeSeriesChart({
  data,
  lines,
  xAxisLabel = 'Time Step',
  yAxisLabel = 'Count',
  title,
  height = 300,
  showBrush = false,
  showGrid = true,
  showLegend = true,
  peak,
}: TimeSeriesChartProps) {
  if (data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-800/50 rounded-lg border border-slate-700"
        style={{ height }}
      >
        <p className="text-slate-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && (
        <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      )}
      
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            )}
            
            <XAxis
              dataKey="tick"
              label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            
            <YAxis
              label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '0.5rem',
                color: '#e2e8f0',
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            
            {showLegend && (
              <Legend
                wrapperStyle={{ color: '#94a3b8' }}
                iconType="line"
              />
            )}
            
            {peak && (
              <ReferenceLine
                x={peak.tick}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{
                  value: peak.label,
                  fill: '#ef4444',
                  fontSize: 12,
                  position: 'top',
                }}
              />
            )}
            
            {lines.map(line => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={line.strokeWidth || 2}
                strokeDasharray={line.strokeDasharray}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
            
            {showBrush && (
              <Brush
                dataKey="tick"
                height={30}
                stroke="#475569"
                fill="#1e293b"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
