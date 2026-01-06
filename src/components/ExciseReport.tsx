/**
 * Excise Report Component
 * Generates the official Kerala Excise Transaction Report.
 * Features: High-precision math (4 decimal places) and Excel Export.
 */

import { useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Table, 
  ShieldCheck, 
  Calculator,
  Printer,
  ChevronRight
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import { getStockSummary } from '../utils/liquorLogic';
import { exportInventoryToExcel } from '../utils/endOfDayExporter';

export default function ExciseReport() {
  const { inventory } = useBusinessStore();

  const today = useMemo(() => new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }), []);

  // --- High Precision Calculations ---
  const reportData = useMemo(() => {
    return inventory.map((item) => {
      const openingMl = item.openingStock.totalMl;
      const receiptsMl = item.purchases.totalMl;
      const salesMl = item.sales * 60;
      const closingMl = Math.max(0, openingMl + receiptsMl - salesMl);
      
      // Closing Stock Value (4 Decimal Precision as requested)
      const unitPrice = item.priceData.purchaseCostPerCase / (item.config.bottlesPerCase || 1);
      const closingValue = (closingMl / item.config.mlPerBottle) * unitPrice;

      return {
        ...item,
        brand: item.productName.split(' ').slice(0, -1).join(' '),
        size: item.config.size,
        opening: getStockSummary(item.openingStock, item.config),
        receipts: getStockSummary(item.purchases, item.config),
        salesPegs: item.sales,
        salesMl: salesMl,
        closing: getStockSummary(item.currentStock, item.config),
        closingValue: closingValue.toFixed(4)
      };
    });
  }, [inventory]);

  const handleExport = () => {
    // Reuses the endOfDayExporter which matches original Excel format
    exportInventoryToExcel(inventory, { 
      date: new Date().toISOString().split('T')[0],
      totalPegsSold: inventory.reduce((s, i) => s + i.sales, 0)
    } as any);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Branded Header */}
      <div className="bg-forest-green p-8 rounded-2xl border-b-4 border-brushed-gold shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brushed-gold/20 rounded-xl">
              <ShieldCheck className="text-brushed-gold" size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">Daily Excise Transaction Report</h2>
              <p className="text-brushed-gold font-bold uppercase tracking-widest text-xs mt-1">Kerala Excise Department Compliance</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-white/60 text-xs font-black uppercase">Report Date</p>
            <p className="text-xl font-black text-brushed-gold">{today}</p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-100 text-forest-green rounded-xl font-bold hover:bg-gray-50 transition-all">
          <Printer size={18} /> Print Official Copy
        </button>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-2 bg-forest-green text-brushed-gold rounded-xl font-bold shadow-lg hover:bg-forest-green-light active:scale-95 transition-all"
        >
          <Download size={18} /> Export to Excel (.xlsx)
        </button>
      </div>

      {/* Official Table */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-black text-forest-green/40 uppercase tracking-tighter">SL</th>
                <th className="p-4 text-xs font-black text-forest-green/40 uppercase">Brand / Description</th>
                <th className="p-4 text-xs font-black text-forest-green/40 uppercase">Vol</th>
                <th className="p-4 text-xs font-black text-forest-green/40 uppercase">Opening Stock</th>
                <th className="p-4 text-xs font-black text-forest-green/40 uppercase">Receipts</th>
                <th className="p-4 text-xs font-black text-forest-green/40 uppercase">Total Sales (Pegs)</th>
                <th className="p-4 text-xs font-black text-forest-green/40 uppercase">Closing Stock</th>
                <th className="p-4 text-xs font-black text-forest-green/40 uppercase text-right">Value (4-Dec)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-forest-green/[0.02] transition-colors group">
                  <td className="p-4 text-xs font-bold text-gray-400">{idx + 1}</td>
                  <td className="p-4">
                    <p className="font-black text-forest-green group-hover:text-brushed-gold transition-colors">{row.brand}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-forest-green text-brushed-gold text-[10px] font-black rounded">{row.size}ml</span>
                  </td>
                  <td className="p-4 text-sm font-bold text-forest-green/70">{row.opening}</td>
                  <td className="p-4 text-sm font-bold text-blue-600">{row.receipts}</td>
                  <td className="p-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-base font-black text-forest-green">{row.salesPegs}</span>
                      <span className="text-[9px] font-black text-gray-400 uppercase">{row.salesMl} ml</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-black text-forest-green">{row.closing}</td>
                  <td className="p-4 text-right">
                    <p className="font-black text-forest-green">₹{row.closingValue}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Note */}
      <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl flex items-start gap-3">
        <Calculator className="text-amber-600 mt-1" size={20} />
        <div>
          <p className="text-sm font-bold text-amber-900">Accounting Precision Notice</p>
          <p className="text-xs text-amber-700">All closing values are calculated using 4-decimal precision based on current unit costs to satisfy local audit requirements.</p>
        </div>
      </div>
    </div>
  );
}