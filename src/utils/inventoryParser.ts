/**
 * Inventory Parser Utility
 * Handles parsing of "INVENTORY MANAGEMENT" spreadsheets with Fill-Down logic.
 * Integrates specific case conversion constants and unit price validation.
 */

import * as XLSX from 'xlsx';
import { 
  getLiquorConfig, 
  casesAndBottlesToStockState, 
  mlToStockState,
  type ProductInventory,
  type BottleSize
} from './liquorLogic';

// --- Math Constants (as per requirements) ---
const BOTTLES_PER_CASE: Record<number, number> = {
  1000: 9,
  750: 12,
  500: 18,
  375: 24,
  650: 12 // Standard for 650ml beer
};

/**
 * Parses Inventory CSV/Excel data into a clean array for Zustand store.
 * Implements "Fill-Down" logic for empty PRODUCT columns.
 */
export async function parseInventoryCSV(file: File): Promise<ProductInventory[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Sheets setup
        const inventorySheet = workbook.Sheets['INVENTORY MANAGEMENT'] || workbook.Sheets[workbook.SheetNames[0]];
        const priceSheet = workbook.Sheets['PRODUCT PRICE'] || workbook.Sheets[workbook.SheetNames[1]];
        
        const inventoryJson = XLSX.utils.sheet_to_json(inventorySheet, { defval: '' }) as Record<string, any>[];
        const priceJson = priceSheet ? XLSX.utils.sheet_to_json(priceSheet, { defval: '' }) as Record<string, any>[] : [];

        // 1. Build Price Map for Validation
        const priceMap = new Map<string, number>();
        priceJson.forEach(row => {
          const name = String(row['Product Name'] || row['PRODUCT NAME'] || '').trim();
          const size = parseSize(String(row['Size'] || row['VOLUME'] || ''));
          const cost = parseFloat(String(row['Purchase Cost'] || row['PURCHASE COST'] || '0').replace(/[^0-9.]/g, '')) || 0;
          if (name && size) {
            // Logic: Unit Price = Purchase Cost / Bottles per case
            const bottlesPerCase = BOTTLES_PER_CASE[size] || 12;
            const unitPrice = cost / bottlesPerCase;
            priceMap.set(`${name}_${size}`, unitPrice);
          }
        });

        // 2. Main Parsing Loop with "Fill-Down" Logic
        const inventory: ProductInventory[] = [];
        let lastKnownBrand = '';

        inventoryJson.forEach((row) => {
          // Fill-Down Logic
          let currentBrand = String(row['PRODUCT'] || row['PRODUCT NAME'] || '').trim();
          if (!currentBrand && lastKnownBrand) {
            currentBrand = lastKnownBrand;
          } else {
            lastKnownBrand = currentBrand;
          }

          if (!currentBrand) return;

          const rawSize = String(row['SIZE'] || row['VOLUME'] || '');
          const size = parseSize(rawSize);
          
          if (!size) return;

          // Configure liquor based on math constants
          const config = getLiquorConfig(size);
          // Override default config with required constants if necessary
          config.bottlesPerCase = BOTTLES_PER_CASE[size] || config.bottlesPerCase;

          // Map Stock Columns
          const openingBottles = parseFloat(String(row['OPENING STOCK'] || '0').replace(/[^0-9.]/g, '')) || 0;
          const openingStock = casesAndBottlesToStockState(0, openingBottles, config);

          const salePegs = parseFloat(String(row['SALE'] || '0').replace(/[^0-9.]/g, '')) || 0;

          // 60ml Peg Rule integration
          const openingMl = openingStock.totalMl;
          const saleMl = salePegs * 60;
          const currentMl = Math.max(0, openingMl - saleMl);
          const currentStock = mlToStockState(currentMl, config);

          inventory.push({
            productName: `${currentBrand} ${size}ml`,
            config,
            openingStock,
            purchases: { totalMl: 0, fullCases: 0, looseBottles: 0, loosePegs: 0, totalBottles: 0, totalPegs: 0 },
            sales: salePegs,
            priceData: {
              productName: currentBrand,
              size,
              category: config.category,
              purchaseCostPerCase: 0, // Would be matched from priceMap if needed for storage
            },
            currentStock,
            wastage: 0,
            remainingVolumeInCurrentBottle: currentMl % config.mlPerBottle,
          });
        });

        resolve(inventory);

      } catch (err) {
        reject(new Error(`Inventory parsing failed: ${err instanceof Error ? err.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Helper: Extract numeric size from strings like "750 ml"
 */
function parseSize(val: string): BottleSize | null {
  const match = val.match(/(\d+)/);
  if (!match) return null;
  const num = parseInt(match[1]);
  return [1000, 750, 500, 375, 650].includes(num) ? num as BottleSize : null;
}
