/**
 * Data Parser Utility
 * Specialized for "INVENTORY MANAGEMENT" spreadsheet structures.
 * Handles Group-Fill logic for nested products and 60ml peg mapping.
 */

import * as XLSX from 'xlsx';
import { 
  getLiquorConfig, 
  casesAndBottlesToStockState, 
  mlToStockState,
  type ProductInventory,
  type BottleSize
} from './liquorLogic';

export interface ParsedInventoryResult {
  inventory: ProductInventory[];
  timestamp: string;
}

/**
 * Parses an Excel or CSV file into the format required by the Zustand store.
 * Implements Group-Fill: empty 'PRODUCT' columns inherit the previous row's name.
 */
export async function parseInventoryFile(file: File): Promise<ParsedInventoryResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Find the main inventory sheet
        const sheetName = workbook.SheetNames.find(name => 
          name.toUpperCase().includes('INVENTORY') || name.toUpperCase().includes('OCT')
        ) || workbook.SheetNames[0];
        
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, any>[];

        const inventory: ProductInventory[] = [];
        let lastKnownProduct = '';

        json.forEach((row) => {
          // 1. Group-Fill Logic: Inherit Product Name
          let rawProductName = String(row['PRODUCT'] || row['PRODUCT NAME'] || '').trim();
          if (!rawProductName && lastKnownProduct) {
            rawProductName = lastKnownProduct;
          } else {
            lastKnownProduct = rawProductName;
          }

          if (!rawProductName) return; // Skip if still empty

          // 2. Parse Size and Volume
          const rawSize = String(row['SIZE'] || row['VOLUME'] || '');
          const size = parseBottleSize(rawSize);
          
          if (!size) return; // Skip rows without a valid volume (like headers or total rows)

          const config = getLiquorConfig(size);

          // 3. Map Stock and Sales
          // Handle 'OPENING STOCK' (usually bottles)
          const openingBottles = parseFloat(String(row['OPENING STOCK'] || '0').replace(/[^0-9.]/g, '')) || 0;
          const openingStock = casesAndBottlesToStockState(0, openingBottles, config);

          // Handle 'SALE' (usually pegs)
          const salePegs = parseFloat(String(row['SALE'] || '0').replace(/[^0-9.]/g, '')) || 0;

          // 4. Implement 60ml Peg Rule logic for current stock
          // Calculation: (Opening ML) - (Sale Pegs * 60)
          const openingMl = openingStock.totalMl;
          const saleMl = salePegs * 60;
          const currentMl = Math.max(0, openingMl - saleMl);
          const currentStock = mlToStockState(currentMl, config);

          // Calculate remaining volume in the open bottle
          const remainingVolumeInBottle = currentMl % config.mlPerBottle;

          const productInventory: ProductInventory = {
            productName: `${rawProductName} ${size}ml`,
            config,
            openingStock,
            purchases: { totalMl: 0, fullCases: 0, looseBottles: 0, loosePegs: 0, totalBottles: 0, totalPegs: 0 },
            sales: salePegs,
            priceData: {
              productName: rawProductName,
              size,
              category: config.category,
              purchaseCostPerCase: 0, // Should be updated from PRICE sheet if available
            },
            currentStock,
            wastage: 0,
            remainingVolumeInCurrentBottle: remainingVolumeInBottle,
          };

          inventory.push(productInventory);
        });

        resolve({
          inventory,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        reject(new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Helper: Parse string like "750 ml" or "1000" into BottleSize
 */
function parseBottleSize(val: string): BottleSize | null {
  const match = val.match(/(\d+)/);
  if (!match) return null;
  const num = parseInt(match[1]);
  if ([1000, 750, 500, 375, 650].includes(num)) {
    return num as BottleSize;
  }
  // Special case: if volume is "60 ml", it's a peg, but we map it to the standard size context
  // Here we usually return null as we want standard bottle sizes for the grid, 
  // but we ensure the parent row logic handles the fractional part.
  return null;
}