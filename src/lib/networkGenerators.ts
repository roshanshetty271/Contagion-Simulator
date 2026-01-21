// ============================================
// NETWORK GENERATION UTILITIES
// Uses graphology for topology generation
// ============================================

import Graph from 'graphology';
import { 
  SimulationNode, 
  SimulationLink, 
  NetworkTopology,
  EpidemicState,
  FinancialState 
} from '@/types';

// ============================================
// TOPOLOGY GENERATORS
// ============================================

/**
 * Generate a scale-free network using Barabási-Albert model
 * Characterized by hub nodes with many connections
 */
function generateScaleFree(nodeCount: number, m: number = 3): Graph {
  const graph = new Graph();
  
  // Start with a small complete graph of m+1 nodes
  for (let i = 0; i <= m; i++) {
    graph.addNode(i.toString());
    for (let j = 0; j < i; j++) {
      graph.addEdge(i.toString(), j.toString());
    }
  }
  
  // Add remaining nodes with preferential attachment
  for (let i = m + 1; i < nodeCount; i++) {
    const newNode = i.toString();
    graph.addNode(newNode);
    
    // Calculate total degree for probability
    let totalDegree = 0;
    graph.forEachNode((node) => {
      totalDegree += graph.degree(node);
    });
    
    // Connect to m existing nodes with probability proportional to degree
    const targets = new Set<string>();
    while (targets.size < m) {
      let r = Math.random() * totalDegree;
      graph.forEachNode((node) => {
        if (targets.has(node) || node === newNode) return;
        r -= graph.degree(node);
        if (r <= 0 && targets.size < m) {
          targets.add(node);
        }
      });
    }
    
    targets.forEach(target => {
      graph.addEdge(newNode, target);
    });
  }
  
  return graph;
}

/**
 * Generate a small-world network using Watts-Strogatz model
 * High clustering + short path lengths
 */
function generateSmallWorld(
  nodeCount: number, 
  k: number = 4, 
  rewireProb: number = 0.1
): Graph {
  const graph = new Graph();
  
  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    graph.addNode(i.toString());
  }
  
  // Create ring lattice with k/2 neighbors on each side
  const halfK = Math.floor(k / 2);
  for (let i = 0; i < nodeCount; i++) {
    for (let j = 1; j <= halfK; j++) {
      const neighbor = (i + j) % nodeCount;
      if (!graph.hasEdge(i.toString(), neighbor.toString())) {
        graph.addEdge(i.toString(), neighbor.toString());
      }
    }
  }
  
  // Rewire edges with probability p
  graph.forEachEdge((edge, attrs, source, target) => {
    if (Math.random() < rewireProb) {
      // Find new target
      let newTarget: string;
      let attempts = 0;
      do {
        newTarget = Math.floor(Math.random() * nodeCount).toString();
        attempts++;
      } while (
        (newTarget === source || 
         newTarget === target || 
         graph.hasEdge(source, newTarget)) &&
        attempts < 100
      );
      
      if (attempts < 100) {
        graph.dropEdge(edge);
        graph.addEdge(source, newTarget);
      }
    }
  });
  
  return graph;
}

/**
 * Generate a random network using Erdős-Rényi model
 * Uniform connection probability
 */
function generateRandom(nodeCount: number, edgeProbability: number = 0.05): Graph {
  const graph = new Graph();
  
  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    graph.addNode(i.toString());
  }
  
  // Create edges with probability p
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() < edgeProbability) {
        graph.addEdge(i.toString(), j.toString());
      }
    }
  }
  
  // Ensure graph is connected
  const visited = new Set<string>();
  const queue = ['0'];
  visited.add('0');
  
  while (queue.length > 0) {
    const node = queue.shift()!;
    graph.forEachNeighbor(node, (neighbor) => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    });
  }
  
  // Connect isolated components
  for (let i = 0; i < nodeCount; i++) {
    const nodeId = i.toString();
    if (!visited.has(nodeId)) {
      // Connect to random visited node
      const visitedArray = Array.from(visited);
      const randomVisited = visitedArray[Math.floor(Math.random() * visitedArray.length)];
      graph.addEdge(nodeId, randomVisited);
      visited.add(nodeId);
    }
  }
  
  return graph;
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

interface GenerateNetworkOptions {
  topology: NetworkTopology;
  nodeCount: number;
  linkDensity: number; // 0-1, affects edge probability/count
  canvasWidth: number;
  canvasHeight: number;
}

export function generateNetwork(options: GenerateNetworkOptions): {
  nodes: SimulationNode[];
  links: SimulationLink[];
} {
  const { topology, nodeCount, linkDensity, canvasWidth, canvasHeight } = options;
  
  // Generate graph based on topology
  let graph: Graph;
  switch (topology) {
    case 'scale-free':
      // m parameter: number of edges to attach from new node
      const m = Math.max(2, Math.floor(linkDensity * 5) + 1);
      graph = generateScaleFree(nodeCount, m);
      break;
    case 'small-world':
      // k parameter: each node connected to k nearest neighbors
      const k = Math.max(4, Math.floor(linkDensity * 8) + 2);
      graph = generateSmallWorld(nodeCount, k, 0.1);
      break;
    case 'random':
      // Edge probability based on density
      const p = 0.02 + linkDensity * 0.08;
      graph = generateRandom(nodeCount, p);
      break;
    default:
      graph = generateScaleFree(nodeCount, 3);
  }
  
  // Convert to simulation nodes
  const nodes: SimulationNode[] = [];
  const nodeMap = new Map<string, SimulationNode>();
  
  graph.forEachNode((nodeId) => {
    const degree = graph.degree(nodeId);
    const neighbors: string[] = [];
    graph.forEachNeighbor(nodeId, (neighbor) => {
      neighbors.push(neighbor);
    });
    
    // Calculate radius based on degree (more connections = larger node)
    const minRadius = 6;
    const maxRadius = 20;
    const maxDegree = Math.max(...graph.nodes().map(n => graph.degree(n)));
    const normalizedDegree = maxDegree > 0 ? degree / maxDegree : 0;
    const radius = minRadius + (maxRadius - minRadius) * Math.pow(normalizedDegree, 0.5);
    
    // Random initial position with some structure
    const angle = (parseInt(nodeId) / nodeCount) * 2 * Math.PI;
    const r = 100 + Math.random() * 200;
    
    const node: SimulationNode = {
      id: nodeId,
      index: parseInt(nodeId),
      x: canvasWidth / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 50,
      y: canvasHeight / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 50,
      vx: 0,
      vy: 0,
      degree,
      neighbors,
      epidemicState: 'SUSCEPTIBLE' as EpidemicState,
      financialState: 'HEALTHY' as FinancialState,
      assets: 100 + Math.random() * 100 * (1 + normalizedDegree), // Larger nodes have more assets
      liabilities: 0,
      capitalRatio: 0.1 + Math.random() * 0.05,
      radius,
    };
    
    nodes.push(node);
    nodeMap.set(nodeId, node);
  });
  
  // Convert to simulation links
  const links: SimulationLink[] = [];
  let linkIndex = 0;
  
  graph.forEachEdge((edge, attrs, source, target) => {
    const sourceNode = nodeMap.get(source);
    const targetNode = nodeMap.get(target);
    
    if (sourceNode && targetNode) {
      // Exposure based on node sizes (financial mode)
      const avgAssets = (sourceNode.assets + targetNode.assets) / 2;
      const exposure = avgAssets * (0.1 + Math.random() * 0.2);
      
      links.push({
        id: `link-${linkIndex++}`,
        source: source,
        sourceId: source,
        target: target,
        targetId: target,
        weight: 1,
        exposure,
      });
    }
  });
  
  return { nodes, links };
}

/**
 * Find node with highest degree (hub node)
 */
export function findHighestDegreeNode(nodes: SimulationNode[]): SimulationNode | null {
  if (nodes.length === 0) return null;
  return nodes.reduce((max, node) => node.degree > max.degree ? node : max, nodes[0]);
}

/**
 * Find random node
 */
export function findRandomNode(nodes: SimulationNode[]): SimulationNode | null {
  if (nodes.length === 0) return null;
  return nodes[Math.floor(Math.random() * nodes.length)];
}

/**
 * Get network statistics
 */
export function getNetworkStats(nodes: SimulationNode[], links: SimulationLink[]) {
  const degrees = nodes.map(n => n.degree);
  const avgDegree = degrees.reduce((a, b) => a + b, 0) / nodes.length;
  const maxDegree = Math.max(...degrees);
  const minDegree = Math.min(...degrees);
  
  return {
    nodeCount: nodes.length,
    linkCount: links.length,
    avgDegree: avgDegree.toFixed(2),
    maxDegree,
    minDegree,
    density: (2 * links.length) / (nodes.length * (nodes.length - 1)),
  };
}
