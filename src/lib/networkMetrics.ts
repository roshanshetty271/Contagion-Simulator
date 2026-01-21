// ============================================
// NETWORK METRICS
// Calculate network centrality and properties
// ============================================

import { SimulationNode, SimulationLink } from '@/types';

export interface NetworkMetrics {
  degreeCentrality: Map<string, number>;
  betweennessCentrality: Map<string, number>;
  closenessCentrality: Map<string, number>;
  clusteringCoefficient: Map<string, number>;
  averageDegree: number;
  density: number;
  avgPathLength: number;
  diameter: number;
}

/**
 * Calculate degree centrality (normalized)
 */
export function calculateDegreeCentrality(
  nodes: SimulationNode[],
  links: SimulationLink[]
): Map<string, number> {
  const centrality = new Map<string, number>();
  const n = nodes.length;
  
  nodes.forEach(node => {
    // Normalized degree centrality
    centrality.set(node.id, node.degree / (n - 1));
  });
  
  return centrality;
}

/**
 * Calculate betweenness centrality (simplified)
 * Full betweenness is expensive O(n³), this is an approximation
 */
export function calculateBetweennessCentrality(
  nodes: SimulationNode[],
  links: SimulationLink[]
): Map<string, number> {
  const centrality = new Map<string, number>();
  
  // Initialize all to 0
  nodes.forEach(node => centrality.set(node.id, 0));
  
  // Build adjacency list
  const adjacency = buildAdjacencyList(nodes, links);
  
  // For each pair of nodes, find shortest paths
  // This is a simplified version for performance
  const sampleSize = Math.min(20, nodes.length);
  const sampledNodes = nodes.slice(0, sampleSize);
  
  for (const source of sampledNodes) {
    const distances = new Map<string, number>();
    const paths = new Map<string, Set<string>>();
    const queue: string[] = [source.id];
    
    distances.set(source.id, 0);
    paths.set(source.id, new Set());
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = distances.get(current)!;
      
      const neighbors = adjacency.get(current) || [];
      for (const neighbor of neighbors) {
        if (!distances.has(neighbor)) {
          distances.set(neighbor, currentDist + 1);
          paths.set(neighbor, new Set([current]));
          queue.push(neighbor);
        } else if (distances.get(neighbor) === currentDist + 1) {
          paths.get(neighbor)!.add(current);
        }
      }
    }
    
    // Backtrack to count paths through each node
    const visited = new Set<string>();
    const backtrack = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const predecessors = paths.get(nodeId);
      if (predecessors) {
        predecessors.forEach(pred => {
          const current = centrality.get(pred) || 0;
          centrality.set(pred, current + 1);
          backtrack(pred);
        });
      }
    };
    
    distances.forEach((_, nodeId) => {
      if (nodeId !== source.id) {
        backtrack(nodeId);
      }
    });
  }
  
  // Normalize
  const max = Math.max(...Array.from(centrality.values()));
  if (max > 0) {
    centrality.forEach((value, key) => {
      centrality.set(key, value / max);
    });
  }
  
  return centrality;
}

/**
 * Calculate closeness centrality
 */
export function calculateClosenessCentrality(
  nodes: SimulationNode[],
  links: SimulationLink[]
): Map<string, number> {
  const centrality = new Map<string, number>();
  const adjacency = buildAdjacencyList(nodes, links);
  
  nodes.forEach(source => {
    // BFS to find shortest paths
    const distances = new Map<string, number>();
    const queue: string[] = [source.id];
    distances.set(source.id, 0);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentDist = distances.get(current)!;
      
      const neighbors = adjacency.get(current) || [];
      for (const neighbor of neighbors) {
        if (!distances.has(neighbor)) {
          distances.set(neighbor, currentDist + 1);
          queue.push(neighbor);
        }
      }
    }
    
    // Calculate closeness
    const totalDistance = Array.from(distances.values()).reduce((a, b) => a + b, 0);
    const reachable = distances.size - 1;
    
    if (reachable > 0 && totalDistance > 0) {
      centrality.set(source.id, reachable / totalDistance);
    } else {
      centrality.set(source.id, 0);
    }
  });
  
  return centrality;
}

/**
 * Calculate clustering coefficient for each node
 */
export function calculateClusteringCoefficients(
  nodes: SimulationNode[],
  links: SimulationLink[]
): Map<string, number> {
  const coefficients = new Map<string, number>();
  const adjacency = buildAdjacencyList(nodes, links);
  
  nodes.forEach(node => {
    const neighbors = adjacency.get(node.id) || [];
    const k = neighbors.length;
    
    if (k < 2) {
      coefficients.set(node.id, 0);
      return;
    }
    
    // Count connections between neighbors
    let connections = 0;
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        const neighborsOfI = adjacency.get(neighbors[i]) || [];
        if (neighborsOfI.includes(neighbors[j])) {
          connections++;
        }
      }
    }
    
    const maxConnections = (k * (k - 1)) / 2;
    coefficients.set(node.id, connections / maxConnections);
  });
  
  return coefficients;
}

/**
 * Calculate all network metrics
 */
export function calculateNetworkMetrics(
  nodes: SimulationNode[],
  links: SimulationLink[]
): NetworkMetrics {
  const degreeCentrality = calculateDegreeCentrality(nodes, links);
  const betweennessCentrality = calculateBetweennessCentrality(nodes, links);
  const closenessCentrality = calculateClosenessCentrality(nodes, links);
  const clusteringCoefficient = calculateClusteringCoefficients(nodes, links);
  
  // Calculate network-wide metrics
  const degrees = nodes.map(n => n.degree);
  const averageDegree = degrees.reduce((a, b) => a + b, 0) / nodes.length;
  const density = (2 * links.length) / (nodes.length * (nodes.length - 1));
  
  // Average path length and diameter
  const { avgPathLength, diameter } = calculatePathMetrics(nodes, links);
  
  return {
    degreeCentrality,
    betweennessCentrality,
    closenessCentrality,
    clusteringCoefficient,
    averageDegree,
    density,
    avgPathLength,
    diameter,
  };
}

/**
 * Calculate average path length and diameter
 */
function calculatePathMetrics(
  nodes: SimulationNode[],
  links: SimulationLink[]
): { avgPathLength: number; diameter: number } {
  const adjacency = buildAdjacencyList(nodes, links);
  let totalPathLength = 0;
  let pathCount = 0;
  let maxPath = 0;
  
  // Sample for performance
  const sampleSize = Math.min(50, nodes.length);
  const sampledNodes = nodes.slice(0, sampleSize);
  
  for (const source of sampledNodes) {
    const distances = bfs(source.id, adjacency);
    
    distances.forEach((distance, target) => {
      if (distance > 0 && distance < Infinity) {
        totalPathLength += distance;
        pathCount++;
        maxPath = Math.max(maxPath, distance);
      }
    });
  }
  
  return {
    avgPathLength: pathCount > 0 ? totalPathLength / pathCount : 0,
    diameter: maxPath,
  };
}

/**
 * Build adjacency list from nodes and links
 */
function buildAdjacencyList(
  nodes: SimulationNode[],
  links: SimulationLink[]
): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  
  nodes.forEach(node => {
    adjacency.set(node.id, []);
  });
  
  links.forEach(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.sourceId;
    const targetId = typeof link.target === 'string' ? link.target : link.targetId;
    
    adjacency.get(sourceId)?.push(targetId);
    adjacency.get(targetId)?.push(sourceId);
  });
  
  return adjacency;
}

/**
 * Breadth-first search
 */
function bfs(sourceId: string, adjacency: Map<string, string[]>): Map<string, number> {
  const distances = new Map<string, number>();
  const queue: string[] = [sourceId];
  distances.set(sourceId, 0);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDist = distances.get(current)!;
    
    const neighbors = adjacency.get(current) || [];
    for (const neighbor of neighbors) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, currentDist + 1);
        queue.push(neighbor);
      }
    }
  }
  
  return distances;
}

/**
 * Identify most vulnerable nodes (high centrality + low resilience)
 */
export function identifyVulnerableNodes(
  nodes: SimulationNode[],
  metrics: NetworkMetrics,
  mode: 'epidemic' | 'financial'
): SimulationNode[] {
  const vulnerableNodes = nodes.map(node => {
    const betweenness = metrics.betweennessCentrality.get(node.id) || 0;
    const degree = metrics.degreeCentrality.get(node.id) || 0;
    
    let stateScore = 0;
    if (mode === 'epidemic') {
      stateScore = node.epidemicState === 'SUSCEPTIBLE' ? 1 : 0;
    } else {
      stateScore = node.financialState === 'HEALTHY' ? 1 : 
                   node.financialState === 'STRESSED' ? 0.5 : 0;
    }
    
    const vulnerabilityScore = (betweenness * 0.6 + degree * 0.4) * stateScore;
    
    return { node, vulnerabilityScore };
  });
  
  return vulnerableNodes
    .sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore)
    .slice(0, 10)
    .map(v => v.node);
}
