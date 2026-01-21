// ============================================
// STAT CARD COMPONENT
// Individual stat display card
// ============================================

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  color?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  color, 
  icon: Icon,
  trend,
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      'bg-canvas rounded-lg p-3 border border-panel-border',
      className
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <Icon 
            className="w-4 h-4" 
            style={{ color: color || 'currentColor' }} 
          />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span 
          className="text-2xl font-semibold"
          style={{ color: color || 'white' }}
        >
          {value}
        </span>
        {trend && trend !== 'neutral' && (
          <span className={cn(
            'text-xs',
            trend === 'up' && 'text-red-400',
            trend === 'down' && 'text-green-400'
          )}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  );
}
