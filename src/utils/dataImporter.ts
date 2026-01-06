/**
 * Data Importer Utility
 * Handles specific CSV/Excel parsing logic for Deepa Hotel.
 * Features: Fill-Down logic, Case conversions, and Price Matching.
 */

import * as XLSX from 'xlsx';
import { useBusinessStore } from '../store/useBusinessStore';
import { 
  getLiquorConfig, 
  casesAndBottlesToStockState, 
  mlToStockState,
  type ProductInventory,
  type BottleSize
} from './liquorLogic';

// --- Conversion Rules (as per requirements) ---
const CASE_RULES: Record<number, number> = {
  1000: 9,
  750: 12,
  500: 18,
  375: 24,
  650: 12 // Default for beer
};

interface PriceRecord {
  productName: string;
  size: number;
  costPerCase: number;
}

/**
 * Parses and cross-references inventory and price data.
 * Implements "Fill-Down" for product names and specific case conversion math.
 */
export async function parseHotelData(inventoryFile: File, priceFile?: File): Promise<ProductInventory[]> {
  const inventoryData = await readFileData(inventoryFile);
  const priceData = priceFile ? await readFileData(priceFile) : [];

  // 1. Build Price Map (Cross-referencing PARTICULARS and VOLUME)
  const priceMap = new Map<string, number>();
  priceData.forEach(row => {
    const name = String(row['PARTICULARS'] || row['PRODUCT NAME'] || '').trim();
    const vol = parseInt(String(row['VOLUME'] || row['SIZE'] || '0'));
    const cost = parseFloat(String(row['PURCHASE COST'] || '0').replace(/[^0-9.]/g, ''));
    
    if (name && vol) {
      priceMap.set(`${name}_${vol}`, cost);
    }
  });

  // 2. Parse Inventory with Fill-Down Logic
  const inventory: ProductInventory[] = [];
  let lastKnownProduct = '';

  inventoryData.forEach((row) => {
    // Fill-Down Logic
    let productName = String(row['PRODUCT'] || '').trim();
    if (!productName && lastKnownProduct) {
      productName = lastKnownProduct;
    } else if (productName) {
      lastKnownProduct = productName;
    }

    if (!productName) return;

    // Parse Size
    const rawSize = String(row['SIZE'] || row['VOLUME'] || '');
    const sizeMatch = rawSize.match(/(\d+)/);
    if (!sizeMatch) return;
    const size = parseInt(sizeMatch[1]) as BottleSize;

    if (![1000, 750, 500, 375, 650].includes(size)) return;

    // Apply Conversion Logic (Case Rules)
    const config = getLiquorConfig(size);
    config.bottlesPerCase = CASE_RULES[size] || config.bottlesPerCase;

    // Price Matching
    const purchaseCostPerCase = priceMap.get(`${productName}_${size}`) || 0;

    // Map Stock Data
    const openingBottles = parseFloat(String(row['OPENING STOCK'] || '0')) || 0;
    const salePegs = parseFloat(String(row['SALE'] || '0')) || 0;

    // Logic: Opening ML - (Sales * 60ml)
    const openingStock = casesAndBottlesToStockState(0, openingBottles, config);
    const currentMl = Math.max(0, openingStock.totalMl - (salePegs * 60));
    const currentStock = mlToStockState(currentMl, config);

    inventory.push({
      productName: `${productName} ${size}ml`,
      config,
      openingStock,
      purchases: { totalMl: 0, fullCases: 0, looseBottles: 0, loosePegs: 0, totalBottles: 0, totalPegs: 0 },
      sales: salePegs,
      priceData: {
        productName,
        size,
        category: config.category,
        purchaseCostPerCase,
      },
      currentStock,
      wastage: 0,
      remainingVolumeInCurrentBottle: currentMl % config.mlPerBottle,
    });
  });

  return inventory;
}

/**
 * Initialize the Zustand store from CSV uploads.
 */
export async function initializeStoreFromCSV(inventoryFile: File, priceFile?: File) {
  const { setInventory } = useBusinessStore.getState();
  try {
    const data = await parseHotelData(inventoryFile, priceFile);
    setInventory(data);
    console.log(`✅ Store initialized with ${data.length} items`);
    return true;
  } catch (err) {
    console.error('Initialization failed:', err);
    return false;
  }
}

// --- Helper: Read file using XLSX ---
async function readFileData(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      resolve(XLSX.utils.sheet_to_json(sheet));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
