// ============================================
// SWITCH COMPONENT
// Toggle switch
// ============================================

import React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function Switch({
  label,
  checked,
  onChange,
  className,
  disabled = false,
}: SwitchProps) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'w-10 h-6 rounded-full transition-colors duration-200',
            checked ? 'bg-accent-primary' : 'bg-panel-border'
          )}
        />
        <div
          className={cn(
            'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200',
            checked && 'translate-x-4'
          )}
        />
      </div>
      {label && <span className="text-sm text-gray-300">{label}</span>}
    </label>
  );
}
