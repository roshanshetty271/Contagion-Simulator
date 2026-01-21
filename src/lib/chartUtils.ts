// ============================================
// CHART UTILITIES
// Data transformation for chart visualization
// ============================================

import { SimulationStats } from '@/types';

export interface ChartDataPoint {
  tick: number;
  [key: string]: number;
}

/**
 * Transform history data for epidemic curve
 */
export function transformEpidemicData(history: SimulationStats[]): ChartDataPoint[] {
  return history.map(stats => ({
    tick: stats.tick,
    susceptible: stats.epidemic.susceptible,
    infected: stats.epidemic.infected,
    recovered: stats.epidemic.recovered,
    deceased: stats.epidemic.deceased,
    vaccinated: stats.epidemic.vaccinated,
  }));
}

/**
 * Transform history data for financial metrics
 */
export function transformFinancialData(history: SimulationStats[]): ChartDataPoint[] {
  return history.map(stats => ({
    tick: stats.tick,
    healthy: stats.financial.healthy,
    stressed: stats.financial.stressed,
    distressed: stats.financial.distressed,
    defaulted: stats.financial.defaulted,
    bailedOut: stats.financial.bailedOut,
  }));
}

/**
 * Transform history data for R₀ trajectory
 */
export function transformR0Data(history: SimulationStats[]): ChartDataPoint[] {
  return history.map(stats => ({
    tick: stats.tick,
    r0: stats.epidemic.r0,
  }));
}

/**
 * Transform history data for systemic risk
 */
export function transformSystemicRiskData(history: SimulationStats[]): ChartDataPoint[] {
  return history.map(stats => ({
    tick: stats.tick,
    systemicRisk: stats.financial.systemicRisk * 100, // Convert to percentage
  }));
}

/**
 * Find peak in data
 */
export function findPeak(data: ChartDataPoint[], key: string): ChartDataPoint | null {
  if (data.length === 0) return null;
  
  return data.reduce((peak, point) => {
    return point[key] > peak[key] ? point : peak;
  }, data[0]);
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(
  data: ChartDataPoint[],
  key: string,
  windowSize: number = 5
): ChartDataPoint[] {
  const result: ChartDataPoint[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
    const window = data.slice(start, end);
    
    const avg = window.reduce((sum, point) => sum + (point[key] || 0), 0) / window.length;
    
    result.push({
      ...data[i],
      [`${key}_ma`]: avg,
    });
  }
  
  return result;
}

/**
 * Export chart data as CSV
 */
export function exportChartDataAsCSV(data: ChartDataPoint[], filename: string): void {
  if (data.length === 0) return;
  
  // Get headers
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => row[header]).join(',')),
  ].join('\n');
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format tick number for display
 */
export function formatTick(tick: number): string {
  return tick.toString();
}

/**
 * Format value with appropriate precision
 */
export function formatValue(value: number, decimals: number = 0): string {
  return value.toFixed(decimals);
}
