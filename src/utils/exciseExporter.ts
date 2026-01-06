/**
 * Excise Report Exporter
 * Exports Daily Transaction Report in Kerala Excise format to Excel
 */

import * as XLSX from 'xlsx';
import type { BusinessDetails } from './complianceHelper';

export interface ExciseReportRow {
  brandName: string;
  sizeMl: number;
  openingStock: string;
  receipts: string;
  salesPegs: number;
  salesMl: number;
  closingStock: string;
  discrepancy: string | null;
}

/**
 * Export Excise Report to Excel
 * Matches Kerala Excise Department format requirements
 */
export function exportExciseReportToExcel(
  rows: ExciseReportRow[],
  reportDate: string,
  businessDetails: BusinessDetails,
  managerName: string
): void {
  const workbook = XLSX.utils.book_new();

  // Prepare data for Excel
  const excelData = rows.map((row, index) => ({
    'SL No': index + 1,
    'Brand Name': row.brandName,
    'Size (ml)': row.sizeMl,
    'Opening Stock': row.openingStock,
    'Receipts (New Stock)': row.receipts,
    'Sales (Pegs)': row.salesPegs,
    'Sales (ML)': row.salesMl,
    'Closing Stock': row.closingStock,
    'Remarks': row.discrepancy || '',
  }));

  // Add totals row
  const totalPegs = rows.reduce((sum, row) => sum + row.salesPegs, 0);
  const totalMl = rows.reduce((sum, row) => sum + row.salesMl, 0);
  const totalDiscrepancies = rows.filter((row) => row.discrepancy !== null).length;

  excelData.push({
    'SL No': '',
    'Brand Name': 'TOTAL',
    'Size (ml)': '',
    'Opening Stock': '',
    'Receipts (New Stock)': '',
    'Sales (Pegs)': totalPegs,
    'Sales (ML)': totalMl,
    'Closing Stock': '',
    'Remarks': totalDiscrepancies > 0 ? `${totalDiscrepancies} discrepancy(ies) found` : '',
  });

  // Create main report sheet
  const reportSheet = XLSX.utils.json_to_sheet(excelData);

  // Add header information (could be enhanced with merged cells for better formatting)
  XLSX.utils.book_append_sheet(workbook, reportSheet, 'Daily Transaction Report');

  // Create summary sheet
  const summaryData = [
    ['DAILY TRANSACTION REPORT - KERALA EXCISE DEPARTMENT', ''],
    ['', ''],
    ['Business Name:', businessDetails.businessName],
    ['Address:', businessDetails.address || ''],
    ['GSTIN:', businessDetails.gstNumber || ''],
    ['Report Date:', new Date(reportDate).toLocaleDateString('en-IN')],
    ['', ''],
    ['SUMMARY', ''],
    ['Total Products:', rows.length],
    ['Total Pegs Sold:', totalPegs],
    ['Total ML Sold:', totalMl],
    ['Discrepancies Found:', totalDiscrepancies],
    ['', ''],
    ['Authorized Signatory:', managerName || ''],
    ['Designation:', 'Manager'],
    ['Date:', new Date().toLocaleDateString('en-IN')],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Generate filename
  const dateStr = reportDate.replace(/-/g, '');
  const filename = `Excise_Daily_Transaction_Report_${dateStr}.xlsx`;

  // Export
  XLSX.writeFile(workbook, filename);
  console.log(`Excise Report exported: ${filename}`);
}

