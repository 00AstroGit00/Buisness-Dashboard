/**
 * End of Day Exporter Utilities
 * Exports daily closing reports and inventory data to Excel
 * Matches INVENTORY MANAGEMENT Excel format
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { ProductInventory } from './liquorLogic';
import { getStockSummary } from './liquorLogic';
import { formatCurrency, formatNumber } from './formatCurrency';

interface ClosingReport {
  date: string;
  totalPegsSold: number;
  roomRevenue: number;
  restaurantRevenue: number;
  barRevenue: number;
  totalRevenue: number;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  netProfit: number;
  salesCount: number;
  expenseCount: number;
}

interface DailySales {
  id: string;
  date: string;
  roomRent: number;
  restaurantBills: number;
  barSales: number;
}

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

/**
 * Export End of Day Closing Report to Excel
 */
export function exportEndOfDayReport(
  report: ClosingReport,
  dailySales: DailySales[],
  expenses: Expense[]
): void {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Daily Closing Report', ''],
    ['Date', report.date],
    [''],
    ['SUMMARY', ''],
    ['Total Pegs Sold', report.totalPegsSold],
    ['Room Revenue', report.roomRevenue],
    ['Restaurant Revenue', report.restaurantRevenue],
    ['Bar Revenue', report.barRevenue],
    ['Total Revenue', report.totalRevenue],
    ['Total Expenses', report.totalExpenses],
    ['Net Profit', report.netProfit],
    ['Profit Margin (%)', report.totalRevenue > 0 ? ((report.netProfit / report.totalRevenue) * 100).toFixed(2) : '0.00'],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Daily Sales Sheet
  if (dailySales.length > 0) {
    const salesData = dailySales.map((sale) => ({
      Date: sale.date,
      'Room Rent': sale.roomRent,
      'Restaurant Bills': sale.restaurantBills,
      'Bar Sales': sale.barSales,
      Total: sale.roomRent + sale.restaurantBills + sale.barSales,
    }));

    const salesSheet = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Daily Sales');
  }

  // Expenses Sheet
  if (expenses.length > 0) {
    const expenseData = expenses.map((expense) => ({
      Date: expense.date,
      Category: expense.category,
      Description: expense.description,
      Amount: expense.amount,
    }));

    const expenseSheet = XLSX.utils.json_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');
  }

  // Generate filename
  const dateStr = report.date.replace(/-/g, '');
  const filename = `Daily_Closing_Report_${dateStr}.xlsx`;

  // Export
  XLSX.writeFile(workbook, filename);
  console.log(`Daily Closing Report exported: ${filename}`);
}

/**
 * Export Inventory to Excel
 * Matches INVENTORY MANAGEMENT (OCT 31).xlsx format
 */
export function exportInventoryToExcel(
  inventory: ProductInventory[],
  closingReport: ClosingReport
): void {
  const workbook = XLSX.utils.book_new();

  // INVENTORY MANAGEMENT Sheet
  // Format: SL No | PRODUCT | OPENING STOCK | SALE | SIZE | PURCHASE | PURCHASE COST
  const inventoryRows: Array<Record<string, string | number>> = [];
  
  inventory.forEach((item, index) => {
    const openingStock = getStockSummary(item.openingStock, item.config);
    const currentStock = getStockSummary(item.currentStock, item.config);

    // Extract product name and size
    const productNameMatch = item.productName.match(/^(.+?)\s+(\d+)\s*ml$/i);
    const productName = productNameMatch ? productNameMatch[1] : item.productName;
    const size = item.config.size;

    inventoryRows.push({
      'SL No': index + 1,
      'PRODUCT': productName,
      'OPENING STOCK': openingStock,
      'SALE': formatNumber(item.sales || 0, 1), // Sales in pegs
      'SIZE': `${size}ml`,
      'PURCHASE': `${item.purchases.fullCases} cases`,
      'PURCHASE COST (per case)': item.priceData.purchaseCostPerCase || 0,
      'CLOSING STOCK': currentStock,
    });
  });

  // Add summary row
  inventoryRows.push({
    'SL No': '',
    'PRODUCT': 'TOTAL',
    'OPENING STOCK': '',
    'SALE': formatNumber(closingReport.totalPegsSold, 1),
    'SIZE': '',
    'PURCHASE': '',
    'PURCHASE COST (per case)': '',
    'CLOSING STOCK': '',
  });

  const inventorySheet = XLSX.utils.json_to_sheet(inventoryRows);
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'INVENTORY MANAGEMENT');

  // PRODUCT PRICE Sheet
  const priceRows: Array<Record<string, string | number>> = [];
  
  inventory.forEach((item) => {
    const productNameMatch = item.productName.match(/^(.+?)\s+(\d+)\s*ml$/i);
    const productName = productNameMatch ? productNameMatch[1] : item.productName;
    const size = item.config.size;

    priceRows.push({
      'Product Name': productName,
      'Size': `${size}ml`,
      'Purchase Cost (per case)': item.priceData.purchaseCostPerCase || 0,
      'Selling Price (per peg)': item.priceData.sellingPricePerPeg || 0,
    });
  });

  const priceSheet = XLSX.utils.json_to_sheet(priceRows);
  XLSX.utils.book_append_sheet(workbook, priceSheet, 'PRODUCT PRICE');

  // Generate filename with date
  const dateStr = closingReport.date.replace(/-/g, '');
  const monthName = new Date(closingReport.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = new Date(closingReport.date).getFullYear();
  const day = new Date(closingReport.date).getDate();
  const filename = `INVENTORY MANAGEMENT (${monthName} ${day}).xlsx`;

  // Export
  XLSX.writeFile(workbook, filename);
  console.log(`Inventory exported: ${filename}`);
}

