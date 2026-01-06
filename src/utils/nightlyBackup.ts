/**
 * Nightly Backup Automation
 * Automatically triggers comprehensive Excel backup at 11:55 PM daily
 * Includes all inventory, sales, expenses, and accounting data
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { AppState } from '../store/Store';
import type { ProductInventory } from './liquorLogic';
import { getStockSummary } from './liquorLogic';
import { formatNumber } from './formatCurrency';

const BACKUP_LOG_KEY = 'deepa_backup_log';
const BACKUP_SCHEDULE_KEY = 'deepa_backup_schedule';
const BACKUP_TIME_HOUR = 23; // 11 PM
const BACKUP_TIME_MINUTE = 55; // 55 minutes

export interface BackupLogEntry {
  date: string;
  filename: string;
  timestamp: string;
  status: 'success' | 'failed';
  error?: string;
  fileSize?: number; // in bytes
  recordCounts: {
    inventory: number;
    sales: number;
    expenses: number;
  };
}

export interface BackupLog {
  entries: BackupLogEntry[];
  lastBackup: string | null;
  totalBackups: number;
  failedBackups: number;
}

/**
 * Get or initialize backup log from localStorage
 */
function getBackupLog(): BackupLog {
  const stored = localStorage.getItem(BACKUP_LOG_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid JSON, create new log
    }
  }
  return {
    entries: [],
    lastBackup: null,
    totalBackups: 0,
    failedBackups: 0,
  };
}

/**
 * Update backup log
 */
function updateBackupLog(entry: BackupLogEntry): void {
  const log = getBackupLog();
  log.entries.push(entry);
  log.totalBackups++;
  if (entry.status === 'failed') {
    log.failedBackups++;
  } else {
    log.lastBackup = entry.timestamp;
  }
  
  // Keep only last 365 entries (1 year)
  if (log.entries.length > 365) {
    log.entries = log.entries.slice(-365);
  }
  
  localStorage.setItem(BACKUP_LOG_KEY, JSON.stringify(log));
}

/**
 * Compile all dashboard data into a comprehensive Excel file
 */
export async function compileNightlyBackup(state: {
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
}): Promise<{ filename: string; blob: Blob; recordCounts: BackupLogEntry['recordCounts'] }> {
  const workbook = XLSX.utils.book_new();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const filename = `Deepa_EOD_Report_${dateStr}.xlsx`;

  // 1. Summary Sheet
  const totalRevenue = state.dailySales.reduce((sum, sale) => {
    return sum + sale.roomRent + sale.restaurantBills + sale.barSales;
  }, 0);
  const totalExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalPegsSold = state.inventory.reduce((sum, item) => sum + (item.sales || 0), 0);

  const summaryData = [
    ['DEEPA RESTAURANT & TOURIST HOME', ''],
    ['END OF DAY BACKUP REPORT', ''],
    ['Backup Date', dateStr],
    ['Backup Time', now.toLocaleTimeString('en-IN')],
    [''],
    ['SUMMARY STATISTICS', ''],
    ['Total Inventory Items', state.inventory.length],
    ['Total Sales Records', state.dailySales.length],
    ['Total Expense Records', state.expenses.length],
    ['Total Pegs Sold', formatNumber(totalPegsSold, 1)],
    ['Total Revenue (₹)', totalRevenue.toFixed(2)],
    ['Total Expenses (₹)', totalExpenses.toFixed(2)],
    ['Net Profit (₹)', (totalRevenue - totalExpenses).toFixed(2)],
    ['Profit Margin (%)', totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(2) : '0.00'],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // 2. Inventory Management Sheet (matches INVENTORY MANAGEMENT format)
  const inventoryRows: Array<Record<string, string | number>> = [];
  
  state.inventory.forEach((item, index) => {
    const openingStock = getStockSummary(item.openingStock, item.config);
    const currentStock = getStockSummary(item.currentStock, item.config);
    const productNameMatch = item.productName.match(/^(.+?)\s+(\d+)\s*ml$/i);
    const productName = productNameMatch ? productNameMatch[1] : item.productName;
    const size = item.config.size;

    inventoryRows.push({
      'SL No': index + 1,
      'PRODUCT': productName,
      'SIZE': `${size}ml`,
      'OPENING STOCK': openingStock,
      'PURCHASE': `${item.purchases.fullCases} cases`,
      'PURCHASE COST (per case)': item.priceData.purchaseCostPerCase || 0,
      'SALE (Pegs)': formatNumber(item.sales || 0, 1),
      'WASTAGE (ml)': item.wastage || 0,
      'CLOSING STOCK': currentStock,
      'SELLING PRICE (per peg)': item.priceData.sellingPricePerPeg || 0,
      'REMAINING VOLUME (ml)': item.remainingVolumeInCurrentBottle || 0,
    });
  });

  // Add totals row
  inventoryRows.push({
    'SL No': '',
    'PRODUCT': 'TOTAL',
    'SIZE': '',
    'OPENING STOCK': '',
    'PURCHASE': '',
    'PURCHASE COST (per case)': '',
    'SALE (Pegs)': formatNumber(totalPegsSold, 1),
    'WASTAGE (ml)': '',
    'CLOSING STOCK': '',
    'SELLING PRICE (per peg)': '',
    'REMAINING VOLUME (ml)': '',
  });

  const inventorySheet = XLSX.utils.json_to_sheet(inventoryRows);
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'INVENTORY MANAGEMENT');

  // 3. PRODUCT PRICE Sheet
  const priceRows: Array<Record<string, string | number>> = [];
  state.inventory.forEach((item) => {
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

  // 4. Daily Sales Sheet
  const salesData = state.dailySales.map((sale) => ({
    'ID': sale.id,
    'Date': sale.date,
    'Room Rent (₹)': sale.roomRent,
    'Restaurant Bills (₹)': sale.restaurantBills,
    'Bar Sales (₹)': sale.barSales,
    'Total Revenue (₹)': sale.roomRent + sale.restaurantBills + sale.barSales,
  }));

  // Add totals row
  if (salesData.length > 0) {
    const totalRoom = salesData.reduce((sum, s) => sum + s['Room Rent (₹)'], 0);
    const totalRestaurant = salesData.reduce((sum, s) => sum + s['Restaurant Bills (₹)'], 0);
    const totalBar = salesData.reduce((sum, s) => sum + s['Bar Sales (₹)'], 0);
    salesData.push({
      'ID': 'TOTAL',
      'Date': '',
      'Room Rent (₹)': totalRoom,
      'Restaurant Bills (₹)': totalRestaurant,
      'Bar Sales (₹)': totalBar,
      'Total Revenue (₹)': totalRoom + totalRestaurant + totalBar,
    });
  }

  const salesSheet = XLSX.utils.json_to_sheet(salesData);
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Daily Sales');

  // 5. Expenses Sheet
  const expenseData = state.expenses.map((expense) => ({
    'ID': expense.id,
    'Date': expense.date,
    'Category': expense.category,
    'Description': expense.description,
    'Amount (₹)': expense.amount,
  }));

  // Add totals row
  if (expenseData.length > 0) {
    const totalExpenses = expenseData.reduce((sum, e) => sum + e['Amount (₹)'], 0);
    expenseData.push({
      'ID': 'TOTAL',
      'Date': '',
      'Category': '',
      'Description': '',
      'Amount (₹)': totalExpenses,
    });
  }

  const expenseSheet = XLSX.utils.json_to_sheet(expenseData);
  XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');

  // 6. Convert workbook to blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  return {
    filename,
    blob,
    recordCounts: {
      inventory: state.inventory.length,
      sales: state.dailySales.length,
      expenses: state.expenses.length,
    },
  };
}

/**
 * Execute nightly backup - downloads file and logs the backup
 */
export async function executeNightlyBackup(state: {
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
}): Promise<BackupLogEntry> {
  try {
    const { filename, blob, recordCounts } = await compileNightlyBackup(state);

    // Download file using file-saver
    saveAs(blob, filename);

    // Create backup log entry
    const entry: BackupLogEntry = {
      date: new Date().toISOString().split('T')[0],
      filename,
      timestamp: new Date().toISOString(),
      status: 'success',
      fileSize: blob.size,
      recordCounts,
    };

    updateBackupLog(entry);
    
    console.log(`✅ Nightly backup completed: ${filename}`);
    console.log(`📊 Records: ${recordCounts.inventory} inventory, ${recordCounts.sales} sales, ${recordCounts.expenses} expenses`);

    return entry;
  } catch (error) {
    const entry: BackupLogEntry = {
      date: new Date().toISOString().split('T')[0],
      filename: `Deepa_EOD_Report_${new Date().toISOString().split('T')[0]}.xlsx`,
      timestamp: new Date().toISOString(),
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      recordCounts: {
        inventory: state.inventory.length,
        sales: state.dailySales.length,
        expenses: state.expenses.length,
      },
    };

    updateBackupLog(entry);
    console.error('❌ Nightly backup failed:', error);
    return entry;
  }
}

/**
 * Schedule nightly backup at 11:55 PM
 * Returns cleanup function to cancel the schedule
 */
export function scheduleNightlyBackup(
  stateGetter: () => {
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
  }
): () => void {
  const scheduleNextBackup = () => {
    const now = new Date();
    const backupTime = new Date();
    backupTime.setHours(BACKUP_TIME_HOUR, BACKUP_TIME_MINUTE, 0, 0);

    // If it's already past 11:55 PM today, schedule for tomorrow
    if (now > backupTime) {
      backupTime.setDate(backupTime.getDate() + 1);
    }

    const timeUntilBackup = backupTime.getTime() - now.getTime();

    console.log(`⏰ Nightly backup scheduled for: ${backupTime.toLocaleString('en-IN')}`);
    console.log(`⏳ Time until backup: ${Math.round(timeUntilBackup / 1000 / 60)} minutes`);

    const timeout = setTimeout(async () => {
      try {
        const state = stateGetter();
        await executeNightlyBackup(state);
        
        // Schedule next backup for tomorrow
        scheduleNextBackup();
      } catch (error) {
        console.error('Error in scheduled backup:', error);
        // Still schedule next backup even if this one failed
        scheduleNextBackup();
      }
    }, timeUntilBackup);

    // Store timeout ID for cleanup
    localStorage.setItem(BACKUP_SCHEDULE_KEY, String(timeout));

    return timeout;
  };

  // Start scheduling
  const timeoutId = scheduleNextBackup();

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
    localStorage.removeItem(BACKUP_SCHEDULE_KEY);
    console.log('Nightly backup schedule cancelled');
  };
}

/**
 * Get backup log for display
 */
export function getBackupLogEntries(): BackupLog {
  return getBackupLog();
}

/**
 * Clear backup log (for testing or reset)
 */
export function clearBackupLog(): void {
  localStorage.removeItem(BACKUP_LOG_KEY);
  console.log('Backup log cleared');
}

