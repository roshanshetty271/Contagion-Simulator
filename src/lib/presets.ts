// ============================================
// DEMO PRESETS
// Deterministic scenarios for impressive demos
// ============================================

import { DemoPreset } from '@/types';

export const DEMO_PRESETS: DemoPreset[] = [
  // ============================================
  // EPIDEMIC PRESETS
  // ============================================
  {
    id: 'dramatic-outbreak',
    name: 'Dramatic Outbreak',
    description: 'High infection rate, patient zero is a super-spreader. Watch the epidemic explode.',
    mode: 'epidemic',
    topology: 'scale-free',
    nodeCount: 150,
    linkDensity: 0.5,
    epidemicParams: {
      beta: 0.5,      // High infection rate
      gamma: 0.08,    // Slow recovery
      mu: 0.03,       // Moderate mortality
      vaccinationRate: 0,
      immunityDuration: 0,
    },
    initialAction: {
      type: 'infect',
      target: 'highest-degree',
    },
  },
  {
    id: 'herd-immunity',
    name: 'Herd Immunity',
    description: '65% vaccination stops the outbreak. Compare with no vaccination.',
    mode: 'epidemic',
    topology: 'small-world',
    nodeCount: 150,
    linkDensity: 0.5,
    epidemicParams: {
      beta: 0.4,
      gamma: 0.1,
      mu: 0.02,
      vaccinationRate: 0.65,
      immunityDuration: 0,
    },
    initialAction: {
      type: 'infect',
      target: 'random',
    },
  },
  {
    id: 'slow-burn',
    name: 'Slow Burn',
    description: 'Low infection rate spreads slowly through a dense network.',
    mode: 'epidemic',
    topology: 'small-world',
    nodeCount: 200,
    linkDensity: 0.7,
    epidemicParams: {
      beta: 0.15,
      gamma: 0.05,
      mu: 0.01,
      vaccinationRate: 0,
      immunityDuration: 0,
    },
    initialAction: {
      type: 'infect',
      target: 'random',
    },
  },
  {
    id: 'rapid-recovery',
    name: 'Rapid Recovery',
    description: 'Fast recovery rate limits outbreak despite high infection.',
    mode: 'epidemic',
    topology: 'random',
    nodeCount: 120,
    linkDensity: 0.4,
    epidemicParams: {
      beta: 0.6,
      gamma: 0.4,   // Very fast recovery
      mu: 0.01,
      vaccinationRate: 0,
      immunityDuration: 0,
    },
    initialAction: {
      type: 'infect',
      target: 'highest-degree',
    },
  },
  
  // ============================================
  // FINANCIAL PRESETS
  // ============================================
  {
    id: 'too-big-to-fail',
    name: 'Too Big to Fail',
    description: 'Shock the largest bank. Watch systemic collapse cascade through the network.',
    mode: 'financial',
    topology: 'scale-free',
    nodeCount: 100,
    linkDensity: 0.5,
    financialParams: {
      leverageRatio: 15,        // High leverage
      capitalBuffer: 0.06,     // Low buffer
      correlationFactor: 0.4,  // Moderate correlation
      fireSaleDiscount: 0.25,  // Significant fire sale impact
      bailoutThreshold: 1.0,   // No bailouts
    },
    initialAction: {
      type: 'shock',
      target: 'highest-degree',
      magnitude: 0.6,
    },
  },
  {
    id: 'bailout-intervention',
    name: 'Bailout Intervention',
    description: 'Same shock as "Too Big to Fail" but bailouts prevent cascade.',
    mode: 'financial',
    topology: 'scale-free',
    nodeCount: 100,
    linkDensity: 0.5,
    financialParams: {
      leverageRatio: 15,
      capitalBuffer: 0.06,
      correlationFactor: 0.4,
      fireSaleDiscount: 0.25,
      bailoutThreshold: 0.3,   // Bailout large institutions
    },
    initialAction: {
      type: 'shock',
      target: 'highest-degree',
      magnitude: 0.6,
    },
  },
  {
    id: 'isolated-failure',
    name: 'Isolated Failure',
    description: 'Low correlation means failures stay contained.',
    mode: 'financial',
    topology: 'random',
    nodeCount: 80,
    linkDensity: 0.3,
    financialParams: {
      leverageRatio: 10,
      capitalBuffer: 0.08,
      correlationFactor: 0.1,  // Low correlation
      fireSaleDiscount: 0.15,
      bailoutThreshold: 1.0,
    },
    initialAction: {
      type: 'shock',
      target: 'random',
      magnitude: 0.5,
    },
  },
  {
    id: 'contagion-cascade',
    name: 'Contagion Cascade',
    description: 'High correlation + fire sales = rapid system-wide collapse.',
    mode: 'financial',
    topology: 'small-world',
    nodeCount: 120,
    linkDensity: 0.6,
    financialParams: {
      leverageRatio: 12,
      capitalBuffer: 0.05,
      correlationFactor: 0.7,  // High correlation
      fireSaleDiscount: 0.35,  // Severe fire sales
      bailoutThreshold: 1.0,
    },
    initialAction: {
      type: 'shock',
      target: 'random',
      magnitude: 0.4,
    },
  },
];

export function getPresetsByMode(mode: 'epidemic' | 'financial'): DemoPreset[] {
  return DEMO_PRESETS.filter(p => p.mode === mode);
}

export function getPresetById(id: string): DemoPreset | undefined {
  return DEMO_PRESETS.find(p => p.id === id);
}
