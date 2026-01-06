/**
 * Report Exporter Utilities
 * Handles Excel export of daily sales reports
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { DailySales } from '../store/Store';
import { formatCurrency } from './formatCurrency';

export interface ExportOptions {
  startDate?: string;
  endDate?: string;
  includeExpenses?: boolean;
}

/**
 * Export daily sales report to Excel
 * Saves to ./Business-documents/Reports/
 */
export function exportDailySalesReport(
  dailySales: DailySales[],
  expenses?: Array<{ date: string; category: string; description: string; amount: number }>,
  options: ExportOptions = {}
): void {
  const { startDate, endDate, includeExpenses = false } = options;

  // Filter sales by date range if provided
  let filteredSales = dailySales;
  if (startDate || endDate) {
    filteredSales = dailySales.filter((sale) => {
      const saleDate = sale.date;
      if (startDate && saleDate < startDate) return false;
      if (endDate && saleDate > endDate) return false;
      return true;
    });
  }

  // Prepare sales data for Excel
  const salesData = filteredSales.map((sale) => {
    const total = sale.roomRent + sale.restaurantBills + sale.barSales;
    return {
      Date: sale.date,
      'Room Rent': sale.roomRent,
      'Restaurant Bills': sale.restaurantBills,
      'Bar Sales': sale.barSales,
      Total: total,
    };
  });

  // Add summary row
  const totalRevenue = salesData.reduce((sum, row) => sum + row.Total, 0);
  const totalRoomRent = salesData.reduce((sum, row) => sum + row['Room Rent'], 0);
  const totalRestaurant = salesData.reduce((sum, row) => sum + row['Restaurant Bills'], 0);
  const totalBar = salesData.reduce((sum, row) => sum + row['Bar Sales'], 0);

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Sales sheet
  const salesSheet = XLSX.utils.json_to_sheet([
    ...salesData,
    {
      Date: 'TOTAL',
      'Room Rent': totalRoomRent,
      'Restaurant Bills': totalRestaurant,
      'Bar Sales': totalBar,
      Total: totalRevenue,
    },
  ]);

  // Style the total row (bold)
  const totalRowIndex = salesData.length + 1;
  if (!salesSheet['!rows']) salesSheet['!rows'] = [];
  salesSheet['!rows'][totalRowIndex] = { hpt: 20, hpx: 30 };

  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Daily Sales');

  // Expenses sheet (if included)
  if (includeExpenses && expenses) {
    const filteredExpenses = expenses.filter((expense) => {
      if (startDate && expense.date < startDate) return false;
      if (endDate && expense.date > endDate) return false;
      return true;
    });

    const expenseData = filteredExpenses.map((expense) => ({
      Date: expense.date,
      Category: expense.category,
      Description: expense.description,
      Amount: expense.amount,
    }));

    const totalExpenses = expenseData.reduce((sum, row) => sum + row.Amount, 0);
    expenseData.push({
      Date: 'TOTAL',
      Category: '',
      Description: '',
      Amount: totalExpenses,
    });

    const expenseSheet = XLSX.utils.json_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Expenses');

    // Summary sheet
    const summaryData = [
      { Metric: 'Total Revenue', Amount: totalRevenue },
      { Metric: 'Total Expenses', Amount: totalExpenses },
      { Metric: 'Net Profit', Amount: totalRevenue - totalExpenses },
      { Metric: 'Profit Margin (%)', Amount: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0 },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  }

  // Generate filename
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const filename = `Daily_Sales_Report_${dateStr}.xlsx`;

  // Export to Excel
  XLSX.writeFile(workbook, filename);

  // Note: In a real application with a backend, you would save to ./Business-documents/Reports/
  // For now, this downloads to the user's default download folder
  console.log(`Report exported: ${filename}`);
}

