// ============================================
// NETWORK CONTROLS COMPONENT
// Topology, node count, link density
// ============================================

'use client';

import React from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Select, Slider } from '@/components/ui';

const TOPOLOGY_OPTIONS = [
  { value: 'scale-free', label: 'Scale-Free (Barabási-Albert)' },
  { value: 'small-world', label: 'Small-World (Watts-Strogatz)' },
  { value: 'random', label: 'Random (Erdős-Rényi)' },
];

export function NetworkControls() {
  const topology = useSimulationStore(state => state.topology);
  const nodeCount = useSimulationStore(state => state.nodeCount);
  const linkDensity = useSimulationStore(state => state.linkDensity);
  const playbackState = useSimulationStore(state => state.playbackState);
  const setTopology = useSimulationStore(state => state.setTopology);
  const setNodeCount = useSimulationStore(state => state.setNodeCount);
  const setLinkDensity = useSimulationStore(state => state.setLinkDensity);
  
  const isRunning = playbackState === 'playing';
  
  return (
    <div className="p-4 border-b border-panel-border">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">
        Network
      </div>
      
      <div className="space-y-4">
        {/* Topology */}
        <Select
          label="Topology"
          value={topology}
          options={TOPOLOGY_OPTIONS}
          onChange={(value) => setTopology(value as typeof topology)}
          disabled={isRunning}
        />
        
        {/* Node Count */}
        <Slider
          label="Nodes"
          value={nodeCount}
          min={50}
          max={300}
          step={10}
          onChange={setNodeCount}
          formatValue={(v) => v.toString()}
          disabled={isRunning}
        />
        
        {/* Link Density */}
        <Slider
          label="Link Density"
          value={linkDensity}
          min={0.1}
          max={1}
          step={0.1}
          onChange={setLinkDensity}
          formatValue={(v) => v.toFixed(1)}
          disabled={isRunning}
        />
      </div>
      
      {/* Topology description */}
      <div className="mt-3 text-xs text-gray-500">
        {topology === 'scale-free' && (
          <p>Hub nodes with many connections. Realistic for social/financial networks.</p>
        )}
        {topology === 'small-world' && (
          <p>High clustering + short paths. Realistic for disease spread.</p>
        )}
        {topology === 'random' && (
          <p>Uniform connection probability. Baseline comparison.</p>
        )}
      </div>
    </div>
  );
}
