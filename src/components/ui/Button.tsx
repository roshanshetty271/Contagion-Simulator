// ============================================
// BUTTON COMPONENT
// ============================================

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-canvas',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variants
        variant === 'primary' && [
          'bg-accent-primary text-white',
          'hover:bg-accent-secondary',
          'focus:ring-accent-primary',
        ],
        variant === 'secondary' && [
          'bg-panel-border text-gray-200',
          'hover:bg-gray-600',
          'focus:ring-gray-500',
        ],
        variant === 'ghost' && [
          'bg-transparent text-gray-400',
          'hover:bg-panel-border hover:text-white',
          'focus:ring-gray-500',
        ],
        variant === 'danger' && [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'focus:ring-red-500',
        ],
        // Sizes
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
