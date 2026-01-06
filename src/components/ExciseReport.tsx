/**
 * Excise Report Component
 * Official Kerala Excise format for daily reporting.
 * Features: High-precision stock tracking and PDF export.
 */

import { useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FileText, 
  Download, 
  AlertTriangle, 
  ShieldCheck, 
  Calculator,
  Printer
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import { getStockSummary } from '../utils/liquorLogic';

export default function ExciseReport() {
  const { inventory } = useBusinessStore();

  const today = useMemo(() => new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }), []);

  // --- Compliance Logic ---
  const reportData = useMemo(() => {
    return inventory.map((item) => {
      const salesMl = item.sales * 60;
      
      // Compliance Check: Flag if stock calculation has discrepancies 
      // (e.g. if ml logic doesn't match bottle counts exactly due to rounding)
      const hasDiscrepancy = Math.abs((item.openingStock.totalMl + item.purchases.totalMl - salesMl - item.wastage) - item.currentStock.totalMl) > 1;

            return {

              brand: item.productName.split(' ').slice(0, -1).join(' '),

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

      

        // --- PDF Generation Logic ---

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

            didParseCell: (data) => {

              if (data.section === 'body') {

                const rowIndex = data.row.index;

                if (reportData[rowIndex].isError) {

                  data.cell.styles.fillColor = [255, 248, 230]; // Light Gold/Yellow highlight

                  data.cell.styles.textColor = [166, 137, 63];

                }

              }

            }

          });

      

          // 3. Footer

          const finalY = (doc as any).lastAutoTable.finalY || 150;

          doc.setFontSize(9);

          doc.setTextColor(150, 150, 150);

          doc.text('Authorized Signatory:', 14, finalY + 20);

          doc.line(14, finalY + 35, 60, finalY + 35);

      

          doc.save(`Deepa_Excise_Report_${new Date().toISOString().split('T')[0]}.pdf`);

        };

      

        return (

          <div className="space-y-6 pb-20 animate-fade-in">

            {/* ... header bar and warnings ... */}

      

            {/* Report Table */}

            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>

                    <tr className="bg-forest-green text-brushed-gold">

                      <th className="p-4 text-xs font-black uppercase">SL</th>

                      <th className="p-4 text-xs font-black uppercase">Brand Name</th>

                      <th className="p-4 text-xs font-black uppercase">Size</th>

                      <th className="p-4 text-xs font-black uppercase">Opening</th>

                      <th className="p-4 text-xs font-black uppercase">Receipts</th>

                      <th className="p-4 text-xs font-black uppercase text-center">Sales (ML)</th>

                      <th className="p-4 text-xs font-black uppercase text-center">Wastage (ML)</th>

                      <th className="p-4 text-xs font-black uppercase">Closing Stock</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-50">

                    {reportData.map((row, idx) => (

                      <tr 

                        key={idx} 

                        className={`transition-colors ${row.isError ? 'bg-orange-50/50 text-orange-900' : 'hover:bg-forest-green/[0.02]'}`}

                      >

                        <td className="p-4 text-xs font-bold text-gray-400">{idx + 1}</td>

                        <td className="p-4 font-black text-forest-green">{row.brand}</td>

                        <td className="p-4">

                          <span className="px-2 py-0.5 bg-forest-green/10 text-forest-green text-[10px] font-black rounded">{row.size}ml</span>

                        </td>

                        <td className="p-4 text-sm font-bold">{row.opening}</td>

                        <td className="p-4 text-sm font-bold text-blue-600">{row.receipts}</td>

                        <td className="p-4 text-center">

                          <p className="text-xs font-black text-forest-green uppercase">{row.salesMl} ml</p>

                        </td>

                        <td className="p-4 text-center">

                          <p className="text-xs font-black text-red-600 uppercase">{row.wastageMl} ml</p>

                        </td>

                        <td className="p-4 text-sm font-black">{row.closing}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        );

      }

      
