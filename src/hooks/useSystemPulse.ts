/**
 * useSystemPulse Performance Monitor Hook
 * Optimized for 2026 Dashboard Performance.
 * Monitors DOM nodes, device connectivity, and RAM health.
 */

import { useState, useEffect, useCallback } from 'react';
import { useBusinessStore } from '../store/useBusinessStore';

export type PulseStatus = 'healthy' | 'warning' | 'critical';

export const useSystemPulse = () => {
  const { isOnline } = useBusinessStore();
  const [status, setStatus] = useState<PulseStatus>('healthy');
  const [domCount, setDomCount] = useState(0);
  const [lastHeartbeat, setLastHeartbeat] = useState(Date.now());

  // Heartbeat check between Client and Server (HP Laptop)
  const checkHeartbeat = useCallback(() => {
    // In a real multi-device setup, this would be a ping to the server
    const isDesynced = !isOnline; // Simple logic for prototype
    if (isDesynced) setStatus('critical');
    setLastHeartbeat(Date.now());
  }, [isOnline]);

  useEffect(() => {
    const monitorInterval = setInterval(() => {
      // 1. Monitor DOM Elements
      const currentDomCount = document.getElementsByTagName('*').length;
      setDomCount(currentDomCount);

      // 2. RAM Guard / DOM Threshold
      // If > 2000 nodes, we flag a warning for 8GB RAM overhead
      if (currentDomCount > 2000) {
        setStatus('warning');
        console.warn('⚠️ DOM Threshold Exceeded: Triggering virtual list cache reset hint.');
        // Triggering a custom event that virtualized lists can listen to
        window.dispatchEvent(new CustomEvent('deepa_garbage_collection'));
      } else if (isOnline) {
        setStatus('healthy');
      }

      checkHeartbeat();
    }, 5000); // Check every 5 seconds for a fluid pulse

    return () => clearInterval(monitorInterval);
  }, [checkHeartbeat, isOnline]);

  return {
    status,
    domCount,
    lastHeartbeat,
    isOnline
  };
};
