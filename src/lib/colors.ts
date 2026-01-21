// ============================================
// COLOR UTILITIES
// Standard and color-blind safe palettes
// ============================================

import {
  EpidemicState,
  FinancialState,
  EPIDEMIC_COLORS,
  FINANCIAL_COLORS,
  EPIDEMIC_COLORS_CB,
  FINANCIAL_COLORS_CB,
} from '@/types';

export function getEpidemicColor(state: EpidemicState, colorBlind: boolean = false): string {
  return colorBlind ? EPIDEMIC_COLORS_CB[state] : EPIDEMIC_COLORS[state];
}

export function getFinancialColor(state: FinancialState, colorBlind: boolean = false): string {
  return colorBlind ? FINANCIAL_COLORS_CB[state] : FINANCIAL_COLORS[state];
}

export function getGlowColor(state: EpidemicState | FinancialState): string {
  switch (state) {
    case 'INFECTED':
    case 'DISTRESSED':
      return 'rgba(239, 68, 68, 0.6)';
    case 'STRESSED':
      return 'rgba(245, 158, 11, 0.5)';
    default:
      return 'transparent';
  }
}

export function shouldGlow(state: EpidemicState | FinancialState): boolean {
  return state === 'INFECTED' || state === 'STRESSED' || state === 'DISTRESSED';
}

// Link colors
export function getLinkColor(
  sourceState: EpidemicState | FinancialState,
  targetState: EpidemicState | FinancialState,
  mode: 'epidemic' | 'financial'
): string {
  const isActive = mode === 'epidemic'
    ? sourceState === 'INFECTED' || targetState === 'INFECTED'
    : sourceState === 'STRESSED' || targetState === 'STRESSED' ||
      sourceState === 'DISTRESSED' || targetState === 'DISTRESSED';
  
  return isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)';
}

// CSS variable generator for dynamic theming
export function generateColorVars(colorBlind: boolean): Record<string, string> {
  const epidemicColors = colorBlind ? EPIDEMIC_COLORS_CB : EPIDEMIC_COLORS;
  const financialColors = colorBlind ? FINANCIAL_COLORS_CB : FINANCIAL_COLORS;
  
  return {
    '--node-susceptible': epidemicColors.SUSCEPTIBLE,
    '--node-infected': epidemicColors.INFECTED,
    '--node-recovered': epidemicColors.RECOVERED,
    '--node-deceased': epidemicColors.DECEASED,
    '--node-vaccinated': epidemicColors.VACCINATED,
    '--node-healthy': financialColors.HEALTHY,
    '--node-stressed': financialColors.STRESSED,
    '--node-distressed': financialColors.DISTRESSED,
    '--node-defaulted': financialColors.DEFAULTED,
    '--node-bailedout': financialColors.BAILED_OUT,
  };
}
