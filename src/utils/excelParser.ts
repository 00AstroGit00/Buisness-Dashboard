/**
 * Excel Parser for Inventory Management
 * Handles parsing of INVENTORY MANAGEMENT Excel file with nested product rows
 */

import * as XLSX from 'xlsx';
import type { ProductInventory, BottleSize } from './liquorLogic';
import { getLiquorConfig, casesAndBottlesToStockState, mlToStockState } from './liquorLogic';

export interface ExcelInventoryRow {
  productName: string;
  size?: BottleSize;
  openingStock?: number;
  purchases?: number;
  sales?: number;
  purchaseCostPerCase?: number;
  isSubRow?: boolean; // Indicates if this is a volume variant sub-row
  parentProduct?: string; // Reference to parent product name
}

export interface ExcelPriceRow {
  productName: string;
  size?: BottleSize;
  purchaseCostPerCase?: number;
  sellingPricePerPeg?: number;
}

/**
 * Parse inventory management Excel file
 * Handles products with sub-rows for different volumes
 */
export async function parseInventoryExcel(filePath: string): Promise<ProductInventory[]> {
  try {
    // In a real application, you would fetch the file from the server
    // For now, this is a placeholder structure
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

    const inventorySheet = workbook.Sheets['INVENTORY MANAGEMENT'] || workbook.Sheets[workbook.SheetNames.find(name => name.toLowerCase().includes('inventory')) || ''];
    const priceSheet = workbook.Sheets['PRODUCT PRICE'] || workbook.Sheets[workbook.SheetNames.find(name => name.toLowerCase().includes('price')) || ''];

    if (!inventorySheet) {
      throw new Error('INVENTORY MANAGEMENT sheet not found');
    }

    // Parse inventory sheet
    const inventoryData = XLSX.utils.sheet_to_json(inventorySheet, { raw: false, defval: '' }) as Record<string, unknown>[];
    const priceData = priceSheet ? XLSX.utils.sheet_to_json(priceSheet, { raw: false, defval: '' }) as Record<string, unknown>[] : [];

    // Build price lookup map
    const priceMap = buildPriceMap(priceData);

    // Parse inventory rows, handling nested sub-rows
    const parsedProducts = parseInventoryRows(inventoryData, priceMap);

    return parsedProducts;
  } catch (error) {
    console.error('Error parsing inventory Excel:', error);
    return [];
  }
}

/**
 * Parse accounting data from Excel file
 * Expected columns: Date, Revenue, Expenses (or similar)
 */
export async function parseAccountingExcel(file: File): Promise<Array<{ date: string; revenue: number; expenses: number }>> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    
    // Assume first sheet contains data
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: '' }) as Record<string, unknown>[];

    return data.map((row) => {
      // Try to find date column
      const dateVal = row['Date'] || row['DATE'] || row['date'] || new Date().toISOString().split('T')[0];
      let dateStr = String(dateVal);
      
      // Basic date cleaning (if Excel returns serial number or other format, handled by cellDates: true usually)
      // If it's a JS Date object from cellDates: true
      if (dateVal instanceof Date) {
        dateStr = dateVal.toISOString().split('T')[0];
      }

      // Revenue
      const revenue = parseFloat(String(row['Revenue'] || row['REVENUE'] || row['Income'] || row['Sales'] || '0').replace(/[₹,]/g, '')) || 0;
      
      // Expenses
      const expenses = parseFloat(String(row['Expenses'] || row['EXPENSES'] || row['Cost'] || '0').replace(/[₹,]/g, '')) || 0;

      return {
        date: dateStr,
        revenue,
        expenses
      };
    }).filter(d => d.revenue > 0 || d.expenses > 0);

  } catch (error) {
    console.error('Error parsing accounting Excel:', error);
    return [];
  }
}

/**
 * Build a price lookup map from PRODUCT PRICE sheet
 */
function buildPriceMap(priceData: Record<string, unknown>[]): Map<string, ExcelPriceRow> {
  const priceMap = new Map<string, ExcelPriceRow>();

  priceData.forEach((row) => {
    const productKey = getProductKey(row);
    if (productKey) {
      priceMap.set(productKey, {
        productName: String(row['Product Name'] || row['PRODUCT NAME'] || row['Product'] || ''),
        size: parseBottleSize(row),
        purchaseCostPerCase: parseFloat(String(row['Purchase Cost (per case)'] || row['Purchase Cost'] || row['Cost'] || '0').replace(/[₹,]/g, '')) || 0,
        sellingPricePerPeg: parseFloat(String(row['Selling Price (per peg)'] || row['Selling Price'] || row['Price'] || '0').replace(/[₹,]/g, '')) || undefined,
      });
    }
  });

  return priceMap;
}

/**
 * Parse inventory rows, handling products with sub-rows for volumes
 */
function parseInventoryRows(inventoryData: Record<string, unknown>[], priceMap: Map<string, ExcelPriceRow>): ProductInventory[] {
  const products: ProductInventory[] = [];
  let currentProduct: string | null = null;

  inventoryData.forEach((row) => {
    const rowData = row as Record<string, unknown>;

    // Detect product name column (could be 'Product Name', 'PRODUCT NAME', 'Product', etc.)
    const productNameKey = Object.keys(rowData).find(
      key => key.toLowerCase().includes('product') && !key.toLowerCase().includes('code')
    );

    const productName = productNameKey ? String(rowData[productNameKey] || '').trim() : '';

    // Check if this is a main product row (has a product name and no indentation/sub-row marker)
    const isMainProduct = productName && productName.length > 0 && !isSubRow(rowData);

    if (isMainProduct) {
      currentProduct = productName;
    }

    // Parse bottle size from row (look for size columns or volume indicators)
    const size = parseBottleSize(rowData);
    
    // Get opening stock
    const openingStockCases = parseFloat(String(rowData['Opening Stock (Cases)'] || rowData['Opening Stock'] || rowData['Opening'] || '0').replace(/[₹,]/g, '')) || 0;
    const openingStockBottles = parseFloat(String(rowData['Opening Stock (Bottles)'] || rowData['Bottles'] || '0').replace(/[₹,]/g, '')) || 0;
    
    // Get purchases
    const purchasesCases = parseFloat(String(rowData['Purchases (Cases)'] || rowData['Purchases'] || rowData['Purchase'] || '0').replace(/[₹,]/g, '')) || 0;
    
    // Get sales (in pegs)
    const salesPegs = parseFloat(String(rowData['SALE'] || rowData['Sales'] || rowData['Sales (Pegs)'] || '0').replace(/[₹,]/g, '')) || 0;

    // Get product key for price lookup
    const productKey = currentProduct && size ? `${currentProduct}_${size}` : '';
    const priceInfo = productKey ? priceMap.get(productKey) : null;
    const purchaseCostPerCase = priceInfo?.purchaseCostPerCase || 0;

    // Only create inventory if we have a valid product and size
    if (currentProduct && size && (openingStockCases > 0 || openingStockBottles > 0 || purchasesCases > 0)) {
      const config = getLiquorConfig(size, false);
      const openingStock = casesAndBottlesToStockState(openingStockCases, openingStockBottles, config);
      const purchases = casesAndBottlesToStockState(purchasesCases, 0, config);

      // Create unique key for product + size combination
      const productInventory: ProductInventory = {
        productName: `${currentProduct} ${size}ml`,
        config,
        openingStock,
        purchases,
        sales: salesPegs,
        priceData: {
          productName: currentProduct,
          size,
          category: config.category,
          purchaseCostPerCase,
          sellingPricePerPeg: priceInfo?.sellingPricePerPeg,
        },
        currentStock: mlToStockState(
          Math.max(0, openingStock.totalMl + purchases.totalMl - (salesPegs * 60)),
          config
        ),
        wastage: 0, // Initialize wastage to 0
        remainingVolumeInCurrentBottle: 0, // Will be set when sales occur
      };

      products.push(productInventory);
    }
  });

  return products;
}

/**
 * Check if a row is a sub-row (indented or volume variant)
 */
function isSubRow(rowData: Record<string, unknown>): boolean {
  // Check for indentation markers or empty product name with size info
  const productNameKey = Object.keys(rowData).find(key => key.toLowerCase().includes('product'));
  const productName = productNameKey ? String(rowData[productNameKey] || '').trim() : '';
  
  // If product name is empty but size exists, it's likely a sub-row
  const hasSize = parseBottleSize(rowData) !== undefined;
  
  return !productName && hasSize;
}

/**
 * Parse bottle size from row data
 */
function parseBottleSize(rowData: Record<string, unknown>): BottleSize | undefined {
  // Look for size columns
  const sizeKeys = Object.keys(rowData).filter(key => 
    key.toLowerCase().includes('size') || 
    key.toLowerCase().includes('volume') ||
    key.toLowerCase().includes('ml')
  );

  for (const key of sizeKeys) {
    const value = String(rowData[key] || '').toLowerCase();
    // Extract number from strings like "1000ml", "750 ml", etc.
    const match = value.match(/(\d+)\s*ml?/);
    if (match) {
      const size = parseInt(match[1]);
      if ([1000, 750, 500, 375, 650].includes(size)) {
        return size as BottleSize;
      }
    }
  }

  // Also check if any cell contains common sizes
  const allValues = Object.values(rowData).join(' ').toLowerCase();
  if (allValues.includes('1000ml') || allValues.includes('1000 ml')) return 1000;
  if (allValues.includes('750ml') || allValues.includes('750 ml')) return 750;
  if (allValues.includes('500ml') || allValues.includes('500 ml')) return 500;
  if (allValues.includes('375ml') || allValues.includes('375 ml')) return 375;
  if (allValues.includes('650ml') || allValues.includes('650 ml')) return 650;

  return undefined;
}

/**
 * Generate product key for price lookup
 */
function getProductKey(row: Record<string, unknown>): string | null {
  const productNameKey = Object.keys(row).find(key => 
    key.toLowerCase().includes('product') && !key.toLowerCase().includes('code')
  );
  const productName = productNameKey ? String(row[productNameKey] || '').trim() : '';
  const size = parseBottleSize(row);
  
  if (productName && size) {
    return `${productName}_${size}`;
  }
  return null;
}

