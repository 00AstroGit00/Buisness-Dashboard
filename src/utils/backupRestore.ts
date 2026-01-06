/**
 * Backup Restore Utilities
 * Handles restoring dashboard state from backup Excel files
 */

import * as XLSX from 'xlsx';
import type { ProductInventory } from './liquorLogic';
import { createProductInventory, casesAndBottlesToStockState } from './liquorLogic';
import type { AppState } from '../store/Store';

export interface RestoreResult {
  success: boolean;
  message: string;
  data?: {
    inventory: ProductInventory[];
    dailySales: Array<{
      id: string;
      date: string;
      roomRent: number;
      restaurantBills: number;
      barSales: number;
    }>;
    expenses: Array<{
      id: string;
      date: string;
      category: string;
      description: string;
      amount: number;
    }>;
  };
}

/**
 * Parse inventory from Excel sheet
 */
function parseInventorySheet(sheet: XLSX.WorkSheet): ProductInventory[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  const inventory: ProductInventory[] = [];

  for (const row of rows) {
    // Skip totals row
    if (row['PRODUCT'] === 'TOTAL' || !row['PRODUCT']) continue;

    try {
      const productName = String(row['PRODUCT'] || '');
      const sizeStr = String(row['SIZE'] || '750ml').replace('ml', '').trim();
      const size = parseInt(sizeStr) as 1000 | 750 | 500 | 375 | 650;

      // Parse opening stock (format: "X cases, Y bottles")
      const openingStockStr = String(row['OPENING STOCK'] || '');
      const openingStock = parseStockString(openingStockStr, size);

      // Parse purchase cost
      const purchaseCostPerCase = parseFloat(String(row['PURCHASE COST (per case)'] || '0'));

      // Parse sales
      const sales = parseFloat(String(row['SALE (Pegs)'] || '0'));

      // Parse wastage
      const wastage = parseFloat(String(row['WASTAGE (ml)'] || '0'));

      // Parse selling price
      const sellingPricePerPeg = parseFloat(String(row['SELLING PRICE (per peg)'] || '0'));

      // Parse remaining volume
      const remainingVolume = parseFloat(String(row['REMAINING VOLUME (ml)'] || '0'));

      const inventoryItem = createProductInventory(
        `${productName} ${size}ml`,
        size,
        openingStock.fullCases,
        openingStock.fullBottles,
        purchaseCostPerCase,
        false // isBeerCan - would need to detect from name
      );

      // Update with sales and wastage data
      inventoryItem.sales = sales;
      inventoryItem.wastage = wastage;
      inventoryItem.remainingVolumeInCurrentBottle = remainingVolume;
      inventoryItem.priceData.sellingPricePerPeg = sellingPricePerPeg;

      inventory.push(inventoryItem);
    } catch (error) {
      console.warn('Error parsing inventory row:', row, error);
    }
  }

  return inventory;
}

/**
 * Parse stock string like "2 cases, 5 bottles" or "25 bottles"
 */
function parseStockString(stockStr: string, size: number): { fullCases: number; fullBottles: number } {
  stockStr = stockStr.toLowerCase().trim();
  
  // Match cases and bottles
  const caseMatch = stockStr.match(/(\d+)\s*cases?/);
  const bottleMatch = stockStr.match(/(\d+)\s*bottles?/);
  
  const fullCases = caseMatch ? parseInt(caseMatch[1]) : 0;
  const fullBottles = bottleMatch ? parseInt(bottleMatch[1]) : 0;
  
  return { fullCases, fullBottles };
}

/**
 * Parse daily sales from Excel sheet
 */
function parseSalesSheet(sheet: XLSX.WorkSheet): Array<{
  id: string;
  date: string;
  roomRent: number;
  restaurantBills: number;
  barSales: number;
}> {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  const sales: Array<{
    id: string;
    date: string;
    roomRent: number;
    restaurantBills: number;
    barSales: number;
  }> = [];

  for (const row of rows) {
    // Skip totals row
    if (row['ID'] === 'TOTAL' || !row['ID']) continue;

    try {
      const id = String(row['ID'] || crypto.randomUUID());
      const date = String(row['Date'] || '');
      const roomRent = parseFloat(String(row['Room Rent (₹)'] || '0'));
      const restaurantBills = parseFloat(String(row['Restaurant Bills (₹)'] || '0'));
      const barSales = parseFloat(String(row['Bar Sales (₹)'] || '0'));

      if (date) {
        sales.push({
          id,
          date,
          roomRent,
          restaurantBills,
          barSales,
        });
      }
    } catch (error) {
      console.warn('Error parsing sales row:', row, error);
    }
  }

  return sales;
}

/**
 * Parse expenses from Excel sheet
 */
function parseExpensesSheet(sheet: XLSX.WorkSheet): Array<{
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}> {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  const expenses: Array<{
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
  }> = [];

  for (const row of rows) {
    // Skip totals row
    if (row['ID'] === 'TOTAL' || !row['ID']) continue;

    try {
      const id = String(row['ID'] || crypto.randomUUID());
      const date = String(row['Date'] || '');
      const category = String(row['Category'] || 'Other');
      const description = String(row['Description'] || '');
      const amount = parseFloat(String(row['Amount (₹)'] || '0'));

      if (date) {
        expenses.push({
          id,
          date,
          category: category as 'Supplies' | 'Bills' | 'Wages' | 'Other',
          description,
          amount,
        });
      }
    } catch (error) {
      console.warn('Error parsing expense row:', row, error);
    }
  }

  return expenses;
}

/**
 * Restore dashboard state from backup Excel file
 */
export async function restoreFromBackupFile(file: File): Promise<RestoreResult> {
  try {
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Get sheets
    const summarySheet = workbook.Sheets['Summary'];
    const inventorySheet = workbook.Sheets['INVENTORY MANAGEMENT'];
    const salesSheet = workbook.Sheets['Daily Sales'];
    const expensesSheet = workbook.Sheets['Expenses'];

    if (!inventorySheet) {
      return {
        success: false,
        message: 'Backup file is missing INVENTORY MANAGEMENT sheet',
      };
    }

    // Parse data from sheets
    const inventory = inventorySheet ? parseInventorySheet(inventorySheet) : [];
    const dailySales = salesSheet ? parseSalesSheet(salesSheet) : [];
    const expenses = expensesSheet ? parseExpensesSheet(expensesSheet) : [];

    // Validate data
    if (inventory.length === 0 && dailySales.length === 0 && expenses.length === 0) {
      return {
        success: false,
        message: 'Backup file appears to be empty or invalid',
      };
    }

    return {
      success: true,
      message: `Successfully parsed backup: ${inventory.length} inventory items, ${dailySales.length} sales records, ${expenses.length} expense records`,
      data: {
        inventory,
        dailySales,
        expenses,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Error restoring backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

