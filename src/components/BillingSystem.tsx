/**
 * Billing System Component
 * Professional checkout module for Rooms, Bar, and Restaurant.
 * Features: Search, Auto-Sum, GST Engine, and Specialized Printing.
 */

import { useState, useMemo, useRef } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Printer, 
  X, 
  Calculator,
  CreditCard,
  Banknote,
  Download,
  Receipt,
  MessageCircle,
  Mail
} from 'lucide-react';
import { usePDF } from 'react-to-pdf';
import { useBusinessStore } from '../store/useBusinessStore';
import { formatCurrency } from '../utils/formatCurrency';
import { calculateBillTax, type ItemCategory } from '../utils/gstCalculator';
import { printInvoice } from '../utils/printReceipt';
import ReceiptTemplate from './ReceiptTemplate';
import PrivateNumber from './PrivateNumber';

export default function BillingSystem() {
  const { rooms, inventory, dailySales } = useBusinessStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null); 
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [sendEmail, setSendEmail] = useState(false);

  // ... Integrated Search Logic ...

  // --- 2. Auto-Sum Logic ---
  const currentBill = useMemo(() => {
    if (!selectedEntity) return null;

    // Pulling pending charges
    const items = [
      { description: 'Room Stay (Daily Rate)', amount: 1500, category: 'room' as ItemCategory, qty: 1 },
      { description: 'Restaurant Order (KOT #442)', amount: 450, category: 'food' as ItemCategory, qty: 1 },
      { description: 'Bar - Pegs (60ml x 2)', amount: 300, category: 'liquor' as ItemCategory, qty: 2 },
    ];

    const guestData = selectedEntity.startsWith('Room') ? rooms[selectedEntity.replace('Room ', '')] : null;

    return {
      items,
      taxCalc: calculateBillTax(items.map(i => ({ amount: i.amount, category: i.category })), false),
      guestName: guestData?.currentGuest || 'Guest',
      guestPhone: '919876543210' // Mock phone for prototype
    };
  }, [selectedEntity, rooms]);

  // --- 3. Guest Communication Handlers ---
  const handleWhatsAppShare = () => {
    if (!currentBill) return;
    
    const message = encodeURIComponent(
      `*DEEPA RESTAURANT & TOURIST HOME*\n\n` +
      `Hello ${currentBill.guestName},\n` +
      `Thank you for staying with us! Your bill for Room ${selectedEntity} is ready.\n\n` +
      `*Total Amount:* ${formatCurrency(currentBill.taxCalc.total)}\n` +
      `*Receipt Link:* [PDF Attached]\n\n` +
      `Visit again soon! 🙏`
    );
    
    window.open(`whatsapp://send?phone=${currentBill.guestPhone}&text=${message}`, '_blank');
  };

  const handlePrintInvoice = () => {
    if (!selectedEntity || !currentBill) return;
    
    printInvoice({
      receiptNumber: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
      items: currentBill.items.map(i => ({
        description: i.description,
        qty: i.qty,
        amount: i.amount,
        category: i.category
      })),
      taxSummary: {
        foodGst: currentBill.taxCalc.cgst + currentBill.taxCalc.sgst,
        liquorTax: currentBill.taxCalc.excise || 0
      },
      total: currentBill.taxCalc.total,
      roomNumber: selectedEntity.startsWith('Room') ? selectedEntity.replace('Room ', '') : undefined,
      guestName: currentBill.guestName
    });
  };

  const { toPDF, targetRef } = usePDF({
    filename: `Invoice_${selectedEntity || 'Guest'}.pdf`,
  });

  const handleEntitySelect = (id: string) => {
    setSelectedEntity(id);
    setSearchQuery('');
  };

  const filteredEntities = useMemo(() => {
    const all = [
      ...Object.keys(rooms).map(id => ({ id: `Room ${id}`, type: 'room' })),
      { id: 'Table 1', type: 'restaurant' },
      { id: 'Table 2', type: 'restaurant' },
      { id: 'Bar Counter', type: 'bar' }
    ];
    return all.filter(e => e.id.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [rooms, searchQuery]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in" ref={targetRef}>
      {/* Header and Search */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-forest-green/10 rounded-2xl text-forest-green">
            <ShoppingCart size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-forest-green">Billing System</h2>
            <p className="text-gray-500 text-sm">Select a room or table to generate invoice</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search Rooms, Tables, or Guest Names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brushed-gold/50 text-lg font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Entity Selection */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredEntities.map(entity => (
            <button
              key={entity.id}
              onClick={() => handleEntitySelect(entity.id)}
              className={`p-6 rounded-2xl border-2 transition-all text-left ${
                selectedEntity === entity.id 
                  ? 'border-forest-green bg-forest-green/5 shadow-inner' 
                  : 'border-gray-100 bg-white hover:border-brushed-gold'
              }`}
            >
              <div className="text-[10px] font-black uppercase text-gray-400 mb-1">{entity.type}</div>
              <div className="font-bold text-forest-green">{entity.id}</div>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-brushed-gold/30 p-6">
            <h3 className="text-xs font-black text-forest-green/50 uppercase tracking-widest mb-4">Payment Summary</h3>
            {currentBill && (
              <div className="space-y-3">
                {/* Mock Totals for Preview */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">{formatCurrency(currentBill.taxCalc.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Tax (GST/Excise)</span>
                  <span className="font-bold text-orange-600">+{formatCurrency(currentBill.taxCalc.cgst + currentBill.taxCalc.sgst + (currentBill.taxCalc.excise || 0))}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-black text-forest-green uppercase text-[10px]">Total Payable</span>
                  <span className="text-2xl font-black text-forest-green">{formatCurrency(currentBill.taxCalc.total)}</span>
                </div>
                
                {/* Guest Communication Toggles */}
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                  <button 
                    onClick={() => setSendEmail(!sendEmail)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${sendEmail ? 'border-forest-green bg-forest-green/5' : 'border-gray-100'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Mail size={16} className={sendEmail ? 'text-forest-green' : 'text-gray-400'} />
                      <span className="text-[10px] font-black uppercase">Email Invoice</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-all ${sendEmail ? 'bg-forest-green' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${sendEmail ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Actions */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex gap-2">
              <button 
                disabled={!selectedEntity}
                onClick={handleWhatsAppShare}
                className="flex-1 py-4 bg-[#25D366] text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={18}/>
                WhatsApp
              </button>
              <button 
                disabled={!selectedEntity}
                onClick={() => toPDF()}
                className="flex-1 py-4 bg-gray-100 text-forest-green rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18}/>
                PDF
              </button>
            </div>
            
            <button 
              disabled={!selectedEntity}
              onClick={handlePrintInvoice}
              className="w-full py-4 bg-forest-green text-brushed-gold rounded-2xl font-bold text-lg shadow-lg hover:bg-forest-green-light active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Printer size={20}/>
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
