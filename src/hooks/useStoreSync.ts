/**
 * useStoreSync Hook
 * Auto-saves Zustand store to localStorage and syncs across tabs
 * Enhanced to handle Inventory, Billing, Rooms, and complex object serialization
 */

import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/Store';
import { useBusinessStore } from '../store/useBusinessStore';
import { storeSyncManager, serializeStoreState, serializeBusinessStoreState, type SyncEventType } from '../utils/storeSync';
import { indexedDBStorage } from '../utils/indexedDBStorage';

// Type declaration for NodeJS timeout
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

export interface SyncStatus {
  isSynced: boolean;
  lastSyncTime: Date | null;
  isSaving: boolean;
  error: string | null;
}

const SYNC_STORAGE_KEY = 'deepa-store-sync-status';
const BUSINESS_SYNC_STORAGE_KEY = 'deepa-business-store-sync-status';
const SYNC_DEBOUNCE_MS = 3000; // ✅ Optimized: Auto-save every 3 seconds to save CPU cycles on 8GB RAM HP Laptop

export function useStoreSync() {
  const store = useStore();
  const businessStore = useBusinessStore();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSynced: true,
    lastSyncTime: null,
    isSaving: false,
    error: null,
  });
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  // Auto-save to localStorage when store changes
  useEffect(() => {
    // Skip on initial mount (to avoid saving during hydration)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set saving status
    setSyncStatus((prev) => ({
      ...prev,
      isSynced: false,
      isSaving: true,
    }));

    // Debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Serialize main store state
        const mainStateToSave = {
          inventory: store.inventory,
          dailySales: store.dailySales,
          expenses: store.expenses,
          isLoadingInventory: store.isLoadingInventory,
          inventoryError: store.inventoryError,
        };

        const serializedMain = serializeStoreState(mainStateToSave);

        // Save to IndexedDB (High Performance)
        await indexedDBStorage.setItem('deepa-store', serializedMain);

        // Serialize business store state
        const businessStateToSave = {
          inventoryItems: businessStore.inventoryItems,
          expenses: businessStore.expenses,
          staff: businessStore.staff,
          isLoading: businessStore.isLoading,
          lastHydrated: businessStore.lastHydrated,
          error: businessStore.error,
        };

        const serializedBusiness = serializeBusinessStoreState(businessStateToSave);

        // Save to IndexedDB (High Performance)
        await indexedDBStorage.setItem('deepa-business-store', serializedBusiness);

        // Update sync status
        const now = new Date();
        setSyncStatus({
          isSynced: true,
          lastSyncTime: now,
          isSaving: false,
          error: null,
        });

        // Broadcast sync to other tabs for both stores
        storeSyncManager.broadcast('full-sync', {
          mainStore: mainStateToSave,
          businessStore: businessStateToSave
        }, 'auto-save');

        // Also broadcast specific event types for targeted sync
        storeSyncManager.broadcast('inventory', mainStateToSave.inventory, 'inventory-update');
        storeSyncManager.broadcast('accounting', {
          dailySales: mainStateToSave.dailySales,
          expenses: mainStateToSave.expenses
        }, 'accounting-update');

        // Save sync status
        localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify({
          isSynced: true,
          lastSyncTime: now.toISOString(),
        }));

        localStorage.setItem(BUSINESS_SYNC_STORAGE_KEY, JSON.stringify({
          isSynced: true,
          lastSyncTime: now.toISOString(),
        }));

        console.log('✅ Main and Business stores auto-saved to localStorage');
      } catch (error) {
        console.error('Error auto-saving stores:', error);
        setSyncStatus((prev) => ({
          ...prev,
          isSynced: false,
          isSaving: false,
          error: error instanceof Error ? error.message : 'Save failed',
        }));
      }
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    // Main store dependencies
    store.inventory,
    store.dailySales,
    store.expenses,
    store.isLoadingInventory,
    store.inventoryError,
    // Business store dependencies
    businessStore.inventoryItems,
    businessStore.expenses,
    businessStore.staff,
    businessStore.isLoading,
    businessStore.lastHydrated,
    businessStore.error,
  ]);

  // Listen for sync events from other tabs
  useEffect(() => {
    if (!storeSyncManager.isAvailable()) {
      return;
    }

    const unsubscribe = storeSyncManager.subscribe('full-sync', (event) => {
      try {
        if (event.data) {
          // Handle synced data from other tabs
          const syncedData = event.data as { mainStore?: any; businessStore?: any };

          if (syncedData.mainStore) {
            console.log('📥 Received main store sync from another tab');
          }

          if (syncedData.businessStore) {
            console.log('📥 Received business store sync from another tab');
          }
        }

        // Update sync status
        setSyncStatus((prev) => ({
          ...prev,
          isSynced: true,
          lastSyncTime: new Date(),
        }));
      } catch (error) {
        console.error('Error handling sync event:', error);
      }
    });

    return unsubscribe;
  }, []);

  // Listen for inventory sync events
  useEffect(() => {
    if (!storeSyncManager.isAvailable()) {
      return;
    }

    const unsubscribe = storeSyncManager.subscribe('inventory', (event) => {
      try {
        if (event.data) {
          console.log('📥 Received inventory sync from another tab');
        }
      } catch (error) {
        console.error('Error handling inventory sync:', error);
      }
    });

    return unsubscribe;
  }, []);

  // Listen for accounting sync events
  useEffect(() => {
    if (!storeSyncManager.isAvailable()) {
      return;
    }

    const unsubscribe = storeSyncManager.subscribe('accounting', (event) => {
      try {
        if (event.data) {
          console.log('📥 Received accounting sync from another tab');
        }
      } catch (error) {
        console.error('Error handling accounting sync:', error);
      }
    });

    return unsubscribe;
  }, []);

  // Load sync status on mount
  useEffect(() => {
    const statusStr = localStorage.getItem(SYNC_STORAGE_KEY);
    if (statusStr) {
      try {
        const status = JSON.parse(statusStr);
        setSyncStatus((prev) => ({
          ...prev,
          isSynced: status.isSynced || false,
          lastSyncTime: status.lastSyncTime ? new Date(status.lastSyncTime) : null,
        }));
      } catch (error) {
        console.error('Error loading sync status:', error);
      }
    }
  }, []);

  return syncStatus;
}

/**
 * Hook to sync specific state types
 */
export function useSyncState<T>(
  eventType: SyncEventType,
  getState: () => T,
  updateState: (data: T) => void
) {
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!storeSyncManager.isAvailable()) {
      return;
    }

    const unsubscribe = storeSyncManager.subscribe(eventType, (event) => {
      if (event.data) {
        // Debounce updates to avoid rapid state changes
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
          try {
            updateState(event.data as T);
            console.log(`📥 Synced ${eventType} from another tab`);
          } catch (error) {
            console.error(`Error syncing ${eventType}:`, error);
          }
        }, 100);
      }
    });

    return () => {
      unsubscribe();
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [eventType, updateState]);

  // Broadcast state changes
  const broadcastState = () => {
    const state = getState();
    storeSyncManager.broadcast(eventType, state);
  };

  return { broadcastState };
}

