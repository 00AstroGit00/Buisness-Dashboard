/**
 * Offline Status Hook
 * Monitors online/offline status and localStorage sync state
 */

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/Store';

export interface OfflineStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  syncError: string | null;
}

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Get pending changes count (in a real app, this would track unsynced items)
  const { dailySales, expenses, inventory } = useStore();
  const pendingChanges = dailySales.length + expenses.length + inventory.length; // Simplified

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncError(null);
      // Attempt sync when coming back online
      attemptSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial sync time from localStorage
    const savedSyncTime = localStorage.getItem('lastSyncTime');
    if (savedSyncTime) {
      setLastSyncTime(new Date(savedSyncTime));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Simulate sync to filesystem (in production, this would sync to server)
  const attemptSync = useCallback(async () => {
    if (!isOnline) {
      setSyncError('Offline - changes saved to local storage');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Simulate API call or file sync
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update sync time
      const syncTime = new Date();
      setLastSyncTime(syncTime);
      localStorage.setItem('lastSyncTime', syncTime.toISOString());
    } catch (error) {
      setSyncError('Sync failed - data saved locally');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  // Auto-sync when online (debounced)
  useEffect(() => {
    if (isOnline && !isSyncing && pendingChanges > 0) {
      const syncTimer = setTimeout(() => {
        attemptSync();
      }, 2000); // Sync 2 seconds after last change

      return () => clearTimeout(syncTimer);
    }
  }, [isOnline, isSyncing, pendingChanges, attemptSync]);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingChanges,
    syncError,
    attemptSync,
  };
}

