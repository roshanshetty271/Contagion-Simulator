'use client';

// ============================================
// ANIMATION SPEED CONTROL
// Control simulation playback speed
// ============================================

import React from 'react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Gauge, Zap, TurtleIcon as Turtle } from 'lucide-react';
import { Slider } from '../ui/Slider';
import { Label } from '../ui/Label';

const SPEED_PRESETS = [
  { value: 10, label: '0.25x', icon: Turtle },
  { value: 20, label: '1x', icon: Gauge },
  { value: 40, label: '2x', icon: Zap },
  { value: 80, label: '4x', icon: Zap },
];

export function AnimationSpeedControl() {
  const tickRate = useSimulationStore(state => state.tickRate);
  const setTickRate = useSimulationStore(state => state.setTickRate);
  const playbackState = useSimulationStore(state => state.playbackState);
  
  const getCurrentSpeedLabel = () => {
    if (tickRate <= 12) return '0.25x';
    if (tickRate <= 25) return '1x';
    if (tickRate <= 50) return '2x';
    return '4x';
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          Speed
        </Label>
        <span className="text-sm font-mono text-blue-400">
          {getCurrentSpeedLabel()}
        </span>
      </div>
      
      <Slider
        min={5}
        max={100}
        step={5}
        value={tickRate}
        onChange={setTickRate}
        className="w-full"
      />
      
      <div className="flex gap-2">
        {SPEED_PRESETS.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.value}
              onClick={() => setTickRate(preset.value)}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                Math.abs(tickRate - preset.value) < 8
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Icon className="w-3 h-3" />
                {preset.label}
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-400">
        {playbackState === 'playing' 
          ? 'Simulation speed adjusted in real-time'
          : 'Speed will apply when simulation starts'
        }
      </p>
    </div>
  );
}
