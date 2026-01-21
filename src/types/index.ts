// ============================================
// CONTAGION SIMULATOR - TYPE DEFINITIONS
// ============================================

// Simulation Modes
export type SimulationMode = 'epidemic' | 'financial';

// Network Topologies
export type NetworkTopology = 'scale-free' | 'small-world' | 'random';

// ============================================
// EPIDEMIC MODE TYPES
// ============================================

export type EpidemicState = 
  | 'SUSCEPTIBLE' 
  | 'INFECTED' 
  | 'RECOVERED' 
  | 'DECEASED' 
  | 'VACCINATED';

export interface EpidemicParams {
  beta: number;           // Infection rate (0-1)
  gamma: number;          // Recovery rate (0-1)
  mu: number;             // Mortality rate (0-1)
  vaccinationRate: number; // % of population vaccinated (0-1)
  immunityDuration: number; // Ticks until immunity wanes (0 = permanent)
}

export const DEFAULT_EPIDEMIC_PARAMS: EpidemicParams = {
  beta: 0.3,
  gamma: 0.1,
  mu: 0.02,
  vaccinationRate: 0,
  immunityDuration: 0,
};

// ============================================
// FINANCIAL MODE TYPES
// ============================================

export type FinancialState = 
  | 'HEALTHY' 
  | 'STRESSED' 
  | 'DISTRESSED' 
  | 'DEFAULTED' 
  | 'BAILED_OUT';

export interface FinancialParams {
  leverageRatio: number;     // Debt/Equity ratio (5-25)
  capitalBuffer: number;     // Capital buffer % (0.03-0.15)
  correlationFactor: number; // Asset correlation (0-1)
  fireSaleDiscount: number;  // Fire sale price impact (0-0.5)
  bailoutThreshold: number;  // Size threshold for bailout (0-1)
}

export const DEFAULT_FINANCIAL_PARAMS: FinancialParams = {
  leverageRatio: 10,
  capitalBuffer: 0.08,
  correlationFactor: 0.3,
  fireSaleDiscount: 0.2,
  bailoutThreshold: 0.5,
};

// ============================================
// NODE & LINK TYPES
// ============================================

export interface SimulationNode {
  id: string;
  index: number;
  
  // D3 force simulation properties
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
  
  // Network properties
  degree: number;
  neighbors: string[];
  
  // State (depends on mode)
  epidemicState: EpidemicState;
  financialState: FinancialState;
  
  // Financial-specific
  assets: number;
  liabilities: number;
  capitalRatio: number;
  
  // Tracking
  infectedAt?: number;
  recoveredAt?: number;
  stressedAt?: number;
  
  // Visual
  radius: number;
}

export interface SimulationLink {
  id: string;
  source: string | SimulationNode;
  sourceId: string;
  target: string | SimulationNode;
  targetId: string;
  weight: number;
  
  // Financial-specific: exposure amount
  exposure: number;
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface EpidemicStats {
  susceptible: number;
  infected: number;
  recovered: number;
  deceased: number;
  vaccinated: number;
  r0: number; // Basic reproduction number
  peakInfected: number;
  totalInfected: number;
}

export interface FinancialStats {
  healthy: number;
  stressed: number;
  distressed: number;
  defaulted: number;
  bailedOut: number;
  systemicRisk: number; // % of system at risk
  totalLosses: number;
  cascadeDepth: number;
}

export interface SimulationStats {
  epidemic: EpidemicStats;
  financial: FinancialStats;
  tick: number;
  elapsedMs: number;
}

export const INITIAL_EPIDEMIC_STATS: EpidemicStats = {
  susceptible: 0,
  infected: 0,
  recovered: 0,
  deceased: 0,
  vaccinated: 0,
  r0: 0,
  peakInfected: 0,
  totalInfected: 0,
};

export const INITIAL_FINANCIAL_STATS: FinancialStats = {
  healthy: 0,
  stressed: 0,
  distressed: 0,
  defaulted: 0,
  bailedOut: 0,
  systemicRisk: 0,
  totalLosses: 0,
  cascadeDepth: 0,
};

// ============================================
// SIMULATION STATE
// ============================================

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'complete';

export interface SimulationState {
  // Network data
  nodes: SimulationNode[];
  links: SimulationLink[];
  
  // Configuration
  mode: SimulationMode;
  topology: NetworkTopology;
  nodeCount: number;
  linkDensity: number;
  
  // Parameters
  epidemicParams: EpidemicParams;
  financialParams: FinancialParams;
  tickRate: number; // Simulation updates per second
  
  // Runtime state
  tick: number;
  playbackState: PlaybackState;
  isLoading: boolean;
  
  // Statistics
  stats: SimulationStats;
  
  // History for timeline
  history: SimulationStats[];
  
  // UI state
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  colorBlindMode: boolean;
  
  // Zoom/pan
  transform: { x: number; y: number; k: number };
}

// ============================================
// WORKER MESSAGE TYPES
// ============================================

export interface WorkerInitMessage {
  type: 'init';
  nodes: SimulationNode[];
  links: SimulationLink[];
  mode: SimulationMode;
  epidemicParams: EpidemicParams;
  financialParams: FinancialParams;
}

export interface WorkerTickMessage {
  type: 'tick';
  nodes: Pick<SimulationNode, 'id' | 'epidemicState' | 'financialState' | 'capitalRatio'>[];
  stats: SimulationStats;
}

export interface WorkerParamsMessage {
  type: 'params';
  epidemicParams?: Partial<EpidemicParams>;
  financialParams?: Partial<FinancialParams>;
}

export interface WorkerActionMessage {
  type: 'infect' | 'shock' | 'vaccinate' | 'bailout';
  nodeId: string;
  magnitude?: number;
}

export interface WorkerControlMessage {
  type: 'start' | 'pause' | 'reset' | 'step';
  tickRate?: number;
}

export type WorkerIncomingMessage = 
  | WorkerInitMessage 
  | WorkerParamsMessage 
  | WorkerActionMessage 
  | WorkerControlMessage;

export type WorkerOutgoingMessage = WorkerTickMessage;

// ============================================
// PRESET TYPES
// ============================================

export interface DemoPreset {
  id: string;
  name: string;
  description: string;
  mode: SimulationMode;
  topology: NetworkTopology;
  nodeCount: number;
  linkDensity: number;
  epidemicParams?: Partial<EpidemicParams>;
  financialParams?: Partial<FinancialParams>;
  initialAction?: {
    type: 'infect' | 'shock';
    target: 'highest-degree' | 'random' | 'specific';
    nodeId?: string;
    magnitude?: number;
  };
}

// ============================================
// ACCESSIBILITY TYPES
// ============================================

export interface AccessibilitySettings {
  colorBlindMode: boolean;
  reducedMotion: boolean;
  announceStats: boolean;
}

// ============================================
// COLOR MAPS
// ============================================

export const EPIDEMIC_COLORS: Record<EpidemicState, string> = {
  SUSCEPTIBLE: '#3b82f6',
  INFECTED: '#ef4444',
  RECOVERED: '#22c55e',
  DECEASED: '#6b7280',
  VACCINATED: '#a855f7',
};

export const FINANCIAL_COLORS: Record<FinancialState, string> = {
  HEALTHY: '#3b82f6',
  STRESSED: '#f59e0b',
  DISTRESSED: '#ef4444',
  DEFAULTED: '#6b7280',
  BAILED_OUT: '#a855f7',
};

export const EPIDEMIC_COLORS_CB: Record<EpidemicState, string> = {
  SUSCEPTIBLE: '#4477AA',
  INFECTED: '#EE6677',
  RECOVERED: '#228833',
  DECEASED: '#BBBBBB',
  VACCINATED: '#AA3377',
};

export const FINANCIAL_COLORS_CB: Record<FinancialState, string> = {
  HEALTHY: '#4477AA',
  STRESSED: '#CCBB44',
  DISTRESSED: '#EE6677',
  DEFAULTED: '#BBBBBB',
  BAILED_OUT: '#AA3377',
};

// ============================================
// STORE ACTIONS TYPE
// ============================================

export interface SimulationActions {
  // Mode & topology
  setMode: (mode: SimulationMode) => void;
  setTopology: (topology: NetworkTopology) => void;
  setNodeCount: (count: number) => void;
  setLinkDensity: (density: number) => void;
  
  // Parameters
  setEpidemicParams: (params: Partial<EpidemicParams>) => void;
  setFinancialParams: (params: Partial<FinancialParams>) => void;
  setTickRate: (rate: number) => void;
  
  // Network generation
  regenerateNetwork: () => void;
  
  // Node actions
  infectNode: (nodeId: string) => void;
  shockNode: (nodeId: string, magnitude: number) => void;
  vaccinateNode: (nodeId: string) => void;
  bailoutNode: (nodeId: string) => void;
  
  // Playback
  play: () => void;
  pause: () => void;
  reset: () => void;
  step: () => void;
  
  // UI
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  setColorBlindMode: (enabled: boolean) => void;
  setTransform: (transform: { x: number; y: number; k: number }) => void;
  
  // Worker sync
  updateFromWorker: (message: WorkerTickMessage) => void;
  setLoading: (loading: boolean) => void;
  
  // Presets
  applyPreset: (preset: DemoPreset) => void;
}

export type SimulationStore = SimulationState & SimulationActions;
