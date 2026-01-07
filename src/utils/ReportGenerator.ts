/**
 * Report Generator Utility
 * Compiles business data into official Excise Register and Auditor formats.
 * Uses 'xlsx' for high-fidelity Excel generation.
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatCurrency } from './formatCurrency';
import { calculateTax, type ItemCategory } from './gstCalculator';
import type { ProductInventory } from './liquorLogic';

export interface ExciseRow {
  date: string;
  productName: string;
  opening: number;
  purchases: number;
  sales: number;
  wastage: number;
  closing: number;
}

/**
 * Generate official Excise Register Excel file
 */
export async function generateExciseReport(inventory: ProductInventory[], monthYear: string) {
  const workbook = XLSX.utils.book_new();
  
  // 1. Ledger Sheet
  const ledgerData = inventory.map(item => {
    const salesMl = item.sales * 60;
    const totalIn = item.openingStock.totalMl + item.purchases.totalMl;
    const totalOut = salesMl + item.wastage;
    const calculatedClosingMl = totalIn - totalOut;
    
    return {
      'Brand Name': item.productName,
      'Size (ML)': item.config.size,
      'Opening (Btl)': item.openingStock.totalBottles,
      'Purchases (Btl)': item.purchases.totalBottles,
      'Sales (Pegs)': item.sales,
      'Wastage (ML)': item.wastage,
      'Closing (Btl)': item.currentStock.totalBottles,
      'Stock Discrepancy (ML)': Math.round(item.currentStock.totalMl - calculatedClosingMl),
      'Status': Math.abs(item.currentStock.totalMl - calculatedClosingMl) < 1 ? 'MATCHED' : 'AUDIT_REQ'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(ledgerData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Excise Ledger');

  // 2. Automated Tax Summary
  // Food GST: 5%, Liquor: 18% (GST) + Excise
  const totalBarSalesPegs = inventory.reduce((a, i) => a + i.sales, 0);
  const estBarRevenue = totalBarSalesPegs * 180; // Estimated avg price per peg
  const foodRevenue = 450000; // Mock base for dining

  const summary = [
    { 'Category': 'Dining & Food', 'Base Revenue': foodRevenue, 'GST Rate': '5%', 'CGST': foodRevenue * 0.025, 'SGST': foodRevenue * 0.025, 'Total Tax': foodRevenue * 0.05 },
    { 'Category': 'Liquor Portfolio', 'Base Revenue': estBarRevenue, 'GST Rate': '18%', 'CGST': estBarRevenue * 0.09, 'SGST': estBarRevenue * 0.09, 'Total Tax': estBarRevenue * 0.18 },
    { 'Category': 'TOTALS', 'Base Revenue': foodRevenue + estBarRevenue, 'GST Rate': '-', 'CGST': (foodRevenue * 0.025) + (estBarRevenue * 0.09), 'SGST': (foodRevenue * 0.025) + (estBarRevenue * 0.09), 'Total Tax': (foodRevenue * 0.05) + (estBarRevenue * 0.18) }
  ];

  const taxWS = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(workbook, taxWS, 'Monthly Tax Summary');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `Deepa_Official_Registry_${monthYear.replace(' ', '_')}.xlsx`);
}

/**
 * Generate Monthly Auditor Summary with individual transaction logs
 */
export async function generateAuditorExport(dailySales: any[], expenses: any[]) {
  const workbook = XLSX.utils.book_new();

  // 1. Sales Matrix
  const salesData = dailySales.map(s => ({
    'Date': s.date,
    'Room Revenue': s.roomRent,
    'Dining Revenue': s.restaurantBills,
    'Bar Revenue': s.barSales,
    'Daily Total': s.roomRent + s.restaurantBills + s.barSales,
    'Est. GST (Food/Room 5%)': (s.roomRent + s.restaurantBills) * 0.05,
    'Est. GST (Bar 18%)': s.barSales * 0.18
  }));
  const salesWS = XLSX.utils.json_to_sheet(salesData);
  XLSX.utils.book_append_sheet(workbook, salesWS, 'Revenue Matrix');

  // 2. Expense Protocol
  const expenseData = expenses.map(e => ({
    'Date': e.date,
    'Category': e.category,
    'Description': e.description,
    'Amount': e.amount,
    'Input Tax Credit (18% Est.)': e.amount * 0.18
  }));
  const expenseWS = XLSX.utils.json_to_sheet(expenseData);
  XLSX.utils.book_append_sheet(workbook, expenseWS, 'Expenditure Log');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `Deepa_CA_Audit_File_${new Date().toISOString().split('T')[0]}.xlsx`);
}
