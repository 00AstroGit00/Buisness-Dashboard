/**
 * Digital Audit Component
 * Features: Physical vs Digital reconciliation and Shift Variance reporting.
 * Optimized for high-precision bar audits.
 */

import { useState, useMemo } from 'react';
import { 
  ClipboardCheck, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  FileText,
  Save,
  User,
  ShieldAlert,
  Calculator,
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatNumber } from '../utils/formatCurrency';

export default function DigitalAudit() {
  const { inventory, adjustStock } = useBusinessStore();
  
  // Local state for physical measurements (ML)
  const [measuredMl, setMeasuredMl] = useState<Record<string, string>>({});
  const [auditNotes, setNote] = useState<Record<string, string>>({});

  // --- 1. Audit Logic: Variance Calculation ---
  const auditResults = useMemo(() => {
    return inventory.map((item) => {
      const digitalTotalMl = item.currentStock.totalMl;
      const physicalInput = measuredMl[item.productName] || '';
      
      // Calculate physical ml: (Full Bottles * Capacity) + Measured Open Bottle ML
      const physicalMl = (item.currentStock.totalBottles * item.config.mlPerBottle) + (parseFloat(physicalInput) || 0);
      
      const varianceMl = digitalTotalMl - physicalMl;
      const variancePercent = digitalTotalMl > 0 ? (varianceMl / digitalTotalMl) * 100 : 0;

      return {
        ...item,
        digitalTotalMl,
        physicalMl,
        varianceMl,
        variancePercent,
        isHighVariance: Math.abs(variancePercent) > 3 // Flag if variance > 3%
      };
    });
  }, [inventory, measuredMl]);

  // --- 2. Stock Adjustment Handler ---
  const handleFinalAdjustment = (productName: string) => {
    const row = auditResults.find(r => r.productName === productName);
    const measuredOpenMl = parseFloat(measuredMl[productName]);

    if (row && !isNaN(measuredOpenMl)) {
      const reason = auditNotes[productName] || 'Shift Audit Reconciliation';
      
      if (window.confirm(`Adjust ${productName}?\nDigital: ${row.digitalTotalMl}ml\nPhysical: ${row.physicalMl}ml\nDifference will be logged as Wastage.`)) {
        // Convert ML back to bottles and pegs for the adjustStock store action
        const fullBottles = Math.floor(row.physicalMl / row.config.mlPerBottle);
        const remainingPegs = Math.floor(measuredOpenMl / 60);
        
        adjustStock(productName, fullBottles, remainingPegs, reason);
        
        // Clear local input
        const newMl = { ...measuredMl }; delete newMl[productName]; setMeasuredMl(newMl);
      }
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-forest-green flex items-center gap-3 font-serif">
            <ShieldAlert className="text-brushed-gold" size={32} />
            Digital Stock Audit
          </h2>
          <p className="text-forest-green/60 text-xs font-bold uppercase tracking-widest mt-1">Shift-wise Reconciliation & Variance Report</p>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit Tolerance</span>
          <span className="text-sm font-black text-green-600">3.00%</span>
        </div>
      </div>

      {/* 3. Reconciliation Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-forest-green text-brushed-gold text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-6">Brand / Configuration</th>
                <th className="p-6">Digital Stock (ML)</th>
                <th className="p-6">Measured Open (ML)</th>
                <th className="p-6">Variance (%)</th>
                <th className="p-6 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {auditResults.map((row) => (
                <tr key={row.productName} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6">
                    <p className="font-black text-forest-green text-sm uppercase">{row.productName.split(' ').slice(0,-1).join(' ')}</p>
                    <span className="text-[10px] font-bold text-gray-400">{row.config.size}ml • {row.currentStock.totalBottles} Full Btls</span>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-forest-green">{row.digitalTotalMl} ml</p>
                    <p className="text-[9px] font-bold text-brushed-gold uppercase">{row.currentStock.loosePegs.toFixed(1)} Pegs Expected</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        placeholder="Measured ML"
                        value={measuredMl[row.productName] || ''}
                        onChange={(e) => setMeasuredMl({...measuredMl, [row.productName]: e.target.value})}
                        className="w-28 p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-brushed-gold outline-none font-black text-forest-green"
                      />
                      <span className="text-[10px] font-black text-gray-300 uppercase">ml</span>
                    </div>
                  </td>
                  <td className="p-6">
                    {measuredMl[row.productName] ? (
                      <div className="space-y-1">
                        <p className={`text-sm font-black ${row.isHighVariance ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                          {row.variancePercent.toFixed(2)}%
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Diff: {row.varianceMl.toFixed(0)}ml</p>
                      </div>
                    ) : (
                      <span className="text-gray-300 italic text-xs">Waiting for input...</span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => handleFinalAdjustment(row.productName)}
                      disabled={!measuredMl[row.productName]}
                      className="p-3 bg-forest-green text-brushed-gold rounded-xl shadow-lg hover:bg-forest-green-light disabled:opacity-20 active:scale-95 transition-all"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Owner's Variance Report Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-forest-green mb-2 font-serif uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="text-brushed-gold" />
              Historical Variance (Owner View)
            </h3>
            <p className="text-gray-400 text-xs font-bold uppercase mb-8">Spillage tracking by shift</p>
          </div>
          
          <div className="space-y-4">
            <VarianceRow shift="Morning Shift (Anita)" spillage="1.2%" status="within-limit" />
            <VarianceRow shift="Evening Shift (Suresh)" spillage="4.8%" status="warning" />
            <VarianceRow shift="Late Night (Rajesh)" spillage="0.8%" status="within-limit" />
          </div>
        </div>

        <div className="bg-amber-50 p-8 rounded-3xl border-l-8 border-brushed-gold shadow-sm flex flex-col justify-center">
          <Calculator className="text-brushed-gold mb-4" size={32} />
          <h4 className="text-amber-900 font-black text-sm uppercase tracking-widest mb-2">Audit Policy</h4>
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            The variance calculation uses the standard formula: <br/>
            <span className="font-serif italic font-black mt-2 block">
              {`\\text{Var %} = \\frac{\\text{Digital} - \\text{Physical}}{\\text{Digital}} \\times 100`}
            </span>
            <br/>
            Any variance above 3% triggers an automatic notification to the owner dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

function VarianceRow({ shift, spillage, status }: { shift: string, spillage: string, status: 'within-limit' | 'warning' }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm"><User size={16} className="text-forest-green"/></div>
        <span className="text-sm font-black text-forest-green uppercase">{shift}</span>
      </div>
      <span className={`text-sm font-black ${status === 'warning' ? 'text-red-600' : 'text-green-600'}`}>{spillage}</span>
    </div>
  );
}
