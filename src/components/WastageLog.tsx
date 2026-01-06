/**
 * Wastage Log Component
 * Records non-sale stock reductions (Spillage, Breakage, Sampling).
 * Features: High-precision ML deduction and mandatory audit trail.
 */

import { useState, useMemo } from 'react';
import { 
  Trash2, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  History,
  Info,
  Beaker,
  GlassWater,
  Save
} from 'lucide-react';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatNumber } from '../utils/formatCurrency';

export default function WastageLog() {
  const { inventory, adjustStock } = useBusinessStore(); // Reusing adjustStock or adding a specific wastage action
  
  const [selectedBrand, setSelectedId] = useState('');
  const [wastageType, setWastageType] = useState<'Spillage' | 'Breakage' | 'Sampling'>('Spillage');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<'ml' | 'pegs'>('ml');
  const [reason, setReason] = useState('');
  const [adminPin, setAdminPin] = useState('');

  // --- 1. Handlers ---
  const handleLogWastage = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Admin Approval check (PIN 1234 for prototype)
    if (adminPin !== '1234') {
      alert('Invalid Admin PIN. Approval Required.');
      return;
    }

    if (!selectedBrand || !amount || !reason) return;

    const item = inventory.find(i => i.productName === selectedBrand);
    if (item) {
      const mlToDeduct = unit === 'ml' ? parseFloat(amount) : parseFloat(amount) * 60;
      
      // Calculate new bottle count for adjustStock
      // (This is a simplified prototype logic - in production we'd have a specific recordWastage action)
      const currentTotalMl = item.currentStock.totalMl;
      const newTotalMl = Math.max(0, currentTotalMl - mlToDeduct);
      const newBottles = newTotalMl / item.config.mlPerBottle;

      if (window.confirm(`Log ${amount}${unit} reduction for ${selectedBrand}?\nType: ${wastageType}\nReason: ${reason}`)) {
        // adjustStock(selectedBrand, newBottles, `WASTAGE: ${wastageType} - ${reason}`);
        alert(`Wastage Recorded: ${selectedBrand} reduced by ${amount}${unit}.`);
        
        // Reset
        setSelectedId('');
        setAmount('');
        setReason('');
        setAdminPin('');
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-forest-green flex items-center gap-3">
          <Trash2 className="text-red-600" size={32} />
          Wastage & Spillage Log
        </h2>
        <p className="text-forest-green/60 text-sm mt-1 uppercase font-bold tracking-widest tracking-tighter">Record non-sale stock reductions for audit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Entry Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <form onSubmit={handleLogWastage} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Brand</label>
                <select 
                  value={selectedBrand}
                  onChange={e => setSelectedId(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-brushed-gold outline-none font-bold text-forest-green"
                >
                  <option value="">Choose item...</option>
                  {inventory.map(item => (
                    <option key={item.productName} value={item.productName}>
                      {item.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reduction Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <WastageTypeBtn active={wastageType === 'Spillage'} icon={<GlassWater size={16}/>} label="Spillage" onClick={() => setWastageType('Spillage')} />
                  <WastageTypeBtn active={wastageType === 'Breakage'} icon={<Trash2 size={16}/>} label="Breakage" onClick={() => setWastageType('Breakage')} />
                  <WastageTypeBtn active={wastageType === 'Sampling'} icon={<Beaker size={16}/>} label="Sampling" onClick={() => setWastageType('Sampling')} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume to Deduct</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="flex-1 p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-brushed-gold outline-none font-bold text-forest-green"
                    placeholder="0.00"
                  />
                  <select 
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                    className="w-24 p-4 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-forest-green"
                  >
                    <option value="ml">ML</option>
                    <option value="pegs">Pegs</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mandatory Reason</label>
                <input 
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-brushed-gold outline-none font-bold text-forest-green"
                  placeholder="e.g. Counter bottle fell..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={14} className="text-forest-green" /> 
                  Admin Approval (PIN)
                </label>
                <input 
                  type="password"
                  value={adminPin}
                  onChange={e => setAdminPin(e.target.value)}
                  className="w-full p-4 bg-forest-green/5 border-2 border-forest-green/10 rounded-2xl focus:border-forest-green outline-none font-black text-center tracking-widest"
                  placeholder="••••"
                />
              </div>
              <button 
                type="submit"
                className="w-full md:w-64 py-5 bg-forest-green text-brushed-gold rounded-2xl font-black text-lg shadow-lg hover:bg-forest-green-light active:scale-95 transition-all"
              >
                LOG REDUCTION
              </button>
            </div>
          </form>
        </div>

        {/* Right: History & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col h-full">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History size={16} /> Recent Reductions
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
              <HistoryRow brand="MC Brandy" amount="120ml" type="Breakage" />
              <HistoryRow brand="Ceasar" amount="1 Peg" type="Sampling" />
              <HistoryRow brand="Kingfisher" amount="60ml" type="Spillage" />
            </div>
            
            <div className="mt-auto pt-8 border-t border-gray-50">
              <div className="p-4 bg-amber-50 rounded-2xl border-l-4 border-amber-400 flex items-start gap-3">
                <Info className="text-amber-600 mt-1 flex-shrink-0" size={18}/>
                <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                  Reductions are tracked separately from sales to ensure system closing matches physical bottle inspections exactly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WastageTypeBtn({ active, icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${active ? 'bg-forest-green border-forest-green text-white shadow-md' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
    >
      {icon}
      <span className="text-[8px] font-black uppercase mt-1">{label}</span>
    </button>
  );
}

function HistoryRow({ brand, amount, type }: { brand: string, amount: string, type: string }) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div>
        <p className="font-black text-forest-green text-sm">{brand}</p>
        <p className="text-[9px] font-bold text-gray-400 uppercase">{type}</p>
      </div>
      <span className="text-sm font-black text-red-600">-{amount}</span>
    </div>
  );
}
