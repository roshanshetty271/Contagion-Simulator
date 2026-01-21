// ============================================
// LABEL COMPONENT
// Section label with optional icon
// ============================================

import React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'mono';
}

export function Label({ children, className, variant = 'default' }: LabelProps) {
  return (
    <span
      className={cn(
        'text-xs uppercase tracking-wider',
        variant === 'mono' && 'font-mono',
        variant === 'default' && 'font-medium',
        'text-gray-500',
        className
      )}
    >
      {children}
    </span>
  );
}
