import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useSimulationStore,
  useNodes,
  useLinks,
  useMode,
  usePlaybackState,
  useStats,
  setWorkerRef,
} from '../simulationStore';
import { SimulationMode, NetworkTopology } from '@/types';

// Mock worker
const mockWorker = {
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  terminate: vi.fn(),
} as any;

describe('simulationStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    const { result } = renderHook(() => useSimulationStore());
    act(() => {
      result.current.reset();
    });
    
    // Reset mock
    vi.clearAllMocks();
    setWorkerRef(mockWorker);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      expect(result.current.mode).toBe('epidemic');
      expect(result.current.topology).toBe('scale-free');
      expect(result.current.nodeCount).toBe(150);
      expect(result.current.playbackState).toBe('idle');
      expect(result.current.tick).toBe(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.colorBlindMode).toBe(false);
    });

    it('should initialize with nodes and links after network generation', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      // Store may generate network on initialization
      expect(Array.isArray(result.current.nodes)).toBe(true);
      expect(Array.isArray(result.current.links)).toBe(true);
    });
  });

  describe('Mode and Topology', () => {
    it('should set simulation mode', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.setMode('financial');
      });
      
      expect(result.current.mode).toBe('financial');
    });

    it('should set network topology', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.setTopology('small-world');
      });
      
      expect(result.current.topology).toBe('small-world');
    });

    it('should regenerate network when topology changes', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.setTopology('random');
      });
      
      expect(result.current.nodes.length).toBeGreaterThan(0);
      expect(result.current.links.length).toBeGreaterThan(0);
    });

    it('should set node count', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.setNodeCount(50);
      });
      
      expect(result.current.nodeCount).toBe(50);
      expect(result.current.nodes.length).toBe(50);
    });

    it('should set link density', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      const initialLinks = result.current.links.length;
      
      act(() => {
        result.current.setLinkDensity(0.8);
      });
      
      expect(result.current.linkDensity).toBe(0.8);
    });
  });

  describe('Parameters', () => {
    it('should update epidemic parameters', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.setEpidemicParams({ beta: 0.5 });
      });
      
      expect(result.current.epidemicParams.beta).toBe(0.5);
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'params',
          epidemicParams: expect.objectContaining({ beta: 0.5 }),
        })
      );
    });

    it('should update financial parameters', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.setFinancialParams({ leverageRatio: 15 });
      });
      
      expect(result.current.financialParams.leverageRatio).toBe(15);
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'params',
          financialParams: expect.objectContaining({ leverageRatio: 15 }),
        })
      );
    });

    it('should preserve other params when updating partial params', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      const originalGamma = result.current.epidemicParams.gamma;
      
      act(() => {
        result.current.setEpidemicParams({ beta: 0.7 });
      });
      
      expect(result.current.epidemicParams.beta).toBe(0.7);
      expect(result.current.epidemicParams.gamma).toBe(originalGamma);
    });

    it('should set tick rate', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.setTickRate(30);
      });
      
      expect(result.current.tickRate).toBe(30);
    });
  });

  describe('Network Generation', () => {
    it('should regenerate network', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      // Ensure we have the default node count
      act(() => {
        result.current.setNodeCount(150);
      });
      
      vi.clearAllMocks();
      
      act(() => {
        result.current.regenerateNetwork();
      });
      
      expect(result.current.nodes.length).toBe(150);
      expect(result.current.links.length).toBeGreaterThan(0);
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'init',
        })
      );
    });

    it('should apply vaccination when regenerating in epidemic mode', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.setMode('epidemic');
        result.current.setEpidemicParams({ vaccinationRate: 0.2 });
        result.current.regenerateNetwork();
      });
      
      const vaccinatedCount = result.current.nodes.filter(
        n => n.epidemicState === 'VACCINATED'
      ).length;
      
      expect(vaccinatedCount).toBeGreaterThan(0);
      expect(vaccinatedCount).toBeCloseTo(result.current.nodes.length * 0.2, -1);
    });

    it('should reset tick and history on regeneration', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      // Set some state
      act(() => {
        result.current.updateFromWorker({
          nodes: [],
          stats: {
            epidemic: result.current.stats.epidemic,
            financial: result.current.stats.financial,
            tick: 10,
            elapsedMs: 1000,
          },
        });
      });
      
      expect(result.current.tick).toBe(10);
      
      act(() => {
        result.current.regenerateNetwork();
      });
      
      expect(result.current.tick).toBe(0);
      expect(result.current.history).toEqual([]);
    });
  });

  describe('Node Actions', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useSimulationStore());
      act(() => {
        result.current.regenerateNetwork();
      });
    });

    it('should infect a node', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      const nodeId = result.current.nodes[0].id;
      
      act(() => {
        result.current.infectNode(nodeId);
      });
      
      const node = result.current.nodes.find(n => n.id === nodeId);
      expect(node?.epidemicState).toBe('INFECTED');
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'infect',
          nodeId,
        })
      );
    });

    it('should shock a node', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.setMode('financial');
        result.current.regenerateNetwork();
      });
      
      const nodeId = result.current.nodes[0].id;
      const originalCapitalRatio = result.current.nodes[0].capitalRatio;
      
      act(() => {
        result.current.shockNode(nodeId, 0.5);
      });
      
      const node = result.current.nodes.find(n => n.id === nodeId);
      expect(node?.capitalRatio).toBeLessThan(originalCapitalRatio);
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'shock',
          nodeId,
          magnitude: 0.5,
        })
      );
    });

    it('should vaccinate a node', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      // Ensure we're in epidemic mode
      act(() => {
        result.current.setMode('epidemic');
        result.current.regenerateNetwork();
      });
      
      const susceptibleNode = result.current.nodes.find(n => n.epidemicState === 'SUSCEPTIBLE');
      if (!susceptibleNode) {
        // If no susceptible node, skip test
        expect(true).toBe(true);
        return;
      }
      
      const nodeId = susceptibleNode.id;
      
      act(() => {
        result.current.vaccinateNode(nodeId);
      });
      
      const node = result.current.nodes.find(n => n.id === nodeId);
      expect(node?.epidemicState).toBe('VACCINATED');
    });

    it('should bailout a node', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.setMode('financial');
        result.current.regenerateNetwork();
      });
      
      const nodeId = result.current.nodes[0].id;
      
      // First shock it
      act(() => {
        result.current.shockNode(nodeId, 0.9);
      });
      
      // Then bailout
      act(() => {
        result.current.bailoutNode(nodeId);
      });
      
      const node = result.current.nodes.find(n => n.id === nodeId);
      expect(node?.financialState).toBe('BAILED_OUT');
    });

    it('should not infect in financial mode', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.setMode('financial');
        result.current.regenerateNetwork();
      });
      
      const nodeId = result.current.nodes[0].id;
      
      act(() => {
        result.current.infectNode(nodeId);
      });
      
      const node = result.current.nodes.find(n => n.id === nodeId);
      expect(node?.epidemicState).not.toBe('INFECTED');
    });

    it('should not shock in epidemic mode', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      // Ensure we're in epidemic mode
      act(() => {
        result.current.setMode('epidemic');
        result.current.regenerateNetwork();
      });
      
      const nodeId = result.current.nodes[0].id;
      const originalCapitalRatio = result.current.nodes[0].capitalRatio;
      
      act(() => {
        result.current.shockNode(nodeId, 0.5);
      });
      
      const node = result.current.nodes.find(n => n.id === nodeId);
      expect(node?.capitalRatio).toBe(originalCapitalRatio);
    });
  });

  describe('Playback Controls', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useSimulationStore());
      act(() => {
        result.current.regenerateNetwork();
      });
    });

    it('should play simulation', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.play();
      });
      
      expect(result.current.playbackState).toBe('playing');
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'start',
        })
      );
    });

    it('should pause simulation', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.play();
        result.current.pause();
      });
      
      expect(result.current.playbackState).toBe('paused');
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'pause',
        })
      );
    });

    it('should reset simulation', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.play();
        result.current.reset();
      });
      
      expect(result.current.playbackState).toBe('idle');
      expect(result.current.tick).toBe(0);
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'reset',
        })
      );
    });

    it('should step through simulation', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.step();
      });
      
      expect(mockWorker.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'step',
        })
      );
    });

    it('should not play when complete', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        // Manually set to complete
        result.current.updateFromWorker({
          nodes: result.current.nodes.map(n => ({
            id: n.id,
            epidemicState: 'RECOVERED' as const,
            financialState: 'HEALTHY' as const,
            capitalRatio: 0.1,
          })),
          stats: {
            ...result.current.stats,
            epidemic: { ...result.current.stats.epidemic, infected: 0 },
            tick: 100,
          },
        });
      });
      
      vi.clearAllMocks();
      
      act(() => {
        result.current.play();
      });
      
      expect(result.current.playbackState).toBe('complete');
      expect(mockWorker.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('UI State', () => {
    it('should select a node', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.selectNode('node-1');
      });
      
      expect(result.current.selectedNodeId).toBe('node-1');
    });

    it('should hover a node', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.hoverNode('node-2');
      });
      
      expect(result.current.hoveredNodeId).toBe('node-2');
    });

    it('should toggle color blind mode', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      expect(result.current.colorBlindMode).toBe(false);
      
      act(() => {
        result.current.setColorBlindMode(true);
      });
      
      expect(result.current.colorBlindMode).toBe(true);
    });

    it('should set transform', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      const transform = { x: 100, y: 200, k: 1.5 };
      
      act(() => {
        result.current.setTransform(transform);
      });
      
      expect(result.current.transform).toEqual(transform);
    });
  });

  describe('Worker Updates', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useSimulationStore());
      act(() => {
        result.current.regenerateNetwork();
      });
    });

    it('should update from worker message', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      const workerMessage = {
        nodes: result.current.nodes.map(n => ({
          id: n.id,
          epidemicState: 'SUSCEPTIBLE' as const,
          financialState: 'HEALTHY' as const,
          capitalRatio: 0.1,
        })),
        stats: {
          ...result.current.stats,
          tick: 5,
          elapsedMs: 500,
        },
      };
      
      act(() => {
        result.current.updateFromWorker(workerMessage);
      });
      
      expect(result.current.tick).toBe(5);
      expect(result.current.stats.tick).toBe(5);
    });

    it('should update node states from worker', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      const nodeId = result.current.nodes[0].id;
      
      const workerMessage = {
        nodes: [
          {
            id: nodeId,
            epidemicState: 'INFECTED' as const,
            financialState: 'HEALTHY' as const,
            capitalRatio: 0.1,
          },
          ...result.current.nodes.slice(1).map(n => ({
            id: n.id,
            epidemicState: 'SUSCEPTIBLE' as const,
            financialState: 'HEALTHY' as const,
            capitalRatio: 0.1,
          })),
        ],
        stats: result.current.stats,
      };
      
      act(() => {
        result.current.updateFromWorker(workerMessage);
      });
      
      const node = result.current.nodes.find(n => n.id === nodeId);
      expect(node?.epidemicState).toBe('INFECTED');
    });

    it('should maintain history with limit', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      // Add 250 history entries (more than limit of 200)
      for (let i = 0; i < 250; i++) {
        act(() => {
          result.current.updateFromWorker({
            nodes: [],
            stats: {
              ...result.current.stats,
              tick: i,
            },
          });
        });
      }
      
      expect(result.current.history.length).toBeLessThanOrEqual(200);
    });

    it('should mark complete when epidemic ends', () => {
      const { result } = renderHook(() => useSimulationStore());
      
      act(() => {
        result.current.updateFromWorker({
          nodes: result.current.nodes.map(n => ({
            id: n.id,
            epidemicState: 'RECOVERED' as const,
            financialState: 'HEALTHY' as const,
            capitalRatio: 0.1,
          })),
          stats: {
            ...result.current.stats,
            epidemic: { ...result.current.stats.epidemic, infected: 0 },
            tick: 100,
          },
        });
      });
      
      expect(result.current.playbackState).toBe('complete');
    });
  });

  describe('Selector Hooks', () => {
    it('useNodes should return nodes', () => {
      const { result } = renderHook(() => useNodes());
      expect(Array.isArray(result.current)).toBe(true);
    });

    it('useLinks should return links', () => {
      const { result } = renderHook(() => useLinks());
      expect(Array.isArray(result.current)).toBe(true);
    });

    it('useMode should return mode', () => {
      const { result } = renderHook(() => useMode());
      expect(['epidemic', 'financial']).toContain(result.current);
    });

    it('usePlaybackState should return playback state', () => {
      const { result } = renderHook(() => usePlaybackState());
      expect(['idle', 'playing', 'paused', 'complete']).toContain(result.current);
    });

    it('useStats should return stats', () => {
      const { result } = renderHook(() => useStats());
      expect(result.current).toHaveProperty('epidemic');
      expect(result.current).toHaveProperty('financial');
      expect(result.current).toHaveProperty('tick');
    });
  });
});
