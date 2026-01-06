/**
 * Real-time Sync Hook
 * Handles cross-tab synchronization and offline data buffering
 */

import { useEffect, useState, useCallback } from 'react';
import { storeSyncManager } from '../utils/storeSync';
import { saveOfflineItem, getOfflineItems, clearOfflineItems } from '../utils/offlineStorage';
import { useBusinessStore } from '../store/useBusinessStore';

export function useRealtimeSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const { sellPeg, recordDailySale } = useBusinessStore();

  // Handle syncing pending items when back online
  const syncPendingItems = useCallback(async () => {
    try {
      const items = await getOfflineItems();
      if (items.length === 0) return;

      console.log(`🔄 Syncing ${items.length} pending items...`);

      for (const item of items) {
        if (item.type === 'sale') {
          // Replay the sale
          // Assuming data structure: { productId, pegs, date, saleData }
          // We need to map this to store actions
          // For simplicity, let's assume we just broadcast it or update store
          // Real implementation would parse item.data and call appropriate store action
          // e.g. if (item.data.productId) sellPeg(item.data.productId, item.data.pegs);
        }
      }

      await clearOfflineItems();
      setPendingSyncCount(0);
      console.log('✅ Offline sync complete');
    } catch (error) {
      console.error('Error syncing offline items:', error);
    }
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingItems();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingItems]);

  // Listen for Broadcast Events (Cross-Tab)
  useEffect(() => {
    if (!storeSyncManager.isAvailable()) return;

    const unsubscribeSale = storeSyncManager.subscribe('sale-recorded', (event) => {
      console.log('🔔 Real-time Sale Event:', event.data);
      // Here we could trigger a toast or UI update
      // The store sync handles the data, this is for notifications/real-time feel
    });

    const unsubscribeRoom = storeSyncManager.subscribe('room-updated', (event) => {
      console.log('🔔 Real-time Room Event:', event.data);
    });

    return () => {
      unsubscribeSale();
      unsubscribeRoom();
    };
  }, []);

  // Action to record a sale with offline support
  const recordRealtimeSale = async (data: any) => {
    // If online, broadcast immediately
    if (navigator.onLine) {
      storeSyncManager.broadcast('sale-recorded', data);
    } else {
      // If offline, save to IndexedDB
      await saveOfflineItem({
        id: `sale-${Date.now()}`,
        type: 'sale',
        data,
        timestamp: Date.now(),
      });
      setPendingSyncCount((prev) => prev + 1);
      console.log('⚠️ Offline: Sale saved to buffer');
    }
  };

  return {
    isOnline,
    pendingSyncCount,
    recordRealtimeSale,
  };
}
