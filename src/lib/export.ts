// ============================================
// DATA EXPORT UTILITIES
// Export simulation data in various formats
// ============================================

import { SimulationNode, SimulationLink, SimulationStats, SimulationMode, NetworkTopology, EpidemicParams, FinancialParams } from '@/types';

export interface ExportData {
  version: string;
  timestamp: string;
  mode: SimulationMode;
  topology: NetworkTopology;
  nodes: SimulationNode[];
  links: SimulationLink[];
  history: SimulationStats[];
  epidemicParams: EpidemicParams;
  financialParams: FinancialParams;
}

/**
 * Export simulation results as CSV
 */
export function exportAsCSV(history: SimulationStats[], mode: SimulationMode, filename?: string): void {
  if (history.length === 0) {
    throw new Error('No data to export');
  }

  let headers: string[];
  let rows: string[][];

  if (mode === 'epidemic') {
    headers = ['tick', 'susceptible', 'infected', 'recovered', 'deceased', 'vaccinated', 'r0', 'elapsedMs'];
    rows = history.map(stats => [
      stats.tick.toString(),
      stats.epidemic.susceptible.toString(),
      stats.epidemic.infected.toString(),
      stats.epidemic.recovered.toString(),
      stats.epidemic.deceased.toString(),
      stats.epidemic.vaccinated.toString(),
      stats.epidemic.r0.toFixed(3),
      stats.elapsedMs.toString(),
    ]);
  } else {
    headers = ['tick', 'healthy', 'stressed', 'distressed', 'defaulted', 'bailedOut', 'systemicRisk', 'totalLosses', 'cascadeDepth', 'elapsedMs'];
    rows = history.map(stats => [
      stats.tick.toString(),
      stats.financial.healthy.toString(),
      stats.financial.stressed.toString(),
      stats.financial.distressed.toString(),
      stats.financial.defaulted.toString(),
      stats.financial.bailedOut.toString(),
      stats.financial.systemicRisk.toFixed(3),
      stats.financial.totalLosses.toFixed(2),
      stats.financial.cascadeDepth.toString(),
      stats.elapsedMs.toString(),
    ]);
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  downloadFile(
    csvContent,
    filename || `simulation-${mode}-${Date.now()}.csv`,
    'text/csv'
  );
}

/**
 * Export complete simulation state as JSON
 */
export function exportAsJSON(data: ExportData, filename?: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  
  downloadFile(
    jsonContent,
    filename || `simulation-${data.mode}-${Date.now()}.json`,
    'application/json'
  );
}

/**
 * Export network as GraphML (XML format for graph data)
 */
export function exportAsGraphML(
  nodes: SimulationNode[],
  links: SimulationLink[],
  filename?: string
): void {
  const graphml = generateGraphML(nodes, links);
  
  downloadFile(
    graphml,
    filename || `network-${Date.now()}.graphml`,
    'application/xml'
  );
}

/**
 * Generate GraphML XML content
 */
function generateGraphML(nodes: SimulationNode[], links: SimulationLink[]): string {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <key id="d0" for="node" attr.name="degree" attr.type="int"/>
  <key id="d1" for="node" attr.name="epidemicState" attr.type="string"/>
  <key id="d2" for="node" attr.name="financialState" attr.type="string"/>
  <key id="d3" for="edge" attr.name="weight" attr.type="double"/>
  <key id="d4" for="edge" attr.name="exposure" attr.type="double"/>
  <graph id="G" edgedefault="undirected">`;

  const nodeElements = nodes.map(node => `
    <node id="${node.id}">
      <data key="d0">${node.degree}</data>
      <data key="d1">${node.epidemicState}</data>
      <data key="d2">${node.financialState}</data>
    </node>`).join('');

  const edgeElements = links.map((link, idx) => `
    <edge id="e${idx}" source="${link.sourceId}" target="${link.targetId}">
      <data key="d3">${link.weight}</data>
      <data key="d4">${link.exposure}</data>
    </edge>`).join('');

  const footer = `
  </graph>
</graphml>`;

  return header + nodeElements + edgeElements + footer;
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Create export data object
 */
export function createExportData(
  mode: SimulationMode,
  topology: NetworkTopology,
  nodes: SimulationNode[],
  links: SimulationLink[],
  history: SimulationStats[],
  epidemicParams: EpidemicParams,
  financialParams: FinancialParams
): ExportData {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mode,
    topology,
    nodes,
    links,
    history,
    epidemicParams,
    financialParams,
  };
}

/**
 * Generate PDF report (placeholder for future implementation)
 */
export async function generateReport(data: ExportData): Promise<void> {
  // This would integrate with a PDF library like jsPDF
  console.info('PDF report generation coming soon', data);
  throw new Error('PDF report generation not yet implemented');
}
