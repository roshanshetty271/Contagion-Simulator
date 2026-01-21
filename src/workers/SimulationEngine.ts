// ============================================
// SIMULATION ENGINE
// Core state transition logic for epidemic and financial models
// Runs in WebWorker for performance
// ============================================

import {
  SimulationNode,
  SimulationLink,
  SimulationMode,
  EpidemicParams,
  FinancialParams,
  EpidemicState,
  FinancialState,
  SimulationStats,
  INITIAL_EPIDEMIC_STATS,
  INITIAL_FINANCIAL_STATS,
} from '@/types';

export class SimulationEngine {
  private nodes: SimulationNode[] = [];
  private links: SimulationLink[] = [];
  private mode: SimulationMode = 'epidemic';
  private epidemicParams: EpidemicParams;
  private financialParams: FinancialParams;
  private tick: number = 0;
  private startTime: number = 0;
  
  // Neighbor lookup for fast access
  private neighborMap: Map<string, string[]> = new Map();
  private linkMap: Map<string, SimulationLink[]> = new Map();
  
  // Stats tracking
  private peakInfected: number = 0;
  private totalInfected: number = 0;
  private cascadeDepth: number = 0;
  private totalLosses: number = 0;
  
  constructor() {
    this.epidemicParams = {
      beta: 0.3,
      gamma: 0.1,
      mu: 0.02,
      vaccinationRate: 0,
      immunityDuration: 0,
    };
    this.financialParams = {
      leverageRatio: 10,
      capitalBuffer: 0.08,
      correlationFactor: 0.3,
      fireSaleDiscount: 0.2,
      bailoutThreshold: 0.5,
    };
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  
  initialize(
    nodes: SimulationNode[],
    links: SimulationLink[],
    mode: SimulationMode,
    epidemicParams: EpidemicParams,
    financialParams: FinancialParams
  ): void {
    this.nodes = nodes.map(n => ({ ...n }));
    this.links = links.map(l => ({ ...l }));
    this.mode = mode;
    this.epidemicParams = { ...epidemicParams };
    this.financialParams = { ...financialParams };
    this.tick = 0;
    this.startTime = Date.now();
    this.peakInfected = 0;
    this.totalInfected = 0;
    this.cascadeDepth = 0;
    this.totalLosses = 0;
    
    // Build neighbor lookup
    this.buildNeighborMap();
    this.buildLinkMap();
  }

  private buildNeighborMap(): void {
    this.neighborMap.clear();
    
    // Initialize empty arrays for all nodes
    this.nodes.forEach(node => {
      this.neighborMap.set(node.id, []);
    });
    
    // Add neighbors from links
    this.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.sourceId;
      const targetId = typeof link.target === 'string' ? link.target : link.targetId;
      
      const sourceNeighbors = this.neighborMap.get(sourceId) || [];
      const targetNeighbors = this.neighborMap.get(targetId) || [];
      
      if (!sourceNeighbors.includes(targetId)) {
        sourceNeighbors.push(targetId);
      }
      if (!targetNeighbors.includes(sourceId)) {
        targetNeighbors.push(sourceId);
      }
      
      this.neighborMap.set(sourceId, sourceNeighbors);
      this.neighborMap.set(targetId, targetNeighbors);
    });
  }

  private buildLinkMap(): void {
    this.linkMap.clear();
    
    this.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.sourceId;
      const targetId = typeof link.target === 'string' ? link.target : link.targetId;
      
      const sourceLinks = this.linkMap.get(sourceId) || [];
      const targetLinks = this.linkMap.get(targetId) || [];
      
      sourceLinks.push(link);
      targetLinks.push(link);
      
      this.linkMap.set(sourceId, sourceLinks);
      this.linkMap.set(targetId, targetLinks);
    });
  }

  // ============================================
  // PARAMETER UPDATES
  // ============================================
  
  setEpidemicParams(params: Partial<EpidemicParams>): void {
    this.epidemicParams = { ...this.epidemicParams, ...params };
  }

  setFinancialParams(params: Partial<FinancialParams>): void {
    this.financialParams = { ...this.financialParams, ...params };
  }

  // ============================================
  // NODE ACTIONS
  // ============================================
  
  infectNode(nodeId: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && node.epidemicState === 'SUSCEPTIBLE') {
      node.epidemicState = 'INFECTED';
      node.infectedAt = this.tick;
      this.totalInfected++;
    }
  }

  shockNode(nodeId: string, magnitude: number): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && node.financialState === 'HEALTHY') {
      node.capitalRatio *= (1 - magnitude);
      this.updateFinancialState(node);
      node.stressedAt = this.tick;
    }
  }

  vaccinateNode(nodeId: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && node.epidemicState === 'SUSCEPTIBLE') {
      node.epidemicState = 'VACCINATED';
    }
  }

  bailoutNode(nodeId: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node && (node.financialState === 'DISTRESSED' || node.financialState === 'STRESSED')) {
      node.financialState = 'BAILED_OUT';
      node.capitalRatio = 0.1; // Restore capital
    }
  }

  // ============================================
  // SIMULATION TICK
  // ============================================
  
  simulateTick(): SimulationStats {
    this.tick++;
    
    if (this.mode === 'epidemic') {
      this.simulateEpidemicTick();
    } else {
      this.simulateFinancialTick();
    }
    
    return this.calculateStats();
  }

  // ============================================
  // EPIDEMIC MODEL (SIR+)
  // ============================================
  
  private simulateEpidemicTick(): void {
    const { beta, gamma, mu, immunityDuration } = this.epidemicParams;
    
    // Collect state changes to apply atomically
    const stateChanges: { nodeId: string; newState: EpidemicState }[] = [];
    
    this.nodes.forEach(node => {
      switch (node.epidemicState) {
        case 'SUSCEPTIBLE':
          // Check if infected by neighbors
          const infectionProb = this.calculateInfectionProbability(node, beta);
          if (Math.random() < infectionProb) {
            stateChanges.push({ nodeId: node.id, newState: 'INFECTED' });
          }
          break;
          
        case 'INFECTED':
          // Check for recovery or death
          if (Math.random() < mu) {
            stateChanges.push({ nodeId: node.id, newState: 'DECEASED' });
          } else if (Math.random() < gamma) {
            stateChanges.push({ nodeId: node.id, newState: 'RECOVERED' });
          }
          break;
          
        case 'RECOVERED':
          // Check for immunity waning
          if (immunityDuration > 0 && node.recoveredAt) {
            const ticksSinceRecovery = this.tick - node.recoveredAt;
            if (ticksSinceRecovery >= immunityDuration) {
              stateChanges.push({ nodeId: node.id, newState: 'SUSCEPTIBLE' });
            }
          }
          break;
          
        case 'VACCINATED':
        case 'DECEASED':
          // No state changes
          break;
      }
    });
    
    // Apply state changes
    stateChanges.forEach(({ nodeId, newState }) => {
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        if (newState === 'INFECTED' && node.epidemicState === 'SUSCEPTIBLE') {
          this.totalInfected++;
          node.infectedAt = this.tick;
        }
        if (newState === 'RECOVERED') {
          node.recoveredAt = this.tick;
        }
        node.epidemicState = newState;
      }
    });
    
    // Track peak infected
    const currentInfected = this.nodes.filter(n => n.epidemicState === 'INFECTED').length;
    if (currentInfected > this.peakInfected) {
      this.peakInfected = currentInfected;
    }
  }

  private calculateInfectionProbability(node: SimulationNode, beta: number): number {
    const neighbors = this.neighborMap.get(node.id) || [];
    if (neighbors.length === 0) return 0;
    
    // Count infected neighbors
    let infectedNeighbors = 0;
    neighbors.forEach(neighborId => {
      const neighbor = this.nodes.find(n => n.id === neighborId);
      if (neighbor && neighbor.epidemicState === 'INFECTED') {
        infectedNeighbors++;
      }
    });
    
    if (infectedNeighbors === 0) return 0;
    
    // Probability of infection from any infected neighbor
    // P = 1 - (1 - beta)^infectedNeighbors
    return 1 - Math.pow(1 - beta, infectedNeighbors);
  }

  // ============================================
  // FINANCIAL MODEL (Systemic Risk)
  // ============================================
  
  private simulateFinancialTick(): void {
    const { capitalBuffer, correlationFactor, fireSaleDiscount, bailoutThreshold } = this.financialParams;
    
    // Collect state changes
    const stateChanges: { nodeId: string; newState: FinancialState; capitalRatio?: number }[] = [];
    
    // Phase 1: Direct exposure losses
    this.nodes.forEach(node => {
      if (node.financialState === 'HEALTHY' || node.financialState === 'STRESSED') {
        const losses = this.calculateDirectExposureLosses(node);
        if (losses > 0) {
          const newCapitalRatio = node.capitalRatio - (losses / node.assets);
          const newState = this.determineFinancialState(newCapitalRatio, capitalBuffer);
          
          if (newState !== node.financialState) {
            stateChanges.push({ nodeId: node.id, newState, capitalRatio: newCapitalRatio });
          }
        }
      }
    });
    
    // Apply phase 1 changes
    stateChanges.forEach(({ nodeId, newState, capitalRatio }) => {
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        node.financialState = newState;
        if (capitalRatio !== undefined) {
          node.capitalRatio = capitalRatio;
        }
        if (newState === 'STRESSED' || newState === 'DISTRESSED') {
          node.stressedAt = this.tick;
        }
      }
    });
    stateChanges.length = 0;
    
    // Phase 2: Fire sale contagion
    const distressedCount = this.nodes.filter(n => 
      n.financialState === 'DISTRESSED' || n.financialState === 'DEFAULTED'
    ).length;
    
    if (distressedCount > 0) {
      const fireSaleImpact = fireSaleDiscount * correlationFactor * (distressedCount / this.nodes.length);
      
      this.nodes.forEach(node => {
        if (node.financialState === 'HEALTHY' || node.financialState === 'STRESSED') {
          // Mark-to-market losses from correlated assets
          const newCapitalRatio = node.capitalRatio - fireSaleImpact;
          const newState = this.determineFinancialState(newCapitalRatio, capitalBuffer);
          
          if (newState !== node.financialState) {
            stateChanges.push({ nodeId: node.id, newState, capitalRatio: newCapitalRatio });
          }
        }
      });
    }
    
    // Apply phase 2 changes
    stateChanges.forEach(({ nodeId, newState, capitalRatio }) => {
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        node.financialState = newState;
        if (capitalRatio !== undefined) {
          node.capitalRatio = capitalRatio;
        }
        this.cascadeDepth = Math.max(this.cascadeDepth, this.tick);
      }
    });
    stateChanges.length = 0;
    
    // Phase 3: Check for bailouts
    this.nodes.forEach(node => {
      if (node.financialState === 'DISTRESSED') {
        // Check if node is "too big to fail"
        const nodeSize = node.assets / this.nodes.reduce((sum, n) => sum + n.assets, 0);
        if (nodeSize >= bailoutThreshold) {
          stateChanges.push({ nodeId: node.id, newState: 'BAILED_OUT', capitalRatio: 0.1 });
        } else {
          // Default
          stateChanges.push({ nodeId: node.id, newState: 'DEFAULTED' });
          this.totalLosses += node.assets;
        }
      }
    });
    
    // Apply phase 3 changes
    stateChanges.forEach(({ nodeId, newState, capitalRatio }) => {
      const node = this.nodes.find(n => n.id === nodeId);
      if (node) {
        node.financialState = newState;
        if (capitalRatio !== undefined) {
          node.capitalRatio = capitalRatio;
        }
      }
    });
  }

  private calculateDirectExposureLosses(node: SimulationNode): number {
    const links = this.linkMap.get(node.id) || [];
    let losses = 0;
    
    links.forEach(link => {
      const otherNodeId = link.sourceId === node.id ? link.targetId : link.sourceId;
      const otherNode = this.nodes.find(n => n.id === otherNodeId);
      
      if (otherNode && (otherNode.financialState === 'DEFAULTED' || otherNode.financialState === 'DISTRESSED')) {
        // Loss proportional to exposure
        losses += link.exposure * (otherNode.financialState === 'DEFAULTED' ? 1 : 0.5);
      }
    });
    
    return losses;
  }

  private determineFinancialState(capitalRatio: number, buffer: number): FinancialState {
    if (capitalRatio < 0) return 'DISTRESSED';
    if (capitalRatio < buffer * 0.5) return 'DISTRESSED';
    if (capitalRatio < buffer) return 'STRESSED';
    return 'HEALTHY';
  }

  private updateFinancialState(node: SimulationNode): void {
    const { capitalBuffer } = this.financialParams;
    node.financialState = this.determineFinancialState(node.capitalRatio, capitalBuffer);
  }

  // ============================================
  // STATISTICS
  // ============================================
  
  calculateStats(): SimulationStats {
    const epidemicCounts = {
      susceptible: 0,
      infected: 0,
      recovered: 0,
      deceased: 0,
      vaccinated: 0,
    };
    
    const financialCounts = {
      healthy: 0,
      stressed: 0,
      distressed: 0,
      defaulted: 0,
      bailedOut: 0,
    };
    
    this.nodes.forEach(node => {
      // Epidemic counts
      switch (node.epidemicState) {
        case 'SUSCEPTIBLE': epidemicCounts.susceptible++; break;
        case 'INFECTED': epidemicCounts.infected++; break;
        case 'RECOVERED': epidemicCounts.recovered++; break;
        case 'DECEASED': epidemicCounts.deceased++; break;
        case 'VACCINATED': epidemicCounts.vaccinated++; break;
      }
      
      // Financial counts
      switch (node.financialState) {
        case 'HEALTHY': financialCounts.healthy++; break;
        case 'STRESSED': financialCounts.stressed++; break;
        case 'DISTRESSED': financialCounts.distressed++; break;
        case 'DEFAULTED': financialCounts.defaulted++; break;
        case 'BAILED_OUT': financialCounts.bailedOut++; break;
      }
    });
    
    // Calculate R0 (basic reproduction number)
    const r0 = this.calculateR0();
    
    // Calculate systemic risk
    const atRisk = financialCounts.stressed + financialCounts.distressed + financialCounts.defaulted;
    const systemicRisk = this.nodes.length > 0 ? atRisk / this.nodes.length : 0;
    
    return {
      epidemic: {
        ...epidemicCounts,
        r0,
        peakInfected: this.peakInfected,
        totalInfected: this.totalInfected,
      },
      financial: {
        ...financialCounts,
        systemicRisk,
        totalLosses: this.totalLosses,
        cascadeDepth: this.cascadeDepth,
      },
      tick: this.tick,
      elapsedMs: Date.now() - this.startTime,
    };
  }

  private calculateR0(): number {
    // Simplified R0 calculation based on current state
    const infected = this.nodes.filter(n => n.epidemicState === 'INFECTED').length;
    const recovered = this.nodes.filter(n => n.epidemicState === 'RECOVERED').length;
    const deceased = this.nodes.filter(n => n.epidemicState === 'DECEASED').length;
    
    if (recovered + deceased === 0) {
      // Early in epidemic, estimate from parameters
      const avgDegree = this.nodes.reduce((sum, n) => sum + n.degree, 0) / this.nodes.length;
      return this.epidemicParams.beta * avgDegree / this.epidemicParams.gamma;
    }
    
    // Estimate from actual spread
    return this.totalInfected / Math.max(1, recovered + deceased);
  }

  // ============================================
  // RESET
  // ============================================
  
  reset(): void {
    this.tick = 0;
    this.startTime = Date.now();
    this.peakInfected = 0;
    this.totalInfected = 0;
    this.cascadeDepth = 0;
    this.totalLosses = 0;
    
    // Reset all nodes to initial state
    this.nodes.forEach(node => {
      node.epidemicState = 'SUSCEPTIBLE';
      node.financialState = 'HEALTHY';
      node.capitalRatio = 0.1 + Math.random() * 0.05;
      delete node.infectedAt;
      delete node.recoveredAt;
      delete node.stressedAt;
    });
  }

  // ============================================
  // GETTERS
  // ============================================
  
  getNodes(): Pick<SimulationNode, 'id' | 'epidemicState' | 'financialState' | 'capitalRatio'>[] {
    return this.nodes.map(n => ({
      id: n.id,
      epidemicState: n.epidemicState,
      financialState: n.financialState,
      capitalRatio: n.capitalRatio,
    }));
  }

  getTick(): number {
    return this.tick;
  }

  isComplete(): boolean {
    if (this.mode === 'epidemic') {
      const infected = this.nodes.filter(n => n.epidemicState === 'INFECTED').length;
      return infected === 0 && this.tick > 0;
    } else {
      const active = this.nodes.filter(n => 
        n.financialState === 'STRESSED' || n.financialState === 'DISTRESSED'
      ).length;
      return active === 0 && this.tick > 0;
    }
  }
}
