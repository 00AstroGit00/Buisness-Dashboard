/**
 * Digital Audit Component
 * Stock reconciliation and audit utilities for Bar Manager
 * Includes QR code generation for transaction history
 */

import { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ClipboardCheck,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  QrCode,
  Download,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useStore } from '../store/Store';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import {
  transactionHistory,
  generateProductId,
  type Transaction,
} from '../store/transactionHistory';
import type { ProductInventory } from '../utils/liquorLogic';

interface ReconciliationRow {
  productId: string;
  productName: string;
  volume: string; // e.g., "750ml"
  batchNo: string; // Placeholder - would come from invoices
  openingStock: number; // in pegs
  newPurchases: number; // in pegs
  totalAvailable: number; // Opening + Purchases
  totalPegSales: number; // Total pegs sold
  expectedClosing: number; // Expected closing stock in pegs
  actualClosing: number; // Actual closing stock from currentStock
  discrepancy: number; // Difference (positive = missing stock)
  transactions: Transaction[];
}

export default function DigitalAudit() {
  const { inventory } = useStore();
  const [auditMode, setAuditMode] = useState(false);
  const [selectedProductForQR, setSelectedProductForQR] = useState<string | null>(null);

  // Generate reconciliation data
  const reconciliationData: ReconciliationRow[] = useMemo(() => {
    return inventory.map((item: ProductInventory) => {
      const productId = generateProductId(item.productName, item.config.size);
      const transactions = transactionHistory.getProductTransactions(productId);

      // Calculate stock in pegs
      const openingStockPegs = item.openingStock.totalPegs || 0;
      const purchasesPegs = item.purchases.totalPegs || 0;
      const totalAvailable = openingStockPegs + purchasesPegs;
      const totalPegSales = item.sales || 0;
      const expectedClosing = totalAvailable - totalPegSales;
      const actualClosing = item.currentStock.totalPegs || 0;
      const discrepancy = expectedClosing - actualClosing;

      // Generate batch number from product name hash (placeholder - should come from invoices)
      const batchNo = `BATCH-${Math.abs(
        item.productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      )
        .toString(36)
        .toUpperCase()
        .substring(0, 8)}`;

      return {
        productId,
        productName: item.productName.replace(/\s+\d+ml$/, '').trim(), // Remove size suffix
        volume: `${item.config.size}ml`,
        batchNo,
        openingStock: openingStockPegs,
        newPurchases: purchasesPegs,
        totalAvailable,
        totalPegSales,
        expectedClosing,
        actualClosing,
        discrepancy,
        transactions,
      };
    });
  }, [inventory]);

  // Filter items with discrepancies
  const itemsWithDiscrepancy = useMemo(() => {
    return reconciliationData.filter((row) => Math.abs(row.discrepancy) > 0.1); // Allow 0.1 peg tolerance
  }, [reconciliationData]);

  // Generate QR code data for a product
  const generateQRCodeData = (row: ReconciliationRow): string => {
    const transactionHistoryText = row.transactions
      .map((t) => {
        const date = new Date(t.timestamp).toLocaleString('en-IN', {
          dateStyle: 'short',
          timeStyle: 'short',
        });
        const typeLabel = t.type === 'sale' ? 'SALE' : t.type === 'purchase' ? 'PURCHASE' : 'WASTAGE';
        return `${date} | ${typeLabel} | ${t.quantity}${t.type === 'sale' ? ' peg (60ml)' : t.type === 'wastage' ? ' ml' : ' units'}`;
      })
      .join('\n');

    return `DEEPA BAR AUDIT
========================
Product: ${row.productName}
Volume: ${row.volume}
Batch: ${row.batchNo}
------------------------
Transaction History:
${transactionHistoryText || 'No transactions recorded'}
------------------------
Opening Stock: ${formatNumber(row.openingStock, 1)} pegs
New Purchases: ${formatNumber(row.newPurchases, 1)} pegs
Total Sales: ${formatNumber(row.totalPegSales, 1)} pegs
Expected Closing: ${formatNumber(row.expectedClosing, 1)} pegs
Actual Closing: ${formatNumber(row.actualClosing, 1)} pegs
Discrepancy: ${row.discrepancy > 0 ? '+' : ''}${formatNumber(row.discrepancy, 1)} pegs
========================
Generated: ${new Date().toLocaleString('en-IN')}`;
  };

  // Export reconciliation report
  const exportReconciliationReport = () => {
    const reportLines = [
      'DEEPA RESTAURANT & TOURIST HOME - DIGITAL AUDIT REPORT',
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      '='.repeat(80),
      '',
    ];

    reconciliationData.forEach((row) => {
      reportLines.push(`Product: ${row.productName} (${row.volume})`);
      reportLines.push(`Batch No: ${row.batchNo}`);
      reportLines.push(`Opening Stock: ${formatNumber(row.openingStock, 1)} pegs`);
      reportLines.push(`New Purchases: ${formatNumber(row.newPurchases, 1)} pegs`);
      reportLines.push(`Total Available: ${formatNumber(row.totalAvailable, 1)} pegs`);
      reportLines.push(`Total Peg Sales: ${formatNumber(row.totalPegSales, 1)} pegs`);
      reportLines.push(`Expected Closing: ${formatNumber(row.expectedClosing, 1)} pegs`);
      reportLines.push(`Actual Closing: ${formatNumber(row.actualClosing, 1)} pegs`);
      reportLines.push(
        `Discrepancy: ${row.discrepancy > 0 ? '+' : ''}${formatNumber(row.discrepancy, 1)} pegs ${
          Math.abs(row.discrepancy) > 0.1 ? '⚠️' : '✓'
        }`
      );
      reportLines.push('-'.repeat(80));
      reportLines.push('');
    });

    const reportText = reportLines.join('\n');
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Digital_Audit_Report_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-forest-green mb-2 flex items-center gap-3">
              <ClipboardCheck className="text-brushed-gold" size={32} />
              Digital Audit & Reconciliation
            </h2>
            <p className="text-forest-green/70">
              Stock vs Sale reconciliation with transaction history tracking
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={exportReconciliationReport}
              className="px-4 py-2 bg-forest-green text-brushed-gold rounded-lg hover:bg-forest-green/90 transition-colors font-medium flex items-center gap-2 touch-manipulation"
            >
              <Download size={18} />
              Export Report
            </button>
            <button
              onClick={() => setAuditMode(!auditMode)}
              className="px-4 py-2 bg-brushed-gold text-forest-green rounded-lg hover:bg-brushed-gold/90 transition-colors font-medium flex items-center gap-2 touch-manipulation"
            >
              {auditMode ? (
                <>
                  <ToggleRight size={18} />
                  Audit Mode ON
                </>
              ) : (
                <>
                  <ToggleLeft size={18} />
                  Audit Mode OFF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Discrepancy Summary */}
        {itemsWithDiscrepancy.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-600" size={20} />
              <p className="font-semibold text-red-800">
                {itemsWithDiscrepancy.length} item(s) with stock discrepancies detected
              </p>
            </div>
            <p className="text-sm text-red-700">
              Please review the reconciliation table below and conduct physical stock count.
            </p>
          </div>
        )}
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white rounded-xl border border-brushed-gold/20 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-forest-green/10 border-b border-brushed-gold/20 sticky top-0 z-10">
              <tr>
                {auditMode ? (
                  <>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-forest-green">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-forest-green">
                      Volume
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-forest-green">
                      Batch No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-forest-green">
                      Closing Balance
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-forest-green">
                      QR Code
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-forest-green">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-forest-green">
                      Volume
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-forest-green">
                      Batch No
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-forest-green">
                      Opening Stock
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-forest-green">
                      New Purchases
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-forest-green">
                      Total Available
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-forest-green">
                      Total Peg Sales
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-forest-green">
                      Expected Closing
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-forest-green">
                      Actual Closing
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-forest-green">
                      Discrepancy
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-forest-green">
                      QR Code
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-brushed-gold/10">
              {reconciliationData.length === 0 ? (
                <tr>
                  <td
                    colSpan={auditMode ? 5 : 11}
                    className="px-4 py-8 text-center text-forest-green/50"
                  >
                    No inventory data available
                  </td>
                </tr>
              ) : (
                reconciliationData.map((row) => {
                  const hasDiscrepancy = Math.abs(row.discrepancy) > 0.1;
                  return (
                    <tr
                      key={row.productId}
                      className={`hover:bg-forest-green/5 transition-colors ${
                        hasDiscrepancy ? 'bg-red-50/50' : ''
                      }`}
                    >
                      {auditMode ? (
                        <>
                          {/* Audit Mode: Simplified Regulatory View */}
                          <td className="px-4 py-3 text-forest-green font-medium">
                            {row.productName}
                          </td>
                          <td className="px-4 py-3 text-forest-green/70">{row.volume}</td>
                          <td className="px-4 py-3 text-forest-green/70 font-mono text-sm">
                            {row.batchNo}
                          </td>
                          <td className="px-4 py-3 text-forest-green font-semibold">
                            {formatNumber(row.actualClosing, 1)} pegs
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                setSelectedProductForQR(
                                  selectedProductForQR === row.productId ? null : row.productId
                                )
                              }
                              className="p-2 hover:bg-brushed-gold/20 rounded-lg transition-colors touch-manipulation"
                              title="Show QR Code"
                            >
                              <QrCode className="text-brushed-gold" size={20} />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Full Reconciliation View */}
                          <td className="px-4 py-3">
                            <div className="text-forest-green font-medium">{row.productName}</div>
                            {hasDiscrepancy && (
                              <div className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                <AlertTriangle size={12} />
                                Stock discrepancy
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-forest-green/70">{row.volume}</td>
                          <td className="px-4 py-3 text-forest-green/70 font-mono text-sm">
                            {row.batchNo}
                          </td>
                          <td className="px-4 py-3 text-right text-forest-green">
                            {formatNumber(row.openingStock, 1)}
                          </td>
                          <td className="px-4 py-3 text-right text-forest-green">
                            {formatNumber(row.newPurchases, 1)}
                          </td>
                          <td className="px-4 py-3 text-right text-forest-green font-semibold">
                            {formatNumber(row.totalAvailable, 1)}
                          </td>
                          <td className="px-4 py-3 text-right text-forest-green">
                            {formatNumber(row.totalPegSales, 1)}
                          </td>
                          <td className="px-4 py-3 text-right text-forest-green">
                            {formatNumber(row.expectedClosing, 1)}
                          </td>
                          <td className="px-4 py-3 text-right text-forest-green font-semibold">
                            {formatNumber(row.actualClosing, 1)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {hasDiscrepancy ? (
                              <span className="text-red-600 font-semibold flex items-center justify-end gap-1">
                                <AlertTriangle size={14} />
                                {row.discrepancy > 0 ? '+' : ''}
                                {formatNumber(row.discrepancy, 1)}
                              </span>
                            ) : (
                              <span className="text-green-600 font-semibold flex items-center justify-end gap-1">
                                <CheckCircle size={14} />
                                {formatNumber(row.discrepancy, 1)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() =>
                                setSelectedProductForQR(
                                  selectedProductForQR === row.productId ? null : row.productId
                                )
                              }
                              className="mx-auto p-2 hover:bg-brushed-gold/20 rounded-lg transition-colors touch-manipulation flex items-center justify-center"
                              title="Show QR Code"
                            >
                              <QrCode className="text-brushed-gold" size={20} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedProductForQR && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedProductForQR(null)}
              className="absolute top-4 right-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            >
              <XCircle size={20} className="text-gray-600" />
            </button>

            {(() => {
              const row = reconciliationData.find((r) => r.productId === selectedProductForQR);
              if (!row) return null;

              const qrData = generateQRCodeData(row);

              return (
                <>
                  <h3 className="text-xl font-bold text-forest-green mb-2">
                    Transaction History QR Code
                  </h3>
                  <p className="text-sm text-forest-green/70 mb-4">
                    Scan with your S23 Ultra camera to view full transaction history
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-lg border-2 border-brushed-gold">
                      <QRCodeSVG value={qrData} size={256} level="H" includeMargin />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-forest-green mb-1">{row.productName}</p>
                      <p className="text-sm text-forest-green/70">{row.volume} • {row.batchNo}</p>
                      <p className="text-xs text-forest-green/50 mt-2">
                        {row.transactions.length} transaction(s) recorded
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

