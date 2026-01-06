/**
 * Global State Management Store for Deepa Restaurant & Tourist Home
 * Uses Zustand for lightweight, performant state management
 * Enhanced with localStorage persistence and cross-tab sync
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProductInventory } from '../utils/liquorLogic';
import { parseInventoryExcel } from '../utils/excelParser';
import { storeSyncManager } from '../utils/storeSync';

export interface DailySales {
  id: string;
  date: string;
  roomRent: number;
  restaurantBills: number;
  barSales: number;
}

export interface Expense {
  id: string;
  date: string;
  category: 'Supplies' | 'Bills' | 'Wages' | 'Other';
  description: string;
  amount: number;
}

export interface AppState {
  // Inventory State
  inventory: ProductInventory[];
  isLoadingInventory: boolean;
  inventoryError: string | null;

  // Accounting State
  dailySales: DailySales[];
  expenses: Expense[];

  // Actions - Inventory
  loadInventoryFromExcel: (filePath: string) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<ProductInventory>) => void;
  addInventoryItem: (item: ProductInventory) => void;
  removeInventoryItem: (id: string) => void;

  // Actions - Sales
  addDailySale: (sale: DailySales) => void;
  removeDailySale: (id: string) => void;

  // Actions - Expenses
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
}

// Generate unique ID for inventory items
const generateInventoryId = (product: ProductInventory): string => {
  return `${product.productName.replace(/\s+/g, '_')}_${product.config.size}`;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      inventory: [],
      isLoadingInventory: false,
      inventoryError: null,
      dailySales: [],
      expenses: [],

  // Load inventory from Excel file
  loadInventoryFromExcel: async (filePath: string) => {
    set({ isLoadingInventory: true, inventoryError: null });
    
    try {
      const products = await parseInventoryExcel(filePath);
      
      // Convert to ProductInventory with IDs
      const inventoryWithIds = products.map((product) => ({
        ...product,
        id: generateInventoryId(product),
      }));

      set({ 
        inventory: inventoryWithIds, 
        isLoadingInventory: false,
        inventoryError: null,
      });
    } catch (error) {
      console.error('Error loading inventory:', error);
      set({ 
        isLoadingInventory: false, 
        inventoryError: error instanceof Error ? error.message : 'Failed to load inventory',
      });
    }
  },

  // Update inventory item
  updateInventoryItem: (id: string, updates: Partial<ProductInventory>) => {
    set((state) => {
      const updated = {
        inventory: state.inventory.map((item) => {
          const itemId = generateInventoryId(item);
          if (itemId === id) {
            return { ...item, ...updates };
          }
          return item;
        }),
      };
      // Broadcast inventory sync to other tabs
      storeSyncManager.broadcast('inventory', updated.inventory, 'updateInventoryItem');
      return updated;
    });
  },

  // Add new inventory item
  addInventoryItem: (item: ProductInventory) => {
    set((state) => {
      const updated = {
        inventory: [...state.inventory, item],
      };
      // Broadcast inventory sync to other tabs
      storeSyncManager.broadcast('inventory', updated.inventory, 'addInventoryItem');
      return updated;
    });
  },

  // Remove inventory item
  removeInventoryItem: (id: string) => {
    set((state) => ({
      inventory: state.inventory.filter((item) => generateInventoryId(item) !== id),
    }));
  },

  // Add daily sale
  addDailySale: (sale: DailySales) => {
    set((state) => {
      const updated = {
        dailySales: [...state.dailySales, sale],
      };
      // Broadcast accounting sync to other tabs
      storeSyncManager.broadcast('accounting', updated.dailySales, 'addDailySale');
      return updated;
    });
  },

  // Remove daily sale
  removeDailySale: (id: string) => {
    set((state) => ({
      dailySales: state.dailySales.filter((sale) => sale.id !== id),
    }));
  },

  // Add expense
  addExpense: (expense: Expense) => {
    set((state) => {
      const updated = {
        expenses: [...state.expenses, expense],
      };
      // Broadcast accounting sync to other tabs
      storeSyncManager.broadcast('accounting', { expenses: updated.expenses, dailySales: state.dailySales }, 'addExpense');
      return updated;
    });
  },

  // Remove expense
  removeExpense: (id: string) => {
    set((state) => {
      const updated = {
        expenses: state.expenses.filter((expense) => expense.id !== id),
      };
      // Broadcast accounting sync to other tabs
      storeSyncManager.broadcast('accounting', { expenses: updated.expenses, dailySales: state.dailySales }, 'removeExpense');
      return updated;
    });
  },
    }),
    {
      name: 'deepa-store', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist state data, not functions
      partialize: (state) => ({
        inventory: state.inventory,
        dailySales: state.dailySales,
        expenses: state.expenses,
        isLoadingInventory: state.isLoadingInventory,
        inventoryError: state.inventoryError,
      }),
      // On rehydration, broadcast to other tabs
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('✅ Store rehydrated from localStorage');
          // Broadcast initial state to other tabs
          storeSyncManager.broadcast('full-sync', {
            inventory: state.inventory,
            dailySales: state.dailySales,
            expenses: state.expenses,
          }, 'rehydrate');
        }
      },
    }
  )
);

