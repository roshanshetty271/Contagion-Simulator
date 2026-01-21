'use client';

// ============================================
// EXPORT CONTROLS
// UI for exporting simulation data
// ============================================

import React, { useState } from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Button } from '../ui/Button';
import { Download, Share2, Save, FileJson, FileText, FileCode } from 'lucide-react';
import { 
  exportAsCSV, 
  exportAsJSON, 
  exportAsGraphML, 
  createExportData 
} from '@/lib/export';
import { 
  saveSimulationState, 
  loadSimulationState, 
  clearSimulationState 
} from '@/hooks/useLocalStorage';
import { useURLState } from '@/hooks/useURLState';
import { useToast } from '../ui/Toast';
import { logger } from '@/lib/logger';

export function ExportControls() {
  const {
    mode,
    topology,
    nodes,
    links,
    history,
    epidemicParams,
    financialParams,
  } = useSimulationStore();
  
  const { copyShareableURL } = useURLState();
  const { success, error: showError } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      exportAsCSV(history, mode);
      success('CSV exported successfully');
      logger.info('CSV export completed');
    } catch (error) {
      showError('Failed to export CSV', error instanceof Error ? error.message : undefined);
      logger.error('CSV export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const data = createExportData(
        mode,
        topology,
        nodes,
        links,
        history,
        epidemicParams,
        financialParams
      );
      exportAsJSON(data);
      success('JSON exported successfully');
      logger.info('JSON export completed');
    } catch (error) {
      showError('Failed to export JSON', error instanceof Error ? error.message : undefined);
      logger.error('JSON export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGraphML = async () => {
    try {
      setIsExporting(true);
      exportAsGraphML(nodes, links);
      success('GraphML exported successfully');
      logger.info('GraphML export completed');
    } catch (error) {
      showError('Failed to export GraphML', error instanceof Error ? error.message : undefined);
      logger.error('GraphML export failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveState = () => {
    try {
      const state = {
        mode,
        topology,
        nodeCount: nodes.length,
        linkDensity: useSimulationStore.getState().linkDensity,
        epidemicParams,
        financialParams,
        timestamp: new Date().toISOString(),
      };
      saveSimulationState(state);
      success('State saved to browser');
      logger.info('Simulation state saved');
    } catch (error) {
      showError('Failed to save state', error instanceof Error ? error.message : undefined);
      logger.error('Save state failed', error);
    }
  };

  const handleLoadState = () => {
    try {
      const state = loadSimulationState();
      if (state) {
        // Apply loaded state to store
        const store = useSimulationStore.getState();
        if (state.mode) store.setMode(state.mode);
        if (state.topology) store.setTopology(state.topology);
        if (state.nodeCount) store.setNodeCount(state.nodeCount);
        if (state.linkDensity) store.setLinkDensity(state.linkDensity);
        if (state.epidemicParams) store.setEpidemicParams(state.epidemicParams);
        if (state.financialParams) store.setFinancialParams(state.financialParams);
        
        success('State loaded successfully');
        logger.info('Simulation state loaded');
      } else {
        showError('No saved state found');
      }
    } catch (error) {
      showError('Failed to load state', error instanceof Error ? error.message : undefined);
      logger.error('Load state failed', error);
    }
  };

  const handleShareURL = async () => {
    try {
      const params = {
        mode,
        topology,
        nodeCount: nodes.length,
        linkDensity: useSimulationStore.getState().linkDensity,
        beta: epidemicParams.beta,
        gamma: epidemicParams.gamma,
        mu: epidemicParams.mu,
        leverageRatio: financialParams.leverageRatio,
        capitalBuffer: financialParams.capitalBuffer,
      };
      
      const copied = await copyShareableURL(params);
      if (copied) {
        success('Shareable link copied to clipboard');
        logger.info('Shareable URL copied');
      } else {
        showError('Failed to copy link');
      }
    } catch (error) {
      showError('Failed to generate shareable link', error instanceof Error ? error.message : undefined);
      logger.error('Share URL failed', error);
    }
  };

  const hasData = history.length > 0;

  return (
    <div className="p-4 border-t border-panel-border space-y-3">
      <h2 className="text-lg font-semibold text-white">Export & Share</h2>
      
      {/* Export options */}
      <div className="space-y-2">
        <p className="text-xs text-gray-400 mb-2">Export Data</p>
        
        <Button
          onClick={handleExportCSV}
          disabled={!hasData || isExporting}
          variant="outline"
          size="sm"
          className="w-full gap-2 justify-start"
        >
          <FileText className="w-4 h-4" />
          Export as CSV
        </Button>
        
        <Button
          onClick={handleExportJSON}
          disabled={!hasData || isExporting}
          variant="outline"
          size="sm"
          className="w-full gap-2 justify-start"
        >
          <FileJson className="w-4 h-4" />
          Export as JSON
        </Button>
        
        <Button
          onClick={handleExportGraphML}
          disabled={nodes.length === 0 || isExporting}
          variant="outline"
          size="sm"
          className="w-full gap-2 justify-start"
        >
          <FileCode className="w-4 h-4" />
          Export Network (GraphML)
        </Button>
      </div>
      
      {/* State management */}
      <div className="space-y-2 pt-3 border-t border-panel-border/50">
        <p className="text-xs text-gray-400 mb-2">Save & Load</p>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleSaveState}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          
          <Button
            onClick={handleLoadState}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Load
          </Button>
        </div>
      </div>
      
      {/* Share */}
      <div className="pt-3 border-t border-panel-border/50">
        <Button
          onClick={handleShareURL}
          variant="outline"
          size="sm"
          className="w-full gap-2 justify-start"
        >
          <Share2 className="w-4 h-4" />
          Copy Shareable Link
        </Button>
      </div>
    </div>
  );
}
