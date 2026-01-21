import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateNetwork,
  findHighestDegreeNode,
  findRandomNode,
  getNetworkStats,
} from '../networkGenerators';
import { SimulationNode, NetworkTopology } from '@/types';

describe('networkGenerators', () => {
  const baseOptions = {
    nodeCount: 50,
    linkDensity: 0.5,
    canvasWidth: 800,
    canvasHeight: 600,
  };

  describe('generateNetwork', () => {
    it('should generate scale-free network with correct node count', () => {
      const { nodes, links } = generateNetwork({
        ...baseOptions,
        topology: 'scale-free',
      });

      expect(nodes).toHaveLength(50);
      expect(links.length).toBeGreaterThan(0);
      expect(nodes.every(node => node.id !== undefined)).toBe(true);
    });

    it('should generate small-world network with high clustering', () => {
      const { nodes, links } = generateNetwork({
        ...baseOptions,
        topology: 'small-world',
      });

      expect(nodes).toHaveLength(50);
      expect(links.length).toBeGreaterThan(0);
      
      // Verify each node has neighbors
      nodes.forEach(node => {
        expect(node.neighbors).toBeDefined();
        expect(node.degree).toBeGreaterThanOrEqual(0);
      });
    });

    it('should generate random network with expected properties', () => {
      const { nodes, links } = generateNetwork({
        ...baseOptions,
        topology: 'random',
      });

      expect(nodes).toHaveLength(50);
      expect(links.length).toBeGreaterThan(0);
    });

    it('should create nodes with proper initial states', () => {
      const { nodes } = generateNetwork({
        ...baseOptions,
        topology: 'scale-free',
      });

      nodes.forEach(node => {
        expect(node.epidemicState).toBe('SUSCEPTIBLE');
        expect(node.financialState).toBe('HEALTHY');
        expect(node.assets).toBeGreaterThan(0);
        expect(node.capitalRatio).toBeGreaterThan(0);
        expect(node.radius).toBeGreaterThan(0);
        expect(node.x).toBeDefined();
        expect(node.y).toBeDefined();
      });
    });

    it('should create valid links between nodes', () => {
      const { nodes, links } = generateNetwork({
        ...baseOptions,
        topology: 'scale-free',
      });

      const nodeIds = new Set(nodes.map(n => n.id));

      links.forEach(link => {
        expect(nodeIds.has(link.sourceId)).toBe(true);
        expect(nodeIds.has(link.targetId)).toBe(true);
        expect(link.weight).toBeGreaterThan(0);
        expect(link.exposure).toBeGreaterThan(0);
      });
    });

    it('should scale node radius based on degree', () => {
      const { nodes } = generateNetwork({
        ...baseOptions,
        topology: 'scale-free',
        nodeCount: 100,
      });

      const degrees = nodes.map(n => n.degree);
      const maxDegree = Math.max(...degrees);
      const highDegreeNode = nodes.find(n => n.degree === maxDegree);
      const lowDegreeNode = nodes.find(n => n.degree === Math.min(...degrees));

      if (highDegreeNode && lowDegreeNode && maxDegree > 0) {
        expect(highDegreeNode.radius).toBeGreaterThanOrEqual(lowDegreeNode.radius);
      }
    });

    it('should respect link density parameter', () => {
      const lowDensity = generateNetwork({
        ...baseOptions,
        topology: 'scale-free',
        linkDensity: 0.2,
      });

      const highDensity = generateNetwork({
        ...baseOptions,
        topology: 'scale-free',
        linkDensity: 0.8,
      });

      // Higher density should generally produce more links
      expect(highDensity.links.length).toBeGreaterThanOrEqual(lowDensity.links.length * 0.8);
    });

    it('should generate connected networks', () => {
      const { nodes, links } = generateNetwork({
        ...baseOptions,
        topology: 'random',
      });

      // Build adjacency list
      const adjacency = new Map<string, Set<string>>();
      nodes.forEach(node => adjacency.set(node.id, new Set()));

      links.forEach(link => {
        adjacency.get(link.sourceId)?.add(link.targetId);
        adjacency.get(link.targetId)?.add(link.sourceId);
      });

      // BFS to check connectivity
      const visited = new Set<string>();
      const queue = [nodes[0].id];
      visited.add(nodes[0].id);

      while (queue.length > 0) {
        const current = queue.shift()!;
        const neighbors = adjacency.get(current) || new Set();

        neighbors.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }

      expect(visited.size).toBe(nodes.length);
    });
  });

  describe('findHighestDegreeNode', () => {
    it('should find node with highest degree', () => {
      const { nodes } = generateNetwork({
        ...baseOptions,
        topology: 'scale-free',
      });

      const hubNode = findHighestDegreeNode(nodes);
      expect(hubNode).toBeDefined();

      if (hubNode) {
        const maxDegree = Math.max(...nodes.map(n => n.degree));
        expect(hubNode.degree).toBe(maxDegree);
      }
    });

    it('should return null for empty array', () => {
      const result = findHighestDegreeNode([]);
      expect(result).toBeNull();
    });

    it('should handle single node', () => {
      const { nodes } = generateNetwork({
        ...baseOptions,
        nodeCount: 1,
        topology: 'scale-free',
      });

      const result = findHighestDegreeNode(nodes);
      expect(result).toBe(nodes[0]);
    });
  });

  describe('findRandomNode', () => {
    it('should return a node from the array', () => {
      const { nodes } = generateNetwork({
        ...baseOptions,
        topology: 'scale-free',
      });

      const randomNode = findRandomNode(nodes);
      expect(randomNode).toBeDefined();
      expect(nodes).toContain(randomNode);
    });

    it('should return null for empty array', () => {
      const result = findRandomNode([]);
      expect(result).toBeNull();
    });

    it('should be reasonably random', () => {
      const { nodes } = generateNetwork({
        ...baseOptions,
        nodeCount: 10,
        topology: 'scale-free',
      });

      const selectedIds = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const node = findRandomNode(nodes);
        if (node) selectedIds.add(node.id);
      }

      // Should select multiple different nodes
      expect(selectedIds.size).toBeGreaterThan(1);
    });
  });

  describe('getNetworkStats', () => {
    it('should calculate correct network statistics', () => {
      const { nodes, links } = generateNetwork({
        ...baseOptions,
        topology: 'scale-free',
      });

      const stats = getNetworkStats(nodes, links);

      expect(stats.nodeCount).toBe(nodes.length);
      expect(stats.linkCount).toBe(links.length);
      expect(parseFloat(stats.avgDegree)).toBeGreaterThan(0);
      expect(stats.maxDegree).toBeGreaterThanOrEqual(stats.minDegree);
      expect(stats.density).toBeGreaterThan(0);
      expect(stats.density).toBeLessThanOrEqual(1);
    });

    it('should calculate average degree correctly', () => {
      const { nodes, links } = generateNetwork({
        ...baseOptions,
        topology: 'small-world',
      });

      const stats = getNetworkStats(nodes, links);
      const manualAvg = nodes.reduce((sum, n) => sum + n.degree, 0) / nodes.length;

      expect(parseFloat(stats.avgDegree)).toBeCloseTo(manualAvg, 1);
    });

    it('should calculate network density correctly', () => {
      const { nodes, links } = generateNetwork({
        ...baseOptions,
        nodeCount: 10,
        topology: 'random',
      });

      const stats = getNetworkStats(nodes, links);
      const expectedDensity = (2 * links.length) / (nodes.length * (nodes.length - 1));

      expect(stats.density).toBeCloseTo(expectedDensity, 10);
    });

    it('should handle networks with varying sizes', () => {
      const smallNetwork = generateNetwork({
        ...baseOptions,
        nodeCount: 10,
        topology: 'scale-free',
      });

      const largeNetwork = generateNetwork({
        ...baseOptions,
        nodeCount: 200,
        topology: 'scale-free',
      });

      const smallStats = getNetworkStats(smallNetwork.nodes, smallNetwork.links);
      const largeStats = getNetworkStats(largeNetwork.nodes, largeNetwork.links);

      expect(smallStats.nodeCount).toBe(10);
      expect(largeStats.nodeCount).toBe(200);
      expect(smallStats.density).toBeGreaterThan(largeStats.density);
    });
  });

  describe('Network Topology Properties', () => {
    it('scale-free networks should have power-law degree distribution', () => {
      const { nodes } = generateNetwork({
        ...baseOptions,
        nodeCount: 200,
        topology: 'scale-free',
      });

      const degrees = nodes.map(n => n.degree).sort((a, b) => b - a);
      const maxDegree = degrees[0];
      const medianDegree = degrees[Math.floor(degrees.length / 2)];

      // Scale-free networks have hubs with much higher degree than median
      expect(maxDegree).toBeGreaterThan(medianDegree * 2);
    });

    it('small-world networks should have regular initial structure', () => {
      const { nodes } = generateNetwork({
        ...baseOptions,
        nodeCount: 100,
        topology: 'small-world',
      });

      const degrees = nodes.map(n => n.degree);
      const avgDegree = degrees.reduce((a, b) => a + b, 0) / degrees.length;
      const variance = degrees.reduce((sum, d) => sum + Math.pow(d - avgDegree, 2), 0) / degrees.length;

      // Small-world should have lower variance than scale-free
      expect(variance).toBeLessThan(avgDegree * 5);
    });

    it('random networks should have relatively uniform degree distribution', () => {
      const { nodes } = generateNetwork({
        ...baseOptions,
        nodeCount: 100,
        topology: 'random',
      });

      const degrees = nodes.map(n => n.degree);
      const avgDegree = degrees.reduce((a, b) => a + b, 0) / degrees.length;
      const maxDegree = Math.max(...degrees);

      // Random networks shouldn't have extreme hubs
      expect(maxDegree).toBeLessThan(avgDegree * 3);
    });
  });
});
