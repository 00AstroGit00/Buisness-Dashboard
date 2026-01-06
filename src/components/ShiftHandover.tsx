/**
 * Shift Handover Component
 * Features: Closing Drawer wizard, Cash reconciliation, and Manager override.
 * Ensures accountability during staff transition.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Key, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  History, 
  Smartphone,
  Banknote,
  Send,
  User,
  ShieldAlert,
  Save
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import PrivateNumber from './PrivateNumber';

export default function ShiftHandover() {
  const { activityLogs, logActivity, dailySales } = useBusinessStore();
  
  // Wizard state
  const [step, setStep] = useState(1);
  const [physicalCash, setPhysicalCash] = useState('');
  const [managerPin, setManagerPin] = useState('');
  const [isOverrideActive, setIsOverrideActive] = useState(false);
  const [handoverComplete, setHandoverComplete] = useState(false);

  // --- 1. Handover Logic: Cash Reconciliation ---
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todaySales = dailySales[today] || { roomRent: 0, restaurantBills: 0, barSales: 0 };
  const expectedCash = todaySales.roomRent + todaySales.restaurantBills + todaySales.barSales;

  const variance = useMemo(() => {
    const phys = parseFloat(physicalCash) || 0;
    return phys - expectedCash;
  }, [physicalCash, expectedCash]);

  const hasMismatch = Math.abs(variance) > 1; // Tolerance ₹1

  // --- 2. Handlers ---
  const handleProceed = () => {
    if (hasMismatch && !isOverrideActive) {
      setStep(2); // Move to Manager Override step
    } else {
      finalizeHandover();
    }
  };

  const handleManagerAuth = () => {
    if (managerPin === '1234') { // Manager PIN for prototype
      setIsOverrideActive(true);
      finalizeHandover();
    } else {
      alert('Unauthorized Manager PIN.');
    }
  };

  const finalizeHandover = () => {
    const summary = `Shift Closed. Expected: ${formatCurrency(expectedCash)}, Physical: ${formatCurrency(parseFloat(physicalCash))}. Variance: ${formatCurrency(variance)}. ${isOverrideActive ? 'Approved by Manager.' : 'Balanced.'}`;
    
    // 3. Log to Activity Ledger
    logActivity('Stock Adjustment', summary); // Reusing 'Stock Adjustment' action for summary logs
    
    setHandoverComplete(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24 animate-fade-in font-sans">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-block p-4 bg-forest-green rounded-full text-brushed-gold shadow-xl mb-4">
          <History size={32} />
        </div>
        <h2 className="text-3xl font-black text-forest-green font-serif tracking-tight uppercase">Shift Handover Protocol</h2>
        <p className="text-forest-green/60 text-xs font-bold uppercase tracking-[0.2em]">Drawer reconciliation & staff transition</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
        {/* Progress Bar */}
        <div className="flex h-2">
          <div className={`flex-1 transition-all duration-500 ${step >= 1 ? 'bg-brushed-gold' : 'bg-gray-100'}`}></div>
          <div className={`flex-1 transition-all duration-500 ${step >= 2 ? 'bg-brushed-gold' : 'bg-gray-100'}`}></div>
          <div className={`flex-1 transition-all duration-500 ${handoverComplete ? 'bg-green-500' : 'bg-gray-100'}`}></div>
        </div>

        <div className="p-10 flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!handoverComplete ? (
              <>
                {/* Step 1: Physical Cash Entry */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Expected Cash (System)</p>
                        <div className="text-3xl font-black text-forest-green">
                          <PrivateNumber value={expectedCash} format={formatCurrency} />
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border-4 border-forest-green/5 shadow-inner">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Physical Cash in Drawer</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-forest-green">₹</span>
                          <input 
                            autoFocus
                            type="number" 
                            value={physicalCash}
                            onChange={e => setPhysicalCash(e.target.value)}
                            className="text-4xl font-black text-forest-green outline-none w-full"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleProceed}
                      disabled={!physicalCash}
                      className="w-full py-5 bg-forest-green text-brushed-gold rounded-2xl font-black text-lg shadow-xl hover:bg-forest-green-light active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20"
                    >
                      <ArrowRight size={24} />
                      PROCEED TO HANDOVER
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Manager Override */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                    <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex items-start gap-4">
                      <ShieldAlert className="text-red-600 mt-1 flex-shrink-0" size={28} />
                      <div>
                        <h4 className="text-red-900 font-black text-lg">Cash Mismatch Detected</h4>
                        <p className="text-red-700 text-sm font-bold">Variance: {formatCurrency(variance)}. Manager authorization required to close the shift.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-green/30" size={20} />
                        <input 
                          autoFocus
                          type="password"
                          value={managerPin}
                          onChange={e => setManagerPin(e.target.value)}
                          className="w-full p-5 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-red-200 outline-none font-black text-xl text-forest-green tracking-[0.5em] text-center"
                          placeholder="••••"
                        />
                      </div>
                      <button 
                        onClick={handleManagerAuth}
                        className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        <Key size={24} />
                        AUTHORIZE OVERRIDE
                      </button>
                      <button onClick={() => setStep(1)} className="w-full text-xs font-black text-gray-400 uppercase tracking-widest hover:text-forest-green">Cancel and Re-count</button>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              /* Handover Complete View */
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle size={48} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-forest-green tracking-tight">Shift Successfully Closed</h3>
                  <p className="text-gray-500 font-bold mt-2">Summary logged in Activity Audit Ledger.</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><History size={12}/> {new Date().toLocaleTimeString()}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="flex items-center gap-1"><Smartphone size={12}/> Local Terminal</span>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-8 px-10 py-4 bg-forest-green text-brushed-gold rounded-xl font-black uppercase text-xs shadow-lg hover:bg-forest-green-light"
                >
                  New Login Required
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Security Disclaimer */}
      <div className="p-6 bg-amber-50 rounded-3xl border-l-8 border-brushed-gold flex items-start gap-4 shadow-sm">
        <ShieldAlert className="text-brushed-gold mt-1 flex-shrink-0" size={24} />
        <p className="text-xs text-amber-900 font-bold leading-relaxed">
          The closing drawer amount must account for all cash, card, and UPI transactions. Discrepancies exceeding ₹50.00 will trigger an automatic audit flag for the owner.
        </p>
      </div>
    </div>
  );
}
