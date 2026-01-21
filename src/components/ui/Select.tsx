// ============================================
// SELECT COMPONENT
// Dropdown selector
// ============================================

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function Select({
  label,
  value,
  options,
  onChange,
  className,
  disabled = false,
}: SelectProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm text-gray-400">{label}</label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 pr-10 rounded-lg',
            'bg-panel-border text-gray-200',
            'border border-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent',
            'appearance-none cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'text-sm'
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
