/**
 * System Heartbeat Hook
 * Automatically runs health checks every hour
 */

import { useState, useEffect, useCallback } from 'react';
import { runHeartbeatCheck, getLatestHeartbeat, type HeartbeatCheck } from '../utils/systemHeartbeat';

const HEARTBEAT_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export function useSystemHeartbeat() {
  const [lastHeartbeat, setLastHeartbeat] = useState<HeartbeatCheck | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const performCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await runHeartbeatCheck();
      setLastHeartbeat(result);
      
      // Log to console for debugging
      if (result.status !== 'healthy') {
        console.warn('[System Heartbeat] Issues detected:', result.issues);
      } else {
        console.log('[System Heartbeat] System healthy ✓');
      }
    } catch (error) {
      console.error('[System Heartbeat] Check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Load latest heartbeat on mount
  useEffect(() => {
    const latest = getLatestHeartbeat();
    setLastHeartbeat(latest);

    // Run initial check if no recent heartbeat
    if (!latest || (Date.now() - latest.timestamp.getTime()) > HEARTBEAT_INTERVAL) {
      performCheck();
    }
  }, [performCheck]);

  // Set up hourly checks
  useEffect(() => {
    const interval = setInterval(() => {
      performCheck();
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(interval);
  }, [performCheck]);

  return {
    lastHeartbeat,
    isChecking,
    performCheck,
  };
}

