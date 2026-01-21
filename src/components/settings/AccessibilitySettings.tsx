// ============================================
// ACCESSIBILITY SETTINGS
// Color blind mode and other a11y options
// ============================================

'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { Switch } from '@/components/ui';

export function AccessibilitySettings() {
  const colorBlindMode = useSimulationStore(state => state.colorBlindMode);
  const setColorBlindMode = useSimulationStore(state => state.setColorBlindMode);
  
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          Accessibility
        </span>
      </div>
      
      <Switch
        label="Color Blind Mode"
        checked={colorBlindMode}
        onChange={setColorBlindMode}
      />
      
      <p className="text-xs text-gray-600 mt-2">
        Uses Paul Tol&apos;s color-blind safe palette (Press C to toggle)
      </p>
    </div>
  );
}
