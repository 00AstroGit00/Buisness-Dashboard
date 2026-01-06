/**
 * CSV/Excel Parser for Inventory Validation
 * Handles "Group-Fill" logic and stock value validation
 */

import * as XLSX from 'xlsx';
import { 
  getLiquorConfig, 
  casesAndBottlesToStockState, 
  calculateInventoryValue,
  type BottleSize,
  type LiquorConfig
} from './liquorLogic';

export interface ValidatedRow {
  productName: string;
  size: BottleSize;
  closingStock: string; // Formatted string "X btls + Y pegs"
  closingValue: number; // From sheet
  calculatedValue: number; // Calculated from stock * price
  isValid: boolean;
  error?: string;
}

/**
 * Parse and validate inventory file
 */
export async function parseAndValidateInventory(file: File): Promise<ValidatedRow[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

    const inventorySheet = workbook.Sheets['INVENTORY MANAGEMENT'] || workbook.Sheets[workbook.SheetNames.find(name => name.toLowerCase().includes('inventory')) || ''];
    const priceSheet = workbook.Sheets['PRODUCT PRICE'] || workbook.Sheets[workbook.SheetNames.find(name => name.toLowerCase().includes('price')) || ''];

    if (!inventorySheet) throw new Error('Inventory sheet not found');

    const inventoryData = XLSX.utils.sheet_to_json(inventorySheet, { raw: false, defval: '' }) as Record<string, unknown>[];
    const priceData = priceSheet ? XLSX.utils.sheet_to_json(priceSheet, { raw: false, defval: '' }) as Record<string, unknown>[] : [];

    // Build price map
    const priceMap = buildPriceMap(priceData);

    // Process with Group-Fill and Validation
    const validatedRows: ValidatedRow[] = [];
    let lastKnownProduct = '';

    inventoryData.forEach((row, index) => {
      // 1. Group-Fill Logic
      let productName = String(row['PRODUCT NAME'] || row['Product'] || '').trim();
      
      // If product name is empty but we have data, use last known
      if (!productName && lastKnownProduct) {
        // Check if this row looks like a sub-row (has size/stock data)
        if (hasStockData(row)) {
          productName = lastKnownProduct;
        }
      } else if (productName) {
        lastKnownProduct = productName;
      }

      if (!productName) return; // Skip empty/header rows

      // Parse Size
      const size = parseBottleSize(row);
      if (!size) return; // Skip if no recognizable size

      // 2. 60ml Peg Rules (Get Config)
      const config = getLiquorConfig(size, false); // Assuming spirits by default

      // Parse Stock
      const closingCases = parseFloat(String(row['Closing Stock (Cases)'] || '0').replace(/[₹,]/g, '')) || 0;
      const closingBottles = parseFloat(String(row['Closing Stock (Bottles)'] || '0').replace(/[₹,]/g, '')) || 0;
      const closingPegs = parseFloat(String(row['Closing Stock (Pegs)'] || '0').replace(/[₹,]/g, '')) || 0; // If explicit pegs column exists

      // Convert to StockState using 60ml rule logic
      // Note: casesAndBottlesToStockState uses casesToMl and bottlesToMl which use config (bottles/case)
      const stockState = casesAndBottlesToStockState(closingCases, closingBottles, config);
      // Add loose pegs if any
      if (closingPegs > 0) {
        stockState.totalMl += closingPegs * 60;
        stockState.loosePegs += closingPegs;
        stockState.totalPegs += closingPegs;
      }

      // 3. Validation
      const sheetClosingValue = parseFloat(String(row['Closing Stock Value'] || row['Value'] || '0').replace(/[₹,]/g, '')) || 0;
      
      // Get Price info
      const productKey = `${productName}_${size}`;
      const priceInfo = priceMap.get(productKey);
      
      let calculatedValue = 0;
      let error: string | undefined;
      let isValid = true;

      if (priceInfo) {
        // Calculate expected value
        calculatedValue = calculateInventoryValue(
          stockState, 
          { 
            productName, 
            size, 
            category: config.category, 
            purchaseCostPerCase: priceInfo.purchaseCostPerCase 
          }, 
          config
        );

        // Check for mismatch (allow small tolerance for rounding)
        if (Math.abs(sheetClosingValue - calculatedValue) > 5) {
          isValid = false;
          error = `Value Mismatch: Sheet says ₹${sheetClosingValue}, Calc: ₹${calculatedValue}`;
        }
      } else {
        isValid = false;
        error = 'Price data not found';
      }

      validatedRows.push({
        productName,
        size,
        closingStock: `${closingCases}cs ${closingBottles}bts`,
        closingValue: sheetClosingValue,
        calculatedValue,
        isValid,
        error
      });
    });

    return validatedRows;

  } catch (error) {
    console.error('CSV Parsing Error:', error);
    return [];
  }
}

// --- Helpers (Duplicated/Adapted from excelParser to be standalone as requested) ---

function parseBottleSize(row: Record<string, unknown>): BottleSize | undefined {
  const keys = Object.keys(row);
  const sizeKey = keys.find(k => k.toLowerCase().includes('size') || k.toLowerCase().includes('vol'));
  let val = sizeKey ? String(row[sizeKey]) : '';
  
  // If not in a specific column, search all values
  if (!val) val = Object.values(row).join(' ');

  const match = val.match(/(\d+)\s*ml/i);
  if (match) {
    const s = parseInt(match[1]);
    if ([1000, 750, 500, 375, 650].includes(s)) return s as BottleSize;
  }
  return undefined;
}

function hasStockData(row: Record<string, unknown>): boolean {
  return Object.keys(row).some(k => 
    (k.toLowerCase().includes('stock') || k.toLowerCase().includes('case')) && 
    (String(row[k]).match(/\d/) !== null)
  );
}

function buildPriceMap(priceData: any[]): Map<string, { purchaseCostPerCase: number }> {
  const map = new Map();
  priceData.forEach(row => {
    const name = String(row['Product Name'] || row['PRODUCT NAME'] || '').trim();
    const size = parseBottleSize(row);
    const cost = parseFloat(String(row['Purchase Cost'] || row['Cost'] || '0').replace(/[₹,]/g, '')) || 0;
    if (name && size) {
      map.set(`${name}_${size}`, { purchaseCostPerCase: cost });
    }
  });
  return map;
}
