// ============================================
// HEADER COMPONENT
// Top navigation with mode switch
// ============================================

'use client';

import React from 'react';
import { Activity, Building2, Github, Keyboard } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { cn } from '@/lib/utils';

export function Header() {
  const mode = useSimulationStore(state => state.mode);
  const setMode = useSimulationStore(state => state.setMode);
  
  return (
    <header className="h-14 border-b border-panel-border bg-panel flex items-center justify-between px-4">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white leading-tight">
            Contagion Simulator
          </h1>
          <p className="text-xs text-gray-500 leading-tight">
            Network Cascade Visualization
          </p>
        </div>
      </div>
      
      {/* Mode Switch */}
      <div className="flex items-center gap-1 p-1 bg-canvas rounded-lg">
        <button
          onClick={() => setMode('epidemic')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
            mode === 'epidemic'
              ? 'bg-red-500/20 text-red-400 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          )}
        >
          <Activity className="w-4 h-4" />
          <span>Epidemic</span>
          <kbd className="hidden sm:inline-block text-xs px-1.5 py-0.5 rounded bg-canvas-lighter text-gray-500">1</kbd>
        </button>
        <button
          onClick={() => setMode('financial')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
            mode === 'financial'
              ? 'bg-amber-500/20 text-amber-400 shadow-sm'
              : 'text-gray-400 hover:text-gray-200'
          )}
        >
          <Building2 className="w-4 h-4" />
          <span>Financial</span>
          <kbd className="hidden sm:inline-block text-xs px-1.5 py-0.5 rounded bg-canvas-lighter text-gray-500">2</kbd>
        </button>
      </div>
      
      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Keyboard shortcuts hint */}
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
          <Keyboard className="w-4 h-4" />
          <span>Space: Play/Pause</span>
          <span className="text-gray-600">|</span>
          <span>R: Reset</span>
        </div>
        
        {/* GitHub Link */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-panel-border transition-colors"
          aria-label="View on GitHub"
        >
          <Github className="w-5 h-5" />
        </a>
      </div>
    </header>
  );
}
