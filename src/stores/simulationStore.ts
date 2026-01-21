// ============================================
// ZUSTAND STORE
// Central state management for simulation
// ============================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  SimulationStore,
  SimulationState,
  SimulationMode,
  NetworkTopology,
  SimulationNode,
  SimulationLink,
  EpidemicParams,
  FinancialParams,
  FinancialState,
  PlaybackState,
  DemoPreset,
  WorkerTickMessage,
  DEFAULT_EPIDEMIC_PARAMS,
  DEFAULT_FINANCIAL_PARAMS,
  INITIAL_EPIDEMIC_STATS,
  INITIAL_FINANCIAL_STATS,
} from '@/types';
import { generateNetwork, findHighestDegreeNode, findRandomNode } from '@/lib/networkGenerators';

// Default canvas dimensions
const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 600;

const initialState: SimulationState = {
  nodes: [],
  links: [],
  mode: 'epidemic',
  topology: 'scale-free',
  nodeCount: 150,
  linkDensity: 0.5,
  epidemicParams: { ...DEFAULT_EPIDEMIC_PARAMS },
  financialParams: { ...DEFAULT_FINANCIAL_PARAMS },
  tickRate: 20,
  tick: 0,
  playbackState: 'idle',
  isLoading: false,
  stats: {
    epidemic: { ...INITIAL_EPIDEMIC_STATS },
    financial: { ...INITIAL_FINANCIAL_STATS },
    tick: 0,
    elapsedMs: 0,
  },
  history: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  colorBlindMode: false,
  transform: { x: 0, y: 0, k: 1 },
};

// Worker reference (will be set by hook)
let workerRef: Worker | null = null;

export const setWorkerRef = (worker: Worker | null) => {
  workerRef = worker;
};

export const useSimulationStore = create<SimulationStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ============================================
    // MODE & TOPOLOGY
    // ============================================
    setMode: (mode: SimulationMode) => {
      set({ mode });
      // Reset and regenerate when mode changes
      get().reset();
    },

    setTopology: (topology: NetworkTopology) => {
      set({ topology });
      get().regenerateNetwork();
    },

    setNodeCount: (nodeCount: number) => {
      set({ nodeCount });
      get().regenerateNetwork();
    },

    setLinkDensity: (linkDensity: number) => {
      set({ linkDensity });
      get().regenerateNetwork();
    },

    // ============================================
    // PARAMETERS
    // ============================================
    setEpidemicParams: (params: Partial<EpidemicParams>) => {
      const newParams = { ...get().epidemicParams, ...params };
      set({ epidemicParams: newParams });
      
      // Send to worker
      workerRef?.postMessage({
        type: 'params',
        epidemicParams: newParams,
      });
    },

    setFinancialParams: (params: Partial<FinancialParams>) => {
      const newParams = { ...get().financialParams, ...params };
      set({ financialParams: newParams });
      
      // Send to worker
      workerRef?.postMessage({
        type: 'params',
        financialParams: newParams,
      });
    },

    setTickRate: (tickRate: number) => {
      set({ tickRate });
      workerRef?.postMessage({
        type: 'start',
        tickRate,
      });
    },

    // ============================================
    // NETWORK GENERATION
    // ============================================
    regenerateNetwork: () => {
      const { topology, nodeCount, linkDensity, mode, epidemicParams, financialParams } = get();
      
      set({ isLoading: true, playbackState: 'idle', tick: 0, history: [] });
      
      // Generate new network
      const { nodes, links } = generateNetwork({
        topology,
        nodeCount,
        linkDensity,
        canvasWidth: DEFAULT_WIDTH,
        canvasHeight: DEFAULT_HEIGHT,
      });
      
      // Apply vaccination if in epidemic mode
      if (mode === 'epidemic' && epidemicParams.vaccinationRate > 0) {
        const vaccinateCount = Math.floor(nodes.length * epidemicParams.vaccinationRate);
        const shuffled = [...nodes].sort(() => Math.random() - 0.5);
        for (let i = 0; i < vaccinateCount; i++) {
          shuffled[i].epidemicState = 'VACCINATED';
        }
      }
      
      // Calculate initial stats
      const stats = calculateStats(nodes, mode);
      
      set({
        nodes,
        links,
        isLoading: false,
        stats,
      });
      
      // Initialize worker
      workerRef?.postMessage({
        type: 'init',
        nodes,
        links,
        mode,
        epidemicParams,
        financialParams,
      });
    },

    // ============================================
    // NODE ACTIONS
    // ============================================
    infectNode: (nodeId: string) => {
      const { nodes, mode } = get();
      if (mode !== 'epidemic') return;
      
      const updatedNodes = nodes.map(node =>
        node.id === nodeId
          ? { ...node, epidemicState: 'INFECTED' as const, infectedAt: get().tick }
          : node
      );
      
      set({ nodes: updatedNodes });
      
      workerRef?.postMessage({
        type: 'infect',
        nodeId,
      });
    },

    shockNode: (nodeId: string, magnitude: number) => {
      const { nodes, mode } = get();
      if (mode !== 'financial') return;
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;
      
      const newCapitalRatio = node.capitalRatio * (1 - magnitude);
      const newState: FinancialState = newCapitalRatio < 0.04 ? 'DISTRESSED' : 
                                        newCapitalRatio < 0.06 ? 'STRESSED' : 'HEALTHY';
      
      const updatedNodes = nodes.map(n =>
        n.id === nodeId
          ? { ...n, capitalRatio: newCapitalRatio, financialState: newState, stressedAt: get().tick }
          : n
      );
      
      set({ nodes: updatedNodes });
      
      workerRef?.postMessage({
        type: 'shock',
        nodeId,
        magnitude,
      });
    },

    vaccinateNode: (nodeId: string) => {
      const { nodes, mode } = get();
      if (mode !== 'epidemic') return;
      
      const updatedNodes = nodes.map(node =>
        node.id === nodeId && node.epidemicState === 'SUSCEPTIBLE'
          ? { ...node, epidemicState: 'VACCINATED' as const }
          : node
      );
      
      set({ nodes: updatedNodes });
      
      workerRef?.postMessage({
        type: 'vaccinate',
        nodeId,
      });
    },

    bailoutNode: (nodeId: string) => {
      const { nodes, mode } = get();
      if (mode !== 'financial') return;
      
      const updatedNodes = nodes.map(node =>
        node.id === nodeId && (node.financialState === 'DISTRESSED' || node.financialState === 'STRESSED')
          ? { ...node, financialState: 'BAILED_OUT' as const, capitalRatio: 0.1 }
          : node
      );
      
      set({ nodes: updatedNodes });
      
      workerRef?.postMessage({
        type: 'bailout',
        nodeId,
      });
    },

    // ============================================
    // PLAYBACK CONTROLS
    // ============================================
    play: () => {
      const { playbackState, tickRate } = get();
      if (playbackState === 'complete') return;
      
      set({ playbackState: 'playing' });
      workerRef?.postMessage({ type: 'start', tickRate });
    },

    pause: () => {
      set({ playbackState: 'paused' });
      workerRef?.postMessage({ type: 'pause' });
    },

    reset: () => {
      set({ 
        playbackState: 'idle', 
        tick: 0, 
        history: [],
        selectedNodeId: null,
        hoveredNodeId: null,
      });
      workerRef?.postMessage({ type: 'reset' });
      get().regenerateNetwork();
    },

    step: () => {
      const { playbackState } = get();
      if (playbackState === 'complete') return;
      
      workerRef?.postMessage({ type: 'step' });
    },

    // ============================================
    // UI STATE
    // ============================================
    selectNode: (nodeId: string | null) => {
      set({ selectedNodeId: nodeId });
    },

    hoverNode: (nodeId: string | null) => {
      set({ hoveredNodeId: nodeId });
    },

    setColorBlindMode: (enabled: boolean) => {
      set({ colorBlindMode: enabled });
    },

    setTransform: (transform: { x: number; y: number; k: number }) => {
      set({ transform });
    },

    // ============================================
    // WORKER SYNC
    // ============================================
    updateFromWorker: (message: WorkerTickMessage) => {
      const { nodes, mode, history, stats } = get();
      
      // Update node states from worker
      const nodeUpdates = new Map(message.nodes.map(n => [n.id, n]));
      const updatedNodes = nodes.map(node => {
        const update = nodeUpdates.get(node.id);
        if (update) {
          return {
            ...node,
            epidemicState: update.epidemicState,
            financialState: update.financialState,
            capitalRatio: update.capitalRatio,
          };
        }
        return node;
      });
      
      // Check if simulation is complete
      const isComplete = mode === 'epidemic'
        ? message.stats.epidemic.infected === 0 && message.stats.tick > 0
        : message.stats.financial.stressed === 0 && message.stats.financial.distressed === 0 && message.stats.tick > 0;
      
      // Update history (keep last 200 ticks)
      const newHistory = [...history, message.stats].slice(-200);
      
      set({
        nodes: updatedNodes,
        tick: message.stats.tick,
        stats: message.stats,
        history: newHistory,
        playbackState: isComplete ? 'complete' : get().playbackState,
      });
    },

    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    // ============================================
    // PRESETS
    // ============================================
    applyPreset: (preset: DemoPreset) => {
      set({
        mode: preset.mode,
        topology: preset.topology,
        nodeCount: preset.nodeCount,
        linkDensity: preset.linkDensity,
        epidemicParams: { ...DEFAULT_EPIDEMIC_PARAMS, ...preset.epidemicParams },
        financialParams: { ...DEFAULT_FINANCIAL_PARAMS, ...preset.financialParams },
        playbackState: 'idle',
        tick: 0,
        history: [],
      });
      
      // Regenerate network with new settings
      setTimeout(() => {
        get().regenerateNetwork();
        
        // Apply initial action after network is generated
        if (preset.initialAction) {
          setTimeout(() => {
            const { nodes } = get();
            let targetNode: SimulationNode | null = null;
            
            switch (preset.initialAction!.target) {
              case 'highest-degree':
                targetNode = findHighestDegreeNode(nodes);
                break;
              case 'random':
                targetNode = findRandomNode(nodes);
                break;
              case 'specific':
                targetNode = nodes.find(n => n.id === preset.initialAction!.nodeId) || null;
                break;
            }
            
            if (targetNode) {
              if (preset.initialAction!.type === 'infect') {
                get().infectNode(targetNode.id);
              } else if (preset.initialAction!.type === 'shock') {
                get().shockNode(targetNode.id, preset.initialAction!.magnitude || 0.5);
              }
            }
          }, 100);
        }
      }, 50);
    },
  }))
);

// Helper function to calculate stats from nodes
function calculateStats(nodes: SimulationNode[], mode: SimulationMode) {
  const epidemicCounts = {
    SUSCEPTIBLE: 0,
    INFECTED: 0,
    RECOVERED: 0,
    DECEASED: 0,
    VACCINATED: 0,
  };
  
  const financialCounts = {
    HEALTHY: 0,
    STRESSED: 0,
    DISTRESSED: 0,
    DEFAULTED: 0,
    BAILED_OUT: 0,
  };
  
  nodes.forEach(node => {
    epidemicCounts[node.epidemicState]++;
    financialCounts[node.financialState]++;
  });
  
  return {
    epidemic: {
      ...epidemicCounts,
      susceptible: epidemicCounts.SUSCEPTIBLE,
      infected: epidemicCounts.INFECTED,
      recovered: epidemicCounts.RECOVERED,
      deceased: epidemicCounts.DECEASED,
      vaccinated: epidemicCounts.VACCINATED,
      r0: 0,
      peakInfected: epidemicCounts.INFECTED,
      totalInfected: epidemicCounts.INFECTED,
    },
    financial: {
      ...financialCounts,
      healthy: financialCounts.HEALTHY,
      stressed: financialCounts.STRESSED,
      distressed: financialCounts.DISTRESSED,
      defaulted: financialCounts.DEFAULTED,
      bailedOut: financialCounts.BAILED_OUT,
      systemicRisk: (financialCounts.STRESSED + financialCounts.DISTRESSED + financialCounts.DEFAULTED) / nodes.length,
      totalLosses: 0,
      cascadeDepth: 0,
    },
    tick: 0,
    elapsedMs: 0,
  };
}

// Selector hooks for optimized re-renders
export const useNodes = () => useSimulationStore(state => state.nodes);
export const useLinks = () => useSimulationStore(state => state.links);
export const useMode = () => useSimulationStore(state => state.mode);
export const usePlaybackState = () => useSimulationStore(state => state.playbackState);
export const useStats = () => useSimulationStore(state => state.stats);
export const useTick = () => useSimulationStore(state => state.tick);
export const useSelectedNode = () => useSimulationStore(state => state.selectedNodeId);
export const useColorBlindMode = () => useSimulationStore(state => state.colorBlindMode);
