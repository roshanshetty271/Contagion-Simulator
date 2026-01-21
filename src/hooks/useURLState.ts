// ============================================
// URL STATE HOOK
// Share simulation state via URL parameters
// ============================================

import { useCallback, useEffect, useState } from 'react';
import { SimulationMode, NetworkTopology, EpidemicParams, FinancialParams } from '@/types';
import { logger } from '@/lib/logger';

export interface URLStateParams {
  mode?: SimulationMode;
  topology?: NetworkTopology;
  nodeCount?: number;
  linkDensity?: number;
  beta?: number;
  gamma?: number;
  mu?: number;
  leverageRatio?: number;
  capitalBuffer?: number;
}

/**
 * Parse URL parameters into state
 */
export function parseURLParams(): URLStateParams | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const state: URLStateParams = {};

    // Mode
    const mode = params.get('mode');
    if (mode === 'epidemic' || mode === 'financial') {
      state.mode = mode;
    }

    // Topology
    const topology = params.get('topology');
    if (topology === 'scale-free' || topology === 'small-world' || topology === 'random') {
      state.topology = topology;
    }

    // Network parameters
    const nodeCount = params.get('nodeCount');
    if (nodeCount) state.nodeCount = parseInt(nodeCount, 10);

    const linkDensity = params.get('linkDensity');
    if (linkDensity) state.linkDensity = parseFloat(linkDensity);

    // Epidemic parameters
    const beta = params.get('beta');
    if (beta) state.beta = parseFloat(beta);

    const gamma = params.get('gamma');
    if (gamma) state.gamma = parseFloat(gamma);

    const mu = params.get('mu');
    if (mu) state.mu = parseFloat(mu);

    // Financial parameters
    const leverageRatio = params.get('leverageRatio');
    if (leverageRatio) state.leverageRatio = parseFloat(leverageRatio);

    const capitalBuffer = params.get('capitalBuffer');
    if (capitalBuffer) state.capitalBuffer = parseFloat(capitalBuffer);

    return Object.keys(state).length > 0 ? state : null;
  } catch (error) {
    logger.error('Error parsing URL parameters', error);
    return null;
  }
}

/**
 * Generate shareable URL with current state
 */
export function generateShareableURL(params: URLStateParams): string {
  if (typeof window === 'undefined') return '';

  const urlParams = new URLSearchParams();

  if (params.mode) urlParams.set('mode', params.mode);
  if (params.topology) urlParams.set('topology', params.topology);
  if (params.nodeCount) urlParams.set('nodeCount', params.nodeCount.toString());
  if (params.linkDensity) urlParams.set('linkDensity', params.linkDensity.toString());
  if (params.beta) urlParams.set('beta', params.beta.toString());
  if (params.gamma) urlParams.set('gamma', params.gamma.toString());
  if (params.mu) urlParams.set('mu', params.mu.toString());
  if (params.leverageRatio) urlParams.set('leverageRatio', params.leverageRatio.toString());
  if (params.capitalBuffer) urlParams.set('capitalBuffer', params.capitalBuffer.toString());

  const baseUrl = window.location.origin + window.location.pathname;
  const queryString = urlParams.toString();

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Copy URL to clipboard
 */
export async function copyURLToClipboard(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    logger.info('URL copied to clipboard');
    return true;
  } catch (error) {
    logger.error('Failed to copy URL to clipboard', error);
    return false;
  }
}

/**
 * Hook to manage URL state
 */
export function useURLState() {
  const [urlParams, setURLParams] = useState<URLStateParams | null>(null);

  useEffect(() => {
    const params = parseURLParams();
    if (params) {
      setURLParams(params);
      logger.info('URL parameters loaded', params);
    }
  }, []);

  const updateURL = useCallback((params: URLStateParams) => {
    const url = generateShareableURL(params);
    window.history.replaceState({}, '', url);
    setURLParams(params);
    logger.debug('URL updated', params);
  }, []);

  const copyShareableURL = useCallback(async (params: URLStateParams) => {
    const url = generateShareableURL(params);
    return await copyURLToClipboard(url);
  }, []);

  return {
    urlParams,
    updateURL,
    copyShareableURL,
    generateShareableURL,
  };
}
