// ============================================
// SIMULATION WORKER
// Runs simulation logic in a separate thread
// Uses postMessage for communication
// ============================================

import { SimulationEngine } from './SimulationEngine';
import type { 
  WorkerIncomingMessage, 
  WorkerTickMessage,
  SimulationNode,
  SimulationLink,
  SimulationMode,
  EpidemicParams,
  FinancialParams,
} from '@/types';

// Initialize engine
const engine = new SimulationEngine();

// Simulation loop state
let isRunning = false;
let tickInterval: ReturnType<typeof setInterval> | null = null;
let tickRate = 20; // ticks per second

// ============================================
// MESSAGE HANDLER
// ============================================

self.onmessage = (event: MessageEvent<WorkerIncomingMessage>) => {
  const message = event.data;
  
  switch (message.type) {
    case 'init':
      handleInit(
        message.nodes,
        message.links,
        message.mode,
        message.epidemicParams,
        message.financialParams
      );
      break;
      
    case 'params':
      handleParams(message.epidemicParams, message.financialParams);
      break;
      
    case 'infect':
      engine.infectNode(message.nodeId);
      sendTick();
      break;
      
    case 'shock':
      engine.shockNode(message.nodeId, message.magnitude || 0.5);
      sendTick();
      break;
      
    case 'vaccinate':
      engine.vaccinateNode(message.nodeId);
      sendTick();
      break;
      
    case 'bailout':
      engine.bailoutNode(message.nodeId);
      sendTick();
      break;
      
    case 'start':
      if (message.tickRate) {
        tickRate = message.tickRate;
      }
      startSimulation();
      break;
      
    case 'pause':
      pauseSimulation();
      break;
      
    case 'reset':
      resetSimulation();
      break;
      
    case 'step':
      stepSimulation();
      break;
  }
};

// ============================================
// HANDLERS
// ============================================

function handleInit(
  nodes: SimulationNode[],
  links: SimulationLink[],
  mode: SimulationMode,
  epidemicParams: EpidemicParams,
  financialParams: FinancialParams
): void {
  // Stop any running simulation
  pauseSimulation();
  
  // Initialize engine
  engine.initialize(nodes, links, mode, epidemicParams, financialParams);
  
  // Send initial state
  sendTick();
}

function handleParams(
  epidemicParams?: Partial<EpidemicParams>,
  financialParams?: Partial<FinancialParams>
): void {
  if (epidemicParams) {
    engine.setEpidemicParams(epidemicParams);
  }
  if (financialParams) {
    engine.setFinancialParams(financialParams);
  }
}

function startSimulation(): void {
  if (isRunning) return;
  
  isRunning = true;
  const intervalMs = 1000 / tickRate;
  
  tickInterval = setInterval(() => {
    // Run tick
    const stats = engine.simulateTick();
    
    // Send update
    const tickMessage: WorkerTickMessage = {
      type: 'tick',
      nodes: engine.getNodes(),
      stats,
    };
    
    self.postMessage(tickMessage);
    
    // Check if simulation is complete
    if (engine.isComplete()) {
      pauseSimulation();
    }
  }, intervalMs);
}

function pauseSimulation(): void {
  isRunning = false;
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

function resetSimulation(): void {
  pauseSimulation();
  engine.reset();
  sendTick();
}

function stepSimulation(): void {
  if (isRunning) return;
  
  const stats = engine.simulateTick();
  
  const tickMessage: WorkerTickMessage = {
    type: 'tick',
    nodes: engine.getNodes(),
    stats,
  };
  
  self.postMessage(tickMessage);
}

function sendTick(): void {
  const stats = engine.calculateStats();
  
  const tickMessage: WorkerTickMessage = {
    type: 'tick',
    nodes: engine.getNodes(),
    stats,
  };
  
  self.postMessage(tickMessage);
}

// Export for TypeScript (worker context)
export {};
