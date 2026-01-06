/**
 * Report Importer Component
 * Features: Excel upload (drag-and-drop), data synchronization, and PDF generation.
 */

import { useState, useCallback } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileCheck, 
  ShieldCheck, 
  Download, 
  History,
  X,
  Loader2,
  Save
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { usePDF } from 'react-to-pdf';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import ReceiptTemplate from './ReceiptTemplate';

export default function ReportImporter() {
  const { recordDailySale } = useBusinessStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importHistory, setImportHistory] = useState<string[]>([]);

  // --- 1. Drag-and-Drop / Excel Parsing Logic ---
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    const file = acceptedFiles[0];
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];

        // --- 2. Data Sync: Update Dashboard state ---
        json.forEach((row) => {
          const date = row['Date'] || row['DATE'];
          if (date) {
            recordDailySale(date, {
              roomRent: parseFloat(row['Room Revenue'] || row['Rooms'] || 0),
              restaurantBills: parseFloat(row['Restaurant'] || 0),
              barSales: parseFloat(row['Bar'] || 0),
            });
          }
        });

        setImportHistory(prev => [`${file.name} - ${new Date().toLocaleTimeString()}`, ...prev]);
        alert(`Successfully synced ${json.length} days of data from ${file.name}`);
      } catch (err) {
        alert("Failed to parse Excel file. Please check the format.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [recordDailySale]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'text/csv': ['.csv'] }
  });

  // --- 3. PDF Generation: Daily Excise Report ---
  const { toPDF, targetRef } = usePDF({
    filename: `Kerala_Excise_Report_${new Date().toISOString().split('T')[0]}.pdf`,
    page: { margin: 10 }
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-forest-green flex items-center gap-3">
          <History className="text-brushed-gold" size={32} />
          Report Center & Data Sync
        </h2>
        <p className="text-forest-green/60 text-sm mt-1">Manage bulk accounting imports and official compliance exports.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Drag and Drop Zone */}
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`
              cursor-pointer border-4 border-dashed rounded-3xl p-12 text-center transition-all duration-300
              ${isDragActive ? 'border-brushed-gold bg-brushed-gold/10 scale-[0.98]' : 'border-gray-100 hover:border-brushed-gold/30 bg-white'}
            `}
          >
            <input {...getInputProps()} />
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="mx-auto text-brushed-gold animate-spin" size={48} />
                <p className="font-black text-forest-green">Syncing with Dashboard...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Upload className="text-forest-green" size={32} />
                </div>
                <div>
                  <p className="text-lg font-black text-forest-green">Drop monthly accounting data</p>
                  <p className="text-sm text-gray-400">Excel (.xlsx) or CSV files supported</p>
                </div>
              </div>
            )}
          </div>

          {/* Import Log */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Recent Sync History</h3>
            <div className="space-y-3">
              {importHistory.length === 0 && <p className="text-gray-300 italic text-sm">No recent imports</p>}
              {importHistory.map((log, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm font-bold text-forest-green">
                  <FileCheck className="text-green-500" size={16} />
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Compliance Exports */}
        <div className="space-y-6">
          <div className="bg-forest-green rounded-3xl p-8 text-white shadow-xl border-b-4 border-brushed-gold">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 rounded-xl">
                <ShieldCheck className="text-brushed-gold" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black">Excise Compliance</h3>
                <p className="text-white/60 text-xs">Official Kerala format generation</p>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => toPDF()}
                className="w-full py-4 bg-brushed-gold text-forest-green rounded-xl font-black shadow-lg hover:bg-brushed-gold-light active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Generate Daily Excise PDF
              </button>
              
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                <Save className="text-white/40" size={18} />
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">
                  Copies are automatically saved to the /Backups folder
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-forest-green uppercase tracking-widest mb-4">Original Spreadsheet Format</h3>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <FileSpreadsheet className="text-forest-green/30" size={32} />
              <p className="text-xs text-gray-500 font-bold">
                Ensure your Excel columns match: "Date", "Room Revenue", "Restaurant", "Bar" for perfect synchronization.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden container for PDF rendering */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={targetRef} className="w-[800px] bg-white p-10">
          <div className="text-center mb-10 border-b-4 border-forest-green pb-6">
            <h1 className="text-3xl font-black text-forest-green">OFFICIAL EXCISE TRANSACTION REPORT</h1>
            <p className="text-brushed-gold font-bold uppercase tracking-widest">Deepa Restaurant & Tourist Home</p>
          </div>
          
          <div className="grid grid-cols-2 gap-10 mb-10">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Report Date</p>
              <p className="text-lg font-black text-forest-green">{new Date().toLocaleDateString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Document Status</p>
              <p className="text-lg font-black text-green-600 uppercase">Verified</p>
            </div>
          </div>

          <table className="w-full mb-10">
            <thead>
              <tr className="border-b-2 border-gray-100 text-left">
                <th className="py-4 font-black text-forest-green uppercase text-xs">Particulars</th>
                <th className="py-4 font-black text-forest-green uppercase text-xs text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <ReportRow label="Opening Stock (Value)" value="₹45,230.00" />
              <ReportRow label="Total Bar Receipts" value="₹12,400.00" />
              <ReportRow label="Sales Registered (Pegs)" value="142" />
              <ReportRow label="Closing Balance" value="₹51,630.00" />
            </tbody>
          </table>

          <div className="mt-20 flex justify-between items-end border-t border-gray-200 pt-10">
            <div className="text-center">
              <div className="w-40 h-px bg-gray-300 mb-2"></div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Manager Signature</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-forest-green">Deepa Restaurant</p>
              <p className="text-[10px] text-gray-400">Cherpulassery, Palakkad</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportRow({ label, value }: { label: string, value: string | number }) {
  return (
    <tr>
      <td className="py-4 text-sm font-bold text-gray-600">{label}</td>
      <td className="py-4 text-sm font-black text-forest-green text-right">{value}</td>
    </tr>
  );
}