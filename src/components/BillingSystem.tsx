/**
 * Billing System Component
 * Professional checkout module for Rooms, Bar, and Restaurant.
 * Features: Search, Auto-Sum, GST Engine, and PDF Generation.
 */

import { useState, useMemo, useRef } from 'react';
import { 
  ShoppingCart, 
  Search, 
  FileText, 
  Printer, 
  User, 
  Download, 
  Calculator,
  X,
  CreditCard,
  Banknote
} from 'lucide-react';
import { usePDF } from 'react-to-pdf';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import { calculateBillTax, type ItemCategory } from '../utils/gstCalculator';
import ReceiptTemplate from './ReceiptTemplate';
import PrivateNumber from './PrivateNumber';

export default function BillingSystem() {
  const { rooms, inventory, dailySales } = useBusinessStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null); // Room or Table ID
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');

  // --- 1. Integrated Search Logic ---
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    
    // Search in Rooms
    const matchedRooms = Object.values(rooms).filter(r => 
      r.number.includes(q) || r.currentGuest?.toLowerCase().includes(q)
    ).map(r => ({ id: r.id, label: `Room ${r.number}`, sub: r.currentGuest, type: 'room' }));

    // Mock search in tables (could be expanded)
    const tables = [1, 2, 3, 4, 5].map(t => ({ id: `t${t}`, label: `Table ${t}`, sub: 'Restaurant', type: 'table' }));
    const matchedTables = tables.filter(t => t.label.toLowerCase().includes(q));

    return [...matchedRooms, ...matchedTables];
  }, [searchQuery, rooms]);

  // --- 2. Auto-Sum Logic ---
  const currentBill = useMemo(() => {
    if (!selectedEntity) return null;

    // In a real app, we'd fetch pending KOTs and Bar Pegs linked to this room/table
    // For prototype, we generate mock pending items for the selected entity
    const items = [
      { description: 'Room Stay (Daily Rate)', amount: 1500, category: 'room' as ItemCategory, qty: 1 },
      { description: 'Restaurant Order (KOT #442)', amount: 450, category: 'food' as ItemCategory, qty: 1 },
      { description: 'Bar - Pegs (60ml x 2)', amount: 300, category: 'liquor' as ItemCategory, qty: 2 },
    ];

    return {
      items,
      taxCalc: calculateBillTax(items.map(i => ({ amount: i.amount, category: i.category })), false)
    };
  }, [selectedEntity]);

  // --- 3. PDF Generation ---
  const { toPDF, targetRef } = usePDF({
    filename: `Deepa_Bill_${selectedEntity || 'General'}.pdf`,
    page: { margin: 10 }
  });

  const handleEntitySelect = (id: string) => {
    setSelectedEntity(id);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-forest-green flex items-center gap-3">
          <ShoppingCart className="text-brushed-gold" size={32} />
          Digital Billing System
        </h2>
      </div>

      {/* 1. Integrated Search Bar */}
      <div className="relative z-30">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-green/50" size={24} />
          <input
            type="text"
            placeholder="Search Room Number, Guest Name or Table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg font-medium border-2 border-forest-green/20 rounded-2xl focus:border-forest-green outline-none shadow-sm"
          />
        </div>
        
        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-forest-green/10 overflow-hidden">
            {searchResults.map(res => (
              <button
                key={res.id}
                onClick={() => handleEntitySelect(res.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-forest-green/5 border-b border-gray-50 last:border-0 transition-colors"
              >
                <div className="text-left">
                  <p className="font-bold text-forest-green">{res.label}</p>
                  <p className="text-xs text-forest-green/60 uppercase font-black">{res.sub || 'Available'}</p>
                </div>
                <div className="px-3 py-1 bg-brushed-gold/20 text-forest-green text-[10px] font-black rounded-full uppercase">
                  {res.type}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Billing Display (Optimized for MI Pad 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Bill Details */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedEntity ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-forest-green/20 p-20 text-center">
              <Calculator className="mx-auto text-forest-green/20 mb-4" size={64} />
              <p className="text-forest-green/50 font-bold">Select a Room or Table to generate bill</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-forest-green/10 overflow-hidden">
              <div className="bg-forest-green p-4 flex justify-between items-center">
                <span className="text-brushed-gold font-black uppercase tracking-widest">Active Bill: {selectedEntity}</span>
                <button onClick={() => setSelectedEntity(null)} className="text-white/50 hover:text-white"><X size={20}/></button>
              </div>
              
              <div className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-black text-forest-green/40 uppercase border-b border-gray-100">
                      <th className="text-left pb-4">Description</th>
                      <th className="text-center pb-4">Qty</th>
                      <th className="text-right pb-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentBill?.items.map((item, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                        <td className="py-4 font-bold text-forest-green">
                          {item.description}
                          <span className="block text-[10px] text-brushed-gold uppercase font-black">{item.category}</span>
                        </td>
                        <td className="py-4 text-center font-bold text-forest-green">{item.qty}</td>
                        <td className="py-4 text-right font-black text-forest-green">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary & Checkout */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-brushed-gold/30 p-6">
            <h3 className="text-xs font-black text-forest-green/50 uppercase tracking-widest mb-4">Bill Summary</h3>
            
            {currentBill?.taxCalc ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-forest-green/60">Subtotal</span>
                  <span className="font-bold text-forest-green">{formatCurrency(currentBill.taxCalc.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-forest-green/60">Food GST (5%)</span>
                  <span className="font-bold text-forest-green">{formatCurrency(currentBill.taxCalc.cgst + currentBill.taxCalc.sgst)}</span>
                </div>
                {currentBill.taxCalc.excise && (
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-green/60">Liquor Excise/Tax</span>
                    <span className="font-bold text-forest-green">{formatCurrency(currentBill.taxCalc.excise)}</span>
                  </div>
                )}
                <div className="pt-4 border-t-2 border-brushed-gold/20 flex justify-between items-center">
                  <span className="text-lg font-black text-forest-green uppercase">Total Pay</span>
                  <span className="text-2xl font-black text-forest-green">
                    <PrivateNumber value={currentBill.taxCalc.total} format={formatCurrency} />
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center text-forest-green/30 italic text-sm">Summary will appear here</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="flex gap-2">
            <PaymentBtn active={paymentMethod === 'cash'} icon={<Banknote size={18}/>} onClick={() => setPaymentMethod('cash')}/>
            <PaymentBtn active={paymentMethod === 'card'} icon={<CreditCard size={18}/>} onClick={() => setPaymentMethod('card')}/>
          </div>

          <button 
            disabled={!selectedEntity}
            onClick={() => toPDF()}
            className="w-full py-4 bg-forest-green text-brushed-gold rounded-2xl font-bold text-lg shadow-lg hover:bg-forest-green-light disabled:opacity-20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Printer size={20}/>
            Generate & Print Bill
          </button>
        </div>
      </div>

      {/* Hidden Receipt for PDF Generation */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={targetRef} className="w-[800px] p-10 bg-white">
          <ReceiptTemplate data={{
            receiptNumber: `INV-${Date.now()}`,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            items: currentBill?.items.map(i => ({...i, rate: i.amount})) || [],
            taxCalculation: currentBill?.taxCalc || {} as any,
            paymentMethod: paymentMethod
          }} />
          
          {/* Guest Signature Space for MI Pad 7 */}
          <div className="mt-20 border-t border-gray-300 pt-4 flex justify-between items-end">
            <div className="text-center">
              <div className="w-40 h-px bg-gray-400 mb-2"></div>
              <p className="text-xs font-bold text-gray-500 uppercase">Guest Signature</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-500 uppercase">Authorized Signatory</p>
              <p className="text-sm font-bold text-forest-green mt-1">Deepa Restaurant & Tourist Home</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentBtn({ active, icon, onClick }: { active: boolean, icon: any, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${
        active ? 'bg-brushed-gold border-brushed-gold text-forest-green' : 'bg-white border-gray-100 text-gray-400 hover:border-brushed-gold/30'
      }`}
    >
      {icon}
    </button>
  );
}