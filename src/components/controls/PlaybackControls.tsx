// ============================================
// PLAYBACK CONTROLS COMPONENT
// Play, pause, reset, step controls
// ============================================

'use client';

import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export function PlaybackControls() {
  const playbackState = useSimulationStore(state => state.playbackState);
  const tick = useSimulationStore(state => state.tick);
  const play = useSimulationStore(state => state.play);
  const pause = useSimulationStore(state => state.pause);
  const reset = useSimulationStore(state => state.reset);
  const step = useSimulationStore(state => state.step);
  
  const isPlaying = playbackState === 'playing';
  const isComplete = playbackState === 'complete';
  
  return (
    <div className="p-4 border-b border-panel-border">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">
        Playback
      </div>
      
      <div className="flex items-center gap-2">
        {/* Play/Pause */}
        <Button
          variant={isPlaying ? 'secondary' : 'primary'}
          size="md"
          onClick={isPlaying ? pause : play}
          disabled={isComplete}
          className="flex-1"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play
            </>
          )}
        </Button>
        
        {/* Step */}
        <Button
          variant="ghost"
          size="md"
          onClick={step}
          disabled={isPlaying || isComplete}
          title="Step forward (→)"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
        
        {/* Reset */}
        <Button
          variant="ghost"
          size="md"
          onClick={reset}
          title="Reset (R)"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Tick counter */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-gray-400">Tick</span>
        <span className={cn(
          'font-mono',
          isComplete ? 'text-green-400' : 'text-white'
        )}>
          {tick}
          {isComplete && ' (Complete)'}
        </span>
      </div>
    </div>
  );
}
