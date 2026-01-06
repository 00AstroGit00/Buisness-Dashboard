/**
 * System Monitor Helper Functions
 * Shared utilities for System Monitor component
 * Separated to enable Fast Refresh in React
 */

import type { ProfilerOnRenderCallback } from 'react';

// Global render callback storage for components to use
let globalRenderCallback: ProfilerOnRenderCallback | null = null;

export function setGlobalRenderCallback(callback: ProfilerOnRenderCallback) {
  globalRenderCallback = callback;
}

// Hook to access SystemMonitor's render callback
export function useSystemMonitor() {
  return {
    onRenderCallback: globalRenderCallback || (() => {}),
  };
}

// Expose to window for component access (if needed)
if (typeof window !== 'undefined') {
  (window as Window & { __setGlobalRenderCallback?: (callback: ProfilerOnRenderCallback) => void }).__setGlobalRenderCallback = setGlobalRenderCallback;
}

