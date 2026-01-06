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
  mlToStockState,
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
  specialRates: {
    happyHour: boolean;
    weekendMarkup: boolean;
  };
  priceHistory: Array<{
    productId: string;
    oldPrice: number;
    newPrice: number;
    timestamp: string;
  }>;
  activityLogs: Array<{
    id: string;
    timestamp: string;
    userId: string;
    userName: string;
    deviceId: string;
    action: 'Peg Sale' | 'Room Check-in' | 'Room Checkout' | 'Stock Adjustment' | 'Expense Entry' | 'Price Update';
    description: string;
  }>;

  // Actions - Inventory & Sales
  setInventory: (items: ProductInventory[]) => void;
  recordSale: (productId: string, volume: number, quantity: number) => void;
  adjustStock: (productId: string, physicalBottles: number, physicalPegs: number, reason: string) => void;
  toggleSpillage: () => void;
  toggleSpecialRate: (type: 'happyHour' | 'weekendMarkup') => void;
  logPriceUpdate: (productId: string, oldPrice: number, newPrice: number) => void;
  logActivity: (action: any, description: string) => void;
  
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
      specialRates: {
        happyHour: false,
        weekendMarkup: false,
      },
      priceHistory: [],
      activityLogs: [],

      logActivity: (action, description) => {
        // Try to get current user from Auth (Note: Zustand store is outside React context,
        // so we assume user data is passed or fetched from session storage)
        const session = sessionStorage.getItem('deepa_auth_session');
        const user = session ? JSON.parse(session) : { id: 'SYSTEM', name: 'System' };
        const { getDeviceName } = require('../utils/webauthn'); // Dynamic import for device detection

        set((state) => ({
          activityLogs: [{
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: user.id || 'N/A',
            userName: user.name || 'N/A',
            deviceId: getDeviceName(),
            action,
            description
          }, ...state.activityLogs].slice(0, 1000) // Keep last 1000 logs
        }));
      },

      // --- Inventory Actions ---
      setInventory: (items) => {
        const currentInventory = get().inventory;
        items.forEach(newItem => {
          const oldItem = currentInventory.find(i => i.productName === newItem.productName);
          if (oldItem && oldItem.priceData.purchaseCostPerCase !== newItem.priceData.purchaseCostPerCase) {
            get().logPriceUpdate(
              newItem.productName, 
              oldItem.priceData.purchaseCostPerCase, 
              newItem.priceData.purchaseCostPerCase
            );
          }
        });
        set({ inventory: items });
        get().logActivity('Stock Adjustment', `Bulk inventory hydration completed.`);
      },

      toggleSpillage: () => set((state) => ({ allowSpillage: !state.allowSpillage })),

      toggleSpecialRate: (type) => {
        set((state) => ({
          specialRates: {
            ...state.specialRates,
            [type]: !state.specialRates[type]
          }
        }));
        get().logActivity('Stock Adjustment', `Special Rate Toggled: ${type}`);
      },

      logPriceUpdate: (productId, oldPrice, newPrice) => set((state) => ({
        priceHistory: [{
          productId,
          oldPrice,
          newPrice,
          timestamp: new Date().toISOString()
        }, ...state.priceHistory].slice(0, 100)
      })),

      adjustStock: (productId, physicalBottles, physicalPegs, reason) => {
        set((state) => {
          const updatedInventory = state.inventory.map((item) => {
            const itemId = `${item.productName.replace(/\s+/g, '_')}_${item.config.size}`;
            if (itemId === productId || item.productName === productId) {
              const newTotalMl = (physicalBottles * item.config.mlPerBottle) + (physicalPegs * 60);
              const newStock = mlToStockState(newTotalMl, item.config);
              return {
                ...item,
                currentStock: newStock,
                remainingVolumeInCurrentBottle: physicalPegs * 60,
              };
            }
            return item;
          });
          return { inventory: updatedInventory };
        });
        get().logActivity('Stock Adjustment', `Manual adjustment for ${productId}. Reason: ${reason}`);
      },

      recordSale: (productId, volume, quantity) => {
        set((state) => {
          const updatedInventory = state.inventory.map((item) => {
            const itemId = `${item.productName.replace(/\s+/g, '_')}_${item.config.size}`;
            if (itemId === productId || item.productName === productId) {
              let mlToDeduct = volume * quantity;
              if (state.allowSpillage) mlToDeduct = mlToDeduct * 1.01;
              const pegsToDeduct = Math.ceil(mlToDeduct / 60);
              return recordSales(item, pegsToDeduct);
            }
            return item;
          });
          return { inventory: updatedInventory };
        });
        get().logActivity('Peg Sale', `Recorded sale of ${quantity} pegs for ${productId}.`);
      },

      // --- Expense Actions ---
      addExpense: (data) => {
        const newExpense: Expense = {
          id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...data,
        };
        set((state) => ({ expenses: [...state.expenses, newExpense] }));
        get().logActivity('Expense Entry', `Logged ₹${data.amount} for ${data.category}: ${data.description}`);
      },

      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => id !== e.id)
      })),

      // --- Room Actions ---
      updateRoomStatus: (roomId, status, guest) => {
        set((state) => {
          const room = state.rooms[roomId] || { id: roomId, number: roomId, type: 'Standard', status: 'vacant' };
          return {
            rooms: {
              ...state.rooms,
              [roomId]: {
                ...room,
                status,
                currentGuest: guest || room.currentGuest,
              },
            },
          };
        });
        get().logActivity(status === 'occupied' ? 'Room Check-in' : 'Room Checkout', `Status updated for Room ${roomId} to ${status}.`);
      },

      resetAll: () => set({ 
        inventory: [], 
        expenses: [], 
        rooms: {}, 
        lastHydrated: null,
        specialRates: { happyHour: false, weekendMarkup: false },
        priceHistory: [],
        activityLogs: []
      }),
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