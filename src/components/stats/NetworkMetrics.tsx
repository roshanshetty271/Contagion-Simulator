'use client';

// ============================================
// NETWORK METRICS PANEL
// Display network analysis and centrality
// ============================================

import React, { useMemo, useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { calculateNetworkMetrics, identifyVulnerableNodes } from '@/lib/networkMetrics';
import { Activity, GitBranch, Network, TrendingUp } from 'lucide-react';

export function NetworkMetrics() {
  const nodes = useSimulationStore(state => state.nodes);
  const links = useSimulationStore(state => state.links);
  const mode = useSimulationStore(state => state.mode);
  const [showDetails, setShowDetails] = useState(false);
  
  const metrics = useMemo(() => {
    if (nodes.length === 0) return null;
    return calculateNetworkMetrics(nodes, links);
  }, [nodes, links]);
  
  const vulnerableNodes = useMemo(() => {
    if (!metrics) return [];
    return identifyVulnerableNodes(nodes, metrics, mode);
  }, [nodes, metrics, mode]);
  
  if (!metrics) {
    return null;
  }
  
  const avgClustering = Array.from(metrics.clusteringCoefficient.values())
    .reduce((a, b) => a + b, 0) / nodes.length;
  
  return (
    <div className="p-4 border-t border-panel-border space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Network className="w-5 h-5" />
          Network Metrics
        </h2>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      {/* Basic Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-gray-400">Avg Degree</p>
          </div>
          <p className="text-lg font-semibold text-white">
            {metrics.averageDegree.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-green-400" />
            <p className="text-xs text-gray-400">Density</p>
          </div>
          <p className="text-lg font-semibold text-white">
            {(metrics.density * 100).toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            <p className="text-xs text-gray-400">Avg Path</p>
          </div>
          <p className="text-lg font-semibold text-white">
            {metrics.avgPathLength.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-slate-800/50 p-3 rounded border border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-4 h-4 text-purple-400" />
            <p className="text-xs text-gray-400">Clustering</p>
          </div>
          <p className="text-lg font-semibold text-white">
            {avgClustering.toFixed(3)}
          </p>
        </div>
      </div>
      
      {/* Detailed Metrics */}
      {showDetails && (
        <div className="space-y-3 pt-3 border-t border-panel-border/50">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-300">Network Properties</p>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Diameter:</span>
                <span className="text-white font-mono">{metrics.diameter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nodes:</span>
                <span className="text-white font-mono">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Links:</span>
                <span className="text-white font-mono">{links.length}</span>
              </div>
            </div>
          </div>
          
          {/* Vulnerable Nodes */}
          {vulnerableNodes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-300">
                Most Vulnerable Nodes
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {vulnerableNodes.slice(0, 5).map(node => (
                  <div 
                    key={node.id}
                    className="text-xs flex justify-between items-center bg-slate-800/30 p-2 rounded"
                  >
                    <span className="text-gray-400">Node {node.id}</span>
                    <span className="text-white font-mono">
                      Degree: {node.degree}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
