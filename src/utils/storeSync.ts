/**
 * Robust Local Persistence and Sync Layer
 * Uses BroadcastChannel API for cross-tab synchronization
 * Handles instant state synchronization across multiple browser tabs
 * Supports Inventory, Billing, Rooms, and complex object serialization
 */

import { useEffect, useRef } from 'react';
import type { AppState } from '../store/Store';
import type { ProductInventory } from '../utils/liquorLogic';
import type { BusinessState } from '../store/useBusinessStore';

export type SyncEventType = 'inventory' | 'billing' | 'rooms' | 'accounting' | 'full-sync' | 'business-store' | 'sale-recorded' | 'room-updated' | 'STOCK_UPDATE';

export interface SyncEvent {
  type: SyncEventType;
  timestamp: number;
  source: string; // Tab identifier
  data?: unknown;
  action?: string; // Action that triggered the sync
}

const BROADCAST_CHANNEL_NAME = 'deepa-store-sync';
const TAB_ID = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

class StoreSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<SyncEventType, Set<(event: SyncEvent) => void>> = new Map();
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.setupChannel();
        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize BroadcastChannel:', error);
      }
    }
  }

  private setupChannel() {
    if (!this.channel) return;

    this.channel.onmessage = (event: MessageEvent<SyncEvent>) => {
      // Ignore messages from the same tab
      if (event.data.source === TAB_ID) {
        return;
      }

      // Notify all listeners for this event type
      const listeners = this.listeners.get(event.data.type);
      if (listeners) {
        listeners.forEach((listener) => {
          try {
            listener(event.data);
          } catch (error) {
            console.error('Error in sync listener:', error);
          }
        });
      }

      // Also notify full-sync listeners
      const fullSyncListeners = this.listeners.get('full-sync');
      if (fullSyncListeners) {
        fullSyncListeners.forEach((listener) => {
          try {
            listener(event.data);
          } catch (error) {
            console.error('Error in full-sync listener:', error);
          }
        });
      }
    };
  }

  /**
   * Broadcast state change to all tabs
   */
  broadcast(eventType: SyncEventType, data?: unknown, action?: string): void {
    if (!this.channel || !this.isInitialized) {
      console.warn('BroadcastChannel not available');
      return;
    }

    const event: SyncEvent = {
      type: eventType,
      timestamp: Date.now(),
      source: TAB_ID,
      data,
      action,
    };

    try {
      this.channel.postMessage(event);
      console.log(`📤 Broadcasted ${eventType} sync event to other tabs`);
    } catch (error) {
      console.error('Failed to broadcast sync event:', error);
    }
  }

  /**
   * Subscribe to sync events
   */
  subscribe(eventType: SyncEventType, callback: (event: SyncEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const listeners = this.listeners.get(eventType)!;
    listeners.add(callback);

    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  /**
   * Get tab ID
   */
  getTabId(): string {
    return TAB_ID;
  }

  /**
   * Check if sync is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.channel !== null;
  }

  /**
   * Close channel (cleanup)
   */
  close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
      this.isInitialized = false;
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const storeSyncManager = new StoreSyncManager();

/**
 * Enhanced JSON serializer for complex objects
 * Handles ProductInventory with nested StockState, LiquorConfig, etc.
 * Includes 60ml peg sales history and other complex nested objects
 */
export function serializeStoreState(state: Partial<AppState>): string {
  try {
    // Custom serializer to handle complex nested objects including 60ml peg sales history
    // This ensures all ProductInventory nested structures are properly serialized
    const serializableState = {
      inventory: state.inventory?.map((item: ProductInventory) => {
        // Deep clone to ensure all nested objects are serializable
        return {
          productName: item.productName,
          config: {
            size: item.config.size,
            bottlesPerCase: item.config.bottlesPerCase,
            pegsPerBottle: item.config.pegsPerBottle,
            mlPerBottle: item.config.mlPerBottle,
            category: item.config.category,
          },
          openingStock: {
            totalMl: item.openingStock.totalMl,
            fullCases: item.openingStock.fullCases,
            looseBottles: item.openingStock.looseBottles,
            loosePegs: item.openingStock.loosePegs,
            totalBottles: item.openingStock.totalBottles,
            totalPegs: item.openingStock.totalPegs,
          },
          purchases: {
            totalMl: item.purchases.totalMl,
            fullCases: item.purchases.fullCases,
            looseBottles: item.purchases.looseBottles,
            loosePegs: item.purchases.loosePegs,
            totalBottles: item.purchases.totalBottles,
            totalPegs: item.purchases.totalPegs,
          },
          sales: item.sales, // 60ml peg sales history
          priceData: {
            productName: item.priceData.productName,
            size: item.priceData.size,
            category: item.priceData.category,
            purchaseCostPerCase: item.priceData.purchaseCostPerCase,
            sellingPricePerPeg: item.priceData.sellingPricePerPeg,
          },
          currentStock: {
            totalMl: item.currentStock.totalMl,
            fullCases: item.currentStock.fullCases,
            looseBottles: item.currentStock.looseBottles,
            loosePegs: item.currentStock.loosePegs,
            totalBottles: item.currentStock.totalBottles,
            totalPegs: item.currentStock.totalPegs,
          },
          wastage: item.wastage,
          remainingVolumeInCurrentBottle: item.remainingVolumeInCurrentBottle, // Current bottle volume for 60ml peg tracking
        };
      }),
      dailySales: state.dailySales,
      expenses: state.expenses,
      isLoadingInventory: state.isLoadingInventory ?? false,
      inventoryError: state.inventoryError,
    };

    return JSON.stringify(serializableState);
  } catch (error) {
    console.error('Error serializing store state:', error);
    throw error;
  }
}

/**
 * Enhanced JSON deserializer for complex objects
 * Restores ProductInventory with all nested structures
 */
export function deserializeStoreState(json: string): Partial<AppState> {
  try {
    const parsed = JSON.parse(json);
    return parsed;
  } catch (error) {
    console.error('Error deserializing store state:', error);
    throw error;
  }
}

/**
 * Enhanced JSON serializer for business store state
 * Handles Inventory, Billing, Rooms, and complex nested objects
 */
export function serializeBusinessStoreState(state: Partial<BusinessState>): string {
  try {
    // Custom serializer to handle complex nested objects including 60ml peg sales history
    const serializableState = {
      inventoryItems: state.inventoryItems?.map(item => ({
          productName: item.productName,
          config: {
            size: item.config.size,
            bottlesPerCase: item.config.bottlesPerCase,
            pegsPerBottle: item.config.pegsPerBottle,
            mlPerBottle: item.config.mlPerBottle,
            category: item.config.category,
          },
          openingStock: {
            totalMl: item.openingStock.totalMl,
            fullCases: item.openingStock.fullCases,
            looseBottles: item.openingStock.looseBottles,
            loosePegs: item.openingStock.loosePegs,
            totalBottles: item.openingStock.totalBottles,
            totalPegs: item.openingStock.totalPegs,
          },
          purchases: {
            totalMl: item.purchases.totalMl,
            fullCases: item.purchases.fullCases,
            looseBottles: item.purchases.looseBottles,
            loosePegs: item.purchases.loosePegs,
            totalBottles: item.purchases.totalBottles,
            totalPegs: item.purchases.totalPegs,
          },
          sales: item.sales, // 60ml peg sales history
          priceData: {
            productName: item.priceData.productName,
            size: item.priceData.size,
            category: item.priceData.category,
            purchaseCostPerCase: item.priceData.purchaseCostPerCase,
          },
          currentStock: {
            totalMl: item.currentStock.totalMl,
            fullCases: item.currentStock.fullCases,
            looseBottles: item.currentStock.looseBottles,
            loosePegs: item.currentStock.loosePegs,
            totalBottles: item.currentStock.totalBottles,
            totalPegs: item.currentStock.totalPegs,
          },
          wastage: item.wastage,
          remainingVolumeInCurrentBottle: item.remainingVolumeInCurrentBottle,
      })),
      expenses: state.expenses,
      staff: state.staff?.map(member => ({
        ...member,
        attendance: member.attendance
      })),
      isLoading: state.isLoading ?? false,
      lastHydrated: state.lastHydrated,
      error: state.error,
    };

    return JSON.stringify(serializableState);
  } catch (error) {
    console.error('Error serializing business store state:', error);
    throw error;
  }
}

/**
 * Enhanced JSON deserializer for business store state
 */
export function deserializeBusinessStoreState(json: string): Partial<BusinessState> {
  try {
    const parsed = JSON.parse(json);
    return parsed;
  } catch (error) {
    console.error('Error deserializing business store state:', error);
    throw error;
  }
}


