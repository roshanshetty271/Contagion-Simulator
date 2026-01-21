// ============================================
// NODE TOOLTIP COMPONENT
// Shows details for selected/hovered node
// ============================================

'use client';

import React from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { formatPercent } from '@/lib/utils';
import { X } from 'lucide-react';

export function NodeTooltip() {
  const nodes = useSimulationStore(state => state.nodes);
  const mode = useSimulationStore(state => state.mode);
  const selectedNodeId = useSimulationStore(state => state.selectedNodeId);
  const hoveredNodeId = useSimulationStore(state => state.hoveredNodeId);
  const selectNode = useSimulationStore(state => state.selectNode);
  
  const nodeId = selectedNodeId || hoveredNodeId;
  const node = nodeId ? nodes.find(n => n.id === nodeId) : null;
  
  if (!node) return null;
  
  return (
    <div className="absolute top-4 right-4 bg-panel/90 backdrop-blur-sm rounded-lg p-4 border border-panel-border min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          Node {node.id}
        </span>
        {selectedNodeId && (
          <button
            onClick={() => selectNode(null)}
            className="p-1 rounded hover:bg-panel-border text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {/* State */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">State</span>
          <span className="text-sm font-medium text-white">
            {mode === 'epidemic' ? node.epidemicState : node.financialState}
          </span>
        </div>
        
        {/* Connections */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Connections</span>
          <span className="text-sm font-medium text-white">{node.degree}</span>
        </div>
        
        {/* Mode-specific info */}
        {mode === 'financial' && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Assets</span>
              <span className="text-sm font-medium text-white">
                ${node.assets.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Capital Ratio</span>
              <span className="text-sm font-medium text-white">
                {formatPercent(node.capitalRatio)}
              </span>
            </div>
          </>
        )}
        
        {mode === 'epidemic' && node.infectedAt !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Infected at</span>
            <span className="text-sm font-medium text-white">Tick {node.infectedAt}</span>
          </div>
        )}
      </div>
      
      {/* Action hint */}
      <div className="mt-3 pt-3 border-t border-panel-border">
        <p className="text-xs text-gray-500">
          {mode === 'epidemic' 
            ? node.epidemicState === 'SUSCEPTIBLE' 
              ? 'Click to infect' 
              : 'Cannot modify this node'
            : node.financialState === 'HEALTHY'
              ? 'Click to apply shock'
              : 'Cannot modify this node'
          }
        </p>
      </div>
    </div>
  );
}
