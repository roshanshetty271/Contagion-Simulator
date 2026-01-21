// ============================================
// SLIDER COMPONENT
// Range input with label and value display
// ============================================

import React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  formatValue = (v) => v.toFixed(2),
  className,
  disabled = false,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-400">{label}</label>
        <span className="text-sm font-mono text-gray-200">
          {formatValue(value)}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className={cn(
            'w-full h-2 rounded-lg appearance-none cursor-pointer',
            'bg-panel-border',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-accent-primary',
            '[&::-webkit-slider-thumb]:shadow-lg',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:transition-transform',
            '[&::-webkit-slider-thumb]:hover:scale-110',
            '[&::-moz-range-thumb]:w-4',
            '[&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:bg-accent-primary',
            '[&::-moz-range-thumb]:border-0',
            '[&::-moz-range-thumb]:cursor-pointer'
          )}
          style={{
            background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${percentage}%, #2a2a35 ${percentage}%, #2a2a35 100%)`,
          }}
        />
      </div>
    </div>
  );
}
