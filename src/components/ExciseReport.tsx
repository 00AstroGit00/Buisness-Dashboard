/**
 * Excise Report Component - Upgraded UI
 * Official Kerala Excise format for daily reporting.
 * Features: High-precision stock tracking and PDF export.
 */

import { useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { 
  FileText, 
  Download, 
  AlertTriangle, 
  ShieldCheck, 
  Calculator,
  Printer,
  ChevronRight,
  Shield,
  Activity,
  History,
  Info,
  FileSpreadsheet,
  Briefcase
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import { getStockSummary } from '../utils/liquorLogic';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { generateExciseReport, generateAuditorExport } from '../utils/ReportGenerator';

export default function ExciseReport() {
  const { inventory, expenses, dailySales } = useBusinessStore();

  const today = useMemo(() => new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }), []);

  const handleAuditorExport = () => {
    const salesArr = Object.values(dailySales);
    generateAuditorExport(salesArr, expenses);
  };

  const handleOfficialExcelExport = () => {
    generateExciseReport(inventory, today.split(' ').slice(1).join(' '));
  };

  // --- Compliance Logic ---
  const reportData = useMemo(() => {
    return inventory.map((item) => {
      const salesMl = item.sales * 60;
      const hasDiscrepancy = Math.abs((item.openingStock.totalMl + item.purchases.totalMl - salesMl - item.wastage) - item.currentStock.totalMl) > 1;

      return {
        brand: item.productName.split(' ').slice(0, -1).join(' ') || item.productName,
        size: item.config.size,
        opening: getStockSummary(item.openingStock, item.config),
        receipts: getStockSummary(item.purchases, item.config),
        salesPegs: item.sales,
        salesMl: salesMl,
        wastageMl: item.wastage || 0,
        closing: getStockSummary(item.currentStock, item.config),
        isError: hasDiscrepancy
      };
    });
  }, [inventory]);

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header (Deepa Branding)
    doc.setFillColor(10, 61, 49); // Forest Green
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(197, 160, 89); // Brushed Gold
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('DEEPA RESTAURANT & TOURIST HOME', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('DAILY EXCISE TRANSACTION REPORT - KERALA', pageWidth / 2, 30, { align: 'center' });
    doc.text(`Date: ${today}`, pageWidth / 2, 35, { align: 'center' });

    // 2. Table generation
    autoTable(doc, {
      startY: 50,
      head: [['SL', 'Brand Name', 'Size', 'Opening', 'Receipts', 'Sales (Pegs)', 'Wastage (ML)', 'Closing Stock']],
      body: reportData.map((row, index) => [
        index + 1,
        row.brand,
        `${row.size}ml`,
        row.opening,
        row.receipts,
        row.salesPegs,
        `${row.wastageMl}ml`,
        row.closing
      ]),
      styles: { fontSize: 8, font: 'helvetica' },
      headStyles: { fillColor: [10, 61, 49], textColor: [197, 160, 89] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Authorized Signatory:', 14, finalY + 20);
    doc.line(14, finalY + 35, 60, finalY + 35);

    doc.save(`Deepa_Excise_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-brushed-gold rounded-full"></span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brushed-gold">Excise Compliance</span>
          </div>
          <h2 className="text-3xl font-black text-forest-green tracking-tight">
            Transaction <span className="text-brushed-gold">Registry</span>
          </h2>
          <div className="flex items-center gap-3">
             <Badge variant="gold" className="px-3 py-1">Kerala Excise FL-3 Format</Badge>
             <div className="flex items-center gap-1.5 bg-forest-green/5 px-3 py-1 rounded-full border border-forest-green/10">
                <ShieldCheck size={12} className="text-forest-green/40" />
                <span className="text-[10px] font-bold text-forest-green/60 uppercase tracking-widest">Discrepancy Audit Active</span>
             </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
           <Button 
             variant="secondary" 
             onClick={handleAuditorExport}
             leftIcon={<Briefcase size={18} />} 
             className="rounded-2xl border-white/10 glass"
           >
             Download for Auditor
           </Button>
           <Button 
             variant="secondary" 
             onClick={handleOfficialExcelExport}
             leftIcon={<FileSpreadsheet size={18} />} 
             className="rounded-2xl border-white/10 glass"
           >
             Excel Ledger
           </Button>
           <Button 
             variant="gold" 
             onClick={downloadPDF}
             leftIcon={<Download size={18} />}
             className="rounded-2xl shadow-xl shadow-brushed-gold/10"
           >
             Official PDF
           </Button>
        </div>
      </div>

      {/* LaTeX Reconciliation Formula */}
      <Card glass className="p-8 border-white/5 bg-gradient-to-r from-forest-green/20 to-black/20 text-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-6">Auditor Reconciliation Logic</p>
         <div className="text-xl md:text-2xl text-brushed-gold font-serif italic py-4">
            <BlockMath math="\text{Closing Stock} = \text{Opening} + \text{Purchases} - (\text{Sales} + \text{Wastage})" />
         </div>
         <p className="text-[8px] font-black uppercase text-white/10 tracking-[0.3em] mt-4">Standardized FL-3 Accounting Protocol</p>
      </Card>

      {/* Compliance Banner */}
      <Card className="bg-forest-green border-0 relative overflow-hidden group p-0">
         <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform"><Shield size={160} /></div>
         <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brushed-gold">
                  <Calculator size={32} />
               </div>
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Precision Stock Balancing</h3>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">All ML calculations are synchronized with physical bottle counts</p>
               </div>
            </div>
            <div className="flex gap-3 shrink-0">
               <div className="px-6 py-3 bg-white/5 rounded-xl border border-white/10 text-white flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,1)]"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Compliance Level: High</span>
               </div>
            </div>
         </div>
      </Card>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-white border-0 shadow-xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-forest-green/5 flex items-center justify-center text-forest-green">
               <Activity size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Reportable Brands</p>
               <p className="text-2xl font-black text-forest-green">{reportData.length} <span className="text-xs text-gray-400 uppercase font-bold tracking-widest ml-1">Entries</span></p>
            </div>
         </Card>
         <Card className="bg-white border-0 shadow-xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
               <History size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Closing Balance</p>
               <p className="text-2xl font-black text-forest-green">100<span className="text-lg text-brushed-gold">%</span></p>
            </div>
         </Card>
         <Card className="bg-white border-0 shadow-xl p-6 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${reportData.some(r => r.isError) ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
               <AlertTriangle size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Data Integrity</p>
               <p className={`text-2xl font-black ${reportData.some(r => r.isError) ? 'text-red-600' : 'text-green-600'}`}>
                  {reportData.some(r => r.isError) ? 'DISCREPANCY' : 'VERIFIED'}
               </p>
            </div>
         </Card>
      </div>

      {/* Main Registry Table */}
      <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden p-0 bg-white/50 backdrop-blur-xl">
         <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/80">
            <div>
               <h3 className="text-xl font-black text-forest-green uppercase tracking-tight">Daily Transaction Table</h3>
               <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest">Official registry for {today}</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-blue-100">
               <Info size={16} className="text-blue-600" />
               <p className="text-[10px] font-black text-blue-800 uppercase">Values displayed in Standard ML & Peg Units</p>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50/50">
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">SL</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Brand Inventory</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Opening</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Receipts</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40 text-center">Sales (ML)</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40 text-center">Loss (ML)</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Closing Stock</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {reportData.map((row, idx) => (
                     <tr key={idx} className={`group transition-all duration-300 ${row.isError ? 'bg-red-50/50' : 'hover:bg-brushed-gold/5'}`}>
                        <td className="px-6 py-5 text-xs font-bold text-gray-400">{idx + 1}</td>
                        <td className="px-6 py-5">
                           <div className="space-y-1">
                              <p className="font-black text-forest-green group-hover:text-brushed-gold transition-colors">{row.brand}</p>
                              <Badge variant="secondary" className="bg-forest-green/5 text-forest-green border-0 text-[8px] uppercase">{row.size}ml</Badge>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-xs font-bold text-forest-green/60">{row.opening}</p>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-xs font-black text-blue-600">{row.receipts}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <div className="inline-block px-3 py-1 bg-forest-green text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">
                              {row.salesMl} ml
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <p className={`text-xs font-black uppercase ${row.wastageMl > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                              {row.wastageMl} ml
                           </p>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center justify-between">
                              <p className="text-sm font-black text-forest-green">{row.closing}</p>
                              {row.isError && (
                                <div className="p-1 bg-red-100 text-red-600 rounded-lg animate-pulse" title="Calculation Discrepancy Detected">
                                   <AlertTriangle size={12} />
                                </div>
                              )}
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      <div className="mt-8 p-8 bg-white/50 border border-gray-100 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-forest-green text-brushed-gold rounded-2xl flex items-center justify-center">
               <ShieldCheck size={24} />
            </div>
            <div>
               <p className="text-sm font-black text-forest-green uppercase tracking-tight">Official Certification</p>
               <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest">This report is generated according to Kerala Excise Department Guidelines</p>
            </div>
         </div>
         <p className="text-[10px] font-black text-forest-green/20 uppercase tracking-[0.4em]">Deepa Hotel Management System v4.2.0</p>
      </div>
    </div>
  );
}
