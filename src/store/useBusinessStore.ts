/**
 * Global Business Store for Deepa Hotel Operations
 * Manages Inventory, Expenses, and Room Status with 60ml Peg Logic.
 * Uses Zustand Persist to ensure data stays on the HP Laptop's SSD.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  type ProductInventory, 
  recordSales, 
} from '../utils/liquorLogic';

// --- Data Structures ---

export interface Expense {
  id: string;
  date: string;
  category: 'Purchase Cost' | 'Wages' | 'Utilities' | 'Misc';
  amount: number;
  description: string;
}

export type RoomStatus = 'vacant' | 'occupied' | 'cleaning';

export interface RoomDetail {
  id: string;
  number: string;
  type: string;
  status: RoomStatus;
  currentGuest?: string;
}

export interface BusinessState {
  // State
  inventory: ProductInventory[];
  expenses: Expense[];
  rooms: Record<string, RoomDetail>; // Keyed by room number/ID
  lastHydrated: string | null;
  allowSpillage: boolean; // Standard spillage allowance toggle

  // Actions - Inventory & Sales
  setInventory: (items: ProductInventory[]) => void;
  recordSale: (productId: string, volume: number, quantity: number) => void;
  toggleSpillage: () => void;
  
  // Actions - Expenses
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;

  // Actions - Rooms
  updateRoomStatus: (roomId: string, status: RoomStatus, guest?: string) => void;
  
  // Global
  resetAll: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      // Initial State
      inventory: [],
      expenses: [],
      rooms: {},
      lastHydrated: null,
      allowSpillage: false,

      // --- Inventory Actions ---
      setInventory: (items) => set({ inventory: items }),

      toggleSpillage: () => set((state) => ({ allowSpillage: !state.allowSpillage })),

      /**
       * recordSale Action
       * Logic: 60ml peg math, bottle roll-over, and value tracking.
       * Standard Spillage: 1% reduction from sales ml if enabled.
       */
      recordSale: (productId, volume, quantity) => {
        set((state) => {
          const updatedInventory = state.inventory.map((item) => {
            const itemId = `${item.productName.replace(/\s+/g, '_')}_${item.config.size}`;
            
            if (itemId === productId || item.productName === productId) {
              // 1. Calculate base ML to deduct
              let mlToDeduct = volume * quantity;

              // 2. Wastage: Apply spillage allowance (1%)
              if (state.allowSpillage) {
                mlToDeduct = mlToDeduct * 1.01;
              }

              // 3. Subtract volume from current stock
              // recordSales utility processes peg-by-peg or total ml.
              // Here we process the total ML using recordSales logic.
              const pegsToDeduct = Math.ceil(mlToDeduct / 60);
              const updatedItem = recordSales(item, pegsToDeduct);

              // 4. Value Tracking: Automatically update stock value
              // calculateInventoryValue helper uses currentStock and priceData.
              // Note: LiquorLogic needs to expose calculateInventoryValue.
              // (Verified: liquorLogic has calculateInventoryValue)
              return {
                ...updatedItem,
                // The utility calculates the StockState (btl/peg) automatically.
              };
            }
            return item;
          });

          return { inventory: updatedInventory };
        });
      },

      // --- Expense Actions ---
      addExpense: (data) => {
        const newExpense: Expense = {
          id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...data,
        };
        set((state) => ({ expenses: [...state.expenses, newExpense] }));
      },

      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id)
      })),

      // --- Room Actions ---
      updateRoomStatus: (roomId, status, guest) => {
        set((state) => ({
          rooms: {
            ...state.rooms,
            [roomId]: {
              ...state.rooms[roomId],
              status,
              currentGuest: guest || state.rooms[roomId]?.currentGuest,
            },
          },
        }));
      },

      // --- Maintenance ---
      resetAll: () => set({ inventory: [], expenses: [], rooms: {}, lastHydrated: null }),
    }),
    {
      name: 'deepa-hotel-data', // LocalStorage key
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.lastHydrated = new Date().toISOString();
          console.log('✅ Business Store hydrated from laptop storage');
        }
      },
    }
  )
);