/**
 * Daily Closing Wizard Component
 * Features: Multi-step EOD process, Cash reconciliation, and Digital broadcasting.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  Banknote, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  Send,
  X,
  History,
  Lock
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency, formatNumber } from '../utils/formatCurrency';
import { storeSyncManager } from '../utils/storeSync';
import PrivateNumber from './PrivateNumber';

export default function DailyClosing() {
  const { inventory, expenses, dailySales } = useBusinessStore();
  const [step, setStep] = useState(1);
  const [isClosed, setIsClosed] = useState(false);

  // Local state for reconciliation
  const [physicalCash, setPhysicalCash] = useState('');
  const [closingPegs, setClosingPegs] = useState<Record<string, string>>({});
  const [discrepancyNote, setNote] = useState('');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todaySales = dailySales[today] || { roomRent: 0, restaurantBills: 0, barSales: 0 };
  const systemTotal = todaySales.roomRent + todaySales.restaurantBills + todaySales.barSales;

  // --- Step 1: KOT Check (Simulated) ---
  const pendingKOTs = 0; // Assume all billed for prototype

  // --- Step 2: Cash Reconciliation Logic ---
  const cashDiscrepancy = useMemo(() => {
    const phys = parseFloat(physicalCash) || 0;
    return phys - systemTotal;
  }, [physicalCash, systemTotal]);

  // --- Step 3: Top 5 Brands for Closing ---
  const topBrands = useMemo(() => {
    return inventory.slice(0, 5); // Simplification for prototype
  }, [inventory]);

  // --- Handlers ---
  const handleFinalClose = () => {
    if (Math.abs(cashDiscrepancy) > 50 && !discrepancyNote) {
      alert('High discrepancy detected. Manager note is mandatory.');
      return;
    }

    setIsClosed(true);
    
    // Broadcast to Admin
    storeSyncManager.broadcast('full-sync', {
      type: 'EOD_CLOSED',
      date: today,
      total: systemTotal,
      cashReceived: physicalCash,
      note: discrepancyNote
    });

    alert('Shift Closed. Day Summary Broadcasted to Admin Dashboard.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* 1. Progress Header */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-forest-green flex items-center gap-3">
            <Lock className="text-brushed-gold" size={28} />
            Daily Closing Wizard
          </h2>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-brushed-gold' : 'bg-gray-100'}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: KOT Verification */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-400 flex items-center gap-4">
                <ClipboardCheck className="text-blue-600" size={32} />
                <div>
                  <h3 className="font-black text-blue-900 uppercase text-xs">Shift Verification</h3>
                  <p className="text-sm text-blue-800">Confirming all pending Restaurant & Bar orders are processed.</p>
                </div>
              </div>
              
              <div className="p-10 text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle size={40} />
                </div>
                <p className="font-black text-forest-green text-lg tracking-tight">All KOTs are successfully billed!</p>
                <p className="text-xs text-gray-400 font-bold uppercase">Ready for cash reconciliation</p>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 bg-forest-green text-brushed-gold rounded-xl font-black shadow-lg flex items-center justify-center gap-2"
              >
                Proceed to Cash Tally <ArrowRight size={18}/>
              </button>
            </motion.div>
          )}

          {/* Step 2: Cash Reconciliation */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Digital Total (System)</p>
                  <div className="text-3xl font-black text-forest-green tracking-tighter">
                    <PrivateNumber value={systemTotal} format={formatCurrency} />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border-2 border-forest-green/10">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Physical Cash in Drawer</p>
                  <input 
                    autoFocus
                    type="number" 
                    value={physicalCash}
                    onChange={e => setPhysicalCash(e.target.value)}
                    className="text-3xl font-black text-forest-green outline-none w-full"
                    placeholder="₹ 0.00"
                  />
                </div>
              </div>

              {physicalCash && (
                <div className={`p-6 rounded-2xl border-2 transition-all ${Math.abs(cashDiscrepancy) < 1 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-brushed-gold shadow-lg animate-pulse-gold'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black uppercase">Variance Detected</span>
                    <span className="font-black text-lg">{formatCurrency(cashDiscrepancy)}</span>
                  </div>
                  {Math.abs(cashDiscrepancy) > 1 && (
                    <textarea 
                      placeholder="High discrepancy detected. Please enter manager's note..."
                      value={discrepancyNote}
                      onChange={e => setNote(e.target.value)}
                      className="w-full p-4 rounded-xl border border-brushed-gold/30 outline-none text-sm font-bold text-forest-green"
                    />
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 text-forest-green rounded-xl font-black uppercase text-xs">Back</button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!physicalCash}
                  className="flex-[2] py-4 bg-forest-green text-brushed-gold rounded-xl font-black shadow-lg flex items-center justify-center gap-2"
                >
                  Verify Bar Inventory <ArrowRight size={18}/>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Peg Reconciliation */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h3 className="text-sm font-black text-forest-green uppercase tracking-widest border-b border-gray-100 pb-2">Record Open-Bottle Pegs</h3>
              <div className="grid grid-cols-1 gap-3">
                {topBrands.map(brand => (
                  <div key={brand.productName} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div>
                      <p className="font-black text-forest-green text-sm">{brand.productName.split(' ')[0]}</p>
                      <p className="text-[10px] font-black text-brushed-gold uppercase">Digital: {brand.currentStock.loosePegs.toFixed(1)} pegs</p>
                    </div>
                    <input 
                      type="number"
                      placeholder="Actual Pegs"
                      className="w-24 p-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-brushed-gold outline-none font-black text-center text-forest-green"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-6 flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-100 text-forest-green rounded-xl font-black uppercase text-xs">Back</button>
                <button 
                  onClick={handleFinalClose}
                  className="flex-[2] py-4 bg-brushed-gold text-forest-green rounded-xl font-black shadow-lg hover:bg-brushed-gold-light active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  COMPLETE DAILY CLOSING
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .animate-pulse-gold { animation: pulse-gold 2s infinite; }
        @keyframes pulse-gold {
          0% { border-color: rgba(197, 160, 89, 0.3); }
          50% { border-color: rgba(197, 160, 89, 1); }
          100% { border-color: rgba(197, 160, 89, 0.3); }
        }
      `}</style>
    </div>
  );
}
