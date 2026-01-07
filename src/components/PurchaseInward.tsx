/**
 * Purchase Inward Component - Upgraded UI
 * Upload and process liquor purchase invoices
 * Automatically updates inventory stock using case-to-bottle conversion
 */

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  Loader2, 
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  ChevronRight,
  RefreshCw,
  Database,
  History
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStore } from '../store/Store';
import {
  type ProductInventory,
  type BottleSize,
  getLiquorConfig,
  addPurchase,
  calculateInventoryValue,
  casesAndBottlesToStockState,
} from '../utils/liquorLogic';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';

interface PurchaseItem {
  brandName: string;
  volume: BottleSize; 
  caseCount: number;
  bottlesPerCase?: number; 
  purchaseCostPerCase?: number;
  lineTotal?: number;
}

interface ParsedPurchaseInvoice {
  items: PurchaseItem[];
  invoiceNumber?: string;
  invoiceDate?: string;
  supplier?: string;
  totalAmount?: number;
}

function parseBottleSize(volumeStr: string | number): BottleSize | null {
  if (typeof volumeStr === 'number') {
    if ([1000, 750, 500, 375, 650].includes(volumeStr)) return volumeStr as BottleSize;
  }
  const str = String(volumeStr).toLowerCase();
  const mlMatch = str.match(/(\d+)\s*ml/i);
  if (mlMatch) {
    const ml = parseInt(mlMatch[1]);
    if ([1000, 750, 500, 375, 650].includes(ml)) return ml as BottleSize;
  }
  const literMatch = str.match(/(\d+\.?\d*)\s*l/i);
  if (literMatch) {
    const ml = Math.round(parseFloat(literMatch[1]) * 1000);
    if ([1000, 750, 500, 375, 650].includes(ml)) return ml as BottleSize;
  }
  return null;
}

function extractBrandName(brandStr: string): string {
  return String(brandStr).trim().replace(/\s+/g, ' ').replace(/\d+\s*ml/gi, '').replace(/[()]/g, '').trim();
}

const generateInventoryId = (product: ProductInventory): string => {
  return `${product.productName.replace(/\s+/g, '_')}_${product.config.size}`;
};

export default function PurchaseInward() {
  const { inventory, updateInventoryItem, addInventoryItem } = useStore();
  const [parsedInvoice, setParsedInvoice] = useState<ParsedPurchaseInvoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [processedItems, setProcessedItems] = useState<Set<string>>(new Set());

  const parseInvoiceFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setUploadedFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
      const sheetNames = workbook.SheetNames;
      const dataSheet = workbook.Sheets[sheetNames.find(name => 
        ['invoice', 'purchase', 'items', 'bill'].some(k => name.toLowerCase().includes(k))
      ) || sheetNames[0]];

      if (!dataSheet) throw new Error('Invalid sheet structure');

      const jsonData = XLSX.utils.sheet_to_json(dataSheet, { raw: false, defval: '' }) as Record<string, unknown>[];
      const items: PurchaseItem[] = [];
      let totalAmount = 0;

      jsonData.forEach((row) => {
        const brandName = row['Brand Name'] || row['Brand'] || row['Product'] || '';
        const volumeStr = row['Volume'] || row['Size'] || '';
        const caseCount = parseFloat(String(row['Case Count'] || row['Cases'] || 0).replace(/[^\d.]/g, '')) || 0;
        const costPerCase = parseFloat(String(row['Purchase Cost'] || row['Amount'] || 0).replace(/[₹,]/g, '')) || 0;

        if (brandName && volumeStr && caseCount > 0) {
          const volume = parseBottleSize(volumeStr as string | number);
          if (volume) {
            const config = getLiquorConfig(volume, false);
            items.push({
              brandName: extractBrandName(String(brandName)),
              volume,
              caseCount,
              bottlesPerCase: config.bottlesPerCase,
              purchaseCostPerCase: costPerCase || undefined,
              lineTotal: costPerCase * caseCount,
            });
            totalAmount += costPerCase * caseCount;
          }
        }
      });

      if (items.length === 0) throw new Error('No valid items found');

      setParsedInvoice({
        items,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        invoiceDate: new Date().toLocaleDateString('en-IN'),
        supplier: 'Default Supplier',
        totalAmount,
      });
      setProcessedItems(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const onDrop = useCallback((files: File[]) => { if (files[0]) parseInvoiceFile(files[0]); }, [parseInvoiceFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  const findMatchingInventoryItem = (brand: string, vol: BottleSize) => 
    inventory.find(i => i.productName.toLowerCase().includes(brand.toLowerCase()) && i.config.size === vol);

  const processPurchaseItem = (item: PurchaseItem, key: string) => {
    if (processedItems.has(key)) return;
    const match = findMatchingInventoryItem(item.brandName, item.volume);

    if (match) {
      const updated = addPurchase(match, item.caseCount, 0);
      if (item.purchaseCostPerCase) updated.priceData.purchaseCostPerCase = item.purchaseCostPerCase;
      updateInventoryItem(generateInventoryId(match), updated);
    } else {
      const config = getLiquorConfig(item.volume, false);
      const stock = casesAndBottlesToStockState(item.caseCount, 0, config);
      addInventoryItem({
        productName: `${item.brandName} ${item.volume}ml`,
        config,
        openingStock: { totalMl: 0, fullCases: 0, looseBottles: 0, loosePegs: 0, totalBottles: 0, totalPegs: 0 },
        purchases: stock,
        sales: 0,
        priceData: { productName: item.brandName, size: item.volume, category: config.category, purchaseCostPerCase: item.purchaseCostPerCase || 0 },
        currentStock: stock,
        wastage: 0,
        remainingVolumeInCurrentBottle: 0,
      });
    }
    setProcessedItems(prev => new Set([...prev, key]));
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-brushed-gold rounded-full"></span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brushed-gold">Supply Chain</span>
          </div>
          <h2 className="text-3xl font-black text-forest-green tracking-tight">
            Purchase <span className="text-brushed-gold">Inward</span>
          </h2>
          <div className="flex items-center gap-3">
             <Badge variant="gold" className="px-3 py-1">Automated Stock Intake</Badge>
             <div className="flex items-center gap-1.5 bg-forest-green/5 px-3 py-1 rounded-full border border-forest-green/10">
                <ShieldCheck size={12} className="text-forest-green/40" />
                <span className="text-[10px] font-bold text-forest-green/60 uppercase tracking-widest">Excel Parsing v2.0</span>
             </div>
          </div>
        </div>

        <div className="flex gap-3">
           <Button variant="outline" className="rounded-2xl border-forest-green/20" leftIcon={<History size={18} />}>
              Import Log
           </Button>
        </div>
      </div>

      {!parsedInvoice ? (
        <Card className="border-0 shadow-2xl p-12 rounded-[2.5rem] bg-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform"><Database size={200} /></div>
           <div
             {...getRootProps()}
             className={`
               relative z-10 border-4 border-dashed rounded-[2rem] p-16 text-center cursor-pointer
               transition-all duration-500
               ${isDragActive ? 'border-brushed-gold bg-brushed-gold/5 scale-[0.98]' : 'border-gray-100 hover:border-brushed-gold/30 hover:bg-gray-50'}
             `}
           >
             <input {...getInputProps()} />
             {isProcessing ? (
               <div className="space-y-6">
                 <div className="relative inline-block">
                    <Loader2 className="animate-spin text-brushed-gold" size={80} />
                    <Database className="absolute inset-0 m-auto text-forest-green" size={32} />
                 </div>
                 <p className="text-xl font-black text-forest-green uppercase tracking-widest animate-pulse">Decrypting Invoice Data...</p>
               </div>
             ) : (
               <div className="space-y-6">
                 <div className="w-24 h-24 bg-forest-green text-brushed-gold rounded-3xl flex items-center justify-center mx-auto shadow-2xl group-hover:rotate-6 transition-transform">
                    <Upload size={48} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-forest-green tracking-tight">Digital Intake Terminal</h3>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Drag & Drop Excel or CSV Invoice</p>
                 </div>
                 <Button variant="gold" className="h-14 px-10 rounded-2xl shadow-xl shadow-brushed-gold/20 font-black tracking-widest uppercase text-xs">Browse Documents</Button>
               </div>
             )}
           </div>
           {error && (
             <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 animate-shake">
                <AlertTriangle className="text-red-600 shrink-0" size={32} />
                <div>
                   <p className="text-red-700 font-black uppercase tracking-widest text-xs">Intake Error</p>
                   <p className="text-red-600 font-bold text-sm">{error}</p>
                </div>
             </div>
           )}
        </Card>
      ) : (
        <div className="space-y-8 animate-scale-in">
           {/* Invoice Insight Header */}
           <Card className="bg-forest-green border-0 shadow-2xl p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform"><FileText size={140} /></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
                    <div>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Invoice ID</p>
                       <p className="text-lg font-black tracking-tight">{parsedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Disbursement Date</p>
                       <p className="text-lg font-black tracking-tight">{parsedInvoice.invoiceDate}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Entity / Vendor</p>
                       <p className="text-lg font-black tracking-tight truncate">{parsedInvoice.supplier}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Aggregate Value</p>
                       <p className="text-2xl font-black text-brushed-gold tracking-tighter">{formatCurrency(parsedInvoice.totalAmount || 0)}</p>
                    </div>
                 </div>
                 <Button variant="ghost" onClick={() => setParsedInvoice(null)} className="text-white/40 hover:text-white rounded-full w-12 h-12 p-0"><X size={24} /></Button>
              </div>
           </Card>

           {/* Line Items Terminal */}
           <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden p-0 bg-white/50 backdrop-blur-xl">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/80">
                 <div>
                    <h3 className="text-xl font-black text-forest-green uppercase tracking-tight">Intake Manifest</h3>
                    <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-widest">{parsedInvoice.items.length} Line items detected</p>
                 </div>
                 {processedItems.size < parsedInvoice.items.length && (
                   <Button variant="gold" onClick={() => parsedInvoice.items.forEach((it, i) => processPurchaseItem(it, `${it.brandName}_${i}`))} leftIcon={<Package size={18} />} className="rounded-2xl h-12 px-6">Process All</Button>
                 )}
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-gray-50/50">
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Portfolio Item</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40">Intake Volume</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40 text-right">Unit Cost</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40 text-right">Line Total</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40 text-center">Status</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-forest-green/40"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {parsedInvoice.items.map((item, idx) => {
                         const key = `${item.brandName}_${idx}`;
                         const isDone = processedItems.has(key);
                         const match = findMatchingInventoryItem(item.brandName, item.volume);
                         return (
                           <tr key={key} className={`group transition-all duration-300 ${isDone ? 'bg-green-50/30' : 'hover:bg-brushed-gold/5'}`}>
                              <td className="px-6 py-5">
                                 <div className="space-y-1">
                                    <p className="font-black text-forest-green tracking-tight">{item.brandName}</p>
                                    <div className="flex items-center gap-2">
                                       <Badge variant="secondary" className="bg-forest-green/5 text-forest-green border-0 text-[8px] uppercase">{item.volume}ml</Badge>
                                       {match && <span className="text-[8px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={8} /> Linked to Vault</span>}
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <p className="text-sm font-black text-forest-green font-mono">{item.caseCount} <span className="text-[10px] text-gray-400">Cases</span></p>
                                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.bottlesPerCase} Btl/Case</p>
                              </td>
                              <td className="px-6 py-5 text-right font-black text-forest-green">{formatCurrency(item.purchaseCostPerCase || 0)}</td>
                              <td className="px-6 py-5 text-right font-black text-forest-green text-lg">{formatCurrency(item.lineTotal || 0)}</td>
                              <td className="px-6 py-5 text-center">
                                 {isDone ? (
                                   <Badge variant="success" className="px-3 py-1 font-black text-[8px] border-0">INJECTED</Badge>
                                 ) : (
                                   <Badge variant="secondary" className="px-3 py-1 font-black text-[8px] border-0">PENDING</Badge>
                                 )}
                              </td>
                              <td className="px-6 py-5 text-right">
                                 {!isDone && (
                                   <Button variant="gold" size="xs" onClick={() => processPurchaseItem(item, key)} className="rounded-xl h-10 w-10 p-0 shadow-lg"><Plus size={18} /></Button>
                                 )}
                              </td>
                           </tr>
                         );
                       })}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}